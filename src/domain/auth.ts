import type { Permission } from './permissions';

export type LoginAudience = 'client' | 'employee';

export type EmployeeRole =
  | 'overview'
  | 'intake'
  | 'inspector'
  | 'analysis'
  | 'reportqa'
  | 'delivery'
  | 'admin'
  | 'platformAdmin';

export interface EmployeeRoleOption {
  value: EmployeeRole;
  label: string;
}

// Intentionally excludes 'platformAdmin' — this list drives company-admin-facing pickers
// (invite employee, change role, roles & permissions matrix). A company admin must never
// be able to grant platform-vendor-level access to one of their own employees.
export const EMPLOYEE_ROLE_OPTIONS: EmployeeRoleOption[] = [
  { value: 'overview', label: 'Executive / Operations' },
  { value: 'intake', label: 'PM / Intake' },
  { value: 'inspector', label: 'Inspector' },
  { value: 'analysis', label: 'Analyst' },
  { value: 'reportqa', label: 'Report + QA' },
  { value: 'delivery', label: 'Delivery / Client Output' },
  { value: 'admin', label: 'Administration' },
];

export interface AuthUser {
  email: string;
  audience: LoginAudience;
  role: EmployeeRole | null;
  permissions: Permission[];
  companyId: string | null;
  employeeId: string | null;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  expiresAt: string;
}
