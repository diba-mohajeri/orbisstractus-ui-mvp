export interface AssessmentRequestPayload {
  tenderType: 'direct' | 'tender';
  propertyName: string;
  propertyAddress: string;
  assessmentType: string;
  requestedTimeline: string;
  notes: string;
  tenderNumber?: string;
  tenderClosingDate?: string;
  tenderRequirements?: string;
}

export interface AssessmentRequestResponse {
  referenceNumber: string;
  submittedAt: string;
}
