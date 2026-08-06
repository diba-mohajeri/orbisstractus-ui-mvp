import { delay, http, HttpResponse } from 'msw';
import {
  computeActionCommandItems,
  computeBenchmarkMatrix,
  computeBenchmarkScores,
  computeCapitalForecastHorizons,
  computeExecutivePriority,
  computeReserveForecastByRegion,
  computeRiskForecast,
  computeScenarios,
  computeSeverityMatrixByRegion,
} from '../data/portfolioQueries';

export const predictiveHandlers = [
  http.get('/api/predictive/benchmark-scores', async () => {
    await delay(250);
    return HttpResponse.json(computeBenchmarkScores());
  }),

  http.get('/api/predictive/risk-forecast', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : undefined;
    return HttpResponse.json(computeRiskForecast(limit));
  }),

  http.get('/api/predictive/capital-forecast-horizons', async () => {
    await delay(250);
    return HttpResponse.json(computeCapitalForecastHorizons());
  }),

  http.get('/api/predictive/reserve-forecast-by-region', async () => {
    await delay(250);
    return HttpResponse.json(computeReserveForecastByRegion());
  }),

  http.get('/api/predictive/benchmark-matrix', async () => {
    await delay(300);
    return HttpResponse.json(computeBenchmarkMatrix());
  }),

  http.get('/api/enterprise/executive-priority', async () => {
    await delay(200);
    return HttpResponse.json(computeExecutivePriority());
  }),

  http.get('/api/enterprise/severity-matrix', async () => {
    await delay(250);
    return HttpResponse.json(computeSeverityMatrixByRegion());
  }),

  http.get('/api/enterprise/scenarios', async () => {
    await delay(250);
    return HttpResponse.json(computeScenarios());
  }),

  http.get('/api/enterprise/action-command', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : undefined;
    return HttpResponse.json(computeActionCommandItems(limit));
  }),
];
