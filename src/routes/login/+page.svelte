<script lang="ts">
	import AuthShell from '#lib/components/AuthShell.svelte';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { form }: PageProps = $props();
	let pending = $state(false);
</script>

<AuthShell title="Welcome back" subtitle="Log in to check in and see your progress.">
	<form
		method="post"
		class="grid gap-4"
		use:enhance={() => {
			pending = true;
			return async ({ update }) => {
				await update();
				pending = false;
			};
		}}
	>
		<div class="grid gap-1.5">
			<Label for="email">Email</Label>
			<Input id="email" name="email" type="email" autocomplete="email" required value={form?.email ?? ''} class="h-10" />
		</div>
		<div class="grid gap-1.5">
			<Label for="password">Password</Label>
			<Input id="password" name="password" type="password" autocomplete="current-password" required class="h-10" />
		</div>
		{#if form?.error}<p class="text-sm text-destructive">{form.error}</p>{/if}
		<Button type="submit" class="h-10" disabled={pending}>{pending ? 'Logging in…' : 'Log in'}</Button>
	</form>
	{#snippet footer()}
		New here? <a href="/signup" class="font-medium text-primary underline-offset-4 hover:underline">Create an account</a>
	{/snippet}
</AuthShell>
