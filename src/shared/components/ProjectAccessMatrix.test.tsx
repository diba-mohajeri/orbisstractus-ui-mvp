import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProjectAccessMatrix from './ProjectAccessMatrix';
import type { ProjectAccessRow } from '../../api/contracts/projectAccess';

const rows: ProjectAccessRow[] = [
  {
    employeeId: 'emp-004',
    employeeName: 'R. Singh',
    employeeRole: 'inspector',
    onTeam: true,
    access: {
      intake: { level: 'view', isOverride: false },
      inspector: { level: 'edit', isOverride: false },
      analysis: { level: 'view', isOverride: false },
      reportqa: { level: 'view', isOverride: false },
      delivery: { level: 'view', isOverride: true },
    },
  },
];

describe('ProjectAccessMatrix', () => {
  it('shows a Default label for non-overridden cells and an Override chip for overridden ones', () => {
    render(
      <ProjectAccessMatrix
        rows={rows}
        steps={['intake', 'inspector', 'analysis', 'reportqa', 'delivery']}
        stepLabel={(step) => step}
        onSetAccess={vi.fn()}
      />,
    );

    expect(screen.getByText('Default — Edit')).toBeInTheDocument();
    expect(screen.getByText('Override — View')).toBeInTheDocument();
  });

  it('calls onSetAccess with the employee, step, and chosen level', async () => {
    const onSetAccess = vi.fn();
    const user = userEvent.setup();
    render(
      <ProjectAccessMatrix
        rows={rows}
        steps={['intake', 'inspector', 'analysis', 'reportqa', 'delivery']}
        stepLabel={(step) => step}
        onSetAccess={onSetAccess}
      />,
    );

    await user.click(screen.getByLabelText('R. Singh — analysis'));
    await user.click(await screen.findByRole('option', { name: 'Edit' }));

    expect(onSetAccess).toHaveBeenCalledWith('emp-004', 'analysis', 'edit');
  });
});
