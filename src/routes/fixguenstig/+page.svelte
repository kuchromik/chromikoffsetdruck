<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Konfigurierbare Optionen
	const produkte = ['Visitenkarten', 'Flyer', 'Folder'];
	
	// Materialien mit Zuordnung zu Produkten
	const materialien = [
		{
			name: 'Opalkarten 308 g/m²',
			fuerProdukte: {
				'Visitenkarten': true,
				'Flyer': true,
				'Folder': true
			}
		},
		{
			name: 'Soporset 350 g/m²',
			fuerProdukte: {
				'Visitenkarten': true,
				'Flyer': true,
				'Folder': true
			}
		},
		{
			name: 'Bilderdruck matt 300 g/m²',
			fuerProdukte: {
				'Visitenkarten': true,
				'Flyer': true,
				'Folder': true
			}
		},
		{
			name: 'Bilderdruck matt 135 g/m²',
			fuerProdukte: {
				'Visitenkarten': false,
				'Flyer': true,
				'Folder': true
			}
		}
	];

	// Eingabewerte
	let produkt = $state('');
	let auflage = $state('');
	let material = $state('');
	let ergebnis = $state('');
	let zeigErgebnis = $state(false);

	// Gefilterte Materialien basierend auf gewähltem Produkt
	let verfuegbareMaterialien = $derived(
		produkt ? materialien.filter(m => m.fuerProdukte[produkt]) : []
	);

	// Material zurücksetzen, wenn es für neues Produkt nicht verfügbar ist
	$effect(() => {
		if (produkt && material) {
			const materialObj = materialien.find(m => m.name === material);
			if (materialObj && !materialObj.fuerProdukte[produkt]) {
				material = '';
			}
		}
	});

	function berechneErgebnis(e) {
		e.preventDefault();
		if (!produkt || !auflage || !material) {
			ergebnis = 'Bitte füllen Sie alle Felder aus.';
		} else {
			ergebnis = `
				<strong>Ihre Auswahl:</strong><br>
				<strong>Produkt:</strong> ${produkt}<br>
				<strong>Auflage:</strong> ${auflage} Stück<br>
				<strong>Material:</strong> ${material}
			`;
		}
		zeigErgebnis = true;
	}

	function zurücksetzen() {
		produkt = '';
		auflage = '';
		material = '';
		ergebnis = '';
		zeigErgebnis = false;
	}
</script>

<svelte:head>
	<title>Fix&günstig - Chromik Offsetdruck</title>
	<meta name="description" content="Schnelle und preiswerte Drucklösungen" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main class="container">
		<section class="form-section">
			<h1>Fix&günstig</h1>
			<p class="intro">Schnelle und preiswerte Lösungen ohne Kompromisse bei der Qualität. Konfigurieren Sie Ihr Produkt:</p>

			<form class="calculator-form" onsubmit={berechneErgebnis}>
				<div class="form-group">
					<label for="produkt">Produkt</label>
					<select id="produkt" bind:value={produkt} required>
						<option value="">Bitte wählen...</option>
						{#each produkte as prod}
							<option value={prod}>{prod}</option>
						{/each}
					</select>
				</div>

				<div class="form-group">
					<label for="auflage">Auflage (Stück)</label>
					<input 
						type="number" 
						id="auflage" 
						bind:value={auflage} 
						min="1" 
						step="1"
						placeholder="z.B. 500"
						required
					/>
				</div>

				<div class="form-group">
					<label for="material">Material</label>
					<select id="material" bind:value={material} required disabled={!produkt}>
						<option value="">{produkt ? 'Bitte wählen...' : 'Zuerst Produkt wählen'}</option>
						{#each verfuegbareMaterialien as mat}
							<option value={mat.name}>{mat.name}</option>
						{/each}
					</select>
				</div>

				<div class="button-group">
					<button type="submit" class="btn btn-primary">Ergebnis</button>
					<button type="button" class="btn btn-secondary" onclick={zurücksetzen}>Zurücksetzen</button>
				</div>
			</form>

			{#if zeigErgebnis}
				<div class="result-box">
					{@html ergebnis}
				</div>
			{/if}
		</section>
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
		padding: 4rem 0;
	}

	.form-section {
		max-width: 700px;
		margin: 0 auto;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.intro {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 3rem;
		line-height: 1.6;
	}

	.calculator-form {
		background: var(--bg-secondary);
		padding: 2.5rem;
		border-radius: 16px;
		border: 1px solid var(--border);
		box-shadow: 0 4px 20px var(--shadow);
	}

	.form-group {
		margin-bottom: 1.75rem;
	}

	.form-group:last-of-type {
		margin-bottom: 2.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
		font-size: 0.95rem;
	}

	select,
	input[type="number"] {
		width: 100%;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		border: 2px solid var(--border);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		transition: all 0.3s ease;
		font-family: inherit;
	}

	select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-secondary);
	}

	select:focus,
	input[type="number"]:focus {
		outline: none;
		border-color: #6b7280;
		box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
	}

	input[type="number"]::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		flex: 1;
		min-width: 150px;
		padding: 0.875rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}

	.btn-primary {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: #fff;
		box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border: 2px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--hover-bg);
		border-color: var(--text-secondary);
	}

	.result-box {
		margin-top: 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		border-radius: 12px;
		border: 2px solid #d1d5db;
		animation: slideIn 0.4s ease;
	}

	@media (prefers-color-scheme: dark) {
		.result-box {
			background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
			border-color: #4b5563;
		}
	}

	.result-box :global(strong) {
		color: var(--text-primary);
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		main {
			padding: 2rem 0;
		}

		h1 {
			font-size: 2rem;
		}

		.calculator-form {
			padding: 1.5rem;
		}

		.button-group {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}
	}
</style>
