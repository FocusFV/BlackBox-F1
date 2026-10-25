use anyhow::{anyhow, Error};
use futures_util::{SinkExt, StreamExt};
use reqwest::header::{HeaderValue, COOKIE, ORIGIN, REFERER, USER_AGENT};
use reqwest::Client;
use serde::Deserialize;
use serde_json::{json, Value};
use std::time::Duration;
use tokio::sync::broadcast::Sender;
use tokio_tungstenite::connect_async;
use tokio_tungstenite::tungstenite::client::IntoClientRequest;
use tracing::{error, info};

use crate::services::state_service::StateService;

#[derive(Deserialize)]
#[serde(rename_all = "camelCase")]
struct SignalRCoreNegotiateResponse {
    connection_token: Option<String>,
    connection_id: Option<String>,
}

fn read_env_var(var_name: &str) -> String {
    if let Ok(val) = std::env::var(var_name) {
        if !val.trim().is_empty() {
            return val.trim().trim_matches('"').trim_matches('\'').to_string();
        }
    }

    for path in &[".env", "realtime/.env", "../.env", "../realtime/.env"] {
        if let Ok(content) = std::fs::read_to_string(path) {
            for line in content.lines() {
                let trimmed = line.trim();
                let prefix = format!("{}=", var_name);
                if trimmed.starts_with(&prefix) {
                    let val = trimmed[prefix.len()..].trim();
                    return val.trim_matches('"').trim_matches('\'').replace('\r', "").replace('\n', "");
                }
            }
        }
    }

    String::new()
}

pub async fn ingest_f1(
    state_service: StateService,
    update_sender: Sender<String>,
) -> Result<(), Error> {
    let client = Client::builder()
        .timeout(Duration::from_secs(15))
        .build()?;

    let f1_token = read_env_var("F1_TOKEN");

    info!("Negociando conexión con F1 Live Timing (SignalR Core)...");

    let negotiate_url = "https://livetiming.formula1.com/signalrcore/negotiate?negotiateVersion=1";
    let mut req = client
        .post(negotiate_url)
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36")
        .header(ORIGIN, "https://www.formula1.com")
        .header(REFERER, "https://www.formula1.com/");

    if !f1_token.is_empty() {
        req = req.header("Authorization", format!("Bearer {}", f1_token));
    }

    let res = req.send().await?;
    if !res.status().is_success() {
        return Err(anyhow!("SignalR Core negotiate devolvió status: {}", res.status()));
    }

    // 🍪 Extraemos las cookies de balanceo de carga (AWSALB, AWSALBCORS)
    let mut session_cookies = Vec::new();
    for cookie_header in res.headers().get_all(reqwest::header::SET_COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            let key_val = cookie_str.split(';').next().unwrap_or(cookie_str).trim();
            if !key_val.is_empty() {
                session_cookies.push(key_val.to_string());
            }
        }
    }

    let negotiate: SignalRCoreNegotiateResponse = res.json().await?;
    let connection_token = negotiate
        .connection_token
        .or(negotiate.connection_id)
        .ok_or_else(|| anyhow!("No se recibió connectionToken ni connectionId en negotiate"))?;

    info!(token = %connection_token, "¡Negociación exitosa con SignalR Core!");

    let encoded_token = urlencoding::encode(&connection_token);
    let ws_url = format!(
        "wss://livetiming.formula1.com/signalrcore?id={}",
        encoded_token
    );

    let mut ws_req = ws_url.into_client_request()?;
    let headers = ws_req.headers_mut();
    headers.insert(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)".parse().unwrap());
    headers.insert(ORIGIN, "https://www.formula1.com".parse().unwrap());

    let final_cookie_header = session_cookies.join("; ");
    if !final_cookie_header.is_empty() {
        if let Ok(hval) = HeaderValue::from_str(&final_cookie_header) {
            headers.insert(COOKIE, hval);
        }
    }

    info!("Estableciendo conexión WebSocket con F1 SignalR Core...");
    let (ws_stream, _) = connect_async(ws_req).await?;
    info!("¡Conectado al WebSocket de F1 SignalR Core!");

    let (mut write, mut read) = ws_stream.split();

    // 1. Handshake inicial de SignalR Core: {"protocol":"json","version":1}\x1e
    let handshake_msg = "{\"protocol\":\"json\",\"version\":1}\x1e";
    write.send(tokio_tungstenite::tungstenite::Message::Text(handshake_msg.into())).await?;

    // 2. Suscripción a todos los canales de telemetría oficiales
    let subscribe_msg = json!({
        "type": 1,
        "invocationId": "0",
        "target": "Subscribe",
        "arguments": [[
            "Heartbeat", "CarData.z", "Position.z", "TimingAppData",
            "TimingData", "WeatherData", "TrackStatus", "DriverList",
            "RaceControlMessages", "SessionInfo", "SessionData", "LapCount",
            "TeamRadio", "TimingStats", "TopThree"
        ]]
    });
    let subscribe_payload = format!("{}\x1e", subscribe_msg);
    write.send(tokio_tungstenite::tungstenite::Message::Text(subscribe_payload.into())).await?;
    info!("Suscripción SignalR Core enviada exitosamente para todos los canales de F1");

    // 3. Procesar mensajes entrantes (separados por el terminador ASCII 0x1E)
    while let Some(msg) = read.next().await {
        match msg {
            Ok(tokio_tungstenite::tungstenite::Message::Text(text)) => {
                let text_str = text.as_str();
                for record in text_str.split('\x1e') {
                    let trimmed = record.trim();
                    if trimmed.is_empty() || trimmed == "{}" {
                        continue;
                    }

                    if let Ok(val) = serde_json::from_str::<Value>(trimmed) {
                        let msg_type = val.get("type").and_then(|t| t.as_i64()).unwrap_or(0);

                        // Tipo 3: Completion de Subscribe -> Contiene el estado inicial COMPLETO
                        if msg_type == 3 {
                            if let Some(result) = val.get("result").and_then(|r| r.as_object()) {
                                info!("¡Recibido estado inicial completo de F1 Live Timing! ({} temas recibidos)", result.len());
                                for (topic, payload) in result {
                                    let mut state_update = serde_json::Map::new();
                                    state_update.insert(topic.clone(), payload.clone());
                                    let update_obj = Value::Object(state_update);

                                    state_service.update_state(update_obj.clone()).await.ok();
                                    let _ = update_sender.send(update_obj.to_string());
                                }
                            }
                        }

                        // Tipo 1: Invocación en streaming -> Updates en vivo ("feed")
                        if msg_type == 1 {
                            if let Some(target) = val.get("target").and_then(|t| t.as_str()) {
                                if target == "feed" {
                                    if let Some(args) = val.get("arguments").and_then(|a| a.as_array()) {
                                        if let (Some(topic), Some(payload)) = (args.get(0).and_then(|t| t.as_str()), args.get(1)) {
                                            let mut state_update = serde_json::Map::new();
                                            state_update.insert(topic.to_string(), payload.clone());
                                            let update_obj = Value::Object(state_update);

                                            state_service.update_state(update_obj.clone()).await.ok();
                                            let _ = update_sender.send(update_obj.to_string());
                                        }
                                    }
                                }
                            }
                        }

                        // Tipo 6: Ping keep-alive del servidor
                        if msg_type == 6 {
                            write.send(tokio_tungstenite::tungstenite::Message::Text("{\"type\":6}\x1e".into())).await.ok();
                        }
                    }
                }
            }
            Ok(tokio_tungstenite::tungstenite::Message::Ping(ping)) => {
                write.send(tokio_tungstenite::tungstenite::Message::Pong(ping)).await.ok();
            }
            Err(e) => {
                error!("Error en la conexión WebSocket de F1 SignalR Core: {}", e);
                break;
            }
            _ => {}
        }
    }

    Ok(())
}
