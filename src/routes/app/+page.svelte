<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import FasterLadder from '#lib/components/FasterLadder.svelte';
	import StageBadge from '#lib/components/StageBadge.svelte';
	import TrendChart from '#lib/components/TrendChart.svelte';
	import { RESTORATION_CHECKLIST, STAGE_STYLE, stageFor, stageIndex } from '#lib/faster.js';
	import { STAGE_ACTIONS } from '#lib/resources.js';
	import { page } from '$app/state';
	import { cn } from '#lib/utils.js';
	import ArrowRight from '@lucide/svelte/icons/arrow-right';
	import Bell from '@lucide/svelte/icons/bell';
	import Users from '@lucide/svelte/icons/users';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const role = $derived(data.user.role);
	const last = $derived(data.recent[0]);
	const lastStage = $derived(last ? stageFor(role, last.lowestStage) : null);
	const welcome = $derived(page.url.searchParams.get('welcome') === '1');

	const checkedCount = $derived(RESTORATION_CHECKLIST.filter((i) => data.checklist[i.key]).length);

	const weekCount = $derived(data.recent.filter((c) => +new Date(c.createdAt) > Date.now() - 7 * 864e5).length);
	const restorationRate = $derived.by(() => {
		const last30 = data.recent.filter((c) => +new Date(c.createdAt) > Date.now() - 30 * 864e5);
		if (!last30.length) return null;
		return Math.round((last30.filter((c) => stageIndex(c.lowestStage) <= 1).length / last30.length) * 100);
	});

	const greeting = (() => {
		const h = new Date().getHours();
		return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening';
	})();
	const ago = (d: string | Date) => {
		const days = Math.floor((Date.now() - +new Date(d)) / 864e5);
		if (days === 0) return 'today';
		if (days === 1) return 'yesterday';
		return `${days} days ago`;
	};
</script>

<div class="grid gap-6">
	<div class="flex flex-wrap items-end justify-between gap-4">
		<div>
			<h1 class="text-2xl font-semibold tracking-tight">{greeting}, {data.user.name}</h1>
			<p class="text-sm text-muted-foreground">
				{#if last}Your last check-in was {ago(last.createdAt)}.{:else}Let’s start with your first check-in.{/if}
			</p>
		</div>
		<Button href="/app/check-in" size="lg" class="h-11 px-5 text-base">
			Check in now <ArrowRight class="size-4" />
		</Button>
	</div>

	{#if welcome}
		<div class="rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
			<p class="font-medium">Welcome. You’ve taken a brave step.</p>
			<p class="mt-1 text-muted-foreground">
				Start with a check-in, then add an accountability partner and set a reminder so this becomes a rhythm.
			</p>
		</div>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Where you are</Card.Title>
			<Card.Description>
				{#if lastStage}Lowest point on your most recent check-in{:else}No check-ins yet{/if}
			</Card.Description>
		</Card.Header>
		<Card.Content class="grid gap-5">
			<FasterLadder {role} current={last?.lowestStage ?? null} />
			{#if lastStage && last}
				<div class={cn('rounded-lg p-4', STAGE_STYLE[last.lowestStage].soft)}>
					<div class="flex items-center gap-2">
						<StageBadge {role} stage={last.lowestStage} class="bg-background/70" />
					</div>
					<p class="mt-2 text-sm">{lastStage.description}</p>
					<ul class="mt-3 grid gap-1.5 text-sm">
						{#each STAGE_ACTIONS[last.lowestStage] as a (a)}
							<li class="flex gap-2"><span class={cn('mt-1.5 size-1.5 shrink-0 rounded-full', STAGE_STYLE[last.lowestStage].dot)}></span>{a}</li>
						{/each}
					</ul>
					<div class="mt-3 flex flex-wrap gap-2">
						<Button size="sm" variant="outline" href="/app/history/{last.id}">View check-in</Button>
						<Button size="sm" variant="outline" href="/app/resources">Resources</Button>
					</div>
				</div>
			{/if}
		</Card.Content>
	</Card.Root>

	<div class="grid grid-cols-3 gap-2 sm:gap-4">
		<div class="rounded-xl border bg-card p-3 sm:p-4">
			<div class="text-xs text-muted-foreground">Check-ins this week</div>
			<div class="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{weekCount}</div>
		</div>
		<div class="rounded-xl border bg-card p-3 sm:p-4">
			<div class="text-xs text-muted-foreground">Healthy days (R/F), 30d</div>
			<div class="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{restorationRate === null ? '—' : `${restorationRate}%`}</div>
		</div>
		<div class="rounded-xl border bg-card p-3 sm:p-4">
			<div class="text-xs text-muted-foreground">Total check-ins</div>
			<div class="mt-1 text-2xl font-semibold tabular-nums sm:text-3xl">{data.total}</div>
		</div>
	</div>

	{#if data.recent.length}
		<Card.Root>
			<Card.Header>
				<Card.Title>Last 90 days</Card.Title>
				<Card.Description>Lowest stage reached on each check-in. Tap a point to open it.</Card.Description>
			</Card.Header>
			<Card.Content>
				<TrendChart points={data.recent} {role} />
			</Card.Content>
		</Card.Root>
	{/if}

	<div class="grid gap-4 sm:grid-cols-3">
		<a href="/app/partners" class="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
			<Users class="size-5 text-primary" />
			<div class="mt-2 font-medium">Accountability</div>
			<p class="text-sm text-muted-foreground">
				{data.partnerCount ? `${data.partnerCount} partner${data.partnerCount === 1 ? '' : 's'} connected` : 'Add someone who can walk with you'}
			</p>
		</a>
		<a href="/app/reminders" class="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
			<Bell class="size-5 text-primary" />
			<div class="mt-2 font-medium">Reminders</div>
			<p class="text-sm text-muted-foreground">
				{data.reminder?.enabled ? `On at ${data.reminder.time}` : 'Off — set up a gentle nudge'}
			</p>
		</a>
		<a href="/app/restoration" class="group rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40">
			<ListChecks class="size-5 text-primary" />
			<div class="mt-2 font-medium">Restoration checklist</div>
			<p class="text-sm text-muted-foreground">{checkedCount} of {RESTORATION_CHECKLIST.length} up to date</p>
		</a>
	</div>
</div>
