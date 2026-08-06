import { delay, http, HttpResponse } from 'msw';
import { getDocumentRows } from '../data/portfolioQueries';

export const documentsHandlers = [
  http.get('/api/documents', async () => {
    await delay(300);
    return HttpResponse.json(getDocumentRows());
  }),
];
