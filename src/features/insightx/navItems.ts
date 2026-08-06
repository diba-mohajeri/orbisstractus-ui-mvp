export interface InsightXNavItem {
  key: string;
  label: string;
  subtitle: string;
  path: string;
  wireframe: string;
  phase?: string;
}

export const INSIGHTX_NAV_ITEMS: InsightXNavItem[] = [
  { key: 'overview', label: 'Overview', subtitle: 'Workflow', path: '', wireframe: 'WF_C1_Employee_Overview.md' },
  {
    key: 'intake',
    label: 'PM / Intake',
    subtitle: 'Scope Governance',
    path: 'intake',
    wireframe: 'WF_C2_Employee_PM_Intake.md',
  },
  {
    key: 'inspector',
    label: 'Inspector',
    subtitle: 'Field Execution',
    path: 'inspector',
    wireframe: 'WF_C3_Employee_Inspector.md',
  },
  {
    key: 'analysis',
    label: 'Analyst',
    subtitle: 'Bldg Sci + Cost',
    path: 'analysis',
    wireframe: 'WF_C4_Employee_Analyst.md',
    phase: 'Phase 8',
  },
  {
    key: 'reportqa',
    label: 'Report + QA / P.Eng.',
    subtitle: 'Publishing',
    path: 'report-qa',
    wireframe: 'WF_C5_Employee_Report_QA.md',
    phase: 'Phase 8',
  },
  {
    key: 'delivery',
    label: 'Delivery / Client Output',
    subtitle: 'Delivery',
    path: 'delivery',
    wireframe: 'WF_C6_Employee_Delivery.md',
    phase: 'Phase 8',
  },
  {
    key: 'admin',
    label: 'Administration',
    subtitle: 'SaaS Admin',
    path: 'admin',
    wireframe: 'WF_C8_Employee_Administration.md',
    phase: 'Phase 9',
  },
];
