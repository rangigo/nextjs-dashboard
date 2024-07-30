import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import { OAuthProvider, User } from './app/lib/definitions';
import { sql } from '@vercel/postgres';
import bcrypt from 'bcrypt';
import GitHub from 'next-auth/providers/github';
import { Provider } from 'next-auth/providers';
import Google from 'next-auth/providers/google';
import Twitter from 'next-auth/providers/twitter';
import Facebook from 'next-auth/providers/facebook';

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user', error);
    throw new Error(`Database Error. Failed to fetch user with email ${email}`);
  }
}
const providers: Provider[] = [
  Credentials({
    async authorize(credentials) {
      const parsedCredentials = z
        .object({ email: z.string().email(), password: z.string().min(6) })
        .safeParse(credentials);

      if (parsedCredentials.success) {
        const { email, password } = parsedCredentials.data;
        const user = await getUser(email);
        if (!user) return null;
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
          return user;
        }
      }

      console.log('Invalid credentials');
      return null;
    }
  }),
  GitHub,
  Google,
  Twitter,
  Facebook
];

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  providers
});

export const providerMap: OAuthProvider[] = providers
  .filter((provider) => provider.name !== 'Credentials')
  .map((provider) => {
    if (typeof provider === 'function') {
      const providerData = provider();
      return { id: providerData.id, name: providerData.name };
    } else {
      return { id: provider.id, name: provider.name };
    }
  });
