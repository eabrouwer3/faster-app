<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import StageBadge from '#lib/components/StageBadge.svelte';
	import TrendChart from '#lib/components/TrendChart.svelte';
	import FasterLadder from '#lib/components/FasterLadder.svelte';
	import { STAGE_ORDER, stagesFor } from '#lib/faster.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const role = $derived(data.person.role);
	const last = $derived(data.checkins[0]);
	const fmt = (d: string | Date) =>
		new Date(d).toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
</script>

<svelte:head>
	<title>{data.person.name}’s check-ins · FASTER Scale</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="mx-auto grid max-w-2xl gap-5 px-4 py-8">
	<div class="flex items-center gap-2 font-semibold">
		<img src="/icon.svg" alt="" class="size-7" /> FASTER Scale
	</div>
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">{data.person.name}’s check-ins</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Hi {data.partnerName} — {data.person.name} invited you as an accountability partner. Thank you for walking with them.
		</p>
	</div>

	{#if last}
		<Card.Root>
			<Card.Header>
				<Card.Title>Most recent</Card.Title>
				<Card.Description>{fmt(last.createdAt)}</Card.Description>
			</Card.Header>
			<Card.Content class="grid gap-4">
				<FasterLadder {role} current={last.lowestStage} />
				<div><StageBadge {role} stage={last.lowestStage} /></div>
			</Card.Content>
		</Card.Root>
		{#if data.checkins.length > 1}
			<Card.Root>
				<Card.Header><Card.Title>Recent trend</Card.Title></Card.Header>
				<Card.Content><TrendChart points={data.checkins} {role} /></Card.Content>
			</Card.Root>
		{/if}
		<div class="overflow-hidden rounded-xl border bg-card">
			<ul class="divide-y">
				{#each data.checkins as c (c.id)}
					<li class="px-4 py-3">
						<div class="flex items-center justify-between gap-2">
							<span class="text-sm">{fmt(c.createdAt)}</span>
							<StageBadge {role} stage={c.lowestStage} />
						</div>
						{#if data.shareDetails}
							{@const marked = STAGE_ORDER.slice(1).flatMap((k) => c.selections[k] ?? [])}
							{#if marked.length}<p class="mt-1.5 text-xs text-muted-foreground">{marked.join(' · ')}</p>{/if}
						{/if}
					</li>
				{/each}
			</ul>
		</div>
	{:else}
		<p class="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">No check-ins yet.</p>
	{/if}

	<Card.Root>
		<Card.Header><Card.Title>How to help</Card.Title></Card.Header>
		<Card.Content class="grid gap-2 text-sm text-muted-foreground">
			<p>Reach out without judgment. Ask open questions: “How are you really doing?” “What’s been hardest this week?”</p>
			<p>Listen more than you advise. Encourage connection with their group, counselor, and God.</p>
			<p>The stages, from healthy to most at-risk: {stagesFor(role).map((s) => s.name).join(' → ')}.</p>
		</Card.Content>
	</Card.Root>
</div>
