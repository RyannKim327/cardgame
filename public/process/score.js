/**
 * Calculates damage points for card interactions based on:
 * 1. Base Attack = raw element.reactivity
 * 2. Max Damage = attack + (level * 5)
 * 3. Random Damage between min (1) and maxDamage
 * 4. Trait multiplier (Weak Against lessens damage by 35%)
 * 5. Automatic 3rd Attack Critical Skill Burst (1.75x multiplier)
 * 
 * @param {object} data - Object containing attacker, defender, traits, attackerLevel, attackCount.
 */
export function damagePoints(data) {
	const { attacker, defender, traits, attackerLevel = 1, attackCount = 1 } = data;

	// Base attack power directly from raw element.reactivity
	const attackPower = Number(attacker.reactivity) || 1;
	const maxDamage = attackPower + (attackerLevel * 5);
	const minDamage = 1;

	// Random damage between min (1) and maxDamage
	const rawDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

	// Trait relations: weak_against lessens damage, strong_against boosts damage
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

	// Automatic 3rd Attack Critical Burst
	const is3rdAttack = (attackCount > 0 && attackCount % 3 === 0);
	const critMultiplier = is3rdAttack ? 1.75 : 1.0;

	const finalDamage = Math.max(1, Math.floor(rawDamage * traitMultiplier * critMultiplier));

	return {
		rawDamage: rawDamage,
		maxDamage: maxDamage,
		finalDamage: finalDamage,
		isWeak: isWeak,
		isStrong: isStrong,
		is3rdAttack: is3rdAttack,
		multiplier: traitMultiplier * critMultiplier
	};
}
