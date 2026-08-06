import { delay, http, HttpResponse } from 'msw';
import { computeBoardKpis } from '../data/portfolioQueries';

export const boardHandlers = [
  http.get('/api/board/kpis', async () => {
    await delay(250);
    return HttpResponse.json(computeBoardKpis());
  }),
];
