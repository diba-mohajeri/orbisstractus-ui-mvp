import { useEffect } from 'react';
import type { Condition, SystemName } from '../../domain/portfolioAssets';
import { useAssetRecords } from '../../features/client-portal/api';
import { useObservationStore, type Observation } from '../store/observationStore';

export const NOTES_BY_CONDITION: Record<Condition, string> = {
  good: 'No significant deficiencies observed during this pass.',
  fair: 'Minor wear noted; recommend monitoring at next inspection cycle.',
  poor: 'Notable deterioration identified — recommend follow-up analysis and cost estimate.',
  critical: 'Significant deficiency observed — recommend immediate remediation and Analyst escalation.',
};

export function defaultObservationFields(systemName: SystemName): Pick<
  Observation,
  | 'method'
  | 'quantity'
  | 'quantityUnit'
  | 'location'
  | 'weather'
  | 'accessibility'
  | 'locationPinned'
  | 'media'
  | 'thermalAnomaly'
  | 'moistureIndication'
  | 'sealantCondition'
  | 'airLeakage'
  | 'jointGapWidth'
> {
  const base = {
    method: 'Visual',
    quantity: 0,
    quantityUnit: 'm²',
    location: '',
    weather: 'Overcast · 12°C · Light wind',
    accessibility: 'Full access',
    locationPinned: false,
    media: [],
  };
  if (systemName !== 'Building Envelope') return base;
  return {
    ...base,
    thermalAnomaly: 'None detected',
    moistureIndication: 'None',
    sealantCondition: 'Good — Intact, flexible',
    airLeakage: 'None',
    jointGapWidth: '',
  };
}

// Seeds the observation store from flagged asset records the first time any page (Inspector or
// Analyst) is visited for a project, so the Analyst queue is populated even when the Inspector
// page hasn't been opened yet in this session.
export function useSeedObservations(currentProject: { id: string; buildingId: string } | undefined) {
  const assetQuery = useAssetRecords({ buildingId: currentProject?.buildingId, page: 0, pageSize: 200 });
  const seedIfEmpty = useObservationStore((s) => s.seedIfEmpty);

  useEffect(() => {
    if (!currentProject || !assetQuery.data) return;
    const flagged = assetQuery.data.rows.filter((r) => r.condition === 'poor' || r.condition === 'critical').slice(0, 4);
    if (flagged.length === 0) return;
    seedIfEmpty(
      currentProject.id,
      flagged.map((r, index) => {
        const fields = defaultObservationFields(r.systemName);
        const media =
          index === 0
            ? [
                { id: `${r.id}-m1`, type: 'photo' as const, caption: `Overview — ${r.component}` },
                { id: `${r.id}-m2`, type: 'photo' as const, caption: `Close-up detail — ${r.component}` },
                { id: `${r.id}-m3`, type: 'photo' as const, caption: `Secondary angle — ${r.component}` },
                ...(r.systemName === 'Building Envelope'
                  ? [{ id: `${r.id}-m4`, type: 'thermal' as const, caption: `Thermal anomaly — IR scan — ${r.component}` }]
                  : [{ id: `${r.id}-m4`, type: 'drone' as const, caption: `Aerial overview — ${r.component}` }]),
                { id: `${r.id}-m5`, type: 'voice' as const, caption: `Field narration — ${r.component}` },
                { id: `${r.id}-m6`, type: 'markup' as const, caption: `Defect callouts — ${r.component}` },
                { id: `${r.id}-m7`, type: 'video' as const, caption: `Walkthrough — ${r.component}` },
              ]
            : index === 1
              ? [
                  { id: `${r.id}-m1`, type: 'photo' as const, caption: `Overview — ${r.component}` },
                  { id: `${r.id}-m2`, type: 'photo' as const, caption: `Close-up detail — ${r.component}` },
                ]
              : [];
        return {
          id: r.id,
          component: r.component,
          systemName: r.systemName,
          condition: r.condition,
          notes: NOTES_BY_CONDITION[r.condition],
          reviewed: index === flagged.length - 1,
          ...fields,
          media,
        };
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProject?.id, assetQuery.data]);
}
