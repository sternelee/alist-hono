import { Hono } from 'hono';
import { prettyJSON } from 'hono/pretty-json';
import { HTTPException } from 'hono/http-exception';
import { compress } from 'hono/compress';
import { getRuntimeKey } from 'hono/adapter';
import { authRoute } from './handlers/authHandler';
import { apiRoute } from './handlers/apiHandler';
import { AppContextEnv } from './db';
import { fetchFeeds, fetchLinks } from './task';
import adminRouter from './admin';
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

// app.get('/', (c) => c.text('Alist Cloudflare Server!'));
app.get('/', (c) => {
  const path = c.req.path;
  return c.html(
    <Layout><Home /></Layout>
  )
})

app.use('*', prettyJSON());

app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404));

app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  c.status(500);
  return c.json({ status: 'failure', message: err.message });
});

app.route('/admin', adminRouter);

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
