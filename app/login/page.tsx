import AcmeLogo from '@/app/ui/acme-logo';
import LoginForm from '@/app/ui/login-form';
import { Metadata } from 'next';
import Link from 'next/link';
import { lusitana } from '../ui/fonts';
import { providerMap } from '@/auth';
import { OAuthLoginForm } from '../ui/oauth-login-form';

export const metadata: Metadata = {
  title: 'Login'
};

export default function LoginPage({
  searchParams
}: {
  searchParams?: { callbackUrl?: string };
}) {
  return (
    <main className='flex items-center justify-center md:h-screen'>
      <div className='relative mx-auto flex w-full max-w-[400px] flex-col space-y-2.5 p-4 md:-mt-32'>
        <Link href='/'>
          <div className='flex h-20 w-full items-end rounded-lg bg-blue-500 p-3 md:h-36'>
            <div className='w-32 text-white md:w-36'>
              <AcmeLogo />
            </div>
          </div>
        </Link>
        <LoginForm callbackUrl={searchParams?.callbackUrl} />
        <div className='flex items-center'>
          <hr className='w-1/3' />
          <p className={`${lusitana.className} w-1/3 px-2 text-base`}>
            Or, Log in with
          </p>
          <hr className='flex-auto w-1/3' />
        </div>
        <div className='flex flex-col gap-2'>
          {Object.values(providerMap).map((provider) => (
            <OAuthLoginForm key={provider.id} provider={provider} />
          ))}
        </div>
      </div>
    </main>
  );
}
