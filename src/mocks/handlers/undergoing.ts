import { delay, http, HttpResponse } from 'msw';
import { getUndergoingProjectDetail, getUndergoingProjects } from '../data/portfolioQueries';

export const undergoingHandlers = [
  http.get('/api/undergoing-projects', async () => {
    await delay(300);
    return HttpResponse.json(getUndergoingProjects());
  }),

  http.get('/api/undergoing-projects/:id', async ({ params }) => {
    await delay(300);
    const detail = getUndergoingProjectDetail(String(params.id));
    if (!detail) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return HttpResponse.json(detail);
  }),
];
