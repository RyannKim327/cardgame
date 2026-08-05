use crate::data::traits;
use crate::interface::{BattleComputationPayload, BattleComputationResponse, Traits};
use crate::utils::battle::{calculate_damage, Rng};

use axum::Json;

pub async fn battle_computation(
    Json(payload): Json<BattleComputationPayload>,
) -> Json<BattleComputationResponse> {
    let traits: Traits = traits::traits_data().await;

    let mut rng = Rng::new();
    let attacker_level = if payload.attacker_level == 0 { 1 } else { payload.attacker_level };

    let (final_damage, is_crit, is_weak, is_strong, is_3rd_attack) = calculate_damage(
        &payload.attacker,
        &payload.defender,
        &traits,
        attacker_level,
        payload.attack_count,
        payload.is_skill,
        &mut rng,
    );

    let lvl = attacker_level as f64;
    let base_atk = (payload.attacker.reactivity as f64) * ((payload.attacker.hp as f64) / 10.0);
    let max_damage = (base_atk + (lvl * 5.0)).floor() as u32;

    Json(BattleComputationResponse {
        raw_damage: final_damage,
        max_damage,
        final_damage,
        is_weak,
        is_strong,
        is_crit,
        is_3rd_attack,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::interface::Element;

    #[tokio::test]
    async fn test_battle_computation_endpoint() {
        let attacker = Element {
            id: "O".to_string(),
            name: "Oxygen".to_string(),
            element_type: "nonmetal".to_string(),
            rarity: "common".to_string(),
            reactivity: 8,
            stability: 4,
            hp: 5,
            traits: vec!["oxidizer".to_string()],
            level: 1,
        };
        let defender = Element {
            id: "H".to_string(),
            name: "Hydrogen".to_string(),
            element_type: "nonmetal".to_string(),
            rarity: "common".to_string(),
            reactivity: 9,
            stability: 2,
            hp: 4,
            traits: vec!["reducer".to_string()],
            level: 1,
        };

        let payload = BattleComputationPayload {
            attacker,
            defender,
            attacker_level: 1,
            attack_count: 0,
            is_skill: false,
        };

        let response = battle_computation(Json(payload)).await;
        assert!(response.final_damage >= 1);
    }
}
