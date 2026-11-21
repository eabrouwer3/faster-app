<script lang="ts">
	import { Button } from '#lib/components/ui/button/index.js';
	import FasterLadder from '#lib/components/FasterLadder.svelte';
	import ShieldCheck from '@lucide/svelte/icons/shield-check';
	import LineChart from '@lucide/svelte/icons/chart-line';
	import Users from '@lucide/svelte/icons/users';
	import Bell from '@lucide/svelte/icons/bell';
	import { STAGE_STYLE, stagesFor } from '#lib/faster.js';

	const features = [
		{ icon: ShieldCheck, title: 'Honest check-ins', body: 'Walk through each stage of the FASTER Scale and mark what you notice — in a couple of minutes, on any device.' },
		{ icon: LineChart, title: 'See your patterns', body: 'Track the lowest point you reach over time and spot the drift before it becomes a slide.' },
		{ icon: Users, title: 'Real accountability', body: 'Choose who gets a heads-up when you reach a stage you set — or when you go quiet for too long.' },
		{ icon: Bell, title: 'Gentle reminders', body: 'Daily or weekly nudges by email or push notification, on your schedule.' }
	];
</script>

<div class="mx-auto flex min-h-dvh max-w-5xl flex-col px-4 sm:px-6">
	<header class="flex items-center justify-between py-5">
		<a href="/" class="flex items-center gap-2 font-semibold">
			<img src="/icon.svg" alt="" class="size-7" /> FASTER Scale
		</a>
		<div class="flex gap-2">
			<Button variant="ghost" href="/login">Log in</Button>
			<Button href="/signup">Get started</Button>
		</div>
	</header>

	<main class="flex-1">
		<section class="py-12 sm:py-20">
			<p class="text-sm font-medium text-primary">For people in recovery and betrayed partners</p>
			<h1 class="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
				Notice the drift. Return to restoration.
			</h1>
			<p class="mt-5 max-w-xl text-lg text-muted-foreground">
				The FASTER Scale helps you recognize where you are — Forgetting priorities, Anxiety, Speeding up,
				Ticked off, Exhausted — before you reach Relapse or Regression. Check in, see it over time, and
				let the right people know when you need them.
			</p>
			<div class="mt-8 flex flex-wrap gap-3">
				<Button size="lg" href="/signup" class="h-11 px-5 text-base">Start your first check-in</Button>
				<Button size="lg" variant="outline" href="/login" class="h-11 px-5 text-base">I have an account</Button>
			</div>
			<div class="mt-12 max-w-xl">
				<FasterLadder role="recovery" current="anxiety" />
			</div>
		</section>

		<section class="grid gap-4 pb-16 sm:grid-cols-2">
			{#each features as f (f.title)}
				<div class="rounded-xl border bg-card p-5">
					<f.icon class="size-5 text-primary" />
					<h2 class="mt-3 font-semibold">{f.title}</h2>
					<p class="mt-1 text-sm text-muted-foreground">{f.body}</p>
				</div>
			{/each}
		</section>

		<section class="pb-20">
			<h2 class="text-lg font-semibold">The stages</h2>
			<ul class="mt-4 grid gap-2 sm:grid-cols-2">
				{#each stagesFor('recovery') as s (s.key)}
					<li class="flex gap-3 rounded-lg border bg-card p-3">
						<span class="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md text-sm font-bold text-white {STAGE_STYLE[s.key].dot}">{s.letter}</span>
						<div>
							<div class="font-medium">{s.name}{s.key === 'relapse' ? ' / Regression' : ''}</div>
							<p class="text-sm text-muted-foreground">{s.description}</p>
						</div>
					</li>
				{/each}
			</ul>
		</section>
	</main>

	<footer class="border-t py-6 text-xs text-muted-foreground">
		FASTER Scale adapted from <em>The Genesis Process</em> by Michael Dye, as used by
		<a class="underline" href="https://puredesire.org" target="_blank" rel="noreferrer">Pure Desire Ministries</a>.
		This app is not a substitute for professional care. In crisis, call or text 988.
	</footer>
</div>
