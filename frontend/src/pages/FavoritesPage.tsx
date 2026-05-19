import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { useCourtGame } from '../hooks/useCourtGame';
import { CharacterCard } from '../components/CharacterCard';
import { Button } from '../components/ui/Button';
import { FavoriteButton } from '../components/FavoriteButton';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { XPBar } from '../components/game/XPBar';
import { BadgeGrid } from '../components/game/BadgeGrid';
import { CharacterCompare } from '../components/game/CharacterCompare';
import type { CharacterListItem } from '../types';

export function FavoritesPage() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();
  const { progress, isLoading: courtLoading, refresh } = useCourtGame();
  const [compareIds, setCompareIds] = useState<number[]>([]);

  const comparePair = useMemo(() => {
    if (compareIds.length !== 2) return null;
    const left = favorites.find((f) => f.characterId === compareIds[0]);
    const right = favorites.find((f) => f.characterId === compareIds[1]);
    if (!left || !right) return null;
    return { left, right };
  }, [compareIds, favorites]);

  function toggleCompare(id: number) {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
  }

  async function handleToggleFavorite(characterId: number, name: string) {
    await toggleFavorite(characterId, name);
    await refresh();
  }

  return (
    <div className="page page--game">
      <header className="page-header">
        <h1>Your Court</h1>
        <p>
          Build your alliance, earn badges, and duel two allies side-by-side. Select two cards to
          compare.
        </p>
      </header>

      {(isLoading || courtLoading) && <LoadingSpinner label="Loading your court" />}

      {!courtLoading && progress && <XPBar progress={progress} />}

      {comparePair && (
        <CharacterCompare
          left={comparePair.left}
          right={comparePair.right}
          onClear={() => setCompareIds([])}
        />
      )}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          title="Your court awaits its first ally"
          description="Complete the quest: explore the Character Hub and swear your first character."
          action={
            <Link to="/explorer">
              <Button>Start exploring</Button>
            </Link>
          }
        />
      )}

      <div className="card-grid">
        {favorites.map((f) => {
          const asListItem: CharacterListItem = {
            id: f.characterId,
            name: f.characterName,
            gender: f.characterData.gender ?? '—',
            culture: f.characterData.culture ?? '—',
            born: f.characterData.born ?? '—',
            titles: f.characterData.titles ?? [],
            tvSeries: f.characterData.tvSeries ?? [],
            playedBy: f.characterData.playedBy ?? [],
            imageUrl: f.characterData.imageUrl,
          };
          const selected = compareIds.includes(f.characterId);
          return (
            <div key={f.id} className={`court-card-wrap ${selected ? 'court-card-wrap--selected' : ''}`}>
              <label className="compare-select">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => toggleCompare(f.characterId)}
                  onClick={(e) => e.stopPropagation()}
                />
                Compare
              </label>
              <CharacterCard
                character={asListItem}
                trailing={
                  <FavoriteButton
                    isFavorite
                    onClick={(e) => {
                      e.stopPropagation();
                      void handleToggleFavorite(f.characterId, f.characterName);
                    }}
                  />
                }
              />
            </div>
          );
        })}
      </div>

      {!courtLoading && progress && progress.achievements.length > 0 && (
        <section className="badges-section">
          <h2>Your badges</h2>
          <BadgeGrid achievements={progress.achievements} />
        </section>
      )}
    </div>
  );
}
