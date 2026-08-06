import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LOGIN_PATH } from '../../app/paths';
import type { LoginAudience } from '../../domain/auth';

interface RequireAuthProps {
  audience?: LoginAudience;
  children: ReactNode;
}

export default function RequireAuth({ audience, children }: RequireAuthProps) {
  const session = useAuthStore((s) => s.session);

  if (!session || (audience && session.user.audience !== audience)) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  return <>{children}</>;
}
