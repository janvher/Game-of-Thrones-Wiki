import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api, ApiError } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { CharacterCard } from '../components/CharacterCard';
import { FavoriteButton } from '../components/FavoriteButton';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { EmptyState } from '../components/ui/EmptyState';
import { ExplorerFiltersBar } from '../components/game/ExplorerFiltersBar';
import { dedupeCharacters } from '../utils/dedupeCharacters';
import {
  applyExplorerFilters,
  DEFAULT_EXPLORER_FILTERS,
  uniqueCultures,
  type ExplorerFilters,
} from '../utils/characterFilters';
import type { CharacterListItem } from '../types';

const CHARACTERS_PER_PAGE = 9;
const FETCH_SIZE_FILTERED = 50;

export function ExplorerPage() {
  const { token } = useAuth();
  const { isFavorite, toggleFavorite, favorites } = useFavorites();
  const [pool, setPool] = useState<CharacterListItem[]>([]);
  const [apiPage, setApiPage] = useState(1);
  const [clientPage, setClientPage] = useState(1);
  const [hasNextApi, setHasNextApi] = useState(false);
  const [hasPrevApi, setHasPrevApi] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [filters, setFilters] = useState<ExplorerFilters>(DEFAULT_EXPLORER_FILTERS);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtersActive =
    filters.gender !== 'all' ||
    filters.culture !== 'all' ||
    filters.court !== 'all' ||
    filters.sort !== 'name';

  const favoriteIds = useMemo(() => new Set(favorites.map((f) => f.characterId)), [favorites]);

  const filteredPool = useMemo(
    () => applyExplorerFilters(pool, filters, favoriteIds),
    [pool, filters, favoriteIds],
  );

  const cultures = useMemo(() => uniqueCultures(pool), [pool]);

  const clientPageCount = Math.max(1, Math.ceil(filteredPool.length / CHARACTERS_PER_PAGE));
  const displayCharacters = useMemo(() => {
    if (filtersActive) {
      const start = (clientPage - 1) * CHARACTERS_PER_PAGE;
      return filteredPool.slice(start, start + CHARACTERS_PER_PAGE);
    }
    return filteredPool;
  }, [filteredPool, filtersActive, clientPage]);

  useEffect(() => {
    setClientPage(1);
  }, [filters, search]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) return;
      const requestPage = apiPage;
      const requestSearch = search;
      const pageSize = filtersActive ? FETCH_SIZE_FILTERED : CHARACTERS_PER_PAGE;
      setIsLoading(true);
      setError(null);
      try {
        const data = await api.getCharacters(
          token,
          requestPage,
          requestSearch || undefined,
          pageSize,
        );
        if (cancelled) return;
        const unique = dedupeCharacters(data.results);
        setPool(filtersActive ? unique : unique.slice(0, CHARACTERS_PER_PAGE));
        setHasNextApi(data.hasNext);
        setHasPrevApi(data.hasPrevious);
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
  }, [token, apiPage, search, filtersActive]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setApiPage(1);
    setSearch(searchInput);
  }

  function handleFavorite(characterId: number, name: string) {
    void toggleFavorite(characterId, name);
  }

  const hasPrev = filtersActive ? clientPage > 1 : hasPrevApi;
  const hasNext = filtersActive ? clientPage < clientPageCount : hasNextApi;

  function goPrev() {
    if (filtersActive) setClientPage((p) => p - 1);
    else setApiPage((p) => p - 1);
  }

  function goNext() {
    if (filtersActive) setClientPage((p) => p + 1);
    else setApiPage((p) => p + 1);
  }

  return (
    <div className="page">
      <header className="page-header">
        <h1>Character Hub</h1>
        <p>
          Recruit allies for your court. Filter by house, gender, and court status — then swear the
          worthy.
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

      <ExplorerFiltersBar
        filters={filters}
        cultures={cultures}
        onChange={setFilters}
        onReset={() => setFilters(DEFAULT_EXPLORER_FILTERS)}
      />

      {filtersActive && (
        <p className="filter-hint muted">
          Showing {filteredPool.length} match(es) from this batch · page {clientPage} of{' '}
          {clientPageCount}
        </p>
      )}

      {isLoading && <LoadingSpinner label="Summoning characters" />}
      {error && <p className="form-error">{error}</p>}

      {!isLoading && !error && displayCharacters.length === 0 && (
        <EmptyState
          title="No characters match"
          description="Try resetting filters or searching another name, house, or alias."
        />
      )}

      <div className="card-grid card-grid--hub">
        {displayCharacters.map((c) => (
          <CharacterCard
            key={`${c.id}-${c.name}`}
            character={c}
            trailing={
              <FavoriteButton
                isFavorite={isFavorite(c.id)}
                onClick={(e) => {
                  e.stopPropagation();
                  void handleFavorite(c.id, c.name);
                }}
              />
            }
          />
        ))}
      </div>

      <div className="pagination">
        <Button variant="ghost" disabled={!hasPrev} onClick={goPrev}>
          Previous
        </Button>
        <span>
          {filtersActive ? `Page ${clientPage}` : `Page ${apiPage}`}
        </span>
        <Button variant="ghost" disabled={!hasNext} onClick={goNext}>
          Next
        </Button>
      </div>
    </div>
  );
}
