import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { CourtBriefing, CourtProgress, RealmInsights } from '../types';

export function useCourtGame() {
  const { token } = useAuth();
  const [progress, setProgress] = useState<CourtProgress | null>(null);
  const [briefing, setBriefing] = useState<CourtBriefing | null>(null);
  const [insights, setInsights] = useState<RealmInsights | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
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
      /* non-fatal */
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { progress, briefing, insights, isLoading, refresh };
}
