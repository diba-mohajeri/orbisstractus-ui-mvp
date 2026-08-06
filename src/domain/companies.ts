export type CompanyPlan = 'Starter' | 'Professional' | 'Enterprise';
export type CompanyStatus = 'active' | 'suspended';

export interface Company {
  id: string;
  name: string;
  slug: string;
  plan: CompanyPlan;
  status: CompanyStatus;
  primaryContactName: string;
  primaryContactEmail: string;
  createdAt: string;
}
