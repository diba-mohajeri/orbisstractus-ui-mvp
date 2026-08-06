export interface HubCardData {
  navKey: string;
  title: string;
  description: string;
  badges: string[];
}

export const HUB_CARDS: HubCardData[] = [
  {
    navKey: 'portfolioHub',
    title: 'Portfolio Hub',
    description:
      'Manage one building, fifty buildings, or enterprise portfolios by region, asset class, risk, capital exposure, and service status.',
    badges: ['Portfolio Intelligence'],
  },
  {
    navKey: 'assetManagement',
    title: 'Portfolio & Asset Management',
    description:
      'Manage structured asset records across portfolio, region, building, system, and component levels.',
    badges: ['Asset Master Data', 'Digital Twin Foundation'],
  },
  {
    navKey: 'digitalTwin',
    title: 'Digital Twin Hub',
    description:
      'Explore connected building twins that link systems, components, condition, deficiencies, and evidence.',
    badges: ['Living Building Record', 'Predictive Foundation'],
  },
  {
    navKey: 'predictive',
    title: 'Predictive Analytics & Benchmarking',
    description:
      'Forecast failures, capital exposure, reserve gaps, and risk trajectory across the portfolio.',
    badges: ['Predictive Intelligence', 'Benchmarking Engine'],
  },
  {
    navKey: 'enterpriseCommand',
    title: 'Enterprise Portfolio Command Center',
    description:
      'Executive operating layer for enterprise-wide risk, capital allocation, and strategic planning.',
    badges: ['Executive Command', 'Operating Platform'],
  },
  {
    navKey: 'projects',
    title: 'Project Center',
    description: 'Track active and historical engagements from intake through delivery.',
    badges: ['Project Tracking'],
  },
  {
    navKey: 'reports',
    title: 'Report Center',
    description: 'Access released BCA, Envelope, Energy, Reserve Fund, and Execution deliverables.',
    badges: ['Released Deliverables'],
  },
  {
    navKey: 'deficiencies',
    title: 'Deficiency Center',
    description: 'Turn findings into searchable, prioritized asset intelligence across the portfolio.',
    badges: ['Risk Intelligence'],
  },
  {
    navKey: 'actions',
    title: 'Action & Remediation',
    description: 'Bridge from inspection findings to action assignment, budget approval, and execution.',
    badges: ['ExecutionX Bridge'],
  },
  {
    navKey: 'capital',
    title: 'Capital Planning',
    description: 'View 1/5/10/30-year capital plans connected to findings, systems, and reserve funding.',
    badges: ['Capital Forecasting'],
  },
  {
    navKey: 'portfolio',
    title: 'Asset Registry',
    description: 'Browse building, system, component, inspection history, and report relationships.',
    badges: ['Asset Intelligence'],
  },
  {
    navKey: 'documents',
    title: 'Document Vault',
    description: 'Centralize reports, drawings, photos, drone imagery, thermal scans, and letters.',
    badges: ['Single Source of Truth'],
  },
  {
    navKey: 'board',
    title: 'Executive Board Reporting',
    description: 'Generate board packages, quarterly asset reviews, and annual health reports.',
    badges: ['Recurring Reporting'],
  },
  {
    navKey: 'advisor',
    title: 'AI Building Advisor',
    description:
      'Ask questions about capital risks, envelope priorities, and budgets under professional-review guardrails.',
    badges: ['AI Decision Support'],
  },
  {
    navKey: 'communications',
    title: 'Communication Center',
    description: 'Reduce email dependency with tracked questions, approvals, and meeting requests.',
    badges: ['Client Collaboration'],
  },
  {
    navKey: 'undergoing',
    title: 'Undergoing Assessments',
    description:
      'Track assessments currently in progress — milestones, captured evidence, and interim deliverables in one place.',
    badges: ['Live Project Tracking'],
  },
  {
    navKey: 'request',
    title: 'Request Assessment',
    description: 'Launch new assessment requests, including direct assignment or public tender.',
    badges: ['New Engagement'],
  },
];
