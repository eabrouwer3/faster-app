import { and, desc, eq, gte, count } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checkins, checklistState, partners, reminders } from '#lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const user = locals.user!;
	const since = new Date(Date.now() - 90 * 864e5);
	const [recent, [{ n: partnerCount }], [reminder], [checklist], [{ n: total }]] = await Promise.all([
		db
			.select({ id: checkins.id, createdAt: checkins.createdAt, lowestStage: checkins.lowestStage })
			.from(checkins)
			.where(and(eq(checkins.userId, user.id), gte(checkins.createdAt, since)))
			.orderBy(desc(checkins.createdAt))
			.limit(120),
		db.select({ n: count() }).from(partners).where(and(eq(partners.userId, user.id), eq(partners.active, true))),
		db.select().from(reminders).where(eq(reminders.userId, user.id)),
		db.select().from(checklistState).where(eq(checklistState.userId, user.id)),
		db.select({ n: count() }).from(checkins).where(eq(checkins.userId, user.id))
	]);
	return { recent, partnerCount, reminder: reminder ?? null, checklist: checklist?.checked ?? {}, total };
};
