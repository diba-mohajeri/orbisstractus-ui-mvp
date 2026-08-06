import type { EmployeeRole } from '../../domain/auth';
import type { AccessLevel, ProjectStepKey } from '../../domain/projectAccess';

export interface ProjectAccessRow {
  employeeId: string;
  employeeName: string;
  employeeRole: EmployeeRole;
  onTeam: boolean;
  access: Record<ProjectStepKey, { level: AccessLevel; isOverride: boolean }>;
}

export type ProjectAccessOverviewResponse = ProjectAccessRow[];

export interface UpdateProjectTeamRequest {
  employeeId: string;
  onTeam: boolean;
}

export interface UpdateProjectStepAccessRequest {
  employeeId: string;
  step: ProjectStepKey;
  accessLevel: AccessLevel | null; // null clears the override, reverting to the computed default
}

export type MyProjectAccessResponse = Record<ProjectStepKey, AccessLevel>;
