import { delay, http, HttpResponse } from 'msw';
import type { HealthTier } from '../../domain/portfolioAssets';
import type {
  CreateLifecycleExpenditureRequest,
  UpdateAssetRecordRequest,
} from '../../api/contracts/portfolioAssets';
import {
  addLifecycleExpenditureEntryScoped,
  computeAssetStats,
  computePortfolioAnalytics,
  getAssetRecordById,
  getBuildingById,
  getBuildingSummaries,
  getBuildingSystems,
  getDeficienciesForBuilding,
  getLifecycleExpendituresScoped,
  getRiskPriorityList,
  queryAssetRecords,
  updateAssetRecordScoped,
} from '../data/portfolioQueries';

export const portfolioAssetHandlers = [
  http.get('/api/buildings', async () => {
    await delay(250);
    return HttpResponse.json(getBuildingSummaries());
  }),

  http.get('/api/buildings/:id', async ({ params }) => {
    await delay(200);
    const building = getBuildingById(String(params.id));
    if (!building) {
      return HttpResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return HttpResponse.json(building);
  }),

  http.get('/api/buildings/:id/systems', async ({ params }) => {
    await delay(250);
    return HttpResponse.json(getBuildingSystems(String(params.id)));
  }),

  http.get('/api/buildings/:id/deficiencies', async ({ params }) => {
    await delay(250);
    return HttpResponse.json(getDeficienciesForBuilding(String(params.id)));
  }),

  http.get('/api/assets', async ({ request }) => {
    await delay(300);
    const url = new URL(request.url);
    const result = queryAssetRecords({
      buildingId: url.searchParams.get('buildingId') ?? undefined,
      regionId: url.searchParams.get('regionId') ?? undefined,
      healthTier: (url.searchParams.get('healthTier') as HealthTier | null) ?? undefined,
      systemName: url.searchParams.get('systemName') ?? undefined,
      search: url.searchParams.get('search') ?? undefined,
      sortField: url.searchParams.get('sortField') ?? undefined,
      sortDirection: (url.searchParams.get('sortDirection') as 'asc' | 'desc' | null) ?? undefined,
      page: url.searchParams.has('page') ? Number(url.searchParams.get('page')) : undefined,
      pageSize: url.searchParams.has('pageSize') ? Number(url.searchParams.get('pageSize')) : undefined,
    });
    return HttpResponse.json(result);
  }),

  http.get('/api/assets/:id', async ({ params }) => {
    await delay(200);
    const record = getAssetRecordById(String(params.id));
    if (!record) {
      return HttpResponse.json({ message: 'Asset record not found' }, { status: 404 });
    }
    return HttpResponse.json(record);
  }),

  http.post('/api/assets/:id', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as UpdateAssetRecordRequest;
    const record = updateAssetRecordScoped(String(params.id), body);
    if (!record) {
      return HttpResponse.json({ message: 'Asset record not found' }, { status: 404 });
    }
    return HttpResponse.json(record);
  }),

  http.get('/api/assets/:id/expenditures', async ({ params }) => {
    await delay(200);
    return HttpResponse.json(getLifecycleExpendituresScoped(String(params.id)));
  }),

  http.post('/api/assets/:id/expenditures', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as CreateLifecycleExpenditureRequest;
    const entry = addLifecycleExpenditureEntryScoped(String(params.id), body);
    if (!entry) {
      return HttpResponse.json({ message: 'Asset record not found' }, { status: 404 });
    }
    return HttpResponse.json(entry, { status: 201 });
  }),

  http.get('/api/portfolio/asset-stats', async () => {
    await delay(250);
    return HttpResponse.json(computeAssetStats());
  }),

  http.get('/api/portfolio/analytics', async () => {
    await delay(250);
    return HttpResponse.json(computePortfolioAnalytics());
  }),

  http.get('/api/portfolio/risk-priority', async ({ request }) => {
    await delay(250);
    const url = new URL(request.url);
    const limit = url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : undefined;
    return HttpResponse.json(getRiskPriorityList(limit));
  }),
];
