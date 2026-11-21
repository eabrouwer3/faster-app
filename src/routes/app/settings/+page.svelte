<script lang="ts">
	import * as Card from '#lib/components/ui/card/index.js';
	import { Button } from '#lib/components/ui/button/index.js';
	import { Input } from '#lib/components/ui/input/index.js';
	import { Label } from '#lib/components/ui/label/index.js';
	import { enhance } from '$app/forms';
	import { toast } from 'svelte-sonner';
	import type { SubmitFunction } from '$app/forms';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const zones = $derived(typeof Intl.supportedValuesOf === 'function' ? Intl.supportedValuesOf('timeZone') : [data.user.timezone]);

	const submit: SubmitFunction = () => async ({ result, update }) => {
		await update({ reset: false });
		if (result.type === 'success' && result.data?.ok) toast.success(String(result.data.ok));
		if (result.type === 'failure' && result.data?.error) toast.error(String(result.data.error));
	};
</script>

<svelte:head><title>Settings · FASTER Scale</title></svelte:head>

<div class="mx-auto grid max-w-2xl gap-6">
	<h1 class="text-2xl font-semibold tracking-tight">Settings</h1>

	<Card.Root>
		<Card.Header><Card.Title>Profile</Card.Title></Card.Header>
		<Card.Content>
			<form method="post" action="?/profile" use:enhance={submit} class="grid gap-4">
				<div class="grid gap-1.5">
					<Label for="name">Name</Label>
					<Input id="name" name="name" value={data.user.name} class="h-10" />
				</div>
				<div class="grid gap-1.5">
					<Label for="role">FASTER Scale version</Label>
					<select id="role" name="role" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
						<option value="recovery" selected={data.user.role === 'recovery'}>In recovery</option>
						<option value="partner" selected={data.user.role === 'partner'}>Betrayed partner</option>
					</select>
				</div>
				<div class="grid gap-1.5">
					<Label for="tz">Time zone (for reminders)</Label>
					<select id="tz" name="timezone" class="h-10 rounded-lg border border-input bg-transparent px-3 text-sm dark:bg-input/30">
						{#each zones as z (z)}<option value={z} selected={z === data.user.timezone}>{z}</option>{/each}
					</select>
				</div>
				<Button type="submit" class="h-10 w-fit">Save</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header><Card.Title>Change password</Card.Title></Card.Header>
		<Card.Content>
			<form method="post" action="?/password" use:enhance={submit} class="grid gap-4">
				<div class="grid gap-1.5"><Label for="cur">Current password</Label><Input id="cur" name="current" type="password" autocomplete="current-password" class="h-10" /></div>
				<div class="grid gap-1.5"><Label for="new">New password</Label><Input id="new" name="next" type="password" autocomplete="new-password" minlength={8} class="h-10" /></div>
				<Button type="submit" variant="outline" class="h-10 w-fit">Change password</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title>Delete account</Card.Title>
			<Card.Description>Permanently deletes your account, all check-ins, and partner links.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="post" action="?/deleteAccount" use:enhance={submit} class="flex flex-wrap gap-2">
				<Input name="confirm" placeholder="Type DELETE" class="h-10 w-40" />
				<Button type="submit" variant="destructive" class="h-10">Delete everything</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
