import { Link } from 'react-router-dom';
import { useFavorites } from '../hooks/useFavorites';
import { CharacterCard } from '../components/CharacterCard';
import { Button } from '../components/ui/Button';
import { FavoriteButton } from '../components/FavoriteButton';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import type { CharacterListItem } from '../types';

export function FavoritesPage() {
  const { favorites, isLoading, toggleFavorite } = useFavorites();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Your Court</h1>
        <p>Characters saved to your account.</p>
        <Link to="/arena">
          <Button>Enter the Arena</Button>
        </Link>
      </header>

      {isLoading && <LoadingSpinner label="Loading favorites" />}

      {!isLoading && favorites.length === 0 && (
        <EmptyState
          title="No favorites yet"
          description="Explore the Character Hub and add characters to your court."
          action={
            <Link to="/explorer">
              <Button>Browse characters</Button>
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
          return (
            <CharacterCard
              key={f.id}
              character={asListItem}
              trailing={
                <FavoriteButton
                  isFavorite
                  onClick={(e) => {
                    e.stopPropagation();
                    void toggleFavorite(f.characterId, f.characterName);
                  }}
                />
              }
            />
          );
        })}
      </div>
    </div>
  );
}
