import { Link } from 'react-router-dom';
import { gameStore } from '../store/gameStore';

export default function Home() {
  const hasStarter = Boolean(gameStore.getState().currentPokemon);
  return (
    <main className="landing-page">
      <p className="eyebrow">A small adventure awaits</p>
      <h1>Pokémon<br /><em>Trail</em></h1>
      <p className="landing-page__copy">Choose your first partner and begin your browser-based Pokémon journey.</p>
      <Link className="button button--large" to={hasStarter ? '/game' : '/starter'}>{hasStarter ? 'Continue adventure' : 'Choose your partner'}</Link>
    </main>
  );
}
