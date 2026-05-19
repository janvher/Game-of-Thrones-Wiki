import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePageAnalytics } from '../hooks/usePageAnalytics';
import { Button } from './ui/Button';

const navItems = [
  { to: '/dashboard', label: 'Great Hall' },
  { to: '/explorer', label: 'Character Hub' },
  { to: '/favorites', label: 'Your Court' },
  { to: '/profile', label: 'Profile' },
];

export function AppLayout() {
  const { user, logout } = useAuth();
  usePageAnalytics();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-mark">⚔</span>
          <div>
            <strong>Jan Genvher PapicaExam</strong>
            <small>Wiki of Thrones Hub</small>
          </div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <p className="user-greeting">Hello, {user?.name}</p>
          <Button variant="ghost" onClick={logout}>
            Leave the realm
          </Button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
