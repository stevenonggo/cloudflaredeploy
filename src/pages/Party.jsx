import { Link } from 'react-router-dom';
import { useSyncExternalStore } from 'react';
import { gameStore } from '../store/gameStore';

export default function Party() {
  const game = useSyncExternalStore(gameStore.subscribe, gameStore.getState, gameStore.getState);
  return <main className="page"><section className="party-screen"><header><span>PARTY</span><Link to="/game">×</Link></header><div className="party-list">{Array.from({ length: 6 }, (_, index) => { const pokemon = game.party[index]; return pokemon ? <div className="party-row" key={pokemon.id}><img src={pokemon.sprite ?? pokemon.image} alt="" /><b>{pokemon.name.toUpperCase()}</b><span>Lv. {pokemon.level ?? game.level}</span><em>HP {pokemon.currentHp ?? pokemon.stats.hp}/{pokemon.stats.hp}</em></div> : <div className="party-row party-row--empty" key={index}>— EMPTY —</div>; })}</div><p>▶ SELECT A POKéMON</p></section></main>;
}
