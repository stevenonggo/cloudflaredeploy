export default function PokemonCard({ pokemon, selected = false, onSelect, disabled = false }) {
  return (
    <article className={`pokemon-card ${selected ? 'pokemon-card--selected' : ''}`}>
      <img src={pokemon.sprite ?? pokemon.image} alt={pokemon.name} className="pokemon-card__image" />
      <div className="pokemon-card__content"><p>#{String(pokemon.id).padStart(3, '0')}</p><h2>{pokemon.name}</h2><div className="type-list">{pokemon.types.map((type) => <span key={type} className={`type type--${type}`}>{type}</span>)}</div>{onSelect && <button type="button" onClick={() => onSelect(pokemon)} disabled={disabled}>▶ {selected ? 'SELECTED' : `CHOOSE ${pokemon.name.toUpperCase()}`}</button>}</div>
    </article>
  );
}
