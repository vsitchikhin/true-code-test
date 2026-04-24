import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Modal } from './Modal';

vi.mock('@base-ui/react/dialog', () => ({
  Dialog: {
    Root: ({
      open,
      onOpenChange,
      children,
    }: {
      open: boolean;
      onOpenChange: (open: boolean) => void;
      children: React.ReactNode;
    }) =>
      open ? (
        <div data-testid="dialog-root" onClick={() => onOpenChange(false)}>
          {children}
        </div>
      ) : null,
    Portal: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    Backdrop: () => <div data-testid="backdrop" />,
    Popup: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    ),
    Title: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <h2 className={className}>{children}</h2>
    ),
    Close: ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <button className={className} onClick={() => {}}>
        {children}
      </button>
    ),
  },
}));

describe('Modal', () => {
  it('рендерит children и заголовок когда isOpen=true', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()} title="Заголовок модалки">
        <p>Содержимое</p>
      </Modal>,
    );
    expect(screen.getByText('Заголовок модалки')).toBeInTheDocument();
    expect(screen.getByText('Содержимое')).toBeInTheDocument();
  });

  it('не рендерит ничего когда isOpen=false', () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()} title="Заголовок">
        <p>Содержимое</p>
      </Modal>,
    );
    expect(screen.queryByText('Заголовок')).not.toBeInTheDocument();
    expect(screen.queryByText('Содержимое')).not.toBeInTheDocument();
  });

  it('вызывает onClose при закрытии диалога', () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen={true} onClose={onClose} title="Тест">
        <span>body</span>
      </Modal>,
    );
    fireEvent.click(screen.getByTestId('dialog-root'));
    expect(onClose).toHaveBeenCalled();
  });

  it('рендерит без заголовка если title не передан', () => {
    render(
      <Modal isOpen={true} onClose={vi.fn()}>
        <span>body</span>
      </Modal>,
    );
    expect(screen.getByText('body')).toBeInTheDocument();
  });
});
