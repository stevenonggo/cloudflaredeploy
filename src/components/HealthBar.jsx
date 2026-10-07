export default function HealthBar({ current, max, label = 'HP' }) {
  const percentage = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  const status = percentage > 50 ? 'good' : percentage > 20 ? 'caution' : 'danger';

  return (
    <div className="health-bar" aria-label={`${label}: ${current} out of ${max}`}>
      <div className="health-bar__label"><span>{label}</span><span>{current}/{max}</span></div>
      <div className="health-bar__track"><div className={`health-bar__value health-bar__value--${status}`} style={{ width: `${percentage}%` }} /></div>
    </div>
  );
}
