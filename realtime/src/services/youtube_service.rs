use std::sync::Arc;
use std::time::{Duration, Instant};
use anyhow::Error;
use serde::{Serialize, Deserialize};
use serde_json::Value;
use tokio::sync::RwLock;
use reqwest::Client;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct YouTubeVideo {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub publishedAt: String,
    pub embedUrl: String,
}

struct CacheData {
    videos: Vec<YouTubeVideo>,
    last_fetch: Option<Instant>,
    last_gp: String,
}

#[derive(Clone)]
pub struct YouTubeService {
    cache: Arc<RwLock<CacheData>>,
    client: Client,
}

impl YouTubeService {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(RwLock::new(CacheData {
                videos: Vec::new(),
                last_fetch: None,
                last_gp: String::new(),
            })),
            client: Client::new(),
        }
    }

    pub async fn get_videos(&self, gp_name: &str) -> Vec<YouTubeVideo> {
        let api_key = std::env::var("NEXT_PUBLIC_YOUTUBE_API_KEY").unwrap_or_default();
        if api_key.is_empty() || gp_name.is_empty() {
            return Vec::new();
        }

        // 🧠 Limpiamos el nombre del GP igual que hacíamos en el front
        let clean_gp = gp_name.to_lowercase().replace("grand prix", "").trim().to_string();

        // ⏱️ Candado de tiempo: 30 minutos
        let cache_duration = Duration::from_secs(30 * 60);
        
        {
            let cache = self.cache.read().await;
            if let Some(last_fetch) = cache.last_fetch {
                // Si es el mismo GP, no pasó el tiempo Y no está vacío, entregamos el caché al toque
                if cache.last_gp == clean_gp && last_fetch.elapsed() < cache_duration && !cache.videos.is_empty() {
                    return cache.videos.clone();
                }
            }
        }

        // 📡 Si falló el caché, cambió de GP o estaba vacío, vamos a boxes (YouTube)
        match self.fetch_from_youtube(&clean_gp, &api_key).await {
            Ok(fresh_videos) => {
                let mut cache = self.cache.write().await;
                cache.videos = fresh_videos.clone();
                cache.last_fetch = Some(Instant::now());
                cache.last_gp = clean_gp;
                fresh_videos
            }
            Err(e) => {
                eprintln!("Error buscando videos en YT: {}", e);
                // Si la API falla, devolvemos lo que tengamos en memoria para no romper nada
                let cache = self.cache.read().await;
                cache.videos.clone()
            }
        }
    }

    async fn fetch_from_youtube(&self, gp_name: &str, api_key: &str) -> Result<Vec<YouTubeVideo>, Error> {
        let current_year = 2026; // Mantenemos tu año dinámico de la temporada en curso
        let query = format!("F1 Highlights {} {}", gp_name, current_year);
        
        let url = format!(
            "https://www.googleapis.com/youtube/v3/search?part=snippet&q={}&maxResults=15&order=relevance&type=video&key={}",
            urlencoding::encode(&query),
            api_key
        );

        let response = self.client.get(&url).send().await?;
        
        // 🚨 Si Google nos tira un error, leemos el texto y lo mandamos al log de Render
        if !response.status().is_success() {
            let err_text = response.text().await.unwrap_or_default();
            return Err(anyhow::anyhow!("Google API Error: {}", err_text));
        }

        let res = response.json::<Value>().await?;
        let mut mapped_videos = Vec::new();

        if let Some(items) = res.get("items").and_then(|i| i.as_array()) {
            for item in items {
                // 🔓 SACAMOS LOS FILTROS PARA VER QUÉ LLEGA REALMENTE DE GOOGLE
                let video_id = item.pointer("/id/videoId").and_then(|id| id.as_str()).unwrap_or_default().to_string();
                let video_title = item.pointer("/snippet/title").and_then(|t| t.as_str()).unwrap_or_default().to_string();
                let thumbnail = item.pointer("/snippet/thumbnails/high/url")
                    .or_else(|| item.pointer("/snippet/thumbnails/default/url"))
                    .and_then(|u| u.as_str()).unwrap_or_default().to_string();
                let published_at = item.pointer("/snippet/publishedAt").and_then(|p| p.as_str()).unwrap_or_default().to_string();

                if !video_id.is_empty() {
                    mapped_videos.push(YouTubeVideo {
                        id: video_id.clone(),
                        title: video_title,
                        thumbnail,
                        publishedAt: published_at,
                        embedUrl: format!("https://www.youtube.com/embed/{}", video_id),
                    });
                }
            }
        }

        // Devolvemos los primeros 5 oficiales
        mapped_videos.truncate(5);
        Ok(mapped_videos)
    }
}