import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import OptionCardToggle from './OptionCardToggle';

const OPTIONS = [
  { id: 'direct', title: 'Without Public Tender', description: 'Direct assignment.' },
  { id: 'tender', title: 'With Public Tender (RFP)', description: 'Open an RFP process.' },
];

describe('OptionCardToggle', () => {
  it('marks the selected option as pressed', () => {
    render(<OptionCardToggle options={OPTIONS} selectedId="direct" onSelect={vi.fn()} />);
    expect(screen.getByRole('button', { name: /Without Public Tender/ })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: /With Public Tender/ })).toHaveAttribute('aria-pressed', 'false');
  });

  it('calls onSelect with the clicked option id', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<OptionCardToggle options={OPTIONS} selectedId="direct" onSelect={onSelect} />);

    await user.click(screen.getByRole('button', { name: /With Public Tender/ }));
    expect(onSelect).toHaveBeenCalledWith('tender');
  });
});
