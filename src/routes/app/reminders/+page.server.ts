import { count, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { pushSubscriptions, reminders } from '#lib/server/db/schema.js';
import { emailConfigured, emailLayout, pushConfigured, sendEmail, sendPush } from '#lib/server/notify.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const uid = locals.user!.id;
	let [r] = await db.select().from(reminders).where(eq(reminders.userId, uid));
	if (!r) [r] = await db.insert(reminders).values({ userId: uid, enabled: false }).returning();
	const [{ n }] = await db.select({ n: count() }).from(pushSubscriptions).where(eq(pushSubscriptions.userId, uid));
	return { reminder: r, pushDevices: n, pushConfigured: pushConfigured(), emailConfigured: emailConfigured() };
};

export const actions: Actions = {
	save: async ({ request, locals }) => {
		const form = await request.formData();
		const time = String(form.get('time') ?? '20:00');
		const days = form.getAll('days').map(Number).filter((d) => d >= 0 && d <= 6);
		await db
			.update(reminders)
			.set({
				enabled: form.get('enabled') === 'on',
				time: /^\d{2}:\d{2}$/.test(time) ? time : '20:00',
				days: days.length ? days : [0, 1, 2, 3, 4, 5, 6],
				viaEmail: form.get('viaEmail') === 'on',
				viaPush: form.get('viaPush') === 'on',
				lastSentAt: null
			})
			.where(eq(reminders.userId, locals.user!.id));
		return { ok: 'Reminder saved.' };
	},
	test: async ({ locals, url }) => {
		const u = locals.user!;
		const link = `${url.origin}/app/check-in`;
		const push = await sendPush(u.id, 'test', { title: 'FASTER Scale', body: 'Test notification — you’re all set.', url: link });
		const { html, text } = emailLayout({
			heading: 'Test reminder',
			paragraphs: ['This is what your FASTER Scale reminder will look like.'],
			cta: { label: 'Start check-in', url: link }
		});
		const mail = await sendEmail({ userId: u.id, kind: 'test', to: u.email, subject: 'FASTER Scale test reminder', html, text });
		return { ok: `Test sent: ${push.sent} push, email ${mail.ok ? 'sent' : 'logged'}.` };
	}
};
