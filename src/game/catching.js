export function calculateCatchChance({ currentHp, maxHp, baseChance = 0.35 }) {
  return Math.min(0.95, baseChance + (1 - currentHp / maxHp) * 0.5);
}
