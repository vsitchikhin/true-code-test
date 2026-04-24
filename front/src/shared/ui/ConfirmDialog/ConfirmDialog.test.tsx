import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmDialog } from './ConfirmDialog';

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({ open, children }: { open: boolean; children: React.ReactNode }) =>
      open ? <div>{children}</div> : null,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Backdrop: () => <div data-testid="backdrop" />,
    Popup: ({ children }: { children: React.ReactNode }) => <div role="dialog">{children}</div>,
    Title: ({ children }: { children: React.ReactNode }) => <h2>{children}</h2>,
    Close: ({ children, ...props }: React.ComponentProps<'button'>) => (
      <button {...props}>{children}</button>
    ),
  },
}));

describe('ConfirmDialog', () => {
  const baseProps = {
    isOpen: true,
    title: 'Удалить пост',
    message: 'Это нельзя отменить.',
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
  };

  it('отображает заголовок и сообщение', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByText('Удалить пост')).toBeInTheDocument();
    expect(screen.getByText('Это нельзя отменить.')).toBeInTheDocument();
  });

  it('показывает кнопки с дефолтными лейблами', () => {
    render(<ConfirmDialog {...baseProps} />);
    expect(screen.getByRole('button', { name: /подтвердить/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /отмена/i })).toBeInTheDocument();
  });

  it('показывает кастомные лейблы кнопок', () => {
    render(<ConfirmDialog {...baseProps} confirmLabel="Удалить" cancelLabel="Нет" />);
    expect(screen.getByRole('button', { name: /удалить/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /нет/i })).toBeInTheDocument();
  });

  it('вызывает onConfirm при клике на кнопку подтверждения', () => {
    const onConfirm = vi.fn();
    render(<ConfirmDialog {...baseProps} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByRole('button', { name: /подтвердить/i }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('вызывает onCancel при клике на кнопку отмены', () => {
    const onCancel = vi.fn();
    render(<ConfirmDialog {...baseProps} onCancel={onCancel} />);
    fireEvent.click(screen.getByRole('button', { name: /отмена/i }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('блокирует кнопки при isLoading=true', () => {
    render(<ConfirmDialog {...baseProps} isLoading={true} />);
    expect(screen.getByRole('button', { name: /отмена/i })).toBeDisabled();
  });

  it('не рендерится когда isOpen=false', () => {
    render(<ConfirmDialog {...baseProps} isOpen={false} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });
});
