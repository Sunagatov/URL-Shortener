import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { TurnstileInstance, TurnstileProps } from '@marsidev/react-turnstile';
import { TurnstileWidget } from './TurnstileWidget';

const widget = vi.hoisted(() => ({ props: {} as TurnstileProps }));
vi.mock('@marsidev/react-turnstile', () => ({
  Turnstile: (props: TurnstileProps) => {
    widget.props = props;
    return <div>Security widget</div>;
  },
}));
vi.mock('@/shared/config/features', () => ({ turnstileSiteKey: 'test-site-key' }));

describe('TurnstileWidget', () => {
  it('clears an invalid token, explains a failed check and permits manual retry', async () => {
    const reset = vi.fn();
    const onClear = vi.fn();
    const onVerify = vi.fn();
    const widgetRef = { current: { reset } as unknown as TurnstileInstance };
    render(
      <TurnstileWidget
        action="url_create"
        onClear={onClear}
        onVerify={onVerify}
        widgetRef={widgetRef}
      />
    );

    act(() => {
      widget.props.onError?.('300030');
    });
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Security check failed');
    expect(widget.props.options).toMatchObject({ retry: 'never', refreshTimeout: 'manual' });

    await userEvent.click(screen.getByRole('button', { name: 'Retry security check' }));
    expect(reset).toHaveBeenCalledOnce();
    expect(screen.queryByRole('alert')).toBeNull();
    act(() => {
      widget.props.onSuccess?.('verified-token');
    });
    expect(onVerify).toHaveBeenCalledWith('verified-token');
  });

  it('explains script-loading failures instead of leaving a blank challenge', () => {
    const onClear = vi.fn();
    render(
      <TurnstileWidget
        action="url_create"
        onClear={onClear}
        onVerify={vi.fn()}
        widgetRef={{ current: undefined }}
      />
    );
    act(() => {
      widget.props.scriptOptions?.onError?.();
    });
    expect(onClear).toHaveBeenCalledOnce();
    expect(screen.getByRole('alert')).toHaveTextContent('Security check could not load');
    expect(screen.getByRole('button', { name: 'Reload page' })).toBeInTheDocument();
  });
});
