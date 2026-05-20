import { useEffect, useState } from 'react';
import type { ArenaAction, ArenaBattle, BattleEvent } from '../../types';
import { FighterCard } from './FighterCard';
import { Button } from '../ui/Button';

export function BattleArena({
  battle,
  lastEvents,
  isActing,
  onAction,
  onForfeit,
}: {
  battle: ArenaBattle;
  lastEvents: BattleEvent[];
  isActing: boolean;
  onAction: (action: ArenaAction) => void;
  onForfeit: () => void;
}) {
  const [playerAnim, setPlayerAnim] = useState<'lunge' | 'shake' | null>(null);
  const [opponentAnim, setOpponentAnim] = useState<'lunge' | 'shake' | null>(null);
  const [playerHit, setPlayerHit] = useState(false);
  const [opponentHit, setOpponentHit] = useState(false);
  const [floaters, setFloaters] = useState<Array<{ id: number; side: 'player' | 'opponent'; text: string }>>([]);

  useEffect(() => {
    if (lastEvents.length === 0) return;

    let id = Date.now();
    for (const ev of lastEvents) {
      if (ev.actor === 'player') {
        setPlayerAnim(ev.damage > 0 ? 'lunge' : null);
        if (ev.damage > 0) {
          setOpponentHit(true);
          setFloaters((f) => [...f, { id: id++, side: 'opponent', text: `-${ev.damage}` }]);
        }
      } else {
        setOpponentAnim(ev.damage > 0 ? 'lunge' : null);
        if (ev.damage > 0) {
          setPlayerHit(true);
          setFloaters((f) => [...f, { id: id++, side: 'player', text: `-${ev.damage}` }]);
        }
      }
    }

    const t = window.setTimeout(() => {
      setPlayerAnim(null);
      setOpponentAnim(null);
      setPlayerHit(false);
      setOpponentHit(false);
    }, 650);

    const t2 = window.setTimeout(() => setFloaters([]), 1200);

    return () => {
      clearTimeout(t);
      clearTimeout(t2);
    };
  }, [lastEvents]);

  const modeLabel =
    battle.mode === 'duel' ? 'Duel' : battle.mode === 'team' ? 'Team 3v3' : `Tournament R${battle.tournament?.round ?? 1}`;

  return (
    <section className="battle-arena game-panel">
      <div className="battle-arena__header">
        <span className="battle-arena__mode">{modeLabel}</span>
        <span className="muted">Turn {battle.turnNumber}</span>
        <Button variant="ghost" onClick={onForfeit} disabled={isActing}>
          Forfeit
        </Button>
      </div>

      {battle.mode === 'team' && battle.playerTeam.length > 0 && (
        <div className="team-roster muted">
          Your team: {battle.playerTeam.map((f) => f.name).join(' · ')}
        </div>
      )}

      {battle.tournament && (
        <div className="tournament-bracket-mini">
          {battle.tournament.bracketOpponentIds.map((id, i) => (
            <span
              key={id}
              className={
                i === battle.tournament!.currentOpponentIndex
                  ? 'bracket-slot bracket-slot--active'
                  : i < battle.tournament!.currentOpponentIndex
                    ? 'bracket-slot bracket-slot--done'
                    : 'bracket-slot'
              }
            >
              Round {i + 1}
            </span>
          ))}
          <span className="bracket-slot bracket-slot--final">Champion</span>
        </div>
      )}

      <div className="battle-stage">
        <div className="battle-stage__embers" aria-hidden />
        <FighterCard
          fighter={battle.player}
          side="player"
          animating={playerAnim}
          hitFlash={playerHit}
        />
        <div className="battle-stage__vs">VS</div>
        <FighterCard
          fighter={battle.opponent}
          side="opponent"
          animating={opponentAnim}
          hitFlash={opponentHit}
        />
        {floaters.map((f) => (
          <span key={f.id} className={`damage-float damage-float--${f.side}`}>
            {f.text}
          </span>
        ))}
      </div>

      <div className="battle-actions">
        <Button disabled={isActing} onClick={() => onAction('strike')} className="battle-btn battle-btn--strike">
          ⚔ Strike
        </Button>
        <Button disabled={isActing} onClick={() => onAction('defend')} className="battle-btn battle-btn--defend">
          🛡 Defend
        </Button>
        <Button disabled={isActing} onClick={() => onAction('rally')} className="battle-btn battle-btn--rally">
          📯 Rally
        </Button>
      </div>

      <div className="battle-log">
        <strong>Battle log</strong>
        <ul>
          {[...battle.log].reverse().slice(0, 8).map((line, i) => (
            <li key={`${i}-${line.slice(0, 20)}`}>{line}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
