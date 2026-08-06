export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
export type ActionStatus = 'open' | 'inProgress' | 'completed' | 'overdue';

export interface RemediationAction {
  id: string;
  deficiencyId: string;
  buildingId: string;
  systemName: string;
  actionName: string;
  priority: ActionPriority;
  owner: string;
  dueDate: string;
  budget: number;
  completionPct: number;
  status: ActionStatus;
  peoReviewNeeded: boolean;
}
