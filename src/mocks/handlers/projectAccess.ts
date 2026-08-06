import { delay, http, HttpResponse } from 'msw';
import {
  getMyProjectAccess,
  getProjectAccessOverview,
  setProjectStepAccessGrant,
  setProjectTeamMembership,
} from '../data/projectAccess';
import { getActiveEmployeeId } from '../data/tenantScope';
import { PROJECT_STEP_KEYS } from '../../domain/projectAccess';
import type {
  MyProjectAccessResponse,
  ProjectAccessOverviewResponse,
  UpdateProjectStepAccessRequest,
  UpdateProjectTeamRequest,
} from '../../api/contracts/projectAccess';

export const projectAccessHandlers = [
  http.get('/api/projects/:projectId/access', async ({ params }) => {
    await delay(300);
    return HttpResponse.json<ProjectAccessOverviewResponse>(getProjectAccessOverview(params.projectId as string));
  }),

  http.post('/api/projects/:projectId/access/team', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as UpdateProjectTeamRequest;
    setProjectTeamMembership(params.projectId as string, body.employeeId, body.onTeam);
    return HttpResponse.json<ProjectAccessOverviewResponse>(getProjectAccessOverview(params.projectId as string));
  }),

  http.post('/api/projects/:projectId/access/grant', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as UpdateProjectStepAccessRequest;
    setProjectStepAccessGrant(
      params.projectId as string,
      body.employeeId,
      body.step,
      body.accessLevel,
      getActiveEmployeeId(),
    );
    return HttpResponse.json<ProjectAccessOverviewResponse>(getProjectAccessOverview(params.projectId as string));
  }),

  http.get('/api/projects/:projectId/my-access', async ({ params }) => {
    await delay(200);
    const access = getMyProjectAccess(params.projectId as string);
    const fallback = Object.fromEntries(PROJECT_STEP_KEYS.map((key) => [key, 'none'])) as MyProjectAccessResponse;
    return HttpResponse.json<MyProjectAccessResponse>(access ?? fallback);
  }),
];
