import { authHandlers } from './handlers/auth';
import { portfolioHandlers } from './handlers/portfolio';
import { portfolioAssetHandlers } from './handlers/portfolioAssets';
import { predictiveHandlers } from './handlers/predictive';
import { operationsHandlers } from './handlers/operations';
import { capitalPlanHandlers } from './handlers/capitalPlan';
import { documentsHandlers } from './handlers/documents';
import { boardHandlers } from './handlers/board';
import { assetRegistryHandlers } from './handlers/assetRegistry';
import { messagesHandlers } from './handlers/messages';
import { advisorHandlers } from './handlers/advisor';
import { undergoingHandlers } from './handlers/undergoing';
import { assessmentRequestHandlers } from './handlers/assessmentRequest';
import { reportViewerHandlers } from './handlers/reportViewer';
import { employeesHandlers } from './handlers/employees';
import { permissionsHandlers } from './handlers/permissions';
import { companiesHandlers } from './handlers/companies';
import { projectAccessHandlers } from './handlers/projectAccess';

export const handlers = [
  ...authHandlers,
  ...employeesHandlers,
  ...permissionsHandlers,
  ...companiesHandlers,
  ...projectAccessHandlers,
  ...portfolioHandlers,
  ...portfolioAssetHandlers,
  ...predictiveHandlers,
  ...operationsHandlers,
  ...capitalPlanHandlers,
  ...documentsHandlers,
  ...boardHandlers,
  ...assetRegistryHandlers,
  ...messagesHandlers,
  ...advisorHandlers,
  ...undergoingHandlers,
  ...assessmentRequestHandlers,
  ...reportViewerHandlers,
];
