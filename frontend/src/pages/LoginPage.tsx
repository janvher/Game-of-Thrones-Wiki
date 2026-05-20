import { useState, type FormEvent } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { ApiError } from '../services/api';

export function LoginPage() {
  const { user, login, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('demo@umpisa.dev');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!isLoading && user) {
    return <Navigate to="/dashboard" replace />;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(email, password, name);
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-hero">
          <span className="brand-mark large">⚔</span>
          <h1 className="login-title">Umpisa Inc - Jan Genvher Papica Exam</h1>
          <p>
            The full Game of Thrones saga — characters, lore, and articles from Wiki of Thrones.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="login-form">
          <h2>{mode === 'login' ? 'Enter the realm' : 'Swear fealty'}</h2>
          {mode === 'register' && (
            <Input
              label="Name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          )}
          <Input
            label="Email"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            name="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          {error && <p className="form-error">{error}</p>}
          <Button type="submit" isLoading={submitting} className="full-width">
            {mode === 'login' ? 'Sign in' : 'Register'}
          </Button>
          <button
            type="button"
            className="link-btn"
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
          >
            {mode === 'login'
              ? 'Need an account? Register'
              : 'Already have an account? Sign in'}
          </button>
          <p className="demo-hint">Demo: demo@umpisa.dev / password123</p>
        </form>
      </div>
    </div>
  );
}
