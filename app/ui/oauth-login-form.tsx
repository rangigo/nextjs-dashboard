'use client';

import { ExclamationCircleIcon } from '@heroicons/react/24/outline';
import { signInOAuth } from '../lib/actions';
import { OAuthProvider } from '../lib/definitions';
import { useActionState } from 'react';
import Image from 'next/image';
import githubLogo from '../../public/github-mark.svg';
import googleLogo from '../../public/google-logo.svg';
import twitterLogo from '../../public/x-logo.svg';

export function OAuthLoginForm({ provider }: { provider: OAuthProvider }) {
  const signInOAuthWithProviderId = signInOAuth.bind(null, provider.id);
  const [errorMessage, formAction, isPending] = useActionState(
    signInOAuthWithProviderId,
    undefined
  );
  return (
    <form action={formAction}>
      <button
        className='my-2 py-2 w-full ml-auto leading-normal bg-gray-200 border-0 rounded-lg shadow-md flex items-center justify-center transition-colors hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-100 active:bg-gray-300 '
        type='submit'
        aria-disabled={isPending}
      >
        {provider.name === 'GitHub' && (
          <Image
            priority
            src={githubLogo}
            width={20}
            height={20}
            alt='GitHub Logo'
          />
        )}
        {provider.name === 'Google' && (
          <Image
            priority
            src={googleLogo}
            width={20}
            height={20}
            alt='Google Logo'
          />
        )}

        {provider.name === 'Twitter' && (
          <Image
            priority
            src={twitterLogo}
            width={20}
            height={20}
            alt='Google Logo'
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
