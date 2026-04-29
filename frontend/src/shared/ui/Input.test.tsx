import { render, screen } from '@testing-library/react';
import { Input } from './Input';

describe('Input', () => {
  it('associates the label with the input', () => {
    render(<Input label="Email Address" type="email" />);

    expect(screen.getByLabelText(/email address/i)).toHaveAttribute('type', 'email');
  });

  it('links validation errors to the input description', () => {
    render(<Input label="Email Address" error="Email is required" />);

    const input = screen.getByLabelText(/email address/i);
    const error = screen.getByText(/email is required/i);

    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby', error.id);
  });
});
