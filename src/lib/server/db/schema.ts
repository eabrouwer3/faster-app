import {
	pgTable,
	text,
	timestamp,
	jsonb,
	boolean,
	integer,
	uuid,
	index
} from 'drizzle-orm/pg-core';
import type { Role, Selections, StageKey } from '#lib/faster.js';

export const users = pgTable('users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: text('email').notNull().unique(),
	name: text('name').notNull(),
	passwordHash: text('password_hash').notNull(),
	role: text('role').$type<Role>().notNull().default('recovery'),
	timezone: text('timezone').notNull().default('America/Denver'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(), // sha256 of token
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export interface PartTwoEntry {
	behavior?: string;
	answers?: [string, string, string] | string[];
}

export const checkins = pgTable(
	'checkins',
	{
		id: uuid('id').primaryKey().defaultRandom(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		role: text('role').$type<Role>().notNull(),
		selections: jsonb('selections').$type<Selections>().notNull(),
		lowestStage: text('lowest_stage').$type<StageKey>().notNull(),
		/** Recovery: per-stage entries. Partner: a single 'overall' entry. */
		partTwo: jsonb('part_two').$type<Record<string, PartTwoEntry>>().notNull().default({}),
		weekly: jsonb('weekly').$type<Record<string, string>>(),
		notes: text('notes'),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [index('checkins_user_created_idx').on(t.userId, t.createdAt)]
);

export const partners = pgTable('partners', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	name: text('name').notNull(),
	email: text('email').notNull(),
	/** Notify when the lowest stage of a check-in is at or below this stage. */
	threshold: text('threshold').$type<StageKey>().notNull().default('speeding'),
	notifyMissedDays: integer('notify_missed_days'), // null = off
	shareDetails: boolean('share_details').notNull().default(false),
	active: boolean('active').notNull().default(true),
	viewToken: text('view_token').notNull().unique(),
	lastMissedNoticeAt: timestamp('last_missed_notice_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const reminders = pgTable('reminders', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' })
		.unique(),
	enabled: boolean('enabled').notNull().default(true),
	time: text('time').notNull().default('20:00'), // HH:MM in user's timezone
	days: jsonb('days').$type<number[]>().notNull().default([0, 1, 2, 3, 4, 5, 6]), // 0 = Sunday
	viaEmail: boolean('via_email').notNull().default(true),
	viaPush: boolean('via_push').notNull().default(true),
	lastSentAt: timestamp('last_sent_at', { withTimezone: true })
});

export const pushSubscriptions = pgTable('push_subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	endpoint: text('endpoint').notNull().unique(),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

/** Push subscriptions registered by accountability partners from their private link (no account). */
export const partnerPushSubscriptions = pgTable('partner_push_subscriptions', {
	id: uuid('id').primaryKey().defaultRandom(),
	partnerId: uuid('partner_id')
		.notNull()
		.references(() => partners.id, { onDelete: 'cascade' }),
	endpoint: text('endpoint').notNull().unique(),
	p256dh: text('p256dh').notNull(),
	auth: text('auth').notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const checklistState = pgTable('checklist_state', {
	userId: uuid('user_id')
		.primaryKey()
		.references(() => users.id, { onDelete: 'cascade' }),
	checked: jsonb('checked').$type<Record<string, boolean>>().notNull().default({}),
	notes: jsonb('notes').$type<Record<string, string>>().notNull().default({}),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

/** Outbox/log of every notification we attempted, visible in-app. */
export const notifications = pgTable('notifications', {
	id: uuid('id').primaryKey().defaultRandom(),
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	kind: text('kind').notNull(), // partner_alert | reminder | missed | test
	channel: text('channel').notNull(), // email | push
	recipient: text('recipient').notNull(),
	subject: text('subject').notNull(),
	status: text('status').notNull(), // sent | logged | failed
	error: text('error'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export type User = typeof users.$inferSelect;
export type Checkin = typeof checkins.$inferSelect;
export type Partner = typeof partners.$inferSelect;
export type Reminder = typeof reminders.$inferSelect;
