export const STAT_CONSTANTS = Object.freeze({ iv: 15, ev: 0, nature: 1 });
const stat = (base, level) => Math.floor(((2 * base + STAT_CONSTANTS.iv + Math.floor(STAT_CONSTANTS.ev / 4)) * level) / 100) + 5;
export function calculateBattleStats(baseStats, level) {
  const hp = Math.floor(((2 * baseStats.hp + STAT_CONSTANTS.iv + Math.floor(STAT_CONSTANTS.ev / 4)) * level) / 100) + level + 10;
  return { hp, attack: Math.floor(stat(baseStats.attack, level) * STAT_CONSTANTS.nature), defense: Math.floor(stat(baseStats.defense, level) * STAT_CONSTANTS.nature), specialAttack: Math.floor(stat(baseStats.specialAttack ?? baseStats.attack, level) * STAT_CONSTANTS.nature), specialDefense: Math.floor(stat(baseStats.specialDefense ?? baseStats.defense, level) * STAT_CONSTANTS.nature), speed: Math.floor(stat(baseStats.speed, level) * STAT_CONSTANTS.nature) };
}
export function createBattlePokemon(pokemon, level = 5) {
  const baseStats = pokemon.baseStats ?? pokemon.stats;
  const stats = calculateBattleStats(baseStats, level);
  return { ...pokemon, species: pokemon.species ?? pokemon.name, level, baseStats, stats, currentHp: stats.hp, status: null, sleepTurns: 0, xp: pokemon.xp ?? 0, moves: pokemon.moves.slice(0, 4).map((move) => typeof move === 'string' ? { name: move, type: 'normal', power: 40, accuracy: 100, pp: 35, maxPP: 35, category: 'physical' } : { ...move, pp: move.pp ?? move.maxPP ?? 35, maxPP: move.maxPP ?? move.pp ?? 35 }) };
}
export function averageLevel(party) { const living = party.filter((p) => p.currentHp > 0); return Math.max(1, Math.round((living.reduce((sum, p) => sum + p.level, 0) || 1) / Math.max(1, living.length))); }
