use crate::interface;
use axum::Json;
use tokio::fs;

pub async fn login(
    Json(payload): Json<interface::LoginPayload>,
) -> Json<interface::LoginResponse> {
    let file: String = match fs::read_to_string("data/user_data.json").await {
        Ok(content) => content,
        Err(_) => {
            return Json(interface::LoginResponse {
                success: false,
                user: None,
                error: Some("Internal server error".to_string()),
            });
        }
    };

    let users: Vec<interface::Auth> = match serde_json::from_str(&file) {
        Ok(u) => u,
        Err(_) => {
            return Json(interface::LoginResponse {
                success: false,
                user: None,
                error: Some("Internal server error".to_string()),
            });
        }
    };

    if let Some(user_auth) = users
        .into_iter()
        .find(|u| u.username == payload.username && u.password == payload.password)
    {
        let user = interface::User {
            id: user_auth.id,
            username: user_auth.username,
            cards: user_auth.cards,
        };

        Json(interface::LoginResponse {
            success: true,
            user: Some(user),
            error: None,
        })
    } else {
        Json(interface::LoginResponse {
            success: false,
            user: None,
            error: Some("Invalid username or password.".to_string()),
        })
    }
}
