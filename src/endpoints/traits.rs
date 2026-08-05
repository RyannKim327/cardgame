use crate::data::traits::traits_data;
use crate::interface;

use axum::Json;

pub async fn traits() -> Json<interface::Traits> {
    let traits = traits_data().await;
    Json(traits)
}
