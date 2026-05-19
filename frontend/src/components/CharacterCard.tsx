import { useNavigate } from 'react-router-dom';
import { Card } from './ui/Card';
import type { CharacterListItem } from '../types';

interface CharacterCardProps {
  character: CharacterListItem;
  trailing?: React.ReactNode;
}

export function CharacterCard({ character, trailing }: CharacterCardProps) {
  const navigate = useNavigate();
  const primaryTitle = character.titles.find(Boolean) ?? character.culture;
  const imageSrc = character.imageUrl ?? '/icon.svg';

  return (
    <Card
      title={character.name}
      subtitle={`${character.gender} · ${primaryTitle}`}
      className="character-card"
      onClick={() => navigate(`/characters/${character.id}`)}
    >
      <img
        src={imageSrc}
        alt={character.name}
        className="character-thumb"
        loading="lazy"
        onError={(e) => {
          (e.target as HTMLImageElement).src = '/icon.svg';
        }}
      />
      <div className="character-meta">
        <span>Culture: {character.culture}</span>
        <span>Born: {character.born}</span>
        {character.tvSeries.length > 0 && (
          <span className="tag">TV · {character.tvSeries.length} season(s)</span>
        )}
      </div>
      {trailing && <div className="character-card-actions">{trailing}</div>}
    </Card>
  );
}
