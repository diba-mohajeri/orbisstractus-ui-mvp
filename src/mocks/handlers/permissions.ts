import { delay, http, HttpResponse } from 'msw';
import { getRolePermissions, setRolePermission } from '../data/permissions';
import type { EmployeeRole } from '../../domain/auth';
import type { UpdateRolePermissionRequest } from '../../api/contracts/permissions';

export const permissionsHandlers = [
  http.get('/api/roles/permissions', async () => {
    await delay(250);
    return HttpResponse.json(getRolePermissions());
  }),

  http.post('/api/roles/:role/permissions', async ({ params, request }) => {
    await delay(300);
    const body = (await request.json()) as UpdateRolePermissionRequest;
    const updated = setRolePermission(params.role as EmployeeRole, body.permission, body.granted);
    return HttpResponse.json(updated);
  }),
];