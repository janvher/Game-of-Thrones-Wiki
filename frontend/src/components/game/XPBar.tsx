import type { CourtProgress } from '../../types';

export function XPBar({ progress }: { progress: CourtProgress }) {
  const pct = Math.min(100, Math.round((progress.xpIntoLevel / progress.xpForNextLevel) * 100));

  return (
    <div className="xp-bar">
      <div className="xp-bar__header">
        <span className="xp-bar__level">Level {progress.level}</span>
        <span className="xp-bar__xp">
          {progress.xpIntoLevel} / {progress.xpForNextLevel} XP
        </span>
      </div>
      <div className="xp-bar__track" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}>
        <div className="xp-bar__fill" style={{ width: `${pct}%` }} />
      </div>
      <p className="xp-bar__total muted">{progress.xp.toLocaleString()} total renown</p>
    </div>
  );
}
