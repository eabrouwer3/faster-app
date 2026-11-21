<script lang="ts">
	import { STAGE_ORDER, STAGE_STYLE, stageName, stagesFor, type Role, type StageKey } from '#lib/faster.js';

	interface Point {
		id: string;
		createdAt: string | Date;
		lowestStage: StageKey;
	}
	let { points, role }: { points: Point[]; role: Role } = $props();

	let W = $state(640);
	const H = 230;
	const narrow = $derived(W < 520);
	const pad = $derived({ l: narrow ? 74 : 132, r: 12, t: 12, b: 26 });
	const iw = $derived(W - pad.l - pad.r);
	const ih = $derived(H - pad.t - pad.b);

	const sorted = $derived(
		[...points].sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt))
	);
	const t0 = $derived(sorted.length ? +new Date(sorted[0].createdAt) : 0);
	const t1 = $derived(sorted.length ? +new Date(sorted[sorted.length - 1].createdAt) : 1);
	const x = (d: string | Date) =>
		sorted.length <= 1 ? pad.l + iw / 2 : pad.l + ((+new Date(d) - t0) / Math.max(1, t1 - t0)) * iw;
	const y = (k: StageKey) => pad.t + (STAGE_ORDER.indexOf(k) / (STAGE_ORDER.length - 1)) * ih;

	const path = $derived(
		sorted.map((p, i) => `${i ? 'L' : 'M'}${x(p.createdAt).toFixed(1)},${y(p.lowestStage).toFixed(1)}`).join(' ')
	);
	const fmt = (d: string | Date, opts: Intl.DateTimeFormatOptions) =>
		new Date(d).toLocaleDateString(undefined, opts);
	const ticks = $derived.by(() => {
		if (sorted.length < 2) return sorted.map((p) => p.createdAt);
		const n = narrow ? 2 : 4;
		return Array.from({ length: n + 1 }, (_, i) => new Date(t0 + ((t1 - t0) * i) / n));
	});

	let hover = $state<Point | null>(null);
</script>

<div class="relative w-full" bind:clientWidth={W}>
	<svg width={W} height={H} viewBox="0 0 {W} {H}" class="block overflow-visible" role="img" aria-label="Lowest FASTER stage reached per check-in over time">
		{#each stagesFor(role) as s (s.key)}
			<line x1={pad.l} x2={W - pad.r} y1={y(s.key)} y2={y(s.key)} class="stroke-border" stroke-width="1" />
			<text x={pad.l - 10} y={y(s.key)} dy="0.32em" text-anchor="end" class="fill-muted-foreground text-[11px]">{narrow ? s.name.split(' ')[0] : s.name}</text>
		{/each}
		{#each ticks as t, i (i)}
			<text x={x(t)} y={H - 6} text-anchor="middle" class="fill-muted-foreground text-[11px]">{fmt(t, { month: 'short', day: 'numeric' })}</text>
		{/each}
		{#if sorted.length > 1}
			<path d={path} fill="none" class="stroke-foreground/35" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" />
		{/if}
		{#each sorted as p (p.id)}
			<a href="/app/history/{p.id}" aria-label="{fmt(p.createdAt, { dateStyle: 'medium' })}: {stageName(role, p.lowestStage)}">
				<circle
					cx={x(p.createdAt)}
					cy={y(p.lowestStage)}
					r="14"
					fill="transparent"
					role="presentation"
					onpointerenter={() => (hover = p)}
					onpointerleave={() => (hover = null)}
				/>
				<circle
					cx={x(p.createdAt)}
					cy={y(p.lowestStage)}
					r={hover?.id === p.id ? 6.5 : 5}
					fill={STAGE_STYLE[p.lowestStage].hex}
					class="pointer-events-none stroke-card"
					stroke-width="2"
				/>
			</a>
		{/each}
	</svg>
	{#if hover}
		<div
			class="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-full rounded-md border bg-popover px-2.5 py-1.5 text-xs shadow-md"
			style="left: {x(hover.createdAt)}px; top: {y(hover.lowestStage) - 10}px"
		>
			<div class="font-medium">{stageName(role, hover.lowestStage)}</div>
			<div class="text-muted-foreground">{fmt(hover.createdAt, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
		</div>
	{/if}
</div>
