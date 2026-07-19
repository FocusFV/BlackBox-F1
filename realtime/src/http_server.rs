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
        .route("/api/videos", get(get_cached_videos)) 
        // 🎯 La ruta fantasma para probar a Render:
        .route("/api/test", get(prueba_render)) 
        .with_state(context)
        .layer(cors)
        .into_make_service();

    info!(addr, "starting norths http server");

    axum::serve(TcpListener::bind(addr).await?, app).await?;

    Ok(())
}

pub async fn get_cached_videos(State(ctx): State<Arc<Context>>) -> impl IntoResponse {
    let mut gp_name = match ctx.state_service.get_state().await {
        Ok(state) => state.pointer("/SessionInfo/Meeting/Name")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string(),
        Err(_) => String::new(),
    };

    // 🏎️ Si no hay una carrera activa en el estado, le clavamos una búsqueda fija para que devuelva videos sí o sí
    if gp_name.is_empty() {
        gp_name = "Formula 1".to_string();
    }

    let videos = ctx.youtube_service.get_videos(&gp_name).await;
    
    (StatusCode::OK, axum::Json(videos))
}

// Función temporal para romperle el hielo a Render
pub async fn prueba_render() -> &'static str {
    "RUST CACHE EN VIVO - SAPEEEE"
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