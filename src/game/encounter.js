import { NODE_TYPES } from './route.js';

const WILD_SPECIES = ['pidgey', 'rattata', 'caterpie', 'pikachu', 'oddish', 'geodude'];
const RARE_SPECIES = ['dratini', 'eevee', 'scyther', 'lapras'];
const TRAINER_ARCHETYPES = ['Bug Catcher', 'Hiker', 'Lass', 'Ranger'];
const ELITE_ARCHETYPES = ['Ace Trainer', 'Veteran', 'Gym Challenger'];

function boundedRandom(random) {
  return Math.max(0, Math.min(0.999999, random()));
}

function choose(values, random) {
  return values[Math.floor(boundedRandom(random) * values.length)];
}

export function isBattleNode(node) {
  return [NODE_TYPES.WILD, NODE_TYPES.TRAINER, NODE_TYPES.ELITE, NODE_TYPES.RARE, NODE_TYPES.BOSS].includes(node.type);
}

/** Converts a map node into UI-agnostic encounter data. */
export function createEncounter(node, { route, random = Math.random } = {}) {
  const base = {
    id: `encounter-${node.id}`,
    nodeId: node.id,
    type: node.type,
    title: node.title,
    difficulty: node.difficulty,
    weather: node.weather ?? route?.weather ?? 'clear',
    routeModifiers: route?.modifiers ?? [],
    isBattle: isBattleNode(node),
  };

  if (node.type === NODE_TYPES.WILD || node.type === NODE_TYPES.RARE) {
    const rare = node.type === NODE_TYPES.RARE;
    return { ...base, species: choose(rare ? RARE_SPECIES : WILD_SPECIES, random), rarity: rare ? 'rare' : 'common', teamSize: 1 };
  }
  if (node.type === NODE_TYPES.TRAINER || node.type === NODE_TYPES.ELITE) {
    const elite = node.type === NODE_TYPES.ELITE;
    return { ...base, trainer: choose(elite ? ELITE_ARCHETYPES : TRAINER_ARCHETYPES, random), elite, teamSize: elite ? 3 : 2 };
  }
  if (node.type === NODE_TYPES.BOSS) {
    return { ...base, trainer: node.title, boss: true, teamSize: 3 + Math.min(2, route?.area ?? 0) };
  }
  if (node.type === NODE_TYPES.MYSTERY) return { ...base, event: choose(['Lost backpack', 'Suspicious shrine', 'Fork in the woods'], random) };
  if (node.type === NODE_TYPES.SHOP) return { ...base, shop: true, stock: ['potion', 'pokeball', 'antidote'] };
  if (node.type === NODE_TYPES.HEAL) return { ...base, healPercent: 0.5 };
  if (node.type === NODE_TYPES.CAMP) return { ...base, camp: true };
  if (node.type === NODE_TYPES.TREASURE) return { ...base, treasure: true };
  return base;
}

// Retained for callers that use a simple probability check outside the route engine.
export function rollEncounter(chance = 0.25, random = Math.random) {
  return boundedRandom(random) < chance;
}
