import type { ArenaFighter } from '../../types';

export function FighterCard({
  fighter,
  side,
  animating,
  hitFlash,
}: {
  fighter: ArenaFighter;
  side: 'player' | 'opponent';
  animating?: 'lunge' | 'shake' | null;
  hitFlash?: boolean;
}) {
  const hpPct = Math.max(0, Math.round((fighter.hp / fighter.maxHp) * 100));

  return (
    <div
      className={`fighter-card fighter-card--${side} ${animating ? `fighter-card--${animating}` : ''} ${hitFlash ? 'fighter-card--hit' : ''}`}
    >
      <img
        src={fighter.imageUrl ?? '/icon.svg'}
        alt={fighter.name}
        className="fighter-card__portrait"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/icon.svg';
        }}
      />
      <h3 className="fighter-card__name">{fighter.name}</h3>
      <p className="fighter-card__meta muted">
        {fighter.house ?? fighter.culture} · ATK {fighter.attack} · DEF {fighter.defense}
      </p>
      <div className="hp-bar">
        <div className="hp-bar__fill" style={{ width: `${hpPct}%` }} />
      </div>
      <span className="hp-bar__text">
        {fighter.hp} / {fighter.maxHp} HP
      </span>
    </div>
  );
}
