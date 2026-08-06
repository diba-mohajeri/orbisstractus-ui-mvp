import type { EmployeeRole } from '../../domain/auth';
import type {
  Employee,
  EmployeeActivityEntry,
  EmployeeStatus,
  EmployeeWorkloadSummary,
} from '../../domain/employees';
import type { Permission } from '../../domain/permissions';

export type EmployeeRow = Employee;
export type EmployeeDetailResponse = Employee;
export type EmployeeActivityResponse = EmployeeActivityEntry[];
export type EmployeeWorkloadResponse = EmployeeWorkloadSummary;

export interface UpdateEmployeeRoleRequest {
  role: EmployeeRole;
}

export interface UpdateEmployeeProfileRequest {
  name?: string;
  title?: string;
  department?: string;
  phone?: string;
  status?: EmployeeStatus;
}

export interface InviteEmployeeRequest {
  name: string;
  email: string;
  role: EmployeeRole;
  title?: string;
  department?: string;
  // Only required when the platform admin invites into a specific company (they have no
  // companyId of their own); ignored for a company-admin caller, whose own companyId is used.
  companyId?: string;
}

export type InviteEmployeeResponse = Employee;

export interface UpdateEmployeePermissionsRequest {
  permissions: Permission[];
}