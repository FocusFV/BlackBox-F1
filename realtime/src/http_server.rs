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
        .route("/api/test", get(prueba_render)) 
        .with_state(context)
        .layer(cors)
        .into_make_service();

    info!(addr, "starting norths http server");

    axum::serve(TcpListener::bind(addr).await?, app).await?;

    Ok(())
}

// 🧠 HELPER INTELIGENTE: Devuelve automáticamente el GP anterior al actual en el calendario
fn get_previous_gp_name(current_gp: &str) -> String {
    let calendar = vec![
        "Bahrain", "Saudi Arabia", "Australia", "Japan", "China", 
        "Miami", "Emilia Romagna", "Monaco", "Canada", "Spain", 
        "Austria", "Great Britain", "Hungary", "Belgium", "Netherlands", 
        "Italy", "Azerbaijan", "Singapore", "United States", "Mexico", 
        "Brazil", "Las Vegas", "Qatar", "Abu Dhabi"
    ];

    let clean_current = current_gp.to_lowercase();

    if let Some(index) = calendar.iter().position(|&gp| clean_current.contains(&gp.to_lowercase())) {
        if index > 0 {
            return calendar[index - 1].to_string();
        }
    }

    // Fallback inteligente si el simulador está apagado: asumimos Bélgica (Belgium)
    "Belgium".to_string()
}

pub async fn get_cached_videos(State(ctx): State<Arc<Context>>) -> impl IntoResponse {
    let current_gp = match ctx.state_service.get_state().await {
        Ok(state) => state.pointer("/SessionInfo/Meeting/Name")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string(),
        Err(_) => String::new(),
    };

    // Obtenemos el GP anterior real
    let target_gp = get_previous_gp_name(&current_gp);

    let videos = ctx.youtube_service.get_videos(&target_gp).await;
    
    // Devolvemos el nombre dinámico junto a los videos para sincronizar la interfaz
    #[derive(serde::Serialize)]
    struct VideoResponse {
        target_gp: String,
        videos: Vec<crate::services::youtube_service::YouTubeVideo>,
    }

    let response = VideoResponse {
        target_gp,
        videos,
    };

    (StatusCode::OK, axum::Json(response))
}

pub async fn prueba_render() -> &'static str {
    "RUST CACHE EN VIVO - SAPEEEE"
}

pub fn cors_layer() -> Result<CorsLayer, Error> {
    let origin_env = env::var("ORIGIN").unwrap_or_else(|_| "https://Blackboxf1.vercel.app".to_string());

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
        .allow_methods([Method::GET, Method::POST, Method::OPTIONS, Method::CONNECT])
        .allow_headers(tower_http::cors::Any))
}