<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import { Textarea } from '#lib/components/ui/textarea/index.js';
	import { Progress } from '#lib/components/ui/progress/index.js';
	import { RESTORATION_CHECKLIST } from '#lib/faster.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import { cn } from '#lib/utils.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	let checked = $state<Record<string, boolean>>({});
	$effect.pre(() => {
		checked = { ...data.checked };
	});
	const done = $derived(RESTORATION_CHECKLIST.filter((i) => checked[i.key]).length);
	let saving = $state(false);
	let formEl: HTMLFormElement;
	let timer: ReturnType<typeof setTimeout>;
	const autosave = () => {
		clearTimeout(timer);
		timer = setTimeout(() => formEl?.requestSubmit(), 700);
	};
</script>

<svelte:head><title>Restoration checklist · FASTER Scale</title></svelte:head>

<div class="mx-auto grid max-w-2xl gap-6">
	<div>
		<h1 class="text-2xl font-semibold tracking-tight">Restoration checklist</h1>
		<p class="mt-1 text-sm text-muted-foreground">
			These aren’t the byproduct of Restoration — they’re the actions that put and keep you there. If you’re
			doing an item, check it. If not, write what you need to do to be able to check it, then come back.
		</p>
	</div>
	<div class="grid gap-2">
		<div class="flex justify-between text-sm"><span>{done} of {RESTORATION_CHECKLIST.length} up to date</span>{#if saving}<span class="text-muted-foreground">Saving…</span>{/if}</div>
		<Progress value={(done / RESTORATION_CHECKLIST.length) * 100} class="h-2" />
	</div>

	<form
		method="post"
		bind:this={formEl}
		use:enhance={() => {
			saving = true;
			return async ({ result, update }) => {
				await update({ reset: false, refreshAll: false });
				saving = false;
				if (result.type !== 'success') toast.error('Couldn’t save');
			};
		}}
		class="grid gap-3"
	>
		{#each RESTORATION_CHECKLIST as item (item.key)}
			<div class={cn('rounded-xl border bg-card p-4 transition-colors', checked[item.key] && 'border-emerald-300 bg-emerald-50/60 dark:border-emerald-900 dark:bg-emerald-950/30')}>
				<label class="flex cursor-pointer items-center gap-3 font-medium">
					<input type="checkbox" name="c_{item.key}" bind:checked={checked[item.key]} onchange={autosave} class="size-5 accent-emerald-600" />
					{item.label}
				</label>
				{#if item.sub}
					<div class="mt-3 flex flex-wrap gap-2 pl-8">
						{#each item.sub as s (s)}
							{@const k = `${item.key}.${s}`}
							<label class="cursor-pointer">
								<input type="checkbox" name="c_{k}" bind:checked={checked[k]} onchange={autosave} class="peer sr-only" />
								<span class="inline-flex rounded-full border px-3 py-1 text-sm peer-checked:border-emerald-600 peer-checked:bg-emerald-600 peer-checked:text-white">{s}</span>
							</label>
						{/each}
					</div>
				{/if}
				{#if !checked[item.key]}
					<Textarea name="n_{item.key}" rows={2} value={data.notes[item.key] ?? ''} oninput={autosave} placeholder="What do I need to do to check this off?" class="mt-3" />
				{:else if data.notes[item.key]}
					<input type="hidden" name="n_{item.key}" value={data.notes[item.key]} />
				{/if}
			</div>
		{/each}
		<Button type="submit" class="h-10 w-fit">Save</Button>
	</form>
</div>
