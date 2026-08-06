import type { EmployeeRole } from '../domain/auth';

export const LOGIN_PATH = '/login';

export const PORTAL_HOME_PATH = '/portal';
export const PORTAL_REQUEST_ASSESSMENT_PATH = '/portal/request-assessment';

export const ROLE_LANDING_PATH: Record<EmployeeRole, string> = {
  overview: '/insightx',
  intake: '/insightx/intake',
  inspector: '/insightx/inspector',
  analysis: '/insightx/analysis',
  reportqa: '/insightx/report-qa',
  delivery: '/insightx/delivery',
  admin: '/insightx/admin',
  platformAdmin: '/platform',
};