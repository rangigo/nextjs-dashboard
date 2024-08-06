import { vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, RenderOptions } from '@testing-library/react';
import React from 'react';

vi.mock('next/font/google', () => {
  return {
    Inter: () => ({
      style: {
        fontFamily: 'inter'
      }
    }),
    Lusitana: () => ({
      style: {
        fontFamily: 'lusitana'
      }
    })
  };
});

vi.mock('next/router', () => require('next-router-mock'));

vi.mock('./auth.ts', async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import('./auth.ts')>()),
    signIn: vi.fn(),
    signOut: vi.fn(),
    auth: vi.fn()
  };
});

export function renderWithUser(
  jsx: React.ReactNode,
  options?: Omit<RenderOptions, 'queries'>
) {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
}
