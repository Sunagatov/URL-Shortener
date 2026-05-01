import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRef } from 'react';
import { useApi } from '@/shared/api/useApi';

type Deferred<T> = {
  promise: Promise<T>;
  reject: (reason?: unknown) => void;
  resolve: (value: T) => void;
};

function createDeferred<T>(): Deferred<T> {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return { promise, reject, resolve };
}

function UseApiHarness() {
  const deferredCallsRef = useRef<Deferred<string>[]>([]);
  const { data, error, execute, loading, reset } = useApi<string>();

  const runRequest = async () => {
    const deferred = createDeferred<string>();
    deferredCallsRef.current.push(deferred);
    await execute(() => deferred.promise, { action: 'test.request' });
  };

  return (
    <div>
      <button type="button" onClick={() => void runRequest()}>
        Execute
      </button>
      <button
        type="button"
        onClick={() => {
          deferredCallsRef.current.shift()?.resolve('resolved');
        }}
      >
        Resolve next
      </button>
      <button
        type="button"
        onClick={() => {
          deferredCallsRef.current.shift()?.reject({
            response: {
              data: { errorMessage: 'Request failed' },
              status: 500,
            },
          });
        }}
      >
        Reject next
      </button>
      <button type="button" onClick={reset}>
        Reset
      </button>
      <span data-testid="loading">{loading ? 'loading' : 'idle'}</span>
      <span data-testid="data">{data ?? 'empty'}</span>
      <span data-testid="error">{error?.errorMessage ?? 'none'}</span>
    </div>
  );
}

describe('useApi', () => {
  it('ignores stale request failures after a newer request succeeds', async () => {
    const user = userEvent.setup();
    render(<UseApiHarness />);

    await user.click(screen.getByRole('button', { name: 'Execute' }));
    await user.click(screen.getByRole('button', { name: 'Execute' }));

    expect(screen.getByTestId('loading')).toHaveTextContent('loading');

    await user.click(screen.getByRole('button', { name: 'Reject next' }));
    await user.click(screen.getByRole('button', { name: 'Resolve next' }));

    await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('idle'));
    expect(screen.getByTestId('data')).toHaveTextContent('resolved');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });

  it('resets all request state explicitly', async () => {
    const user = userEvent.setup();
    render(<UseApiHarness />);

    await user.click(screen.getByRole('button', { name: 'Execute' }));
    await user.click(screen.getByRole('button', { name: 'Reject next' }));

    await waitFor(() => expect(screen.getByTestId('error')).toHaveTextContent('Request failed'));

    await user.click(screen.getByRole('button', { name: 'Reset' }));

    expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    expect(screen.getByTestId('data')).toHaveTextContent('empty');
    expect(screen.getByTestId('error')).toHaveTextContent('none');
  });
});
