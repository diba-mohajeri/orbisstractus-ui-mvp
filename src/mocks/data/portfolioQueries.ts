import type { DeficiencySeverity, HealthTier, RiskLevel } from '../../domain/portfolioAssets';
import { STAGE_TO_MILESTONE_INDEX, MILESTONE_STAGES } from '../../domain/projects';
import type { ClientMessage } from '../../domain/messages';
import type { Deficiency } from '../../domain/portfolioAssets';
import type { RemediationAction } from '../../domain/actions';
import type { CapitalPlanItem } from '../../domain/capitalPlan';
import { formatCurrency } from '../../shared/utils/format';
import { getActiveCompanyId } from './tenantScope';
import {
  ACTION_NAME_PREFIX,
  ACTIONS,
  ASSET_RECORDS,
  BUILDINGS,
  BUILDING_SYSTEMS,
  CAPITAL_PLAN_ITEMS,
  DEFICIENCIES,
  DOCUMENTS,
  MESSAGES,
  PROJECTS,
  REGIONS,
  REPORTS,
  addAction,
  addCapitalPlanItem,
  addDeficiency,
  addLifecycleExpenditureEntry,
  addMessage,
  getLifecycleExpenditures,
  updateAssetRecord,
  type UpdateAssetRecordPatch,
} from './portfolioData';

// Tenant scoping: every read in this file that lists/enumerates buildings, regions, or
// building-derived records (deficiencies, projects, reports, actions, capital plan items,
// documents, messages, asset records) goes through these, so a company-scoped employee only
// ever sees their own company's data. Platform admins and the client portal see everything
// (getActiveCompanyId() returns null for them) — see tenantScope.ts for the exact rule.
function visibleBuildings() {
  const companyId = getActiveCompanyId();
  return companyId ? BUILDINGS.filter((b) => b.companyId === companyId) : BUILDINGS;
}

function visibleBuildingIds(): Set<string> {
  return new Set(visibleBuildings().map((b) => b.id));
}

function visibleRegions() {
  const companyId = getActiveCompanyId();
  return companyId ? REGIONS.filter((r) => r.companyId === companyId) : REGIONS;
}

function visibleReports() {
  const buildingIds = visibleBuildingIds();
  return REPORTS.filter((r) => r.status !== 'draftHidden' && buildingIds.has(r.buildingId));
}

export function computePortfolioSummary() {
  const buildings = visibleBuildings();
  const buildingIds = visibleBuildingIds();
  const assetRecords = ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId));
  const projects = PROJECTS.filter((p) => buildingIds.has(p.buildingId));
  const deficiencies = DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId));

  const totalCapitalExposure = buildings.reduce((sum, b) => sum + b.capitalExposure, 0);
  const nearTermExposure = buildings.filter((b) => b.healthTier === 'atRisk' || b.healthTier === 'critical').reduce(
    (sum, b) => sum + b.capitalExposure,
    0,
  );
  const highRiskItems = assetRecords.filter((r) => r.riskLevel === 'high').length;
  const avgHealth = buildings.length ? Math.round(buildings.reduce((sum, b) => sum + b.healthPct, 0) / buildings.length) : 0;
  const activeAssessments = projects.filter((p) => p.status === 'active').length;
  const upcomingProjects = projects.filter((p) => p.status === 'planned').length;
  const reserveRequirements = Math.round((totalCapitalExposure * 0.45) / 10_000) * 10_000;

  return {
    buildings: buildings.length,
    activeProjects: projects.length,
    reportsAvailable: visibleReports().length,
    openDeficiencies: deficiencies.length,
    highRiskItems,
    capitalExposure5yr: formatCurrency(nearTermExposure),
    capitalForecast30yr: formatCurrency(totalCapitalExposure),
    portfolioHealthPct: avgHealth,
    activeAssessments,
    upcomingProjects,
    reserveRequirements: formatCurrency(reserveRequirements),
    totalCapitalExposureRaw: totalCapitalExposure,
  };
}

export function computeRegionSummaries() {
  const buildings = visibleBuildings();
  return visibleRegions().map((region) => {
    const regionBuildings = buildings.filter((b) => b.regionId === region.id);
    const capitalExposure = regionBuildings.reduce((sum, b) => sum + b.capitalExposure, 0);
    const riskCounts: Record<RiskLevel, number> = { low: 0, medium: 0, high: 0 };
    regionBuildings.forEach((b) => {
      riskCounts[b.riskLevel] += 1;
    });
    const dominantRisk: RiskLevel = riskCounts.high >= riskCounts.medium && riskCounts.high > 0
      ? 'high'
      : riskCounts.medium >= riskCounts.low
        ? 'medium'
        : 'low';
    const status = regionBuildings.some((b) => b.healthTier === 'critical' || b.healthTier === 'atRisk')
      ? 'monitor'
      : 'active';
    const assetClassCounts = new Map<string, number>();
    regionBuildings.forEach((b) => assetClassCounts.set(b.assetClass, (assetClassCounts.get(b.assetClass) ?? 0) + 1));
    const dominantAssetClass = [...assetClassCounts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'Residential';
    const avgHealthPct = regionBuildings.length
      ? Math.round(regionBuildings.reduce((sum, b) => sum + b.healthPct, 0) / regionBuildings.length)
      : 0;

    return {
      id: region.id,
      name: region.name,
      buildingCount: regionBuildings.length,
      assetClass: dominantAssetClass,
      riskRating: dominantRisk,
      capitalExposure: formatCurrency(capitalExposure),
      status,
      healthScore: avgHealthPct,
    };
  });
}

export function computeHealthTierCounts() {
  const buildings = visibleBuildings();
  const tiers: { tier: HealthTier; label: string; description: string }[] = [
    { tier: 'healthy', label: 'Healthy', description: 'Stable condition, no major near-term intervention.' },
    { tier: 'monitor', label: 'Monitor', description: 'Normal aging, scheduled follow-up recommended.' },
    { tier: 'atRisk', label: 'At Risk', description: 'Elevated envelope, garage, or mechanical risk.' },
    { tier: 'critical', label: 'Critical', description: 'Immediate capital or safety planning required.' },
  ];
  return tiers.map((t) => ({
    ...t,
    count: buildings.filter((b) => b.healthTier === t.tier).length,
  }));
}

export function getBuildingSummaries() {
  return visibleBuildings().map((b) => ({
    ...b,
    regionName: REGIONS.find((r) => r.id === b.regionId)?.name ?? '',
    capitalExposureFormatted: formatCurrency(b.capitalExposure),
  }));
}

export function getBuildingById(id: string) {
  const building = visibleBuildings().find((b) => b.id === id);
  if (!building) return null;
  return {
    ...building,
    regionName: REGIONS.find((r) => r.id === building.regionId)?.name ?? '',
    capitalExposureFormatted: formatCurrency(building.capitalExposure),
  };
}

export function getBuildingSystems(buildingId: string) {
  return BUILDING_SYSTEMS.filter((s) => s.buildingId === buildingId);
}

export function getDeficienciesForBuilding(buildingId: string) {
  return DEFICIENCIES.filter((d) => d.buildingId === buildingId);
}

export interface AssetQueryParams {
  buildingId?: string;
  regionId?: string;
  healthTier?: HealthTier;
  systemName?: string;
  search?: string;
  sortField?: string;
  sortDirection?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export function queryAssetRecords(params: AssetQueryParams) {
  const buildingIds = visibleBuildingIds();
  let rows = ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId));

  if (params.regionId || params.healthTier) {
    const allowedBuildingIds = new Set(
      visibleBuildings().filter(
        (b) =>
          (!params.regionId || b.regionId === params.regionId) &&
          (!params.healthTier || b.healthTier === params.healthTier),
      ).map((b) => b.id),
    );
    rows = rows.filter((r) => allowedBuildingIds.has(r.buildingId));
  }
  if (params.buildingId) {
    rows = rows.filter((r) => r.buildingId === params.buildingId);
  }
  if (params.systemName) {
    rows = rows.filter((r) => r.systemName === params.systemName);
  }
  if (params.search) {
    const term = params.search.toLowerCase();
    rows = rows.filter(
      (r) => r.component.toLowerCase().includes(term) || r.id.toLowerCase().includes(term),
    );
  }

  if (params.sortField) {
    const field = params.sortField as keyof (typeof rows)[number];
    const direction = params.sortDirection === 'desc' ? -1 : 1;
    rows = [...rows].sort((a, b) => {
      const av = a[field];
      const bv = b[field];
      if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * direction;
      return String(av).localeCompare(String(bv)) * direction;
    });
  }

  const totalCount = rows.length;
  const page = params.page ?? 0;
  const pageSize = params.pageSize ?? 25;
  const paged = rows.slice(page * pageSize, page * pageSize + pageSize);

  return { rows: paged, totalCount };
}

export function getAssetRecordById(id: string) {
  const buildingIds = visibleBuildingIds();
  const record = ASSET_RECORDS.find((r) => r.id === id);
  if (!record || !buildingIds.has(record.buildingId)) return null;
  return record;
}

// Reserve Fund data (Partially Active) — same tenant-scoping guard as every other
// per-record read/write here: cross-tenant asset IDs resolve to null/empty rather than 404,
// consistent with getAssetRecordById above.
export function updateAssetRecordScoped(id: string, patch: UpdateAssetRecordPatch) {
  if (!getAssetRecordById(id)) return null;
  return updateAssetRecord(id, patch);
}

export function getLifecycleExpendituresScoped(assetRecordId: string) {
  if (!getAssetRecordById(assetRecordId)) return [];
  return getLifecycleExpenditures(assetRecordId);
}

export function addLifecycleExpenditureEntryScoped(
  assetRecordId: string,
  entry: { date: string; description: string; cost: number },
) {
  if (!getAssetRecordById(assetRecordId)) return null;
  return addLifecycleExpenditureEntry(assetRecordId, entry);
}

export function computeAssetStats() {
  const buildingIds = visibleBuildingIds();
  const assetRecords = ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId));
  const buildingSystems = BUILDING_SYSTEMS.filter((s) => buildingIds.has(s.buildingId));
  const totalValue = assetRecords.reduce((s, r) => s + r.replacementCost, 0);
  const highRiskAssets = assetRecords.filter((r) => r.riskLevel === 'high').length;
  const avgRemainingUsefulLife = assetRecords.length
    ? Math.round(assetRecords.reduce((s, r) => s + r.remainingUsefulLifeYears, 0) / assetRecords.length)
    : 0;

  return {
    totalAssets: assetRecords.length,
    totalValue: formatCurrency(totalValue),
    highRiskAssets,
    avgRemainingUsefulLife,
    buildingsTracked: buildingIds.size,
    systemsTracked: buildingSystems.length,
  };
}

export function computePortfolioAnalytics() {
  const buildings = visibleBuildings();
  const regions = visibleRegions();
  const regionCounts = regions.map((r) => ({ name: r.name, count: buildings.filter((b) => b.regionId === r.id).length }));
  const topRegion = [...regionCounts].sort((a, b) => b.count - a.count)[0] ?? { name: '—', count: 0 };

  const classCounts = new Map<string, number>();
  buildings.forEach((b) => classCounts.set(b.assetClass, (classCounts.get(b.assetClass) ?? 0) + 1));
  const topClassEntry = [...classCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const atRiskCount = buildings.filter((b) => b.healthTier === 'atRisk' || b.healthTier === 'critical').length;

  const byExposure = [...buildings].sort((a, b) => b.capitalExposure - a.capitalExposure)[0];
  const exposureRegionName = byExposure ? REGIONS.find((r) => r.id === byExposure.regionId)?.name ?? '' : '';

  const activeCount = buildings.filter((b) => b.status === 'active').length;
  const upcomingAssessments = buildings.filter((b) => b.healthTier === 'monitor').length;

  return {
    topRegion: { name: topRegion.name, count: topRegion.count },
    topAssetClass: { name: topClassEntry?.[0] ?? 'Residential', count: topClassEntry?.[1] ?? 0 },
    atRiskCount,
    topExposure: { name: exposureRegionName, value: formatCurrency(byExposure?.capitalExposure ?? 0) },
    activeCount,
    upcomingAssessments,
  };
}

export function getRiskPriorityList(limit = 10) {
  const buildingIds = visibleBuildingIds();
  const riskScore: Record<RiskLevel, number> = { high: 3, medium: 2, low: 1 };
  return ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId))
    .sort((a, b) => {
      const scoreDiff = riskScore[b.riskLevel] - riskScore[a.riskLevel];
      if (scoreDiff !== 0) return scoreDiff;
      return a.remainingUsefulLifeYears - b.remainingUsefulLifeYears;
    })
    .slice(0, limit);
}

export function computeBenchmarkScores() {
  return visibleBuildings().map((b) => ({
    id: b.id,
    name: b.name,
    regionName: REGIONS.find((r) => r.id === b.regionId)?.name ?? '',
    score: b.healthPct,
    riskLevel: b.riskLevel,
    capitalExposureFormatted: formatCurrency(b.capitalExposure),
  })).sort((a, b) => a.score - b.score);
}

function failureProbabilityPct(condition: string, riskLevel: RiskLevel): number {
  if (condition === 'critical') return 90;
  if (condition === 'poor') return riskLevel === 'high' ? 70 : 55;
  if (condition === 'fair') return riskLevel === 'medium' ? 30 : 20;
  return 5;
}

export function computeRiskForecast(limit = 10) {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId))
    .map((r) => ({
      id: r.id,
      buildingName: buildingName.get(r.buildingId) ?? r.buildingId,
      component: r.component,
      systemName: r.systemName,
      failureProbabilityPct: failureProbabilityPct(r.condition, r.riskLevel),
      trajectory: r.condition === 'critical' || r.condition === 'poor' ? 'Worsening' : 'Stable',
      inspectionUrgency:
        r.remainingUsefulLifeYears <= 1 ? 'Immediate' : r.remainingUsefulLifeYears <= 5 ? 'Near-term' : 'Scheduled',
      timeToCapitalNeedYears: r.remainingUsefulLifeYears,
    }))
    .sort((a, b) => b.failureProbabilityPct - a.failureProbabilityPct)
    .slice(0, limit);
}

export function computeCapitalForecastHorizons() {
  const buildingIds = visibleBuildingIds();
  const assetRecords = ASSET_RECORDS.filter((r) => buildingIds.has(r.buildingId));
  const horizons = [
    { key: 'immediate', label: 'Immediate (0-1 yr)', maxRul: 1 },
    { key: '5yr', label: '5-Year', maxRul: 5 },
    { key: '10yr', label: '10-Year', maxRul: 10 },
    { key: '30yr', label: '30-Year', maxRul: 40 },
  ];
  return horizons.map((h) => {
    const inScope = assetRecords.filter((r) => r.remainingUsefulLifeYears <= h.maxRul);
    const totalCost = inScope.reduce((sum, r) => sum + r.replacementCost, 0);
    return {
      key: h.key,
      label: h.label,
      assetCount: inScope.length,
      totalCostFormatted: formatCurrency(totalCost),
    };
  });
}

export function computeReserveForecastByRegion() {
  const buildings = visibleBuildings();
  return visibleRegions().map((region) => {
    const regionBuildings = buildings.filter((b) => b.regionId === region.id);
    const capitalExposure = regionBuildings.reduce((sum, b) => sum + b.capitalExposure, 0);
    const reserveRequirement = capitalExposure * 0.45;
    return {
      regionName: region.name,
      capitalExposureFormatted: formatCurrency(capitalExposure),
      reserveRequirementFormatted: formatCurrency(reserveRequirement),
      fundingGapFormatted: formatCurrency(reserveRequirement * 0.35),
    };
  });
}

export function computeBenchmarkMatrix() {
  const ranked = [...visibleBuildings()].sort((a, b) => a.healthPct - b.healthPct);
  return ranked.map((b, index) => ({
    rank: index + 1,
    id: b.id,
    name: b.name,
    regionName: REGIONS.find((r) => r.id === b.regionId)?.name ?? '',
    healthPct: b.healthPct,
    riskLevel: b.riskLevel,
    capitalExposureFormatted: formatCurrency(b.capitalExposure),
    reserveRequirementFormatted: formatCurrency(b.capitalExposure * 0.45),
  }));
}

export function computeExecutivePriority() {
  const buildings = visibleBuildings();
  const mostUrgent = [...buildings].sort((a, b) => a.healthPct - b.healthPct)[0];
  if (!mostUrgent) {
    return {
      buildingName: '—',
      regionName: '—',
      healthPct: 0,
      capitalExposureFormatted: formatCurrency(0),
      description: 'No buildings on file yet for this company.',
    };
  }
  const regionName = REGIONS.find((r) => r.id === mostUrgent.regionId)?.name ?? '';
  return {
    buildingName: mostUrgent.name,
    regionName,
    healthPct: mostUrgent.healthPct,
    capitalExposureFormatted: formatCurrency(mostUrgent.capitalExposure),
    description: `${mostUrgent.name} (${regionName}) has the lowest portfolio health score at ${mostUrgent.healthPct}% and the associated capital exposure of ${formatCurrency(mostUrgent.capitalExposure)}. Recommend prioritizing for capital allocation review this cycle.`,
  };
}

export function computeSeverityMatrixByRegion() {
  const buildings = visibleBuildings();
  const tiers: { tier: HealthTier; label: string }[] = [
    { tier: 'healthy', label: 'Healthy' },
    { tier: 'monitor', label: 'Monitor' },
    { tier: 'atRisk', label: 'At Risk' },
    { tier: 'critical', label: 'Critical' },
  ];
  return visibleRegions().map((region) => {
    const regionBuildings = buildings.filter((b) => b.regionId === region.id);
    return {
      regionName: region.name,
      counts: tiers.map((t) => ({
        tier: t.tier,
        label: t.label,
        count: regionBuildings.filter((b) => b.healthTier === t.tier).length,
      })),
    };
  });
}

export function computeScenarios() {
  const summary = computePortfolioSummary();
  const baseExposure = visibleBuildings().reduce((sum, b) => sum + b.capitalExposure, 0);

  return [
    {
      id: 'status-quo',
      label: 'Status Quo',
      description: 'Current reserve funding rate and capital plan pace maintained.',
      reserveRequirementFormatted: formatCurrency(baseExposure * 0.45),
      projectedHealthPct: summary.portfolioHealthPct,
      projectedExposureFormatted: formatCurrency(baseExposure),
      projectedExposureRaw: baseExposure,
      outcomeTone: 'neutral' as const,
    },
    {
      id: 'accelerated-capital',
      label: 'Accelerated Capital',
      description: 'Increase reserve funding rate to accelerate remediation of at-risk and critical buildings.',
      reserveRequirementFormatted: formatCurrency(baseExposure * 0.6),
      projectedHealthPct: Math.min(100, summary.portfolioHealthPct + 8),
      projectedExposureFormatted: formatCurrency(baseExposure * 0.9),
      projectedExposureRaw: baseExposure * 0.9,
      outcomeTone: 'success' as const,
    },
    {
      id: 'deferred-maintenance',
      label: 'Deferred Maintenance',
      description: 'Reduce reserve funding rate; capital work deferred, allowing deficiencies to compound.',
      reserveRequirementFormatted: formatCurrency(baseExposure * 0.3),
      projectedHealthPct: Math.max(0, summary.portfolioHealthPct - 10),
      projectedExposureFormatted: formatCurrency(baseExposure * 1.15),
      projectedExposureRaw: baseExposure * 1.15,
      outcomeTone: 'error' as const,
    },
  ];
}

export function getProjectRows() {
  const buildingIds = visibleBuildingIds();
  const buildings = new Map(visibleBuildings().map((b) => [b.id, b]));
  return PROJECTS.filter((p) => buildingIds.has(p.buildingId)).map((p) => ({
    ...p,
    buildingName: buildings.get(p.buildingId)?.name ?? p.buildingId,
    companyId: buildings.get(p.buildingId)?.companyId ?? '',
  }));
}

export function getVisibleReportRows() {
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return visibleReports().map((r) => ({
    ...r,
    buildingName: buildingName.get(r.buildingId) ?? r.buildingId,
  }));
}

export function getReportById(id: string) {
  const report = visibleReports().find((r) => r.id === id);
  if (!report) return null;
  const building = getBuildingById(report.buildingId);
  return { ...report, buildingName: building?.name ?? report.buildingId };
}

export function getReportViewerContent(id: string) {
  const report = getReportById(id);
  if (!report) return null;

  const building = getBuildingById(report.buildingId);
  const findings = DEFICIENCIES.filter((d) => d.buildingId === report.buildingId).slice(0, 5);
  const capitalItems = CAPITAL_PLAN_ITEMS.filter((c) => c.buildingId === report.buildingId).slice(0, 6);
  const totalDeficiencyCost = findings.reduce((sum, d) => sum + d.estimatedCost, 0);

  return {
    report,
    building,
    findings: findings.map((d) => ({
      id: d.id,
      title: `${d.systemName} — ${d.description}`,
      severity: d.severity,
      problem: d.description,
      effect:
        d.severity === 'critical' || d.severity === 'high'
          ? 'Elevated risk to occupants or building performance if not addressed promptly.'
          : 'Gradual performance degradation if deferred beyond the recommended window.',
      recommendation: `Budget and schedule remediation for ${d.systemName.toLowerCase()}.`,
      costFormatted: formatCurrency(d.estimatedCost),
    })),
    capitalSummary: capitalItems.map((c) => ({
      id: c.id,
      year: c.year,
      systemName: c.systemName,
      recommendedWork: c.recommendedWork,
      costFormatted: formatCurrency(c.forecastCost),
    })),
    totalDeficiencyCostFormatted: formatCurrency(totalDeficiencyCost),
    portfolioHealthPct: building?.healthPct ?? 0,
  };
}

export function getDeficiencyRows() {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  const actionByDeficiencyId = new Map(ACTIONS.map((a) => [a.deficiencyId, a]));

  return DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId)).map((d) => {
    const action = actionByDeficiencyId.get(d.id);
    return {
      ...d,
      buildingName: buildingName.get(d.buildingId) ?? d.buildingId,
      estimatedCostFormatted: formatCurrency(d.estimatedCost),
      recommendedAction: action?.actionName ?? 'Assign remediation action',
      recommendedActionId: action?.id ?? null,
    };
  });
}

export function computeDeficiencyStats() {
  const buildingIds = visibleBuildingIds();
  const deficiencies = DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId));
  const actions = ACTIONS.filter((a) => buildingIds.has(a.buildingId));
  const bySeverity: Record<string, number> = { critical: 0, high: 0, medium: 0, low: 0 };
  let totalCost = 0;
  deficiencies.forEach((d) => {
    bySeverity[d.severity] += 1;
    totalCost += d.estimatedCost;
  });
  const plannedActions = actions.filter((a) => a.status !== 'completed').length;
  const deferredMaintenanceRisk = actions.filter((a) => a.status === 'open').length;

  return {
    total: deficiencies.length,
    critical: bySeverity.critical,
    high: bySeverity.high,
    medium: bySeverity.medium,
    low: bySeverity.low,
    estimatedRepairCostFormatted: formatCurrency(totalCost),
    plannedActions,
    deferredMaintenanceRisk,
  };
}

export function getActionRows() {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return ACTIONS.filter((a) => buildingIds.has(a.buildingId)).map((a) => ({
    ...a,
    buildingName: buildingName.get(a.buildingId) ?? a.buildingId,
    budgetFormatted: formatCurrency(a.budget),
  }));
}

export function computeActionStats() {
  const buildingIds = visibleBuildingIds();
  const actions = ACTIONS.filter((a) => buildingIds.has(a.buildingId));
  const open = actions.filter((a) => a.status === 'open' || a.status === 'inProgress').length;
  const overdue = actions.filter((a) => a.status === 'overdue').length;
  const critical = actions.filter((a) => a.priority === 'critical').length;
  const completed = actions.filter((a) => a.status === 'completed').length;
  const budgetAssigned = actions.reduce((sum, a) => sum + a.budget, 0);
  const budgetSpent = actions.reduce((sum, a) => sum + a.budget * (a.completionPct / 100), 0);
  const avgCompletion = actions.length ? Math.round(actions.reduce((sum, a) => sum + a.completionPct, 0) / actions.length) : 0;
  const peoReviewNeeded = actions.filter((a) => a.peoReviewNeeded).length;

  return {
    open,
    overdue,
    critical,
    completed,
    budgetAssignedFormatted: formatCurrency(budgetAssigned),
    budgetRemainingFormatted: formatCurrency(budgetAssigned - budgetSpent),
    avgCompletionPct: avgCompletion,
    peoReviewNeeded,
  };
}

export function computeActionCommandItems(limit = 8) {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId))
    .sort((a, b) => b.estimatedCost - a.estimatedCost)
    .slice(0, limit)
    .map((d) => ({
      ...d,
      buildingName: buildingName.get(d.buildingId) ?? d.buildingId,
      estimatedCostFormatted: formatCurrency(d.estimatedCost),
      approvalStatus: d.severity === 'critical' || d.severity === 'high' ? 'Approve Now' : 'Board Review',
    }));
}

export function getCapitalPlanRows() {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return CAPITAL_PLAN_ITEMS.filter((item) => buildingIds.has(item.buildingId))
    .sort((a, b) => a.year - b.year)
    .map((item) => ({
      ...item,
      buildingName: buildingName.get(item.buildingId) ?? item.buildingId,
      forecastCostFormatted: formatCurrency(item.forecastCost),
    }));
}

export function computeCapitalPlanStats() {
  const buildingIds = visibleBuildingIds();
  const buildings = visibleBuildings();
  const capitalPlanItems = CAPITAL_PLAN_ITEMS.filter((i) => buildingIds.has(i.buildingId));
  const fundedCount = capitalPlanItems.filter((i) => i.status === 'funded' || i.status === 'inProgress').length;
  const unfundedCount = capitalPlanItems.filter((i) => i.status === 'unfunded').length;
  const highPriorityCount = capitalPlanItems.filter((i) => i.priority === 'critical' || i.priority === 'high').length;
  const totalReserveRequirement = buildings.reduce((sum, b) => sum + b.capitalExposure, 0) * 0.45;
  const reserveFundingGap = totalReserveRequirement * 0.35;

  return {
    fundedCount,
    unfundedCount,
    highPriorityCount,
    reserveFundingGapFormatted: formatCurrency(reserveFundingGap),
  };
}

function visibleDocuments() {
  const buildingIds = visibleBuildingIds();
  return DOCUMENTS.filter((d) => d.accessLevel !== 'internalUntilRelease' && buildingIds.has(d.buildingId));
}

export function getDocumentRows() {
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return visibleDocuments().map((d) => ({
    ...d,
    buildingName: buildingName.get(d.buildingId) ?? d.buildingId,
  }));
}

export function computeBoardKpis() {
  const buildingIds = visibleBuildingIds();
  const buildings = visibleBuildings();
  const deficiencies = DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId));
  const capitalPlanItems = CAPITAL_PLAN_ITEMS.filter((i) => buildingIds.has(i.buildingId));
  const summary = computePortfolioSummary();
  const planStats = computeCapitalPlanStats();
  const criticalDeficiencies = deficiencies.filter((d) => d.severity === 'critical').length;
  const highRiskBuildingCount = buildings.filter((b) => b.riskLevel === 'high').length;
  const portfolioRiskScore = buildings.length ? Math.max(0, 100 - Math.round((highRiskBuildingCount / buildings.length) * 100)) : 100;
  const reserveFundHealthPct = capitalPlanItems.length
    ? Math.max(0, 100 - Math.round((planStats.unfundedCount / capitalPlanItems.length) * 100))
    : 100;
  const esgScore = Math.round((summary.portfolioHealthPct + reserveFundHealthPct) / 2);
  const upcomingMajorExpenditures = capitalPlanItems.filter((i) => i.year <= 2031).length;

  return {
    portfolioRiskScore,
    deferredMaintenanceExposureFormatted: summary.capitalExposure5yr,
    reserveFundHealthPct,
    capitalRequirementFormatted: summary.capitalForecast30yr,
    buildingHealthIndex: summary.portfolioHealthPct,
    esgScore,
    criticalDeficiencies,
    upcomingMajorExpenditures,
  };
}

export function getAssetRegistryDetail(buildingId: string) {
  const building = getBuildingById(buildingId);
  if (!building) return null;

  const buildingReports = visibleReports().filter((r) => r.buildingId === buildingId);
  const latestReport = [...buildingReports].sort((a, b) => (a.releaseDate < b.releaseDate ? 1 : -1))[0] ?? null;
  const topAssets = ASSET_RECORDS.filter((r) => r.buildingId === buildingId)
    .sort((a, b) => b.replacementCost - a.replacementCost)
    .slice(0, 4);

  return {
    building,
    latestReport,
    topAssets,
  };
}

export function getMessageRows() {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return MESSAGES.filter((m) => buildingIds.has(m.buildingId)).map((m) => ({
    ...m,
    buildingName: buildingName.get(m.buildingId) ?? m.buildingId,
  }));
}

export interface CreateMessageInput {
  subject: string;
  buildingId: string;
  projectId: string | null;
}

export function createMessage(input: CreateMessageInput): ClientMessage {
  const message: ClientMessage = {
    id: `MSG-${String(MESSAGES.length + 1).padStart(3, '0')}`,
    subject: input.subject,
    buildingId: input.buildingId,
    projectId: input.projectId,
    assignedTo: 'Client Success Team',
    status: 'open',
    lastUpdated: new Date().toISOString().slice(0, 10),
  };
  addMessage(message);
  return message;
}

const ADVISOR_ANSWERS: Record<string, () => string> = {
  'capital-exposure': () => {
    const summary = computePortfolioSummary();
    return `The portfolio's total capital exposure is ${summary.capitalForecast30yr}, with ${summary.capitalExposure5yr} required within the next 5 years.`;
  },
  'highest-risk': () => {
    const worst = computeBenchmarkMatrix()[0];
    return worst
      ? `${worst.name} (${worst.regionName}) carries the highest risk, with a benchmark score of ${worst.healthPct}/100 and capital exposure of ${worst.capitalExposureFormatted}.`
      : 'No building risk data is available yet.';
  },
  'reserve-gap': () => {
    const planStats = computeCapitalPlanStats();
    return `The portfolio-wide reserve funding gap is estimated at ${planStats.reserveFundingGapFormatted}, with ${planStats.unfundedCount} capital items currently unfunded.`;
  },
  'critical-deficiencies': () => {
    const defStats = computeDeficiencyStats();
    return `There are ${defStats.critical} critical and ${defStats.high} high-severity deficiencies open across the portfolio, totaling an estimated repair cost of ${defStats.estimatedRepairCostFormatted}.`;
  },
  'portfolio-health': () => {
    const summary = computePortfolioSummary();
    return `Overall portfolio health is at ${summary.portfolioHealthPct}%, with ${summary.activeAssessments} buildings under active assessment.`;
  },
  'system-priority': () => {
    const top = computeRiskForecast(1)[0];
    return top
      ? `${top.systemName} (${top.component} at ${top.buildingName}) has the highest predicted failure probability at ${top.failureProbabilityPct}%.`
      : 'No risk forecast data is available yet.';
  },
};

const FALLBACK_ANSWER =
  "I can help with capital exposure, risk, reserve funding, deficiencies, portfolio health, and system priorities. Try one of the suggested prompts, or ask about one of those topics.";

export function computeAdvisorAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('capital') || q.includes('exposure')) return ADVISOR_ANSWERS['capital-exposure']();
  if (q.includes('risk') && (q.includes('building') || q.includes('highest'))) return ADVISOR_ANSWERS['highest-risk']();
  if (q.includes('reserve') || q.includes('funding gap')) return ADVISOR_ANSWERS['reserve-gap']();
  if (q.includes('deficienc') || q.includes('critical')) return ADVISOR_ANSWERS['critical-deficiencies']();
  if (q.includes('health')) return ADVISOR_ANSWERS['portfolio-health']();
  if (q.includes('system') || q.includes('priority') || q.includes('failure')) return ADVISOR_ANSWERS['system-priority']();
  return FALLBACK_ANSWER;
}

export function getUndergoingProjects() {
  const buildingIds = visibleBuildingIds();
  const buildingName = new Map(visibleBuildings().map((b) => [b.id, b.name]));
  return PROJECTS.filter((p) => p.status !== 'complete' && buildingIds.has(p.buildingId)).map((p) => {
    const stageIndex = STAGE_TO_MILESTONE_INDEX[p.currentStage] ?? 0;
    return {
      ...p,
      buildingName: buildingName.get(p.buildingId) ?? p.buildingId,
      progressPct: Math.round(((stageIndex + 1) / MILESTONE_STAGES.length) * 100),
      milestoneIndex: stageIndex,
    };
  });
}

export function getUndergoingProjectDetail(projectId: string) {
  const project = PROJECTS.find((p) => p.id === projectId);
  if (!project) return null;

  const building = getBuildingById(project.buildingId);
  if (!building) return null; // not visible to the current tenant

  const buildingName = building.name;
  const stageIndex = STAGE_TO_MILESTONE_INDEX[project.currentStage] ?? 0;
  const evidenceCount = DOCUMENTS.filter((d) => d.buildingId === project.buildingId).length;
  const deliverables = visibleReports()
    .filter((r) => r.buildingId === project.buildingId)
    .map((r) => ({
      id: r.id,
      serviceLine: r.serviceLine,
      status: r.status,
      availableFormats: r.availableFormats,
    }));
  const clientActions = ACTIONS.filter((a) => a.buildingId === project.buildingId)
    .slice(0, 3)
    .map((a) => ({ id: a.id, actionName: a.actionName, status: a.status }));

  return {
    project: { ...project, buildingName },
    milestoneIndex: stageIndex,
    progressPct: Math.round(((stageIndex + 1) / MILESTONE_STAGES.length) * 100),
    evidenceCount,
    deliverables,
    clientActions,
  };
}

export interface CreateDeficiencyInput {
  buildingId: string;
  systemName: Deficiency['systemName'];
  description: string;
  severity: DeficiencySeverity;
  estimatedCost: number;
  sourceObservationId?: string;
  deficiencyType?: string;
  subcategory?: string;
  riskType?: string;
  riskLevel?: Deficiency['riskLevel'];
  codeComplianceFlag?: string;
  priorityTimeframe?: string;
  rulBasis?: string;
  rulStatus?: string;
  failureMechanism?: string;
  recommendationType?: string;
  recommendationScope?: string;
  deficiencyStatement?: string;
  clientNarrative?: string;
  recommendedAction?: string;
  deviationReason?: string;
}

export function createDeficiencyFromObservation(input: CreateDeficiencyInput): {
  deficiency: Deficiency;
  action: RemediationAction;
} {
  const deficiency: Deficiency = {
    id: `DEF-${String(DEFICIENCIES.length + 1).padStart(4, '0')}`,
    buildingId: input.buildingId,
    systemName: input.systemName,
    description: input.description,
    severity: input.severity,
    estimatedCost: input.estimatedCost,
    sourceObservationId: input.sourceObservationId,
    deficiencyType: input.deficiencyType,
    subcategory: input.subcategory,
    riskType: input.riskType,
    riskLevel: input.riskLevel,
    codeComplianceFlag: input.codeComplianceFlag,
    priorityTimeframe: input.priorityTimeframe,
    rulBasis: input.rulBasis,
    rulStatus: input.rulStatus,
    failureMechanism: input.failureMechanism,
    recommendationType: input.recommendationType,
    recommendationScope: input.recommendationScope,
    deficiencyStatement: input.deficiencyStatement,
    clientNarrative: input.clientNarrative,
    recommendedAction: input.recommendedAction,
    deviationReason: input.deviationReason,
  };
  addDeficiency(deficiency);

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 45);

  const action: RemediationAction = {
    id: `ACT-${String(ACTIONS.length + 1).padStart(4, '0')}`,
    deficiencyId: deficiency.id,
    buildingId: deficiency.buildingId,
    systemName: deficiency.systemName,
    actionName: `${ACTION_NAME_PREFIX[deficiency.severity]} — ${deficiency.systemName}`,
    priority: deficiency.severity,
    owner: 'Unassigned',
    dueDate: dueDate.toISOString().slice(0, 10),
    budget: deficiency.estimatedCost,
    completionPct: 0,
    status: 'open',
    peoReviewNeeded: deficiency.severity === 'critical' || deficiency.severity === 'high',
  };
  addAction(action);

  return { deficiency, action };
}

export interface CreateCapitalPlanItemInput {
  buildingId: string;
  systemName: CapitalPlanItem['systemName'];
  recommendedWork: string;
  priority: DeficiencySeverity;
  forecastCost: number;
  phasingLabel: string;
  reserveFundEligible: boolean;
  sourceDeficiencyId?: string;
  quantity?: number;
  quantityUnit?: string;
  unitRate?: number;
  softCostsPct?: number;
  escalationPct?: number;
  contingencyPct?: number;
  rateSource?: string;
  costNotes?: string;
}

export function createCapitalPlanItemFromDeficiency(input: CreateCapitalPlanItemInput): {
  item: CapitalPlanItem;
} {
  const yearMatch = /\d{4}/.exec(input.phasingLabel);
  const year = yearMatch ? Number(yearMatch[0]) : new Date().getFullYear();

  const item: CapitalPlanItem = {
    id: `CAP-${String(CAPITAL_PLAN_ITEMS.length + 1).padStart(4, '0')}`,
    buildingId: input.buildingId,
    systemName: input.systemName,
    year,
    recommendedWork: input.recommendedWork,
    priority: input.priority,
    forecastCost: Math.round(input.forecastCost),
    fundingSource: input.reserveFundEligible ? 'Reserve Fund' : 'Operating Budget',
    status: 'funded',
    sourceDeficiencyId: input.sourceDeficiencyId,
    quantity: input.quantity,
    quantityUnit: input.quantityUnit,
    unitRate: input.unitRate,
    softCostsPct: input.softCostsPct,
    escalationPct: input.escalationPct,
    contingencyPct: input.contingencyPct,
    phasingLabel: input.phasingLabel,
    reserveFundEligible: input.reserveFundEligible,
    rateSource: input.rateSource,
    costNotes: input.costNotes,
  };
  addCapitalPlanItem(item);

  return { item };
}
