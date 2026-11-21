import { error, json } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { pushSubscriptions } from '#lib/server/db/schema.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401);
	const body = await request.json();
	const { endpoint, keys } = body ?? {};
	if (typeof endpoint !== 'string' || !keys?.p256dh || !keys?.auth) error(400, 'Invalid subscription');
	await db
		.insert(pushSubscriptions)
		.values({ userId: locals.user.id, endpoint, p256dh: keys.p256dh, auth: keys.auth })
		.onConflictDoUpdate({
			target: pushSubscriptions.endpoint,
			set: { userId: locals.user.id, p256dh: keys.p256dh, auth: keys.auth }
		});
	return json({ ok: true });
};

export const DELETE: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) error(401);
	const { endpoint } = await request.json();
	await db
		.delete(pushSubscriptions)
		.where(and(eq(pushSubscriptions.endpoint, String(endpoint)), eq(pushSubscriptions.userId, locals.user.id)));
	return json({ ok: true });
};
