import { attackComputation } from "../utils.js";

/**
 * Calculates damage points for card interactions using attackComputation from utils.js.
 * 
 * @param {object} data - Object containing attacker, defender, traits, attackerLevel.
 */
export function damagePoints(data) {
	const { attacker, defender, traits, attackerLevel = 1 } = data;

	// Trait relations: weak_against lessens damage by 35% (0.65), strong_against boosts by 35% (1.35)
	let traitMultiplier = 1.0;
	let isWeak = false;
	let isStrong = false;

	if (traits && attacker.traits && defender.traits) {
		attacker.traits.forEach(aTrait => {
			const traitInfo = traits[aTrait];
			if (traitInfo) {
				defender.traits.forEach(dTrait => {
					// Check if attacker trait is weak against defender trait
					if (traitInfo.weak_against && traitInfo.weak_against.includes(dTrait)) {
						traitMultiplier *= 0.65; // Lessens damage by 35%!
						isWeak = true;
					}
					// Check if attacker trait is strong against defender trait
					if (traitInfo.strong_against && traitInfo.strong_against.includes(dTrait)) {
						traitMultiplier *= 1.35;
						isStrong = true;
					}
				});
			}
		});
	}

	// Pass level, attack (reactivity), reactivity, hp, and traitMultiplier into attackComputation
	const attackResult = attackComputation(
		attackerLevel,
		attacker.reactivity,
		attacker.reactivity,
		attacker.hp,
		traitMultiplier
	);

	return {
		rawDamage: attackResult.rawDamage,
		maxDamage: attackResult.maxDamage,
		reactivity: attackResult.reactivity,
		hp: attackResult.hp,
		finalDamage: attackResult.finalDamage,
		isWeak: isWeak,
		isStrong: isStrong,
		is3rdAttack: attackResult.isCrit,
		multiplier: traitMultiplier * attackResult.critMultiplier
	};
}
