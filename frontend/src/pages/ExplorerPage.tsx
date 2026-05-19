import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { CharacterCard } from '../components/CharacterCard';
import { FavoriteButton } from '../components/FavoriteButton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { dedupeCharacters } from '../utils/dedupeCharacters';
import type { CharacterListItem } from '../types';

const CHARACTERS_PER_PAGE = 9;

export function ExplorerPage() {
  const { token } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const [characters, setCharacters] = useState<CharacterListItem[]>([]);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [hasPrev, setHasPrev] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const requestPage = page;
      const requestSearch = search;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getCharacters(
          token,
          requestPage,
          requestSearch || undefined,
          CHARACTERS_PER_PAGE,
        );
        if (cancelled) return;
        const unique = dedupeCharacters(data.results).slice(0, CHARACTERS_PER_PAGE);
        setCharacters(unique);
        setHasNext(data.hasNext);
        setHasPrev(data.hasPrevious);
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof ApiError ? err.message : 'Failed to load characters from the saga',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, page, search]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Character Hub</h1>
        <p>
          Full saga roster from An API of Ice and Fire, with lore links from{' '}
          <a href="https://wikiofthrones.com/" target="_blank" rel="noreferrer">
            Wiki of Thrones
          </a>
          . Only characters with portraits are shown (9 per page).
        </p>
      </header>

      <form className="search-bar" onSubmit={handleSearch}>
        <Input
          label="Search characters"
          name="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="e.g. Daenerys, Stark, Lannister"
        />
        <Button type="submit">Search</Button>
      </form>

      {isLoading && <LoadingSpinner label="Summoning characters" />}
      {error && <p className="form-error">{error}</p>}

      {!isLoading && !error && characters.length === 0 && (
        <EmptyState
          title="No characters found"
          description="Try another name, house, or alias from the books or shows."
        />
      )}

      <div className="card-grid card-grid--hub">
        {characters.map((c) => (
          <CharacterCard
            key={`${c.id}-${c.name}`}
            character={c}
            trailing={
              <FavoriteButton
                isFavorite={isFavorite(c.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(c.id, c.name);
                }}
              />
            }
          />
        ))}
      </div>

      <div className="pagination">
        <Button variant="ghost" disabled={!hasPrev} onClick={() => setPage((p) => p - 1)}>
          Previous
        </Button>
        <span>Page {page}</span>
        <Button variant="ghost" disabled={!hasNext} onClick={() => setPage((p) => p + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
