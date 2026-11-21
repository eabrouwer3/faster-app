<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { CRISIS_RESOURCES, STAGE_ACTIONS, resourcesFor } from '#lib/resources.js';
	import { STAGE_STYLE, stagesFor } from '#lib/faster.js';
	import { cn } from '#lib/utils.js';
	import ExternalLink from '@lucide/svelte/icons/external-link';
	import Phone from '@lucide/svelte/icons/phone';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const role = $derived(data.user.role);
</script>

<svelte:head><title>Resources · FASTER Scale</title></svelte:head>

<div class="grid gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Resources</h1>
		<p class="mt-1 text-sm text-muted-foreground">Ways back toward Restoration, and people who can help.</p>
	</div>

	<div class="rounded-xl border border-rose-200 bg-rose-50/70 p-4 dark:border-rose-900 dark:bg-rose-950/30">
		<h2 class="flex items-center gap-2 font-semibold"><Phone class="size-4" /> In crisis? Reach out now</h2>
		<div class="mt-3 grid gap-2 sm:grid-cols-3">
			{#each CRISIS_RESOURCES as r (r.title)}
				<a href={r.url} class="rounded-lg border bg-background p-3 text-sm hover:bg-muted/50">
					<div class="font-medium">{r.title}</div>
					<div class="text-muted-foreground">{r.description}</div>
				</a>
			{/each}
		</div>
	</div>

	<section class="grid gap-3">
		<h2 class="font-semibold">Support & community</h2>
		<div class="grid gap-3 sm:grid-cols-2">
			{#each resourcesFor(role) as r (r.url)}
				<a href={r.url} target="_blank" rel="noreferrer" class="group rounded-xl border bg-card p-4 hover:bg-muted/40">
					<div class="flex items-center gap-1.5 font-medium">{r.title} <ExternalLink class="size-3.5 text-muted-foreground" /></div>
					<p class="mt-1 text-sm text-muted-foreground">{r.description}</p>
				</a>
			{/each}
		</div>
	</section>

	<section class="grid gap-3">
		<h2 class="font-semibold">Returning to Restoration, stage by stage</h2>
		<div class="grid gap-3 md:grid-cols-2">
			{#each stagesFor(role) as s (s.key)}
				<Card.Root class="gap-3">
					<Card.Header>
						<Card.Title class="flex items-center gap-2">
							<span class={cn('flex size-7 items-center justify-center rounded-md text-sm font-bold text-white', STAGE_STYLE[s.key].dot)}>{s.letter}</span>
							{s.name}
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<ul class="grid gap-1.5 text-sm">
							{#each STAGE_ACTIONS[s.key] as a (a)}<li class="flex gap-2"><span class={cn('mt-1.5 size-1.5 shrink-0 rounded-full', STAGE_STYLE[s.key].dot)}></span>{a}</li>{/each}
						</ul>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
		<p class="text-sm text-muted-foreground">Also see your <a href="/app/restoration" class="text-primary underline-offset-4 hover:underline">Restoration checklist</a>.</p>
	</section>
</div>
