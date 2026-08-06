export interface PlatformNavItem {
  key: string;
  label: string;
  subtitle: string;
  path: string;
}

export const PLATFORM_NAV_ITEMS: PlatformNavItem[] = [
  { key: 'overview', label: 'Platform Overview', subtitle: 'All companies at a glance', path: '' },
  { key: 'companies', label: 'Companies', subtitle: 'Manage tenant companies', path: 'companies' },
  { key: 'employees', label: 'All Employees', subtitle: 'Cross-company directory', path: 'employees' },
  { key: 'projects', label: 'All Projects', subtitle: 'Every assessment, every company', path: 'projects' },
  { key: 'access', label: 'Project Access', subtitle: 'Per-project access, any tenant', path: 'access' },
  { key: 'portfolio', label: 'Portfolio', subtitle: 'Every building, every company', path: 'portfolio' },
];
