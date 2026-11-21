<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { STAGE_ORDER, stageName } from '#lib/faster.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import Copy from '@lucide/svelte/icons/copy';
	import type { PageProps } from './$types';
	import type { SubmitFunction } from '$app/forms';

	let { data }: PageProps = $props();
	const role = $derived(data.user.role);
	const thresholds = STAGE_ORDER.slice(1);

	const notify: SubmitFunction = () => async ({ result, update }) => {
		await update({ reset: result.type === 'success' && !!(result.data as { ok?: string })?.ok?.startsWith('Added') });
		if (result.type === 'success' && result.data?.ok) toast.success(String(result.data.ok));
		if (result.type === 'failure' && result.data?.error) toast.error(String(result.data.error));
	};

	async function copy(url: string) {
		await navigator.clipboard.writeText(url);
		toast.success('Link copied');
	}
	const fmt = (d: string | Date) => new Date(d).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
</script>

<svelte:head><title>Accountability partners · FASTER Scale</title></svelte:head>

<div class="grid gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Accountability partners</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			Choose people you trust. They’ll get an email when a check-in reaches the stage you pick — and
			can see a summary of your check-ins through a private link.
		</p>
	</div>

	{#if !data.emailConfigured}
		<div class="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
			Email sending isn’t configured on this server yet, so notifications are logged below instead of sent.
			You can still copy a partner’s private link and share it yourself.
		</div>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title>Add a partner</Card.Title>
		</Card.Header>
		<Card.Content>
			<form method="post" action="?/add" use:enhance={notify} class="grid gap-4 sm:grid-cols-2">
				<div class="grid gap-1.5">
					<Label for="p-name">Name</Label>
					<Input id="p-name" name="name" required class="h-10" />
				</div>
				<div class="grid gap-1.5">
					<Label for="p-email">Email</Label>
					<Input id="p-email" name="email" type="email" required class="h-10" />
				</div>
				<div class="grid gap-1.5">
					<Label for="p-threshold">Notify when I reach</Label>
					<select id="p-threshold" name="threshold" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
						{#each thresholds as k (k)}
							<option value={k} selected={k === 'speeding'}>{stageName(role, k)} or lower</option>
						{/each}
					</select>
				</div>
				<div class="grid gap-1.5">
					<Label for="p-missed">Also notify if I don’t check in for</Label>
					<select id="p-missed" name="notifyMissedDays" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
						<option value="0">Don’t notify</option>
						<option value="3">3 days</option>
						<option value="7" selected>7 days</option>
						<option value="14">14 days</option>
					</select>
				</div>
				<label class="flex items-center gap-3 text-sm sm:col-span-2">
					<input type="checkbox" name="shareDetails" class="size-4 accent-primary" />
					Let them see which behaviors I marked (Part Two answers and notes always stay private)
				</label>
				<div class="sm:col-span-2">
					<Button type="submit" class="h-10">Add partner</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	{#if data.partners.length}
		<div class="grid gap-4">
			{#each data.partners as p (p.id)}
				<Card.Root>
					<Card.Header>
						<Card.Title class="flex flex-wrap items-center gap-2">
							{p.name}
							{#if !p.active}<span class="rounded-full bg-muted px-2 py-0.5 text-xs font-normal">Paused</span>{/if}
						</Card.Title>
						<Card.Description>{p.email}</Card.Description>
					</Card.Header>
					<Card.Content class="grid gap-4">
						<form method="post" action="?/update" use:enhance={notify} class="grid gap-4 sm:grid-cols-2">
							<input type="hidden" name="id" value={p.id} />
							<div class="grid gap-1.5">
								<Label for="t-{p.id}">Notify at</Label>
								<select id="t-{p.id}" name="threshold" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
									{#each thresholds as k (k)}
										<option value={k} selected={k === p.threshold}>{stageName(role, k)} or lower</option>
									{/each}
								</select>
							</div>
							<div class="grid gap-1.5">
								<Label for="m-{p.id}">Missed check-ins</Label>
								<select id="m-{p.id}" name="notifyMissedDays" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
									{#each [0, 3, 7, 14] as d (d)}
										<option value={d} selected={(p.notifyMissedDays ?? 0) === d}>{d ? `After ${d} days` : 'Don’t notify'}</option>
									{/each}
								</select>
							</div>
							<label class="flex items-center gap-3 text-sm">
								<input type="checkbox" name="shareDetails" checked={p.shareDetails} class="size-4 accent-primary" />
								Share marked behaviors
							</label>
							<label class="flex items-center gap-3 text-sm">
								<input type="checkbox" name="active" checked={p.active} class="size-4 accent-primary" />
								Active
							</label>
							<div class="flex flex-wrap gap-2 sm:col-span-2">
								<Button type="submit" size="sm">Save</Button>
							</div>
						</form>
						<div class="grid gap-1.5">
							<Label>Private partner link</Label>
							<div class="flex gap-2">
								<Input readonly value={p.viewUrl} class="h-9 font-mono text-xs" />
								<Button variant="outline" size="icon-lg" onclick={() => copy(p.viewUrl)} aria-label="Copy link"><Copy /></Button>
							</div>
						</div>
						<div class="flex flex-wrap gap-2 border-t pt-4">
							<form method="post" action="?/resend" use:enhance={notify}><input type="hidden" name="id" value={p.id} /><Button type="submit" variant="outline" size="sm">Resend invite</Button></form>
							<form method="post" action="?/resetLink" use:enhance={notify}><input type="hidden" name="id" value={p.id} /><Button type="submit" variant="outline" size="sm">Reset link</Button></form>
							<form method="post" action="?/remove" use:enhance={notify} onsubmit={(e) => { if (!confirm(`Remove ${p.name}?`)) e.preventDefault(); }}><input type="hidden" name="id" value={p.id} /><Button type="submit" variant="destructive" size="sm">Remove</Button></form>
						</div>
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}

	{#if data.log.length}
		<Card.Root>
			<Card.Header>
				<Card.Title>Recent notifications</Card.Title>
				<Card.Description>Every email and push this app sent on your behalf.</Card.Description>
			</Card.Header>
			<Card.Content>
				<ul class="divide-y text-sm">
					{#each data.log as n (n.id)}
						<li class="flex flex-wrap items-center gap-x-3 gap-y-1 py-2">
							<span class="min-w-0 basis-full truncate sm:order-2 sm:basis-auto sm:flex-1">{n.subject}</span>
							<span class="shrink-0 text-xs text-muted-foreground sm:order-1 sm:w-28">{fmt(n.createdAt)}</span>
							<span class="text-xs text-muted-foreground sm:order-3">{n.channel} → {n.recipient}</span>
							<span class="rounded-full px-2 py-0.5 text-xs sm:order-4 {n.status === 'sent' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : n.status === 'logged' ? 'bg-muted' : 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'}">{n.status}</span>
						</li>
					{/each}
				</ul>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
