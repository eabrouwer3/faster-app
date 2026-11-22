<script lang="ts">
	import { onMount } from 'svelte';
	import { VAPID_PUBLIC_KEY } from '$app/env/public';
	import { Button } from '#lib/components/ui/button/index.js';
	import { toast } from 'svelte-sonner';
	import BellRing from '@lucide/svelte/icons/bell-ring';
	import BellOff from '@lucide/svelte/icons/bell-off';
	import Share from '@lucide/svelte/icons/share';
	import SquarePlus from '@lucide/svelte/icons/square-plus';
	import CircleCheck from '@lucide/svelte/icons/circle-check';

	let { token, personName }: { token: string; personName: string } = $props();

	type State = 'checking' | 'unsupported' | 'ios-install' | 'denied' | 'off' | 'working' | 'on';
	let state = $state<State>('checking');

	const api = $derived(`/p/${token}/push`);

	function urlBase64ToUint8Array(base64: string) {
		const padding = '='.repeat((4 - (base64.length % 4)) % 4);
		const raw = atob((base64 + padding).replace(/-/g, '+').replace(/_/g, '/'));
		return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
	}

	const isIOS = () =>
		/iPad|iPhone|iPod/.test(navigator.userAgent) ||
		(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
	const isStandalone = () =>
		matchMedia('(display-mode: standalone)').matches ||
		(navigator as Navigator & { standalone?: boolean }).standalone === true;

	onMount(async () => {
		if (!VAPID_PUBLIC_KEY) return (state = 'unsupported');
		const pushCapable = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
		// iPhone/iPad only allow web push from a site added to the Home Screen.
		if (isIOS() && !isStandalone()) return (state = 'ios-install');
		if (!pushCapable) return (state = 'unsupported');
		if (Notification.permission === 'denied') return (state = 'denied');
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				// Make sure the server knows about it (e.g. after a link reset).
				await save(sub);
				state = 'on';
			} else state = 'off';
		} catch {
			state = 'off';
		}
	});

	async function save(sub: PushSubscription) {
		const res = await fetch(api, {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify(sub.toJSON())
		});
		if (!res.ok) throw new Error('save failed');
	}

	async function enable() {
		state = 'working';
		try {
			const perm = await Notification.requestPermission();
			if (perm !== 'granted') {
				state = perm === 'denied' ? 'denied' : 'off';
				return;
			}
			const reg = await navigator.serviceWorker.ready;
			const sub =
				(await reg.pushManager.getSubscription()) ??
				(await reg.pushManager.subscribe({
					userVisibleOnly: true,
					applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY!)
				}));
			await save(sub);
			state = 'on';
			await test(true);
		} catch (e) {
			console.error(e);
			toast.error('Couldn’t turn on notifications. Please try again.');
			state = 'off';
		}
	}

	async function test(quiet = false) {
		const res = await fetch(`${api}?test`, { method: 'POST' });
		const { sent } = res.ok ? await res.json() : { sent: 0 };
		if (sent) toast.success(quiet ? 'You’re all set — we sent a test notification.' : 'Test notification sent.');
		else if (!quiet) toast.error('Couldn’t reach this device. Try turning notifications off and on again.');
	}

	async function disable() {
		state = 'working';
		try {
			const reg = await navigator.serviceWorker.ready;
			const sub = await reg.pushManager.getSubscription();
			if (sub) {
				await fetch(api, {
					method: 'DELETE',
					headers: { 'content-type': 'application/json' },
					body: JSON.stringify({ endpoint: sub.endpoint })
				});
				await sub.unsubscribe();
			}
		} finally {
			state = 'off';
		}
	}
</script>

{#if state !== 'checking' && state !== 'unsupported'}
	<section class="rounded-xl border border-primary/30 bg-primary/5 p-5">
		{#if state === 'on'}
			<div class="flex items-start gap-3">
				<CircleCheck class="mt-0.5 size-6 shrink-0 text-primary" />
				<div class="min-w-0 flex-1">
					<h2 class="font-semibold">Notifications are on for this phone</h2>
					<p class="mt-1 text-sm text-muted-foreground">
						You’ll get a notification when {personName} needs support.
					</p>
					<div class="mt-3 flex flex-wrap gap-2">
						<Button variant="outline" size="sm" onclick={() => test()}>Send a test</Button>
						<Button variant="ghost" size="sm" onclick={disable}><BellOff class="size-3.5" /> Turn off</Button>
					</div>
				</div>
			</div>
		{:else if state === 'ios-install'}
			<h2 class="flex items-center gap-2 font-semibold"><BellRing class="size-5 text-primary" /> Get alerts on your iPhone</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				iPhone only allows notifications from sites on your Home Screen. It takes 10 seconds:
			</p>
			<ol class="mt-4 grid gap-3 text-sm">
				<li class="flex items-center gap-3">
					<span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">1</span>
					<span>Tap the <Share class="inline size-4 align-text-bottom text-primary" /> <strong>Share</strong> button in Safari’s toolbar</span>
				</li>
				<li class="flex items-center gap-3">
					<span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">2</span>
					<span>Choose <SquarePlus class="inline size-4 align-text-bottom text-primary" /> <strong>Add to Home Screen</strong>, then <strong>Add</strong></span>
				</li>
				<li class="flex items-center gap-3">
					<span class="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">3</span>
					<span>Open <strong>{personName}</strong> from your Home Screen and tap <strong>Notify me</strong></span>
				</li>
			</ol>
		{:else if state === 'denied'}
			<h2 class="flex items-center gap-2 font-semibold"><BellOff class="size-5 text-muted-foreground" /> Notifications are blocked</h2>
			<p class="mt-1 text-sm text-muted-foreground">
				Notifications were blocked for this site. Allow them in your browser or phone settings, then reload this page.
			</p>
		{:else}
			<div class="flex flex-col gap-4 sm:flex-row sm:items-center">
				<div class="flex-1">
					<h2 class="font-semibold">Get a notification when {personName} needs support</h2>
					<p class="mt-1 text-sm text-muted-foreground">No app or account needed. You can turn it off anytime.</p>
				</div>
				<Button size="lg" class="h-12 px-6 text-base" onclick={enable} disabled={state === 'working'}>
					<BellRing class="size-5" />
					{state === 'working' ? 'Turning on…' : 'Notify me on this phone'}
				</Button>
			</div>
		{/if}
	</section>
{/if}
