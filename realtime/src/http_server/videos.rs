use std::sync::Arc;
use axum::{extract::State, http::StatusCode, response::IntoResponse};
use crate::http_server::Context;

pub async fn get_cached_videos(State(ctx): State<Arc<Context>>) -> impl IntoResponse {
    // Le pedimos al state_service el nombre del GP actual en el servidor
    let gp_name = match ctx.state_service.get_state().await {
        Ok(state) => state.pointer("/SessionInfo/Meeting/Name")
            .and_then(|v| v.as_str())
            .unwrap_or_default()
            .to_string(),
        Err(_) => String::new(),
    };

    // Buscamos los videos usando el caché inteligente de YouTube
    let videos = ctx.youtube_service.get_videos(&gp_name).await;
    
    (StatusCode::OK, axum::Json(videos))
}