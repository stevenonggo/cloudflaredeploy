export default function MoveButton({ move, onClick, disabled = false }) {
  const name = typeof move === 'string' ? move : move.name;
  return <button type="button" className="move-button" onClick={() => onClick(move)} disabled={disabled}>{name.replaceAll('-', ' ')}</button>;
}
