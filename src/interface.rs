use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Element {
    pub id: String,
    pub name: String,
    #[serde(rename = "type")]
    pub element_type: String,
    pub rarity: String,
    pub reactivity: u8,
    pub stability: u8,
    pub hp: u16,
    pub traits: Vec<String>,
    #[serde(default)]
    pub level: u8,
} 

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TraitRelation {
    pub strong_against: Vec<String>,
    pub weak_against: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Card {
    pub id: String,
    pub level: u8,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    // pub password: String,
    pub cards: Vec<Card>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct Auth {
    pub id: String,
    pub username: String,
    pub password: String,
    pub cards: Vec<Card>
}

pub type Traits = HashMap<String, TraitRelation>;

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginPayload {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LoginResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub user: Option<User>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BattleComputationPayload {
    pub attacker: Element,
    pub defender: Element,
    #[serde(default = "default_level")]
    pub attacker_level: u8,
    #[serde(default)]
    pub attack_count: u32,
    #[serde(default)]
    pub is_skill: bool,
}

fn default_level() -> u8 {
    1
}

#[derive(Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct BattleComputationResponse {
    pub raw_damage: u32,
    pub max_damage: u32,
    pub final_damage: u32,
    pub is_weak: bool,
    pub is_strong: bool,
    pub is_crit: bool,
    pub is_3rd_attack: bool,
}


