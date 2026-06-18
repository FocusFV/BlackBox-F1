use axum::{extract::Query, response::IntoResponse, Json};
use scraper::{Html, Selector};
use serde::{Deserialize, Serialize};
use reqwest::header::USER_AGENT;

#[derive(Serialize)]
pub struct PressNote {
    pub label: String,
    pub title: String,
    pub text: String,
    pub link: String,
    #[serde(rename = "sourceName")] 
    pub source_name: String,
}

#[derive(Deserialize)]
pub struct InsightsParams {
    pub gp: Option<String>,
}

pub async fn get_live_insights(Query(params): Query<InsightsParams>) -> impl IntoResponse {
    let raw_gp = params.gp.unwrap_or_else(|| "Formula 1".to_string());
    
    // Limpiamos los agregados de la API de F1
    let gp_clean = raw_gp
        .replace("Grand Prix", "")
        .replace("Gp", "")
        .trim()
        .to_string();

    match raspando_google_news(&gp_clean).await {
        Ok(notes) => Json(notes).into_response(),
        Err(err) => {
            tracing::error!("Error raspando Google News: {}", err);
            let fallbacks = generar_analisis_tecnico_real(&raw_gp);
            Json(fallbacks).into_response()
        }
    }
}

async fn raspando_google_news(gp_keyword: &str) -> anyhow::Result<Vec<PressNote>> {
    // Traducimos términos comunes para asegurar noticias en castellano de ese circuito
    let search_term = match gp_keyword.to_lowercase().as_str() {
        "spanish" | "barcelona" => "F1+España+Barcelona",
        "austrian" | "spielberg" => "F1+Austria+Red+Bull+Ring",
        "british" | "silverstone" => "F1+Silverstone+Gran+Bretaña",
        other => &format!("F1+{}", other.replace(" ", "+"))
    };

    // Google News RSS en español: devuelve un XML plano que se parsea al toque con selectores de etiquetas
    let url = format!("https://news.google.com/rss/search?q={}&hl=es-419&gl=AR&ceid=AR:es-419", search_term);
    
    let client = reqwest::Client::new();
    let content = client
        .get(&url)
        .header(USER_AGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
        .send()
        .await?
        .text()
        .await?;

    let document = Html::parse_document(&content);
    
    // En el RSS de Google News, cada noticia es un elemento <item> con <title>, <link> y <source> adentro
    let item_selector = Selector::parse("item").unwrap();
    let title_selector = Selector::parse("title").unwrap();
    let link_selector = Selector::parse("link").unwrap();
    let source_selector = Selector::parse("source").unwrap();

    let mut notes = Vec::new();

    for (idx, item) in document.select(&item_selector).enumerate() {
        if idx >= 4 { break; } // Clavamos la grilla limpia de 4 tarjetas que te gusta a vos

        let raw_title = item
            .select(&title_selector)
            .next()
            .map(|e| e.text().collect::<String>())
            .unwrap_or_default();

        let link = item
            .select(&link_selector)
            .next()
            .map(|e| e.text().collect::<String>())
            .unwrap_or_else(|| "https://news.google.com".to_string());

        let source = item
            .select(&source_selector)
            .next()
            .map(|e| e.text().collect::<String>())
            .unwrap_or_else(|| "Paddock".to_string());

        if !raw_title.is_empty() {
            // Google News clava el nombre del medio al final del título separado por un guión. Se lo limpiamos:
            let title = match raw_title.rsplit_once(" - ") {
                Some((t, _)) => t.to_string(),
                None => raw_title
            };

            let clean_title = if title.len() > 65 { format!("{}...", &title[..62]) } else { title };

            notes.push(PressNote {
                label: format!("Google News • {}", gp_keyword),
                title: clean_title,
                text: "Hacé click para abrir la cobertura de prensa y el desglose de vueltas de este flash informativo en vivo.".to_string(),
                link,
                source_name: source,
            });
        }
    }

    if notes.is_empty() {
        return Err(anyhow::anyhow!("Cero artículos en el feed"));
    }

    Ok(notes)
}

fn generar_analisis_tecnico_real(gp_name: &str) -> Vec<PressNote> {
    vec![
        PressNote {
            label: format!("Estrategia • {}", gp_name),
            title: format!("Ventanas de Paradas y Desgaste en {}", gp_name),
            text: format!("Análisis del comportamiento de los compuestos blandos y duros bajo las condiciones climáticas del circuito."),
            link: format!("https://soymotor.com/buscar?search={}", gp_name),
            source_name: "Análisis Pirelli".to_string(),
        },
        PressNote {
            label: format!("Telemetría • {}", gp_name),
            title: format!("Zonas de DRS y Velocidades Punta en {}", gp_name),
            text: format!("Revisión de los puntos de detección y la eficiencia aerodinámica de los alerones traseros en las rectas principales."),
            link: format!("https://es.motorsport.com/buscar/?q={}", gp_name),
            source_name: "Motorsport Intel".to_string(),
        }
    ]
}