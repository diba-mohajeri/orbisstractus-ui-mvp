export type AccessLevel = 'none' | 'view' | 'edit';

// The 5 workflow steps that carry per-project access grants. Deliberately a standalone literal
// union (not derived from EmployeeRole) even though its values line up 1:1 with EmployeeRole and
// INSIGHTX_NAV_ITEMS keys — keeps this domain decoupled from EmployeeRole gaining a non-workflow
// role later without silently changing what's grantable here.
export type ProjectStepKey = 'intake' | 'inspector' | 'analysis' | 'reportqa' | 'delivery';

export const PROJECT_STEP_KEYS: ProjectStepKey[] = ['intake', 'inspector', 'analysis', 'reportqa', 'delivery'];

export const PROJECT_STEP_LABEL: Record<ProjectStepKey, string> = {
  intake: 'PM / Intake',
  inspector: 'Inspector',
  analysis: 'Analyst',
  reportqa: 'Report + QA',
  delivery: 'Delivery',
};

// Team membership: coarse-grained "this employee works this project at all." Unlocks the
// "view everywhere, edit your home step" default. Does not by itself grant edit off the home step.
export interface ProjectTeamMember {
  projectId: string;
  employeeId: string;
}

// An explicit executive override for one (project, employee, step). Always wins over the computed
// default (except for the admin/platformAdmin bypass, which is unconditional). Recording
// accessLevel: 'none' lets an executive revoke a team member's default view on one step without
// removing them from the team.
export interface ProjectStepAccessGrant {
  id: string;
  projectId: string;
  employeeId: string;
  step: ProjectStepKey;
  accessLevel: AccessLevel;
  updatedAt: string;
  updatedByEmployeeId: string | null;
}
