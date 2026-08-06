import type { EmployeeRole } from '../../domain/auth';
import type { Employee, EmployeeActivityEntry, EmployeeWorkloadSummary } from '../../domain/employees';
import type { Permission } from '../../domain/permissions';
import { getProjectRows } from './portfolioQueries';
import { getRolePermissionList } from './permissions';

export const EMPLOYEES: Employee[] = [
  {
    id: 'emp-001',
    name: 'Executive Sponsor',
    email: 'executive@absi.com',
    role: 'admin',
    status: 'active',
    title: 'Chief Executive',
    department: 'Executive',
    phone: '416-555-0100',
    createdAt: '2026-01-05',
    lastActiveAt: '2026-07-24',
    companyId: 'absi',
    permissions: getRolePermissionList('admin'),
  },
  {
    id: 'emp-002',
    name: 'M. Chen',
    email: 'm.chen@absi.ca',
    role: 'overview',
    status: 'active',
    title: 'Director of Operations',
    department: 'Operations',
    phone: '416-555-0102',
    createdAt: '2026-01-12',
    lastActiveAt: '2026-07-23',
    companyId: 'absi',
    permissions: getRolePermissionList('overview'),
  },
  {
    id: 'emp-003',
    name: 'J. Alvarez',
    email: 'j.alvarez@absi.ca',
    role: 'intake',
    status: 'active',
    title: 'Project Manager',
    department: 'PM / Intake',
    phone: '416-555-0103',
    createdAt: '2026-01-14',
    lastActiveAt: '2026-07-22',
    companyId: 'absi',
    permissions: getRolePermissionList('intake'),
  },
  {
    id: 'emp-004',
    name: 'R. Singh',
    email: 'r.singh@absi.ca',
    role: 'inspector',
    status: 'active',
    title: 'Field Inspector',
    department: 'Field Execution',
    phone: '416-555-0104',
    createdAt: '2026-01-20',
    lastActiveAt: '2026-07-25',
    companyId: 'absi',
    // Override example: this inspector has also been individually granted Approve authority.
    permissions: [...getRolePermissionList('inspector'), 'approve'],
  },
  {
    id: 'emp-005',
    name: "K. O'Brien",
    email: 'k.obrien@absi.ca',
    role: 'analysis',
    status: 'active',
    title: 'Building Science Analyst',
    department: 'Analysis',
    phone: '416-555-0105',
    createdAt: '2026-02-02',
    lastActiveAt: '2026-07-21',
    companyId: 'absi',
    permissions: getRolePermissionList('analysis'),
  },
  {
    id: 'emp-006',
    name: 'T. Nakamura',
    email: 't.nakamura@absi.ca',
    role: 'reportqa',
    status: 'active',
    title: 'P.Eng. Reviewer',
    department: 'Report + QA',
    phone: '416-555-0106',
    createdAt: '2026-02-10',
    lastActiveAt: '2026-07-20',
    companyId: 'absi',
    permissions: getRolePermissionList('reportqa'),
  },
  {
    id: 'emp-007',
    name: 'S. Reyes',
    email: 's.reyes@absi.ca',
    role: 'delivery',
    status: 'active',
    title: 'Client Delivery Lead',
    department: 'Delivery',
    phone: '416-555-0107',
    createdAt: '2026-02-15',
    lastActiveAt: '2026-07-19',
    companyId: 'absi',
    permissions: getRolePermissionList('delivery'),
  },
  {
    id: 'emp-008',
    name: 'D. Osei',
    email: 'd.osei@absi.ca',
    role: 'inspector',
    status: 'invited',
    title: 'Field Inspector',
    department: 'Field Execution',
    phone: '',
    createdAt: '2026-07-24',
    lastActiveAt: null,
    companyId: 'absi',
    permissions: getRolePermissionList('inspector'),
  },
  {
    id: 'emp-009',
    name: 'A. Bouchard',
    email: 'a.bouchard@meridianeng.ca',
    role: 'admin',
    status: 'active',
    title: 'Managing Partner',
    department: 'Executive',
    phone: '613-555-0111',
    createdAt: '2024-06-15',
    lastActiveAt: '2026-07-24',
    companyId: 'meridian',
    permissions: getRolePermissionList('admin'),
  },
  {
    id: 'emp-010',
    name: 'F. Leblanc',
    email: 'f.leblanc@meridianeng.ca',
    role: 'inspector',
    status: 'active',
    title: 'Field Inspector',
    department: 'Field Execution',
    phone: '613-555-0112',
    createdAt: '2024-07-02',
    lastActiveAt: '2026-07-18',
    companyId: 'meridian',
    permissions: getRolePermissionList('inspector'),
  },
  {
    id: 'emp-011',
    name: 'N. Patel',
    email: 'n.patel@vantagepointeng.ca',
    role: 'admin',
    status: 'active',
    title: 'Principal',
    department: 'Executive',
    phone: '604-555-0121',
    createdAt: '2025-11-01',
    lastActiveAt: '2026-07-22',
    companyId: 'vantage',
    permissions: getRolePermissionList('admin'),
  },
  {
    id: 'emp-012',
    name: 'C. Okafor',
    email: 'c.okafor@vantagepointeng.ca',
    role: 'analysis',
    status: 'active',
    title: 'Building Science Analyst',
    department: 'Analysis',
    phone: '604-555-0122',
    createdAt: '2025-11-10',
    lastActiveAt: '2026-07-15',
    companyId: 'vantage',
    permissions: getRolePermissionList('analysis'),
  },
  {
    id: 'emp-000',
    name: 'Orbisstractus Platform Admin',
    email: 'admin@orbisstractus.com',
    role: 'platformAdmin',
    status: 'active',
    title: 'Platform Administrator',
    department: 'Orbisstractus',
    phone: '',
    createdAt: '2022-01-01',
    lastActiveAt: '2026-07-29',
    companyId: null,
    permissions: getRolePermissionList('platformAdmin'),
  },
];

const ACTIVITY_LOG: Record<string, EmployeeActivityEntry[]> = {
  'emp-001': [
    { id: 'ACT-001', timestamp: '2026-07-24T09:15:00Z', action: 'Signed in', detail: 'Administration console' },
    { id: 'ACT-002', timestamp: '2026-06-30T14:02:00Z', action: 'Role updated', detail: 'D. Osei invited as Inspector' },
  ],
  'emp-002': [
    { id: 'ACT-003', timestamp: '2026-07-23T11:40:00Z', action: 'Signed in', detail: 'InsightX Overview' },
    { id: 'ACT-004', timestamp: '2026-07-18T16:20:00Z', action: 'Reviewed portfolio KPIs', detail: 'Quarterly ops review' },
  ],
  'emp-003': [
    { id: 'ACT-005', timestamp: '2026-07-22T08:55:00Z', action: 'Scope approved', detail: 'PM/Intake governance gate' },
    { id: 'ACT-006', timestamp: '2026-07-15T13:10:00Z', action: 'Signed in', detail: 'PM / Intake' },
  ],
  'emp-004': [
    { id: 'ACT-007', timestamp: '2026-07-25T07:30:00Z', action: 'Observation logged', detail: 'Field inspection entry' },
    { id: 'ACT-008', timestamp: '2026-07-19T10:05:00Z', action: 'Signed in', detail: 'Inspector' },
  ],
  'emp-005': [
    { id: 'ACT-009', timestamp: '2026-07-21T15:45:00Z', action: 'Finding approved', detail: 'Deficiency analysis' },
  ],
  'emp-006': [
    { id: 'ACT-010', timestamp: '2026-07-20T12:00:00Z', action: 'P.Eng seal applied', detail: 'Report QA' },
  ],
  'emp-007': [
    { id: 'ACT-011', timestamp: '2026-07-19T09:20:00Z', action: 'Report released', detail: 'Client delivery' },
  ],
  'emp-008': [],
};

// Pass a companyId to scope the directory to one company (company-admin views); omit it
// (or pass undefined) to return every employee across every company (platform admin view).
export function getEmployeeRows(companyId?: string | null): Employee[] {
  if (companyId === undefined) return EMPLOYEES;
  return EMPLOYEES.filter((e) => e.companyId === companyId);
}

export function getEmployeeById(id: string): Employee | null {
  return EMPLOYEES.find((e) => e.id === id) ?? null;
}

export function findEmployeeByEmail(email: string): Employee | null {
  const normalized = email.trim().toLowerCase();
  return EMPLOYEES.find((e) => e.email.toLowerCase() === normalized) ?? null;
}

function recordActivity(employeeId: string, action: string, detail: string): void {
  const entry: EmployeeActivityEntry = {
    id: `ACT-${Date.now()}`,
    timestamp: new Date().toISOString(),
    action,
    detail,
  };
  const log = ACTIVITY_LOG[employeeId] ?? [];
  ACTIVITY_LOG[employeeId] = [entry, ...log];
}

export function getEmployeeActivity(id: string): EmployeeActivityEntry[] {
  return ACTIVITY_LOG[id] ?? [];
}

export function getEmployeeWorkload(id: string): EmployeeWorkloadSummary | null {
  const employee = getEmployeeById(id);
  if (!employee) return null;

  const projects = getProjectRows().filter((p) => p.consultantLead === employee.name);

  return {
    activeCount: projects.filter((p) => p.status === 'active').length,
    plannedCount: projects.filter((p) => p.status === 'planned').length,
    completeCount: projects.filter((p) => p.status === 'complete').length,
    projects: projects.map((p) => ({
      id: p.id,
      buildingName: p.buildingName,
      serviceLine: p.serviceLine,
      status: p.status,
      currentStage: p.currentStage,
    })),
  };
}

export function updateEmployeeRole(id: string, role: EmployeeRole): Employee | null {
  const employee = getEmployeeById(id);
  if (!employee) return null;
  employee.role = role;
  employee.permissions = getRolePermissionList(role);
  recordActivity(id, 'Role updated', `Role changed to ${role} (permissions reset to role defaults)`);
  return employee;
}

export function updateEmployeePermissions(id: string, permissions: Permission[]): Employee | null {
  const employee = getEmployeeById(id);
  if (!employee) return null;
  employee.permissions = permissions;
  recordActivity(id, 'Permissions updated', `Permissions set to: ${permissions.join(', ') || 'none'}`);
  return employee;
}

export interface UpdateEmployeeProfileInput {
  name?: string;
  title?: string;
  department?: string;
  phone?: string;
  status?: Employee['status'];
}

export function updateEmployeeProfile(id: string, patch: UpdateEmployeeProfileInput): Employee | null {
  const employee = getEmployeeById(id);
  if (!employee) return null;
  Object.assign(employee, patch);
  recordActivity(id, 'Profile updated', 'Profile details changed');
  return employee;
}

export function deleteEmployee(id: string): boolean {
  const index = EMPLOYEES.findIndex((e) => e.id === id);
  if (index === -1) return false;
  EMPLOYEES.splice(index, 1);
  delete ACTIVITY_LOG[id];
  return true;
}

export interface InviteEmployeeInput {
  name: string;
  email: string;
  role: EmployeeRole;
  companyId: string;
  title?: string;
  department?: string;
}

export function inviteEmployee(input: InviteEmployeeInput): Employee {
  const employee: Employee = {
    id: `emp-${String(EMPLOYEES.length + 1).padStart(3, '0')}`,
    name: input.name,
    email: input.email,
    role: input.role,
    status: 'invited',
    title: input.title ?? '',
    department: input.department ?? '',
    phone: '',
    createdAt: new Date().toISOString().slice(0, 10),
    lastActiveAt: null,
    companyId: input.companyId,
    permissions: getRolePermissionList(input.role),
  };
  EMPLOYEES.push(employee);
  ACTIVITY_LOG[employee.id] = [];
  recordActivity(employee.id, 'Invited', `Invited as ${input.role}`);
  return employee;
}