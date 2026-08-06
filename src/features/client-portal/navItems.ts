export interface ClientNavItem {
  key: string;
  label: string;
  path: string;
  wireframe: string;
  phase?: string;
}

export const CLIENT_NAV_ITEMS: ClientNavItem[] = [
  { key: 'choice', label: 'Client Portal Hub', path: '', wireframe: 'WF_A2_Client_Portal_Hub.md' },
  {
    key: 'portfolioHub',
    label: 'Portfolio Hub',
    path: 'portfolio-hub',
    wireframe: 'WF_B1_Portfolio_Hub.md',
    phase: 'Phase 2',
  },
  {
    key: 'assetManagement',
    label: 'Portfolio & Asset Management',
    path: 'asset-management',
    wireframe: 'WF_B2_Portfolio_Asset_Management_Hub.md',
    phase: 'Phase 2',
  },
  {
    key: 'digitalTwin',
    label: 'Digital Twin Hub',
    path: 'digital-twin',
    wireframe: 'WF_B3_Digital_Twin_Hub.md',
    phase: 'Phase 2',
  },
  {
    key: 'predictive',
    label: 'Predictive Analytics & Benchmarking',
    path: 'predictive-analytics',
    wireframe: 'WF_B4_Predictive_Analytics_Benchmarking_Hub.md',
    phase: 'Phase 3',
  },
  {
    key: 'enterpriseCommand',
    label: 'Enterprise Portfolio Command Center',
    path: 'enterprise-command',
    wireframe: 'WF_B5_Enterprise_Portfolio_Command_Center.md',
    phase: 'Phase 3',
  },
  {
    key: 'projects',
    label: 'Project Center',
    path: 'projects',
    wireframe: 'WF_B6_Project_Center.md',
    phase: 'Phase 4',
  },
  {
    key: 'reports',
    label: 'Report Center',
    path: 'reports',
    wireframe: 'WF_B7_Report_Center.md',
    phase: 'Phase 4',
  },
  {
    key: 'deficiencies',
    label: 'Deficiency Center',
    path: 'deficiencies',
    wireframe: 'WF_B8_Deficiency_Center.md',
    phase: 'Phase 4',
  },
  {
    key: 'actions',
    label: 'Action & Remediation',
    path: 'actions',
    wireframe: 'WF_B9_Action_Remediation.md',
    phase: 'Phase 4',
  },
  {
    key: 'capital',
    label: 'Capital Planning',
    path: 'capital-planning',
    wireframe: 'WF_B10_Capital_Planning.md',
    phase: 'Phase 5',
  },
  {
    key: 'portfolio',
    label: 'Asset Registry',
    path: 'asset-registry',
    wireframe: 'WF_B11_Asset_Registry.md',
    phase: 'Phase 5',
  },
  {
    key: 'documents',
    label: 'Document Vault',
    path: 'documents',
    wireframe: 'WF_B12_Document_Vault.md',
    phase: 'Phase 5',
  },
  {
    key: 'board',
    label: 'Board Reporting',
    path: 'board-reporting',
    wireframe: 'WF_B13_Board_Reporting.md',
    phase: 'Phase 5',
  },
  {
    key: 'advisor',
    label: 'AI Advisor',
    path: 'ai-advisor',
    wireframe: 'WF_B14_AI_Building_Advisor.md',
    phase: 'Phase 6',
  },
  {
    key: 'communications',
    label: 'Communication Center',
    path: 'communications',
    wireframe: 'WF_B15_Communication_Center.md',
    phase: 'Phase 6',
  },
  {
    key: 'undergoing',
    label: 'Undergoing Assessments',
    path: 'undergoing-assessments',
    wireframe: 'WF_B16_Undergoing_Assessments.md',
    phase: 'Phase 6',
  },
  {
    key: 'request',
    label: 'Request Assessment',
    path: 'request-assessment',
    wireframe: 'WF_B17_Request_Assessment.md',
    phase: 'Phase 6',
  },
];
