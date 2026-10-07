import { createEncounter } from './encounter.js';
import { recordCompletedRun } from './progression.js';
import { getBranchNodes, getRouteNode, generateRoute } from './route.js';
import { applyReward, generateRewardChoices } from './rewards.js';

export const RUN_STATUS = Object.freeze({
  ACTIVE: 'active',
  IN_ENCOUNTER: 'in-encounter',
  CHOOSING_REWARD: 'choosing-reward',
  FAILED: 'failed',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
});

function cloneStarter(starterPokemon) {
  return {
    ...starterPokemon,
    level: starterPokemon.level ?? 1,
    currentHp: starterPokemon.stats.hp,
    statusEffects: [],
    moveUpgrades: {},
  };
}

function hasLivingParty(party) {
  return party.some((pokemon) => (pokemon.currentHp ?? pokemon.stats.hp) > 0);
}

function getCurrentNode(run) {
  return getRouteNode(run.route, run.currentNodeId);
}

function nextArea(run, random) {
  const area = run.area + 1;
  const route = generateRoute({ area, random, unlocks: run.permanentUnlocks });
  return {
    ...run,
    area,
    route,
    currentNodeId: route.startNodeId,
    weather: route.weather,
    routeModifiers: route.modifiers,
    areaComplete: { area: run.area + 1 },
    activeEncounter: null,
    pendingRewards: [],
    status: RUN_STATUS.ACTIVE,
    history: [...run.history, { type: 'area-complete', area: run.area }],
  };
}

/** Starts a fresh roguelike run. It is intentionally independent of localStorage and React. */
export function createRun({ starterPokemon, progression, areasPerRun = 3, random = Math.random } = {}) {
  if (!starterPokemon?.stats?.hp) throw new Error('A starter Pokémon with PokéAPI stats is required to start a run.');
  const permanentUnlocks = progression?.unlocks ?? [];
  const route = generateRoute({ area: 0, random, unlocks: permanentUnlocks });
  return {
    id: `run-${Date.now()}-${Math.floor(random() * 1_000_000)}`,
    status: RUN_STATUS.ACTIVE,
    area: 0,
    areasPerRun,
    route,
    currentNodeId: route.startNodeId,
    party: [cloneStarter(starterPokemon)],
    money: 0,
    heldItems: [],
    inventory: { potion: 2, pokeball: 3, 'oran-berry': 1 },
    energy: 6,
    maxEnergy: 6,
    weather: route.weather,
    routeModifiers: route.modifiers,
    pendingRewards: [],
    activeEncounter: null,
    history: [],
    rewardHistory: [],
    permanentUnlocks,
  };
}

/** Returns the meaningful next map choices; each has an explicit risk preview. */
export function getAvailableBranches(run) {
  if (run.status !== RUN_STATUS.ACTIVE) return [];
  return getBranchNodes(run.route, run.currentNodeId);
}

/** Chooses one branch and creates its encounter payload. */
export function chooseBranch(run, nodeId, { random = Math.random } = {}) {
  if (run.status !== RUN_STATUS.ACTIVE) throw new Error('A route choice is not available right now.');
  const branch = getAvailableBranches(run).find((candidate) => candidate.nodeId === nodeId);
  if (!branch?.node) throw new Error('That node is not connected to the current route position.');
  const activeEncounter = createEncounter(branch.node, { route: run.route, random });
  return {
    ...run,
    currentNodeId: nodeId,
    activeEncounter,
    status: RUN_STATUS.IN_ENCOUNTER,
    history: [...run.history, { type: 'node-entered', nodeId, nodeType: branch.node.type, risk: branch.risk }],
  };
}

/**
 * Replaces the run party after a battle or item effect. An all-fainted party
 * immediately ends the run, regardless of the current encounter.
 */
export function updateRunParty(run, party) {
  const nextRun = { ...run, party };
  if (hasLivingParty(party)) return nextRun;
  return { ...nextRun, status: RUN_STATUS.FAILED, activeEncounter: null, pendingRewards: [], history: [...run.history, { type: 'run-failed' }] };
}

/** Marks the active encounter resolved and offers exclusive reward choices. */
export function resolveEncounter(run, { victory = true, defeatedPokemon = null, party = run.party, random = Math.random } = {}) {
  if (run.status !== RUN_STATUS.IN_ENCOUNTER || !run.activeEncounter) throw new Error('There is no active encounter to resolve.');
  const partyUpdated = updateRunParty(run, party);
  if (!hasLivingParty(partyUpdated.party)) return partyUpdated;
  if (!victory) return { ...partyUpdated, status: RUN_STATUS.FAILED, activeEncounter: null, history: [...partyUpdated.history, { type: 'run-failed' }] };

  const node = getCurrentNode(partyUpdated);
  const pendingRewards = generateRewardChoices({ run: partyUpdated, node, defeatedPokemon, random });
  return {
    ...partyUpdated,
    status: RUN_STATUS.CHOOSING_REWARD,
    pendingRewards,
    history: [...partyUpdated.history, { type: 'encounter-cleared', nodeId: node.id, nodeType: node.type }],
  };
}

/** Claims a post-encounter reward and advances only after the player has chosen it. */
export function claimRunReward(run, rewardId, options = {}) {
  if (run.status !== RUN_STATUS.CHOOSING_REWARD) throw new Error('There is no reward to claim.');
  const result = applyReward(run, rewardId, options);
  const completedNode = getCurrentNode(result.run);
  const cleared = {
    ...result.run,
    activeEncounter: null,
    history: [...result.run.history, { type: 'reward-claimed', rewardId, message: result.message }],
  };

  if (!completedNode.isBoss) return { run: { ...cleared, status: RUN_STATUS.ACTIVE }, reward: result.reward, message: result.message };
  if (cleared.area + 1 < cleared.areasPerRun) return { run: nextArea(cleared, options.random ?? Math.random), reward: result.reward, message: result.message };
  return { run: { ...cleared, status: RUN_STATUS.COMPLETED, history: [...cleared.history, { type: 'run-completed' }] }, reward: result.reward, message: result.message };
}

/** Converts a completed run into permanent account progression. */
export function collectRunCompletion(run, progression) {
  if (run.status !== RUN_STATUS.COMPLETED) throw new Error('Only a completed run grants permanent unlocks.');
  return recordCompletedRun(progression, run.areasPerRun);
}

export function abandonRun(run) {
  if ([RUN_STATUS.COMPLETED, RUN_STATUS.FAILED].includes(run.status)) return run;
  return { ...run, status: RUN_STATUS.ABANDONED, activeEncounter: null, pendingRewards: [] };
}

/** Exploration spends energy for resources or an optional encounter, never a forced battle. */
export function exploreArea(run, random = Math.random) {
  if (run.status !== RUN_STATUS.ACTIVE || run.energy < 1) throw new Error('You need energy to explore.');
  const roll = random();
  const next = { ...run, energy: run.energy - 1 };
  if (roll < .28) return { run: { ...next, inventory: { ...next.inventory, 'oran-berry': (next.inventory?.['oran-berry'] ?? 0) + 1 } }, result: 'You found an Oran Berry!' };
  if (roll < .52) return { run: { ...next, money: next.money + 60 }, result: 'You found ₽60 in the grass!' };
  if (roll < .72) return { run: { ...next, inventory: { ...next.inventory, pokeball: (next.inventory?.pokeball ?? 0) + 1 } }, result: 'You found a Poké Ball!' };
  return { run: next, result: 'The route is quiet. You find no trace of danger.' };
}
