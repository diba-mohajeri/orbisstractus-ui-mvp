export type MessageStatus = 'open' | 'scheduled' | 'approved' | 'inReview';

export interface ClientMessage {
  id: string;
  subject: string;
  buildingId: string;
  projectId: string | null;
  assignedTo: string;
  status: MessageStatus;
  lastUpdated: string;
}
