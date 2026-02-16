<script>
	import favicon from '$lib/assets/logo-favicon.png';
	import '../app.css';

	let { children } = $props();
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
