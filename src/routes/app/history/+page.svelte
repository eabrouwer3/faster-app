<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import StageBadge from '#lib/components/StageBadge.svelte';
	import TrendChart from '#lib/components/TrendChart.svelte';
	import { STAGE_ORDER, STAGE_STYLE, stagesFor, type StageKey } from '#lib/faster.js';
	import { cn } from '#lib/utils.js';
	import ChevronRight from '@lucide/svelte/icons/chevron-right';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const role = $derived(data.user.role);

	let range = $state<30 | 90 | 365 | 0>(90);
	const filtered = $derived(
		range ? data.checkins.filter((c) => +new Date(c.createdAt) > Date.now() - range * 864e5) : data.checkins
	);

	const distribution = $derived(
		STAGE_ORDER.map((k) => ({ k, n: filtered.filter((c) => c.lowestStage === k).length }))
	);
	const maxN = $derived(Math.max(1, ...distribution.map((d) => d.n)));

	const topBehaviors = $derived.by(() => {
		const counts = new Map<string, { n: number; stage: StageKey }>();
		for (const c of filtered)
			for (const k of STAGE_ORDER.slice(1))
				for (const b of c.selections[k] ?? []) {
					const cur = counts.get(b) ?? { n: 0, stage: k };
					cur.n++;
					counts.set(b, cur);
				}
		return [...counts.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 8);
	});
	const fmt = (d: string | Date) =>
		new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
	const ranges = [
		{ v: 30, l: '30 days' },
		{ v: 90, l: '90 days' },
		{ v: 365, l: '1 year' },
		{ v: 0, l: 'All' }
	] as const;
</script>

<svelte:head><title>History · FASTER Scale</title></svelte:head>

<div class="grid gap-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-semibold tracking-tight">History</h1>
		<div class="inline-flex rounded-lg border bg-card p-0.5">
			{#each ranges as r (r.v)}
				<button
					class={cn('rounded-md px-3 py-1.5 text-sm font-medium', range === r.v ? 'bg-muted' : 'text-muted-foreground')}
					onclick={() => (range = r.v)}>{r.l}</button
				>
			{/each}
		</div>
	</div>

	{#if data.checkins.length === 0}
		<div class="rounded-xl border border-dashed p-10 text-center">
			<p class="text-muted-foreground">No check-ins yet.</p>
			<Button href="/app/check-in" class="mt-4">Start your first check-in</Button>
		</div>
	{:else}
		{#if filtered.length}
			<Card.Root>
				<Card.Header><Card.Title>Lowest stage over time</Card.Title></Card.Header>
				<Card.Content><TrendChart points={filtered} {role} /></Card.Content>
			</Card.Root>

			<div class="grid gap-4 md:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>How often you reached each stage</Card.Title>
						<Card.Description>{filtered.length} check-ins</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-2">
						{#each distribution as d, i (d.k)}
							<div class="grid grid-cols-[7.5rem_1fr_2rem] items-center gap-2 text-sm">
								<span class="truncate text-muted-foreground">{stagesFor(role)[i].name}</span>
								<div class="h-3 rounded-sm bg-muted">
									<div class={cn('h-3 rounded-sm', STAGE_STYLE[d.k].dot)} style="width: {(d.n / maxN) * 100}%"></div>
								</div>
								<span class="text-right tabular-nums">{d.n}</span>
							</div>
						{/each}
					</Card.Content>
				</Card.Root>
				<Card.Root>
					<Card.Header>
						<Card.Title>Most frequent behaviors</Card.Title>
						<Card.Description>Patterns worth talking about with your group</Card.Description>
					</Card.Header>
					<Card.Content>
						{#if topBehaviors.length}
							<ol class="grid gap-2 text-sm">
								{#each topBehaviors as [b, v] (b)}
									<li class="flex items-center gap-2">
										<span class={cn('size-2 shrink-0 rounded-full', STAGE_STYLE[v.stage].dot)}></span>
										<span class="flex-1">{b}</span>
										<span class="tabular-nums text-muted-foreground">×{v.n}</span>
									</li>
								{/each}
							</ol>
						{:else}
							<p class="text-sm text-muted-foreground">Nothing marked below Restoration in this range. 🎉</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		{/if}

		<div class="overflow-hidden rounded-xl border bg-card">
			<ul class="divide-y">
				{#each filtered as c (c.id)}
					<li>
						<a href="/app/history/{c.id}" class="flex items-center gap-3 px-4 py-3 hover:bg-muted/40">
							<div class="min-w-0 flex-1">
								<div class="text-sm font-medium">{fmt(c.createdAt)}</div>
								<div class="mt-1 flex flex-wrap items-center gap-2">
									<StageBadge {role} stage={c.lowestStage} />
									{#if c.weekly}<span class="text-xs text-muted-foreground">+ weekly</span>{/if}
									{#if c.notes}<span class="truncate text-xs text-muted-foreground">“{c.notes}”</span>{/if}
								</div>
							</div>
							<ChevronRight class="size-4 text-muted-foreground" />
						</a>
					</li>
				{:else}
					<li class="px-4 py-6 text-center text-sm text-muted-foreground">No check-ins in this range.</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>
