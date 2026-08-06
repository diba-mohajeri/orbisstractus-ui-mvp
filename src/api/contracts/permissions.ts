import type { EmployeeRole } from '../../domain/auth';
import type { Permission } from '../../domain/permissions';

export type RolePermissionsResponse = Record<EmployeeRole, Permission[]>;

export interface UpdateRolePermissionRequest {
  permission: Permission;
  granted: boolean;
}

export type UpdateRolePermissionResponse = Permission[];