import { delay, http, HttpResponse } from 'msw';
import type { PortfolioSummaryResponse } from '../../api/contracts/portfolio';
import {
  computeHealthTierCounts,
  computePortfolioSummary,
  computeRegionSummaries,
} from '../data/portfolioQueries';

export const portfolioHandlers = [
  http.get('/api/portfolio/summary', async () => {
    await delay(250);
    const summary = computePortfolioSummary();
    const response: PortfolioSummaryResponse = {
      buildings: summary.buildings,
      activeProjects: summary.activeProjects,
      reportsAvailable: summary.reportsAvailable,
      openDeficiencies: summary.openDeficiencies,
      highRiskItems: summary.highRiskItems,
      capitalExposure5yr: summary.capitalExposure5yr,
      capitalForecast30yr: summary.capitalForecast30yr,
      portfolioHealthPct: summary.portfolioHealthPct,
      reserveRequirements: summary.reserveRequirements,
      activeAssessments: summary.activeAssessments,
      upcomingProjects: summary.upcomingProjects,
    };
    return HttpResponse.json(response);
  }),

  http.get('/api/portfolio/regions', async () => {
    await delay(250);
    return HttpResponse.json(computeRegionSummaries());
  }),

  http.get('/api/portfolio/health-tiers', async () => {
    await delay(250);
    return HttpResponse.json(computeHealthTierCounts());
  }),
];
