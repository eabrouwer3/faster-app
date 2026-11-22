import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { partnerPushSubscriptions, partners, users } from '#lib/server/db/schema.js';
import { sendPartnerPush } from '#lib/server/notify.js';
import type { RequestHandler } from './$types';

async function partnerFor(token: string) {
	const [row] = await db
		.select({ p: partners, ownerName: users.name })
		.from(partners)
		.innerJoin(users, eq(partners.userId, users.id))
		.where(eq(partners.viewToken, token));
	if (!row || !row.p.active) error(404, 'This link is no longer active.');
	return row;
}

/** Register this device for notifications, or (with ?test) send a test notification. */
export const POST: RequestHandler = async ({ params, request, url }) => {
	const { p, ownerName } = await partnerFor(params.token);

	if (url.searchParams.has('test')) {
		const { sent } = await sendPartnerPush(p, 'partner_test', {
			title: 'Notifications are on ✓',
			body: `You’ll get a notification here when ${ownerName} needs support.`,
			url: `/p/${p.viewToken}`
		});
		return json({ sent });
	}

	const { endpoint, keys } = (await request.json()) ?? {};
	if (typeof endpoint !== 'string' || !keys?.p256dh || !keys?.auth) error(400, 'Invalid subscription');
	await db
		.insert(partnerPushSubscriptions)
		.values({ partnerId: p.id, endpoint, p256dh: keys.p256dh, auth: keys.auth })
		.onConflictDoUpdate({
			target: partnerPushSubscriptions.endpoint,
			set: { partnerId: p.id, p256dh: keys.p256dh, auth: keys.auth }
		});
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ params, request }) => {
	const { p } = await partnerFor(params.token);
	const { endpoint } = (await request.json()) ?? {};
	await db
		.delete(partnerPushSubscriptions)
		.where(and(eq(partnerPushSubscriptions.partnerId, p.id), eq(partnerPushSubscriptions.endpoint, String(endpoint))));
	return json({ ok: true });
};
