const API_BASE_URL = 'https://pokeapi.co/api/v2';
const CACHE_PREFIX = 'pokemon-web-game:pokemon:';
const CACHE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const memoryCache = new Map();

function readCache(key) {
  const cached = memoryCache.get(key);
  if (cached) return cached;

  try {
    const stored = JSON.parse(localStorage.getItem(`${CACHE_PREFIX}${key}`));
    if (stored?.expiresAt > Date.now() && stored.data) {
      memoryCache.set(key, stored.data);
      return stored.data;
    }
    localStorage.removeItem(`${CACHE_PREFIX}${key}`);
  } catch {
    // Storage can be unavailable or contain stale data. Fetch a fresh copy below.
  }

  return null;
}

function cachePokemon(key, pokemon) {
  memoryCache.set(key, pokemon);
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${key}`,
      JSON.stringify({ data: pokemon, expiresAt: Date.now() + CACHE_DURATION_MS }),
    );
  } catch {
    // The in-memory cache still prevents duplicate requests during this session.
  }
}

function normalisePokemon(data) {
  const stat = (name) => data.stats.find((entry) => entry.stat.name === name)?.base_stat ?? 1;

  return {
    id: data.id,
    name: data.name,
    image: data.sprites.other?.['official-artwork']?.front_default || data.sprites.front_default,
    sprite: data.sprites.front_default || data.sprites.other?.['official-artwork']?.front_default,
    types: data.types.map(({ type }) => type.name),
    baseStats: {
      hp: stat('hp'),
      attack: stat('attack'),
      defense: stat('defense'),
      specialAttack: stat('special-attack'),
      specialDefense: stat('special-defense'),
      speed: stat('speed'),
    },
    stats: { hp: stat('hp'), attack: stat('attack'), defense: stat('defense'), speed: stat('speed') },
    ability: data.abilities.find(({ is_hidden: hidden }) => !hidden)?.ability.name ?? 'unknown',
    moves: data.moves.slice(0, 4).map(({ move }) => move.name),
  };
}

/** Fetches one Pokémon and stores a normalised, time-limited copy locally. */
export async function getPokemon(identifier) {
  const key = String(identifier).toLowerCase();
  const cached = readCache(key);
  if (cached) return cached;

  const response = await fetch(`${API_BASE_URL}/pokemon/${encodeURIComponent(key)}`);
  if (!response.ok) {
    throw new Error(`Could not load ${key} (PokéAPI returned ${response.status}).`);
  }

  const pokemon = normalisePokemon(await response.json());
  cachePokemon(key, pokemon);
  return pokemon;
}

export function getStarterPokemon() {
  return Promise.all(['bulbasaur', 'charmander', 'squirtle'].map(getPokemon));
}
