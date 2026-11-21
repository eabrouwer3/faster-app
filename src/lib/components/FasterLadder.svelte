<script lang="ts">
	import { STAGE_ORDER, STAGE_STYLE, stagesFor, type Role, type StageKey } from '#lib/faster.js';
	import { cn } from '#lib/utils.js';

	let {
		role,
		current,
		compact = false
	}: { role: Role; current?: StageKey | null; compact?: boolean } = $props();
	const stages = $derived(stagesFor(role));
	const currentIdx = $derived(current ? STAGE_ORDER.indexOf(current) : -1);
</script>

<ol class={cn('flex w-full gap-1', compact ? 'h-9' : 'h-14')} aria-label="FASTER Scale">
	{#each stages as s, i (s.key)}
		{@const active = i === currentIdx}
		<li
			class={cn(
				'relative flex flex-1 flex-col items-center justify-center rounded-md text-xs font-semibold transition-all',
				active
					? cn(STAGE_STYLE[s.key].dot, 'text-white shadow-sm ring-4', STAGE_STYLE[s.key].ring)
					: currentIdx >= 0 && i < currentIdx
						? cn(STAGE_STYLE[s.key].soft, STAGE_STYLE[s.key].text, 'opacity-90')
						: 'bg-muted text-muted-foreground'
			)}
			title={s.name}
			aria-current={active ? 'step' : undefined}
		>
			<span class={compact ? 'text-sm' : 'text-lg leading-none'}>{s.letter}</span>
			{#if !compact}
				<span class="mt-1 hidden text-[10px] font-medium opacity-90 sm:block">{s.name.split(' ')[0]}</span>
			{/if}
		</li>
	{/each}
</ol>
