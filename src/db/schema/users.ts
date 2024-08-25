import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';
import { auditSchema } from './audit';
import * as drivers from './drivers';
import * as userKeys from './userKeys';
import * as userSessions from './userSessions';
import * as feeds from './feeds';
import * as links from './links';
import { isAdmin, isAdminOrEditor, isAdminOrUser } from '../config-helpers';
import { ApiConfig } from '../index';
export const tableName = 'users';

export const route = 'users';

export const definition = {
  id: text('id').primaryKey(),
  name: text('name'),
  email: text('email'),
  password: text('password'),
  wxUid: text('wxUid'),
  role: text('role').$type<'admin' | 'editor' | 'user'>(),
  plan: text('plan').$type<'normal' | 'pro' | 'supper'>(),
};

export const table = sqliteTable(tableName, {
  ...definition,
  ...auditSchema,
});

export const relation = relations(table, ({ many }) => ({
  keys: many(userKeys.table),
  sessions: many(userSessions.table),
  feeds: many(feeds.table),
  links: many(links.table),
  drivers: many(drivers.table),
}));

export const access: ApiConfig['access'] = {
  operation: {
    create: isAdmin,
    delete: isAdmin,
  },
  item: {
    // if a user tries to update a user and isn't the user that created the user the update will return unauthorized response
    update: isAdminOrUser,
  },
  fields: {
    id: {
      read: (ctx, value, doc) => {
        return isAdminOrEditor(ctx) || isAdminOrUser(ctx, doc.id);
      },
    },
    email: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
    },
    password: {
      update: isAdminOrUser,
    },
    role: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
      update: isAdmin,
    },
    plan: {
      read: (ctx, value, doc) => {
        return isAdminOrUser(ctx, doc.id);
      },
      update: isAdmin,
    },
  },
};
