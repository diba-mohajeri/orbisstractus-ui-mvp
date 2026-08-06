import { create } from 'zustand';
import type { Condition, SystemName } from '../../domain/portfolioAssets';

export type ObservationMediaType = 'photo' | 'thermal' | 'drone' | 'voice' | 'markup' | 'video';

export interface ObservationMediaItem {
  id: string;
  type: ObservationMediaType;
  caption: string;
  localAssetId?: string;
  fileName?: string;
  syncStatus?: 'queued' | 'syncing' | 'synced' | 'failed';
}

export interface Observation {
  id: string;
  uniformatCode?: string;
  component: string;
  systemName: SystemName;
  condition: Condition;
  notes: string;
  reviewed: boolean;
  method: string;
  quantity: number;
  quantityUnit: string;
  location: string;
  weather: string;
  accessibility: string;
  locationPinned: boolean;
  media: ObservationMediaItem[];
  thermalAnomaly?: string;
  moistureIndication?: string;
  sealantCondition?: string;
  airLeakage?: string;
  jointGapWidth?: string;
}

const EMPTY_OBSERVATIONS: Observation[] = [];

interface ObservationState {
  byProject: Record<string, Observation[]>;
  getObservations: (projectId: string) => Observation[];
  seedIfEmpty: (projectId: string, seed: Observation[]) => void;
  addObservation: (projectId: string, observation: Observation) => void;
  updateObservation: (projectId: string, id: string, patch: Partial<Observation>) => void;
}

export const useObservationStore = create<ObservationState>((set, get) => ({
  byProject: {},
  getObservations: (projectId) => get().byProject[projectId] ?? EMPTY_OBSERVATIONS,
  seedIfEmpty: (projectId, seed) =>
    set((state) => (state.byProject[projectId] ? state : { byProject: { ...state.byProject, [projectId]: seed } })),
  addObservation: (projectId, observation) =>
    set((state) => ({
      byProject: { ...state.byProject, [projectId]: [observation, ...(state.byProject[projectId] ?? [])] },
    })),
  updateObservation: (projectId, id, patch) =>
    set((state) => ({
      byProject: {
        ...state.byProject,
        [projectId]: (state.byProject[projectId] ?? []).map((o) => (o.id === id ? { ...o, ...patch } : o)),
      },
    })),
}));
