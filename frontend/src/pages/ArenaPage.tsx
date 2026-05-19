import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useArena } from '../hooks/useArena';
import { useFavorites } from '../hooks/useFavorites';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { BattleArena } from '../components/arena/BattleArena';
import { LoadoutPanel } from '../components/arena/LoadoutPanel';
import { VictoryModal } from '../components/arena/VictoryModal';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { ArenaMode, CharacterListItem } from '../types';

export function ArenaPage() {
  const { token } = useAuth();
  const [searchParams] = useSearchParams();
  const { favorites } = useFavorites();
  const {
    profile,
    battle,
    lastEvents,
    matchResult,
    isLoading,
    isActing,
    startBattle,
    submitTurn,
    forfeit,
    updateLoadout,
    clearMatchResult,
    refresh,
  } = useArena();

  const [mode, setMode] = useState<ArenaMode>('duel');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [teamIds, setTeamIds] = useState<number[]>([]);
  const [opponentId, setOpponentId] = useState<number | null>(null);
  const [popular, setPopular] = useState<CharacterListItem[]>([]);
  const [starting, setStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const urlOpponent = searchParams.get('opponent');
  const urlPlayer = searchParams.get('player');
  const urlMode = searchParams.get('mode') as ArenaMode | null;

  useEffect(() => {
    if (urlMode && ['duel', 'team', 'tournament'].includes(urlMode)) setMode(urlMode);
    if (urlPlayer) setSelectedId(parseInt(urlPlayer, 10));
    if (urlOpponent) setOpponentId(parseInt(urlOpponent, 10));
  }, [urlMode, urlPlayer, urlOpponent]);

  useEffect(() => {
    if (!token) return;
    api.getPopularCharacters(token).then(setPopular).catch(() => {});
  }, [token]);

  useEffect(() => {
    if (favorites.length > 0 && !selectedId) {
      setSelectedId(favorites[0].characterId);
    }
  }, [favorites, selectedId]);

  async function handleStart() {
    if (!selectedId) {
      setError('Select your champion first');
      return;
    }
    const resolvedTeam =
      mode === 'team'
        ? [...new Set([selectedId, ...teamIds])].filter(Boolean).slice(0, 3)
        : [];
    if (mode === 'team' && resolvedTeam.length < 3) {
      setError('Select 3 fighters for team battle');
      return;
    }
    setError(null);
    setStarting(true);
    try {
      await startBattle({
        mode,
        playerCharacterId: selectedId,
        opponentCharacterId: mode === 'duel' ? opponentId ?? undefined : undefined,
        playerTeamIds: mode === 'team' ? resolvedTeam : undefined,
      });
    } catch {
      setError('Failed to start battle.');
    } finally {
      setStarting(false);
    }
  }

  function toggleTeamId(id: number) {
    setTeamIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return [...prev.slice(1), id];
      return [...prev, id];
    });
  }

  if (isLoading) return <LoadingSpinner label="Entering the Arena" />;

  return (
    <div className="page page--arena">
      <header className="page-header">
        <h1>The Arena</h1>
        <p>Turn-based combat — Strike, Defend, or Rally each turn.</p>
      </header>

      {matchResult && (
        <VictoryModal
          won={matchResult.winnerSide === 'player'}
          summary={matchResult.summary}
          onContinue={() => {
            clearMatchResult();
            void refresh();
          }}
        />
      )}

      {battle && battle.status === 'active' ? (
        <BattleArena
          battle={battle}
          lastEvents={lastEvents}
          isActing={isActing}
          onAction={(a) => {
            submitTurn(a).catch((err) =>
              setError(err instanceof Error ? err.message : 'Turn failed'),
            );
          }}
          onForfeit={() => void forfeit()}
        />
      ) : (
        <>
          <div className="arena-mode-tabs">
            {(['duel', 'team', 'tournament'] as ArenaMode[]).map((m) => (
              <button
                key={m}
                type="button"
                className={`arena-mode-tab ${mode === m ? 'arena-mode-tab--active' : ''}`}
                onClick={() => setMode(m)}
              >
                {m === 'duel' ? '1v1 Duel' : m === 'team' ? '3v3 Team' : 'Tournament'}
              </button>
            ))}
          </div>

          {profile && (
            <LoadoutPanel
              houseBonus={profile.loadout.houseBonus}
              trait={profile.loadout.trait}
              onSave={(l) => void updateLoadout(l)}
            />
          )}

          <section className="champion-select game-panel">
            <h3>Choose your champion</h3>
            {favorites.length === 0 ? (
              <p className="muted">
                <Link to="/explorer">Add characters to your court</Link> first.
              </p>
            ) : (
              <div className="champion-chips">
                {favorites.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`champion-chip ${selectedId === f.characterId ? 'champion-chip--active' : ''}`}
                    onClick={() => setSelectedId(f.characterId)}
                  >
                    {f.characterName}
                  </button>
                ))}
              </div>
            )}

            {mode === 'team' && favorites.length > 0 && (
              <div className="team-pick">
                <p className="muted">Team ({teamIds.length}/3)</p>
                <div className="champion-chips">
                  {favorites.map((f) => (
                    <button
                      key={`team-${f.id}`}
                      type="button"
                      className={`champion-chip ${teamIds.includes(f.characterId) ? 'champion-chip--active' : ''}`}
                      onClick={() => toggleTeamId(f.characterId)}
                    >
                      {f.characterName}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {mode === 'duel' && (
              <div className="opponent-pick">
                <p className="muted">Opponent (optional)</p>
                <div className="champion-chips">
                  <button
                    type="button"
                    className={`champion-chip ${!opponentId ? 'champion-chip--active' : ''}`}
                    onClick={() => setOpponentId(null)}
                  >
                    Random
                  </button>
                  {popular.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className={`champion-chip ${opponentId === c.id ? 'champion-chip--active' : ''}`}
                      onClick={() => setOpponentId(c.id)}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {error && <p className="form-error">{error}</p>}

            <Button onClick={() => void handleStart()} disabled={starting || !selectedId}>
              {starting ? 'Starting…' : 'Start battle'}
            </Button>
          </section>
        </>
      )}
    </div>
  );
}
