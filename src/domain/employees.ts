import type { EmployeeRole } from './auth';
import type { Permission } from './permissions';

export type EmployeeStatus = 'active' | 'invited' | 'suspended';

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: EmployeeRole;
  companyId: string | null;
  status: EmployeeStatus;
  title: string;
  department: string;
  phone: string;
  createdAt: string;
  lastActiveAt: string | null;
  permissions: Permission[];
}

export interface EmployeeActivityEntry {
  id: string;
  timestamp: string;
  action: string;
  detail: string;
}

export interface EmployeeWorkloadProject {
  id: string;
  buildingName: string;
  serviceLine: string;
  status: string;
  currentStage: string;
}

export interface EmployeeWorkloadSummary {
  activeCount: number;
  plannedCount: number;
  completeCount: number;
  projects: EmployeeWorkloadProject[];
}