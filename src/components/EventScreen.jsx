const EVENT_COPY = {
  'Lost backpack': 'A lost backpack rustles in the tall grass...',
  'Suspicious shrine': 'An old shrine hums with a faint light.',
  'Fork in the woods': 'The forest path splits around a strange tree.',
};

export default function EventScreen({ encounter, onResolve }) {
  const options = ['Investigate', 'Ignore', 'Use Repel'];
  const [choice, setChoice] = useState(null);
  const consequence = { Investigate: 'You found a useful trail. A reward awaits!', Ignore: 'You move on carefully. A small reward awaits.', 'Use Repel': 'The wild sounds fade. You saved your strength.' };
  return <section className="retro-panel event-screen"><p className="pixel-kicker">MYSTERY EVENT</p><p className="dialogue">{choice ? consequence[choice] : EVENT_COPY[encounter.event] ?? 'Something unusual is nearby...'}</p>{choice ? <button type="button" className="button" onClick={() => onResolve(choice)}>▶ CONTINUE</button> : <div className="retro-menu">{options.map((option, index) => <button type="button" key={option} onClick={() => setChoice(option)}>{index === 0 ? '▶ ' : '　'}{option}</button>)}</div>}</section>;
}
import { useState } from 'react';
