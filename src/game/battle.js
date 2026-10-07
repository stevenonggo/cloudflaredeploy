import { getTypeEffectiveness } from './typeChart.js';

const nameOf = (move) => typeof move === 'string' ? move : move.name;
const moveData = (move) => typeof move === 'string' ? { name: move, type: 'normal', power: 40, accuracy: 100, category: 'physical', pp: 35, maxPP: 35 } : move;
export const isFainted = (pokemon) => pokemon.currentHp <= 0;
export function effectiveSpeed(pokemon) { return Math.floor(pokemon.stats.speed * (pokemon.status === 'paralysis' ? 0.5 : 1)); }
export function determineTurnOrder(player, enemy, playerAction = { priority: 0 }, enemyAction = { priority: 0 }, random = Math.random) { if (playerAction.priority !== enemyAction.priority) return playerAction.priority > enemyAction.priority ? ['player', 'enemy'] : ['enemy', 'player']; if (effectiveSpeed(player) !== effectiveSpeed(enemy)) return effectiveSpeed(player) > effectiveSpeed(enemy) ? ['player', 'enemy'] : ['enemy', 'player']; return random() < .5 ? ['player', 'enemy'] : ['enemy', 'player']; }
export function getActionPriority(action) { return action.kind === 'item' ? 6 : action.kind === 'switch' ? 5 : 0; }
export function calculateDamage(attacker, defender, move, random = Math.random) {
  const data = moveData(move); const effectiveness = getTypeEffectiveness(data.type, defender.types); const stab = attacker.types?.includes(data.type) ? 1.5 : 1;
  if (!data.power || data.category === 'status' || effectiveness === 0) return { damage: 0, stab, effectiveness, randomModifier: 1 };
  const attack = data.category === 'special' ? attacker.stats.specialAttack : attacker.stats.attack;
  const defense = data.category === 'special' ? defender.stats.specialDefense : defender.stats.defense;
  const burn = attacker.status === 'burn' && data.category === 'physical' ? .5 : 1;
  const randomModifier = .85 + Math.max(0, Math.min(.9999, random())) * .15;
  const base = (((2 * attacker.level / 5 + 2) * data.power * attack / Math.max(1, defense)) / 50) + 2;
  return { damage: Math.max(1, Math.floor(base * stab * effectiveness * randomModifier * burn)), stab, effectiveness, randomModifier };
}
export function attack(attacker, defender, move, random = Math.random) {
  const data = moveData(move); if ((data.pp ?? 0) <= 0) return { attacker, defender, move: data, skipped: true, message: 'No PP left!' };
  const usedMoves = attacker.moves.map((known) => nameOf(known) === data.name ? { ...known, pp: Math.max(0, (known.pp ?? 0) - 1) } : known);
  const nextAttacker = { ...attacker, moves: usedMoves }; if (attacker.status === 'sleep' && attacker.sleepTurns > 0) return { attacker: { ...nextAttacker, sleepTurns: attacker.sleepTurns - 1 }, defender, move: data, skipped: true, message: `${attacker.name} is fast asleep!` };
  if (attacker.status === 'paralysis' && random() < .25) return { attacker: nextAttacker, defender, move: data, skipped: true, message: `${attacker.name} is fully paralyzed!` };
  if (data.accuracy != null && random() * 100 > data.accuracy) return { attacker: nextAttacker, defender, move: data, missed: true, message: `${attacker.name}'s attack missed!` };
  const result = calculateDamage(nextAttacker, defender, data, random); const nextDefender = { ...defender, currentHp: Math.max(0, defender.currentHp - result.damage) };
  return { attacker: nextAttacker, defender: nextDefender, move: data, ...result, fainted: isFainted(nextDefender) };
}
export function chooseEnemyMove(pokemon, target, { trainer = false, random = Math.random } = {}) { const valid = pokemon.moves.filter((move) => (move.pp ?? 0) > 0); if (!valid.length) return null; if (!trainer) return valid[Math.floor(random() * valid.length)]; const scored = valid.map((move) => { const data = moveData(move); return { move, score: (data.power ?? 0) * (pokemon.types.includes(data.type) ? 1.5 : 1) * getTypeEffectiveness(data.type, target.types) * ((data.accuracy ?? 100) / 100) + random() * 15 }; }); return scored.sort((a, b) => b.score - a.score)[0].move; }
export function endTurnStatus(pokemon) { if (isFainted(pokemon)) return { pokemon, damage: 0 }; const damage = ['burn', 'poison'].includes(pokemon.status) ? Math.max(1, Math.floor(pokemon.stats.hp / 8)) : 0; return { pokemon: { ...pokemon, currentHp: Math.max(0, pokemon.currentHp - damage) }, damage }; }
export function canRun({ player, enemy, random = Math.random }) { return effectiveSpeed(player) > effectiveSpeed(enemy) || random() < .5; }
export function useBattleItem(pokemon, item) { if (item === 'potion') return { pokemon: { ...pokemon, currentHp: Math.min(pokemon.stats.hp, pokemon.currentHp + 20) }, message: 'Potion restored 20 HP!' }; if (item === 'super-potion') return { pokemon: { ...pokemon, currentHp: Math.min(pokemon.stats.hp, pokemon.currentHp + 50) }, message: 'Super Potion restored 50 HP!' }; if (item === 'antidote' || item === 'paralyze-heal') return { pokemon: { ...pokemon, status: null, sleepTurns: 0 }, message: 'Status condition cured!' }; return { pokemon, message: 'Nothing happened.' }; }
