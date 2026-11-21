import * as webpush from 'web-push';
import { eq } from 'drizzle-orm';
import {
	RESEND_API_KEY,
	EMAIL_FROM,
	VAPID_PRIVATE_KEY,
	VAPID_SUBJECT
} from '$app/env/private';
import { VAPID_PUBLIC_KEY } from '$app/env/public';
import { db } from './db';
import { notifications, pushSubscriptions } from './db/schema';

let vapidReady = false;
function ensureVapid() {
	if (vapidReady) return true;
	if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) return false;
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
	vapidReady = true;
	return true;
}

export const pushConfigured = () => Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY);
export const emailConfigured = () => Boolean(RESEND_API_KEY);

interface EmailArgs {
	userId: string;
	kind: string;
	to: string;
	subject: string;
	html: string;
	text: string;
	replyTo?: string;
}

export async function sendEmail(args: EmailArgs) {
	const log = (status: string, error?: string) =>
		db.insert(notifications).values({
			userId: args.userId,
			kind: args.kind,
			channel: 'email',
			recipient: args.to,
			subject: args.subject,
			status,
			error
		});

	if (!RESEND_API_KEY) {
		console.log(`[email:logged] to=${args.to} subject="${args.subject}"\n${args.text}`);
		await log('logged', 'RESEND_API_KEY not configured');
		return { ok: false, logged: true };
	}
	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				from: EMAIL_FROM,
				to: [args.to],
				subject: args.subject,
				html: args.html,
				text: args.text,
				reply_to: args.replyTo
			})
		});
		if (!res.ok) {
			const body = await res.text();
			await log('failed', `${res.status}: ${body.slice(0, 500)}`);
			return { ok: false };
		}
		await log('sent');
		return { ok: true };
	} catch (e) {
		await log('failed', String(e));
		return { ok: false };
	}
}

export async function sendPush(
	userId: string,
	kind: string,
	payload: { title: string; body: string; url?: string }
) {
	if (!ensureVapid()) return { sent: 0 };
	const subs = await db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, userId));
	let sent = 0;
	for (const s of subs) {
		try {
			await webpush.sendNotification(
				{ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
				JSON.stringify(payload)
			);
			sent++;
			await db.insert(notifications).values({
				userId,
				kind,
				channel: 'push',
				recipient: new URL(s.endpoint).host,
				subject: payload.title,
				status: 'sent'
			});
		} catch (e: unknown) {
			const status = (e as { statusCode?: number }).statusCode;
			if (status === 404 || status === 410) {
				await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, s.id));
			}
			await db.insert(notifications).values({
				userId,
				kind,
				channel: 'push',
				recipient: new URL(s.endpoint).host,
				subject: payload.title,
				status: 'failed',
				error: String(e).slice(0, 500)
			});
		}
	}
	return { sent };
}

const esc = (s: string) =>
	s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Minimal, readable HTML email layout. */
export function emailLayout(opts: {
	heading: string;
	paragraphs: string[];
	cta?: { label: string; url: string };
	footer?: string;
}) {
	const ps = opts.paragraphs.map((p) => `<p style="margin:0 0 14px;line-height:1.55">${esc(p)}</p>`).join('');
	const cta = opts.cta
		? `<p style="margin:22px 0"><a href="${esc(opts.cta.url)}" style="background:#0f766e;color:#fff;text-decoration:none;padding:10px 18px;border-radius:8px;display:inline-block;font-weight:600">${esc(opts.cta.label)}</a></p>`
		: '';
	const footer = opts.footer
		? `<p style="margin:28px 0 0;color:#78716c;font-size:12px;line-height:1.5">${esc(opts.footer)}</p>`
		: '';
	const html = `<!doctype html><html><body style="margin:0;background:#f5f5f4;font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;color:#1c1917"><div style="max-width:520px;margin:0 auto;padding:28px 18px"><div style="background:#fff;border-radius:12px;padding:26px 24px;border:1px solid #e7e5e4"><h1 style="font-size:19px;margin:0 0 16px">${esc(opts.heading)}</h1>${ps}${cta}${footer}</div></div></body></html>`;
	const text = [
		opts.heading,
		'',
		...opts.paragraphs,
		...(opts.cta ? ['', `${opts.cta.label}: ${opts.cta.url}`] : []),
		...(opts.footer ? ['', opts.footer] : [])
	].join('\n');
	return { html, text };
}
