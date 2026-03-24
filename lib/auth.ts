import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import GithubProvider from 'next-auth/providers/github';
import EmailProvider from 'next-auth/providers/email';

// ─── Conditionally use PrismaAdapter + database sessions ─────────────────────
// If DATABASE_URL is not set, fall back to JWT-based sessions so the app
// starts without a database connection.
const hasDatabase = Boolean(process.env.DATABASE_URL);
const hasEmail    = Boolean(process.env.EMAIL_SERVER_PASSWORD);
const hasGoogle   = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
const hasGithub   = Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET);

function buildAdapter() {
  if (!hasDatabase) return undefined;
  // Dynamic require so prisma client is not initialised when DATABASE_URL is absent
  const { PrismaAdapter } = require('@next-auth/prisma-adapter');
  const { prisma }        = require('./prisma');
  return PrismaAdapter(prisma);
}

function buildProviders() {
  const providers = [];

  if (hasGoogle) {
    providers.push(
      GoogleProvider({
        clientId:     process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      })
    );
  }

  if (hasGithub) {
    providers.push(
      GithubProvider({
        clientId:     process.env.GITHUB_ID!,
        clientSecret: process.env.GITHUB_SECRET!,
      })
    );
  }

  if (hasEmail && hasDatabase) {
    providers.push(
      EmailProvider({
        server: {
          host: process.env.EMAIL_SERVER_HOST ?? 'smtp.resend.com',
          port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
          auth: {
            user: process.env.EMAIL_SERVER_USER ?? 'resend',
            pass: process.env.EMAIL_SERVER_PASSWORD!,
          },
        },
        from: process.env.EMAIL_FROM ?? 'PetalNote <noreply@petalnote.com>',
      })
    );
  }

  return providers;
}

export const authOptions: NextAuthOptions = {
  adapter: buildAdapter(),

  providers: buildProviders(),

  session: {
    // 'database' requires a DB + adapter. Fall back to JWT if unconfigured.
    strategy: hasDatabase ? 'database' : 'jwt',
  },

  pages: {
    signIn:  '/auth/signin',
    signOut: '/auth/signout',
    error:   '/auth/error',
  },

  callbacks: {
    async session({ session, user, token }) {
      if (session.user) {
        // Database strategy populates `user`; JWT strategy uses `token`
        session.user.id            = (user?.id ?? token?.sub ?? '') as string;
        session.user.creationCount = ((user as any)?.creationCount ?? 0) as number;
      }
      return session;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
  debug:  process.env.NODE_ENV === 'development',
};
