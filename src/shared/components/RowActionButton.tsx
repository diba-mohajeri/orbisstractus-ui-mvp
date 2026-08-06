import type { MouseEvent } from 'react';
import { Button } from '@mui/material';

interface RowActionButtonProps {
  label: string;
  onClick: () => void;
}

export default function RowActionButton({ label, onClick }: RowActionButtonProps) {
  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    event.stopPropagation();
    onClick();
  }

  return (
    <Button size="small" variant="outlined" onClick={handleClick}>
      {label}
    </Button>
  );
}
