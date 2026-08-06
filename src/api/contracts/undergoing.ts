import type { ProjectStatus, ServiceLine } from '../../domain/projects';
import type { ActionStatus } from '../../domain/actions';
import type { ReportStatus } from '../../domain/reports';

export interface UndergoingProjectRow {
  id: string;
  buildingId: string;
  buildingName: string;
  serviceLine: ServiceLine;
  status: ProjectStatus;
  currentStage: string;
  consultantLead: string;
  targetDeliveryDate: string;
  progressPct: number;
  milestoneIndex: number;
}

export interface UndergoingDeliverable {
  id: string;
  serviceLine: string;
  status: ReportStatus;
  availableFormats: string[];
}

export interface UndergoingClientAction {
  id: string;
  actionName: string;
  status: ActionStatus;
}

export interface UndergoingProjectDetailResponse {
  project: {
    id: string;
    buildingId: string;
    buildingName: string;
    serviceLine: ServiceLine;
    status: ProjectStatus;
    currentStage: string;
    consultantLead: string;
    targetDeliveryDate: string;
  };
  milestoneIndex: number;
  progressPct: number;
  evidenceCount: number;
  deliverables: UndergoingDeliverable[];
  clientActions: UndergoingClientAction[];
}
