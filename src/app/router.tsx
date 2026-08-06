import { lazy, Suspense, type ComponentType, type ReactElement } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import SignInPage from '../features/auth/SignInPage';
import RequireAuth from '../shared/components/RequireAuth';
import RequireRole from '../shared/components/RequireRole';
import ModulePlaceholderPage from '../shared/components/ModulePlaceholderPage';
import PageLoadingFallback from '../shared/components/PageLoadingFallback';
import ClientPortalShell from '../features/client-portal/shell/ClientPortalShell';
import InsightXShell from '../features/insightx/shell/InsightXShell';
import PlatformShell from '../features/platform/shell/PlatformShell';
import { CLIENT_NAV_ITEMS } from '../features/client-portal/navItems';
import { INSIGHTX_NAV_ITEMS } from '../features/insightx/navItems';
import { PLATFORM_NAV_ITEMS } from '../features/platform/navItems';
import { LOGIN_PATH } from './paths';

function lazyPage(loader: () => Promise<{ default: ComponentType }>): ReactElement {
  const LazyComponent = lazy(loader);
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <LazyComponent />
    </Suspense>
  );
}

const clientHomeElement = lazyPage(() => import('../features/client-portal/home/ClientPortalHomePage'));

const BUILT_CLIENT_PAGE_LOADERS: Record<string, () => Promise<{ default: ComponentType }>> = {
  portfolioHub: () => import('../features/client-portal/portfolio-hub/PortfolioHubPage'),
  assetManagement: () => import('../features/client-portal/asset-management/AssetManagementPage'),
  digitalTwin: () => import('../features/client-portal/digital-twin/DigitalTwinPage'),
  predictive: () => import('../features/client-portal/predictive-analytics/PredictiveAnalyticsPage'),
  enterpriseCommand: () => import('../features/client-portal/enterprise-command/EnterpriseCommandPage'),
  projects: () => import('../features/client-portal/project-center/ProjectCenterPage'),
  reports: () => import('../features/client-portal/report-center/ReportCenterPage'),
  deficiencies: () => import('../features/client-portal/deficiency-center/DeficiencyCenterPage'),
  actions: () => import('../features/client-portal/action-remediation/ActionRemediationPage'),
  capital: () => import('../features/client-portal/capital-planning/CapitalPlanningPage'),
  portfolio: () => import('../features/client-portal/asset-registry/AssetRegistryPage'),
  documents: () => import('../features/client-portal/document-vault/DocumentVaultPage'),
  board: () => import('../features/client-portal/board-reporting/BoardReportingPage'),
  advisor: () => import('../features/client-portal/ai-advisor/AIAdvisorPage'),
  communications: () => import('../features/client-portal/communication-center/CommunicationCenterPage'),
  undergoing: () => import('../features/client-portal/undergoing-assessments/UndergoingAssessmentsPage'),
  request: () => import('../features/client-portal/request-assessment/RequestAssessmentPage'),
};

const clientModuleRoutes = CLIENT_NAV_ITEMS.filter((item) => item.key !== 'choice').map((item) => {
  const loader = BUILT_CLIENT_PAGE_LOADERS[item.key];
  return {
    path: item.path,
    element: loader ? (
      lazyPage(loader)
    ) : (
      <ModulePlaceholderPage title={item.label} wireframe={item.wireframe} phase={item.phase} />
    ),
  };
});

const overviewElement = lazyPage(() => import('../features/insightx/overview/OverviewPage'));

const BUILT_INSIGHTX_PAGE_LOADERS: Record<string, () => Promise<{ default: ComponentType }>> = {
  intake: () => import('../features/insightx/pm-intake/IntakePage'),
  inspector: () => import('../features/insightx/inspector/InspectorPage'),
  analysis: () => import('../features/insightx/analyst/AnalystPage'),
  reportqa: () => import('../features/insightx/report-qa/ReportQaPage'),
  delivery: () => import('../features/insightx/delivery/DeliveryPage'),
  admin: () => import('../features/insightx/administration/AdministrationPage'),
};

const insightXModuleRoutes = INSIGHTX_NAV_ITEMS.filter((item) => item.key !== 'overview').map((item) => {
  const loader = BUILT_INSIGHTX_PAGE_LOADERS[item.key];
  const element = loader ? (
    lazyPage(loader)
  ) : (
    <ModulePlaceholderPage title={item.label} wireframe={item.wireframe} phase={item.phase} />
  );
  return {
    path: item.path,
    element:
      item.key === 'admin' ? (
        <RequireRole role={['admin', 'platformAdmin']} redirectTo="/insightx">
          {element}
        </RequireRole>
      ) : (
        element
      ),
  };
});

const platformOverviewElement = lazyPage(() => import('../features/platform/overview/PlatformOverviewPage'));

const BUILT_PLATFORM_PAGE_LOADERS: Record<string, () => Promise<{ default: ComponentType }>> = {
  companies: () => import('../features/platform/companies/CompaniesPage'),
  employees: () => import('../features/platform/employees/PlatformEmployeesPage'),
  projects: () => import('../features/platform/projects/PlatformProjectsPage'),
  access: () => import('../features/platform/access/PlatformProjectAccessPage'),
  portfolio: () => import('../features/platform/portfolio/PlatformPortfolioPage'),
};

const platformModuleRoutes = PLATFORM_NAV_ITEMS.filter((item) => item.key !== 'overview').map((item) => {
  const loader = BUILT_PLATFORM_PAGE_LOADERS[item.key];
  return {
    path: item.path,
    element: loader ? lazyPage(loader) : <ModulePlaceholderPage title={item.label} wireframe="n/a" />,
  };
});

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to={LOGIN_PATH} replace /> },
  { path: LOGIN_PATH, element: <SignInPage /> },
  {
    path: '/portal',
    element: (
      <RequireAuth audience="client">
        <ClientPortalShell />
      </RequireAuth>
    ),
    children: [{ index: true, element: clientHomeElement }, ...clientModuleRoutes],
  },
  {
    path: '/insightx',
    element: (
      <RequireAuth audience="employee">
        <InsightXShell />
      </RequireAuth>
    ),
    children: [{ index: true, element: overviewElement }, ...insightXModuleRoutes],
  },
  {
    path: '/platform',
    element: (
      <RequireAuth audience="employee">
        <RequireRole role="platformAdmin" redirectTo="/insightx">
          <PlatformShell />
        </RequireRole>
      </RequireAuth>
    ),
    children: [{ index: true, element: platformOverviewElement }, ...platformModuleRoutes],
  },
  {
    path: '/report-viewer/:reportId',
    element: (
      <RequireAuth>{lazyPage(() => import('../features/report-viewer/ReportViewerPage'))}</RequireAuth>
    ),
  },
  { path: '*', element: <Navigate to={LOGIN_PATH} replace /> },
]);
