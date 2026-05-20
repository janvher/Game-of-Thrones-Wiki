import type { LeaderboardEntry } from '../../types';

export function ArenaLeaderboard({ entries }: { entries: LeaderboardEntry[] }) {
  return (
    <div className="arena-leaderboard game-panel">
      <h3>Realm rankings</h3>
      {entries.length === 0 ? (
        <p className="muted">No rankings yet — be the first to fight!</p>
      ) : (
        <table className="leaderboard-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Ruler</th>
              <th>Rating</th>
              <th>W–L</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.rank}>
                <td>{e.rank}</td>
                <td>{e.name}</td>
                <td>{e.rating}</td>
                <td>
                  {e.wins}–{e.losses}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
