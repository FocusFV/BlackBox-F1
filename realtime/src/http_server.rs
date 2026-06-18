use std::{env, sync::Arc};

use anyhow::Error;
use axum::{
    Router,
    http::{HeaderValue, Method},
    routing::get,
};
use tokio::{net::TcpListener, sync::broadcast::Sender};
use tower_http::cors::CorsLayer;
use tracing::info;

use crate::services::state_service::StateService;

mod connections;
mod current;
mod drivers;
mod health;
mod realtime;

pub struct Context {
    pub state_service: StateService,
    pub tx: Sender<String>,
}

pub async fn start(state_service: StateService, tx: Sender<String>) -> Result<(), Error> {
    let addr = env::var("ADDRESS").unwrap_or_else(|_| "0.0.0.0:80".to_string());

    let context = Arc::new(Context { state_service, tx });

    let cors = cors_layer()?;

    let app = Router::new()
        .route("/api/health", get(health::health_check))
        .route("/api/realtime", get(realtime::sse_stream))
        .route("/api/current", get(current::current_state))
        .route("/api/drivers", get(drivers::drivers))
        .route("/api/connections", get(connections::current_connections))
        .with_state(context)
        .layer(cors)
        .into_make_service();

    info!(addr, "starting norths http server");

    axum::serve(TcpListener::bind(addr).await?, app).await?;

    Ok(())
}

pub fn cors_layer() -> Result<CorsLayer, Error> {
    // 1. Levantamos los orígenes configurados en producción (o el fallback original)
    let origin_env = env::var("ORIGIN").unwrap_or_else(|_| "https://f1-dash.com".to_string());

    // 2. Parseamos los orígenes de producción
    let mut origins = origin_env
        .split(';')
        .filter_map(|o| HeaderValue::from_str(o).ok())
        .collect::<Vec<HeaderValue>>();

    // 3. 🌟 PASAPORTE VIP LOCAL: Le metemos el localhost predeterminado de Next.js
    if let Ok(local_origin) = HeaderValue::from_str("http://localhost:3000") {
        if !origins.contains(&local_origin) {
            origins.push(local_origin);
        }
    }

    // Nota: Agregamos Method::POST y Method::OPTIONS por si las moscas para evitar preflights molestos
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