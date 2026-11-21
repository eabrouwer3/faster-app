import type { Handle, ServerInit } from '@sveltejs/kit/hooks';
import { redirect } from '@sveltejs/kit';
import { building } from '$app/env';
import { DISABLE_SCHEDULER } from '$app/env/private';
import { SESSION_COOKIE, validateSession } from '#lib/server/auth.js';
import { startScheduler } from '#lib/server/scheduler.js';

export const init: ServerInit = async () => {
	if (!building && !DISABLE_SCHEDULER) startScheduler();
};

export const handle: Handle = async ({ event, resolve }) => {
	const token = event.cookies.get(SESSION_COOKIE);
	event.locals.user = token ? await validateSession(token) : null;
	if (token && !event.locals.user) event.cookies.delete(SESSION_COOKIE, { path: '/' });

	if (event.url.pathname.startsWith('/app') && !event.locals.user) {
		redirect(303, `/login?next=${encodeURIComponent(event.url.pathname)}`);
	}
	return resolve(event);
};
