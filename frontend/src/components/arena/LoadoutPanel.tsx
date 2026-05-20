import type { LoadoutTrait } from '../../types';
import { Button } from '../ui/Button';

const TRAITS: { id: LoadoutTrait; label: string; desc: string }[] = [
  { id: 'aggressive', label: 'Aggressive', desc: '+6 ATK, -2 DEF' },
  { id: 'defensive', label: 'Defensive', desc: '-2 ATK, +8 DEF' },
  { id: 'balanced', label: 'Balanced', desc: 'Standard stats' },
];

const HOUSES = ['Stark', 'Lannister', 'Targaryen', 'Baratheon', 'Tyrell', 'Greyjoy', 'Martell'];

export function LoadoutPanel({
  houseBonus,
  trait,
  onSave,
}: {
  houseBonus: string | null;
  trait: LoadoutTrait;
  onSave: (l: { houseBonus: string | null; trait: LoadoutTrait }) => void;
}) {
  return (
    <div className="loadout-panel game-panel">
      <h3>Champion loadout</h3>
      <p className="muted">House bonus applies when your fighter matches the house.</p>
      <label>
        House bonus
        <select
          value={houseBonus ?? ''}
          onChange={(e) =>
            onSave({ houseBonus: e.target.value || null, trait })
          }
        >
          <option value="">None</option>
          {HOUSES.map((h) => (
            <option key={h} value={h}>
              {h}
            </option>
          ))}
        </select>
      </label>
      <div className="loadout-traits">
        {TRAITS.map((t) => (
          <Button
            key={t.id}
            variant={trait === t.id ? 'primary' : 'ghost'}
            onClick={() => onSave({ houseBonus, trait: t.id })}
          >
            {t.label}
            <span className="loadout-trait-desc">{t.desc}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
