import { claimRunReward, collectRunCompletion, createRun, exploreArea, resolveEncounter } from '../game/run.js';
import { initialProgression } from '../game/progression.js';

const STORAGE_KEY = 'pokemon-web-game:save';

export const initialGameState = {
  party: [],
  currentPokemon: null,
  inventory: { pokeball: 5, potion: 2 },
  xp: 0,
  level: 1,
  money: 300,
  run: null,
  progression: initialProgression,
};

function loadGame() {
  try {
    const savedGame = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return savedGame ? { ...initialGameState, ...savedGame } : initialGameState;
  } catch {
    return initialGameState;
  }
}

let state = loadGame();
const subscribers = new Set();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // The game continues in memory when browser storage is unavailable.
  }
}

function publish() {
  persist();
  subscribers.forEach((listener) => listener());
}

export const gameStore = {
  getState: () => state,
  subscribe(listener) {
    subscribers.add(listener);
    return () => subscribers.delete(listener);
  },
  chooseStarter(pokemon) {
    state = {
      ...initialGameState,
      party: [pokemon],
      currentPokemon: pokemon,
    };
    publish();
  },
  setCurrentPokemon(pokemonId) {
    const currentPokemon = state.party.find((pokemon) => pokemon.id === pokemonId) ?? state.currentPokemon;
    state = { ...state, currentPokemon };
    publish();
  },
  updateCurrentPokemon(updatedPokemon) {
    state = {
      ...state,
      currentPokemon: updatedPokemon,
      party: state.party.map((pokemon) => pokemon.id === updatedPokemon.id ? updatedPokemon : pokemon),
    };
    publish();
  },
  usePokeball() {
    const pokeballs = state.inventory.pokeball ?? 0;
    if (pokeballs < 1) return false;

    state = {
      ...state,
      inventory: { ...state.inventory, pokeball: pokeballs - 1 },
    };
    publish();
    return true;
  },
  consumeItem(item) {
    const count = state.inventory[item] ?? 0;
    if (count < 1) return false;
    state = { ...state, inventory: { ...state.inventory, [item]: count - 1 } };
    publish();
    return true;
  },
  capturePokemon(pokemon) {
    state = { ...state, party: [...state.party, pokemon] };
    publish();
  },
  startRun() {
    if (!state.currentPokemon) return false;
    state = { ...state, run: createRun({ starterPokemon: state.currentPokemon, progression: state.progression }) };
    publish();
    return true;
  },
  setRun(run) {
    state = { ...state, run };
    publish();
  },
  resolveRunEncounter(options) {
    if (!state.run) return null;
    const run = resolveEncounter(state.run, options);
    state = { ...state, run };
    publish();
    return run;
  },
  claimRunReward(rewardId, options) {
    if (!state.run) return null;
    const result = claimRunReward(state.run, rewardId, options);
    state = { ...state, run: { ...result.run, explorationMessage: result.result } };
    publish();
    return result;
  },
  acknowledgeAreaComplete() {
    if (!state.run?.areaComplete) return;
    state = { ...state, run: { ...state.run, areaComplete: null } };
    publish();
  },
  secureCompletedRun() {
    if (!state.run) return null;
    const progression = collectRunCompletion(state.run, state.progression);
    state = { ...state, progression, run: null };
    publish();
    return progression;
  },
  exploreRun() {
    if (!state.run) return null;
    const result = exploreArea(state.run);
    state = { ...state, run: result.run };
    publish();
    return result;
  },
};

export function resetGame() {
  state = initialGameState;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore unavailable storage.
  }
  subscribers.forEach((listener) => listener());
}
