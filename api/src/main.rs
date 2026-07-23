use std::env;

use anyhow::Error;
use axum::{
    Json,
    Router,
    http::{HeaderValue, Method},
    routing::get,
};
use serde::Serialize; // 🏎️ Usamos serde para escupir el JSON al frontend,,

use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing::info;

use shared::tracing_subscriber;

mod endpoints {
    pub(crate) mod health;
    pub(crate) mod schedule;
    pub(crate) mod insights; 
}

// Estructura de datos para los slots dinámicos
#[derive(Serialize)]
struct StreamsConfig {
    disney7: String,
    disney8: String,
}

// 🏎️ FUNCIÓN SEPARADA: Para que Axum la reconozca perfecto
async fn get_streams_config() -> Json<StreamsConfig> {
    let disney7 = env::var("DISNEY7_DRIVER").unwrap_or_else(|_| "RUS".to_string());
    let disney8 = env::var("DISNEY8_DRIVER").unwrap_or_else(|_| "HAM".to_string());
    Json(StreamsConfig { disney7, disney8 })
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber();

    // 🏎️ Adaptación para la nube
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let addr = env::var("ADDRESS").unwrap_or_else(|_| format!("0.0.0.0:{}", port));

    let app = Router::new()
        .route("/api/schedule", get(endpoints::schedule::get))
        .route("/api/schedule/next", get(endpoints::schedule::get_next))
        .route("/api/health", get(endpoints::health::check))
        .route("/api/insights", get(endpoints::insights::get_live_insights))
        
        // 🛠️ SLOT TELEMETRÍA DINÁMICA: Llamamos a la función limpia para evitar errores
        .route("/api/streams-config", get(get_streams_config))
        
        .layer(cors_layer()?); 

    info!(addr, "starting api http server");

    axum::serve(TcpListener::bind(&addr).await?, app).await?;

    Ok(())
}

pub fn cors_layer() -> Result<CorsLayer, anyhow::Error> {
    // 🛠️ Actualizado con el https:// que faltaba
    let origin = env::var("ORIGIN").unwrap_or_else(|_| "http://localhost:3000;https://Blackboxf1.vercel.app".to_string());

    let origins = origin
        .split(';')
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect::<Vec<HeaderValue>>();

    Ok(CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::CONNECT]))
}