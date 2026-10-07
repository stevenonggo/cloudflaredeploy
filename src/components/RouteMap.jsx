import { getAvailableBranches } from '../game/run.js';

const NODE_META = {
  start: ['▶', 'START'], wild: ['♣', 'WILD'], trainer: ['⚔', 'TRAINER'], elite: ['☠', 'ELITE'], mystery: ['?', 'MYSTERY'], shop: ['▣', 'SHOP'], heal: ['+', 'HEAL'], camp: ['⌂', 'CAMP'], treasure: ['◆', 'TREASURE'], rare: ['★', 'RARE'], boss: ['♛', 'BOSS'],
};

export default function RouteMap({ run, onChoose }) {
  const available = new Set(getAvailableBranches(run).map((branch) => branch.nodeId));
  const entered = new Set(run.history.filter((entry) => entry.type === 'node-entered').map((entry) => entry.nodeId));
  const byDepth = run.route.nodes.reduce((groups, node) => ({ ...groups, [node.depth]: [...(groups[node.depth] ?? []), node] }), {});

  return (
    <section className="route-map" aria-label="Route map">
      <div className="route-map__sky"><span>ROUTE {run.area + 1}</span><span>{run.weather.toUpperCase()}</span></div>
      <div className="route-map__scroll">
        {Object.entries(byDepth).map(([depth, nodes]) => (
          <div className="route-map__column" key={depth}>
            {nodes.map((node) => {
              const [icon, label] = NODE_META[node.type] ?? ['•', node.type];
              const isCurrent = node.id === run.currentNodeId;
              const isAvailable = available.has(node.id);
              const isComplete = entered.has(node.id) && !isCurrent;
              return <button key={node.id} type="button" className={`map-node map-node--${node.type} ${isAvailable ? 'map-node--available' : ''} ${isCurrent ? 'map-node--current' : ''} ${isComplete ? 'map-node--complete' : ''}`} disabled={!isAvailable} onClick={() => onChoose(node.id)}><i>{isComplete ? '✓' : icon}</i><span>{label}</span><small>LV {node.difficulty}</small></button>;
            })}
          </div>
        ))}
      </div>
      <p className="route-map__hint">SELECT A HIGHLIGHTED PATH</p>
    </section>
  );
}
