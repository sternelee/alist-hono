import { sqliteTable, index, text } from 'drizzle-orm/sqlite-core';

import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as links from './links';
import { ApiConfig } from '../index';
import { isAdmin, isAdminOrEditor } from '../config-helpers';

export const tableName = 'feeds';

export const route = 'feeds';

export const definition = {
  id: text('id').primaryKey(),
  title: text('title'),
  url: text('url'),
  userId: text('userId'),
  wxUid: text('wxUid'),
  driver: text('driver'),
  folderId: text('folderId'),
  folderName: text('folderName'),
  regexp: text('regexp'),
};

export const table = sqliteTable(
  tableName,
  {
    ...definition,
    ...auditSchema,
  },
  (table) => {
    return {
      userIdIndex: index('feedUserIdIndex').on(table.userId),
    };
  }
);

export const relation = relations(table, ({ one, many }) => ({
  links: many(links.table),
}));

export const access: ApiConfig['access'] = {
  operation: {
    read: true,
    create: true, // 起过20条普通用户不允许
  },
  filter: {
    // if a user tries to update a feed and isn't the user that created the feed the update won't happen
    update: (ctx) => {
      if (isAdmin(ctx)) {
        return true;
      } else {
        const user = ctx.get('user');
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId,
          };
        } else {
          return false;
        }
      }
    },
    delete: (ctx) => {
      if (isAdmin(ctx)) {
        return true;
      } else {
        const user = ctx.get('user');
        if (user?.userId) {
          // Return filter so update doesn't happen if userId doesn't match
          return {
            userId: user.userId,
          };
        } else {
          return false;
        }
      }
    },
  },
  fields: {
    userId: {
      update: false,
    },
  },
};
export const hooks: ApiConfig['hooks'] = {
  beforeOperation: (ctx, operation, _, data) => {
    if (operation === 'read') {
      if (data && ctx.get('user')?.userId) {
        data.filters = {
          userId: {
            $eq: ctx.get('user').userId,
          },
        };
      }
    }
  },
  resolveInput: {
    create: (ctx, data) => {
      if (ctx.get('user')?.userId) {
        data.userId = ctx.get('user').userId;
        data.wxUid = ctx.get('user').wxUid;
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
