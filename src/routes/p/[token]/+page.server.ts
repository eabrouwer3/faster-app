import { error } from '@sveltejs/kit';
import { desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checkins, partners, users } from '#lib/server/db/schema.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	setHeaders({ 'x-robots-tag': 'noindex', 'cache-control': 'private, no-store' });
	const [row] = await db
		.select({ p: partners, u: { name: users.name, role: users.role } })
		.from(partners)
		.innerJoin(users, eq(partners.userId, users.id))
		.where(eq(partners.viewToken, params.token));
	if (!row || !row.p.active) error(404, 'This link is no longer active.');

	const list = await db
		.select()
		.from(checkins)
		.where(eq(checkins.userId, row.p.userId))
		.orderBy(desc(checkins.createdAt))
		.limit(60);

	const shared = list.map((c) => ({
		id: c.id,
		createdAt: c.createdAt,
		lowestStage: c.lowestStage,
		role: c.role,
		// Behaviors are only shared if the user opted in for this partner.
		selections: row.p.shareDetails ? c.selections : {}
	}));
	return {
		token: params.token,
		partnerName: row.p.name,
		person: row.u,
		shareDetails: row.p.shareDetails,
		checkins: shared
	};
};
