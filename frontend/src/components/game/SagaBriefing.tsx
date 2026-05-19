import { Link } from 'react-router-dom';
import type { CourtBriefing, CourtProgress } from '../../types';
import { XPBar } from './XPBar';
import { Button } from '../ui/Button';

export function SagaBriefing({
  briefing,
  progress,
}: {
  briefing: CourtBriefing;
  progress: CourtProgress;
}) {
  return (
    <section className="saga-briefing game-panel">
      <div className="saga-briefing__hero">
        <div>
          <p className="saga-briefing__eyebrow">Saga briefing</p>
          <h2>{briefing.greeting}</h2>
          <p className="saga-briefing__summary">{briefing.summary}</p>
          {briefing.lastVisitedLabel && (
            <p className="muted">
              Last visited:{' '}
              {briefing.lastVisitedPath?.startsWith('/characters/') ? (
                <Link to={briefing.lastVisitedPath}>{briefing.lastVisitedLabel}</Link>
              ) : (
                <Link to={briefing.lastVisitedPath ?? '/dashboard'}>{briefing.lastVisitedLabel}</Link>
              )}
            </p>
          )}
        </div>
        <div className="saga-briefing__stats">
          <div className="stat-pill">
            <span className="stat-pill__value">{progress.courtSize}</span>
            <span className="stat-pill__label">Court</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__value">{progress.uniqueHouses}</span>
            <span className="stat-pill__label">Houses</span>
          </div>
          <div className="stat-pill">
            <span className="stat-pill__value">{progress.unlockedCount}</span>
            <span className="stat-pill__label">Badges</span>
          </div>
        </div>
      </div>

      <XPBar progress={progress} />

      {briefing.nextGoal && (
        <div className="quest-card">
          <span className="quest-card__label">Active quest</span>
          <strong>{briefing.nextGoal.name}</strong>
          <p className="muted">{briefing.nextGoal.description}</p>
          <div className="quest-card__bar">
            <div
              className="quest-card__fill"
              style={{
                width: `${Math.round((briefing.nextGoal.progress / briefing.nextGoal.target) * 100)}%`,
              }}
            />
          </div>
          <span className="quest-card__progress">
            {briefing.nextGoal.progress} / {briefing.nextGoal.target}
          </span>
        </div>
      )}

      {briefing.recommendedCharacter && (
        <div className="recommend-card">
          <div>
            <span className="quest-card__label">Recommended recruit</span>
            <strong>{briefing.recommendedCharacter.name}</strong>
            <p className="muted">{briefing.recommendedCharacter.reason}</p>
          </div>
          <Link to={`/characters/${briefing.recommendedCharacter.id}`}>
            <Button>View dossier</Button>
          </Link>
        </div>
      )}
    </section>
  );
}
