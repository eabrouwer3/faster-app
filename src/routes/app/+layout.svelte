<script lang="ts">
	import { page } from '$app/state';
	import { cn } from '#lib/utils.js';
	import { toggleMode } from 'mode-watcher';
	import House from '@lucide/svelte/icons/house';
	import ClipboardCheck from '@lucide/svelte/icons/clipboard-check';
	import History from '@lucide/svelte/icons/history';
	import Users from '@lucide/svelte/icons/users';
	import Ellipsis from '@lucide/svelte/icons/ellipsis';
	import ListChecks from '@lucide/svelte/icons/list-checks';
	import Bell from '@lucide/svelte/icons/bell';
	import LifeBuoy from '@lucide/svelte/icons/life-buoy';
	import Settings from '@lucide/svelte/icons/settings';
	import SunMoon from '@lucide/svelte/icons/sun-moon';
	import LogOut from '@lucide/svelte/icons/log-out';
	import { roleLabel } from '#lib/faster.js';
	import type { LayoutProps } from './$types';

	let { children, data }: LayoutProps = $props();

	type NavItem = { href: string; label: string; icon: typeof House; exact?: boolean };
	const primary: NavItem[] = [
		{ href: '/app', label: 'Home', icon: House, exact: true },
		{ href: '/app/check-in', label: 'Check in', icon: ClipboardCheck },
		{ href: '/app/history', label: 'History', icon: History },
		{ href: '/app/partners', label: 'Partners', icon: Users }
	];
	const secondary: NavItem[] = [
		{ href: '/app/restoration', label: 'Restoration checklist', icon: ListChecks },
		{ href: '/app/reminders', label: 'Reminders', icon: Bell },
		{ href: '/app/resources', label: 'Resources', icon: LifeBuoy },
		{ href: '/app/settings', label: 'Settings', icon: Settings }
	];
	const isActive = (href: string, exact = false) =>
		exact ? page.url.pathname === href : page.url.pathname.startsWith(href);

	let moreOpen = $state(false);
	$effect(() => {
		page.url.pathname;
		moreOpen = false;
	});
</script>

<div class="min-h-dvh pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">
	<header class="sticky top-0 z-30 border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
		<div class="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4 sm:px-6">
			<a href="/app" class="flex items-center gap-2 font-semibold">
				<img src="/icon.svg" alt="" class="size-7" />
				<span>FASTER</span>
			</a>
			<nav class="hidden flex-1 items-center gap-1 md:flex">
				{#each [...primary, ...secondary.slice(0, 3)] as item (item.href)}
					<a
						href={item.href}
						class={cn(
							'rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors',
							isActive(item.href, item.exact)
								? 'bg-muted text-foreground'
								: 'text-muted-foreground hover:text-foreground'
						)}>{item.label === 'Restoration checklist' ? 'Restoration' : item.label}</a
					>
				{/each}
			</nav>
			<div class="ml-auto flex items-center gap-1">
				<span class="mr-1 hidden text-xs text-muted-foreground lg:inline">{data.user.name} · {roleLabel(data.user.role)}</span>
				<button class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" onclick={toggleMode} aria-label="Toggle dark mode">
					<SunMoon class="size-4" />
				</button>
				<a href="/app/settings" class="hidden rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground md:block" aria-label="Settings">
					<Settings class="size-4" />
				</a>
				<form method="post" action="/logout" class="hidden md:block">
					<button class="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground" aria-label="Log out">
						<LogOut class="size-4" />
					</button>
				</form>
			</div>
		</div>
	</header>

	<main class="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-8">
		{@render children()}
	</main>

	<!-- Mobile bottom navigation -->
	<nav
		class="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
		aria-label="Primary"
	>
		<div class="grid grid-cols-5">
			{#each primary as item (item.href)}
				<a
					href={item.href}
					class={cn(
						'flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium',
						isActive(item.href, item.exact) ? 'text-primary' : 'text-muted-foreground'
					)}
				>
					<item.icon class="size-5" />
					{item.label}
				</a>
			{/each}
			<button
				class={cn('flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium', moreOpen || secondary.some((s) => isActive(s.href)) ? 'text-primary' : 'text-muted-foreground')}
				onclick={() => (moreOpen = !moreOpen)}
				aria-expanded={moreOpen}
			>
				<Ellipsis class="size-5" />
				More
			</button>
		</div>
	</nav>

	{#if moreOpen}
		<button class="fixed inset-0 z-30 bg-black/30 md:hidden" aria-label="Close menu" onclick={() => (moreOpen = false)}></button>
		<div class="fixed inset-x-3 bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-40 rounded-xl border bg-popover p-2 shadow-lg md:hidden">
			{#each secondary as item (item.href)}
				<a href={item.href} class="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
					<item.icon class="size-4 text-muted-foreground" />
					{item.label}
				</a>
			{/each}
			<form method="post" action="/logout">
				<button class="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium hover:bg-muted">
					<LogOut class="size-4 text-muted-foreground" /> Log out
				</button>
			</form>
		</div>
	{/if}
</div>
