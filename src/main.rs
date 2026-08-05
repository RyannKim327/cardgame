mod interface;
mod endpoints;
mod utils;

use endpoints::{
    battle_ws::{ws_battle_handler, ws_battle_handler_id, ws_search_handler},
    elements::elements,
    login::login,
    traits::traits,
    users::users,
};

use axum::{
    routing::{get, post},
    Router,
};

use std::net::SocketAddr;
use tower_http::services::ServeDir;

#[tokio::main]
async fn main(){
    let app = Router::new()
        .route("/elements", get(elements))
        .route("/traits", get(traits))
        .route("/users", get(users))
        .route("/login", post(login))
        .route("/ws/search", get(ws_search_handler))
        .route("/ws/battle", get(ws_battle_handler))
        .route("/ws/battle/{id}", get(ws_battle_handler_id))
        .fallback_service(ServeDir::new("static"));
    
    let addr = SocketAddr::from(([127,0,0,1], 3000));

    let listener = tokio::net::TcpListener::bind(addr)
    .await
    .unwrap();

    println!("Server running");
    axum::serve(listener, app).await.unwrap();
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::Json;
    use tokio::fs;

    #[tokio::test]
    async fn test_traits_deserialization() {
        let file = fs::read_to_string("data/traits.json").await.unwrap();
        let traits: interface::Traits = serde_json::from_str(&file).unwrap();
        assert!(traits.contains_key("oxidizer"));
        let oxidizer = &traits["oxidizer"];
        assert!(oxidizer.strong_against.contains(&"reducer".to_string()));
        assert!(oxidizer.weak_against.contains(&"inert".to_string()));
    }

    #[tokio::test]
    async fn test_elements_deserialization() {
        let file = fs::read_to_string("data/elements.json").await.unwrap();
        let elements: Vec<interface::Element> = serde_json::from_str(&file).unwrap();
        assert!(!elements.is_empty());
    }

    #[tokio::test]
    async fn test_users_deserialization() {
        let file = fs::read_to_string("data/user_data.json").await.unwrap();
        let users: Vec<interface::User> = serde_json::from_str(&file).unwrap();
        assert!(!users.is_empty());
    }

    #[tokio::test]
    async fn test_login_success_and_failure() {
        let success_payload = interface::LoginPayload {
            username: "test".to_string(),
            password: "test123".to_string(),
        };
        let res = login(Json(success_payload)).await;
        assert!(res.0.success);
        assert!(res.0.user.is_some());
        assert_eq!(res.0.user.unwrap().username, "test");

        let fail_payload = interface::LoginPayload {
            username: "test".to_string(),
            password: "wrongpassword".to_string(),
        };
        let res_fail = login(Json(fail_payload)).await;
        assert!(!res_fail.0.success);
        assert!(res_fail.0.user.is_none());
        assert_eq!(res_fail.0.error.unwrap(), "Invalid username or password.");
    }
}

