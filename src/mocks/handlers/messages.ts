import { delay, http, HttpResponse } from 'msw';
import { createMessage, getMessageRows } from '../data/portfolioQueries';
import type { CreateMessageRequest } from '../../api/contracts/messages';

export const messagesHandlers = [
  http.get('/api/messages', async () => {
    await delay(300);
    return HttpResponse.json(getMessageRows());
  }),

  http.post('/api/messages', async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as CreateMessageRequest;
    const message = createMessage(body);
    return HttpResponse.json(message, { status: 201 });
  }),
];
