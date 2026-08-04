export function resizeCanvas(canvas, window) {
  canvas.height = window.innerHeight;
  canvas.width = window.innerWidth;
}

export function hpComputation(level, hp) {
  const lvl = Number(level) || 1;
  const baseHp = Number(hp) || 0;
  return Math.round((baseHp + (lvl * 5)) * 100) / 100;
}

/**
 * Computes randomized attack damage with level scaling, reactivity, hp parameter, and trait multipliers.
 * 
 * @param {number} level - Card level (1-10)
 * @param {number} attack - Base attack value
 * @param {number} reactivity - Base reactivity value
 * @param {number} hp - Base HP value
 * @param {number} traitMultiplier - Weak / Strong against multiplier (default 1.0)
 * @param {boolean} forceCrit - Optional override to force a critical hit (default random 30% chance)
 * @returns {object} Calculated damage metrics: { rawDamage, maxDamage, reactivity, hp, baseReactivity, isCrit, critMultiplier, finalDamage }
 */
export function attackComputation(level, attack, reactivity = 0, hp = 1, traitMultiplier = 1.0, forceCrit = null) {
  const lvl = Number(level) || 1;
  const baseAtk = (Number(attack) * (hp / 10)) || 0;
  const reactivityVal = Number(reactivity) || 0;
  const hpVal = Number(hp) || 0;

  // Scaled reactivity formula
  const scaledReactivity = Math.max(1, Math.floor(reactivityVal * (lvl / 2)));
  const maxDamage = baseAtk + (lvl * 5);
  const minDamage = 1;

  // 1. Damage Randomizer (min 1 to maxDamage)
  const rawDamage = Math.floor(Math.random() * (maxDamage - minDamage + 1)) + minDamage;

  // 2. Random 30% Trait Critical Chance
  const isCrit = forceCrit !== null ? forceCrit : (Math.random() < 0.30);
  const critMultiplier = isCrit ? 1.75 : 1.0;

  // 3. Final Calculated Damage (weakness traitMultiplier lessens damage EVEN ON Critical hits!)
  const finalDamage = Math.max(1, Math.floor(rawDamage * traitMultiplier * critMultiplier));

  return {
    rawDamage,
    maxDamage,
    reactivity: scaledReactivity,
    hp: hpVal,
    baseReactivity: reactivityVal,
    isCrit,
    critMultiplier,
    finalDamage
  };
}
