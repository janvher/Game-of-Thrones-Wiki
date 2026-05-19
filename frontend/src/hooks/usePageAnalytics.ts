import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export function usePageAnalytics(): void {
  const location = useLocation();
  const { token } = useAuth();

  useEffect(() => {
    if (!token) return;
    api.trackPageView(token, location.pathname).catch(() => {
      /* analytics should not break navigation */
    });
  }, [location.pathname, token]);
}
