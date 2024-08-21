export type Bindings = {
  KVDATA: KVNamespace;
  D1DATA: D1Database;
  AUTH_HASH?: 'SHA512' | 'SHA384' | 'SHA256';
  AUTH_KDF?: 'pbkdf2' | 'scrypt';
  ENVIRONMENT?: 'production' | 'development';
  AUTH_ITERATIONS?: string;
};
