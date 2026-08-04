use crate::interface;
use tokio::fs;

use axum::Json;

pub async fn traits() -> Json<interface::Traits> {
    let file: String = fs::read_to_string("data/traits.json")
        .await
        .unwrap();

    let traits: interface::Traits = serde_json::from_str(&file).unwrap();

    Json(traits)
}
