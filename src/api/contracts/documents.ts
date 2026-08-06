import type { AccessLevel, DocumentCategory } from '../../domain/documents';

export interface DocumentRow {
  id: string;
  name: string;
  buildingId: string;
  buildingName: string;
  category: DocumentCategory;
  uploadedBy: string;
  date: string;
  relatedProjectId: string | null;
  accessLevel: AccessLevel;
}
