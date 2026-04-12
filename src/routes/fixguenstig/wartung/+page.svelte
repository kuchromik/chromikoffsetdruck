<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Fix & Günstig – Wartung</title>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<Header />

<main>
	<div class="wartung">
		<div class="icon">🔧</div>
		<h1>Seite wird überarbeitet</h1>
		<p>
			Fix & Günstig wird gerade aktualisiert und ist vorübergehend nicht verfügbar.<br />
			Bitte schauen Sie in Kürze wieder vorbei.
		</p>
		<a href="/" class="back-link">← Zurück zur Startseite</a>
	</div>
</main>

<Footer />

<style>
	main {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 60vh;
		padding: 2rem;
	}

	.wartung {
		text-align: center;
		max-width: 500px;
	}

	.icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	h1 {
		font-size: 2rem;
		margin-bottom: 1rem;
		color: #333;
	}

	p {
		font-size: 1.1rem;
		color: #666;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.back-link {
		display: inline-block;
		padding: 0.75rem 1.5rem;
		background: #333;
		color: white;
		text-decoration: none;
		border-radius: 4px;
		transition: background 0.2s;
	}

	.back-link:hover {
		background: #555;
	}
</style>
