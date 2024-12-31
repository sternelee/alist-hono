import { betterAuth } from "better-auth"
import { username, admin } from 'better-auth/plugins';
import { LibsqlDialect } from "@libsql/kysely-libsql";
import { config } from 'dotenv';

config({ path: '.env' }); // or .env.local

export const auth = betterAuth({
   	database: {
      dialect: new LibsqlDialect({
        url: process.env.TURSO_DATABASE_URL || "",
        authToken: process.env.TURSO_AUTH_TOKEN || "",
      }),
      type: "sqlite"
    },
    secret: process.env.BETTER_AUTH_SECRET,
    // baseURL: process.env.BETTER_AUTH_URL,
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID as string,
        clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
      },
    },
    plugins: [username(), admin()],
})
