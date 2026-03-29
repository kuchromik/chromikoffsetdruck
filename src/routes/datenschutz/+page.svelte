<script>
	import Header from '$lib/components/Header.svelte';
	import Datenschutz from '$lib/components/Datenschutz.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Datenschutz - Chromik Offsetdruck</title>
	<link rel="canonical" href="https://www.chromikoffsetdruck.de/datenschutz" />
	<meta name="description" content="Datenschutzerklärung von Chromik Offsetdruck" />
	<meta name="robots" content="noindex, follow" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main id="main-content">
		<Datenschutz />
	</main>

	<Footer />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}
</style>
