<script lang="ts">
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { Toaster } from '#lib/components/ui/sonner/index.js';
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();
	// Partner pages get their own manifest so a home-screen install opens the partner page.
	const manifest = $derived(
		/^\/p\/[^/]+\/?$/.test(page.url.pathname)
			? `${page.url.pathname.replace(/\/$/, '')}/manifest.webmanifest`
			: '/manifest.webmanifest'
	);

	onMount(() => {
		if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<link rel="manifest" href={manifest} />
	<title>FASTER Scale</title>
	<meta
		name="description"
		content="A private, simple way to check in on the FASTER Scale, track it over time, and stay connected to accountability."
	/>
</svelte:head>

<ModeWatcher />
<Toaster richColors position="top-center" />
{@render children()}
