use crate::data::elements::elements_data;
use crate::interface;

use axum::Json;

pub async fn elements() -> Json<Vec<interface::Element>> {
    let elements = elements_data().await;
    Json(elements)
}
