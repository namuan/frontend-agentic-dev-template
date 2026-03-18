import { act, renderHook } from '@testing-library/react';
import { ToastProvider, useToast } from './useToast';

const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
  <ToastProvider>{children}</ToastProvider>
);

describe('useToast', () => {
  it('starts with no toasts', () => {
    const { result } = renderHook(() => useToast(), { wrapper });
    expect(result.current.toasts).toHaveLength(0);
  });

  it('adds and dismisses a toast', () => {
    const { result } = renderHook(() => useToast(), { wrapper });

    act(() => {
      result.current.push({ title: 'Saved', tone: 'success' });
    });

    expect(result.current.toasts).toHaveLength(1);

    act(() => {
      result.current.dismiss(result.current.toasts[0].id);
    });

    expect(result.current.toasts).toHaveLength(0);
  });

  it('throws when used outside the provider', () => {
    expect(() => {
      renderHook(() => useToast());
    }).toThrow('useToast must be used within ToastProvider');
  });
});
