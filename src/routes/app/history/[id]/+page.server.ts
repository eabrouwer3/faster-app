import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checkins } from '#lib/server/db/schema.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, params }) => {
	if (!/^[0-9a-f-]{36}$/.test(params.id)) error(404, 'Not found');
	const [row] = await db
		.select()
		.from(checkins)
		.where(and(eq(checkins.id, params.id), eq(checkins.userId, locals.user!.id)));
	if (!row) error(404, 'Check-in not found');
	return { checkin: row };
};

export const actions: Actions = {
	delete: async ({ locals, params }) => {
		await db.delete(checkins).where(and(eq(checkins.id, params.id), eq(checkins.userId, locals.user!.id)));
		redirect(303, '/app/history');
	}
};
