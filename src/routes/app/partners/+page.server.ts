import { fail } from '@sveltejs/kit';
import { and, desc, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { notifications, partners } from '#lib/server/db/schema.js';
import { randomToken } from '#lib/server/auth.js';
import { partnerViewUrl, sendPartnerWelcome } from '#lib/server/alerts.js';
import { emailConfigured } from '#lib/server/notify.js';
import { STAGE_ORDER, type StageKey } from '#lib/faster.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.id;
	const [list, log] = await Promise.all([
		db.select().from(partners).where(eq(partners.userId, uid)).orderBy(partners.createdAt),
		db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, uid))
			.orderBy(desc(notifications.createdAt))
			.limit(15)
	]);
	return {
		partners: list.map((p) => ({ ...p, viewUrl: partnerViewUrl(p) })),
		log,
		emailConfigured: emailConfigured()
	};
};

function parse(form: FormData) {
	const threshold = String(form.get('threshold') ?? 'speeding') as StageKey;
	const missed = Number(form.get('notifyMissedDays') ?? 0);
	return {
		name: String(form.get('name') ?? '').trim().slice(0, 80),
		email: String(form.get('email') ?? '').trim().toLowerCase().slice(0, 200),
		threshold: STAGE_ORDER.includes(threshold) && threshold !== 'restoration' ? threshold : 'speeding',
		notifyMissedDays: Number.isFinite(missed) && missed > 0 ? Math.min(30, Math.round(missed)) : null,
		shareDetails: form.get('shareDetails') === 'on'
	};
}

export const actions: Actions = {
	add: async ({ request, locals }) => {
		const v = parse(await request.formData());
		if (!v.name) return fail(400, { error: 'Please enter a name.' });
		if (!/^\S+@\S+\.\S+$/.test(v.email)) return fail(400, { error: 'Please enter a valid email.' });
		const [p] = await db
			.insert(partners)
			.values({ ...v, userId: locals.user!.id, viewToken: randomToken(18) })
			.returning();
		await sendPartnerWelcome(locals.user!, p);
		return { ok: `Added ${p.name}.` };
	},
	update: async ({ request, locals }) => {
		const form = await request.formData();
		const id = String(form.get('id'));
		const v = parse(form);
		await db
			.update(partners)
			.set({ threshold: v.threshold, notifyMissedDays: v.notifyMissedDays, shareDetails: v.shareDetails, active: form.get('active') === 'on' })
			.where(and(eq(partners.id, id), eq(partners.userId, locals.user!.id)));
		return { ok: 'Saved.' };
	},
	remove: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		await db.delete(partners).where(and(eq(partners.id, id), eq(partners.userId, locals.user!.id)));
		return { ok: 'Removed.' };
	},
	resetLink: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		await db
			.update(partners)
			.set({ viewToken: randomToken(18) })
			.where(and(eq(partners.id, id), eq(partners.userId, locals.user!.id)));
		return { ok: 'New private link created. The old link no longer works.' };
	},
	resend: async ({ request, locals }) => {
		const id = String((await request.formData()).get('id'));
		const [p] = await db.select().from(partners).where(and(eq(partners.id, id), eq(partners.userId, locals.user!.id)));
		if (p) await sendPartnerWelcome(locals.user!, p);
		return { ok: 'Invitation re-sent.' };
	}
};
