import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { useFavorites } from '../hooks/useFavorites';
import { useCourtGame } from '../hooks/useCourtGame';
import { WikiArticleCard } from '../components/WikiArticleCard';
import { Card } from '../components/ui/Card';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { SagaBriefing } from '../components/game/SagaBriefing';
import { RealmCharts } from '../components/game/RealmCharts';
import { BadgeGrid } from '../components/game/BadgeGrid';
import type { WikiArticle } from '../types';

export function DashboardPage() {
  const { token } = useAuth();
  const { favorites, isLoading: favLoading } = useFavorites();
  const { progress, briefing, insights, isLoading: courtLoading } = useCourtGame();
  const [hubPosts, setHubPosts] = useState<WikiArticle[]>([]);
  const [lorePosts, setLorePosts] = useState<WikiArticle[]>([]);

  useEffect(() => {
    if (!token) return;
    api.getWikiHub(token).then(setHubPosts).catch(() => {});
    api.getWikiLore(token).then(setLorePosts).catch(() => {});
  }, [token]);

  return (
    <div className="page page--game">
      <header className="page-header">
        <h1>Great Hall</h1>
        <p>Your command center — build your court, complete quests, and read the realm.</p>
      </header>

      {courtLoading && <LoadingSpinner label="Preparing your briefing" />}

      {!courtLoading && briefing && progress && (
        <SagaBriefing briefing={briefing} progress={progress} />
      )}

      {!courtLoading && insights && <RealmCharts insights={insights} />}

      <div className="grid-2">
        <Card title="Quest: Explore the saga">
          <p>Browse characters, filter by house, and recruit allies to your court.</p>
          <Link to="/explorer" className="text-link">
            Open Character Hub →
          </Link>
        </Card>
        <Card title="Quest: Grow your court">
          <p>
            {favLoading ? '…' : `${favorites.length} allies sworn`}
            {progress ? ` · Level ${progress.level}` : ''}
          </p>
          <Link to="/favorites" className="text-link">
            Your Court & compare →
          </Link>
        </Card>
      </div>

      {!courtLoading && progress && (
        <section className="badges-section">
          <h2>Court achievements</h2>
          <p className="muted">
            {progress.unlockedCount} of {progress.achievements.length} badges earned
          </p>
          <BadgeGrid achievements={progress.achievements} />
        </section>
      )}

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
