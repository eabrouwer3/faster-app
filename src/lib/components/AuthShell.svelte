<script lang="ts">
	import type { Snippet } from 'svelte';
	let {
		title,
		subtitle,
		children,
		footer
	}: { title: string; subtitle?: string; children: Snippet; footer?: Snippet } = $props();
</script>

<div class="flex min-h-dvh flex-col items-center justify-center px-4 py-10">
	<a href="/" class="mb-6 flex items-center gap-2 font-semibold">
		<img src="/icon.svg" alt="" class="size-8" /> FASTER Scale
	</a>
	<div class="w-full max-w-sm rounded-xl border bg-card p-6 shadow-sm">
		<h1 class="text-xl font-semibold">{title}</h1>
		{#if subtitle}<p class="mt-1 text-sm text-muted-foreground">{subtitle}</p>{/if}
		<div class="mt-6">{@render children()}</div>
	</div>
	{#if footer}<p class="mt-5 text-sm text-muted-foreground">{@render footer()}</p>{/if}
</div>
