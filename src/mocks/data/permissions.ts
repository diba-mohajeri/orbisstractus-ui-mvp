import type { EmployeeRole } from '../../domain/auth';
import type { Permission } from '../../domain/permissions';

export const ROLE_PERMISSIONS: Record<EmployeeRole, Permission[]> = {
  overview: ['approve'],
  intake: ['create', 'edit', 'approve'],
  inspector: ['create', 'edit'],
  analysis: ['create', 'edit', 'approve'],
  reportqa: ['approve', 'seal'],
  delivery: ['release'],
  admin: ['create', 'edit', 'approve', 'seal', 'release', 'configure'],
  platformAdmin: ['create', 'edit', 'approve', 'seal', 'release', 'configure'],
};

export function getRolePermissions(): Record<EmployeeRole, Permission[]> {
  return ROLE_PERMISSIONS;
}

export function getRolePermissionList(role: EmployeeRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

export function setRolePermission(role: EmployeeRole, permission: Permission, granted: boolean): Permission[] {
  const current = ROLE_PERMISSIONS[role] ?? [];
  ROLE_PERMISSIONS[role] = granted
    ? current.includes(permission)
      ? current
      : [...current, permission]
    : current.filter((p) => p !== permission);
  return ROLE_PERMISSIONS[role];
}