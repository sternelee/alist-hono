import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { HTTPException } from 'hono/http-exception';
import { compress } from 'hono/compress';
import { getRuntimeKey } from 'hono/adapter';
import { cors } from 'hono/cors';
import { drizzle } from 'drizzle-orm/d1';
import { AppContextEnv } from './db';
import adminRouter from './admin';
import { initializeAuth } from './lib/auth';
import { Layout } from './components/Layout'
import { Home } from './components/Home';

const app = new Hono<AppContextEnv>();

app.use('*', (c, next) => {
  const runtime = getRuntimeKey();
  // @ts-ignore
  if (runtime !== 'lagon' && runtime !== 'workerd' && runtime !== 'node') {
    return compress()(c, next);
  }
  return next();
});

app.use('*', prettyJSON());

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  c.status(500);
  return c.json({ status: 'failure', message: err.message });
});

app.use("*", async (c, next) => {
  const path = c.req.path;
  const db = drizzle(c.env.D1DATA);
	c.set('db', db);
  const auth = initializeAuth(c.env);
	c.set('auth', auth);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });

  if (!session) {
    c.set("user", null);
    c.set("session", null);
    if (path.startsWith('/admin')) {
      return c.redirect('/login');
    }
    return next();
  }

  c.set("user", session.user);
  c.set("session", session.session);
  return next();
});

app.get('/', (c) => {
  // const path = c.req.path;
  return c.html(
    <Layout><Home /></Layout>
  )
})

app.route('/admin', adminRouter);

/**
 *  登陆授权相关
 */

app.use(
  '/api/auth/**',
  cors({
    origin: 'http://localhost:3001',
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['POST', 'GET', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 600,
    credentials: true,
  }),
  (c) => {
    const auth = c.get('auth');
    const authToken = auth.handler(c.req.raw);
    console.log('authToken', authToken);
    return authToken;
  }
);

/**
 *  数据相关
 */

// app.route('/v1/api', apiRoute);
//
// app.get('/v1/task', async (c) => {
//   await fetchFeeds(c.env);
//   await fetchLinks(c.env);
//   return c.json({ status: 'ok' });
// });

/**
 * @deprecated
 * Support the /v1 proxy endpoint
 */
// app.post('/v1/proxy/*', proxyHandler);

// Export the app
export default app;
