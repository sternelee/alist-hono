import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { username, admin } from 'better-auth/plugins';
import { drizzle } from 'drizzle-orm/d1';
import { Bindings } from '../bindings';

export const initializeAuth = (env: Bindings) => {
  const db = drizzle(env.D1DATA);
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: 'sqlite',
    }),
    secondaryStorage: {
      get: key => env.KVDATA.get(`_auth:${key}`),
      set: (key, value, ttl) => {
        return env.KVDATA.put(`_auth:${key}`, value, { expirationTtl: ttl })
      },
      delete: key => env.KVDATA.delete(`_auth:${key}`),
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: env.GITHUB_CLIENT_ID,
        clientSecret: env.GITHUB_CLIENT_SECRET,
      },
    },
    plugins: [username(), admin()],
  });
};

export type Auth = ReturnType<typeof initializeAuth>;
