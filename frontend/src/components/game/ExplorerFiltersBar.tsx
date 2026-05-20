import type { ExplorerFilters, GenderFilter } from '../../utils/characterFilters';
import { Button } from '../ui/Button';

export function ExplorerFiltersBar({
  filters,
  cultures,
  onChange,
  onReset,
}: {
  filters: ExplorerFilters;
  cultures: string[];
  onChange: (next: ExplorerFilters) => void;
  onReset: () => void;
}) {
  return (
    <div className="explorer-filters game-panel">
      <p className="explorer-filters__label">Discovery filters</p>
      <div className="explorer-filters__row">
        <label>
          Gender
          <select
            value={filters.gender}
            onChange={(e) => onChange({ ...filters, gender: e.target.value as GenderFilter })}
          >
            <option value="all">All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Unknown">Unknown</option>
          </select>
        </label>
        <label>
          House / culture
          <select
            value={filters.culture}
            onChange={(e) => onChange({ ...filters, culture: e.target.value })}
          >
            <option value="all">All</option>
            {cultures.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label>
          Court status
          <select
            value={filters.court}
            onChange={(e) =>
              onChange({
                ...filters,
                court: e.target.value as ExplorerFilters['court'],
              })
            }
          >
            <option value="all">Everyone</option>
            <option value="not_in_court">Not in your court</option>
            <option value="in_court">In your court</option>
          </select>
        </label>
        <label>
          Sort
          <select
            value={filters.sort}
            onChange={(e) =>
              onChange({ ...filters, sort: e.target.value as ExplorerFilters['sort'] })
            }
          >
            <option value="name">Name</option>
            <option value="culture">Culture</option>
            <option value="tv_appearances">TV appearances</option>
          </select>
        </label>
        <Button type="button" variant="ghost" onClick={onReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
