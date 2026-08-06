import type { SystemScopeStatus } from '../../../shared/store/intakeGovernanceStore';

export interface ApprovedScopeRow {
  code: string;
  name: string;
  defaultStatus: SystemScopeStatus;
}

export const ENVELOPE_APPROVED_SCOPE: ApprovedScopeRow[] = [
  { code: 'B', name: 'Shell', defaultStatus: 'inScope' },
  { code: 'B20', name: 'Exterior Enclosure', defaultStatus: 'inScope' },
  { code: 'B2010', name: 'Exterior Walls', defaultStatus: 'inScope' },
  { code: 'B2010.10', name: 'Wall Assemblies', defaultStatus: 'inScope' },
  { code: 'B2010.10.03', name: 'Masonry / Cladding Defects', defaultStatus: 'limited' },
  { code: 'B2020', name: 'Exterior Windows', defaultStatus: 'inScope' },
  { code: 'B2020.20', name: 'Window Glazing / Sealants', defaultStatus: 'inScope' },
  { code: 'B2020.20.01', name: 'Perimeter Joint', defaultStatus: 'inScope' },
  { code: 'B2030', name: 'Exterior Doors', defaultStatus: 'limited' },
  { code: 'B30', name: 'Roofing', defaultStatus: 'inScope' },
  { code: 'B3010', name: 'Roof Coverings', defaultStatus: 'inScope' },
  { code: 'B3010.10', name: 'Roof Membrane', defaultStatus: 'inScope' },
  { code: 'B3010.10.02', name: 'Lap Seams / Membrane Defects', defaultStatus: 'inScope' },
  { code: 'B3020', name: 'Roof Openings', defaultStatus: 'optionalReview' },
];

export interface EvidenceRequirement {
  title: string;
  description: string;
  status: 'Required' | 'Recommended';
}

export const EVIDENCE_BY_CONTEXT: Record<'bca' | 'envelope', EvidenceRequirement[]> = {
  envelope: [
    { title: 'Photos', description: 'Required for each envelope observation', status: 'Required' },
    { title: 'Thermal / IR', description: 'Required where moisture or heat loss is suspected', status: 'Required' },
    { title: 'Drone / Aerial', description: 'Recommended for roof/facade overview', status: 'Recommended' },
    { title: 'Moisture / Air Leakage Notes', description: 'Required for envelope risk observations', status: 'Required' },
    { title: 'Location', description: 'Elevation, gridline, roof zone, or plan reference', status: 'Required' },
  ],
  bca: [
    { title: 'Photos', description: 'Required for each building-system observation', status: 'Required' },
    { title: 'Location', description: 'Floor, room, gridline, roof zone, or plan reference', status: 'Required' },
    { title: 'Condition Rating', description: 'ASTM condition rating for every observation', status: 'Required' },
  ],
};
