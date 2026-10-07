export const REWARD_TYPES = Object.freeze({
  HEAL: 'heal',
  MOVE_UPGRADE: 'move-upgrade',
  CATCH: 'catch',
  ITEM: 'item',
  CURRENCY: 'currency',
});

export const HELD_ITEMS = Object.freeze([
  { id: 'oran-berry', name: 'Oran Berry', description: 'Restores a little HP when its holder is low.' },
  { id: 'quick-claw', name: 'Quick Claw', description: 'May let its holder act first.' },
  { id: 'focus-band', name: 'Focus Band', description: 'May let its holder survive a knockout blow.' },
  { id: 'muscle-band', name: 'Muscle Band', description: 'Boosts physical damage.' },
]);

function boundedRandom(random) {
  return Math.max(0, Math.min(0.999999, random()));
}

function choose(values, random) {
  return values[Math.floor(boundedRandom(random) * values.length)];
}

function healParty(party, percentage) {
  return party.map((pokemon) => {
    const maxHp = pokemon.stats.hp;
    const currentHp = pokemon.currentHp ?? maxHp;
    return { ...pokemon, currentHp: Math.min(maxHp, currentHp + Math.ceil(maxHp * percentage)) };
  });
}

function makeReward(type, context, random) {
  const id = `${type}-${context.node.id}-${Math.floor(boundedRandom(random) * 1_000_000)}`;
  switch (type) {
    case REWARD_TYPES.HEAL:
      return { id, type, label: 'HEAL', title: 'Field Medicine', description: 'Restore 30% HP to all Pokémon.', healPercent: 0.3 };
    case REWARD_TYPES.MOVE_UPGRADE:
      return { id, type, label: 'MOVE UPGRADE', title: 'Move Tutor', description: 'Upgrade one existing move.', requiresTarget: 'move' };
    case REWARD_TYPES.CATCH:
      return { id, type, label: 'CATCH', title: 'Capture Opportunity', description: 'Attempt to catch the defeated Pokémon.', pokemon: context.defeatedPokemon, captureChance: context.node.type === 'rare' ? 0.75 : 0.55 };
    case REWARD_TYPES.ITEM: {
      const item = choose(HELD_ITEMS, random);
      return { id, type, label: 'ITEM', title: item.name, description: `Receive ${item.name}: ${item.description}`, item };
    }
    case REWARD_TYPES.CURRENCY:
      return { id, type, label: 'CURRENCY', title: 'Trainer Stash', description: 'Receive 75 PokéDollars.', amount: 75 };
    default:
      throw new Error(`Unknown reward type: ${type}`);
  }
}

/** Creates four mutually exclusive post-encounter rewards without touching UI state. */
export function generateRewardChoices({ run, node, defeatedPokemon = null, random = Math.random }) {
  const types = [REWARD_TYPES.HEAL, REWARD_TYPES.MOVE_UPGRADE, REWARD_TYPES.ITEM, REWARD_TYPES.CURRENCY];
  if (defeatedPokemon) types[3] = REWARD_TYPES.CATCH;

  return types.map((type) => makeReward(type, { run, node, defeatedPokemon }, random));
}

/**
 * Applies the selected reward immutably. `target` is only needed for a move
 * upgrade: { pokemonId, moveIndex }. The result includes a player-facing log.
 */
export function applyReward(run, rewardId, { target, random = Math.random } = {}) {
  const reward = run.pendingRewards?.find((choice) => choice.id === rewardId);
  if (!reward) throw new Error('That reward is not available for this encounter.');

  let nextRun = { ...run, pendingRewards: [], rewardHistory: [...run.rewardHistory, reward] };
  let message = reward.description;

  if (reward.type === REWARD_TYPES.HEAL) {
    nextRun = { ...nextRun, party: healParty(nextRun.party, reward.healPercent) };
  }

  if (reward.type === REWARD_TYPES.MOVE_UPGRADE) {
    const pokemon = nextRun.party.find((member) => member.id === target?.pokemonId) ?? nextRun.party[0];
    const moveIndex = target?.moveIndex ?? 0;
    const move = pokemon?.moves?.[moveIndex];
    if (!pokemon || !move) throw new Error('Choose a Pokémon move to upgrade.');
    const moveName = typeof move === 'string' ? move : move.name;
    const upgradedPokemon = {
      ...pokemon,
      moveUpgrades: { ...pokemon.moveUpgrades, [moveName]: (pokemon.moveUpgrades?.[moveName] ?? 0) + 1 },
    };
    nextRun = { ...nextRun, party: nextRun.party.map((member) => member.id === pokemon.id ? upgradedPokemon : member) };
    message = `${moveName.replaceAll('-', ' ')} was upgraded!`;
  }

  if (reward.type === REWARD_TYPES.ITEM) {
    nextRun = { ...nextRun, heldItems: [...nextRun.heldItems, reward.item] };
  }

  if (reward.type === REWARD_TYPES.CURRENCY) {
    nextRun = { ...nextRun, money: nextRun.money + reward.amount };
  }

  if (reward.type === REWARD_TYPES.CATCH) {
    const caught = boundedRandom(random) < reward.captureChance;
    if (caught && nextRun.party.length < 6) {
      nextRun = { ...nextRun, party: [...nextRun.party, { ...reward.pokemon, currentHp: reward.pokemon.stats.hp }] };
      message = `Gotcha! ${reward.pokemon.name} joined your run.`;
    } else {
      message = caught ? 'Your party is full. The Pokémon fled.' : `${reward.pokemon.name} escaped.`;
    }
  }

  return { run: nextRun, reward, message };
}
