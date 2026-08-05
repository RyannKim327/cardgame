use crate::interface::Element;
use tokio::fs;

pub async fn elements_data() -> Vec<Element> {
    match fs::read_to_string("data/elements.json").await {
        Ok(content) => serde_json::from_str(&content).unwrap_or_default(),
        Err(_) => Vec::new(),
    }
}
