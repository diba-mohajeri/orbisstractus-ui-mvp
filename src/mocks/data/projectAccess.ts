import type { EmployeeRole } from '../../domain/auth';
import type {
  AccessLevel,
  ProjectStepAccessGrant,
  ProjectStepKey,
} from '../../domain/projectAccess';
import { PROJECT_STEP_KEYS } from '../../domain/projectAccess';
import { BUILDINGS, PROJECTS } from './portfolioData';
import { EMPLOYEES, getEmployeeById, getEmployeeRows } from './employees';
import { getActiveEmployeeId } from './tenantScope';

function isBypassRole(role: EmployeeRole | null): boolean {
  return role === 'admin' || role === 'platformAdmin';
}

function companyIdForProject(projectId: string): string | null {
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;
  return BUILDINGS.find((b) => b.id === project.buildingId)?.companyId ?? null;
}

interface ProjectTeamMember {
  projectId: string;
  employeeId: string;
}

// --- Seeding -----------------------------------------------------------
//
// Best-effort seed: for each project, match its free-text consultantLead / inspectorName /
// pEngReviewerName against an Employee.name in the SAME company as the project's building. This
// matches cleanly for absi projects because portfolioData.ts's CONSULTANTS pool ('J. Alvarez',
// 'M. Chen', 'R. Singh', "K. O'Brien", 'T. Nakamura', 'S. Reyes') was written to match absi's
// seeded Employee names verbatim. It does not match meridian/vantage projects — CONSULTANTS is a
// single global pool with no meridian/vantage names in it — so those companies fall back to
// assigning their whole non-admin roster to their first project, keeping every company's demo
// team non-empty.
function buildProjectTeam(): ProjectTeamMember[] {
  const members: ProjectTeamMember[] = [];
  const seen = new Set<string>();

  function add(projectId: string, employeeId: string) {
    const key = `${projectId}:${employeeId}`;
    if (seen.has(key)) return;
    seen.add(key);
    members.push({ projectId, employeeId });
  }

  PROJECTS.forEach((project) => {
    const companyId = companyIdForProject(project.id);
    if (!companyId) return;
    const companyEmployees = EMPLOYEES.filter((e) => e.companyId === companyId);
    [project.consultantLead, project.inspectorName, project.pEngReviewerName].forEach((name) => {
      const match = companyEmployees.find((e) => e.name === name && !isBypassRole(e.role));
      if (match) add(project.id, match.id);
    });
  });

  // Fallback for companies where name-matching found nothing (meridian, vantage today).
  const companyIdsWithTeam = new Set(members.map((m) => companyIdForProject(m.projectId)));
  const allCompanyIds = new Set(EMPLOYEES.map((e) => e.companyId).filter((id): id is string => id !== null));
  allCompanyIds.forEach((companyId) => {
    if (companyIdsWithTeam.has(companyId)) return;
    const firstProject = PROJECTS.find((p) => companyIdForProject(p.id) === companyId);
    if (!firstProject) return;
    EMPLOYEES.filter((e) => e.companyId === companyId && !isBypassRole(e.role)).forEach((e) => add(firstProject.id, e.id));
  });

  return members;
}

const PROJECT_TEAM: ProjectTeamMember[] = buildProjectTeam();

const PROJECT_STEP_ACCESS_GRANTS: ProjectStepAccessGrant[] = [];

// --- Team membership -----------------------------------------------------

export function isOnProjectTeam(projectId: string, employeeId: string): boolean {
  return PROJECT_TEAM.some((m) => m.projectId === projectId && m.employeeId === employeeId);
}

export function setProjectTeamMembership(projectId: string, employeeId: string, onTeam: boolean): void {
  const index = PROJECT_TEAM.findIndex((m) => m.projectId === projectId && m.employeeId === employeeId);
  if (onTeam && index === -1) PROJECT_TEAM.push({ projectId, employeeId });
  if (!onTeam && index !== -1) PROJECT_TEAM.splice(index, 1);
}

// --- Explicit grants -------------------------------------------------------

export function getExplicitGrant(projectId: string, employeeId: string, step: ProjectStepKey) {
  return PROJECT_STEP_ACCESS_GRANTS.find(
    (g) => g.projectId === projectId && g.employeeId === employeeId && g.step === step,
  );
}

export function setProjectStepAccessGrant(
  projectId: string,
  employeeId: string,
  step: ProjectStepKey,
  accessLevel: AccessLevel | null, // null clears the override, reverting to the computed default
  updatedByEmployeeId: string | null,
): void {
  const index = PROJECT_STEP_ACCESS_GRANTS.findIndex(
    (g) => g.projectId === projectId && g.employeeId === employeeId && g.step === step,
  );
  if (accessLevel === null) {
    if (index !== -1) PROJECT_STEP_ACCESS_GRANTS.splice(index, 1);
    return;
  }
  const updatedAt = new Date().toISOString();
  if (index !== -1) {
    PROJECT_STEP_ACCESS_GRANTS[index] = {
      ...PROJECT_STEP_ACCESS_GRANTS[index],
      accessLevel,
      updatedAt,
      updatedByEmployeeId,
    };
  } else {
    PROJECT_STEP_ACCESS_GRANTS.push({
      id: `PAG-${String(PROJECT_STEP_ACCESS_GRANTS.length + 1).padStart(4, '0')}`,
      projectId,
      employeeId,
      step,
      accessLevel,
      updatedAt,
      updatedByEmployeeId,
    });
  }
}

// --- Resolution (the rule engine) ------------------------

export function computeDefaultAccess(role: EmployeeRole | null, onTeam: boolean, step: ProjectStepKey): AccessLevel {
  if (isBypassRole(role)) return 'edit'; // unconditional bypass
  if (!onTeam) return 'none';
  return step === role ? 'edit' : 'view';
}

export function getEmployeeProjectAccess(projectId: string, employeeId: string): Record<ProjectStepKey, AccessLevel> {
  const role = getEmployeeById(employeeId)?.role ?? null;
  const onTeam = isOnProjectTeam(projectId, employeeId);
  const result = {} as Record<ProjectStepKey, AccessLevel>;
  PROJECT_STEP_KEYS.forEach((step) => {
    if (isBypassRole(role)) {
      result[step] = 'edit'; // bypass short-circuits before any override lookup — unconditional
      return;
    }
    const override = getExplicitGrant(projectId, employeeId, step);
    result[step] = override ? override.accessLevel : computeDefaultAccess(role, onTeam, step);
  });
  return result;
}

export function getMyProjectAccess(projectId: string): Record<ProjectStepKey, AccessLevel> | null {
  const employeeId = getActiveEmployeeId();
  if (!employeeId) return null;
  return getEmployeeProjectAccess(projectId, employeeId);
}

// --- Admin-facing overview (drives the matrix UI) ---------------------------

export interface ProjectAccessRow {
  employeeId: string;
  employeeName: string;
  employeeRole: EmployeeRole;
  onTeam: boolean;
  access: Record<ProjectStepKey, { level: AccessLevel; isOverride: boolean }>;
}

export function getProjectAccessOverview(projectId: string): ProjectAccessRow[] {
  const companyId = companyIdForProject(projectId);
  return getEmployeeRows(companyId ?? undefined)
    .filter((e) => !isBypassRole(e.role)) // bypass roles: nothing to configure, always full edit
    .map((employee) => {
      const onTeam = isOnProjectTeam(projectId, employee.id);
      const access = {} as ProjectAccessRow['access'];
      PROJECT_STEP_KEYS.forEach((step) => {
        const override = getExplicitGrant(projectId, employee.id, step);
        access[step] = {
          level: override ? override.accessLevel : computeDefaultAccess(employee.role, onTeam, step),
          isOverride: Boolean(override),
        };
      });
      return { employeeId: employee.id, employeeName: employee.name, employeeRole: employee.role, onTeam, access };
    });
}
