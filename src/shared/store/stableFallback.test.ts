import { describe, expect, it } from 'vitest';
import { useObservationStore } from './observationStore';
import { useIntakeGovernanceStore } from './intakeGovernanceStore';
import { useReportQaStore } from './reportQaStore';

// Regression test for a real bug: a Zustand selector that returns a freshly
// created array/object literal as a fallback (e.g. `id ? store.get(id) : []`)
// produces a new reference on every call. React's useSyncExternalStore then
// believes the store changed on every render and loops forever
// ("Maximum update depth exceeded"). Every store's fallback must be a stable,
// module-level constant so repeated calls for a missing key return the same
// reference.

describe('store fallback stability (prevents useSyncExternalStore render loops)', () => {
  it('observationStore.getObservations returns the same reference for an unknown project across calls', () => {
    const a = useObservationStore.getState().getObservations('unknown-project');
    const b = useObservationStore.getState().getObservations('unknown-project');
    expect(a).toBe(b);
    expect(a).toEqual([]);
  });

  it('intakeGovernanceStore.getState returns the same reference for an unknown project across calls', () => {
    const a = useIntakeGovernanceStore.getState().getState('unknown-project');
    const b = useIntakeGovernanceStore.getState().getState('unknown-project');
    expect(a).toBe(b);
  });

  it('reportQaStore.getState returns the same reference for an unknown project across calls', () => {
    const a = useReportQaStore.getState().getState('unknown-project');
    const b = useReportQaStore.getState().getState('unknown-project');
    expect(a).toBe(b);
  });
});
