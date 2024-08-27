import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { HTTPException } from 'hono/http-exception';
// import { env } from 'hono/adapter' // Have to set this up for multi-environment deployment

// import { proxyHandler } from './handlers/proxyHandler';
import { compress } from 'hono/compress';
import { getRuntimeKey } from 'hono/adapter';
import { authRoute } from './handlers/authHandler';
import { apiRoute } from './handlers/apiHandler';
import { AppContextEnv } from './db';
import { fetchFeeds, fetchLinks } from './task';

// Create a new Hono server instance
const app = new Hono<AppContextEnv>();

/**
 * Middleware that conditionally applies compression middleware based on the runtime.
 * Compression is automatically handled for lagon and workerd runtimes
 * This check if its not any of the 2 and then applies the compress middleware to avoid double compression.
 */

app.use('*', (c, next) => {
  const runtime = getRuntimeKey();
  // @ts-ignore
  if (runtime !== 'lagon' && runtime !== 'workerd' && runtime !== 'node') {
    return compress()(c, next);
  }
  return next();
});

/**
 * GET route for the root path.
 * Returns a greeting message.
 */
app.get('/', (c) => c.text('Alist Cloudflare Server!'));

// Use prettyJSON middleware for all routes
app.use('*', prettyJSON());

// app.use('*', require('./middlewares/cache').memoryCache());

/**
 * Default route when no other route matches.
 * Returns a JSON response with a message and status code 404.
 */
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

/**
 * Global error handler.
 * If error is instance of HTTPException, returns the custom response.
 * Otherwise, logs the error and returns a JSON response with status code 500.
 */
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  c.status(500);
  return c.json({ status: 'failure', message: err.message });
});

/**
 *  登陆相关
 */

app.route('/v1/auth', authRoute);

/**
 *  数据相关
 */

app.route('/v1/api', apiRoute);

app.get('/v1/task', async (c) => {
  await fetchFeeds(c.env);
  await fetchLinks(c.env);
  return c.json({ status: 'ok' });
});

/**
 * @deprecated
 * Support the /v1 proxy endpoint
 */
// app.post('/v1/proxy/*', proxyHandler);

// Export the app
export default app;
