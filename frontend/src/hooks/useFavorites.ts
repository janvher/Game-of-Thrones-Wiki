import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { Favorite } from '../types';

function showLocalNotification(title: string, body: string) {
  if (typeof Notification === 'undefined' || Notification.permission !== 'granted') {
    return;
  }
  try {
    new Notification(title, { body, icon: '/icon.svg' });
  } catch {
    /* ignore */
  }
}

export function useFavorites() {
  const { token } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await api.getFavorites(token);
      setFavorites(data);
    } catch {
      setError('Failed to load favorites');
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const isFavorite = useCallback(
    (characterId: number) => favorites.some((f) => f.characterId === characterId),
    [favorites],
  );

  const toggleFavorite = useCallback(
    async (characterId: number, characterName?: string) => {
      if (!token) return;
      if (isFavorite(characterId)) {
        await api.removeFavorite(token, characterId);
      } else {
        const added = await api.addFavorite(token, characterId);
        const name = characterName ?? added.characterName;
        showLocalNotification('Added to favorites', `${name} is now in your court.`);
      }
      await refresh();
    },
    [token, isFavorite, refresh],
  );

  return { favorites, isLoading, error, isFavorite, toggleFavorite, refresh };
}
