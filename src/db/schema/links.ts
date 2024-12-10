import { sqliteTable, index, text, integer } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as feeds from './feeds';
import { ApiConfig } from '../index';
import { isAdmin, isAdminOrUser } from '../config-helpers';

export const tableName = 'links';

export const route = 'links';

export const definition = {
  id: text('id').primaryKey(),
  url: text('url'),
  title: text('title'),
  feedId: integer('feedId'),
  wxUid: text('wxUid'),
  userId: text('userId'),
  driver: text('driver'),
  folderId: text('folderId'),
  checked: integer('checked'), // 0 或 1
  saved: integer('saved'), // 0 或 1
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index('linkUserIdIndex').on(table.userId),
      feedIdIndex: index('linkPostIdIndex').on(table.feedId),
    };
  }
);

export const relation = relations(table, ({ one }) => ({
  post: one(feeds.table, {
    fields: [table.feedId],
    references: [feeds.table.id],
  }),
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: true,
    update: isAdminOrUser,
    delete: isAdminOrUser,
  },
};

export const hooks: ApiConfig['hooks'] = {
  resolveInput: {
    create: (ctx, data) => {
      if (!data.userId && ctx.get('user')?.userId) {
        data.userId = ctx.get('user').userId;
      }
      return data;
    },
    update: (ctx, id, data) => {
      if (ctx.get('user')?.userId) {
        data.userId = ctx.get('user').userId;
      }
      return data;
    },
  },
};
export const fields: ApiConfig['fields'] = {};
