export interface AssessmentScopeCard {
  name: string;
  description: string;
  status: string;
}

export interface AssessmentScopeConfig {
  title: string;
  description: string;
  evidence: string;
  cards: AssessmentScopeCard[];
}

export const ASSESSMENT_SCOPE_BY_CONTEXT: Record<'bca' | 'envelope', AssessmentScopeConfig> = {
  bca: {
    title: 'Assessment Scope · BCA',
    description:
      'Broad BCA scope generated from the ASTM backbone. Focus: condition, lifecycle, RUL, cost, capital planning, and report traceability.',
    evidence: 'Photos, lifecycle observations, condition ratings, selective drone/thermal evidence',
    cards: [
      { name: 'A10 Foundations', description: 'Visual from accessible areas', status: 'In Scope' },
      { name: 'B10 Superstructure', description: 'Visual review of structural elements', status: 'Limited' },
      { name: 'B20 Exterior Enclosure', description: 'Visual + selected thermal evidence', status: 'In Scope' },
      { name: 'B30 Roofing', description: 'Visual + probe + photo evidence', status: 'In Scope' },
      { name: 'C Interiors', description: 'Common areas only', status: 'Limited' },
      { name: 'D Services', description: 'HVAC, plumbing, fire protection, electrical', status: 'In Scope' },
      { name: 'G Sitework', description: 'Paving, walks, site lighting, drainage', status: 'In Scope' },
    ],
  },
  envelope: {
    title: 'Assessment Scope · Building Envelope',
    description:
      'Envelope scope generated from the same ASTM backbone. Focus: enclosure performance, moisture, thermal, air leakage, roofing, windows, sealants, flashing, and drone/IR evidence.',
    evidence: 'Thermal / IR, drone imagery, moisture indicators, glazing/sealant evidence',
    cards: [
      { name: 'B2010 Exterior Walls', description: 'Cladding, masonry, wall assemblies, transitions', status: 'In Scope' },
      { name: 'B2020 Exterior Windows', description: 'Glazing, frames, perimeter joints, sealants', status: 'In Scope' },
      { name: 'B2030 Exterior Doors', description: 'Door interfaces, thresholds, weathering', status: 'Limited' },
      { name: 'B3010 Roof Coverings', description: 'Membrane, seams, ponding, drains, flashing', status: 'In Scope' },
      { name: 'B3020 Roof Openings', description: 'Curbs, penetrations, skylights, hatches', status: 'In Scope' },
      { name: 'Thermal / IR Evidence', description: 'Thermal anomaly and moisture screening', status: 'Required' },
      { name: 'Drone / Aerial Evidence', description: 'Roof/facade overview and defect localization', status: 'Recommended' },
    ],
  },
};
