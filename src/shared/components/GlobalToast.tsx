import { Snackbar } from '@mui/material';
import { useToastStore } from '../store/toastStore';

export default function GlobalToast() {
  const message = useToastStore((s) => s.message);
  const clear = useToastStore((s) => s.clear);

  return (
    <Snackbar
      open={Boolean(message)}
      autoHideDuration={3500}
      onClose={clear}
      message={message}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    />
  );
}
