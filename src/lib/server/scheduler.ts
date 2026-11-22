import { and, desc, eq, isNotNull } from 'drizzle-orm';
import { PUBLIC_BASE_URL } from '$app/env/private';
import { db } from './db';
import { checkins, partners, reminders, users } from './db/schema';
import { emailLayout, sendEmail, sendPartnerPush, sendPush } from './notify';
import { partnerViewUrl } from './alerts';

const WINDOW_MIN = 15; // tolerate restarts/missed ticks
const DAY = 864e5;

function localParts(tz: string, now = new Date()) {
	const fmt = new Intl.DateTimeFormat('en-US', {
		timeZone: tz,
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		weekday: 'short'
	});
	const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
	const weekday = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(parts.weekday);
	const hour = Number(parts.hour) % 24;
	return { weekday, minutes: hour * 60 + Number(parts.minute) };
}

async function lastCheckin(userId: string) {
	const [row] = await db
		.select({ createdAt: checkins.createdAt })
		.from(checkins)
		.where(eq(checkins.userId, userId))
		.orderBy(desc(checkins.createdAt))
		.limit(1);
	return row?.createdAt ?? null;
}

export async function runReminders(now = new Date()) {
	const rows = await db
		.select({ r: reminders, u: users })
		.from(reminders)
		.innerJoin(users, eq(reminders.userId, users.id))
		.where(eq(reminders.enabled, true));

	for (const { r, u } of rows) {
		let local;
		try {
			local = localParts(u.timezone, now);
		} catch {
			local = localParts('UTC', now);
		}
		if (!r.days.includes(local.weekday)) continue;
		const [h, m] = r.time.split(':').map(Number);
		const diff = local.minutes - (h * 60 + m);
		if (diff < 0 || diff >= WINDOW_MIN) continue;
		if (r.lastSentAt && now.getTime() - r.lastSentAt.getTime() < 12 * 3600e3) continue;

		// Mark first so a crash mid-send doesn't cause repeats.
		await db.update(reminders).set({ lastSentAt: now }).where(eq(reminders.id, r.id));

		const last = await lastCheckin(u.id);
		if (last && now.getTime() - last.getTime() < 10 * 3600e3) continue; // already checked in recently

		const url = `${PUBLIC_BASE_URL}/app/check-in`;
		if (r.viaPush) {
			await sendPush(u.id, 'reminder', {
				title: 'Time for your FASTER check-in',
				body: 'Take a few minutes to notice where you are today.',
				url
			});
		}
		if (r.viaEmail) {
			const { html, text } = emailLayout({
				heading: 'Time for your FASTER Scale check-in',
				paragraphs: [
					`Hi ${u.name},`,
					'Take a few honest minutes to notice where you are on the FASTER Scale today. Awareness is the first step back toward restoration.'
				],
				cta: { label: 'Start check-in', url },
				footer: 'You can change or turn off reminders in the app under Reminders.'
			});
			await sendEmail({
				userId: u.id,
				kind: 'reminder',
				to: u.email,
				subject: 'Your FASTER Scale check-in',
				html,
				text
			});
		}
	}
}

export async function runMissedCheckins(now = new Date()) {
	const rows = await db
		.select({ p: partners, u: users })
		.from(partners)
		.innerJoin(users, eq(partners.userId, users.id))
		.where(and(eq(partners.active, true), isNotNull(partners.notifyMissedDays)));

	const lastByUser = new Map<string, Date | null>();
	for (const { p, u } of rows) {
		const days = p.notifyMissedDays!;
		if (!lastByUser.has(u.id)) lastByUser.set(u.id, await lastCheckin(u.id));
		const since = lastByUser.get(u.id) ?? p.createdAt;
		if (now.getTime() - since.getTime() < days * DAY) continue;
		if (p.lastMissedNoticeAt && now.getTime() - p.lastMissedNoticeAt.getTime() < days * DAY)
			continue;

		await db.update(partners).set({ lastMissedNoticeAt: now }).where(eq(partners.id, p.id));
		const { html, text } = emailLayout({
			heading: `${u.name} hasn’t checked in for ${days}+ days`,
			paragraphs: [
				`Hi ${p.name},`,
				`${u.name} asked that you be told if they go ${days} days without a FASTER Scale check-in. It’s been at least that long.`,
				'A simple “thinking of you — how are you really doing?” can make a big difference.'
			],
			cta: { label: 'Open partner view', url: partnerViewUrl(p) }
		});
		await sendEmail({
			userId: u.id,
			kind: 'missed',
			to: p.email,
			subject: `${u.name} hasn’t checked in for ${days} days`,
			html,
			text,
			replyTo: u.email
		});
		await sendPartnerPush(p, 'missed', {
			title: `${u.name} hasn’t checked in for ${days}+ days`,
			body: 'A simple “how are you really doing?” can make a big difference.',
			url: `/p/${p.viewToken}`
		});
	}
}

let started = false;
export function startScheduler() {
	if (started) return;
	started = true;
	const tick = async () => {
		try {
			await runReminders();
			await runMissedCheckins();
		} catch (e) {
			console.error('[scheduler]', e);
		}
	};
	setTimeout(tick, 5_000);
	setInterval(tick, 60_000);
	console.log('[scheduler] started');
}
