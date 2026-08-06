import type { Company, CompanyPlan, CompanyStatus } from '../../domain/companies';
import type { AuditEvent } from '../../shared/store/auditLogStore';
import type { Employee } from '../../domain/employees';
import type { BuildingSummaryResponse } from './portfolioAssets';

export interface CompanyRow extends Company {
  employeeCount: number;
  buildingCount: number;
  activeProjectCount: number;
  clientCount: number;
}

export interface CompanyDetailResponse {
  company: Company;
  employees: Employee[];
  buildings: BuildingSummaryResponse[];
  activeProjectCount: number;
  deficiencyCount: number;
  reportCount: number;
  capitalExposureFormatted: string;
  clientOrganizations: string[];
  recentActivity: AuditEvent[];
}

export interface UpdateCompanyRequest {
  name?: string;
  plan?: CompanyPlan;
  status?: CompanyStatus;
  primaryContactName?: string;
  primaryContactEmail?: string;
}

export interface CreateCompanyRequest {
  name: string;
  plan: CompanyPlan;
  primaryContactName: string;
  primaryContactEmail: string;
  firstAdminName: string;
  firstAdminEmail: string;
}

export interface CreateCompanyResponse {
  company: Company;
  adminEmployee: Employee;
}
