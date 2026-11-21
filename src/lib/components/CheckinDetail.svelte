<script lang="ts">
	import StageBadge from './StageBadge.svelte';
	import { PART_TWO_QUESTIONS, STAGE_STYLE, WEEKLY_QUESTIONS, stageName, stagesFor, type Role, type Selections } from '#lib/faster.js';
	import { STAGE_ACTIONS } from '#lib/resources.js';
	import { cn } from '#lib/utils.js';

	let {
		checkin,
		showPrivate = true
	}: {
		checkin: {
			role: Role;
			lowestStage: import('#lib/faster.js').StageKey;
			selections: Selections;
			partTwo?: Record<string, { behavior?: string; answers?: string[] }>;
			weekly?: Record<string, string> | null;
			notes?: string | null;
		};
		showPrivate?: boolean;
	} = $props();
	const role = $derived(checkin.role);
</script>

<div class="grid gap-5">
	<div class={cn('rounded-xl p-5', STAGE_STYLE[checkin.lowestStage].soft)}>
		<div class="text-sm opacity-80">Lowest point reached</div>
		<div class={cn('mt-1 text-2xl font-semibold', STAGE_STYLE[checkin.lowestStage].text)}>
			{stageName(role, checkin.lowestStage)}
		</div>
		{#if showPrivate}
			<ul class="mt-3 grid gap-1 text-sm">
				{#each STAGE_ACTIONS[checkin.lowestStage] as a (a)}<li>• {a}</li>{/each}
			</ul>
		{/if}
	</div>

	<section class="grid gap-2">
		<h2 class="font-semibold">Part One</h2>
		{#each stagesFor(role) as s (s.key)}
			{#if checkin.selections[s.key]?.length}
				<div class="rounded-lg border bg-card p-3">
					<StageBadge {role} stage={s.key} />
					<ul class="mt-2 flex flex-wrap gap-1.5">
						{#each checkin.selections[s.key] ?? [] as b (b)}
							<li class="rounded-full bg-muted px-2.5 py-1 text-xs">{b}</li>
						{/each}
					</ul>
				</div>
			{/if}
		{:else}
			<p class="text-sm text-muted-foreground">Nothing selected.</p>
		{/each}
	</section>

	{#if showPrivate && checkin.partTwo && Object.keys(checkin.partTwo).length}
		<section class="grid gap-2">
			<h2 class="font-semibold">Part Two</h2>
			{#each Object.entries(checkin.partTwo) as [k, e] (k)}
				<div class="rounded-lg border bg-card p-4">
					<div class="text-sm font-medium">
						{k === 'overall' ? 'Most powerful behavior' : stageName(role, k as never)}{#if e.behavior}: <span class="font-normal">{e.behavior}</span>{/if}
					</div>
					<dl class="mt-2 grid gap-2 text-sm">
						{#each PART_TWO_QUESTIONS as q, i (q)}
							{#if e.answers?.[i]}
								<div>
									<dt class="text-muted-foreground">{q}</dt>
									<dd class="whitespace-pre-wrap">{e.answers[i]}</dd>
								</div>
							{/if}
						{/each}
					</dl>
				</div>
			{/each}
		</section>
	{/if}

	{#if showPrivate && checkin.weekly}
		<section class="grid gap-2">
			<h2 class="font-semibold">Weekly check-in</h2>
			<dl class="grid gap-3 rounded-lg border bg-card p-4 text-sm">
				{#each WEEKLY_QUESTIONS as q (q.key)}
					{#if checkin.weekly[q.key]}
						<div>
							<dt class="text-muted-foreground">{q.label}</dt>
							<dd class="whitespace-pre-wrap">{checkin.weekly[q.key]}</dd>
						</div>
					{/if}
				{/each}
			</dl>
		</section>
	{/if}

	{#if showPrivate && checkin.notes}
		<section class="grid gap-2">
			<h2 class="font-semibold">Notes</h2>
			<p class="rounded-lg border bg-card p-4 text-sm whitespace-pre-wrap">{checkin.notes}</p>
		</section>
	{/if}
</div>
