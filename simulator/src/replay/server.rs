use std::{env, sync::Arc};

use anyhow::Error;
use axum::{
    Router,
    extract::{
        State, WebSocketUpgrade,
        ws::{Message, WebSocket},
    },
    response::Response,
    routing::get,
};
use futures::{SinkExt, StreamExt};
use serde_json::json;
use tokio::net::TcpListener;
use tower_http::cors::{Any, CorsLayer};
use tracing::info;

pub struct AppState {
    pub lines: Vec<String>,
}

pub async fn run(lines: Vec<String>) -> Result<(), Error> {
    let addr = env::var("ADDRESS").unwrap_or_else(|_| "127.0.0.1:8080".to_string());

    let app_state = Arc::new(AppState { lines });

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/ws", get(handle_http))
        .route("/api/realtime", get(handle_http))
        .layer(cors)
        .with_state(app_state);

    info!(addr, "starting simulator replay server");

    axum::serve(TcpListener::bind(addr).await?, app).await?;

    Ok(())
}

async fn handle_http(ws: WebSocketUpgrade, State(state): State<Arc<AppState>>) -> Response {
    info!("received connection");
    ws.on_upgrade(|socket| handle_ws(socket, state))
}

async fn handle_ws(socket: WebSocket, _state: Arc<AppState>) {
    let (mut tx, mut rx) = socket.split();

    // 🏎️ GRILLA COMPLETA FOCUSFV 2026 (22 Pilotos)
    let drivers = vec![
        ("43", "COLAPINTO", "Franco", "COL", "Alpine", "FF00FF", 1, "SOFT"),
        ("10", "GASLY", "Pierre", "GAS", "Alpine", "FF00FF", 2, "MEDIUM"),
        ("1", "VERSTAPPEN", "Max", "VER", "Red Bull Racing", "00B3FF", 3, "MEDIUM"),
        ("6", "HADJAR", "Isack", "HAD", "Red Bull Racing", "00B3FF", 4, "HARD"),
        ("63", "RUSSELL", "George", "RUS", "Mercedes", "00FFDF", 5, "SOFT"),
        ("12", "ANTONELLI", "Kimi", "ANT", "Mercedes", "00FFDF", 6, "MEDIUM"),
        ("16", "LECLERC", "Charles", "LEC", "Ferrari", "E10600", 7, "HARD"),
        ("44", "HAMILTON", "Lewis", "HAM", "Ferrari", "E10600", 8, "SOFT"),
        ("4", "NORRIS", "Lando", "NOR", "McLaren", "FF8700", 9, "MEDIUM"),
        ("81", "PIASTRI", "Oscar", "PIA", "McLaren", "FF8700", 10, "HARD"),
        ("14", "ALONSO", "Fernando", "ALO", "Aston Martin", "00FFB7", 11, "SOFT"),
        ("18", "STROLL", "Lance", "STR", "Aston Martin", "00FFB7", 12, "MEDIUM"),
        ("23", "ALBON", "Alex", "ALB", "Williams", "0040FF", 13, "HARD"),
        ("55", "SAINZ", "Carlos", "SAI", "Williams", "0040FF", 14, "SOFT"),
        ("27", "HULKENBERG", "Nico", "HUL", "Kick Sauber", "BDFF00", 15, "MEDIUM"),
        ("5", "BORTOLETO", "Gabriel", "BOR", "Kick Sauber", "BDFF00", 16, "HARD"),
        ("11", "PEREZ", "Sergio", "PER", "Cadillac", "FFCC00", 17, "SOFT"),
        ("77", "BOTTAS", "Valtteri", "BOT", "Cadillac", "FFCC00", 18, "MEDIUM"),
        ("31", "OCON", "Esteban", "OCO", "Haas F1 Team", "F3F4F6", 19, "HARD"),
        ("87", "BEARMAN", "Oliver", "BEA", "Haas F1 Team", "F3F4F6", 20, "SOFT"),
        ("30", "LAWSON", "Liam", "LAW", "Racing Bulls", "6692FF", 21, "MEDIUM"),
        ("41", "LINDBLAD", "Arvid", "LIN", "Racing Bulls", "6692FF", 22, "HARD"),
    ];

    let mut driver_list = serde_json::Map::new();
    let mut timing_lines = serde_json::Map::new();
    let mut timing_app_data = serde_json::Map::new();

    for (i, (num, last, first, tla, team, color, pos, tyre)) in drivers.iter().enumerate() {
        driver_list.insert(
            num.to_string(),
            json!({
                "RacingNumber": num,
                "BroadcastName": format!("{} {}", tla, last),
                "FullName": format!("{} {}", first, last),
                "Tla": tla,
                "TLA": tla,
                "Abbreviation": tla,
                "Line": pos,
                "TeamName": team,
                "TeamColour": color,
                "FirstName": first,
                "LastName": last,
                "Reference": tla,
                "HeadshotUrl": "",
                "CountryCode": "ARG"
            }),
        );

        let gap_sec = (i as f64) * 1.6;
        let lap_ms = 78420 + (i * 310);
        let lap_str = format!("1:{:02}.{:03}", lap_ms / 1000 % 60, lap_ms % 1000);
        let s1_ms = 28120 + (i * 110);

        timing_lines.insert(
            num.to_string(),
            json!({
                "RacingNumber": num,
                "Position": pos.to_string(),
                "ShowPosition": true,
                "Retired": false,
                "InPit": false,
                "PitOut": false,
                "Stopped": false,
                "Status": 0,
                "GapToLeader": if *pos == 1 { "LEADER".to_string() } else { format!("+{:.1}", gap_sec) },
                "IntervalToPositionAhead": { "Value": if *pos == 1 { "".to_string() } else { "+1.6".to_string() }, "Catching": false },
                "Sectors": [
                    { 
                        "Stopped": false, 
                        "Value": format!("28.{:03}", s1_ms % 1000), 
                        "Status": if i == 0 { 2051 } else { 2049 }, 
                        "OverallFastest": i == 0, 
                        "PersonalFastest": true,
                        "Segments": [{ "Status": 2049 }, { "Status": 2049 }, { "Status": 2049 }]
                    },
                    { 
                        "Stopped": false, 
                        "Value": "35.110", 
                        "Status": 2049, 
                        "Segments": [{ "Status": 2049 }, { "Status": 2049 }]
                    },
                    { 
                        "Stopped": false, 
                        "Value": "15.190", 
                        "Status": 2049, 
                        "Segments": [{ "Status": 2049 }, { "Status": 2049 }]
                    }
                ],
                "Speeds": {
                    "ST": { "Value": (338 - i * 2).to_string(), "Status": 2049, "OverallFastest": i == 0, "PersonalFastest": true }
                },
                "BestLapTime": { "Value": lap_str.clone(), "Position": pos },
                "LastLapTime": { "Value": lap_str, "Status": 2049, "PersonalFastest": true },
                "NumberOfLaps": 14
            }),
        );

        timing_app_data.insert(
            num.to_string(),
            json!({
                "RacingNumber": num,
                "Stints": [
                    {
                        "Compound": tyre,
                        "New": "true",
                        "TyresNotAged": "true",
                        "StartLaps": 0,
                        "TotalLaps": 14
                    }
                ]
            }),
        );
    }

    let initial_payload = json!({
        "R": {
            "Heartbeat": { "Utc": "2026-07-23T12:00:00.000Z" },
            "SessionInfo": {
                "Meeting": { "Key": 1234, "Name": "Gran Premio de Silverstone", "Circuit": { "Key": 7, "ShortName": "Silverstone" } },
                "OfficialName": "FORMULA 1 BRITISH GRAND PRIX 2026",
                "Location": "Silverstone",
                "Country": { "Key": 1, "Code": "GBR", "Name": "Great Britain" },
                "Circuit": { "Key": 7, "ShortName": "Silverstone" },
                "ArchiveStatus": { "Status": "Generated" },
                "Key": 9999,
                "Type": "Race",
                "Name": "Carrera En Vivo",
                "StartDate": "2026-07-23T12:00:00Z",
                "EndDate": "2026-07-23T14:00:00Z",
                "GmtOffset": "00:00:00",
                "Path": "2026silverstone"
            },
            "SessionStatus": { "Status": "Started" },
            "TrackStatus": { "Status": "1", "Message": "AllClear" },
            "LapCount": { "CurrentLap": 14, "TotalLaps": 52 },
            "DriverList": driver_list,
            "TimingData": { "Lines": timing_lines },
            "TimingAppData": { "Lines": timing_app_data },
            "Withheld": false
        }
    });

    if tx.send(Message::Text(initial_payload.to_string().into())).await.is_err() {
        return;
    }

    tokio::select! {
        _ = async {
            let mut lap = 14;
            let mut tick = 0;

            loop {
                tokio::time::sleep(tokio::time::Duration::from_millis(1000)).await;
                tick += 1;

                if tick % 15 == 0 {
                    lap += 1;
                }

                let speed_st = 320 + (tick % 15);

                let update_payload = json!({
                    "M": [{
                        "H": "Streaming",
                        "M": "feed",
                        "A": [
                            "TimingData",
                            {
                                "Lines": {
                                    "43": {
                                        "Speeds": { "ST": { "Value": speed_st.to_string(), "Status": 2051, "OverallFastest": true } }
                                    },
                                    "1": {
                                        "Speeds": { "ST": { "Value": (speed_st - 3).to_string(), "Status": 2049 } }
                                    }
                                }
                            }
                        ]
                    }],
                    "LapCount": { "CurrentLap": lap, "TotalLaps": 52 }
                });

                if tx.send(Message::Text(update_payload.to_string().into())).await.is_err() {
                    break;
                }
            }
        } => {}
        _ = async {
            while let Some(Ok(msg)) = rx.next().await {
                if let Message::Close(_) = msg {
                    break;
                }
            }
        } => {}
    }

    info!("connection closed");
}