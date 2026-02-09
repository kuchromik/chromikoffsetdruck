<script>
	import Header from '$lib/components/Header.svelte';
	import Impressum from '$lib/components/Impressum.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Impressum - Chromik Offsetdruck</title>
	<meta name="description" content="Impressum von Chromik Offsetdruck" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main id="main-content">
		<Impressum />
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
