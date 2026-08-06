import { describe, expect, it } from 'vitest';
import { ASSET_RECORDS, addLifecycleExpenditureEntry, getLifecycleExpenditures, updateAssetRecord } from './portfolioData';

describe('updateAssetRecord', () => {
  it('recomputes remainingUsefulLifeYears from expectedUsefulLifeYears - effectiveAgeYears', () => {
    const assetId = ASSET_RECORDS[0].id;

    const updated = updateAssetRecord(assetId, { expectedUsefulLifeYears: 30, effectiveAgeYears: 12 });

    expect(updated?.remainingUsefulLifeYears).toBe(18);
    expect(updated?.expectedUsefulLifeYears).toBe(30);
    expect(updated?.effectiveAgeYears).toBe(12);
  });

  it('clamps remainingUsefulLifeYears to 0 when effective age exceeds expected useful life', () => {
    const assetId = ASSET_RECORDS[1].id;

    const updated = updateAssetRecord(assetId, { expectedUsefulLifeYears: 10, effectiveAgeYears: 25 });

    expect(updated?.remainingUsefulLifeYears).toBe(0);
  });

  it('leaves unspecified fields untouched and applies only the given patch', () => {
    const assetId = ASSET_RECORDS[2].id;
    const before = { ...ASSET_RECORDS[2] };

    const updated = updateAssetRecord(assetId, { replacementCost: 99_000 });

    expect(updated?.replacementCost).toBe(99_000);
    expect(updated?.futureReplacementYear).toBe(before.futureReplacementYear);
    expect(updated?.inflationAssumptionPct).toBe(before.inflationAssumptionPct);
  });

  it('returns null for an unknown asset record id', () => {
    expect(updateAssetRecord('AR-does-not-exist', { replacementCost: 1 })).toBeNull();
  });
});

describe('lifecycle expenditure log', () => {
  it('appends new entries newest-first and preserves prior entries', () => {
    const assetId = ASSET_RECORDS[3].id;
    const before = getLifecycleExpenditures(assetId).length;

    const entry = addLifecycleExpenditureEntry(assetId, { date: '2026-06-01', description: 'Test repair', cost: 1200 });

    const after = getLifecycleExpenditures(assetId);
    expect(after.length).toBe(before + 1);
    expect(after[0].id).toBe(entry.id);
    expect(after[0].description).toBe('Test repair');
  });

  it('returns an empty array for an asset with no expenditure history', () => {
    expect(getLifecycleExpenditures('AR-does-not-exist')).toEqual([]);
  });
});
