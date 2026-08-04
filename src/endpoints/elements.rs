use crate::interface;
use tokio::fs;

use axum::Json;

pub async fn elements() -> Json<Vec<interface::Element>> {
    let file: String = fs::read_to_string("data/elements.json")
        .await
        .unwrap();

    let elements: Vec<interface::Element> = serde_json::from_str(&file).unwrap();

    Json(elements)
}
