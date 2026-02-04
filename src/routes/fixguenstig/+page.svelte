<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';

	// Produktliste
	const produkte = [
		{ name: 'Visitenkarten', id: 'visitenkarten' },
		{ name: 'Flyer', id: 'flyer' },
		{ name: 'Folder', id: 'folder' },
		{ name: 'Karten', id: 'karten' },
		{ name: 'Klappkarten', id: 'klappkarten' },
		{ name: 'Plakate', id: 'plakate' }
	];

	// Alle verfügbaren Formate
	const alleFormate = [
		'8,5 x 5,5 cm',
		'DIN A6',
		'DIN A5',
		'DIN lang',
		'21 x 21cm',
		'DIN A4',
		'DIN A3'
	];

	// Alle verfügbaren Materialien
	const alleMaterialien = [
		'Opalkarten 308 g/m²',
		'Soporset 350 g/m²',
		'Bilderdruck matt 300 g/m²',
		'Bilderdruck matt 135 g/m²'
	];

	// Produktzentrische Konfiguration
	const produktKonfiguration = {
		visitenkarten: {
			formate: ['8,5 x 5,5 cm'],
			materialien: ['Opalkarten 308 g/m²', 'Soporset 350 g/m²', 'Bilderdruck matt 300 g/m²']
		},
		flyer: {
			formate: ['DIN A6', 'DIN A5', 'DIN lang', '21 x 21cm', 'DIN A4', 'DIN A3'],
			materialien: ['Bilderdruck matt 135 g/m²']
		},
		folder: {
			formate: ['DIN A6', 'DIN A5', 'DIN lang', '21 x 21cm', 'DIN A4'],
			materialien: ['Bilderdruck matt 135 g/m²'],
			umfaenge: {
				'4-seitig': true, // für alle Formate verfügbar
				'6-seitig': ['DIN A6', 'DIN A5', 'DIN lang'] // nur für diese Formate
			}
		},
		karten: {
			formate: ['DIN A6', 'DIN A5', 'DIN lang', '21 x 21cm', 'DIN A4', 'DIN A3'],
			materialien: ['Opalkarten 308 g/m²', 'Soporset 350 g/m²', 'Bilderdruck matt 300 g/m²', 'Bilderdruck matt 135 g/m²']
		},
		klappkarten: {
			formate: ['DIN A6', 'DIN A5', 'DIN lang', '21 x 21cm', 'DIN A4', 'DIN A3'],
			materialien: ['Opalkarten 308 g/m²', 'Soporset 350 g/m²', 'Bilderdruck matt 300 g/m²', 'Bilderdruck matt 135 g/m²']
		},
		plakate: {
			formate: ['DIN A4', 'DIN A3'],
			materialien: ['Bilderdruck matt 135 g/m²']
		}
	};

	// Eingabewerte
	let produktId = $state('');
	let auflage = $state('');
	let material = $state('');
	let format = $state('');
	let umfang = $state('');
	let ergebnis = $state('');
	let zeigErgebnis = $state(false);

	// Gefilterte Optionen basierend auf gewähltem Produkt
	let verfuegbareMaterialien = $derived(
		produktId && produktKonfiguration[produktId] 
			? produktKonfiguration[produktId].materialien 
			: []
	);

	let verfuegbareFormate = $derived(
		produktId && produktKonfiguration[produktId] 
			? produktKonfiguration[produktId].formate 
			: []
	);

	let verfuegbareUmfaenge = $derived(() => {
		if (!produktId || !produktKonfiguration[produktId]?.umfaenge) return [];
		
		const umfaengeConfig = produktKonfiguration[produktId].umfaenge;
		const verfuegbar = [];
		
		for (const [umfangName, wert] of Object.entries(umfaengeConfig)) {
			// Wenn wert === true, ist Umfang für alle Formate verfügbar
			if (wert === true) {
				verfuegbar.push(umfangName);
			} 
			// Wenn wert ein Array ist, nur für diese Formate verfügbar
			else if (Array.isArray(wert)) {
				if (!format || wert.includes(format)) {
					verfuegbar.push(umfangName);
				}
			}
		}
		
		return verfuegbar;
	});

	// Prüfen ob Umfang-Feld angezeigt werden soll
	let zeigeUmfang = $derived(
		produktId && produktKonfiguration[produktId]?.umfaenge !== undefined
	);

	// Produktname für Anzeige
	let produktName = $derived(
		produktId ? produkte.find(p => p.id === produktId)?.name || '' : ''
	);

	// Werte zurücksetzen, wenn sie für neues Produkt nicht verfügbar sind
	$effect(() => {
		if (produktId) {
			// Material prüfen
			if (material) {
				const materialObj = materialien.find(m => m.name === material);
				if (materialObj && !materialObj.fuerProdukte[produktId]) {
					material = '';
				}
			}
			// Format prüfen
			if (format) {
				const formatObj = formate.find(f => f.name === format);
				if (formatObj && !formatObj.fuerProdukte[produktId]) {
					format = '';
				}
			}
			// Umfang zurücksetzen wenn Format sich ändert und nicht mehr gültig
			if (umfang && format) {
				const umfangObj = umfaenge.find(u => u.name === umfang);
				if (umfangObj && Object.keys(umfangObj.fuerFormate).length > 0 && !umfangObj.fuerFormate[format]) {
					umfang = '';
				}
			}
		}
	});

	function waehleProdukt(id) {
		produktId = id;
		zeigErgebnis = false;
	}

	function berechneErgebnis(e) {
		e.preventDefault();
		// Prüfe ob alle Pflichtfelder ausgefüllt sind
		const pflichtfelderAusgefuellt = produktId && auflage && material && format && (!zeigeUmfang || umfang);
		
		if (!pflichtfelderAusgefuellt) {
			ergebnis = 'Bitte füllen Sie alle Felder aus.';
		} else {
			let ergebnisText = `
				<strong>Ihre Auswahl:</strong><br>
				<strong>Produkt:</strong> ${produktName}<br>
				<strong>Format:</strong> ${format}<br>`;
			
			if (zeigeUmfang) {
				ergebnisText += `<strong>Umfang:</strong> ${umfang}<br>`;
			}
			
			ergebnisText += `
				<strong>Auflage:</strong> ${auflage} Stück<br>
				<strong>Material:</strong> ${material}
			`;
			ergebnis = ergebnisText;
		}
		zeigErgebnis = true;
	}

	function zurücksetzen() {
		auflage = '';
		material = '';
		format = '';
		umfang = '';
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
			<p class="intro">Schnelle und preiswerte Lösungen im 4-farbigen Digitaldruck:</p>

			{#if !produktId}
				<!-- Produktauswahl -->
				<div class="product-selection">
					<h2>Produkt wählen</h2>
					<div class="product-grid">
						{#each produkte as prod}
							<button 
								class="product-button" 
								onclick={() => waehleProdukt(prod.id)}
							>
								{prod.name}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Konfigurationsformular -->
				<div class="product-header">
					<h2>{produktName}</h2>
					<button class="btn-back" onclick={() => { produktId = ''; zeigErgebnis = false; }}>
						← Anderes Produkt wählen
					</button>
				</div>

				<form class="calculator-form" onsubmit={berechneErgebnis}>
					<div class="form-group">
						<label for="format">Format</label>
						<select id="format" bind:value={format} required>
							<option value="">Bitte wählen...</option>
							{#each verfuegbareFormate as fmt}
								<option value={fmt}>{fmt}</option>
							{/each}
						</select>
					</div>

					{#if zeigeUmfang}
						<div class="form-group">
							<label for="umfang">Umfang</label>
							<select id="umfang" bind:value={umfang} required disabled={!format}>
								<option value="">{format ? 'Bitte wählen...' : 'Zuerst Format wählen'}</option>
								{#each verfuegbareUmfaenge as umf}
									<option value={umf}>{umf}</option>
								{/each}
							</select>
						</div>
					{/if}

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
						<select id="material" bind:value={material} required>
							<option value="">Bitte wählen...</option>
							{#each verfuegbareMaterialien as mat}
								<option value={mat}>{mat}</option>
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

	/* Produktauswahl */
	.product-selection {
		text-align: center;
	}

	.product-selection h2 {
		font-size: 1.8rem;
		margin-bottom: 2rem;
		color: var(--text-primary);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.product-button {
		padding: 2rem 1.5rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--hover-bg) 100%);
		border: 2px solid var(--border);
		border-radius: 16px;
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px var(--shadow);
	}

	.product-button:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 25px var(--shadow);
		border-color: #6b7280;
		background: linear-gradient(135deg, var(--hover-bg) 0%, var(--bg-secondary) 100%);
	}

	/* Produkt-Header */
	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--border);
	}

	.product-header h2 {
		font-size: 1.8rem;
		color: var(--text-primary);
		margin: 0;
	}

	.btn-back {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid var(--border);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-back:hover {
		background: var(--hover-bg);
		border-color: var(--text-secondary);
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

		.product-grid {
			grid-template-columns: 1fr;
		}

		.product-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
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
