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
        if gp_name.is_empty() {
            return Vec::new();
        }

        let clean_gp = gp_name.to_lowercase().replace("grand prix", "").trim().to_string();
        let cache_duration = Duration::from_secs(30 * 60);
        
        // 1. Verificar caché en memoria primero
        {
            let cache = self.cache.read().await;
            if let Some(last_fetch) = cache.last_fetch {
                if cache.last_gp == clean_gp && last_fetch.elapsed() < cache_duration && !cache.videos.is_empty() {
                    return cache.videos.clone();
                }
            }
        }

        // 2. Si no hay caché, intentamos obtener con rotación de llaves
        match self.fetch_from_youtube(&clean_gp).await {
            Ok(fresh_videos) => {
                let mut cache = self.cache.write().await;
                cache.videos = fresh_videos.clone();
                cache.last_fetch = Some(Instant::now());
                cache.last_gp = clean_gp;
                fresh_videos
            }
            Err(e) => {
                eprintln!("❌ [YouTube Service] Todas las API Keys fallaron: {}", e);
                let cache = self.cache.read().await;
                cache.videos.clone()
            }
        }
    }

    async fn fetch_from_youtube(&self, gp_name: &str) -> Result<Vec<YouTubeVideo>, Error> {
        // 🎯 TUS 10 API KEYS CARGADAS EN EL TANQUE DE COMBUSTIBLE
        let mut api_keys: Vec<String> = vec![
            "AIzaSyBjmb3wEf7k0PnykEsb8SrLk2Zdpxm9U8s".to_string(),
            "AIzaSyAX1l9eXjD1qXd5lygV40ksk44AlIEgh1Y".to_string(),
            "AIzaSyCHLOwVQFffgdEMsz1aRk4sYZOPnEWOX-M".to_string(),
            "AIzaSyBhEGfXKhY8zeTwFlgMUnfj2ij1ceomah4".to_string(),
            "AIzaSyDm2zwHReeyuJv0pErxnENr2Tx-5-0p2F4".to_string(),
            "AIzaSyBMXWBrnFPIPQQe7XdpSPCqNuu2ZMwi9OQ".to_string(),
            "AIzaSyAiNqzUVadM-4Kdw5x3HIWdts9UcRexAmY".to_string(),
            "AIzaSyCi-bvDfyjrS_YHVFlRN-V49t0sXf0Zs3c".to_string(),
            "AIzaSyC0Iq2n8BHQo0mNDE7KifO5IdSPVLvvGSM".to_string(),
            "AIzaSyDyIVTPorwfgUBehHfBVELW3uQ_kwJNh3s".to_string(),
        ];

        // También intenta leer si tenés variables de entorno configuradas
        if let Ok(keys_env) = std::env::var("YOUTUBE_API_KEYS") {
            let env_list: Vec<String> = keys_env
                .split(',')
                .map(|s| s.trim().to_string())
                .filter(|s| !s.is_empty())
                .collect();
            if !env_list.is_empty() {
                api_keys = env_list;
            }
        }

        let current_year = 2026; 
        let query = if gp_name.contains("formula") || gp_name.contains("f1") {
            format!("{} Highlights {}", gp_name, current_year)
        } else {
            format!("F1 Highlights {} {}", gp_name, current_year)
        };

        // 🔄 ROTACIÓN DE LLAVES: Probará una a una
        for (index, api_key) in api_keys.iter().enumerate() {
            let url = format!(
                "https://www.googleapis.com/youtube/v3/search?part=snippet&q={}&maxResults=15&order=relevance&type=video&key={}",
                urlencoding::encode(&query),
                api_key
            );

            match self.client.get(&url).send().await {
                Ok(response) => {
                    if response.status().is_success() {
                        let res = response.json::<Value>().await?;
                        let mut mapped_videos = Vec::new();

                        if let Some(items) = res.get("items").and_then(|i| i.as_array()) {
                            for item in items {
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

                        if !mapped_videos.is_empty() {
                            mapped_videos.truncate(5);
                            println!("✅ [YouTube Service] Éxito trayendo videos usando Key #{}", index + 1);
                            return Ok(mapped_videos);
                        }
                    } else {
                        let err_text = response.text().await.unwrap_or_default();
                        eprintln!("⚠️ [YouTube Service] Key #{} rechazada o agotada: {}. Probando siguiente...", index + 1, err_text);
                    }
                }
                Err(err) => {
                    eprintln!("❌ [YouTube Service] Error de red con Key #{}: {}", index + 1, err);
                }
            }
        }

        Err(anyhow::anyhow!("Todas las 10 API Keys de YouTube fallaron o no trajeron resultados."))
    }
}