use std::time::Duration;
use axum::{extract::Query, response::IntoResponse, Json};
use cached::proc_macro::io_cached;
use reqwest::header::USER_AGENT;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
#[serde(rename_all = "camelCase")]
pub struct HighlightVideo {
    pub id: String,
    pub title: String,
    pub thumbnail: String,
    pub session_type: String,
    pub embed_url: String,
    pub published_at: String,
}

#[derive(Deserialize)]
pub struct VideoParams {
    pub gp: Option<String>,
}

pub async fn get_official_highlights(Query(params): Query<VideoParams>) -> impl IntoResponse {
    let gp_name = params.gp.unwrap_or_else(|| "Dutch".to_string());

    match fetch_yt_sessions(gp_name).await {
        Ok(videos) => Json(videos).into_response(),
        Err(err) => {
            tracing::error!("Error buscando videos de F1: {}", err);
            Json(Vec::<HighlightVideo>::new()).into_response()
        }
    }
}

#[io_cached(
    map_error = r##"|e| anyhow::anyhow!(format!("video cache error {:?}", e))"##,
    disk = true,
    time = 1800
)]
async fn fetch_yt_sessions(gp_name: String) -> anyhow::Result<Vec<HighlightVideo>> {
    let query = format!("\"Formula 1\" \"{} Grand Prix\" Highlights", gp_name);
    let url = format!(
        "https://www.youtube.com/results?search_query={}",
        urlencoding::encode(&query)
    );

    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(8))
        .build()
        .unwrap_or_default();

    let mut videos = Vec::new();

    if let Ok(res) = client
        .get(&url)
        .header(
            USER_AGENT,
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        )
        .header("Accept-Language", "en-US,en;q=0.9")
        .send()
        .await
    {
        if let Ok(content) = res.text().await {
            // Extraemos ytInitialData del HTML
            if let Some(start_idx) = content.find("var ytInitialData = {") {
                let json_start = start_idx + 20;
                if let Some(end_idx) = content[json_start..].find("};") {
                    let json_str = &content[json_start..=json_start + end_idx];
                    if let Ok(v) = serde_json::from_str::<serde_json::Value>(json_str) {
                        if let Some(items) = v
                            .pointer("/contents/twoColumnSearchResultsRenderer/primaryContents/sectionListRenderer/contents/0/itemSectionRenderer/contents")
                            .and_then(|c| c.as_array())
                        {
                            let blacklist = [
                                "interview", "press", "react", "debrief", "warm up",
                                "radio rewind", "talks", "show",
                            ];

                            for item in items {
                                let renderer = match item.get("videoRenderer") {
                                    Some(r) => r,
                                    None => continue,
                                };

                                let title = renderer
                                    .pointer("/title/runs/0/text")
                                    .and_then(|t| t.as_str())
                                    .unwrap_or_default()
                                    .to_string();

                                let video_id = renderer
                                    .get("videoId")
                                    .and_then(|id| id.as_str())
                                    .unwrap_or_default()
                                    .to_string();

                                let channel_name = renderer
                                    .pointer("/ownerText/runs/0/text")
                                    .and_then(|c| c.as_str())
                                    .unwrap_or_default();

                                let title_lower = title.to_lowercase();
                                let is_f1 = channel_name.contains("Formula 1")
                                    || channel_name.contains("F1");
                                let is_bad = blacklist.iter().any(|b| title_lower.contains(b));

                                if !is_f1 || is_bad || video_id.is_empty() {
                                    continue;
                                }

                                let mut session_type = "";
                                if title_lower.contains("race highlights")
                                    && !title_lower.contains("sprint")
                                {
                                    session_type = "RACE";
                                } else if title_lower.contains("sprint highlights")
                                    || title_lower.contains("sprint race")
                                {
                                    session_type = "SPRINT";
                                } else if title_lower.contains("sprint qualifying")
                                    || title_lower.contains("shootout")
                                {
                                    session_type = "SPRINT_QUALY";
                                } else if title_lower.contains("qualifying highlights")
                                    || title_lower.contains("qualifying")
                                {
                                    session_type = "QUALY";
                                } else if title_lower.contains("fp3")
                                    || title_lower.contains("practice 3")
                                {
                                    session_type = "FP3";
                                } else if title_lower.contains("fp2")
                                    || title_lower.contains("practice 2")
                                {
                                    session_type = "FP2";
                                } else if title_lower.contains("fp1")
                                    || title_lower.contains("practice 1")
                                {
                                    session_type = "FP1";
                                }

                                if !session_type.is_empty()
                                    && !videos.iter().any(|v: &HighlightVideo| {
                                        v.session_type == session_type
                                    })
                                {
                                    let thumb = renderer
                                        .pointer("/thumbnail/thumbnails/0/url")
                                        .and_then(|u| u.as_str())
                                        .unwrap_or_default()
                                        .to_string();

                                    videos.push(HighlightVideo {
                                        id: video_id.clone(),
                                        title,
                                        thumbnail: if thumb.is_empty() {
                                            format!(
                                                "https://i.ytimg.com/vi/{}/hqdefault.jpg",
                                                video_id
                                            )
                                        } else {
                                            thumb
                                        },
                                        session_type: session_type.to_string(),
                                        embed_url: format!(
                                            "https://www.youtube.com/embed/{}",
                                            video_id
                                        ),
                                        published_at: chrono::Utc::now().to_rfc3339(),
                                    });
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    // 🛡️ FALLBACK: Si el scraping de búsqueda falló o YouTube devolvió 0 videos, recurrimos al RSS oficial del canal de F1
    if videos.is_empty() {
        tracing::info!("Scraping de búsqueda sin resultados para {}. Consultando feed RSS oficial de F1...", gp_name);
        videos = fetch_yt_rss_fallback(&gp_name).await;
    }

    // Orden cronológico: FP1 -> FP2 -> FP3 -> SPRINT_QUALY -> SPRINT -> QUALY -> RACE
    let order = [
        "FP1",
        "FP2",
        "FP3",
        "SPRINT_QUALY",
        "SPRINT",
        "QUALY",
        "RACE",
    ];
    videos.sort_by_key(|v| {
        order
            .iter()
            .position(|&o| o == v.session_type)
            .unwrap_or(99)
    });

    Ok(videos)
}

async fn fetch_yt_rss_fallback(gp_name: &str) -> Vec<HighlightVideo> {
    let rss_url = "https://www.youtube.com/feeds/videos.xml?channel_id=UCB_qr75-ydFVKSF9Dmo6izg";
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(6))
        .build()
        .unwrap_or_default();

    let text = match client.get(rss_url).send().await {
        Ok(res) => res.text().await.unwrap_or_default(),
        Err(e) => {
            tracing::warn!("Error conectando al feed RSS de YouTube de F1: {}", e);
            return Vec::new();
        }
    };

    let doc = scraper::Html::parse_fragment(&text);
    let entry_sel = match scraper::Selector::parse("entry") {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    let title_sel = match scraper::Selector::parse("title") {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };
    let video_id_sel = match scraper::Selector::parse("videoId, yt\\:videoId") {
        Ok(s) => s,
        Err(_) => return Vec::new(),
    };

    let gp_lower = gp_name.to_lowercase();
    let mut fallback_videos = Vec::new();

    for entry in doc.select(&entry_sel) {
        let title = entry
            .select(&title_sel)
            .next()
            .map(|t| t.text().collect::<String>())
            .unwrap_or_default();

        let video_id = entry
            .select(&video_id_sel)
            .next()
            .map(|v| v.text().collect::<String>())
            .unwrap_or_default();

        let title_lower = title.to_lowercase();
        if video_id.is_empty() {
            continue;
        }

        // Si el título es del GP actual o son highlights recientes
        let matches_gp = !gp_lower.is_empty() && title_lower.contains(&gp_lower);
        let is_highlights = title_lower.contains("highlights");

        if !matches_gp && !is_highlights {
            continue;
        }

        let mut session_type = "";
        if title_lower.contains("race highlights") && !title_lower.contains("sprint") {
            session_type = "RACE";
        } else if title_lower.contains("sprint highlights") || title_lower.contains("sprint race") {
            session_type = "SPRINT";
        } else if title_lower.contains("sprint qualifying") || title_lower.contains("shootout") {
            session_type = "SPRINT_QUALY";
        } else if title_lower.contains("qualifying highlights") || title_lower.contains("qualifying") {
            session_type = "QUALY";
        } else if title_lower.contains("fp3") || title_lower.contains("practice 3") {
            session_type = "FP3";
        } else if title_lower.contains("fp2") || title_lower.contains("practice 2") {
            session_type = "FP2";
        } else if title_lower.contains("fp1") || title_lower.contains("practice 1") {
            session_type = "FP1";
        }

        if !session_type.is_empty()
            && !fallback_videos.iter().any(|v: &HighlightVideo| v.session_type == session_type)
        {
            fallback_videos.push(HighlightVideo {
                id: video_id.clone(),
                title,
                thumbnail: format!("https://i.ytimg.com/vi/{}/hqdefault.jpg", video_id),
                session_type: session_type.to_string(),
                embed_url: format!("https://www.youtube.com/embed/{}", video_id),
                published_at: chrono::Utc::now().to_rfc3339(),
            });
        }
    }

    fallback_videos
}
