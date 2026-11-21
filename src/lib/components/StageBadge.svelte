<script lang="ts">
	import { STAGE_STYLE, stageName, type Role, type StageKey } from '#lib/faster.js';
	import { cn } from '#lib/utils.js';
	let { role, stage, class: className = '' }: { role: Role; stage: StageKey; class?: string } =
		$props();
</script>

<span
	class={cn(
		'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
		STAGE_STYLE[stage].soft,
		STAGE_STYLE[stage].text,
		className
	)}
>
	<span class={cn('size-2 rounded-full', STAGE_STYLE[stage].dot)}></span>
	{stageName(role, stage)}
</span>
