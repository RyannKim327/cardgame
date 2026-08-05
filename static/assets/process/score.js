/**
 * Calculates damage points for card interactions by fetching from REST API /battle_computation.
 * 
 * @param {object} data - Object containing attacker, defender, traits, attackerLevel, attackCount, isSkill.
 */
export async function damagePoints(data) {
	const { attacker, defender, attackerLevel = 1, attackCount = 0, isSkill = false } = data;

	try {
		const res = await fetch("/battle_computation", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				attacker,
				defender,
				attacker_level: Number(attackerLevel) || 1,
				attack_count: Number(attackCount) || 0,
				is_skill: !!isSkill
			})
		});

		if (res.ok) {
			const result = await res.json();
			return {
				rawDamage: result.rawDamage,
				maxDamage: result.maxDamage,
				reactivity: Math.max(1, Math.floor((Number(attacker.reactivity) || 0) * (Number(attackerLevel) / 2))),
				hp: Number(attacker.hp) || 0,
				finalDamage: result.finalDamage,
				isWeak: result.isWeak,
				isStrong: result.isStrong,
				is3rdAttack: result.is3rdAttack,
				multiplier: (result.isWeak ? 0.65 : 1.0) * (result.isStrong ? 1.35 : 1.0) * (result.isCrit ? 1.75 : 1.0)
			};
		}
	} catch (err) {
		console.warn("REST API /battle_computation failed, using local calculation fallback:", err);
	}

	// Fallback local calculation
	const lvl = Number(attackerLevel) || 1;
	const baseAtk = (Number(attacker.reactivity) * (Number(attacker.hp) / 10)) || 0;
	const reactivityVal = Number(attacker.reactivity) || 0;
	const hpVal = Number(attacker.hp) || 0;

	const scaledReactivity = Math.max(1, Math.floor(reactivityVal * (lvl / 2)));
	const maxDamage = baseAtk + (lvl * 5);
	const minDamage = 1;

	const rawDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;
	const isCrit = isSkill ? true : (Math.random() < 0.30);
	const critMultiplier = isCrit ? 1.75 : 1.0;
	let traitMultiplier = 1.0;
	let isWeak = false;
	let isStrong = false;

	if (data.traits && attacker.traits && defender.traits) {
		attacker.traits.forEach(aTrait => {
			const traitInfo = data.traits[aTrait];
			if (traitInfo) {
				defender.traits.forEach(dTrait => {
					if (traitInfo.weak_against && traitInfo.weak_against.includes(dTrait)) {
						traitMultiplier *= 0.65;
						isWeak = true;
					}
					if (traitInfo.strong_against && traitInfo.strong_against.includes(dTrait)) {
						traitMultiplier *= 1.35;
						isStrong = true;
					}
				});
			}
		});
	}

	let finalDamage = Math.max(1, Math.floor(rawDamage * traitMultiplier * critMultiplier));
	if (isSkill) finalDamage = Math.max(1, Math.floor(finalDamage * 1.2));

	return {
		rawDamage,
		maxDamage,
		reactivity: scaledReactivity,
		hp: hpVal,
		finalDamage,
		isWeak,
		isStrong,
		is3rdAttack: isCrit,
		multiplier: traitMultiplier * critMultiplier
	};
}


