<script lang="ts">
	import AuthShell from '#lib/components/AuthShell.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import { onMount } from 'svelte';
	import { cn } from '#lib/utils.js';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let pending = $state(false);
	let role = $state<'recovery' | 'partner'>('recovery');
	let timezone = $state('UTC');
	$effect.pre(() => {
		if (form?.role) role = form.role as 'recovery' | 'partner';
	});
	onMount(() => {
		timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
	});

	const roles = [
		{ value: 'recovery', title: 'I’m in recovery', body: 'Working on my own sexual integrity or addiction recovery.' },
		{ value: 'partner', title: 'I’m a betrayed partner', body: 'Healing from betrayal trauma. Uses the partner version of the scale.' }
	] as const;
</script>

<AuthShell title="Create your account" subtitle="Private by default. You choose who sees what.">
	<form
		method="post"
		class="grid gap-4"
		use:enhance={() => {
			pending = true;
			return async ({ update }) => {
				await update({ reset: false });
				pending = false;
			};
		}}
	>
		<fieldset class="grid gap-2">
			<legend class="mb-1.5 text-sm font-medium">Which describes you?</legend>
			{#each roles as r (r.value)}
				<label
					class={cn(
						'flex cursor-pointer gap-3 rounded-lg border p-3 transition-colors',
						role === r.value ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50'
					)}
				>
					<input type="radio" name="role" value={r.value} bind:group={role} class="mt-1 accent-primary" />
					<span>
						<span class="block text-sm font-medium">{r.title}</span>
						<span class="block text-xs text-muted-foreground">{r.body}</span>
					</span>
				</label>
			{/each}
		</fieldset>
		<div class="grid gap-1.5">
			<Label for="name">First name</Label>
			<Input id="name" name="name" autocomplete="given-name" required value={form?.name ?? ''} class="h-10" />
		</div>
		<div class="grid gap-1.5">
			<Label for="email">Email</Label>
			<Input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} class="h-10" />
		</div>
		<div class="grid gap-1.5">
			<Label for="password">Password</Label>
			<Input id="password" name="password" type="password" autocomplete="new-password" minlength={8} required class="h-10" />
		</div>
		<input type="hidden" name="timezone" value={timezone} />
		{#if form?.error}<p class="text-sm text-destructive">{form.error}</p>{/if}
		<Button type="submit" class="h-10" disabled={pending}>{pending ? 'Creating…' : 'Create account'}</Button>
	</form>
	{#snippet footer()}
		Already have an account? <a href="/login" class="font-medium text-primary underline-offset-4 hover:underline">Log in</a>
	{/snippet}
</AuthShell>
