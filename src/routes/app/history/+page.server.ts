import { desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checkins } from '#lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const rows = await db
		.select({
			id: checkins.id,
			createdAt: checkins.createdAt,
			lowestStage: checkins.lowestStage,
			selections: checkins.selections,
			notes: checkins.notes,
			weekly: checkins.weekly
		})
		.from(checkins)
		.where(eq(checkins.userId, locals.user!.id))
		.orderBy(desc(checkins.createdAt))
		.limit(500);
	return { checkins: rows };
};
