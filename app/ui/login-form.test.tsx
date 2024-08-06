import { cleanup, screen } from '@testing-library/react';

import { renderWithUser } from '@/test.setup';
import LoginForm from './login-form';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { signIn } from '@/auth';
import { AuthError, CredentialsSignin } from 'next-auth';

describe('Login Form', () => {
  const email = 'test@123.com';
  const password = '123456';

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  test('Should display error message when sign in failed with incorrect credentials', async () => {
    vi.mock('../../auth.ts', async (importOriginal) => {
      return {
        ...(await importOriginal<typeof import('../../auth.ts')>()),
        signIn: vi.fn().mockImplementation(() => {
          throw new AuthError('error', {
            cause: { err: new CredentialsSignin('error') }
          });
        })
      };
    });
    const { user } = renderWithUser(<LoginForm />);
    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    const loginButton = screen.getByText('Log in');
    await user.click(loginButton);

    expect(screen.getByText(/Invalid credentials./i)).toBeDefined();
  });

  test('Email & password should be called correctly via form action', async () => {
    const { user } = renderWithUser(<LoginForm />);

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    const loginButton = screen.getByText('Log in');
    await user.click(loginButton);

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email,
      password,
      redirectTo: '/dashboard'
    });
  });

  test('Form should be submitted with correct callback URL', async () => {
    const { user } = renderWithUser(
      <LoginForm callbackUrl='/dashboard/invoices' />
    );

    const emailInput = screen.getByLabelText('Email');
    const passwordInput = screen.getByLabelText('Password');
    await user.type(emailInput, email);
    await user.type(passwordInput, password);
    const loginButton = screen.getByText('Log in');
    await user.click(loginButton);

    expect(signIn).toHaveBeenCalledWith('credentials', {
      email,
      password,
      redirectTo: '/dashboard/invoices'
    });
  });
});
