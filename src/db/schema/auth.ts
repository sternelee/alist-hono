import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { text, integer } from 'drizzle-orm/sqlite-core/columns';
import { auditSchema } from './audit';

export const user = sqliteTable("user", {
	id: text("id").primaryKey(),
	name: text('name').notNull(),
	firstName: text('firstName'),
	lastName: text('lastName'),
	email: text('email').notNull().unique(),
	emailVerified: integer('emailVerified', {
		mode: "boolean"
	}).notNull(),
	image: text('image'),
	role: text('role'),
	...auditSchema,
});

export const session = sqliteTable("session", {
	id: text("id").primaryKey(),
	expiresAt: integer('expiresAt', {
		mode: "timestamp"
	}).notNull(),
	ipAddress: text('ipAddress'),
	userAgent: text('userAgent'),
	userId: text('userId').notNull().references(() => user.id),
	token: text('token'),
	...auditSchema,
});

export const account = sqliteTable("account", {
	id: text("id").primaryKey(),
	accountId: text('accountId').notNull(),
	providerId: text('providerId').notNull(),
	userId: text('userId').notNull().references(() => user.id),
	accessToken: text('accessToken'),
	refreshToken: text('refreshToken'),
	idToken: text('idToken'),
	expiresAt: integer('expiresAt', {
		mode: "timestamp"
	}),
	password: text('password')
});

export const verification = sqliteTable("verification", {
	id: text("id").primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: integer('expiresAt', {
		mode: "timestamp"
	}).notNull(),
	...auditSchema,
});
