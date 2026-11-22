import { and, eq } from 'drizzle-orm';
import { PUBLIC_BASE_URL } from '$app/env/private';
import { db } from './db';
import { partners, type Checkin, type Partner, type User } from './db/schema';
import { stageIndex, stageName } from '#lib/faster.js';
import { emailLayout, sendEmail, sendPartnerPush } from './notify';

export function partnerViewUrl(p: Pick<Partner, 'viewToken'>) {
	return `${PUBLIC_BASE_URL}/p/${p.viewToken}`;
}

/** Email every active partner whose threshold this check-in reached. Returns names notified. */
export async function alertPartners(user: User, checkin: Checkin) {
	const list = await db
		.select()
		.from(partners)
		.where(and(eq(partners.userId, user.id), eq(partners.active, true)));

	const reached = stageIndex(checkin.lowestStage);
	const notified: string[] = [];
	for (const p of list) {
		if (reached < stageIndex(p.threshold)) continue;
		const stage = stageName(checkin.role, checkin.lowestStage);
		const { html, text } = emailLayout({
			heading: `${user.name} reached “${stage}” on the FASTER Scale`,
			paragraphs: [
				`Hi ${p.name},`,
				`${user.name} just completed a FASTER Scale check-in and the lowest point they reached was ${stage}. They asked to let you know whenever they reach ${stageName(checkin.role, p.threshold)} or lower.`,
				`This is a good moment to reach out — a call, a text, or a time to talk. You don’t need to fix anything; just be present and ask how they’re doing.`
			],
			cta: { label: 'View their check-in summary', url: partnerViewUrl(p) },
			footer: `You’re receiving this because ${user.name} added you as an accountability partner in the FASTER Scale app. Reply to this email to reach them directly.`
		});
		await sendEmail({
			userId: user.id,
			kind: 'partner_alert',
			to: p.email,
			subject: `${user.name} reached ${stage} on the FASTER Scale`,
			html,
			text,
			replyTo: user.email
		});
		await sendPartnerPush(p, 'partner_alert', {
			title: `${user.name} reached ${stage}`,
			body: `${user.name} just checked in on the FASTER Scale. A quick call or text could mean a lot.`,
			url: `/p/${p.viewToken}`
		});
		notified.push(p.name);
	}
	return notified;
}

export async function sendPartnerWelcome(user: User, p: Partner) {
	const { html, text } = emailLayout({
		heading: `${user.name} added you as an accountability partner`,
		paragraphs: [
			`Hi ${p.name},`,
			`${user.name} is using the FASTER Scale to track their ${user.role === 'partner' ? 'healing' : 'recovery'} and has asked you to be an accountability partner.`,
			`You’ll get an email when a check-in reaches ${stageName(user.role, p.threshold)} or lower${p.notifyMissedDays ? `, or if they go ${p.notifyMissedDays} days without checking in` : ''}. You can view their recent check-ins at any time with the link below — and tap “Notify me on this phone” there to get alerts as phone notifications too.`
		],
		cta: { label: 'Open partner view', url: partnerViewUrl(p) },
		footer: 'Keep this link private — anyone with it can see the summary.'
	});
	return sendEmail({
		userId: user.id,
		kind: 'partner_welcome',
		to: p.email,
		subject: `${user.name} added you as a FASTER Scale accountability partner`,
		html,
		text,
		replyTo: user.email
	});
}
