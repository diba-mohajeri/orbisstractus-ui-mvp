import type { ActionPriority, ActionStatus, RemediationAction } from '../../domain/actions';
import type { Deficiency, DeficiencySeverity, SystemName } from '../../domain/portfolioAssets';
import type { CapitalPlanItem } from '../../domain/capitalPlan';
import type { DeliveryMethod, ProjectStatus, ServiceLine } from '../../domain/projects';
import type { ReportStatus } from '../../domain/reports';

export interface ProjectRow {
  id: string;
  buildingId: string;
  buildingName: string;
  companyId: string;
  serviceLine: ServiceLine;
  status: ProjectStatus;
  currentStage: string;
  consultantLead: string;
  targetDeliveryDate: string;
  siteVisitDate: string;
  assessmentHorizonYears: number;
  pEngReviewerName: string;
  inspectorName: string;
  deliveryMethod: DeliveryMethod;
  assessmentType?: string;
  assessmentScope?: string[];
  requiredDeliverables?: string[];
  applicableCodes?: string[];
}

export interface CreateAssessmentRequest {
  // Only used when the caller has no company of their own (platform admin creating a project
  // on behalf of a tenant); ignored for a company-scoped employee, whose own company is used.
  companyId?: string;
  projectOwner: string;
  clientOrganization: string;
  clientContact: string;
  purpose: string;
  portfolioName: string;
  portfolioType: string;
  assetsInPortfolio: string;
  propertyAddress: string;
  yearBuilt: number;
  grossFloorAreaSqm: number;
  storeys: number;
  occupancyType: string;
  structureType: string;
  envelopeType: string;
  assessmentType: string;
  pEngReviewerName: string;
  inspectorName: string;
  siteVisitDate: string;
  assessmentHorizonYears: number;
  deliveryMethod: DeliveryMethod;
  assessmentScope: string[];
  requiredDeliverables: string[];
  applicableCodes: string[];
}

export interface CreateAssessmentResponse {
  project: ProjectRow;
}

export interface ReportRow {
  id: string;
  buildingId: string;
  buildingName: string;
  serviceLine: string;
  version: string;
  releaseDate: string;
  status: ReportStatus;
  availableFormats: string[];
}

export interface DeficiencyRow {
  id: string;
  buildingId: string;
  buildingName: string;
  systemName: string;
  description: string;
  severity: DeficiencySeverity;
  estimatedCost: number;
  estimatedCostFormatted: string;
  recommendedAction: string;
  recommendedActionId: string | null;
}

export interface DeficiencyStatsResponse {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  estimatedRepairCostFormatted: string;
  plannedActions: number;
  deferredMaintenanceRisk: number;
}

export interface ActionRow {
  id: string;
  deficiencyId: string;
  buildingId: string;
  buildingName: string;
  systemName: string;
  actionName: string;
  priority: ActionPriority;
  owner: string;
  dueDate: string;
  budget: number;
  budgetFormatted: string;
  completionPct: number;
  status: ActionStatus;
  peoReviewNeeded: boolean;
}

export interface ActionStatsResponse {
  open: number;
  overdue: number;
  critical: number;
  completed: number;
  budgetAssignedFormatted: string;
  budgetRemainingFormatted: string;
  avgCompletionPct: number;
  peoReviewNeeded: number;
}

export interface CreateDeficiencyRequest {
  buildingId: string;
  systemName: SystemName;
  description: string;
  severity: DeficiencySeverity;
  estimatedCost: number;
  sourceObservationId?: string;
  deficiencyType?: string;
  subcategory?: string;
  riskType?: string;
  riskLevel?: Deficiency['riskLevel'];
  codeComplianceFlag?: string;
  priorityTimeframe?: string;
  rulBasis?: string;
  rulStatus?: string;
  failureMechanism?: string;
  recommendationType?: string;
  recommendationScope?: string;
  deficiencyStatement?: string;
  clientNarrative?: string;
  recommendedAction?: string;
  deviationReason?: string;
}

export interface CreateDeficiencyResponse {
  deficiency: Deficiency;
  action: RemediationAction;
}

export interface CreateCapitalPlanItemRequest {
  buildingId: string;
  systemName: SystemName;
  recommendedWork: string;
  priority: DeficiencySeverity;
  forecastCost: number;
  phasingLabel: string;
  reserveFundEligible: boolean;
  sourceDeficiencyId?: string;
  quantity?: number;
  quantityUnit?: string;
  unitRate?: number;
  softCostsPct?: number;
  escalationPct?: number;
  contingencyPct?: number;
  rateSource?: string;
  costNotes?: string;
}

export interface CreateCapitalPlanItemResponse {
  item: CapitalPlanItem;
}
