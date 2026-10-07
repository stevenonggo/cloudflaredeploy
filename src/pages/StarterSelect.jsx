import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PokemonCard from '../components/PokemonCard';
import { getStarterPokemon } from '../services/pokeapi';
import { gameStore } from '../store/gameStore';

export default function StarterSelect() {
  const navigate = useNavigate();
  const [starters, setStarters] = useState([]);
  const [selectedStarter, setSelectedStarter] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getStarterPokemon()
      .then((pokemon) => active && setStarters(pokemon))
      .catch((reason) => active && setError(reason.message));
    return () => { active = false; };
  }, []);

  function beginAdventure() {
    if (!selectedStarter) return;
    gameStore.chooseStarter(selectedStarter);
    navigate('/game');
  }

  return (
    <main className="page starter-page">
      <header className="page-header"><p className="eyebrow">PROFESSOR’S LAB</p><h1>CHOOSE YOUR PARTNER</h1><p>Three Poké Balls await on the lab bench.</p></header>
      {error && <div className="notice notice--error" role="alert">{error} Check your connection and refresh to try again.</div>}
      {!error && starters.length === 0 && <p className="loading" role="status">Opening the Pokédex…</p>}
      <section className="starter-grid" aria-label="Starter Pokémon">
        {starters.map((pokemon) => <PokemonCard key={pokemon.id} pokemon={pokemon} selected={selectedStarter?.id === pokemon.id} onSelect={setSelectedStarter} />)}
      </section>
      {selectedStarter && <div className="starter-confirm"><span>▶ CHOOSE {selectedStarter.name.toUpperCase()}?</span><button type="button" className="button button--large" onClick={beginAdventure}>YES · BEGIN</button></div>}
    </main>
  );
}
