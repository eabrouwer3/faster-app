import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { reminders, users } from '#lib/server/db/schema.js';
import { createSession, hashPassword } from '#lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/app');
};

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const name = String(form.get('name') ?? '').trim();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const role = form.get('role') === 'partner' ? 'partner' : 'recovery';
		const timezone = String(form.get('timezone') ?? '') || 'UTC';
		const values = { name, email, role };

		if (!name) return fail(400, { ...values, error: 'Please enter a name (a first name is fine).' });
		if (!/^\S+@\S+\.\S+$/.test(email)) return fail(400, { ...values, error: 'Please enter a valid email.' });
		if (password.length < 8) return fail(400, { ...values, error: 'Password must be at least 8 characters.' });

		const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
		if (existing) return fail(400, { ...values, error: 'An account with that email already exists.' });

		let tz = timezone;
		try {
			new Intl.DateTimeFormat('en-US', { timeZone: tz });
		} catch {
			tz = 'UTC';
		}

		const [user] = await db
			.insert(users)
			.values({ name, email, role, timezone: tz, passwordHash: await hashPassword(password) })
			.returning();
		await db.insert(reminders).values({ userId: user.id, enabled: false });
		await createSession(user.id, cookies, url.protocol === 'https:');
		redirect(303, '/app?welcome=1');
	}
};
