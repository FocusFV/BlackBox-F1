use std::{env, str::FromStr};

use futures::{SinkExt, Stream};
use reqwest::{
    Url,
    header::{self, HeaderValue},
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use tokio_stream::StreamExt;
use tokio_tungstenite::tungstenite::{Message, client::IntoClientRequest, http::Request};
use tracing::{debug, error, info, trace};
use uuid::Uuid;

#[derive(Serialize)]
struct Connection {
    name: String,
}

#[derive(Serialize)]
struct ConnectionData([Connection; 1]);

#[derive(Deserialize, Debug)]
#[serde(rename_all = "PascalCase")]
pub struct NegotiationResponse {
    pub connection_token: String,
}

struct Negotiation {
    token: String,
    cookie: String,
}

async fn negotiate(url: &str, hub: &str) -> Result<Negotiation, anyhow::Error> {
    let hub = ConnectionData([Connection {
        name: hub.to_string(),
    }]);

    let hub_param = serde_json::to_string(&hub)?;

    let url = Url::parse_with_params(
        &format!("https://{}/negotiate", url),
        &[("clientProtocol", "1.5"), ("connectionData", &hub_param)],
    )?;

    let req = reqwest::get(url).await?;

    let headers = req.headers().clone();
    let res: NegotiationResponse = serde_json::from_str(&req.text().await?)?;

    let cookie = headers[header::SET_COOKIE].to_str()?.to_string();

    Ok(Negotiation {
        token: res.connection_token,
        cookie,
    })
}

type WsStream =
    tokio_tungstenite::WebSocketStream<tokio_tungstenite::MaybeTlsStream<tokio::net::TcpStream>>;

pub struct SignalrClient {
    pub hub: String,
    pub stream: WsStream,
}

pub async fn create_client(url: &str, hub: &str) -> Result<SignalrClient, anyhow::Error> {
    let negotiation = negotiate(url, hub).await?;

    let url = Url::parse_with_params(
        &format!("wss://{}/connect", url),
        &[
            ("clientProtocol", "1.5"),
            ("transport", "webSockets"),
            ("connectionToken", &negotiation.token),
        ],
    )?;

    let url = match env::var_os("F1_DEV_URL") {
        Some(env_url) => Url::from_str(&env_url.into_string().unwrap())?,
        None => url,
    };

    info!("connecting to {url}");

    let mut req: Request<()> = url.into_client_request()?;

    let headers = req.headers_mut();
    headers.insert(header::USER_AGENT, HeaderValue::from_static("BestHTTP"));
    headers.insert(
        header::ACCEPT_ENCODING,
        HeaderValue::from_static("gzip,identity"),
    );
    headers.insert(header::COOKIE, negotiation.cookie.parse()?);

    let (stream, res) = tokio_tungstenite::connect_async(req).await?;

    debug!(?res, "ws connected");

    let client = SignalrClient {
        hub: hub.to_string(),
        stream,
    };

    Ok(client)
}

#[derive(Serialize)]
#[serde(rename_all = "PascalCase")]
struct Invoke {
    h: String,
    m: String,
    a: Vec<Vec<String>>,
    i: String,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Response {
    i: String,
    r: Option<serde_json::Value>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Update {
    m: Vec<Args>,
}

#[derive(Deserialize)]
#[serde(rename_all = "PascalCase")]
struct Args {
    a: (String, serde_json::Value, String),
}

pub struct UpdateArgs {
    pub topic: String,
    pub data: serde_json::Value,
    pub timestamp: String,
}

pub async fn subscribe(
    client: &mut SignalrClient,
    topics: &[&str],
) -> Result<Value, anyhow::Error> {
    let id = Uuid::new_v4().to_string();

    let invoke_message = Invoke {
        h: client.hub.clone(),
        m: "Subscribe".to_string(),
        a: vec![topics.iter().map(|&s| s.to_string()).collect()],
        i: id.clone(),
    };

    let subscribe_message = serde_json::to_string(&invoke_message)?;

    client.stream.send(Message::text(subscribe_message)).await?;

    let response = receive_valid_response(&mut client.stream).await?;

    if response.i != id && env::var_os("F1_DEV_URL").is_none() {
        return Err(anyhow::anyhow!("Response ID does not match request ID"));
    }

    if let Some(result) = response.r {
        Ok(result)
    } else {
        Err(anyhow::anyhow!("No result in response"))
    }
}

async fn receive_valid_response(stream: &mut WsStream) -> Result<Response, anyhow::Error> {
    loop {
        let response_message = stream
            .next()
            .await
            .ok_or_else(|| anyhow::anyhow!("No response received"))??;

        if let Message::Text(txt) = response_message
            && let Ok(response) = serde_json::from_str::<Response>(&txt)
        {
            return Ok(response);
        }
    }
}

/// Listen to WebSocket messages and parse them into structured UpdateArgs.
/// This is useful when you need to process the data programmatically.
pub fn listen(client: SignalrClient) -> impl Stream<Item = Vec<UpdateArgs>> {
    client
        .stream
        .filter_map(|message| {
            trace!("message received");

            match message {
                Ok(message) => match message {
                    Message::Text(txt) => serde_json::from_str::<Update>(txt.as_str()).ok(),
                    _ => None,
                },
                Err(err) => {
                    error!(?err, "ws error");
                    None
                }
            }
        })
        .filter_map(|update| {
            let mut updates = Vec::new();

            for args in update.m {
                let (topic, data, timestamp) = args.a;
                updates.push(UpdateArgs {
                    topic,
                    data,
                    timestamp,
                });
            }

            Some(updates)
        })
}

/// Listen to raw WebSocket messages without parsing them.
/// Returns the raw text messages as-is, useful for saving to a file for replay.
pub fn listen_raw(client: SignalrClient) -> impl Stream<Item = String> {
    client.stream.filter_map(|message| {
        trace!("raw message received");

        match message {
            Ok(message) => match message {
                Message::Text(txt) => Some(txt.to_string()),
                _ => None,
            },
            Err(err) => {
                error!(?err, "ws error");
                None
            }
        }
    })
}
