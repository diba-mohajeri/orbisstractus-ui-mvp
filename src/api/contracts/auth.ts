import type { EmployeeRole, LoginAudience } from '../../domain/auth';
import type { Permission } from '../../domain/permissions';

export interface SignInRequest {
  audience: LoginAudience;
  email: string;
  password: string;
  role?: EmployeeRole;
  intent?: 'default' | 'request-assessment';
}

export interface SignInSuccessResponse {
  token: string;
  email: string;
  audience: LoginAudience;
  role: EmployeeRole | null;
  permissions: Permission[];
  companyId: string | null;
  employeeId: string | null;
  expiresAt: string;
  redirectTo: string;
}

export interface SignInErrorResponse {
  message: string;
}
