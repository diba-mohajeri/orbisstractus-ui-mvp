import { create } from 'zustand';

interface InsightXShellState {
  currentProjectId: string | null;
  setCurrentProjectId: (id: string) => void;
  technicalDrawerOpen: boolean;
  openTechnicalDrawer: () => void;
  closeTechnicalDrawer: () => void;
  qaCheckOpen: boolean;
  openQaCheck: () => void;
  closeQaCheck: () => void;
}

export const useInsightXShellStore = create<InsightXShellState>((set) => ({
  currentProjectId: null,
  setCurrentProjectId: (id) => set({ currentProjectId: id }),
  technicalDrawerOpen: false,
  openTechnicalDrawer: () => set({ technicalDrawerOpen: true }),
  closeTechnicalDrawer: () => set({ technicalDrawerOpen: false }),
  qaCheckOpen: false,
  openQaCheck: () => set({ qaCheckOpen: true }),
  closeQaCheck: () => set({ qaCheckOpen: false }),
}));
