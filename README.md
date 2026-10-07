# Pokémon Web Game

React + Vite foundation for a browser Pokémon-style RPG using [PokéAPI](https://pokeapi.co/api/v2/).

## Current milestone

- Starter selection for Bulbasaur, Charmander, and Squirtle
- Cached, normalised PokéAPI data (memory + seven-day `localStorage` cache)
- Persistent player save with party, active Pokémon, inventory, XP, level, and money
- Routes for home, starter selection, game, battle, and party
- Reusable Pokémon, health, move, and battle UI components
- Pure turn-based battle engine and wild encounter screen
- UI-independent roguelike run engine: branching 5–8 encounter routes, boss nodes, rewards, and permanent progression

## Roguelike engine API

The current roguelike milestone is intentionally framework-free. Use
`createRun`, `getAvailableBranches`, `chooseBranch`, `resolveEncounter`, and
`claimRunReward` from `src/game/run.js` to drive a future map UI. Routes expose
safe and risky node choices, route weather/modifiers, wild/trainer/elite/rare
encounters, shops, heals, mystery events, and a boss. A run ends only when the
entire party faints or the final boss route is cleared.

## Run

```bash
npm install
npm run dev
```
