import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import PermissionMatrix from './PermissionMatrix';

describe('PermissionMatrix', () => {
  it('renders a check icon only for granted cells', () => {
    const rows = ['Inspector', 'Administration'];
    const columns = ['View Draft', 'Configure Platform'];
    const grants: Record<string, string[]> = {
      Inspector: ['View Draft'],
      Administration: ['View Draft', 'Configure Platform'],
    };

    const { container } = render(
      <PermissionMatrix rows={rows} columns={columns} isGranted={(row, col) => grants[row]?.includes(col) ?? false} />,
    );

    // 3 granted cells total (Inspector/View Draft, Administration/View Draft, Administration/Configure Platform)
    const checkIcons = container.querySelectorAll('svg[data-testid="CheckCircleIcon"]');
    expect(checkIcons).toHaveLength(3);
  });
});
