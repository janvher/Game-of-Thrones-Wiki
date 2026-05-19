import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { createEmptyRealmInsights } from '../utils/emptyRealmInsights';
import type { CourtBriefing, CourtProgress, RealmInsights } from '../types';

export function useCourtGame() {
  const { token } = useAuth();
  const [progress, setProgress] = useState<CourtProgress | null>(null);
  const [briefing, setBriefing] = useState<CourtBriefing | null>(null);
  const [insights, setInsights] = useState<RealmInsights>(createEmptyRealmInsights());
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    setLoadError(null);
    try {
      const [p, b, i] = await Promise.all([
        api.getCourtProgress(token),
        api.getCourtBriefing(token),
        api.getRealmInsights(token),
      ]);
      setProgress(p);
      setBriefing(b);
      setInsights(i);
    } catch {
      setLoadError('Court data unavailable — restart the backend (npm run dev) to load charts.');
      setInsights(createEmptyRealmInsights());
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, briefing, insights, isLoading, loadError, refresh };
}
