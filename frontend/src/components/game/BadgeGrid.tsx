import type { Achievement } from '../../types';

export function BadgeGrid({ achievements }: { achievements: Achievement[] }) {
  return (
    <div className="badge-grid">
      {achievements.map((a) => (
        <div
          key={a.id}
          className={`badge-card ${a.unlocked ? 'badge-card--unlocked' : 'badge-card--locked'}`}
          title={a.description}
        >
          <span className="badge-card__icon" aria-hidden>
            {a.icon}
          </span>
          <div className="badge-card__body">
            <strong>{a.name}</strong>
            <p className="muted">{a.description}</p>
            {!a.unlocked && (
              <div className="badge-card__progress">
                <div
                  className="badge-card__progress-fill"
                  style={{ width: `${Math.round((a.progress / a.target) * 100)}%` }}
                />
              </div>
            )}
            <span className="badge-card__stat">
              {a.unlocked ? 'Unlocked' : `${a.progress}/${a.target}`}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
