<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { folderPath = '' } = $props();

	let images = $state([]);
	let currentIndex = $state(0);
	let loading = $state(true);
	let intervalId;
	let preloadedImages = new Set();

	// Funktion zum Laden aller Bilder aus dem angegebenen Ordner
	async function loadImages() {
		try {
			const folder = folderPath || 'foilSlider';
			const imageModules = import.meta.glob('/static/**/*.{jpg,jpeg,png,webp}', { 
				eager: false,
				query: '?url',
				import: 'default'
			});

			const imagePaths = Object.keys(imageModules)
				.filter(path => path.includes(`/static/${folder}/`))
				.map(path => path.replace('/static', ''));

			// Zufällige Reihenfolge
			images = shuffleArray(imagePaths);
			
			// Erstes Bild sofort vorladen
			if (images.length > 0) {
				await preloadImage(images[0]);
			}
			
			loading = false;
			
			// Nächste paar Bilder im Hintergrund vorladen
			preloadNextImages();
		} catch (error) {
			console.error('Fehler beim Laden der Bilder:', error);
			loading = false;
		}
	}

	// Bild vorladen
	function preloadImage(src) {
		return new Promise((resolve, reject) => {
			if (preloadedImages.has(src)) {
				resolve();
				return;
			}
			
			const img = new Image();
			img.onload = () => {
				preloadedImages.add(src);
				resolve();
			};
			img.onerror = reject;
			img.src = src;
		});
	}

	// Die nächsten 2-3 Bilder vorladen
	async function preloadNextImages() {
		const nextIndexes = [
			(currentIndex + 1) % images.length,
			(currentIndex + 2) % images.length
		];
		
		for (const idx of nextIndexes) {
			if (images[idx]) {
				preloadImage(images[idx]).catch(() => {});
			}
		}
	}

	// Fisher-Yates Shuffle Algorithmus
	function shuffleArray(array) {
		const shuffled = [...array];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		return shuffled;
	}

	function startAutoplay() {
		intervalId = setInterval(() => {
			currentIndex = (currentIndex + 1) % images.length;
			// Nächstes Bild vorladen
			preloadNextImages();
		}, 4000); // Wechsel alle 4 Sekunden
	}

	onMount(() => {
		loadImages();
		startAutoplay();

		return () => {
			if (intervalId) {
				clearInterval(intervalId);
			}
		};
	});
</script>

<div class="simple-slider">
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if images.length > 0}
		<div class="slider-content">
			{#each images as image, index}
				{#if index === currentIndex}
					<div class="slide" transition:fade={{ duration: 600 }}>
						<img 
							src={image} 
							alt="Folie {index + 1}" 
							width="600" 
							height="450"
							loading="lazy"
							decoding="async"
						/>
					</div>
				{/if}
			{/each}
		</div>
	{:else}
		<div class="no-images">
			<p>Keine Bilder gefunden</p>
		</div>
	{/if}
</div>

<style>
	.simple-slider {
		width: 100%;
		max-width: 600px;
		aspect-ratio: 4 / 3;
		min-height: 400px; /* Verhindert Layout-Shift */
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--hover-bg) 100%);
		border: 1px solid var(--border);
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
		will-change: auto;
	}

	.slider-content {
		position: relative;
		width: 100%;
		height: 100%;
	}

	.slide {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.slide img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
		/* Optimierte Animation */
		animation: kenBurns 4s ease-out forwards;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
	}

	@keyframes kenBurns {
		0% {
			transform: scale(1) translateZ(0);
		}
		100% {
			transform: scale(1.1) translateZ(0);
		}
	}

	/* Loading State */
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		min-height: 400px; /* Konsistent mit Container */
	}

	.spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--border);
		border-top-color: var(--text-primary);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.no-images {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
		color: var(--text-secondary);
	}
	
	@media (max-width: 768px) {
		.simple-slider {
			min-height: 300px;
		}
		.loading {
			min-height: 300px;
		}
	}
</style>
