export interface AdminSubView {
  key: string;
  label: string;
}

export const ADMIN_SUBVIEWS: AdminSubView[] = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'organizations', label: 'Organizations' },
  { key: 'users', label: 'Employees' },
  { key: 'roles', label: 'Roles & Permissions' },
  { key: 'projectAccess', label: 'Project Access' },
  { key: 'workflow', label: 'Workflow Configuration' },
  { key: 'reportConfig', label: 'Report Configuration Engine' },
  { key: 'governance', label: 'Governance & Release Engine' },
  { key: 'audit', label: 'Audit Trail' },
  { key: 'subscription', label: 'Subscription Management' },
  { key: 'integrations', label: 'API & Integrations' },
  { key: 'ai', label: 'AI & Automation Hub' },
];
