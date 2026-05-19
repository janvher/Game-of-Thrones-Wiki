import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { WikiArticleCard } from '../components/WikiArticleCard';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import type { PageViewSummary, WikiArticle } from '../types';

export function DashboardPage() {
  const { token, user } = useAuth();
  const { favorites, isLoading: favLoading } = useFavorites();
  const [analytics, setAnalytics] = useState<PageViewSummary[]>([]);
  const [hubPosts, setHubPosts] = useState<WikiArticle[]>([]);
  const [lorePosts, setLorePosts] = useState<WikiArticle[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getAnalyticsSummary(token).then(setAnalytics).catch(() => {});
    api.getWikiHub(token).then(setHubPosts).catch(() => {});
    api.getWikiLore(token).then(setLorePosts).catch(() => {});
  }, [token]);

  return (
    <div className="page">
      <header className="page-header">
        <h1>Great Hall</h1>
        <p>
          Welcome, {user?.name}. Your command center for the full Game of Thrones saga — books,
          shows, and lore from{' '}
          <a href="https://wikiofthrones.com/" target="_blank" rel="noreferrer">
            Wiki of Thrones
          </a>
          .
        </p>
      </header>

      <div className="grid-2">
        <Card title="Workflow: Explore the saga">
          <p>Browse characters from Ice and Fire, open full details, and save favorites.</p>
          <Link to="/explorer" className="text-link">
            Open Character Hub →
          </Link>
        </Card>
        <Card title="Workflow: Your court">
          <p>Manage characters you have sworn to remember in MongoDB.</p>
          <Link to="/favorites" className="text-link">
            View Favorites →
          </Link>
        </Card>
      </div>

      <div className="grid-2 stats-row">
        <Card title="Characters in your court">
          {favLoading ? (
            <LoadingSpinner label="Loading favorites" />
          ) : (
            <p className="stat-number">{favorites.length}</p>
          )}
        </Card>
        <Card title="Page views (top paths)">
          {analytics.length === 0 ? (
            <p className="muted">Navigate the realm to build analytics.</p>
          ) : (
            <ul className="analytics-list">
              {analytics.map((a) => (
                <li key={a.path}>
                  <span>{a.path}</span>
                  <strong>{a.views}</strong>
                </li>
              ))}
            </ul>
          )}
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
