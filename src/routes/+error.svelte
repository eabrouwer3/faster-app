<script lang="ts">
	import { page } from '$app/state';
	import { Button } from '#lib/components/ui/button/index.js';
</script>

<div class="flex min-h-dvh flex-col items-center justify-center gap-3 px-4 text-center">
	<div class="text-5xl font-semibold text-muted-foreground">{page.status}</div>
	<p>{page.error?.message ?? 'Something went wrong.'}</p>
	<Button href="/" variant="outline">Go home</Button>
</div>
