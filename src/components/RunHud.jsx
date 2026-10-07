export default function RunHud({ run }) {
  const currentDepth = run.route.nodes.find((node) => node.id === run.currentNodeId)?.depth ?? 0;
  return (
    <aside className="run-hud" aria-label="Run status">
      <div><span>AREA</span><strong>{run.area + 1}</strong></div>
      <div><span>NODE</span><strong>{currentDepth}/{run.route.encountersPerPath}</strong></div>
      <div className="run-hud__party"><span>PARTY</span>{Array.from({ length: 6 }, (_, index) => <b key={index} title={run.party[index]?.name ?? 'Empty'}>{run.party[index] ? '●' : '○'}</b>)}</div>
      <div><span>¥</span><strong>{run.money}</strong></div>
      <div><span>WX</span><strong>{run.weather.toUpperCase()}</strong></div>
      <div><span>ENG</span><strong>{run.energy}/{run.maxEnergy}</strong></div>
      <div className="run-hud__modifier"><span>MOD</span><strong>{run.routeModifiers[0]?.name ?? 'NONE'}</strong></div>
    </aside>
  );
}
