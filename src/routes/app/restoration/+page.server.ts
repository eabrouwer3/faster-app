import { eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checklistState } from '#lib/server/db/schema.js';
import { RESTORATION_CHECKLIST } from '#lib/faster.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const [row] = await db.select().from(checklistState).where(eq(checklistState.userId, locals.user!.id));
	return { checked: row?.checked ?? {}, notes: row?.notes ?? {}, updatedAt: row?.updatedAt ?? null };
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const checked: Record<string, boolean> = {};
		const notes: Record<string, string> = {};
		for (const item of RESTORATION_CHECKLIST) {
			checked[item.key] = form.get(`c_${item.key}`) === 'on';
			const n = String(form.get(`n_${item.key}`) ?? '').slice(0, 2000);
			if (n) notes[item.key] = n;
			for (const sub of item.sub ?? []) {
				const k = `${item.key}.${sub}`;
				checked[k] = form.get(`c_${k}`) === 'on';
			}
		}
		const values = { userId: locals.user!.id, checked, notes, updatedAt: new Date() };
		await db.insert(checklistState).values(values).onConflictDoUpdate({ target: checklistState.userId, set: values });
		return { ok: true };
	}
};
