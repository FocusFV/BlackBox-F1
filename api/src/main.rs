use std::env;

use anyhow::Error;
use axum::{
    Router,
    http::{HeaderValue, Method},
    routing::get,
};

use tokio::net::TcpListener;
use tower_http::cors::CorsLayer;
use tracing::info;

use shared::tracing_subscriber;

mod endpoints {
    pub(crate) mod health;
    pub(crate) mod schedule;
    pub(crate) mod insights; 
}

#[tokio::main]
async fn main() -> Result<(), Error> {
    tracing_subscriber();

    // 🏎️ Adaptación para la nube: Buscamos PORT primero (estándar de hosting) u de lo contrario ADDRESS
    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    
    // Si la nube te da ADDRESS la usamos, si no, clavamos 0.0.0.0 para que escuche hacia el mundo exterior externa
    let addr = env::var("ADDRESS").unwrap_or_else(|_| format!("0.0.0.0:{}", port));

    let app = Router::new()
        .route("/api/schedule", get(endpoints::schedule::get))
        .route("/api/schedule/next", get(endpoints::schedule::get_next))
        .route("/api/health", get(endpoints::health::check))
        .route("/api/insights", get(endpoints::insights::get_live_insights))
        .layer(cors_layer()?); 

    info!(addr, "starting api http server");

    axum::serve(TcpListener::bind(&addr).await?, app).await?;

    Ok(())
}

pub fn cors_layer() -> Result<CorsLayer, anyhow::Error> {
    // 🛠️ Salvavidas de CORS: Si no hay ORIGIN configurada, permitimos localhost para no romper desarrollo local
    let origin = env::var("ORIGIN").unwrap_or_else(|_| "http://localhost:3000;https://f1-dash.com".to_string());

    let origins = origin
        .split(';')
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect::<Vec<HeaderValue>>();

    Ok(CorsLayer::new()
        .allow_origin(origins)
        .allow_methods([Method::GET, Method::CONNECT]))
}