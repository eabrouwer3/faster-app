import { error, redirect } from '@sveltejs/kit';
import { and, eq } from 'drizzle-orm';
import { db } from '#lib/server/db/index.js';
import { checkins, partners, type PartTwoEntry } from '#lib/server/db/schema.js';
import { alertPartners } from '#lib/server/alerts.js';
import { STAGE_ORDER, computeLowest, stagesFor, type Selections, type StageKey } from '#lib/faster.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const list = await db
		.select({ name: partners.name, threshold: partners.threshold })
		.from(partners)
		.where(and(eq(partners.userId, locals.user!.id), eq(partners.active, true)));
	return { partners: list };
};

const clip = (s: unknown, n = 4000) => (typeof s === 'string' ? s.slice(0, n) : '');

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const user = locals.user!;
		const form = await request.formData();
		let raw: {
			selections?: Record<string, string[]>;
			partTwo?: Record<string, PartTwoEntry>;
			weekly?: Record<string, string> | null;
			notes?: string;
		};
		try {
			raw = JSON.parse(String(form.get('payload') ?? '{}'));
		} catch {
			error(400, 'Invalid check-in');
		}

		// Only keep behaviors that actually exist on this role's scale.
		const stages = stagesFor(user.role);
		const selections: Selections = {};
		for (const s of stages) {
			const picked = (raw.selections?.[s.key] ?? []).filter((b) => s.behaviors.includes(b));
			if (picked.length) selections[s.key] = picked;
		}
		const lowestStage = computeLowest(selections);

		const partTwo: Record<string, PartTwoEntry> = {};
		for (const [k, v] of Object.entries(raw.partTwo ?? {})) {
			if (k !== 'overall' && !STAGE_ORDER.includes(k as StageKey)) continue;
			const answers = (v.answers ?? []).slice(0, 3).map((a) => clip(a));
			const behavior = clip(v.behavior, 300);
			if (behavior || answers.some(Boolean)) partTwo[k] = { behavior, answers };
		}

		let weekly: Record<string, string> | null = null;
		if (raw.weekly) {
			weekly = {};
			for (const [k, v] of Object.entries(raw.weekly)) if (v) weekly[k.slice(0, 40)] = clip(v);
			if (!Object.keys(weekly).length) weekly = null;
		}

		const [row] = await db
			.insert(checkins)
			.values({
				userId: user.id,
				role: user.role,
				selections,
				lowestStage,
				partTwo,
				weekly,
				notes: clip(raw.notes) || null
			})
			.returning();

		const notified = await alertPartners(user, row);
		const q = new URLSearchParams({ new: '1' });
		if (notified.length) q.set('notified', notified.join(', '));
		redirect(303, `/app/history/${row.id}?${q}`);
	}
};
