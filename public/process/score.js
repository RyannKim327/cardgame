/**
 * Calculates extra damage based on element traits and reactivity passives.
 * 
 * @param {number} partial - Base random damage.
 * @param {object} attacker - Attacker element object (from elements.json).
 * @param {object} defender - Defender element object (from elements.json).
 * @param {object} traitsData - Traits relationship data (from traits.json).
 * @returns {object} Calculated damage details and status effects.
 */

function damageExtras(partial, attacker, defender, traitsData) {
	// TODO: Passive damage based on reactivity: "divide it into 5" or "more or less 2" for 8
	const passiveDamage = Math.round(attacker.reactivity / 5)

	// TODO: True damage: "8 as true damage like literally -8 in HP"
	const trueDamage = attacker.reactivity

	// TODO: Trait-based multiplier logic
	let traitMultiplier = 1.0
	if (traitsData && attacker.traits && defender.traits) {
		attacker.traits.forEach(aTrait => {
			const traitInfo = traitsData[aTrait]
			if (traitInfo) {
				defender.traits.forEach(dTrait => {
					// Check for strong against (e.g., metal vs nonmetal, oxidizer vs reducer)
					if (traitInfo.strong_against.includes(dTrait) ||
						(dTrait === 'metal' && traitInfo.strong_against.includes('metals'))) {
						traitMultiplier += 0.2
					}
					// Check for weak against
					if (traitInfo.weak_against.includes(dTrait)) {
						traitMultiplier -= 0.1
					}
				})
			}
		})
	}

	// INFO:
	// Status effects: "paralize in human due to its passive"
	// High reactivity (8+) can cause paralysis
	const status = attacker.reactivity >= 8 ? "paralyzed" : null

	// INFO:
	// Total calculation: (base + passive) * multiplier + true damage
	// True damage is added at the end as it bypasses standard defenses/multipliers.
	const totalCalculated = Math.floor((partial + passiveDamage) * traitMultiplier) + trueDamage

	return {
		total: totalCalculated,
		trueDamage: trueDamage,
		passiveDamage: passiveDamage,
		multiplier: traitMultiplier,
		status: status
	}
}

/**
 * Main function to calculate damage points for an interaction.
 * 
 * @param {object} data - Object containing attacker, defender, traits, and elements data.
 */

export function damagePoints(data) {
	const { attacker, defender, traits } = data

	const totalHp = 100
	const partialDamage = totalHp * 0.3
	const randomDamage = Math.floor(Math.random() * partialDamage)

	const extras = damageExtras(randomDamage, attacker, defender, traits)

	return {
		baseDamage: randomDamage,
		extras: extras,
		finalDamage: extras.total,
		targetStatus: extras.status
	}
}
