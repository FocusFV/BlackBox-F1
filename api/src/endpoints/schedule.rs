use std::io::BufReader;
use std::time::Duration;

use anyhow::Error;
use chrono::{DateTime, Datelike, NaiveDateTime, TimeZone, Utc};
use ical::parser::ical::component::IcalEvent;
use regex::Regex;
use serde::{Deserialize, Serialize};
use tracing::{debug, error, warn};

use cached::proc_macro::io_cached;

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Session {
    pub kind: String,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
pub struct Round {
    pub name: String,
    pub country_name: String,
    pub country_key: Option<String>,
    pub start: DateTime<Utc>,
    pub end: DateTime<Utc>,
    pub sessions: Vec<Session>,
    pub over: bool,
}

fn parse_ical_utc(date_string: &str) -> Result<DateTime<Utc>, anyhow::Error> {
    let date_string = date_string.trim();
    let len = date_string.len();

    if len == 8 && !date_string.contains('T') {
        let naive_date = chrono::NaiveDate::parse_from_str(date_string, "%Y%m%d").map_err(|e| {
            anyhow::anyhow!("Failed to parse date-only string '{}': {}", date_string, e)
        })?;
        let naive_datetime = naive_date.and_hms_opt(0, 0, 0).unwrap();
        return Ok(Utc.from_utc_datetime(&naive_datetime));
    }

    if date_string.ends_with('Z') {
        let naive_datetime =
            NaiveDateTime::parse_from_str(date_string, "%Y%m%dT%H%M%SZ").map_err(|e| {
                anyhow::anyhow!("Failed to parse UTC datetime '{}': {}", date_string, e)
            })?;
        return Ok(Utc.from_utc_datetime(&naive_datetime));
    }

    if date_string.contains('T') {
        let naive_datetime =
            NaiveDateTime::parse_from_str(date_string, "%Y%m%dT%H%M%S").map_err(|e| {
                anyhow::anyhow!("Failed to parse local datetime '{}': {}", date_string, e)
            })?;
        return Ok(Utc.from_utc_datetime(&naive_datetime));
    }

    Err(anyhow::anyhow!(
        "Failed to parse date string '{}': unrecognized format (length: {})",
        date_string,
        len
    ))
}

fn get_property(event: &IcalEvent, name: &str) -> Option<String> {
    for property in &event.properties {
        if property.name == name {
            return property.value.clone();
        }
    }
    None
}

fn find_round_mut<'a>(rounds: &'a mut Vec<Round>, name: &str) -> Option<&'a mut Round> {
    rounds.iter_mut().find(|r| r.name == name)
}

fn parse_name(full_name: &str) -> Option<(String, String)> {
    let regex = Regex::new(r"FORMULA 1 (?P<name>.+) - (?P<kind>.+)").ok()?;
    let captures = regex.captures(full_name)?;
    Some((captures["name"].to_owned(), captures["kind"].to_owned()))
}

fn new_round(event: IcalEvent, name: &str, kind: &str) -> Result<Round, Error> {
    let country =
        get_property(&event, "LOCATION").ok_or_else(|| Error::msg("LOCATION property missing"))?;
    let start_str =
        get_property(&event, "DTSTART").ok_or_else(|| Error::msg("DTSTART property missing"))?;
    let end_str =
        get_property(&event, "DTEND").ok_or_else(|| Error::msg("DTEND property missing"))?;

    let start: DateTime<Utc> = parse_ical_utc(&start_str)?;
    let end: DateTime<Utc> = parse_ical_utc(&end_str)?;

    let sessions = vec![Session {
        kind: kind.to_owned(),
        start,
        end,
    }];

    let round = Round {
        name: name.to_owned(),
        country_name: country,
        country_key: None,
        start,
        end,
        sessions,
        over: false,
    };

    Ok(round)
}

fn update_round(event: IcalEvent, round: &mut Round, kind: &str) -> Result<(), Error> {
    let start_str =
        get_property(&event, "DTSTART").ok_or_else(|| Error::msg("DTSTART property missing"))?;
    let end_str =
        get_property(&event, "DTEND").ok_or_else(|| Error::msg("DTEND property missing"))?;

    let start: DateTime<Utc> = parse_ical_utc(&start_str)?;
    let end: DateTime<Utc> = parse_ical_utc(&end_str)?;

    let new_session = Session {
        kind: kind.to_owned(),
        start,
        end,
    };

    round.sessions.push(new_session);

    if start < round.start {
        round.start = start;
    }

    if end > round.end {
        round.end = end;
    }

    Ok(())
}

async fn fetch_ical_schedule(year: i32) -> Result<Vec<Round>, anyhow::Error> {
    let cal_url = "https://ics.ecal.com/ecal-sub/660897ca63f9ca0008bcbea6/Formula%201.ics";
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()?;

    let cal_bytes = client.get(cal_url).send().await?.bytes().await?;
    let cal_buf = BufReader::new(cal_bytes.as_ref());
    let cal_reader = ical::IcalParser::new(cal_buf);

    let mut rounds: Vec<Round> = vec![];

    for line in cal_reader {
        let calendar = line?;

        for event in calendar.events {
            let full_name = get_property(&event, "SUMMARY");

            let Some(full_name) = full_name else {
                continue;
            };

            let Some((name, kind)) = parse_name(&full_name) else {
                continue;
            };

            match find_round_mut(&mut rounds, &name) {
                Some(round) => {
                    let _ = update_round(event, round, &kind);
                }
                None => {
                    let new_round = match new_round(event, &name, &kind) {
                        Ok(new_round) => new_round,
                        Err(err) => {
                            warn!("failed to create round with name: {}: {:?}", name, err);
                            continue;
                        }
                    };

                    if new_round.start.year() != year {
                        debug!("filtering round for year: {}", name);
                        continue;
                    }

                    rounds.push(new_round);
                }
            }
        }
    }

    rounds.sort_unstable_by(|a, b| a.start.cmp(&b.start));

    let utc_now = Utc::now();

    for round in &mut rounds {
        round.over = round.end < utc_now;
        round
            .sessions
            .sort_unstable_by(|a, b| a.start.cmp(&b.start));
    }

    Ok(rounds)
}

fn parse_ergast_datetime(date_str: &str, time_str: Option<&str>) -> Option<DateTime<Utc>> {
    let time = time_str.unwrap_or("12:00:00Z").trim_end_matches('Z');
    let rfc_str = format!("{}T{}Z", date_str.trim(), time.trim());
    DateTime::parse_from_rfc3339(&rfc_str)
        .ok()
        .map(|dt| dt.with_timezone(&Utc))
}

async fn fetch_schedule_from_ergast(year: i32) -> Result<Vec<Round>, anyhow::Error> {
    let url = format!("https://api.jolpi.ca/ergast/f1/{}.json", year);
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(6))
        .build()?;

    let res = client.get(&url).send().await?.json::<serde_json::Value>().await?;
    let races = res
        .pointer("/MRData/RaceTable/Races")
        .and_then(|r| r.as_array())
        .ok_or_else(|| anyhow::anyhow!("No se encontraron carreras en la respuesta de Ergast"))?;

    let mut rounds = Vec::new();
    let utc_now = Utc::now();

    for race in races {
        let name = race
            .get("raceName")
            .and_then(|n| n.as_str())
            .unwrap_or("Gran Premio")
            .to_string();

        let country_name = race
            .pointer("/Circuit/Location/country")
            .and_then(|c| c.as_str())
            .unwrap_or("F1")
            .to_string();

        let country_key = if country_name.len() >= 2 {
            Some(country_name[..2].to_uppercase())
        } else {
            None
        };

        let mut sessions = Vec::new();

        let session_defs = [
            ("FirstPractice", "Practice 1"),
            ("SecondPractice", "Practice 2"),
            ("ThirdPractice", "Practice 3"),
            ("SprintQualifying", "Sprint Qualifying"),
            ("Sprint", "Sprint"),
            ("Qualifying", "Qualifying"),
        ];

        for (field, kind) in session_defs {
            if let Some(session_obj) = race.get(field) {
                if let Some(d) = session_obj.get("date").and_then(|v| v.as_str()) {
                    let t = session_obj.get("time").and_then(|v| v.as_str());
                    if let Some(start) = parse_ergast_datetime(d, t) {
                        let end = start + chrono::Duration::hours(1);
                        sessions.push(Session {
                            kind: kind.to_string(),
                            start,
                            end,
                        });
                    }
                }
            }
        }

        // Carrera principal
        if let Some(race_date) = race.get("date").and_then(|d| d.as_str()) {
            let race_time = race.get("time").and_then(|t| t.as_str());
            if let Some(start) = parse_ergast_datetime(race_date, race_time) {
                let end = start + chrono::Duration::hours(2);
                sessions.push(Session {
                    kind: "Race".to_string(),
                    start,
                    end,
                });
            }
        }

        sessions.sort_unstable_by(|a, b| a.start.cmp(&b.start));

        if let (Some(first), Some(last)) = (sessions.first(), sessions.last()) {
            let start = first.start;
            let end = last.end;
            let over = end < utc_now;

            rounds.push(Round {
                name,
                country_name,
                country_key,
                start,
                end,
                sessions,
                over,
            });
        }
    }

    rounds.sort_unstable_by(|a, b| a.start.cmp(&b.start));
    Ok(rounds)
}

#[io_cached(
    map_error = r##"|e| anyhow::anyhow!(format!("disk cache error {:?}", e))"##,
    disk = true,
    time = 1800
)]
async fn get_schedule(year: i32) -> Result<Vec<Round>, anyhow::Error> {
    match fetch_ical_schedule(year).await {
        Ok(rounds) if !rounds.is_empty() => Ok(rounds),
        Ok(_) | Err(_) => {
            warn!("eCal schedule no disponible o vacío para {}. Usando fallback API Jolpica/Ergast...", year);
            fetch_schedule_from_ergast(year).await
        }
    }
}

pub async fn get() -> Result<axum::Json<Vec<Round>>, axum::http::StatusCode> {
    let year = chrono::Utc::now().year();
    let schedule = get_schedule(year).await;

    match schedule {
        Ok(schedule) => Ok(axum::Json(schedule)),
        Err(err) => {
            error!("failed to create schedule for year {}: {:?}", year, err);
            Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}

pub async fn get_next() -> Result<axum::Json<Round>, axum::http::StatusCode> {
    let year = chrono::Utc::now().year();
    let schedule = get_schedule(year).await;

    match schedule {
        Ok(schedule) => {
            let not_over: Vec<Round> = schedule.into_iter().filter(|r| !r.over).collect();
            let next_round = not_over.first().cloned();

            match next_round {
                Some(next_round) => Ok(axum::Json(next_round)),
                None => Err(axum::http::StatusCode::NO_CONTENT),
            }
        }
        Err(err) => {
            error!("failed to create next schedule for year {}: {:?}", year, err);
            Err(axum::http::StatusCode::INTERNAL_SERVER_ERROR)
        }
    }
}