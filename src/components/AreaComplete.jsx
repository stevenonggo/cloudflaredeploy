export default function AreaComplete({ area, run, onContinue }) {
  const cleared = run.history.filter((entry) => entry.type === 'encounter-cleared').length;
  const caught = run.rewardHistory.filter((reward) => reward.type === 'catch').length;
  return <section className="retro-panel area-complete"><p className="pixel-kicker">AREA {area} COMPLETE!</p><div><span>ENCOUNTERS CLEARED</span><b>{cleared}</b></div><div><span>POKéMON CAUGHT</span><b>{caught}</b></div><div><span>COINS EARNED</span><b>¥ {run.money}</b></div><hr /><p>NEW PATH UNLOCKED</p><button type="button" className="button" onClick={onContinue}>▶ CONTINUE</button></section>;
}
