import { describe, expect, test, vi } from 'vitest';
import { screen } from '@testing-library/react';
import LandingPage from './page';
import { renderWithUser } from '@/test.setup';
import mockRouter from 'next-router-mock';
import { MemoryRouterProvider } from 'next-router-mock/MemoryRouterProvider';

describe('Landing Page', () => {
  test('When the user click the login link, mock router should be called with correct url', async () => {
    const { user } = renderWithUser(<LandingPage />, {
      wrapper: MemoryRouterProvider
    });
    const loginLink = screen.getByRole('link', { name: 'Log in' });
    expect(loginLink).toBeDefined();

    await user.click(loginLink);
    expect(mockRouter).toMatchObject({
      asPath: '/login',
      pathname: '/login',
      query: {}
    });
  });
});
