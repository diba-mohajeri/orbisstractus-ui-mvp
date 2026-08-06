import type { Company } from '../../domain/companies';

export const COMPANIES: Company[] = [
  {
    id: 'absi',
    name: 'ABSI Building Consultants',
    slug: 'absi',
    plan: 'Enterprise',
    status: 'active',
    primaryContactName: 'Executive Sponsor',
    primaryContactEmail: 'executive@absi.com',
    createdAt: '2022-03-01',
  },
  {
    id: 'meridian',
    name: 'Meridian Engineering Group',
    slug: 'meridian',
    plan: 'Professional',
    status: 'active',
    primaryContactName: 'A. Bouchard',
    primaryContactEmail: 'a.bouchard@meridianeng.ca',
    createdAt: '2024-06-15',
  },
  {
    id: 'vantage',
    name: 'Vantage Point Consulting',
    slug: 'vantage',
    plan: 'Starter',
    status: 'active',
    primaryContactName: 'N. Patel',
    primaryContactEmail: 'n.patel@vantagepointeng.ca',
    createdAt: '2025-11-01',
  },
];

export function addCompany(company: Company): void {
  COMPANIES.push(company);
}

export function getCompanyById(id: string): Company | null {
  return COMPANIES.find((c) => c.id === id) ?? null;
}

export interface UpdateCompanyInput {
  name?: string;
  plan?: Company['plan'];
  status?: Company['status'];
  primaryContactName?: string;
  primaryContactEmail?: string;
}

export function updateCompany(id: string, patch: UpdateCompanyInput): Company | null {
  const company = getCompanyById(id);
  if (!company) return null;
  Object.assign(company, patch);
  return company;
}

export function deleteCompany(id: string): boolean {
  const index = COMPANIES.findIndex((c) => c.id === id);
  if (index === -1) return false;
  COMPANIES.splice(index, 1);
  return true;
}
