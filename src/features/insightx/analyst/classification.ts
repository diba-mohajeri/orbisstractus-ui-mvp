import type { DeficiencySeverity, SystemName } from '../../../domain/portfolioAssets';

export const DEFICIENCY_TYPES: string[] = [
  'Structural — Cracking, movement, settlement',
  'Water / Moisture — Leakage, infiltration, ponding',
  'Envelope — Sealant failure, thermal bridging',
  'Safety — Trip hazards, guard deficiencies',
  'Code — Accessibility, fire separation',
  'Operational — Functional impairment',
  'Lifecycle / Aging — End-of-life deterioration',
  'Mechanical / Electrical — Equipment degradation',
  'Sitework — Drainage, paving, grading',
];

export const SUBCATEGORIES: string[] = [
  'Ponding — Standing water accumulation',
  'Leakage — Active water infiltration',
  'Infiltration — Moisture penetration through assembly',
  'Condensation — Interstitial moisture',
  'Seam / Joint Failure — Assembly discontinuity',
];

export const RISK_TYPES: string[] = [
  'Safety Risk — Injury potential',
  'Structural Risk — Failure potential',
  'Operational Risk — Service disruption',
  'Financial Risk — Escalating costs',
  'Regulatory Risk — Code / compliance exposure',
  'Moisture Risk — Progressive deterioration',
];

export const RISK_LEVELS: { value: 'low' | 'medium' | 'high' | 'critical'; label: string }[] = [
  { value: 'low', label: 'Low — Minimal consequence' },
  { value: 'medium', label: 'Medium — Moderate operational / financial concern' },
  { value: 'high', label: 'High — Significant impact if unaddressed' },
  { value: 'critical', label: 'Critical — Immediate unacceptable exposure' },
];

export const CODE_COMPLIANCE_FLAGS: string[] = [
  'None',
  'Ontario Building Code (OBC)',
  'Accessibility — AODA / barrier-free',
  'Fire Separation — compartmentalization',
  'Structural — load-bearing integrity',
  'Other — specify in narrative',
];

export const PRIORITY_TIMEFRAMES: string[] = [
  'Immediate — 0–1 year',
  'Short-Term — 1–3 years',
  'Medium-Term — 3–5 years',
  'Long-Term — 5–10 years',
  'Monitor — Observe only',
];

export const RUL_BASES: string[] = [
  'Age + condition + exposure (combined)',
  'Age only — installation date known',
  'Condition only — age unknown',
  'Failure mechanism progression',
  'Maintenance history review',
];

export const RUL_STATUSES: string[] = [
  'Near End of Life — 0–2 years',
  'Short Remaining Life — 3–5 years',
  'Mid-Life — 5–10 years',
  'Stable — 10+ years',
];

export const FAILURE_MECHANISMS: string[] = [
  'Water Ingress — envelope or membrane',
  'Freeze-Thaw — masonry / concrete',
  'Corrosion — steel / concrete reinforcement',
  'UV Degradation — roofing / sealants',
  'Thermal Movement — sealants / joints',
  'Differential Settlement — foundations / site',
  'Mechanical Fatigue — equipment',
  'Poor Drainage — roof / site',
];

export const RECOMMENDATION_TYPES: string[] = [
  'Monitor — Observe condition',
  'Maintain — Preventive maintenance',
  'Repair — Correct localized issue',
  'Replace — End-of-life renewal',
  'Investigate Further — Additional assessment required',
  'Immediate Action — Urgent intervention',
];

export const SEVERITY_OPTIONS: { value: DeficiencySeverity; label: string }[] = [
  { value: 'low', label: 'Low — Minor deterioration / cosmetic' },
  { value: 'medium', label: 'Moderate — Functional degradation beginning' },
  { value: 'high', label: 'High — Significant deterioration affecting performance' },
  { value: 'critical', label: 'Critical — Immediate or severe risk of failure' },
];

export const PHASING_OPTIONS: string[] = [
  '2026 — Immediate (0–1 yr)',
  '2027 — Short-Term (1–2 yr)',
  '2028 — Short-Term (2–3 yr)',
  '2029–2031 — Medium-Term',
  '2031+ — Long-Term',
];

export const RATE_SOURCES: string[] = [
  'RSMeans 2025 — Toronto region',
  'CIQS benchmark',
  'Internal cost library',
  'Contractor quote',
];

export const DEFAULT_DEFICIENCY_TYPE_BY_SYSTEM: Record<SystemName, string> = {
  Structure: DEFICIENCY_TYPES[0],
  'Building Envelope': DEFICIENCY_TYPES[2],
  Roofing: DEFICIENCY_TYPES[1],
  'Mechanical (HVAC)': DEFICIENCY_TYPES[7],
  Electrical: DEFICIENCY_TYPES[7],
  Plumbing: DEFICIENCY_TYPES[1],
  'Fire & Life Safety': DEFICIENCY_TYPES[4],
  'Interior Finishes': DEFICIENCY_TYPES[6],
  'Site & Civil': DEFICIENCY_TYPES[8],
};

export const DEFAULT_RISK_TYPE_BY_SYSTEM: Record<SystemName, string> = {
  Structure: RISK_TYPES[1],
  'Building Envelope': RISK_TYPES[5],
  Roofing: RISK_TYPES[5],
  'Mechanical (HVAC)': RISK_TYPES[2],
  Electrical: RISK_TYPES[0],
  Plumbing: RISK_TYPES[2],
  'Fire & Life Safety': RISK_TYPES[0],
  'Interior Finishes': RISK_TYPES[2],
  'Site & Civil': RISK_TYPES[0],
};

export const DEFAULT_FAILURE_MECHANISM_BY_SYSTEM: Record<SystemName, string> = {
  Structure: FAILURE_MECHANISMS[5],
  'Building Envelope': FAILURE_MECHANISMS[4],
  Roofing: FAILURE_MECHANISMS[0],
  'Mechanical (HVAC)': FAILURE_MECHANISMS[6],
  Electrical: FAILURE_MECHANISMS[6],
  Plumbing: FAILURE_MECHANISMS[0],
  'Fire & Life Safety': FAILURE_MECHANISMS[6],
  'Interior Finishes': FAILURE_MECHANISMS[3],
  'Site & Civil': FAILURE_MECHANISMS[7],
};

export const DEFAULT_UNIT_RATE_BY_SYSTEM: Record<SystemName, number> = {
  Structure: 220,
  'Building Envelope': 165,
  Roofing: 180,
  'Mechanical (HVAC)': 950,
  Electrical: 340,
  Plumbing: 260,
  'Fire & Life Safety': 410,
  'Interior Finishes': 95,
  'Site & Civil': 60,
};
