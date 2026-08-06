import { create } from 'zustand';
import type { StatusTone } from '../components/StatusChip';

export type SystemScopeStatus = 'inScope' | 'limited' | 'excluded' | 'optionalReview';

export const SCOPE_STATUS_LABEL: Record<SystemScopeStatus, string> = {
  inScope: 'In Scope',
  limited: 'Limited',
  excluded: 'Excluded',
  optionalReview: 'Optional / Review',
};

export const SCOPE_STATUS_TONE: Record<SystemScopeStatus, StatusTone> = {
  inScope: 'success',
  limited: 'warning',
  excluded: 'neutral',
  optionalReview: 'error',
};

export type ApprovedOperationalContext = 'bca' | 'envelope';

interface ProjectIntakeState {
  systemScopeStatus: Record<string, SystemScopeStatus>;
  scopeApproved: boolean;
  readinessComplete: boolean;
  readinessPct: number;
  approvedOperationalContext: ApprovedOperationalContext;
}

const EMPTY_STATE: ProjectIntakeState = {
  systemScopeStatus: {},
  scopeApproved: false,
  readinessComplete: false,
  readinessPct: 0,
  approvedOperationalContext: 'bca',
};

interface IntakeGovernanceState {
  byProject: Record<string, ProjectIntakeState>;
  getState: (projectId: string) => ProjectIntakeState;
  setSystemScopeStatus: (projectId: string, systemName: string, status: SystemScopeStatus) => void;
  approveScope: (projectId: string) => void;
  setReadinessComplete: (projectId: string, complete: boolean) => void;
  setReadinessPct: (projectId: string, pct: number) => void;
  setApprovedOperationalContext: (projectId: string, context: ApprovedOperationalContext) => void;
}

export const useIntakeGovernanceStore = create<IntakeGovernanceState>((set, get) => ({
  byProject: {},
  getState: (projectId) => get().byProject[projectId] ?? EMPTY_STATE,
  setSystemScopeStatus: (projectId, systemName, status) =>
    set((state) => {
      const current = state.byProject[projectId] ?? EMPTY_STATE;
      return {
        byProject: {
          ...state.byProject,
          [projectId]: {
            ...current,
            systemScopeStatus: { ...current.systemScopeStatus, [systemName]: status },
            scopeApproved: false,
          },
        },
      };
    }),
  approveScope: (projectId) =>
    set((state) => {
      const current = state.byProject[projectId] ?? EMPTY_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, scopeApproved: true } } };
    }),
  setReadinessComplete: (projectId, complete) =>
    set((state) => {
      const current = state.byProject[projectId] ?? EMPTY_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, readinessComplete: complete } } };
    }),
  setReadinessPct: (projectId, pct) =>
    set((state) => {
      const current = state.byProject[projectId] ?? EMPTY_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, readinessPct: pct } } };
    }),
  setApprovedOperationalContext: (projectId, context) =>
    set((state) => {
      const current = state.byProject[projectId] ?? EMPTY_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, approvedOperationalContext: context } } };
    }),
}));
