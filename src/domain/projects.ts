export type ProjectStatus = 'active' | 'planned' | 'complete';
export type ServiceLine = 'BCA' | 'EnvelopeX' | 'ReserveX' | 'EnergyX';

export type DeliveryMethod = 'Portal' | 'Email' | 'Both';

export interface Project {
  id: string;
  buildingId: string;
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

export const MILESTONE_STAGES = [
  'Assessment Request',
  'PM / Intake',
  'Field Inspection',
  'Analysis',
  'Report + QA',
  'Delivery',
] as const;

export const STAGE_TO_MILESTONE_INDEX: Record<string, number> = {
  Scoping: 0,
  'Intake Review': 1,
  'Field Inspection': 2,
  Analysis: 3,
  'Report Drafting': 4,
  'QA Review': 4,
  Delivered: 5,
};
