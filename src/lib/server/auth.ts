import { randomBytes, scrypt as _scrypt, timingSafeEqual, createHash } from 'node:crypto';
import { promisify } from 'node:util';
import { eq } from 'drizzle-orm';
import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { sessions, users } from './db/schema';

const scrypt = promisify(_scrypt) as (pw: string, salt: Buffer, len: number) => Promise<Buffer>;

export const SESSION_COOKIE = 'faster_session';
const SESSION_DAYS = 30;

export async function hashPassword(password: string) {
	const salt = randomBytes(16);
	const key = await scrypt(password, salt, 64);
	return `scrypt$${salt.toString('base64')}$${key.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string) {
	const [, saltB64, keyB64] = stored.split('$');
	if (!saltB64 || !keyB64) return false;
	const key = Buffer.from(keyB64, 'base64');
	const test = await scrypt(password, Buffer.from(saltB64, 'base64'), key.length);
	return timingSafeEqual(key, test);
}

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export function randomToken(bytes = 24) {
	return randomBytes(bytes).toString('base64url');
}

export async function createSession(userId: string, cookies: Cookies, secure: boolean) {
	const token = randomToken();
	const expiresAt = new Date(Date.now() + SESSION_DAYS * 864e5);
	await db.insert(sessions).values({ id: sha256(token), userId, expiresAt });
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires: expiresAt
	});
}

export async function validateSession(token: string) {
	const id = sha256(token);
	const [row] = await db
		.select({ session: sessions, user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, id));
	if (!row) return null;
	if (row.session.expiresAt.getTime() < Date.now()) {
		await db.delete(sessions).where(eq(sessions.id, id));
		return null;
	}
	// Sliding expiration: extend when less than half the lifetime remains.
	if (row.session.expiresAt.getTime() - Date.now() < (SESSION_DAYS / 2) * 864e5) {
		await db
			.update(sessions)
			.set({ expiresAt: new Date(Date.now() + SESSION_DAYS * 864e5) })
			.where(eq(sessions.id, id));
	}
	return row.user;
}

export async function invalidateSession(token: string) {
	await db.delete(sessions).where(eq(sessions.id, sha256(token)));
}
