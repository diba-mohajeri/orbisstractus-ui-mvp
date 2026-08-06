import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RowActionButton from './RowActionButton';

describe('RowActionButton', () => {
  it('renders the label and calls onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<RowActionButton label="View Action" onClick={onClick} />);

    await user.click(screen.getByRole('button', { name: 'View Action' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('stops the click from bubbling to an ancestor handler (so it is safe inside clickable DataGrid rows)', async () => {
    const onClick = vi.fn();
    const onRowClick = vi.fn();
    const user = userEvent.setup();

    render(
      // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
      <div onClick={onRowClick}>
        <RowActionButton label="View Action" onClick={onClick} />
      </div>,
    );

    await user.click(screen.getByRole('button', { name: 'View Action' }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
