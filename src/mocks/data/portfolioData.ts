import { createRng, intBetween, pick } from './seed';
import {
  CANONICAL_SYSTEM_NAMES,
  type AssetRecord,
  type Building,
  type BuildingSystem,
  type Condition,
  type Deficiency,
  type DeficiencySeverity,
  type HealthTier,
  type LifecycleExpenditureEntry,
  type Region,
  type RiskLevel,
  type SystemName,
  type SystemStatus,
} from '../../domain/portfolioAssets';
import type { Project, ProjectStatus, ServiceLine } from '../../domain/projects';
import type { Report, ReportStatus } from '../../domain/reports';
import type { ActionStatus, RemediationAction } from '../../domain/actions';
import type { CapitalPlanItem, CapitalPlanStatus, FundingSource } from '../../domain/capitalPlan';
import { DOCUMENT_CATEGORIES, type AccessLevel, type DocumentCategory, type VaultDocument } from '../../domain/documents';
import type { ClientMessage, MessageStatus } from '../../domain/messages';

const rng = createRng(20260709);

const REFERENCE_DATE = new Date('2026-07-01T00:00:00Z');
const REFERENCE_YEAR = 2026;

function addDays(days: number): string {
  const d = new Date(REFERENCE_DATE);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

const REGION_COMPANY: Record<string, string> = {
  'gta-west': 'absi',
  'gta-east': 'absi',
  ottawa: 'meridian',
  vancouver: 'vantage',
};

export const REGIONS: Region[] = [
  { id: 'gta-west', name: 'GTA West', companyId: REGION_COMPANY['gta-west'] },
  { id: 'gta-east', name: 'GTA East', companyId: REGION_COMPANY['gta-east'] },
  { id: 'ottawa', name: 'Ottawa', companyId: REGION_COMPANY.ottawa },
  { id: 'vancouver', name: 'Vancouver', companyId: REGION_COMPANY.vancouver },
];

const REGION_BUILDING_COUNTS: Record<string, number> = {
  'gta-west': 12,
  'gta-east': 8,
  ottawa: 4,
  vancouver: 5,
};

const BUILDING_NAME_ADJECTIVES = [
  'Maple', 'Cedar', 'Birch', 'Lakeview', 'Sunset', 'Northgate', 'Riverside', 'Harbour',
  'Elm', 'Pine', 'Willow', 'Stonebridge', 'Fairview', 'Meadow', 'Oakridge', 'Crestwood',
  'Silverbirch', 'Greenview', 'Hillcrest', 'Parkside', 'Bayview', 'Kingsway', 'Queensview', 'Westgate',
  'Alpine', 'Coastal', 'Cypress', 'Granite', 'Skyline',
];
const BUILDING_NAME_NOUNS = ['Towers', 'Plaza', 'Court', 'Residences', 'Terrace', 'Commons', 'Apartments', 'Manor', 'Heights', 'Gardens'];

const ASSET_CLASSES = ['Residential', 'Residential', 'Residential', 'Mixed Use', 'Commercial'];

const CLIENT_ORG_SUFFIXES = ['Properties Inc.', 'Holdings Ltd.', 'Realty Group', 'Property Management', 'Asset Partners'];
const CLIENT_CONTACT_FIRST = ['J.', 'A.', 'M.', 'S.', 'D.', 'L.', 'R.', 'K.'];
const CLIENT_CONTACT_LAST = ['Wong', 'Ahmadi', 'Singh', 'Chen', 'Osei', 'Fontaine', 'Ibrahim', 'Delgado'];
const ENGAGEMENT_PURPOSES = [
  'Lender requirement — refinancing',
  'Routine reserve fund study cycle',
  'Pre-acquisition due diligence',
  'Insurance renewal requirement',
  'Board-requested condition update',
];
const OCCUPANCY_TYPES = [
  'Residential — Condominium',
  'Commercial — Office/Retail',
  'Mixed Use — Residential/Commercial',
  'Residential — Rental Apartment',
];
const STRUCTURE_TYPES = ['RC frame', 'Masonry bearing wall', 'Steel frame', 'Wood frame'];
const ENVELOPE_TYPES = ['Brick veneer + curtain wall', 'Precast concrete panel', 'Brick masonry', 'Metal cladding + glazing'];
const SUPERINTENDENT_FIRST = ['Mike', 'Sara', 'Tom', 'Elena', 'Jordan', 'Priya'];
const SUPERINTENDENT_LAST_INITIAL = ['R.', 'K.', 'B.', 'M.', 'T.', 'V.'];
const ROOF_ACCESS_NOTES = [
  'Accessible via roof hatch — anchor points certified.',
  'Accessible via roof hatch — anchor point certification unconfirmed, inspector to bring own harness.',
  'Ladder access only — coordinate with superintendent.',
  'Accessible via stairwell door — no fall protection concerns noted.',
];
const PARKING_ACCESS_NOTES = [
  'P1 level — key fob required from superintendent.',
  'P2 level — superintendent escort required.',
  'Surface lot — no access restrictions.',
  'Underground garage — gate code provided on-site.',
];

const HEALTH_TIER_RANGE: Record<HealthTier, [number, number]> = {
  healthy: [85, 98],
  monitor: [65, 84],
  atRisk: [45, 64],
  critical: [20, 44],
};

const HEALTH_TIER_RISK: Record<HealthTier, RiskLevel[]> = {
  healthy: ['low'],
  monitor: ['low', 'medium'],
  atRisk: ['medium', 'high'],
  critical: ['high'],
};

function shuffledHealthTiers(): HealthTier[] {
  const tiers: HealthTier[] = [
    ...Array<HealthTier>(11).fill('healthy'),
    ...Array<HealthTier>(8).fill('monitor'),
    ...Array<HealthTier>(7).fill('atRisk'),
    ...Array<HealthTier>(3).fill('critical'),
  ];
  for (let i = tiers.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [tiers[i], tiers[j]] = [tiers[j], tiers[i]];
  }
  return tiers;
}

function buildBuildings(): Building[] {
  const tiers = shuffledHealthTiers();
  const buildings: Building[] = [];
  let index = 0;

  REGIONS.forEach((region) => {
    const count = REGION_BUILDING_COUNTS[region.id];
    for (let i = 0; i < count; i += 1) {
      const tier = tiers[index];
      const [minHealth, maxHealth] = HEALTH_TIER_RANGE[tier];
      const healthPct = intBetween(rng, minHealth, maxHealth);
      const riskLevel = pick(rng, HEALTH_TIER_RISK[tier]);
      const status = tier === 'healthy' ? pick(rng, ['active', 'stable'] as const) : 'monitor';
      const baseExposure = intBetween(rng, 400_000, 2_200_000);
      const exposureFactor = 1 + (100 - healthPct) / 60;
      const capitalExposure = Math.round((baseExposure * exposureFactor) / 10_000) * 10_000;

      buildings.push({
        id: `bldg-${index + 1}`,
        name: `${BUILDING_NAME_ADJECTIVES[index]} ${BUILDING_NAME_NOUNS[index % BUILDING_NAME_NOUNS.length]}`,
        address: `${100 + index * 15} ${BUILDING_NAME_ADJECTIVES[index]} St, ${region.name}`,
        regionId: region.id,
        companyId: region.companyId,
        assetClass: pick(rng, ASSET_CLASSES),
        riskLevel,
        capitalExposure,
        status,
        healthPct,
        healthTier: tier,
        clientOrganization: `${BUILDING_NAME_ADJECTIVES[index]} ${pick(rng, CLIENT_ORG_SUFFIXES)}`,
        clientContactName: `${pick(rng, CLIENT_CONTACT_FIRST)} ${pick(rng, CLIENT_CONTACT_LAST)}`,
        clientContactEmail: `${pick(rng, CLIENT_CONTACT_LAST).toLowerCase()}@${BUILDING_NAME_ADJECTIVES[index].toLowerCase()}.ca`,
        engagementPurpose: pick(rng, ENGAGEMENT_PURPOSES),
        yearBuilt: intBetween(rng, 1968, 2018),
        grossFloorAreaSqm: intBetween(rng, 4500, 28000),
        storeys: intBetween(rng, 3, 32),
        occupancyType: pick(rng, OCCUPANCY_TYPES),
        structureType: pick(rng, STRUCTURE_TYPES),
        envelopeType: pick(rng, ENVELOPE_TYPES),
        siteSuperintendentName: `${pick(rng, SUPERINTENDENT_FIRST)} ${pick(rng, SUPERINTENDENT_LAST_INITIAL)}`,
        siteSuperintendentPhone: `647-555-${String(intBetween(rng, 1000, 9999))}`,
        roofAccessNotes: pick(rng, ROOF_ACCESS_NOTES),
        parkingAccessNotes: pick(rng, PARKING_ACCESS_NOTES),
      });

      index += 1;
    }
  });

  return buildings;
}

export const BUILDINGS: Building[] = buildBuildings();

const SYSTEM_STATUS_BY_TIER: Record<HealthTier, SystemStatus[]> = {
  healthy: ['good', 'good', 'fair'],
  monitor: ['good', 'fair', 'fair'],
  atRisk: ['fair', 'fair', 'poor'],
  critical: ['fair', 'poor', 'poor'],
};

function buildBuildingSystems(): BuildingSystem[] {
  const systems: BuildingSystem[] = [];
  BUILDINGS.forEach((building) => {
    CANONICAL_SYSTEM_NAMES.forEach((systemName) => {
      systems.push({
        id: `${building.id}-${systemName.replace(/[^a-zA-Z]/g, '').toLowerCase()}`,
        buildingId: building.id,
        systemName,
        status: pick(rng, SYSTEM_STATUS_BY_TIER[building.healthTier]),
        completenessPct: intBetween(rng, 62, 100),
      });
    });
  });
  return systems;
}

export const BUILDING_SYSTEMS: BuildingSystem[] = buildBuildingSystems();

const COMPONENT_POOL: Record<SystemName, string[]> = {
  Structure: ['Foundation', 'Slab-on-Grade', 'Structural Columns', 'Load-Bearing Walls', 'Beams'],
  'Building Envelope': ['Curtain Wall', 'Cladding Panels', 'Sealant Joints', 'Windows', 'Balcony Guards'],
  Roofing: ['Roof Membrane', 'Flashing', 'Roof Drains', 'Insulation', 'Parapet Caps'],
  'Mechanical (HVAC)': ['Rooftop Unit', 'Boiler', 'Chiller', 'Ductwork', 'Circulation Pumps'],
  Electrical: ['Main Switchgear', 'Distribution Panels', 'Lighting', 'Emergency Generator'],
  Plumbing: ['Domestic Water Piping', 'Sanitary Piping', 'Fixtures', 'Backflow Preventer'],
  'Fire & Life Safety': ['Sprinkler System', 'Fire Alarm Panel', 'Standpipes', 'Extinguishers'],
  'Interior Finishes': ['Corridor Flooring', 'Ceiling Systems', 'Wall Finishes', 'Interior Doors'],
  'Site & Civil': ['Parking Garage Deck', 'Sidewalks', 'Retaining Walls', 'Site Drainage', 'Landscaping'],
};

const CONDITION_BY_SYSTEM_STATUS: Record<SystemStatus, Condition[]> = {
  good: ['good', 'good', 'fair'],
  fair: ['fair', 'fair', 'poor'],
  poor: ['poor', 'poor', 'critical'],
};

// Typical Expected Useful Life (years) by system, used as the floor when deriving
// expectedUsefulLifeYears from the already-generated RUL (see buildAssetRecords below).
const SYSTEM_EUL_BASE: Record<SystemName, number> = {
  Structure: 60,
  'Building Envelope': 30,
  Roofing: 20,
  'Mechanical (HVAC)': 20,
  Electrical: 35,
  Plumbing: 40,
  'Fire & Life Safety': 25,
  'Interior Finishes': 15,
  'Site & Civil': 25,
};

function buildAssetRecords(): AssetRecord[] {
  const records: AssetRecord[] = [];
  let counter = 1;

  BUILDING_SYSTEMS.forEach((buildingSystem) => {
    const pool = COMPONENT_POOL[buildingSystem.systemName];
    const componentCount = intBetween(rng, 4, 8);
    for (let i = 0; i < componentCount; i += 1) {
      const component = pool[i % pool.length];
      const condition = pick(rng, CONDITION_BY_SYSTEM_STATUS[buildingSystem.status]);
      const riskLevel: RiskLevel = condition === 'critical' ? 'high' : condition === 'poor' ? pick(rng, ['medium', 'high']) : condition === 'fair' ? 'medium' : 'low';
      const rul = condition === 'critical' ? intBetween(rng, 0, 2) : condition === 'poor' ? intBetween(rng, 1, 5) : condition === 'fair' ? intBetween(rng, 5, 15) : intBetween(rng, 12, 40);
      const replacementCost = intBetween(rng, 8, 380) * 1_000;

      // Reserve Fund fields — derived from the RUL above so expectedUsefulLifeYears -
      // effectiveAgeYears always equals remainingUsefulLifeYears, without changing RUL's
      // existing distribution (capital plan generation and KPIs key off RUL as-is).
      const expectedUsefulLifeYears = Math.max(SYSTEM_EUL_BASE[buildingSystem.systemName], rul + intBetween(rng, 1, 6));
      const effectiveAgeYears = expectedUsefulLifeYears - rul;
      const futureReplacementYear = REFERENCE_YEAR + rul;
      const inflationAssumptionPct = Math.round((2.5 + rng() * 2) * 10) / 10;

      records.push({
        id: `AR-${String(counter).padStart(5, '0')}`,
        buildingId: buildingSystem.buildingId,
        systemName: buildingSystem.systemName,
        component,
        condition,
        riskLevel,
        remainingUsefulLifeYears: rul,
        replacementCost,
        expectedUsefulLifeYears,
        effectiveAgeYears,
        futureReplacementYear,
        inflationAssumptionPct,
      });
      counter += 1;
    }
  });

  return records;
}

export const ASSET_RECORDS: AssetRecord[] = buildAssetRecords();

export interface UpdateAssetRecordPatch {
  expectedUsefulLifeYears?: number;
  effectiveAgeYears?: number;
  replacementCost?: number;
  futureReplacementYear?: number;
  inflationAssumptionPct?: number;
}

export function updateAssetRecord(id: string, patch: UpdateAssetRecordPatch): AssetRecord | null {
  const record = ASSET_RECORDS.find((r) => r.id === id);
  if (!record) return null;
  Object.assign(record, patch);
  record.remainingUsefulLifeYears = Math.max(0, record.expectedUsefulLifeYears - record.effectiveAgeYears);
  return record;
}

const LIFECYCLE_EXPENDITURES: Record<string, LifecycleExpenditureEntry[]> = {};
let lifecycleExpenditureCounter = 1;

function seedLifecycleExpenditures(): void {
  ASSET_RECORDS.forEach((record, index) => {
    if (index % 4 !== 0) return; // seed a subset for demo realism, not every record
    const entryCount = intBetween(rng, 1, 2);
    const entries: LifecycleExpenditureEntry[] = [];
    for (let i = 0; i < entryCount; i += 1) {
      entries.push({
        id: `LEX-${String(lifecycleExpenditureCounter).padStart(5, '0')}`,
        assetRecordId: record.id,
        date: addDays(-intBetween(rng, 60, 900)),
        description: pick(rng, ['Preventive maintenance', 'Minor repair', 'Component inspection', 'Partial replacement']),
        cost: intBetween(rng, 500, 15_000),
      });
      lifecycleExpenditureCounter += 1;
    }
    LIFECYCLE_EXPENDITURES[record.id] = entries;
  });
}

seedLifecycleExpenditures();

export function getLifecycleExpenditures(assetRecordId: string): LifecycleExpenditureEntry[] {
  return LIFECYCLE_EXPENDITURES[assetRecordId] ?? [];
}

export function addLifecycleExpenditureEntry(
  assetRecordId: string,
  entry: { date: string; description: string; cost: number },
): LifecycleExpenditureEntry {
  const created: LifecycleExpenditureEntry = {
    id: `LEX-${String(lifecycleExpenditureCounter).padStart(5, '0')}`,
    assetRecordId,
    ...entry,
  };
  lifecycleExpenditureCounter += 1;
  const existing = LIFECYCLE_EXPENDITURES[assetRecordId] ?? [];
  LIFECYCLE_EXPENDITURES[assetRecordId] = [created, ...existing];
  return created;
}

const DEFICIENCY_TEMPLATES: Record<SystemName, string[]> = {
  Structure: ['Concrete spalling observed at exposed columns', 'Cracking in load-bearing wall requiring monitoring'],
  'Building Envelope': ['Sealant failure allowing water infiltration', 'Cladding panel displacement at upper floors'],
  Roofing: ['Membrane blistering and ponding water', 'Deteriorated flashing at roof penetrations'],
  'Mechanical (HVAC)': ['Rooftop unit beyond service life, reduced efficiency', 'Boiler showing corrosion, reduced capacity'],
  Electrical: ['Distribution panel showing signs of overheating', 'Emergency generator failed load test'],
  Plumbing: ['Recurring leaks in domestic water piping', 'Backflow preventer failed annual test'],
  'Fire & Life Safety': ['Sprinkler coverage gap identified in storage areas', 'Fire alarm panel flagged for obsolescence'],
  'Interior Finishes': ['Corridor flooring showing wear beyond expected lifecycle', 'Ceiling tile water staining from above leak'],
  'Site & Civil': ['Parking garage deck spalling and exposed rebar', 'Site drainage undersized for current storm loads'],
};

const SEVERITY_BY_CONDITION: Record<Condition, DeficiencySeverity> = {
  critical: 'critical',
  poor: 'high',
  fair: 'medium',
  good: 'low',
};

function buildDeficiencies(): Deficiency[] {
  const deficiencies: Deficiency[] = [];
  let counter = 1;

  const flagged = ASSET_RECORDS.filter((record) => record.condition === 'poor' || record.condition === 'critical');

  flagged.forEach((record) => {
    if (rng() > 0.55) return;
    const templates = DEFICIENCY_TEMPLATES[record.systemName];
    deficiencies.push({
      id: `DEF-${String(counter).padStart(4, '0')}`,
      buildingId: record.buildingId,
      systemName: record.systemName,
      description: pick(rng, templates),
      severity: SEVERITY_BY_CONDITION[record.condition],
      estimatedCost: record.replacementCost + intBetween(rng, 2, 40) * 1_000,
    });
    counter += 1;
  });

  return deficiencies;
}

export const DEFICIENCIES: Deficiency[] = buildDeficiencies();

const SERVICE_LINES: ServiceLine[] = ['BCA', 'EnvelopeX', 'ReserveX', 'EnergyX'];
const CONSULTANTS = ['J. Alvarez', 'M. Chen', 'R. Singh', "K. O'Brien", 'T. Nakamura', 'S. Reyes'];
const ASSESSMENT_HORIZONS = [5, 10, 15, 20] as const;
const DELIVERY_METHODS = ['Portal', 'Email', 'Both'] as const;
const STAGE_BY_STATUS: Record<ProjectStatus, string[]> = {
  active: ['Field Inspection', 'Analysis', 'Report Drafting', 'QA Review'],
  planned: ['Scoping', 'Intake Review'],
  complete: ['Delivered'],
};

function buildProjects(): Project[] {
  const projects: Project[] = [];
  let counter = 1;

  BUILDINGS.filter((b) => b.healthTier !== 'healthy').forEach((building) => {
    const status: ProjectStatus =
      building.healthTier === 'monitor' ? pick(rng, ['active', 'planned'] as const) : 'active';
    const targetOffsetDays = status === 'active' ? intBetween(rng, 20, 90) : intBetween(rng, 60, 180);

    projects.push({
      id: `PRJ-${String(counter).padStart(3, '0')}`,
      buildingId: building.id,
      serviceLine: pick(rng, SERVICE_LINES),
      status,
      currentStage: pick(rng, STAGE_BY_STATUS[status]),
      consultantLead: pick(rng, CONSULTANTS),
      targetDeliveryDate: addDays(targetOffsetDays),
      siteVisitDate: addDays(intBetween(rng, 3, 30)),
      assessmentHorizonYears: pick(rng, ASSESSMENT_HORIZONS),
      pEngReviewerName: pick(rng, CONSULTANTS),
      inspectorName: pick(rng, CONSULTANTS),
      deliveryMethod: pick(rng, DELIVERY_METHODS),
    });
    counter += 1;
  });

  return projects;
}

export const PROJECTS: Project[] = buildProjects();

export function addProject(project: Project): void {
  PROJECTS.push(project);
}

export function deleteProject(id: string): boolean {
  const index = PROJECTS.findIndex((p) => p.id === id);
  if (index === -1) return false;
  PROJECTS.splice(index, 1);
  return true;
}

const REPORT_SERVICE_LINES = ['BCA', 'Building Envelope', 'Energy', 'Reserve Fund', 'Execution'];
const REPORT_STATUS_WEIGHTS: ReportStatus[] = [
  'released', 'released', 'released', 'clientApproved', 'clientApproved', 'superseded', 'draftHidden',
];

function formatsForStatus(status: ReportStatus): string[] {
  if (status === 'draftHidden') return [];
  if (status === 'superseded') return ['PDF'];
  return ['PDF', 'Word', 'Excel', 'Portal View'];
}

function buildReports(): Report[] {
  const reports: Report[] = [];
  let counter = 1;

  BUILDINGS.forEach((building) => {
    const reportCount = intBetween(rng, 1, 2);
    for (let i = 0; i < reportCount; i += 1) {
      const status = pick(rng, REPORT_STATUS_WEIGHTS);
      reports.push({
        id: `RPT-${String(counter).padStart(4, '0')}`,
        buildingId: building.id,
        serviceLine: pick(rng, REPORT_SERVICE_LINES),
        version: `v${intBetween(rng, 1, 3)}.${intBetween(rng, 0, 2)}`,
        releaseDate: addDays(-intBetween(rng, 10, 400)),
        status,
        availableFormats: formatsForStatus(status),
      });
      counter += 1;
    }
  });

  return reports;
}

export const REPORTS: Report[] = buildReports();

const OWNERS = ['A. Kim', 'D. Osei', 'L. Fontaine', 'P. Marchetti', 'N. Ibrahim', 'C. Delgado'];
export const ACTION_NAME_PREFIX: Record<DeficiencySeverity, string> = {
  critical: 'Emergency Repair',
  high: 'Priority Remediation',
  medium: 'Scheduled Repair',
  low: 'Routine Maintenance',
};
const DUE_OFFSET_RANGE: Record<DeficiencySeverity, [number, number]> = {
  critical: [-15, 45],
  high: [-10, 90],
  medium: [30, 180],
  low: [90, 300],
};

function buildActions(): RemediationAction[] {
  let counter = 1;

  return DEFICIENCIES.map((d) => {
    const completionPct = intBetween(rng, 0, 100);
    const [minOffset, maxOffset] = DUE_OFFSET_RANGE[d.severity];
    const dueOffsetDays = intBetween(rng, minOffset, maxOffset);
    const status: ActionStatus =
      completionPct >= 100 ? 'completed' : dueOffsetDays < 0 ? 'overdue' : completionPct > 0 ? 'inProgress' : 'open';

    const action: RemediationAction = {
      id: `ACT-${String(counter).padStart(4, '0')}`,
      deficiencyId: d.id,
      buildingId: d.buildingId,
      systemName: d.systemName,
      actionName: `${ACTION_NAME_PREFIX[d.severity]} — ${d.systemName}`,
      priority: d.severity,
      owner: pick(rng, OWNERS),
      dueDate: addDays(dueOffsetDays),
      budget: d.estimatedCost,
      completionPct,
      status,
      peoReviewNeeded: d.severity === 'critical' || d.severity === 'high',
    };
    counter += 1;
    return action;
  });
}

export const ACTIONS: RemediationAction[] = buildActions();

const FUNDING_BY_PRIORITY: Record<DeficiencySeverity, FundingSource[]> = {
  critical: ['Reserve Fund', 'Reserve Fund', 'Special Assessment'],
  high: ['Reserve Fund', 'Special Assessment', 'Operating Budget'],
  medium: ['Operating Budget', 'Unfunded'],
  low: ['Unfunded', 'Unfunded', 'Operating Budget'],
};

function statusForFunding(fundingSource: FundingSource, priority: DeficiencySeverity): CapitalPlanStatus {
  if (fundingSource === 'Unfunded') return 'unfunded';
  if (priority === 'critical') return 'inProgress';
  return 'funded';
}

function buildCapitalPlanItems(): CapitalPlanItem[] {
  const items: CapitalPlanItem[] = [];
  let counter = 1;

  ASSET_RECORDS.filter((r) => r.remainingUsefulLifeYears <= 10).forEach((record) => {
    const priority = SEVERITY_BY_CONDITION[record.condition];
    const fundingSource = pick(rng, FUNDING_BY_PRIORITY[priority]);
    const recommendedWork =
      record.condition === 'critical' || record.condition === 'poor'
        ? `Replace ${record.component}`
        : `Repair ${record.component}`;

    items.push({
      id: `CAP-${String(counter).padStart(4, '0')}`,
      buildingId: record.buildingId,
      systemName: record.systemName,
      year: REFERENCE_YEAR + record.remainingUsefulLifeYears,
      recommendedWork,
      priority,
      forecastCost: record.replacementCost,
      fundingSource,
      status: statusForFunding(fundingSource, priority),
    });
    counter += 1;
  });

  return items;
}

export const CAPITAL_PLAN_ITEMS: CapitalPlanItem[] = buildCapitalPlanItems();

const UPLOADERS = ['InsightX QA Team', 'Field Inspector', 'Property Manager', 'Consulting Engineer', 'Client Admin'];

const ACCESS_BY_CATEGORY: Record<DocumentCategory, AccessLevel[]> = {
  Reports: ['released', 'released', 'internalUntilRelease'],
  Drawings: ['visible', 'visible'],
  Photos: ['visible', 'visible', 'released'],
  'Drone Imagery': ['visible', 'requiresApproval'],
  'Thermal Scans': ['visible', 'requiresApproval'],
  'Engineering Letters': ['released', 'requiresApproval'],
  'Reserve Fund Documents': ['requiresApproval', 'visible'],
  Contracts: ['requiresApproval'],
  'Meeting Notes': ['visible', 'released'],
};

const DOC_NAME_BY_CATEGORY: Record<DocumentCategory, string[]> = {
  Reports: ['Building Condition Assessment Report', 'Reserve Fund Study Report'],
  Drawings: ['As-Built Architectural Drawings', 'Structural Drawing Set'],
  Photos: ['Site Photo Package', 'Elevation Photo Set'],
  'Drone Imagery': ['Roof Drone Survey', 'Facade Drone Survey'],
  'Thermal Scans': ['Envelope Thermal Scan', 'Roof Thermal Scan'],
  'Engineering Letters': ['Structural Engineering Letter', 'P.Eng. Certification Letter'],
  'Reserve Fund Documents': ['Reserve Fund Plan', 'Reserve Fund Contribution Schedule'],
  Contracts: ['Remediation Contract', 'Consulting Services Agreement'],
  'Meeting Notes': ['Board Meeting Minutes', 'Client Kickoff Notes'],
};

function buildDocuments(): VaultDocument[] {
  const documents: VaultDocument[] = [];
  let counter = 1;

  BUILDINGS.forEach((building) => {
    const buildingProjects = PROJECTS.filter((p) => p.buildingId === building.id);
    const docCount = intBetween(rng, 2, 4);
    for (let i = 0; i < docCount; i += 1) {
      const category = pick(rng, DOCUMENT_CATEGORIES);
      const accessLevel = pick(rng, ACCESS_BY_CATEGORY[category]);
      documents.push({
        id: `DOC-${String(counter).padStart(4, '0')}`,
        name: pick(rng, DOC_NAME_BY_CATEGORY[category]),
        buildingId: building.id,
        category,
        uploadedBy: pick(rng, UPLOADERS),
        date: addDays(-intBetween(rng, 5, 500)),
        relatedProjectId: buildingProjects.length > 0 ? pick(rng, buildingProjects).id : null,
        accessLevel,
      });
      counter += 1;
    }
  });

  return documents;
}

export const DOCUMENTS: VaultDocument[] = buildDocuments();

const ASSIGNEES = ['PM Team', 'Client Success', 'Consulting Engineer', 'Property Manager'];
const MESSAGE_STATUS_POOL: MessageStatus[] = ['open', 'scheduled', 'approved', 'inReview'];
const MESSAGE_SUBJECTS = [
  'Question about reserve fund timeline',
  'Request for updated inspection photos',
  'Clarification on capital plan priority',
  'Meeting request to review findings',
  'Follow-up on remediation budget approval',
  'Question about report delivery date',
];

function buildMessages(): ClientMessage[] {
  const messages: ClientMessage[] = [];
  const activeBuildings = BUILDINGS.filter((b) => b.healthTier !== 'healthy').slice(0, 6);

  activeBuildings.forEach((building, index) => {
    const project = PROJECTS.find((p) => p.buildingId === building.id) ?? null;
    messages.push({
      id: `MSG-${String(index + 1).padStart(3, '0')}`,
      subject: MESSAGE_SUBJECTS[index % MESSAGE_SUBJECTS.length],
      buildingId: building.id,
      projectId: project?.id ?? null,
      assignedTo: pick(rng, ASSIGNEES),
      status: pick(rng, MESSAGE_STATUS_POOL),
      lastUpdated: addDays(-intBetween(rng, 1, 30)),
    });
  });

  return messages;
}

export const MESSAGES: ClientMessage[] = buildMessages();

export function addMessage(message: ClientMessage): void {
  MESSAGES.unshift(message);
}

export function addDeficiency(deficiency: Deficiency): void {
  DEFICIENCIES.unshift(deficiency);
}

export function addAction(action: RemediationAction): void {
  ACTIONS.unshift(action);
}

export function addCapitalPlanItem(item: CapitalPlanItem): void {
  CAPITAL_PLAN_ITEMS.unshift(item);
}
