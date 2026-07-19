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

// 🏎️ FUNCIÓN FINAL INTERCEPTADA: Devuelve el fin de semana ordenado de FP1 a Carrera del GP histórico
pub async fn get_cached_videos(State(_ctx): State<Arc<Context>>) -> impl IntoResponse {
    #[derive(serde::Serialize)]
    struct HardcodedVideo {
        id: String,
        title: String,
        thumbnail: String,
        publishedAt: String,
        embedUrl: String,
    }

    // 🏆 Simulamos la data del GP anterior (Barcelona) ordenada cronológicamente por sesión
    let videos = vec![
        HardcodedVideo {
            id: "7DEPkd9lBUg".to_string(),
            title: "FP1 Highlights | 2026 Barcelona Grand Prix".to_string(),
            thumbnail: "https://img.youtube.com/vi/7DEPkd9lBUg/maxresdefault.jpg".to_string(),
            publishedAt: "Hace unos días".to_string(),
            embedUrl: "https://www.youtube.com/embed/7DEPkd9lBUg".to_string(),
        },
        HardcodedVideo {
            id: "oh_VY40lO6w".to_string(),
            title: "FP2 Highlights | 2026 Barcelona Grand Prix".to_string(),
            thumbnail: "https://img.youtube.com/vi/oh_VY40lO6w/maxresdefault.jpg".to_string(),
            publishedAt: "Hace unos días".to_string(),
            embedUrl: "https://www.youtube.com/embed/oh_VY40lO6w".to_string(),
        },
        HardcodedVideo {
            id: "Q2fMM4H9bWY".to_string(),
            title: "Qualifying Highlights | 2026 Barcelona Grand Prix".to_string(),
            thumbnail: "https://img.youtube.com/vi/Q2fMM4H9bWY/maxresdefault.jpg".to_string(),
            publishedAt: "Hace unos días".to_string(),
            embedUrl: "https://www.youtube.com/embed/Q2fMM4H9bWY".to_string(),
        },
        HardcodedVideo {
            id: "3N1-v_V2A70".to_string(),
            title: "Race Highlights | 2026 Barcelona Grand Prix Official".to_string(),
            thumbnail: "https://img.youtube.com/vi/oh_VY40lO6w/maxresdefault.jpg".to_string(),
            publishedAt: "Hace unas horas".to_string(),
            embedUrl: "https://www.youtube.com/embed/3N1-v_V2A70".to_string(),
        }
    ];
    
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