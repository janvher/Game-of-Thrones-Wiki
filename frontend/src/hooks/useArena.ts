import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import type { ArenaAction, ArenaBattle, ArenaMode, ArenaProfile, LoadoutTrait } from '../types';

export function useArena() {
  const { token } = useAuth();
  const [profile, setProfile] = useState<ArenaProfile | null>(null);
  const [battle, setBattle] = useState<ArenaBattle | null>(null);
  const [lastEvents, setLastEvents] = useState<Awaited<ReturnType<typeof api.submitArenaTurn>>['events']>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActing, setIsActing] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    winnerSide: string;
    pointsEarned: number;
    rating: number;
    summary: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [p, active] = await Promise.all([
        api.getArenaProfile(token),
        api.getActiveArenaBattle(token),
      ]);
      setProfile(p);
      setBattle(active);
    } catch {
      /* ignore */
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const startBattle = useCallback(
    async (opts: {
      mode: ArenaMode;
      playerCharacterId: number;
      opponentCharacterId?: number;
      playerTeamIds?: number[];
    }) => {
      if (!token) return null;
      setMatchResult(null);
      setLastEvents([]);
      const b = await api.startArenaBattle(token, opts);
      setBattle(b);
      return b;
    },
    [token],
  );

  const submitTurn = useCallback(
    async (action: ArenaAction) => {
      if (!token || !battle) return;
      setIsActing(true);
      try {
        const res = await api.submitArenaTurn(token, battle.id, action);
        setBattle(res.battle);
        setLastEvents(res.events);
        if (res.matchResult) setMatchResult(res.matchResult);
        if (res.battleComplete) await refresh();
        return res;
      } catch {
        await refresh();
        throw new Error('Turn failed — battle reset. Please start a new fight.');
      } finally {
        setIsActing(false);
      }
    },
    [token, battle, refresh],
  );

  const forfeit = useCallback(async () => {
    if (!token || !battle) return;
    const res = await api.forfeitArenaBattle(token, battle.id);
    setBattle(res.battle);
    setMatchResult(res.matchResult);
    await refresh();
  }, [token, battle, refresh]);

  const updateLoadout = useCallback(
    async (loadout: { houseBonus?: string | null; trait?: LoadoutTrait }) => {
      if (!token) return;
      await api.updateArenaLoadout(token, loadout);
      await refresh();
    },
    [token, refresh],
  );

  const clearMatchResult = useCallback(() => {
    setMatchResult(null);
    setLastEvents([]);
    setBattle(null);
  }, []);

  return {
    profile,
    battle,
    lastEvents,
    matchResult,
    isLoading,
    isActing,
    refresh,
    startBattle,
    submitTurn,
    forfeit,
    updateLoadout,
    clearMatchResult,
    setBattle,
  };
}
