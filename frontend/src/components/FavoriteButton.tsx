import { Button } from './ui/Button';

interface FavoriteButtonProps {
  isFavorite: boolean;
  onClick: (e: React.MouseEvent) => void;
}

export function FavoriteButton({ isFavorite, onClick }: FavoriteButtonProps) {
  return (
    <Button
      variant={isFavorite ? 'danger' : 'secondary'}
      onClick={onClick}
    >
      {isFavorite ? 'Remove from favorites' : 'Add to favorites'}
    </Button>
  );
}
