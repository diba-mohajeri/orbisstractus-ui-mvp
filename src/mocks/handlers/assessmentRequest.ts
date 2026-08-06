import { delay, http, HttpResponse } from 'msw';
import type { AssessmentRequestPayload, AssessmentRequestResponse } from '../../api/contracts/assessmentRequest';

export const assessmentRequestHandlers = [
  http.post('/api/assessment-requests', async ({ request }) => {
    await delay(500);
    const body = (await request.json()) as AssessmentRequestPayload;

    if (!body.propertyName || !body.propertyAddress || !body.assessmentType) {
      return HttpResponse.json(
        { message: 'Property name, address, and assessment type are required.' },
        { status: 400 },
      );
    }

    const response: AssessmentRequestResponse = {
      referenceNumber: `REQ-${Math.floor(100000 + Math.random() * 900000)}`,
      submittedAt: new Date().toISOString(),
    };
    return HttpResponse.json(response, { status: 201 });
  }),
];
