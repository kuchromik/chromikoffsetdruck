<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let { folderPath = '' } = $props();

	let images = $state([]);
	let currentIndex = $state(0);
	let loading = $state(true);
	let intervalId;

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
			loading = false;
		} catch (error) {
			console.error('Fehler beim Laden der Bilder:', error);
			loading = false;
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
						<img src={image} alt="Folie {index + 1}" />
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
		position: relative;
		border-radius: 16px;
		overflow: hidden;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--hover-bg) 100%);
		border: 1px solid var(--border);
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
		animation: kenBurns 4s ease-out forwards;
	}

	@keyframes kenBurns {
		0% {
			transform: scale(1);
		}
		100% {
			transform: scale(1.1);
		}
	}

	/* Loading State */
	.loading {
		display: flex;
		align-items: center;
		justify-content: center;
		height: 100%;
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
</style>
