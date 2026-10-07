import { useSyncExternalStore } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AreaComplete from '../components/AreaComplete';
import EventScreen from '../components/EventScreen';
import RewardScreen from '../components/RewardScreen';
import RouteMap from '../components/RouteMap';
import RunHud from '../components/RunHud';
import ShopScreen from '../components/ShopScreen';
import { chooseBranch, RUN_STATUS } from '../game/run.js';
import { gameStore } from '../store/gameStore';

function RunStart({ onStart, progression }) {
  return <section className="retro-panel run-start"><p className="pixel-kicker">ROGUELIKE EXPEDITION</p><h1>START A RUN</h1><p>Build a team, take risky paths, defeat the route guardians.</p><p className="unlock-line">RUNS CLEARED: {progression.runsCompleted} · UNLOCKS: {progression.unlocks.length}</p><button type="button" className="button button--large" onClick={onStart}>▶ BEGIN EXPEDITION</button></section>;
}

export default function Game() {
  const game = useSyncExternalStore(gameStore.subscribe, gameStore.getState, gameStore.getState);
  const navigate = useNavigate();
  const run = game.run;

  if (!game.currentPokemon) return <main className="page"><h1>No partner yet</h1><Link className="button" to="/starter">Choose a starter</Link></main>;
  if (!run) return <main className="page run-page"><RunStart progression={game.progression} onStart={() => gameStore.startRun()} /></main>;

  function chooseNode(nodeId) {
    const nextRun = chooseBranch(run, nodeId);
    gameStore.setRun(nextRun);
    if (nextRun.activeEncounter.isBattle) navigate('/battle');
  }

  function resolveNonBattle() {
    gameStore.resolveRunEncounter({ victory: true });
  }

  function chooseReward(reward) {
    gameStore.claimRunReward(reward.id, reward.requiresTarget ? { target: { pokemonId: run.party[0]?.id, moveIndex: 0 } } : undefined);
  }

  if (run.areaComplete) return <main className="page run-page"><RunHud run={run} /><AreaComplete area={run.areaComplete.area} run={run} onContinue={() => gameStore.acknowledgeAreaComplete()} /></main>;
  if (run.status === RUN_STATUS.CHOOSING_REWARD) return <main className="page run-page"><RunHud run={run} /><RewardScreen rewards={run.pendingRewards} onChoose={chooseReward} /></main>;
  if (run.status === RUN_STATUS.FAILED) return <main className="page run-page"><section className="retro-panel"><p className="pixel-kicker">RUN OVER</p><h1>YOUR PARTY FAINTED</h1><p>The route remains unconquered. Start another expedition?</p><button className="button" type="button" onClick={() => gameStore.startRun()}>▶ NEW RUN</button></section></main>;
  if (run.status === RUN_STATUS.COMPLETED) return <main className="page run-page"><section className="retro-panel"><p className="pixel-kicker">LEGENDARY RUN!</p><h1>RUN COMPLETE</h1><p>Return to camp to secure your permanent unlocks.</p><button className="button" type="button" onClick={() => gameStore.secureCompletedRun()}>▶ SECURE UNLOCKS</button></section></main>;
  if (run.status === RUN_STATUS.IN_ENCOUNTER && run.activeEncounter?.type === 'mystery') return <main className="page run-page"><RunHud run={run} /><EventScreen encounter={run.activeEncounter} onResolve={resolveNonBattle} /></main>;
  if (run.status === RUN_STATUS.IN_ENCOUNTER && run.activeEncounter?.type === 'shop') return <main className="page run-page"><RunHud run={run} /><ShopScreen encounter={run.activeEncounter} money={run.money} onResolve={resolveNonBattle} /></main>;
  if (run.status === RUN_STATUS.IN_ENCOUNTER && ['heal', 'camp'].includes(run.activeEncounter?.type)) return <main className="page run-page"><RunHud run={run} /><section className="retro-panel"><p className="pixel-kicker">{run.activeEncounter.type === 'camp' ? 'FOREST CAMP' : 'REST STOP'}</p><h1>A QUIET CAMPFIRE</h1><p>REST restores your team’s energy. TRAIN and SCOUT are safer alternatives to battle.</p><button className="button" type="button" onClick={() => { gameStore.setRun({ ...run, energy: run.maxEnergy }); resolveNonBattle(); }}>▶ REST</button><button className="text-button" type="button" onClick={resolveNonBattle}>▶ SCOUT AHEAD</button></section></main>;
  if (run.status === RUN_STATUS.IN_ENCOUNTER && run.activeEncounter?.type === 'treasure') return <main className="page run-page"><RunHud run={run} /><section className="retro-panel"><p className="pixel-kicker">ABANDONED BACKPACK</p><h1>CHOOSE ONE</h1><div className="reward-grid"><button className="reward-card" onClick={() => { gameStore.setRun({ ...run, money: run.money + 250 }); resolveNonBattle(); }}><b>▶ COINS</b><strong>₽250</strong></button><button className="reward-card" onClick={() => { gameStore.setRun({ ...run, inventory: { ...run.inventory, pokeball: (run.inventory?.pokeball ?? 0) + 3 } }); resolveNonBattle(); }}><b>▶ BALLS</b><strong>3× POKé BALL</strong></button></div></section></main>;

  return <main className="page run-page"><RunHud run={run} /><header className="run-page__header"><p className="pixel-kicker">CHOOSE YOUR PATH</p><h1>ROUTE MAP</h1><p>Safe trails conserve your team. Risky trails hide stronger rewards.</p></header><div className="explore-actions"><button type="button" disabled={run.energy < 1} onClick={() => gameStore.exploreRun()}>▶ EXPLORE ({run.energy})</button><Link to="/party">PARTY</Link><span>BAG ITEMS: {Object.values(run.inventory ?? {}).reduce((sum, count) => sum + count, 0)}</span><button type="button">MAP</button></div>{run.explorationMessage && <p className="explore-message">{run.explorationMessage}</p>}<RouteMap run={run} onChoose={chooseNode} /></main>;
}
