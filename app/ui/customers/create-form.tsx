'use client';
import Link from 'next/link';
import { AtSymbolIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { createCustomer, CustomerErrorState } from '@/app/lib/actions';
import { useActionState } from 'react';

export default function Form() {
  const initialState: CustomerErrorState = { message: null, errors: {} };
  const [state, formAction, isPending] = useActionState(
    createCustomer,
    initialState
  );

  return (
    <form action={formAction}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        {/* Customer Name */}

        <div className='mb-4'>
          <label htmlFor='name' className='mb-2 block text-sm font-medium'>
            Set customer&apos; name
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='name'
                name='name'
                type='text'
                placeholder="Enter customer's name"
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='customer-name-error'
                required
              />
              <UserCircleIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
            </div>
          </div>
          <div id='customer-name-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.name &&
              state.errors.name.map((error) => (
                <p key={error} className='mt-2 text-sm text-red-500'>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Email */}
        <div className='mb-4'>
          <label htmlFor='email' className='mb-2 block text-sm font-medium'>
            Set customer&apos;s email
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='email'
                name='email'
                type='email'
                placeholder="Enter customer's email"
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='customer-email-error'
                required
              />
              <AtSymbolIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
            </div>
          </div>
          <div id='customer-email-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.email &&
              state.errors.email.map((error) => (
                <p key={error} className='mt-2 text-sm text-red-500'>
                  {error}
                </p>
              ))}
          </div>
        </div>

        {/* Customer Avatar */}
        <div className='mb-4'>
          <label htmlFor='avatar' className='mb-2 block text-sm font-medium'>
            Upload customer&apos;s profile picture (optional)
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='avatar'
                name='avatar'
                type='file'
                className='peer block w-full text-sm'
                aria-describedby='customer-avatar-error'
                accept='image/*'
              />
            </div>
          </div>
          <div id='customer-avatar-error' aria-live='polite' aria-atomic='true'>
            {state.errors?.avatar &&
              state.errors.avatar.map((error) => (
                <p key={error} className='mt-2 text-sm text-red-500'>
                  {error}
                </p>
              ))}
          </div>
        </div>

        <div aria-live='polite' aria-atomic='true'>
          {state.message && (
            <p className='mt-2 text-sm text-red-500'>{state.message}</p>
          )}
        </div>
      </div>
      <div className='mt-6 flex justify-end gap-4'>
        <Link
          href='/dashboard/customers'
          className='flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
        >
          Cancel
        </Link>
        <Button type='submit' aria-disabled={isPending}>
          Create Customer
        </Button>
      </div>
    </form>
  );
}
