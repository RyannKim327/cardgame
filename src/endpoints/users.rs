use crate::interface;
use tokio::fs;

use axum::Json;

pub async fn users() -> Json<Vec<interface::User>> {
    let file: String = fs::read_to_string("data/user_data.json")
        .await
        .unwrap();

    let users: Vec<interface::User> = serde_json::from_str(&file).unwrap();

    Json(users)
}
