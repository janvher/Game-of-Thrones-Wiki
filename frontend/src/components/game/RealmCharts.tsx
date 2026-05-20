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
import type { RealmInsights } from '../../types';

const CHART_COLORS = ['#c9a227', '#9a7b1a', '#5a7a4a', '#8b2635', '#a89080', '#4a3528', '#d4b84a'];

function formatDay(date: string) {
  const d = new Date(date + 'T12:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short' });
}

export function RealmCharts({ insights }: { insights: RealmInsights }) {
  const activity = insights.activityByDay.map((d) => ({
    ...d,
    label: formatDay(d.date),
  }));

  const sections = insights.viewsBySection.length
    ? insights.viewsBySection
    : [{ section: 'No data yet', views: 1 }];

  const trending = insights.trending.slice(0, 6).map((t) => ({
    name: t.label.length > 18 ? `${t.label.slice(0, 16)}…` : t.label,
    views: t.views,
    fullLabel: t.label,
  }));

  return (
    <section className="realm-charts">
      <h2 className="realm-charts__title">Realm intelligence</h2>
      <p className="muted realm-charts__subtitle">
        Your journey and what the realm is exploring — powered by MongoDB analytics.
      </p>

      <div className="charts-grid">
        <div className="chart-card game-panel">
          <h3>Your activity (7 days)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={activity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a3528" />
              <XAxis dataKey="label" tick={{ fill: '#a89080', fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: '#a89080', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: '#1a1410',
                  border: '1px solid #4a3528',
                  borderRadius: 8,
                  color: '#f5ebe0',
                }}
              />
              <Line
                type="monotone"
                dataKey="views"
                name="Page views"
                stroke="#c9a227"
                strokeWidth={2}
                dot={{ fill: '#c9a227', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card game-panel">
          <h3>Where you spend time</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={sections}
                dataKey="views"
                nameKey="section"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {sections.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
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
            {sections.map((s, i) => (
              <li key={s.section}>
                <span className="chart-legend__dot" style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                {s.section} ({s.views})
              </li>
            ))}
          </ul>
        </div>

        <div className="chart-card game-panel chart-card--wide">
          <h3>Trending across the realm</h3>
          {trending.length === 0 ? (
            <p className="muted">Explore the saga to build trending data.</p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={trending} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a3528" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fill: '#a89080', fontSize: 11 }} />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  tick={{ fill: '#a89080', fontSize: 11 }}
                />
                <Tooltip
                  formatter={(value: number) => [`${value} views`, 'Views']}
                  labelFormatter={(_, payload) =>
                    payload?.[0]?.payload?.fullLabel ?? ''
                  }
                  contentStyle={{
                    background: '#1a1410',
                    border: '1px solid #4a3528',
                    borderRadius: 8,
                  }}
                />
                <Bar dataKey="views" fill="#c9a227" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </section>
  );
}
