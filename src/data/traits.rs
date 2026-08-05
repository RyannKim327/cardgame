use crate::interface::Traits;
use tokio::fs;

pub async fn traits_data() -> Traits {
    match fs::read_to_string("data/traits.json").await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => std::collections::HashMap::new(),
    }
}

