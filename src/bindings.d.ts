export type Bindings = {
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  AUTH_HASH?: 'SHA512' | 'SHA384' | 'SHA256';
  AUTH_KDF?: 'pbkdf2' | 'scrypt';
  ENVIRONMENT?: 'production' | 'development';
  WX_PUSH_Token?: string;
  AUTH_ITERATIONS?: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
	GITHUB_CLIENT_ID: string;
	GITHUB_CLIENT_SECRET: string;
};
