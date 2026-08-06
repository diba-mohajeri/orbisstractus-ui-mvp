export type ReportStatus = 'released' | 'draftHidden' | 'clientApproved' | 'superseded';

export interface Report {
  id: string;
  buildingId: string;
  serviceLine: string;
  version: string;
  releaseDate: string;
  status: ReportStatus;
  availableFormats: string[];
}
