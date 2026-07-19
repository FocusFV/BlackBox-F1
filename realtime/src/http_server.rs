use std::{env, sync::Arc};

use anyhow::Error;
use axum::{
    Router,
    extract::State,
    http::{HeaderValue, Method, StatusCode},
    response::IntoResponse,
    routing::get,
};
use tokio::{net::TcpListener, sync::broadcast::Sender};
use tower_http::cors::CorsLayer;
use tracing::{info, error};

use crate::services::state_service::StateService;
use crate::services::youtube_service::YouTubeService;

mod connections;
mod current;
mod drivers;
mod health;
mod realtime;
mod videos; // 👈 Módulo registrado formalmente como los demás

pub struct Context {
    pub state_service: StateService,
    pub youtube_service: YouTubeService,
    pub tx: Sender<String>,
}

pub async fn start(state_service: StateService, tx: Sender<String>) -> Result<(), Error> {
    let addr = env::var("ADDRESS").unwrap_or_else(|_| "0.0.0.0:80".to_string());

    let youtube_service = YouTubeService::new();

    let context = Arc::new(Context { 
        state_service, 
        youtube_service, 
        tx 
    });

    let cors = cors_layer()?;

    let app = Router::new()
        .route("/api/health", get(health::health_check))
        .route("/api/realtime", get(realtime::sse_stream))
        .route("/api/current", get(current::current_state))
        .route("/api/drivers", get(drivers::drivers))
        .route("/api/connections", get(connections::current_connections))
        .route("/api/videos", get(videos::get_cached_videos)) // 👈 Ruta modular
        .with_state(context)
        .layer(cors)
        .into_make_service();

    info!(addr, "starting norths http server");

    axum::serve(TcpListener::bind(addr).await?, app).await?;

    Ok(())
}

pub fn cors_layer() -> Result<CorsLayer, Error> {
    let origin_env = env::var("ORIGIN").unwrap_or_else(|_| "https://f1-dash.com".to_string());

    let mut origins = origin_env
        .split(';')
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect::<Vec<HeaderValue>>();

    if let Ok(local_origin) = HeaderValue::from_str("http://localhost:3000") {
        if !origins.contains(&local_origin) {
            origins.push(local_origin);
        }
    }

    Ok(CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([
            Method::GET, 
            Method::POST, 
            Method::OPTIONS, 
            Method::CONNECT
        ])
        .allow_headers(tower_http::cors::Any))
}