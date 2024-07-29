'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { signInOAuth } from '../lib/actions';
import { OAuthProvider } from '../lib/definitions';
import { useActionState } from 'react';
import Image from 'next/image';
import githubIcon from '../../public/github-mark.svg';

export function OAuthLoginForm({ provider }: { provider: OAuthProvider }) {
  const signInOAuthWithProviderId = signInOAuth.bind(null, provider.id);
  const [errorMessage, formAction, isPending] = useActionState(
    signInOAuthWithProviderId,
    undefined
  );
  return (
    <form action={formAction}>
      <button
        className='mt-2 py-2 w-full mb-4 ml-auto leading-normal bg-gray-100 border-0 rounded-lg shadow-md flex items-center justify-center'
        type='submit'
        aria-disabled={isPending}
      >
        {provider.name === 'GitHub' && (
          <Image
            priority
            src={githubIcon}
            width={20}
            height={20}
            alt='GitHub Logo'
          />
        )}
        <span className='ml-2'>Sign in with {provider.name}</span>
      </button>
      {errorMessage && (
        <div
          className='flex h-8 items-end space-x-1'
          aria-live='polite'
          aria-atomic='true'
        >
          <>
            <ExclamationCircleIcon className='h-5 w-5 text-red-500' />
            <p className='text-sm text-red-500'>{errorMessage}</p>
          </>
        </div>
      )}
    </form>
  );
}
