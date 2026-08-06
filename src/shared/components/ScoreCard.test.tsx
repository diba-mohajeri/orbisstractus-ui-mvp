import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ScoreCard, { scoreTone } from './ScoreCard';

describe('scoreTone', () => {
  it('classifies scores into success / warning / error bands', () => {
    expect(scoreTone(95)).toBe('success');
    expect(scoreTone(80)).toBe('success');
    expect(scoreTone(70)).toBe('warning');
    expect(scoreTone(60)).toBe('warning');
    expect(scoreTone(45)).toBe('error');
  });
});

describe('ScoreCard', () => {
  it('renders the title, score, and meta rows', () => {
    render(
      <ScoreCard
        title="Maple Towers"
        score={82}
        meta={[
          { label: 'Region', value: 'GTA West' },
          { label: 'Risk', value: 'low' },
        ]}
      />,
    );
    expect(screen.getByText('Maple Towers')).toBeInTheDocument();
    expect(screen.getByText('82')).toBeInTheDocument();
    expect(screen.getByText('GTA West')).toBeInTheDocument();
  });

  it('renders as a non-interactive div when no onClick is given, and a clickable button when it is', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<ScoreCard title="Maple Towers" score={82} />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(<ScoreCard title="Maple Towers" score={82} onClick={onClick} />);
    await user.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
