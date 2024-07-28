'use client';
import Link from 'next/link';
import { EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import { Button } from '@/app/ui/button';
import { CustomerErrorState, updateCustomer } from '@/app/lib/actions';
import { useActionState } from 'react';
import { CustomerForm } from '@/app/lib/definitions';

export default function EditCustomerForm({
  customer
}: {
  customer: CustomerForm;
}) {
  const initialState: CustomerErrorState = { message: null, errors: {} };
  const updateCustomerWithId = updateCustomer.bind(null, customer.id);
  const [state, formAction] = useActionState(
    updateCustomerWithId,
    initialState
  );

  return (
    <form action={formAction}>
      <div className='rounded-md bg-gray-50 p-4 md:p-6'>
        {/* Customer Name */}

        <div className='mb-4'>
          <label
            htmlFor='customerName'
            className='mb-2 block text-sm font-medium'
          >
            Set your customer&apos; name
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='name'
                name='name'
                type='text'
                placeholder="Enter customer's name"
                defaultValue={customer.name}
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='customer-name-error'
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
          <label
            htmlFor='customerEmail'
            className='mb-2 block text-sm font-medium'
          >
            Set your customer&apos;s email
          </label>
          <div className='relative mt-2 rounded-md'>
            <div className='relative'>
              <input
                id='email'
                name='email'
                type='text'
                placeholder="Enter customer's email"
                defaultValue={customer.email}
                className='peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500'
                aria-describedby='customer-email-error'
              />
              <EnvelopeIcon className='pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500' />
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

        <div id='status-error' aria-live='polite' aria-atomic='true'>
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
        <Button type='submit'>Edit Customer</Button>
      </div>
    </form>
  );
}
