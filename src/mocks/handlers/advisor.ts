import { delay, http, HttpResponse } from 'msw';
import { computeAdvisorAnswer } from '../data/portfolioQueries';
import type { AdvisorAnswerResponse } from '../../api/contracts/advisor';

export const advisorHandlers = [
  http.get('/api/advisor/answer', async ({ request }) => {
    await delay(400);
    const url = new URL(request.url);
    const question = url.searchParams.get('question') ?? '';
    const response: AdvisorAnswerResponse = { question, answer: computeAdvisorAnswer(question) };
    return HttpResponse.json(response);
  }),
];
