import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals }) => {
	if (!locals.user) redirect(303, '/login');
	const { id, name, email, role, timezone } = locals.user;
	return { user: { id, name, email, role, timezone } };
};
