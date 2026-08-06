import { delay, http, HttpResponse } from 'msw';
import { computeCapitalPlanStats, createCapitalPlanItemFromDeficiency, getCapitalPlanRows } from '../data/portfolioQueries';
import type { CreateCapitalPlanItemRequest } from '../../api/contracts/operations';

export const capitalPlanHandlers = [
  http.get('/api/capital-plan', async () => {
    await delay(300);
    return HttpResponse.json(getCapitalPlanRows());
  }),

  http.get('/api/capital-plan/stats', async () => {
    await delay(250);
    return HttpResponse.json(computeCapitalPlanStats());
  }),

  http.post('/api/capital-plan', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as CreateCapitalPlanItemRequest;
    const result = createCapitalPlanItemFromDeficiency(body);
    return HttpResponse.json(result, { status: 201 });
  }),
];
