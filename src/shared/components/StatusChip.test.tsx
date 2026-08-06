import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusChip, { conditionTone, healthTone, riskTone, severityTone } from './StatusChip';

describe('StatusChip', () => {
  it('renders the given label', () => {
    render(<StatusChip label="Active" tone="success" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('maps risk levels to the expected tone', () => {
    expect(riskTone('high')).toBe('error');
    expect(riskTone('medium')).toBe('warning');
    expect(riskTone('low')).toBe('success');
  });

  it('maps conditions to the expected tone', () => {
    expect(conditionTone('critical')).toBe('error');
    expect(conditionTone('poor')).toBe('error');
    expect(conditionTone('fair')).toBe('warning');
    expect(conditionTone('good')).toBe('success');
  });

  it('maps deficiency severities to the expected tone', () => {
    expect(severityTone('critical')).toBe('error');
    expect(severityTone('high')).toBe('error');
    expect(severityTone('medium')).toBe('warning');
    expect(severityTone('low')).toBe('success');
  });

  it('maps health tiers to the expected tone', () => {
    expect(healthTone('critical')).toBe('error');
    expect(healthTone('atRisk')).toBe('warning');
    expect(healthTone('monitor')).toBe('neutral');
    expect(healthTone('healthy')).toBe('success');
  });
});
