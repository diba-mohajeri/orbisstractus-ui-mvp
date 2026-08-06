export type Permission = 'create' | 'edit' | 'approve' | 'seal' | 'release' | 'configure';

export interface PermissionOption {
  value: Permission;
  label: string;
  description: string;
}

export const PERMISSION_OPTIONS: PermissionOption[] = [
  { value: 'create', label: 'Create', description: 'Log new observations and open new records.' },
  { value: 'edit', label: 'Edit', description: 'Modify existing records and findings.' },
  { value: 'approve', label: 'Approve', description: 'Approve scope, findings, and observations.' },
  { value: 'seal', label: 'Seal', description: 'Apply the P.Eng seal to a report.' },
  { value: 'release', label: 'Release', description: 'Release final deliverables to the client.' },
  { value: 'configure', label: 'Configure', description: 'Manage employees, roles, and platform settings.' },
];