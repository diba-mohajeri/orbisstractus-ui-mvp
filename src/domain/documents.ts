export const DOCUMENT_CATEGORIES = [
  'Reports',
  'Drawings',
  'Photos',
  'Drone Imagery',
  'Thermal Scans',
  'Engineering Letters',
  'Reserve Fund Documents',
  'Contracts',
  'Meeting Notes',
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];
export type AccessLevel = 'released' | 'internalUntilRelease' | 'visible' | 'requiresApproval';

export interface VaultDocument {
  id: string;
  name: string;
  buildingId: string;
  category: DocumentCategory;
  uploadedBy: string;
  date: string;
  relatedProjectId: string | null;
  accessLevel: AccessLevel;
}
