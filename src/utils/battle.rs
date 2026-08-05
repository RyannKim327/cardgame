use crate::interface::{Element, Traits};

#[derive(Debug, Clone)]
pub struct Rng(u64);

impl Rng {
    pub fn new() -> Self {
        let seed = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_nanos() as u64)
            .unwrap_or(123456789);
        Self(if seed == 0 { 123456789 } else { seed })
    }

    pub fn next_u64(&mut self) -> u64 {
        let mut x = self.0;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.0 = x;
        x
    }

    pub fn gen_range_f64(&mut self, min: f64, max: f64) -> f64 {
        if max <= min {
            return min;
        }
        let r = (self.next_u64() % 10000) as f64 / 10000.0;
        min + r * (max - min)
    }

    pub fn gen_range_u32(&mut self, min: u32, max: u32) -> u32 {
        if max <= min {
            return min;
        }
        let span = max - min + 1;
        min + ((self.next_u64() % span as u64) as u32)
    }

    pub fn gen_bool(&mut self, p: f64) -> bool {
        let r = (self.next_u64() % 10000) as f64 / 10000.0;
        r < p
    }
}

impl Default for Rng {
    fn default() -> Self {
        Self::new()
    }
}

pub fn hp_computation(level: u8, hp: u16) -> f64 {
    let lvl = level as f64;
    let base_hp = hp as f64;
    (base_hp + (lvl * 5.0)).round()
}

// TODO: This is for the attack computation
pub fn calculate_damage(
    attacker: &Element,
    defender: &Element,
    traits: &Traits,
    attacker_level: u8,
    attack_count: u32,
    is_skill: bool,
    rng: &mut Rng,
) -> (u32, bool, bool, bool, bool) {
    let mut trait_multiplier = 1.0f64;
    let mut is_weak = false;
    let mut is_strong = false;

    for a_trait in &attacker.traits {
        if let Some(trait_info) = traits.get(a_trait) {
            for d_trait in &defender.traits {
                if trait_info.weak_against.contains(d_trait) {
                    trait_multiplier *= 0.65;
                    is_weak = true;
                }
                if trait_info.strong_against.contains(d_trait) {
                    trait_multiplier *= 1.35;
                    is_strong = true;
                }
            }
        }
    }

    let lvl = attacker_level as f64;
    let base_atk = (attacker.reactivity as f64) * ((attacker.hp as f64) / 10.0);
    let max_damage = base_atk + (lvl * 5.0);
    let min_damage = 1.0f64;

    let raw_damage = rng.gen_range_f64(min_damage, max_damage);

    let is_crit = if is_skill {
        true
    } else {
        rng.gen_bool(0.30)
    };

    let crit_multiplier = if is_crit { 1.75 } else { 1.0 };
    let mut final_damage = (raw_damage * trait_multiplier * crit_multiplier).floor().max(1.0);

    if is_skill {
        final_damage = (final_damage * 1.2).floor().max(1.0);
    }

    let is_3rd_attack = is_crit || (attack_count % 3 == 0);

    (final_damage as u32, is_crit, is_weak, is_strong, is_3rd_attack)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::collections::HashMap;

    #[test]
    fn test_hp_computation() {
        let hp = hp_computation(2, 10);
        assert_eq!(hp, 20.0);
    }

    #[test]
    fn test_calculate_damage() {
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
        let traits: Traits = HashMap::new();
        let mut rng = Rng::new();

        let (damage, _is_crit, _is_weak, _is_strong, _is_3rd) =
            calculate_damage(&attacker, &defender, &traits, 1, 1, false, &mut rng);
        assert!(damage >= 1);
    }
}
