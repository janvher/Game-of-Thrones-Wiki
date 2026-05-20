import { Button } from '../ui/Button';

export function VictoryModal({
  won,
  summary,
  onContinue,
}: {
  won: boolean;
  summary: string;
  onContinue: () => void;
}) {
  return (
    <div className="victory-overlay">
      <div className={`victory-modal ${won ? 'victory-modal--win' : 'victory-modal--loss'}`}>
        <div className="victory-modal__icon">{won ? '👑' : '💀'}</div>
        <h2>{won ? 'Victory!' : 'Defeat'}</h2>
        <p>{summary}</p>
        <Button onClick={onContinue}>Continue</Button>
      </div>
    </div>
  );
}
