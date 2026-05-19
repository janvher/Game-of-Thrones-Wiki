import { useAuth } from '../context/AuthContext';
import { useFavorites } from '../hooks/useFavorites';
import { Card } from '../components/ui/Card';
import { PushNotificationSettings } from '../components/PushNotificationSettings';
import { GraphQLFavoritesPanel } from '../components/GraphQLFavoritesPanel';

export function ProfilePage() {
  const { user } = useAuth();
  const { favorites } = useFavorites();

  return (
    <div className="page">
      <header className="page-header">
        <h1>Profile</h1>
        <p>Your account in the realm.</p>
      </header>

      <Card title="Account">
        <dl className="detail-grid">
          <div>
            <dt>Name</dt>
            <dd>{user?.name}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{user?.email}</dd>
          </div>
          <div>
            <dt>Favorites saved</dt>
            <dd>{favorites.length}</dd>
          </div>
        </dl>
      </Card>

      <PushNotificationSettings />
      <GraphQLFavoritesPanel />

      <Card title="About Jan Genvher PapicaExam">
        <p>
          Game of Thrones saga explorer for the Full Stack Developer exam. React frontend,
          Node/Express API, MongoDB, GraphQL, push notifications, page analytics, character data
          from An API of Ice and Fire, and lore/articles from{' '}
          <a href="https://wikiofthrones.com/" target="_blank" rel="noreferrer">
            Wiki of Thrones
          </a>
          .
        </p>
      </Card>
    </div>
  );
}
