import { useAuthStore } from '../../shared/store/authStore';

// Reads the signed-in user directly from the auth store (the same "handler reads the store"
// pattern auditLogStore already uses for its real actor) to determine which company's data
// a mock request should be scoped to.
//
// Returns null (unfiltered — see everything) when there's no session, when the caller is the
// client portal (a different "client company" concept unrelated to assessment-firm tenancy),
// or when the caller is the Orbisstractus platform admin. Otherwise returns the employee's own
// companyId, scoping every portfolio query to just their company.
export function getActiveCompanyId(): string | null {
  const user = useAuthStore.getState().session?.user;
  if (!user || user.audience !== 'employee') return null;
  if (user.role === 'platformAdmin') return null;
  return user.companyId;
}

// Returns the signed-in employee's own id, for resolving "my access" inside mock handlers
// (analogous to getActiveCompanyId above). Returns null for the client portal or when there's
// no session. Unlike getActiveCompanyId, this does NOT special-case platformAdmin — bypass
// logic for that role lives in the project-access resolver, not here.
export function getActiveEmployeeId(): string | null {
  const user = useAuthStore.getState().session?.user;
  if (!user || user.audience !== 'employee') return null;
  return user.employeeId;
}
