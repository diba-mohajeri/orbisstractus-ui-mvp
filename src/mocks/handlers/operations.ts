import { delay, http, HttpResponse } from 'msw';
import {
  computeActionStats,
  computeDeficiencyStats,
  createDeficiencyFromObservation,
  getActionRows,
  getDeficiencyRows,
  getProjectRows,
  getVisibleReportRows,
} from '../data/portfolioQueries';
import type { CreateAssessmentRequest, CreateDeficiencyRequest } from '../../api/contracts/operations';
import { BUILDINGS, PROJECTS, REGIONS, deleteProject } from '../data/portfolioData';
import { getActiveCompanyId, getActiveEmployeeId } from '../data/tenantScope';
import { setProjectTeamMembership } from '../data/projectAccess';

export const operationsHandlers = [
  http.get('/api/projects', async () => {
    await delay(300);
    return HttpResponse.json(getProjectRows());
  }),

  http.post('/api/projects', async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as CreateAssessmentRequest;
    const companyId = getActiveCompanyId() ?? body.companyId ?? REGIONS[0].companyId;
    const region = REGIONS.find((item) => item.companyId === companyId) ?? REGIONS[0];
    const sequence = PROJECTS.length + 1;
    const buildingId = `BLD-NEW-${sequence}`;
    const projectId = `PRJ-${String(sequence).padStart(3, '0')}`;
    const contactParts = body.clientContact.split('·').map((part) => part.trim());
    const buildingName = body.propertyAddress.split(',')[0]?.trim() || `New BCA Asset ${sequence}`;

    BUILDINGS.push({
      id: buildingId,
      name: buildingName,
      address: body.propertyAddress,
      regionId: region.id,
      companyId,
      assetClass: body.portfolioType || body.occupancyType,
      riskLevel: 'low',
      capitalExposure: 0,
      status: 'active',
      healthPct: 100,
      healthTier: 'healthy',
      clientOrganization: body.clientOrganization,
      clientContactName: contactParts[0] || body.clientContact,
      clientContactEmail: contactParts[1] || '',
      engagementPurpose: body.purpose,
      portfolioName: body.portfolioName,
      portfolioType: body.portfolioType,
      portfolioAssetCountLabel: body.assetsInPortfolio,
      yearBuilt: body.yearBuilt,
      grossFloorAreaSqm: body.grossFloorAreaSqm,
      storeys: body.storeys,
      occupancyType: body.occupancyType,
      structureType: body.structureType,
      envelopeType: body.envelopeType,
      siteSuperintendentName: '',
      siteSuperintendentPhone: '',
      roofAccessNotes: '',
      parkingAccessNotes: '',
    });

    PROJECTS.push({
      id: projectId,
      buildingId,
      serviceLine: 'BCA',
      status: 'planned',
      currentStage: 'Intake Review',
      consultantLead: body.projectOwner,
      targetDeliveryDate: body.siteVisitDate,
      siteVisitDate: body.siteVisitDate,
      assessmentHorizonYears: body.assessmentHorizonYears,
      pEngReviewerName: body.pEngReviewerName.replace(/,?\s*P\.Eng\.?$/i, ''),
      inspectorName: body.inspectorName,
      deliveryMethod: body.deliveryMethod,
      assessmentType: body.assessmentType,
      assessmentScope: body.assessmentScope,
      requiredDeliverables: body.requiredDeliverables,
      applicableCodes: body.applicableCodes,
    });
    const activeEmployeeId = getActiveEmployeeId();
    if (activeEmployeeId) setProjectTeamMembership(projectId, activeEmployeeId, true);

    return HttpResponse.json({
      project: { ...PROJECTS[PROJECTS.length - 1], buildingName, companyId },
    }, { status: 201 });
  }),

  http.delete('/api/projects/:id', async ({ params }) => {
    await delay(300);
    const deleted = deleteProject(String(params.id));
    if (!deleted) {
      return HttpResponse.json({ message: 'Project not found' }, { status: 404 });
    }
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/reports', async () => {
    await delay(300);
    return HttpResponse.json(getVisibleReportRows());
  }),

  http.get('/api/deficiencies', async () => {
    await delay(300);
    return HttpResponse.json(getDeficiencyRows());
  }),

  http.get('/api/deficiencies/stats', async () => {
    await delay(250);
    return HttpResponse.json(computeDeficiencyStats());
  }),

  http.post('/api/deficiencies', async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as CreateDeficiencyRequest;
    const result = createDeficiencyFromObservation(body);
    return HttpResponse.json(result, { status: 201 });
  }),

  http.get('/api/actions', async () => {
    await delay(300);
    return HttpResponse.json(getActionRows());
  }),

  http.get('/api/actions/stats', async () => {
    await delay(250);
    return HttpResponse.json(computeActionStats());
  }),
];
