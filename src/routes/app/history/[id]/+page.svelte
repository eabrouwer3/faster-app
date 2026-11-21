<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import CheckinDetail from '#lib/components/CheckinDetail.svelte';
	import CrisisBanner from '#lib/components/CrisisBanner.svelte';
	import { CRISIS_BEHAVIORS } from '#lib/faster.js';
	import { page } from '$app/state';
	import ArrowLeft from '@lucide/svelte/icons/arrow-left';
	import CircleCheck from '@lucide/svelte/icons/circle-check';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const c = $derived(data.checkin);
	const isNew = $derived(page.url.searchParams.get('new') === '1');
	const notified = $derived(page.url.searchParams.get('notified'));
	const crisis = $derived(Object.values(c.selections).flat().some((b) => CRISIS_BEHAVIORS.includes(b as string)));
</script>

<svelte:head><title>Check-in · FASTER Scale</title></svelte:head>

<div class="mx-auto grid max-w-2xl gap-5">
	<div class="flex items-center justify-between gap-3">
		<Button variant="ghost" size="sm" href="/app/history"><ArrowLeft class="size-4" /> History</Button>
		<span class="text-sm text-muted-foreground">
			{new Date(c.createdAt).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}
		</span>
	</div>

	{#if isNew}
		<div class="flex gap-3 rounded-xl border border-primary/30 bg-primary/5 p-4 text-sm">
			<CircleCheck class="mt-0.5 size-5 shrink-0 text-primary" />
			<div>
				<p class="font-medium">Check-in saved. Thank you for being honest.</p>
				{#if notified}
					<p class="mt-1 text-muted-foreground">We let {notified} know. Consider reaching out to them too.</p>
				{/if}
			</div>
		</div>
	{/if}
	{#if crisis}<CrisisBanner />{/if}

	<CheckinDetail checkin={c} />

	<form method="post" action="?/delete" class="pt-4" onsubmit={(e) => { if (!confirm('Delete this check-in permanently?')) e.preventDefault(); }}>
		<Button type="submit" variant="destructive" size="sm">Delete check-in</Button>
	</form>
</div>
