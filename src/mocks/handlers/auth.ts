import { delay, http, HttpResponse } from 'msw';
import { ROLE_LANDING_PATH, PORTAL_HOME_PATH, PORTAL_REQUEST_ASSESSMENT_PATH } from '../../app/paths';
import type { SignInErrorResponse, SignInRequest, SignInSuccessResponse } from '../../api/contracts/auth';
import { findEmployeeByEmail } from '../data/employees';
import { getRolePermissionList } from '../data/permissions';
import type { EmployeeRole } from '../../domain/auth';
import type { Permission } from '../../domain/permissions';

const GENERIC_ERROR = 'We could not sign you in. Check your email and password and try again.';
const DEFAULT_EMPLOYEE_ROLE: EmployeeRole = 'overview';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const authHandlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const body = (await request.json()) as SignInRequest;

    await delay(500);

    if (!isValidEmail(body.email) || body.password.length < 4) {
      return HttpResponse.json<SignInErrorResponse>({ message: GENERIC_ERROR }, { status: 401 });
    }

    // Role and permissions are resolved server-side from the employee directory, not trusted from the client.
    const employee = findEmployeeByEmail(body.email);
    const resolvedRole: EmployeeRole = employee?.role ?? DEFAULT_EMPLOYEE_ROLE;
    const resolvedPermissions: Permission[] = employee?.permissions ?? getRolePermissionList(DEFAULT_EMPLOYEE_ROLE);

    const redirectTo =
      body.audience === 'client'
        ? body.intent === 'request-assessment'
          ? PORTAL_REQUEST_ASSESSMENT_PATH
          : PORTAL_HOME_PATH
        : ROLE_LANDING_PATH[resolvedRole];

    const response: SignInSuccessResponse = {
      token: crypto.randomUUID(),
      email: body.email,
      audience: body.audience,
      role: body.audience === 'employee' ? resolvedRole : null,
      permissions: body.audience === 'employee' ? resolvedPermissions : [],
      companyId: body.audience === 'employee' ? (employee?.companyId ?? null) : null,
      employeeId: body.audience === 'employee' ? (employee?.id ?? null) : null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      redirectTo,
    };

    return HttpResponse.json(response, { status: 200 });
  }),
];
