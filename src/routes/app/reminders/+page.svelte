<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { VAPID_PUBLIC_KEY } from '$app/env/public';
	import { toast } from 'svelte-sonner';
	import { onMount } from 'svelte';
	import { cn } from '#lib/utils.js';
	import type { SubmitFunction } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const r = $derived(data.reminder);
	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

	let pushState = $state<'unsupported' | 'denied' | 'off' | 'on' | 'loading'>('loading');

	function urlBase64ToUint8Array(base64: string) {
		const padding = '='.repeat((4 - (base64.length % 4)) % 4);
		const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
		return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
	}

	onMount(async () => {
		if (!('serviceWorker' in navigator) || !('PushManager' in window) || !VAPID_PUBLIC_KEY) {
			pushState = 'unsupported';
			return;
		}
		if (Notification.permission === 'denied') {
			pushState = 'denied';
			return;
		}
		const reg = await navigator.serviceWorker.ready;
		pushState = (await reg.pushManager.getSubscription()) ? 'on' : 'off';
	});

	async function enablePush() {
		try {
			pushState = 'loading';
			const perm = await Notification.requestPermission();
			if (perm !== 'granted') {
				pushState = perm === 'denied' ? 'denied' : 'off';
				return;
			}
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.subscribe({
				userVisibleOnly: true,
				applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
			});
			await fetch('/api/push', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(sub.toJSON()) });
			pushState = 'on';
			toast.success('Notifications enabled on this device');
			invalidateAll();
		} catch (e) {
			console.error(e);
			toast.error('Couldn’t enable notifications on this device.');
			pushState = 'off';
		}
	}
	async function disablePush() {
		const reg = await navigator.serviceWorker.ready;
		const sub = await reg.pushManager.getSubscription();
		if (sub) {
			await fetch('/api/push', { method: 'DELETE', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint }) });
			await sub.unsubscribe();
		}
		pushState = 'off';
		invalidateAll();
	}

	const submit: SubmitFunction = () => async ({ result, update }) => {
		await update({ reset: false });
		if (result.type === 'success' && result.data?.ok) toast.success(String(result.data.ok));
	};
</script>

<svelte:head><title>Reminders · FASTER Scale</title></svelte:head>

<div class="mx-auto grid max-w-2xl gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Reminders</h1>
		<p class="mt-1 text-sm text-muted-foreground">A gentle nudge to check in. Skipped automatically if you’ve already checked in that day. Times are in {data.user.timezone}.</p>
	</div>

	<Card.Root>
		<Card.Content>
			<form method="post" action="?/save" use:enhance={submit} class="grid gap-5">
				<label class="flex items-center justify-between gap-3 text-sm font-medium">
					Reminders on
					<input type="checkbox" name="enabled" checked={r.enabled} class="size-5 accent-primary" />
				</label>
				<div class="grid gap-1.5">
					<Label for="time">Time</Label>
					<Input id="time" name="time" type="time" value={r.time} class="h-10 w-40" />
				</div>
				<fieldset class="grid gap-2">
					<legend class="mb-1 text-sm font-medium">Days</legend>
					<div class="flex flex-wrap gap-2">
						{#each dayNames as d, i (d)}
							<label class="cursor-pointer">
								<input type="checkbox" name="days" value={i} checked={r.days.includes(i)} class="peer sr-only" />
								<span class="inline-flex h-10 w-12 items-center justify-center rounded-lg border text-sm font-medium peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground peer-focus-visible:ring-2 peer-focus-visible:ring-ring">{d}</span>
							</label>
						{/each}
					</div>
				</fieldset>
				<fieldset class="grid gap-2">
					<legend class="mb-1 text-sm font-medium">Send via</legend>
					<label class="flex items-center gap-3 text-sm"><input type="checkbox" name="viaPush" checked={r.viaPush} class="size-4 accent-primary" /> Push notification</label>
					<label class="flex items-center gap-3 text-sm"><input type="checkbox" name="viaEmail" checked={r.viaEmail} class="size-4 accent-primary" /> Email to {data.user.email}</label>
				</fieldset>
				<div class="flex flex-wrap gap-2">
					<Button type="submit" class="h-10">Save reminder</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Push notifications on this device</Card.Title>
			<Card.Description>
				{data.pushDevices} device{data.pushDevices === 1 ? '' : 's'} registered.
				On iPhone, first add this site to your Home Screen (Share → Add to Home Screen), then open it from there.
			</Card.Description>
		</Card.Header>
		<Card.Content class="flex flex-wrap items-center gap-3">
			{#if pushState === 'unsupported'}
				<p class="text-sm text-muted-foreground">{data.pushConfigured ? 'This browser doesn’t support push notifications.' : 'Push isn’t configured on the server yet.'}</p>
			{:else if pushState === 'denied'}
				<p class="text-sm text-muted-foreground">Notifications are blocked for this site in your browser settings.</p>
			{:else if pushState === 'on'}
				<span class={cn('rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300')}>Enabled</span>
				<Button variant="outline" size="sm" onclick={disablePush}>Disable on this device</Button>
			{:else}
				<Button onclick={enablePush} disabled={pushState === 'loading'}>Enable notifications</Button>
			{/if}
			<form method="post" action="?/test" use:enhance={submit}>
				<Button type="submit" variant="outline" size="sm">Send a test</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
