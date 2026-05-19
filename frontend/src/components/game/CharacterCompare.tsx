import type { Favorite } from '../../types';
import { inferHouseFromCharacter } from '../../utils/characterFilters';
import { Button } from '../ui/Button';

function compareRow(label: string, a: string, b: string) {
  const highlight = a !== b ? 'compare-table__diff' : '';
  return (
    <tr>
      <th>{label}</th>
      <td className={highlight}>{a}</td>
      <td className={highlight}>{b}</td>
    </tr>
  );
}

export function CharacterCompare({
  left,
  right,
  onClear,
}: {
  left: Favorite;
  right: Favorite;
  onClear: () => void;
}) {
  const la = left.characterData;
  const ra = right.characterData;
  const leftHouse =
    inferHouseFromCharacter({
      id: left.characterId,
      name: left.characterName,
      gender: la.gender ?? '',
      culture: la.culture ?? '',
      born: la.born ?? '',
      titles: la.titles ?? [],
      tvSeries: la.tvSeries ?? [],
      playedBy: la.playedBy ?? [],
    }) ?? '—';
  const rightHouse =
    inferHouseFromCharacter({
      id: right.characterId,
      name: right.characterName,
      gender: ra.gender ?? '',
      culture: ra.culture ?? '',
      born: ra.born ?? '',
      titles: ra.titles ?? [],
      tvSeries: ra.tvSeries ?? [],
      playedBy: ra.playedBy ?? [],
    }) ?? '—';

  return (
    <div className="compare-panel game-panel">
      <div className="compare-panel__header">
        <h3>Court duel — compare allies</h3>
        <Button variant="ghost" onClick={onClear}>
          Clear
        </Button>
      </div>
      <table className="compare-table">
        <thead>
          <tr>
            <th>Stat</th>
            <th>{left.characterName}</th>
            <th>{right.characterName}</th>
          </tr>
        </thead>
        <tbody>
          {compareRow('House / culture', leftHouse, rightHouse)}
          {compareRow('Gender', la.gender ?? '—', ra.gender ?? '—')}
          {compareRow('Born', la.born ?? '—', ra.born ?? '—')}
          {compareRow('Died', la.died ?? '—', ra.died ?? '—')}
          {compareRow('TV appearances', String(la.tvSeries?.length ?? 0), String(ra.tvSeries?.length ?? 0))}
          {compareRow(
            'Titles',
            la.titles?.filter(Boolean).join(', ') || '—',
            ra.titles?.filter(Boolean).join(', ') || '—',
          )}
          {compareRow(
            'Played by',
            la.playedBy?.join(', ') || '—',
            ra.playedBy?.join(', ') || '—',
          )}
        </tbody>
      </table>
    </div>
  );
}
