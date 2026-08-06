import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import type { EmployeeRole } from '../../domain/auth';

interface RequireRoleProps {
  role: EmployeeRole | EmployeeRole[];
  redirectTo: string;
  children: ReactNode;
}

export default function RequireRole({ role, redirectTo, children }: RequireRoleProps) {
  const session = useAuthStore((s) => s.session);
  const allowedRoles = Array.isArray(role) ? role : [role];

  if (!session || !session.user.role || !allowedRoles.includes(session.user.role)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
}