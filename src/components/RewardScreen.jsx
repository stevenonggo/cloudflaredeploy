export default function RewardScreen({ rewards, onChoose }) {
  return <section className="retro-panel reward-screen"><p className="pixel-kicker">BATTLE WON!</p><h1>CHOOSE A REWARD</h1><div className="reward-grid">{rewards.map((reward) => <button type="button" key={reward.id} className="reward-card" onClick={() => onChoose(reward)}><b>▶ {reward.label}</b><strong>{reward.title}</strong><span>{reward.description}</span></button>)}</div></section>;
}
