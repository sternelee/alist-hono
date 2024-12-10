import { integer } from 'drizzle-orm/sqlite-core/columns';

export const auditSchema = {
  createdAt: integer('createdAt', {
    mode: "timestamp"
  }).notNull(),
  updatedAt: integer('updatedAt', {
    mode: "timestamp"
  }).notNull()
};
