import { fail, redirect } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { users } from '#lib/server/db/schema.js';
import { createSession, verifyPassword } from '#lib/server/auth.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) redirect(303, '/app');
};

const safeNext = (n: string | null) => (n && n.startsWith('/') && !n.startsWith('//') ? n : '/app');

export const actions: Actions = {
	default: async ({ request, cookies, url }) => {
		const form = await request.formData();
		const email = String(form.get('email') ?? '').trim().toLowerCase();
		const password = String(form.get('password') ?? '');
		const [user] = await db.select().from(users).where(eq(users.email, email));
		if (!user || !(await verifyPassword(password, user.passwordHash))) {
			return fail(400, { email, error: 'That email and password don’t match.' });
		}
		await createSession(user.id, cookies, url.protocol === 'https:');
		redirect(303, safeNext(url.searchParams.get('next')));
	}
};
