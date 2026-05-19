import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ArenaProfile, RealmInsights } from '../../types';

const COLORS = ['#c9a227', '#5a7a4a', '#8b2635', '#a89080', '#4a3528'];

function formatDay(date: string) {
  return new Date(date + 'T12:00:00').toLocaleDateString(undefined, { weekday: 'short' });
}

export function DashboardCharts({
  insights,
  arena,
}: {
  insights: RealmInsights;
  arena: ArenaProfile | null;
}) {
  const visits = insights.activityByDay.map((d) => ({
    label: formatDay(d.date),
    views: d.views,
  }));

  const actions = insights.viewsBySection.length
    ? insights.viewsBySection
    : [{ section: 'No activity yet', views: 1 }];

  const arenaResults = arena
    ? [
        { name: 'Wins', count: arena.wins },
        { name: 'Losses', count: arena.losses },
      ]
    : [
        { name: 'Wins', count: 0 },
        { name: 'Losses', count: 0 },
      ];

  return (
    <section className="realm-charts">
      <h2 className="realm-charts__title">Analytics</h2>
      <p className="muted realm-charts__subtitle">Visits, navigation, and arena outcomes.</p>

      <div className="charts-grid">
        <div className="chart-card game-panel">
          <h3>Page visits (7 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={visits} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a3528" />
              <XAxis dataKey="label" tick={{ fill: '#a89080', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#a89080', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: '#1a1410',
                  border: '1px solid #4a3528',
                  borderRadius: 8,
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                name="Visits"
                stroke="#c9a227"
                strokeWidth={2}
                dot={{ fill: '#c9a227', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card game-panel">
          <h3>Your actions</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={actions}
                dataKey="views"
                nameKey="section"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {actions.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: '#1a1410',
                  border: '1px solid #4a3528',
                  borderRadius: 8,
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <ul className="chart-legend">
            {actions.map((s, i) => (
              <li key={s.section}>
                <span
                  className="chart-legend__dot"
                  style={{ background: COLORS[i % COLORS.length] }}
                />
                {s.section} ({s.views})
              </li>
            ))}
          </ul>
        </div>

        <div className="chart-card game-panel chart-card--wide">
          <h3>Arena results</h3>
          {arena && arena.wins + arena.losses === 0 ? (
            <p className="muted">No arena battles yet. Visit the Arena to fight.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={arenaResults} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a3528" />
                <XAxis dataKey="name" tick={{ fill: '#a89080', fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fill: '#a89080', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    background: '#1a1410',
                    border: '1px solid #4a3528',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="count" name="Battles" radius={[6, 6, 0, 0]}>
                  <Cell fill="#5a7a4a" />
                  <Cell fill="#8b2635" />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
