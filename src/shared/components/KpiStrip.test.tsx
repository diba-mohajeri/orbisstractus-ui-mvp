import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import KpiStrip from './KpiStrip';

const ITEMS = [
  { label: 'Buildings', value: '24', tone: 'neutral' as const },
  { label: 'Open Deficiencies', value: '146', tone: 'warning' as const },
];

describe('KpiStrip', () => {
  it('renders each tile label and value', () => {
    render(<KpiStrip items={ITEMS} />);
    expect(screen.getByText('Buildings')).toBeInTheDocument();
    expect(screen.getByText('24')).toBeInTheDocument();
    expect(screen.getByText('Open Deficiencies')).toBeInTheDocument();
    expect(screen.getByText('146')).toBeInTheDocument();
  });

  it('renders plain divs (not buttons) when no onSelect is given', () => {
    render(<KpiStrip items={ITEMS} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders clickable buttons and fires onSelect with the clicked item when onSelect is given', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<KpiStrip items={ITEMS} onSelect={onSelect} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(ITEMS.length);

    await user.click(screen.getByText('Open Deficiencies'));
    expect(onSelect).toHaveBeenCalledWith(ITEMS[1]);
  });
});
