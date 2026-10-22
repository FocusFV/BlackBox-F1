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
use tracing::{error, info, warn};

use crate::services::state_service::StateService;

#[derive(Deserialize)]
struct AuthResponse {
    #[serde(rename = "data")]
    data: AuthData,
}

#[derive(Deserialize)]
struct AuthData {
    #[serde(rename = "subscriptionToken")]
    subscription_token: String,
}

#[derive(Deserialize)]
struct NegotiateResponse {
    #[serde(rename = "ConnectionToken")]
    connection_token: String,
}

async fn get_f1_token(client: &Client, user: &str, pass: &str) -> Result<String, Error> {
    info!("Intentando autenticación automática en F1 con usuario y contraseña...");
    let payload = json!({
        "Login": user,
        "Password": pass
    });

    let res = client
        .post("https://api.formula1.com/v2/account/subscriber/customers/authenticate")
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36")
        .header("apiKey", "fCUCjWrKPu9ylJwRAv8BpGLEgiAuQIx7")
        .json(&payload)
        .send()
        .await?;

    if !res.status().is_success() {
        return Err(anyhow!("Fallo autenticación automática F1 (Status: {})", res.status()));
    }

    let auth: AuthResponse = res.json().await?;
    info!("¡Autenticación exitosa! Token de sesión obtenido automáticamente");
    Ok(auth.data.subscription_token)
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
    "".to_string()
}

pub async fn ingest_f1(
    state_service: StateService,
    update_sender: Sender<String>,
) -> Result<(), Error> {
    let client = Client::builder()
        .timeout(Duration::from_secs(15))
        .build()?;

    let mut user = read_env_var("F1_USERNAME");
    if user.is_empty() {
        user = read_env_var("F1_EMAIL");
    }
    let pass = read_env_var("F1_PASSWORD");
    let full_cookie = read_env_var("F1_FULL_COOKIE");

    let mut auth_token = String::new();

    // 1. Intentar auto-login si hay credenciales de usuario/email
    if !user.is_empty() && !pass.is_empty() {
        match get_f1_token(&client, &user, &pass).await {
            Ok(token) => {
                auth_token = format!("ascendSubscriptionToken={}", token);
            }
            Err(e) => {
                warn!("No se pudo hacer auto-login en F1: {}. Intentando con cookie de respaldo...", e);
            }
        }
    }

    // 2. Si no hay token de auto-login, usar F1_FULL_COOKIE
    if auth_token.is_empty() && !full_cookie.is_empty() {
        info!("Usando F1_FULL_COOKIE como método de autenticación");
        auth_token = full_cookie;
    }

    if auth_token.is_empty() {
        warn!("ATENCIÓN: No hay credenciales ni cookie configuradas para F1");
    }

    info!("Negociando conexión con SignalR de F1...");

    let negotiate_url = "https://livetiming.formula1.com/signalr/negotiate?connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D&clientProtocol=1.5";
    let mut req = client
        .get(negotiate_url)
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .header(ORIGIN, "https://www.formula1.com")
        .header(REFERER, "https://www.formula1.com/");

    if !auth_token.is_empty() {
        req = req.header(COOKIE, HeaderValue::from_str(&auth_token)?);
    }

    let res = req.send().await?;
    if !res.status().is_success() {
        return Err(anyhow!("SignalR negotiate devolvió status: {}", res.status()));
    }

    // 🍪 Extraemos las cookies de sesión (AWSALB, AWSALBCORS) devueltas por el servidor en negotiate
    let mut session_cookies = Vec::new();
    for cookie_header in res.headers().get_all(reqwest::header::SET_COOKIE) {
        if let Ok(cookie_str) = cookie_header.to_str() {
            let key_val = cookie_str.split(';').next().unwrap_or(cookie_str).trim();
            if !key_val.is_empty() {
                session_cookies.push(key_val.to_string());
            }
        }
    }

    let negotiate: NegotiateResponse = res.json().await?;
    info!(connection_token = %negotiate.connection_token, "¡Negociación exitosa con F1 Live Timing!");

    let encoded_token = urlencoding::encode(&negotiate.connection_token);
    let ws_url = format!(
        "wss://livetiming.formula1.com/signalr/connect?clientProtocol=1.5&transport=webSockets&connectionData=%5B%7B%22name%22%3A%22Streaming%22%7D%5D&connectionToken={}",
        encoded_token
    );

    let mut ws_req = ws_url.into_client_request()?;
    let headers = ws_req.headers_mut();
    headers.insert(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64)".parse().unwrap());
    headers.insert(ORIGIN, "https://www.formula1.com".parse().unwrap());

    // Adjuntamos tanto las cookies de balanceador de carga (AWSALB) como el token de suscripción
    if !auth_token.is_empty() {
        session_cookies.push(auth_token);
    }

    let final_cookie_header = session_cookies.join("; ");
    if !final_cookie_header.is_empty() {
        if let Ok(hval) = HeaderValue::from_str(&final_cookie_header) {
            headers.insert(COOKIE, hval);
        }
    }

    let (ws_stream, _) = connect_async(ws_req).await?;
    info!("Conectado al WebSocket de F1 SignalR");

    let (mut write, mut read) = ws_stream.split();

    let subscribe_msg = json!({
        "H": "Streaming",
        "M": "Subscribe",
        "A": [[
            "Heartbeat", "CarData.z", "Position.z", "TimingAppData",
            "TimingData", "WeatherData", "TrackStatus", "DriverList",
            "RaceControlMessages", "SessionInfo", "SessionData", "LapCount"
        ]],
        "I": 1
    });

    write.send(tokio_tungstenite::tungstenite::Message::Text(subscribe_msg.to_string().into())).await?;
    info!("Suscripción enviada a los canales de telemetría de F1");

    while let Some(msg) = read.next().await {
        match msg {
            Ok(tokio_tungstenite::tungstenite::Message::Text(text)) => {
                let text_str = text.as_str();
                if let Ok(val) = serde_json::from_str::<Value>(text_str) {
                    if let Some(hub_messages) = val.get("M").and_then(|m| m.as_array()) {
                        for message in hub_messages {
                            if let Some(args) = message.get("A").and_then(|a| a.as_array()) {
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
            }
            Ok(tokio_tungstenite::tungstenite::Message::Ping(ping)) => {
                write.send(tokio_tungstenite::tungstenite::Message::Pong(ping)).await.ok();
            }
            Err(e) => {
                error!("Error en la conexión WebSocket de F1: {}", e);
                break;
            }
            _ => {}
        }
    }

    Ok(())
}