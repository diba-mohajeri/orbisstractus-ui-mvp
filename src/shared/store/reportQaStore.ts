import { create } from 'zustand';

export type QaFlagStatus = 'open' | 'review' | 'closed';

export interface QaFlag {
  id: string;
  label: string;
  type: string;
  status: QaFlagStatus;
}

const NEXT_FLAG_STATUS: Record<QaFlagStatus, QaFlagStatus> = {
  open: 'review',
  review: 'closed',
  closed: 'open',
};

interface ProjectQaState {
  flags: QaFlag[];
  sealApplied: boolean;
  engineerName: string;
  draftGenerated: boolean;
}

const DEFAULT_STATE: ProjectQaState = { flags: [], sealApplied: false, engineerName: '', draftGenerated: false };

interface ReportQaStoreState {
  byProject: Record<string, ProjectQaState>;
  getState: (projectId: string) => ProjectQaState;
  seedIfEmpty: (projectId: string, flags: QaFlag[]) => void;
  toggleFlag: (projectId: string, flagId: string) => void;
  closeFlag: (projectId: string, flagId: string) => void;
  applySeal: (projectId: string, engineerName: string) => void;
  generateDraft: (projectId: string) => void;
}

export const useReportQaStore = create<ReportQaStoreState>((set, get) => ({
  byProject: {},
  getState: (projectId) => get().byProject[projectId] ?? DEFAULT_STATE,
  seedIfEmpty: (projectId, flags) =>
    set((state) =>
      state.byProject[projectId]
        ? state
        : { byProject: { ...state.byProject, [projectId]: { flags, sealApplied: false, engineerName: '', draftGenerated: false } } },
    ),
  toggleFlag: (projectId, flagId) =>
    set((state) => {
      const current = state.byProject[projectId] ?? DEFAULT_STATE;
      return {
        byProject: {
          ...state.byProject,
          [projectId]: {
            ...current,
            flags: current.flags.map((f) => (f.id === flagId ? { ...f, status: NEXT_FLAG_STATUS[f.status] } : f)),
          },
        },
      };
    }),
  closeFlag: (projectId, flagId) =>
    set((state) => {
      const current = state.byProject[projectId] ?? DEFAULT_STATE;
      return {
        byProject: {
          ...state.byProject,
          [projectId]: {
            ...current,
            flags: current.flags.map((f) => (f.id === flagId ? { ...f, status: 'closed' } : f)),
          },
        },
      };
    }),
  applySeal: (projectId, engineerName) =>
    set((state) => {
      const current = state.byProject[projectId] ?? DEFAULT_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, sealApplied: true, engineerName } } };
    }),
  generateDraft: (projectId) =>
    set((state) => {
      const current = state.byProject[projectId] ?? DEFAULT_STATE;
      return { byProject: { ...state.byProject, [projectId]: { ...current, draftGenerated: true } } };
    }),
}));
