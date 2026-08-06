import { delay, http, HttpResponse } from 'msw';
import { getAssetRegistryDetail } from '../data/portfolioQueries';

export const assetRegistryHandlers = [
  http.get('/api/asset-registry/:buildingId', async ({ params }) => {
    await delay(300);
    const detail = getAssetRegistryDetail(String(params.buildingId));
    if (!detail) {
      return HttpResponse.json({ message: 'Building not found' }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];
