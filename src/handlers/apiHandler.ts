import { Hono } from 'hono';
import qs from 'qs';
import { AppContextEnv, apiConfig } from '../db';
import {
  getRecords,
  insertRecord,
  updateRecord,
  deleteRecord,
} from '../db/data';
import { login } from '../drivers';
import { fetchFeed } from '../utils/extract';

const apiRoute = new Hono<AppContextEnv>();

// apiRoute.use('*', async (ctx, next) => {
//   const auth = initializeLucia(ctx.env.D1DATA, ctx.env);
//   // @ts-ignore
//   const authRequest = auth.handleRequest(ctx);
//   let session = await authRequest.validate();
//   if (!session) {
//     session = await authRequest.validateBearerToken();
//   }
//   if (!session) {
//     return ctx.redirect('/admin/login', 302);
//   }
//   if (session?.user?.userId) {
//     ctx.set('user', session.user);
//   }
//
//   authRequest.setSession(session);
//
//   ctx.set('authRequest', authRequest);
//   ctx.set('session', session);
//   await next();
// });

const tables = apiConfig.filter((tbl) => tbl.table !== 'users');
tables.forEach((entry) => {
  //ie /v1/api/users
  apiRoute.get(`/${entry.route}`, async (ctx) => {
    const start = Date.now();
    const query = ctx.req.query();
    const params = qs.parse(query);

    if (entry.hooks?.beforeOperation) {
      // @ts-ignore
      await entry.hooks.beforeOperation(ctx, 'read', params.id, params);
    }
    try {
      params.limit = params.limit ?? '1000';
      ctx.env.D1DATA = ctx.env.D1DATA;
      let data = await getRecords(ctx, entry.table, params);

      if (entry.hooks?.afterOperation) {
        // @ts-ignore
        await entry.hooks.afterOperation(ctx, 'read', params.id, null, data);
      }

      const end = Date.now();
      const executionTime = end - start;

      return ctx.json({ ...data, executionTime });
    } catch (error) {
      return ctx.text(error as unknown as string);
    }
  });

  //redirect users to auth controller
  apiRoute.get(`/users`, async (ctx) => {
    return ctx.redirect('/v1/auth/users');
  });

  //get single record
  apiRoute.get(`/${entry.route}/:id`, async (ctx) => {
    const start = Date.now();

    let { includeContentType, source, ...params } = ctx.req.query();

    const id = ctx.req.param('id');

    if (entry.hooks?.beforeOperation) {
      await entry.hooks.beforeOperation(ctx, 'read', id);
    }

    params.id = id;
    ctx.env.D1DATA = ctx.env.D1DATA;

    source = source || 'fastest';
    if (includeContentType !== undefined) {
      source = 'd1';
    }

    let data = await getRecords(ctx, entry.table, params);

    if (entry.hooks?.afterOperation) {
      await entry.hooks.afterOperation(ctx, 'read', id, null, data);
    }

    const end = Date.now();
    const executionTime = end - start;

    return ctx.json({ ...data, executionTime });
  });

  //create single record
  //TODO: support batch inserts
  apiRoute.post(`/${entry.route}`, async (ctx) => {
    let content = await ctx.req.json();
    ctx.env.D1DATA = ctx.env.D1DATA;

    if (entry.hooks?.beforeOperation) {
      await entry.hooks.beforeOperation(ctx, 'create', undefined, content);
    }

    content.table = entry.route;

    try {
      if (entry?.hooks?.resolveInput?.create) {
        content.data = await entry.hooks.resolveInput.create(ctx, content.data);
      }
      const result = await insertRecord(ctx.env.D1DATA, content);

      if (entry?.hooks?.afterOperation) {
        await entry.hooks.afterOperation(
          ctx,
          'create',
          result?.data?.['id'],
          content,
          result
        );
      }
      // @ts-ignore
      return ctx.json(result?.data, 201);
    } catch (error) {
      return ctx.text(error as unknown as string, 500);
    }
  });

  //update single record
  //TODO: support batch inserts
  apiRoute.put(`/${entry.route}/:id`, async (ctx) => {
    const payload = await ctx.req.json();
    const id = ctx.req.param('id');
    var content: { data?: any; table?: string; id?: string } = {};
    ctx.env.D1DATA = ctx.env.D1DATA;
    content.data = payload.data;
    if (entry.hooks?.beforeOperation) {
      await entry.hooks?.beforeOperation(ctx, 'update', id, content);
    }

    let { includeContentType, source, ...params } = ctx.req.query();
    content.table = entry.table;
    content.id = id;

    try {
      if (entry?.hooks?.resolveInput?.update) {
        content.data = await entry.hooks.resolveInput.update(
          ctx,
          id,
          content.data
        );
      }
      const result = await updateRecord(ctx.env.D1DATA, content, params);
      if (entry?.hooks?.afterOperation) {
        await entry.hooks.afterOperation(ctx, 'update', id, content, result);
      }
      return ctx.json(result.data, 200);
    } catch (error) {
      return ctx.text(error as unknown as string, 500);
    }
  });

  //delete
  apiRoute.delete(`/${entry.route}/:id`, async (ctx) => {
    const id = ctx.req.param('id');
    ctx.env.D1DATA = ctx.env.D1DATA;

    if (entry.hooks?.beforeOperation) {
      await entry.hooks.beforeOperation(ctx, 'delete', id);
    }

    let { includeContentType, source, ...params } = ctx.req.query();

    params.id = id;

    const record = await getRecords(ctx, entry.table, params);

    if (record) {
      const result = await deleteRecord(ctx.env.D1DATA, {
        id,
        table: entry.table,
      });
      if (entry?.hooks?.afterOperation) {
        await entry.hooks.afterOperation(ctx, 'delete', id, record, result);
      }
      return ctx.text('', 204);
    } else {
      return ctx.text('', 404);
    }
  });
});

apiRoute.get('/ping', (ctx) => {
  return ctx.json(`${ctx.req.path} is all good`);
});

apiRoute.post('/driver/:driver', async (ctx) => {
  const { userId } = ctx.get('user');
  const driver = ctx.req.param('driver');
  const content = await ctx.req.json();
  const resp = await login(ctx.env.KVDATA, { ...content, userId, driver });
  return ctx.json(resp);
});

apiRoute.post('/fetch', async (ctx) => {
  const { url } = await ctx.req.json();
  const links = await fetchFeed(url);
  return ctx.json(links);
});

export { apiRoute };
