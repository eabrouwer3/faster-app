<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { Switch } from '#lib/components/ui/switch/index.js';
	import FasterLadder from '#lib/components/FasterLadder.svelte';
	import StageBadge from '#lib/components/StageBadge.svelte';
	import CrisisBanner from '#lib/components/CrisisBanner.svelte';
	import {
		CRISIS_BEHAVIORS,
		PART_TWO_QUESTIONS,
		STAGE_ORDER,
		STAGE_STYLE,
		WEEKLY_QUESTIONS,
		computeLowest,
		stageIndex,
		stageName,
		stagesFor,
		type StageKey
	} from '#lib/faster.js';
	import { cn } from '#lib/utils.js';
	import Check from '@lucide/svelte/icons/check';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const role = $derived(data.user.role);
	const stages = $derived(stagesFor(role));

	type Entry = { behavior: string; answers: string[] };
	let selections = $state<Record<string, string[]>>({});
	let partTwo = $state<Record<string, Entry>>({});
	let includeWeekly = $state(false);
	let weekly = $state<Record<string, string>>({});
	let notes = $state('');
	let step = $state(0);
	let submitting = $state(false);

	// Steps: 0..6 stages, 7 = part two, 8 = weekly (recovery only, optional), 9 = review
	const STAGE_STEPS = 7;
	const PART_TWO = 7;
	const WEEKLY = 8;
	const REVIEW = 9;
	const steps = $derived(role === 'recovery' ? [0, 1, 2, 3, 4, 5, 6, PART_TWO, WEEKLY, REVIEW] : [0, 1, 2, 3, 4, 5, 6, PART_TWO, REVIEW]);
	const pos = $derived(steps.indexOf(step));
	const progress = $derived(((pos + 1) / steps.length) * 100);

	const lowest = $derived(computeLowest(selections as Record<StageKey, string[]>));
	const crisis = $derived(Object.values(selections).flat().some((b) => CRISIS_BEHAVIORS.includes(b)));
	const allNegative = $derived(
		STAGE_ORDER.slice(1).flatMap((k) => (selections[k] ?? []).map((b) => ({ stage: k, b })))
	);
	const partTwoStages = $derived(
		role === 'recovery' ? STAGE_ORDER.filter((k) => (selections[k]?.length ?? 0) > 0) : []
	);
	const willNotify = $derived(
		data.partners.filter((p) => stageIndex(lowest) >= stageIndex(p.threshold)).map((p) => p.name)
	);

	function toggle(stage: StageKey, b: string) {
		const cur = selections[stage] ?? [];
		selections[stage] = cur.includes(b) ? cur.filter((x) => x !== b) : [...cur, b];
	}
	function ensureEntries() {
		const keys = role === 'partner' ? ['overall'] : partTwoStages;
		for (const k of keys) partTwo[k] ??= { behavior: '', answers: ['', '', ''] };
	}
	function go(delta: number) {
		const next = steps[Math.min(steps.length - 1, Math.max(0, pos + delta))];
		if (next === PART_TWO) ensureEntries();
		step = next;
		window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
	}

	// Save a draft locally so an accidental navigation doesn't lose a check-in.
	const DRAFT_KEY = 'faster-checkin-draft';
	onMount(() => {
		try {
			const d = JSON.parse(localStorage.getItem(DRAFT_KEY) ?? 'null');
			if (d && Date.now() - d.t < 12 * 3600e3 && d.role === role) {
				selections = d.selections ?? {};
				partTwo = d.partTwo ?? {};
				weekly = d.weekly ?? {};
				includeWeekly = !!d.includeWeekly;
				notes = d.notes ?? '';
			}
		} catch {}
	});
	$effect(() => {
		const snapshot = JSON.stringify({ t: Date.now(), role, selections, partTwo, weekly, includeWeekly, notes });
		try {
			localStorage.setItem(DRAFT_KEY, snapshot);
		} catch {}
	});

	const payload = $derived(
		JSON.stringify({ selections, partTwo, weekly: includeWeekly ? weekly : null, notes })
	);
</script>

<svelte:head><title>Check in · FASTER Scale</title></svelte:head>

<div class="mx-auto grid max-w-2xl gap-5">
	<div class="grid gap-3">
		<div class="flex items-center justify-between text-xs text-muted-foreground">
			<span>Step {pos + 1} of {steps.length}</span>
			{#if step < STAGE_STEPS}<span>Part One · check what you identify with</span>{:else if step === PART_TWO}<span>Part Two · go deeper</span>{:else if step === WEEKLY}<span>Weekly group check-in</span>{:else}<span>Review</span>{/if}
		</div>
		<Progress value={progress} class="h-1.5" />
		<FasterLadder {role} current={step < STAGE_STEPS ? STAGE_ORDER[step] : lowest} compact />
	</div>

	{#if crisis}<CrisisBanner />{/if}

	{#if step < STAGE_STEPS}
		{@const s = stages[step]}
		<section class="grid gap-4">
			<div class={cn('rounded-xl p-4', STAGE_STYLE[s.key].soft)}>
				<div class="flex items-center gap-3">
					<span class={cn('flex size-10 shrink-0 items-center justify-center rounded-lg text-lg font-bold text-white', STAGE_STYLE[s.key].dot)}>{s.letter}</span>
					<div>
						<h1 class="text-xl font-semibold">{s.name}</h1>
						<p class="text-sm opacity-80">{s.description}</p>
					</div>
				</div>
			</div>
			{#if step === 0}
				<p class="text-sm text-muted-foreground">Which of these healthy behaviors are true for you right now?</p>
			{:else}
				<p class="text-sm text-muted-foreground">Check any you’ve noticed in yourself recently. Be honest — nobody sees this unless you choose to share.</p>
			{/if}
			<div class="flex flex-wrap gap-2">
				{#each s.behaviors as b (b)}
					{@const on = selections[s.key]?.includes(b)}
					<button
						type="button"
						onclick={() => toggle(s.key, b)}
						aria-pressed={on}
						class={cn(
							'inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-left text-sm transition-all active:scale-[0.98]',
							on
								? cn('border-transparent text-white shadow-sm', STAGE_STYLE[s.key].dot)
								: 'bg-card hover:bg-muted'
						)}
					>
						{#if on}<Check class="size-3.5 shrink-0" />{/if}
						{b}
					</button>
				{/each}
			</div>
			<p class="text-xs text-muted-foreground">
				{(selections[s.key] ?? []).length} selected
			</p>
		</section>
	{:else if step === PART_TWO}
		<section class="grid gap-5">
			<div>
				<h1 class="text-xl font-semibold">Part Two</h1>
				{#if role === 'recovery'}
					<p class="text-sm text-muted-foreground">For each stage you marked, choose the most powerful behavior and answer the three questions. Answer as much or as little as is helpful today.</p>
				{:else}
					<p class="text-sm text-muted-foreground">Identify the overall most powerful or frequent behavior and answer the three questions.</p>
				{/if}
			</div>
			<div class="flex items-center gap-2 rounded-lg border bg-card p-3 text-sm">
				Lowest level reached: <StageBadge {role} stage={lowest} />
			</div>

			{#if role === 'partner'}
				{@render partTwoBlock('overall', 'Most powerful / frequent behavior', allNegative.map((x) => x.b))}
			{:else if partTwoStages.length === 0}
				<p class="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">You didn’t mark anything in Part One. You can go back, or continue to review.</p>
			{:else}
				{#each partTwoStages as k (k)}
					{@render partTwoBlock(k, stageName(role, k), selections[k] ?? [])}
				{/each}
			{/if}
		</section>
	{:else if step === WEEKLY}
		<section class="grid gap-4">
			<div>
				<h1 class="text-xl font-semibold">Weekly group check-in</h1>
				<p class="text-sm text-muted-foreground">Optional. Useful to prepare for your weekly group or accountability meeting.</p>
			</div>
			<label class="flex items-center justify-between gap-3 rounded-lg border bg-card p-3 text-sm font-medium">
				Include weekly questions
				<Switch bind:checked={includeWeekly} />
			</label>
			{#if includeWeekly}
				<div class="grid gap-4">
					{#each WEEKLY_QUESTIONS as q, i (q.key)}
						<div class="grid gap-1.5">
							<Label for="wk-{q.key}" class="leading-snug">{i + 1}. {q.label}</Label>
							<Textarea id="wk-{q.key}" rows={2} bind:value={weekly[q.key]} />
						</div>
					{/each}
				</div>
			{/if}
		</section>
	{:else}
		<section class="grid gap-4">
			<h1 class="text-xl font-semibold">Review</h1>
			<div class={cn('rounded-xl p-4', STAGE_STYLE[lowest].soft)}>
				<div class="text-sm opacity-80">Lowest point on the scale</div>
				<div class={cn('mt-1 text-2xl font-semibold', STAGE_STYLE[lowest].text)}>{stageName(role, lowest)}</div>
			</div>
			<ul class="grid gap-2">
				{#each stages as s (s.key)}
					{#if selections[s.key]?.length}
						<li class="rounded-lg border bg-card p-3">
							<StageBadge {role} stage={s.key} />
							<p class="mt-2 text-sm text-muted-foreground">{selections[s.key].join(' · ')}</p>
						</li>
					{/if}
				{/each}
			</ul>
			<div class="grid gap-1.5">
				<Label for="notes">Anything else on your mind? (optional)</Label>
				<Textarea id="notes" rows={3} bind:value={notes} placeholder="A sentence or two about today…" />
			</div>
			{#if willNotify.length}
				<p class="rounded-lg border bg-card p-3 text-sm">
					<span class="font-medium">Your accountability partners will be notified:</span>
					{willNotify.join(', ')}
				</p>
			{/if}
		</section>
	{/if}

	<form
		method="post"
		use:enhance={() => {
			submitting = true;
			return async ({ result, update }) => {
				if (result.type === 'redirect') {
					try {
						localStorage.removeItem(DRAFT_KEY);
					} catch {}
				}
				await update();
				submitting = false;
			};
		}}
		class="sticky bottom-[calc(4.5rem+env(safe-area-inset-bottom))] z-20 -mx-4 flex gap-3 border-t bg-background/95 px-4 py-3 backdrop-blur md:bottom-0 md:mx-0 md:rounded-xl md:border"
	>
		<input type="hidden" name="payload" value={payload} />
		<Button type="button" variant="outline" class="h-11" disabled={pos === 0} onclick={() => go(-1)}>
			<ArrowLeft class="size-4" /> Back
		</Button>
		{#if step === REVIEW}
			<Button type="submit" class="h-11 flex-1 text-base" disabled={submitting}>
				{submitting ? 'Saving…' : 'Save check-in'}
			</Button>
		{:else}
			<Button type="button" class="h-11 flex-1 text-base" onclick={() => go(1)}>
				Next <ArrowRight class="size-4" />
			</Button>
		{/if}
	</form>
</div>

{#snippet partTwoBlock(key: string, title: string, options: string[])}
	{@const e = partTwo[key]}
	{#if e}
	<div class="grid gap-3 rounded-xl border bg-card p-4">
		<div class="font-medium">{title}</div>
		<div class="grid gap-1.5">
			<Label for="pt-{key}-b">Most powerful behavior</Label>
			<select
				id="pt-{key}-b"
				bind:value={e.behavior}
				class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30"
			>
				<option value="">Choose…</option>
				{#each options as o (o)}<option value={o}>{o}</option>{/each}
			</select>
		</div>
		{#each PART_TWO_QUESTIONS as q, i (q)}
			<div class="grid gap-1.5">
				<Label for="pt-{key}-{i}" class="leading-snug">{i + 1}. {q}</Label>
				<Textarea id="pt-{key}-{i}" rows={2} bind:value={e.answers[i]} />
			</div>
		{/each}
	</div>
	{/if}
{/snippet}
