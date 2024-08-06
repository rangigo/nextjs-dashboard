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

export function renderWithUser(
  jsx: React.ReactNode,
  options?: Omit<RenderOptions, 'queries'>
) {
  return {
    user: userEvent.setup(),
    ...render(jsx, options)
  };
}
