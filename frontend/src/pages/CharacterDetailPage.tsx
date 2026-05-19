import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { WikiArticleCard } from '../components/WikiArticleCard';
import { FavoriteButton } from '../components/FavoriteButton';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Button } from '../components/ui/Button';
import type { Character } from '../types';

export function CharacterDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [character, setCharacter] = useState<Character | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const characterId = parseInt(id ?? '', 10);

  useEffect(() => {
    if (!token || Number.isNaN(characterId)) return;
    setIsLoading(true);
    api
      .getCharacter(token, characterId)
      .then(setCharacter)
      .catch(() => setError('Character not found'))
      .finally(() => setIsLoading(false));
  }, [token, characterId]);

  if (isLoading) return <LoadingSpinner label="Loading character" />;
  if (error || !character) {
    return (
      <div className="page">
        <p className="form-error">{error ?? 'Not found'}</p>
        <Link to="/explorer">← Back to Hub</Link>
      </div>
    );
  }

  const fields = [
    ['Culture', character.culture],
    ['Gender', character.gender],
    ['Born', character.born],
    ['Died', character.died],
    ['Status', character.status],
    ['Played by', character.playedBy.join(', ') || '—'],
  ];

  return (
    <div className="page detail-page">
      <Link to="/explorer" className="back-link">
        ← Character Hub
      </Link>

      <header className="detail-hero">
        {character.imageUrl && (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="detail-portrait"
          />
        )}
        <div>
          <h1>{character.name}</h1>
          {character.titles.length > 0 && (
            <p className="detail-titles">{character.titles.join(' · ')}</p>
          )}
          <div className="detail-actions">
            <FavoriteButton
              isFavorite={isFavorite(characterId)}
              onClick={() => {
                void toggleFavorite(characterId, character.name);
              }}
            />
            <Button
              variant="secondary"
              onClick={() => navigate(`/arena?mode=duel&opponent=${characterId}`)}
            >
              ⚔ Challenge in Arena
            </Button>
          </div>
        </div>
      </header>

      <div className="grid-2">
        <Card title="Saga details">
          <dl className="detail-grid">
            {fields.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        <Card title="Appearances">
          <p>
            <strong>Books:</strong> {character.books.length || '—'}
          </p>
          <p>
            <strong>POV chapters:</strong> {character.povBooks.length || '—'}
          </p>
          <p>
            <strong>TV series:</strong>{' '}
            {character.tvSeries.length ? character.tvSeries.join(', ') : '—'}
          </p>
          {character.aliases.length > 0 && (
            <p>
              <strong>Aliases:</strong> {character.aliases.join(', ')}
            </p>
          )}
        </Card>
      </div>

      <section className="wiki-section">
        <h2>From Wiki of Thrones</h2>
        <p className="muted">
          Lore, news, and deep dives from{' '}
          <a href="https://wikiofthrones.com/" target="_blank" rel="noreferrer">
            wikiofthrones.com
          </a>
        </p>
        {character.wikiArticles && character.wikiArticles.length > 0 ? (
          <div className="wiki-grid">
            {character.wikiArticles.map((article) => (
              <WikiArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <p className="muted">No matching articles found for this character yet.</p>
        )}
      </section>
    </div>
  );
}
