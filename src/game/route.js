export const NODE_TYPES = Object.freeze({
  WILD: 'wild',
  TRAINER: 'trainer',
  ELITE: 'elite',
  MYSTERY: 'mystery',
  SHOP: 'shop',
  HEAL: 'heal',
  RARE: 'rare',
  TREASURE: 'treasure',
  CAMP: 'camp',
  BOSS: 'boss',
});

export const WEATHER = Object.freeze(['clear', 'rain', 'sun', 'storm', 'fog']);

export const ROUTE_MODIFIERS = Object.freeze([
  { id: 'rich-trainers', name: 'Rich Trainers', description: 'Trainer nodes offer extra currency.' },
  { id: 'thick-grass', name: 'Thick Grass', description: 'Wild Pokémon are tougher but rare encounters are more likely.' },
  { id: 'rough-terrain', name: 'Rough Terrain', description: 'Battles start with a small chip of damage.' },
  { id: 'traveller-camp', name: 'Traveller Camp', description: 'Healing locations restore more HP.' },
]);

const SAFE_NODE_WEIGHTS = [
  [NODE_TYPES.WILD, 15], [NODE_TYPES.TRAINER, 8], [NODE_TYPES.MYSTERY, 22], [NODE_TYPES.SHOP, 18], [NODE_TYPES.HEAL, 15], [NODE_TYPES.TREASURE, 12], [NODE_TYPES.CAMP, 10],
];
const RISKY_NODE_WEIGHTS = [
  [NODE_TYPES.WILD, 17], [NODE_TYPES.TRAINER, 13], [NODE_TYPES.ELITE, 8], [NODE_TYPES.MYSTERY, 20], [NODE_TYPES.RARE, 7], [NODE_TYPES.TREASURE, 20], [NODE_TYPES.CAMP, 15],
];
const BOSS_NAMES = ['Verdant Warden', 'Storm Captain', 'Iron Ranger', 'Eclipse Ace'];

function boundedRandom(random) {
  return Math.max(0, Math.min(0.999999, random()));
}

function randomInt(min, max, random) {
  return min + Math.floor(boundedRandom(random) * (max - min + 1));
}

function choose(list, random) {
  return list[Math.floor(boundedRandom(random) * list.length)];
}

function weightedChoose(weightedEntries, random) {
  const roll = boundedRandom(random) * weightedEntries.reduce((sum, [, weight]) => sum + weight, 0);
  let cursor = 0;
  for (const [value, weight] of weightedEntries) {
    cursor += weight;
    if (roll < cursor) return value;
  }
  return weightedEntries.at(-1)[0];
}

function nodeTitle(type) {
  return {
    [NODE_TYPES.WILD]: 'Wild Pokémon',
    [NODE_TYPES.TRAINER]: 'Trainer',
    [NODE_TYPES.ELITE]: 'Elite Trainer',
    [NODE_TYPES.MYSTERY]: 'Mystery Event',
    [NODE_TYPES.SHOP]: 'Wandering Shop',
    [NODE_TYPES.HEAL]: 'Rest Stop',
    [NODE_TYPES.RARE]: 'Rare Pokémon',
    [NODE_TYPES.TREASURE]: 'Treasure',
    [NODE_TYPES.CAMP]: 'Camp',
    [NODE_TYPES.BOSS]: 'Route Boss',
  }[type];
}

function difficultyFor(type, area, risk) {
  if (type === 'start') return 0;
  const base = area + 1;
  const bonus = {
    [NODE_TYPES.WILD]: 0,
    [NODE_TYPES.TRAINER]: 1,
    [NODE_TYPES.MYSTERY]: 0,
    [NODE_TYPES.SHOP]: 0,
    [NODE_TYPES.HEAL]: 0,
    [NODE_TYPES.RARE]: 2,
    [NODE_TYPES.ELITE]: 3,
    [NODE_TYPES.BOSS]: 4,
    [NODE_TYPES.TREASURE]: 0,
    [NODE_TYPES.CAMP]: 0,
  }[type];
  return base + bonus + (risk === 'risky' ? 1 : 0);
}

function createNode({ id, type, depth, risk, area, weather, isBoss = false, name }) {
  return {
    id,
    type,
    title: name ?? nodeTitle(type),
    depth,
    risk,
    difficulty: difficultyFor(type, area, risk),
    weather,
    isBoss,
    branches: [],
  };
}

/**
 * Builds a directed route graph. A chosen route path always has 5–8 ordinary
 * encounters and then one boss. At every ordinary depth the next choice offers
 * a lower-risk and higher-risk branch.
 */
export function generateRoute({ area = 0, random = Math.random, unlocks = [] } = {}) {
  const encountersPerPath = randomInt(5, 8, random);
  const weather = choose(WEATHER, random);
  const modifierCount = unlocks.includes('double-modifiers') ? 2 : 1;
  const modifiers = [...ROUTE_MODIFIERS]
    .sort(() => boundedRandom(random) - 0.5)
    .slice(0, modifierCount);
  const nodes = [];
  const riskyWeights = unlocks.includes('rare-radar')
    ? RISKY_NODE_WEIGHTS.map(([type, weight]) => [type, type === NODE_TYPES.RARE ? weight + 18 : weight])
    : RISKY_NODE_WEIGHTS;
  const start = createNode({ id: `a${area}-start`, type: 'start', depth: 0, risk: 'none', area, weather });
  start.title = `Route ${area + 1} Start`;
  nodes.push(start);

  let previousStage = [start];
  for (let depth = 1; depth <= encountersPerPath; depth += 1) {
    const safeNode = createNode({
      id: `a${area}-d${depth}-safe`,
      type: weightedChoose(SAFE_NODE_WEIGHTS, random),
      depth,
      risk: 'safe',
      area,
      weather,
    });
    const riskyNode = createNode({
      id: `a${area}-d${depth}-risky`,
      type: weightedChoose(riskyWeights, random),
      depth,
      risk: 'risky',
      area,
      weather,
    });
    nodes.push(safeNode, riskyNode);

    previousStage.forEach((node) => {
      node.branches = [
        { nodeId: safeNode.id, label: 'Safe trail', risk: 'safe', preview: safeNode.title },
        { nodeId: riskyNode.id, label: 'Risky trail', risk: 'risky', preview: riskyNode.title },
      ];
    });
    previousStage = [safeNode, riskyNode];
  }

  const boss = createNode({
    id: `a${area}-boss`,
    type: NODE_TYPES.BOSS,
    depth: encountersPerPath + 1,
    risk: 'boss',
    area,
    weather,
    isBoss: true,
    name: BOSS_NAMES[area % BOSS_NAMES.length],
  });
  nodes.push(boss);
  previousStage.forEach((node) => {
    node.branches = [{ nodeId: boss.id, label: 'Challenge the boss', risk: 'boss', preview: boss.title }];
  });

  return {
    id: `route-${area}-${Math.floor(boundedRandom(random) * 1_000_000)}`,
    area,
    encountersPerPath,
    weather,
    modifiers,
    startNodeId: start.id,
    bossNodeId: boss.id,
    nodes,
  };
}

export function getRouteNode(route, nodeId) {
  return route.nodes.find((node) => node.id === nodeId) ?? null;
}

export function getBranchNodes(route, nodeId) {
  const node = getRouteNode(route, nodeId);
  if (!node) return [];
  return node.branches.map((branch) => ({ ...branch, node: getRouteNode(route, branch.nodeId) }));
}
