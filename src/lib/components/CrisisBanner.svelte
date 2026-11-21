<script lang="ts">
	import { CRISIS_RESOURCES } from '#lib/resources.js';
	import HeartHandshake from '@lucide/svelte/icons/heart-handshake';
</script>

<div class="rounded-xl border border-rose-300 bg-rose-50 p-4 text-rose-950 dark:border-rose-900 dark:bg-rose-950/50 dark:text-rose-100" role="alert">
	<div class="flex items-center gap-2 font-semibold">
		<HeartHandshake class="size-5" /> You don’t have to carry this alone.
	</div>
	<p class="mt-1 text-sm">If you’re having thoughts of harming yourself, please reach out right now.</p>
	<div class="mt-3 flex flex-wrap gap-2">
		{#each CRISIS_RESOURCES as r (r.title)}
			<a href={r.url} class="rounded-lg bg-white/80 px-3 py-2 text-sm font-medium shadow-sm hover:bg-white dark:bg-white/10 dark:hover:bg-white/20">
				{r.title}
			</a>
		{/each}
	</div>
</div>
