import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { graphqlRequest } from '../services/graphql';
import { Card } from './ui/Card';
import { LoadingSpinner } from './ui/LoadingSpinner';

interface GqlFavorite {
  id: string;
  characterId: number;
  characterName: string;
  createdAt: string;
}

const FAVORITES_QUERY = `
  query Favorites {
    favorites {
      id
      characterId
      characterName
      createdAt
    }
  }
`;

export function GraphQLFavoritesPanel() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<GqlFavorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    graphqlRequest<{ favorites: GqlFavorite[] }>(token, FAVORITES_QUERY)
      .then((data) => setFavorites(data.favorites))
      .catch((err) => setError(err instanceof Error ? err.message : 'GraphQL error'))
      .finally(() => setIsLoading(false));
  }, [token]);

  return (
    <Card title="GraphQL — your favorites">
      <p className="muted">
        Loaded via <code>POST /graphql</code> (GraphiQL at{' '}
        <a
          href={`${import.meta.env.DEV ? 'http://localhost:3001' : ''}/graphql`}
          target="_blank"
          rel="noreferrer"
        >
          /graphql
        </a>
        ).
      </p>
      {isLoading && <LoadingSpinner label="Querying GraphQL" />}
      {error && <p className="form-error">{error}</p>}
      {!isLoading && !error && (
        <ul className="gql-favorites-list">
          {favorites.length === 0 ? (
            <li className="muted">No favorites yet</li>
          ) : (
            favorites.slice(0, 5).map((f) => (
              <li key={f.id}>
                <strong>{f.characterName}</strong>
                <span> · ID {f.characterId}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </Card>
  );
}
