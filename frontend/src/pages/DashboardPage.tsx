import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { createEmptyRealmInsights } from '../utils/emptyRealmInsights';
import { WikiArticleCard } from '../components/WikiArticleCard';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import type { ArenaProfile, RealmInsights, WikiArticle } from '../types';

export function DashboardPage() {
  const { token } = useAuth();
  const [insights, setInsights] = useState<RealmInsights>(createEmptyRealmInsights());
  const [arena, setArena] = useState<ArenaProfile | null>(null);
  const [hubPosts, setHubPosts] = useState<WikiArticle[]>([]);
  const [lorePosts, setLorePosts] = useState<WikiArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    setIsLoading(true);
    Promise.all([
      api.getRealmInsights(token).then(setInsights).catch(() => setInsights(createEmptyRealmInsights())),
      api.getArenaProfile(token).then(setArena).catch(() => setArena(null)),
      api.getWikiHub(token).then(setHubPosts).catch(() => {}),
      api.getWikiLore(token).then(setLorePosts).catch(() => {}),
    ]).finally(() => setIsLoading(false));
  }, [token]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Great Hall</h1>
        <p>Overview of your visits, actions, and arena results.</p>
      </header>

      {isLoading ? (
        <LoadingSpinner label="Loading analytics" />
      ) : (
        <DashboardCharts insights={insights} arena={arena} />
      )}

      <div className="grid-2">
        <Card title="Explore characters">
          <p>Browse the saga roster and save favorites.</p>
          <Link to="/explorer" className="text-link">
            Character Hub →
          </Link>
        </Card>
        <Card title="Arena">
          <p>Fight in turn-based battles.</p>
          <Link to="/arena" className="text-link">
            Enter the Arena →
          </Link>
        </Card>
      </div>

      <section className="wiki-section">
        <h2>Latest from Wiki of Thrones</h2>
        <div className="wiki-grid">
          {hubPosts.map((article) => (
            <WikiArticleCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {lorePosts.length > 0 && (
        <section className="wiki-section">
          <h2>Lore & decoded</h2>
          <div className="wiki-grid compact">
            {lorePosts.map((article) => (
              <WikiArticleCard key={`lore-${article.id}`} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
