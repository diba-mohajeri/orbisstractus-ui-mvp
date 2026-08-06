import { delay, http, HttpResponse } from 'msw';
import { addCompany, COMPANIES, deleteCompany, getCompanyById, updateCompany } from '../data/companies';
import { EMPLOYEES, inviteEmployee } from '../data/employees';
import { BUILDINGS, DEFICIENCIES, PROJECTS, REGIONS, REPORTS } from '../data/portfolioData';
import { useAuditLogStore } from '../../shared/store/auditLogStore';
import { formatCurrency } from '../../shared/utils/format';
import type { Company } from '../../domain/companies';
import type {
  CompanyDetailResponse,
  CompanyRow,
  CreateCompanyRequest,
  CreateCompanyResponse,
  UpdateCompanyRequest,
} from '../../api/contracts/companies';

function slugify(name: string, fallbackIndex: number): string {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
  if (!slug || COMPANIES.some((c) => c.id === slug)) {
    return `company-${fallbackIndex}`;
  }
  return slug;
}

export const companiesHandlers = [
  http.get('/api/companies', async () => {
    await delay(300);
    const buildingCompanyById = new Map(BUILDINGS.map((b) => [b.id, b.companyId]));
    const rows: CompanyRow[] = COMPANIES.map((c) => {
      const companyBuildings = BUILDINGS.filter((b) => b.companyId === c.id);
      return {
        ...c,
        employeeCount: EMPLOYEES.filter((e) => e.companyId === c.id).length,
        buildingCount: companyBuildings.length,
        activeProjectCount: PROJECTS.filter((p) => p.status === 'active' && buildingCompanyById.get(p.buildingId) === c.id).length,
        clientCount: new Set(companyBuildings.map((b) => b.clientOrganization)).size,
      };
    });
    return HttpResponse.json(rows);
  }),

  http.get('/api/companies/:id/detail', async ({ params }) => {
    await delay(300);
    const companyId = String(params.id);
    const company = getCompanyById(companyId);
    if (!company) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 });
    }

    const employees = EMPLOYEES.filter((e) => e.companyId === companyId);
    const employeeEmails = new Set(employees.map((e) => e.email.toLowerCase()));
    const rawBuildings = BUILDINGS.filter((b) => b.companyId === companyId);
    const buildingIds = new Set(rawBuildings.map((b) => b.id));
    const buildings = rawBuildings.map((b) => ({
      ...b,
      regionName: REGIONS.find((r) => r.id === b.regionId)?.name ?? '',
      capitalExposureFormatted: formatCurrency(b.capitalExposure),
    }));
    const totalCapitalExposure = rawBuildings.reduce((sum, b) => sum + b.capitalExposure, 0);

    const response: CompanyDetailResponse = {
      company,
      employees,
      buildings,
      activeProjectCount: PROJECTS.filter((p) => p.status === 'active' && buildingIds.has(p.buildingId)).length,
      deficiencyCount: DEFICIENCIES.filter((d) => buildingIds.has(d.buildingId)).length,
      reportCount: REPORTS.filter((r) => r.status !== 'draftHidden' && buildingIds.has(r.buildingId)).length,
      capitalExposureFormatted: formatCurrency(totalCapitalExposure),
      clientOrganizations: [...new Set(rawBuildings.map((b) => b.clientOrganization))].sort(),
      recentActivity: useAuditLogStore.getState().events.filter((e) => employeeEmails.has(e.actor.toLowerCase())).slice(0, 10),
    };
    return HttpResponse.json(response);
  }),

  http.post('/api/companies', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as CreateCompanyRequest;

    const company: Company = {
      id: slugify(body.name, COMPANIES.length + 1),
      name: body.name,
      slug: slugify(body.name, COMPANIES.length + 1),
      plan: body.plan,
      status: 'active',
      primaryContactName: body.primaryContactName,
      primaryContactEmail: body.primaryContactEmail,
      createdAt: new Date().toISOString().slice(0, 10),
    };
    addCompany(company);

    const adminEmployee = inviteEmployee({
      name: body.firstAdminName,
      email: body.firstAdminEmail,
      role: 'admin',
      companyId: company.id,
      title: 'Administrator',
      department: 'Executive',
    });

    const response: CreateCompanyResponse = { company, adminEmployee };
    return HttpResponse.json(response, { status: 201 });
  }),

  http.post('/api/companies/:id', async ({ params, request }) => {
    await delay(350);
    const body = (await request.json()) as UpdateCompanyRequest;
    const company = updateCompany(String(params.id), body);
    if (!company) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 });
    }
    return HttpResponse.json(company);
  }),

  http.delete('/api/companies/:id', async ({ params }) => {
    await delay(350);
    const companyId = String(params.id);
    if (!getCompanyById(companyId)) {
      return HttpResponse.json({ message: 'Company not found' }, { status: 404 });
    }
    const employeeCount = EMPLOYEES.filter((e) => e.companyId === companyId).length;
    const buildingCount = BUILDINGS.filter((b) => b.companyId === companyId).length;
    if (employeeCount > 0 || buildingCount > 0) {
      return HttpResponse.json(
        { message: `Remove all employees and buildings from this company before deleting it (${employeeCount} employee(s), ${buildingCount} building(s) remaining).` },
        { status: 409 },
      );
    }
    deleteCompany(companyId);
    return new HttpResponse(null, { status: 204 });
  }),
];
