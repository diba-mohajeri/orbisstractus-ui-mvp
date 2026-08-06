import type { MessageStatus } from '../../domain/messages';

export interface MessageRow {
  id: string;
  subject: string;
  buildingId: string;
  buildingName: string;
  projectId: string | null;
  assignedTo: string;
  status: MessageStatus;
  lastUpdated: string;
}

export interface CreateMessageRequest {
  subject: string;
  buildingId: string;
  projectId: string | null;
}
