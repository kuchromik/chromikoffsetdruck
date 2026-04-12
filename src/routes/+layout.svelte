<script>
	import { afterNavigate } from '$app/navigation';
	import favicon from '$lib/assets/logo-favicon.png';
	import '../app.css';

	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { children } = $props();

	afterNavigate(() => {
		window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
	
	<!-- DNS Prefetch für externe Ressourcen -->
	<link rel="dns-prefetch" href="https://fonts.googleapis.com" />
	
	<!-- Preconnect für kritische Ressourcen -->
	<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
	
	<!-- Optimierte Font-Loading -->
	<style>
		/* System-Schriften werden sofort geladen, Custom-Fonts optional */
		body {
			font-display: swap;
		}
	</style>
</svelte:head>

{@render children()}
