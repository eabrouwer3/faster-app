import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { users } from '#lib/server/db/schema.js';
import { hashPassword, verifyPassword, SESSION_COOKIE } from '#lib/server/auth.js';
import type { Actions } from './$types';

export const actions: Actions = {
	profile: async ({ request, locals }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim().slice(0, 80);
		const role = form.get('role') === 'partner' ? 'partner' : 'recovery';
		let timezone = String(form.get('timezone') ?? 'UTC');
		try {
			new Intl.DateTimeFormat('en-US', { timeZone: timezone });
		} catch {
			timezone = 'UTC';
		}
		if (!name) return fail(400, { error: 'Name is required.' });
		await db.update(users).set({ name, role, timezone }).where(eq(users.id, locals.user!.id));
		return { ok: 'Profile saved.' };
	},
	password: async ({ request, locals }) => {
		const form = await request.formData();
		const current = String(form.get('current') ?? '');
		const next = String(form.get('next') ?? '');
		if (!(await verifyPassword(current, locals.user!.passwordHash))) return fail(400, { error: 'Current password is incorrect.' });
		if (next.length < 8) return fail(400, { error: 'New password must be at least 8 characters.' });
		await db.update(users).set({ passwordHash: await hashPassword(next) }).where(eq(users.id, locals.user!.id));
		return { ok: 'Password changed.' };
	},
	deleteAccount: async ({ request, locals, cookies }) => {
		const form = await request.formData();
		if (form.get('confirm') !== 'DELETE') return fail(400, { error: 'Type DELETE to confirm.' });
		await db.delete(users).where(eq(users.id, locals.user!.id));
		cookies.delete(SESSION_COOKIE, { path: '/' });
		redirect(303, '/');
	}
};
