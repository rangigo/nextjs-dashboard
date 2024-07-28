'use client';
import { lusitana } from '@/app/ui/fonts';
import {
  AtSymbolIcon,
  KeyIcon,
  UserCircleIcon
} from '@heroicons/react/24/outline';
import { ArrowRightIcon } from '@heroicons/react/20/solid';
import { Button } from './button';
import { useActionState } from 'react';
import { signup, SignupErrorState } from '../lib/actions';
import Link from 'next/link';

export default function SignupForm() {
  const initialState: SignupErrorState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(signup, initialState);
  return (
    <form action={formAction} className='space-y-3'>
      <div className='flex-1 rounded-lg bg-gray-50 px-6 py-8 border-2 border-solid border-gray-300'>
        <h1 className={`${lusitana.className} mb-3 text-2xl`}>Sign up Form</h1>
        <div className='w-full'>
          <div>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='name'
            >
              Name
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='name'
                type='text'
                name='name'
                placeholder='Enter your name'
                required
                aria-describedby='name-error'
              />
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='name-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.name &&
                state.errors.name.map((error) => (
                  <p key={error} className='mt-2 text-sm text-red-500'>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='email'
            >
              Email
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='email'
                type='email'
                name='email'
                placeholder='Enter your email address'
                required
                aria-describedby='email-error'
              />
              <AtSymbolIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='email-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.email &&
                state.errors.email.map((error) => (
                  <p key={error} className='mt-2 text-sm text-red-500'>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='password'
            >
              Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='password'
                type='password'
                name='password'
                placeholder='Enter password'
                required
                minLength={6}
                aria-describedby='password-error'
              />
              <KeyIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div id='password-error' aria-live='polite' aria-atomic='true'>
              {state.errors?.password &&
                state.errors.password.map((error) => (
                  <p key={error} className='mt-2 text-sm text-red-500'>
                    {error}
                  </p>
                ))}
            </div>
          </div>
          <div className='mt-4'>
            <label
              className='mb-3 mt-5 block text-xs font-medium text-gray-900'
              htmlFor='confirmPassword'
            >
              Confirm Password
            </label>
            <div className='relative'>
              <input
                className='peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500'
                id='confirmPassword'
                type='password'
                name='confirmPassword'
                placeholder='Re-enter your password'
                required
                minLength={6}
                aria-describedby='confirmPassword-error'
              />
              <KeyIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-gray-900' />
            </div>
            <div
              id='confirmPassword-error'
              aria-live='polite'
              aria-atomic='true'
            >
              {state.errors?.confirmPassword &&
                state.errors.confirmPassword.map((error) => (
                  <p key={error} className='mt-2 text-sm text-red-500'>
                    {error}
                  </p>
                ))}
            </div>
          </div>
        </div>
        <div aria-live='polite' aria-atomic='true'>
          {state.message && (
            <p className='text-sm text-red-500'>{state.message}</p>
          )}
        </div>
        <Button className='mt-4 w-full' aria-disabled={isPending}>
          Sign up
          <ArrowRightIcon className='ml-auto h-5 w-5 text-gray-50' />
        </Button>
        <div className='mt-4 w-full flex items-center justify-center'>
          <p className='text-sm'>
            Already have an account?{' '}
            <Link href={'/login'} className='text-sky-600'>
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </form>
  );
}
