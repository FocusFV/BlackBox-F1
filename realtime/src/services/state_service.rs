use anyhow::Error;
use serde_json::Value;
use std::sync::Arc;
use tokio::sync::RwLock;

#[derive(Clone)]
pub struct StateService {
    state: Arc<RwLock<Value>>,
}

impl StateService {
    pub fn new() -> Self {
        Self {
            state: Arc::new(RwLock::new(Value::Object(serde_json::Map::new()))),
        }
    }

    pub async fn get_state(&self) -> Result<Value, Error> {
        let state = self.state.read().await;
        Ok(state.clone())
    }

    pub async fn get_state_string(&self) -> Result<String, Error> {
        let state = self.state.read().await;
        Ok(state.to_string())
    }

    #[allow(dead_code)]
    pub async fn set_state(&self, new_state: Value) -> Result<(), Error> {
        let mut state = self.state.write().await;
        // 🛡️ Si intentan setear algo que no sea objeto, nos aseguramos de mantener la raíz como Objeto
        if new_state.is_object() {
            *state = new_state;
        } else {
            *state = Value::Object(serde_json::Map::new());
        }
        Ok(())
    }

    pub async fn update_state(&self, update: Value) -> Result<(), Error> {
        let mut state = self.state.write().await;
        
        // 🛡️ Si por alguna razón el estado volvió a romperse como Array o Null, lo reseteamos a Objeto
        if !state.is_object() {
            *state = Value::Object(serde_json::Map::new());
        }

        merge(&mut state, update);
        Ok(())
    }

    /// 🧹 Purga los datos específicos de la sesión anterior (pilotos, tiempos, telemetría)
    #[allow(dead_code)]
    pub async fn reset_session_data(&self) {
        let mut state = self.state.write().await;
        if let Value::Object(map) = &mut *state {
            tracing::info!("🧹 Reseteando datos de sesión de telemetría (TimingData, DriverList, CarData)...");
            map.remove("TimingData");
            map.remove("DriverList");
            map.remove("TimingAppData");
            map.remove("TimingStats");
            map.remove("CarData.z");
            map.remove("CarDataZ");
            map.remove("Position.z");
            map.remove("PositionZ");
            map.remove("LapCount");
            map.remove("RaceControlMessages");
            map.remove("TopThree");
            map.remove("ExtrapolatedClock");
        }
    }

    /// 🔍 Evalúa si SessionInfo corresponde a una nueva sesión y purga el estado si cambió
    pub async fn check_and_reset_session(&self, new_session_info: &Value) -> bool {
        let mut state = self.state.write().await;
        if let Value::Object(map) = &mut *state {
            let current_key = map
                .get("SessionInfo")
                .and_then(|s| s.get("Key"))
                .and_then(|k| k.as_i64());
            let current_path = map
                .get("SessionInfo")
                .and_then(|s| s.get("Path"))
                .and_then(|p| p.as_str());

            let new_key = new_session_info.get("Key").and_then(|k| k.as_i64());
            let new_path = new_session_info.get("Path").and_then(|p| p.as_str());

            let changed = (new_key.is_some() && current_key.is_some() && new_key != current_key)
                || (new_path.is_some() && current_path.is_some() && new_path != current_path);

            if changed {
                tracing::info!(
                    old_key = ?current_key,
                    new_key = ?new_key,
                    "🔄 Cambio de sesión detectado en F1 Live Timing. Purgando datos viejos para evitar pilotos fantasma..."
                );
                map.remove("TimingData");
                map.remove("DriverList");
                map.remove("TimingAppData");
                map.remove("TimingStats");
                map.remove("CarData.z");
                map.remove("CarDataZ");
                map.remove("Position.z");
                map.remove("PositionZ");
                map.remove("LapCount");
                map.remove("RaceControlMessages");
                map.remove("TopThree");
                map.remove("ExtrapolatedClock");
                return true;
            }
        }
        false
    }
}

pub fn merge(base: &mut Value, update: Value) {
    match (base, update) {
        // 1. Merge de objeto con objeto (ej: { "SessionInfo": ... })
        (Value::Object(prev), Value::Object(update)) => {
            for (k, v) in update {
                merge(prev.entry(k).or_insert(Value::Null), v);
            }
        }
        // 2. Si la base es un Objeto pero el update es una lista, no pisamos la raíz
        (Value::Object(_), Value::Array(_)) => {
            // Ignoramos o manejamos arrays a nivel raíz para proteger el objeto global
        }
        // 3. Merge de array con array: reemplaza la lista para evitar acumulación infinita
        (Value::Array(prev), Value::Array(update)) => {
            *prev = update;
        }
        // 4. Merge de array con indices pasados como objeto
        (Value::Array(prev), Value::Object(update)) => {
            for (k, v) in update {
                if let Ok(index) = k.parse::<usize>() {
                    if let Some(item) = prev.get_mut(index) {
                        merge(item, v);
                    } else {
                        prev.push(v);
                    }
                }
            }
        }
        // 5. Para cualquier valor primitivo (String, Number, Bool), sobreescribimos
        (a, b) => *a = b,
    }
}