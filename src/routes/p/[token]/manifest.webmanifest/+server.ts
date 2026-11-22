import { error } from '@sveltejs/kit';
import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { partners, users } from '#lib/server/db/schema.js';
import type { RequestHandler } from './$types';

/** Per-partner manifest so "Add to Home Screen" opens the partner page, not the login screen. */
export const GET: RequestHandler = async ({ params }) => {
	const [row] = await db
		.select({ name: users.name, active: partners.active })
		.from(partners)
		.innerJoin(users, eq(partners.userId, users.id))
		.where(eq(partners.viewToken, params.token));
	if (!row || !row.active) error(404);
	const start = `/p/${params.token}`;
	return new Response(
		JSON.stringify({
			name: `${row.name} · FASTER`,
			short_name: row.name,
			id: start,
			start_url: start,
			scope: start,
			display: 'standalone',
			background_color: '#fafaf7',
			theme_color: '#0f766e',
			icons: [
				{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
				{ src: '/icon-512.png', sizes: '512x512', type: 'image/png' }
			]
		}),
		{ headers: { 'content-type': 'application/manifest+json', 'cache-control': 'private, no-store' } }
	);
};
