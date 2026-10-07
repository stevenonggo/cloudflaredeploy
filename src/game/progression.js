export const initialProgression = Object.freeze({
  runsCompleted: 0,
  bossesDefeated: 0,
  unlocks: [],
});

const MILESTONE_UNLOCKS = [
  { threshold: 1, id: 'rare-radar', name: 'Rare Radar', description: 'Rare Pokémon nodes become more common.' },
  { threshold: 2, id: 'double-modifiers', name: 'Route Scanner', description: 'Routes can have two modifiers.' },
  { threshold: 3, id: 'elite-badge', name: 'Elite Badge', description: 'Elite routes offer better rewards.' },
];

export function recordCompletedRun(progression = initialProgression, bossesDefeated = 1) {
  const runsCompleted = progression.runsCompleted + 1;
  const newUnlocks = MILESTONE_UNLOCKS.filter((unlock) => unlock.threshold <= runsCompleted && !progression.unlocks.includes(unlock.id));
  return {
    ...progression,
    runsCompleted,
    bossesDefeated: progression.bossesDefeated + bossesDefeated,
    unlocks: [...progression.unlocks, ...newUnlocks.map((unlock) => unlock.id)],
    newlyUnlocked: newUnlocks,
  };
}
