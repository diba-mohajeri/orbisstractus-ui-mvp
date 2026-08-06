import { delay, http, HttpResponse } from 'msw';
import {
  deleteEmployee,
  getEmployeeActivity,
  getEmployeeById,
  getEmployeeRows,
  getEmployeeWorkload,
  inviteEmployee,
  updateEmployeePermissions,
  updateEmployeeProfile,
  updateEmployeeRole,
} from '../data/employees';
import type {
  InviteEmployeeRequest,
  UpdateEmployeePermissionsRequest,
  UpdateEmployeeProfileRequest,
  UpdateEmployeeRoleRequest,
} from '../../api/contracts/employees';
import { getActiveCompanyId, getActiveEmployeeId } from '../data/tenantScope';

export const employeesHandlers = [
  http.get('/api/employees', async () => {
    await delay(300);
    const companyId = getActiveCompanyId();
    return HttpResponse.json(getEmployeeRows(companyId === null ? undefined : companyId));
  }),

  http.get('/api/employees/:id', async ({ params }) => {
    await delay(250);
    const employee = getEmployeeById(String(params.id));
    if (!employee) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    return HttpResponse.json(employee);
  }),

  http.get('/api/employees/:id/activity', async ({ params }) => {
    await delay(250);
    return HttpResponse.json(getEmployeeActivity(String(params.id)));
  }),

  http.get('/api/employees/:id/workload', async ({ params }) => {
    await delay(250);
    const workload = getEmployeeWorkload(String(params.id));
    if (!workload) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    return HttpResponse.json(workload);
  }),

  http.post('/api/employees/:id/role', async ({ params, request }) => {
    await delay(350);
    const body = (await request.json()) as UpdateEmployeeRoleRequest;
    const employee = updateEmployeeRole(String(params.id), body.role);
    if (!employee) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    return HttpResponse.json(employee);
  }),

  http.post('/api/employees/:id/permissions', async ({ params, request }) => {
    await delay(350);
    const body = (await request.json()) as UpdateEmployeePermissionsRequest;
    const employee = updateEmployeePermissions(String(params.id), body.permissions);
    if (!employee) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    return HttpResponse.json(employee);
  }),

  http.post('/api/employees/:id/profile', async ({ params, request }) => {
    await delay(350);
    const body = (await request.json()) as UpdateEmployeeProfileRequest;
    const employee = updateEmployeeProfile(String(params.id), body);
    if (!employee) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    return HttpResponse.json(employee);
  }),

  http.post('/api/employees', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as InviteEmployeeRequest;
    const companyId = getActiveCompanyId() ?? body.companyId;
    if (!companyId) {
      return HttpResponse.json({ message: 'companyId is required' }, { status: 400 });
    }
    const employee = inviteEmployee({ ...body, companyId });
    return HttpResponse.json(employee, { status: 201 });
  }),

  http.delete('/api/employees/:id', async ({ params }) => {
    await delay(350);
    const id = String(params.id);
    if (!getEmployeeById(id)) {
      return HttpResponse.json({ message: 'Employee not found' }, { status: 404 });
    }
    if (getActiveEmployeeId() === id) {
      return HttpResponse.json({ message: "You can't delete your own account while signed in." }, { status: 409 });
    }
    deleteEmployee(id);
    return new HttpResponse(null, { status: 204 });
  }),
];