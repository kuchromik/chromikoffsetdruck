<script>
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

	let images = $state([]);
	let currentIndex = $state(0);
	let loading = $state(true);
	let intervalId;

	// Funktion zum Laden aller Bilder aus dem Slider-Ordner
	async function loadImages() {
		try {
			// Dynamisches Importieren aller Bilder aus dem slider-Ordner
			const imageModules = import.meta.glob('/static/slider/*.{jpg,jpeg,png,webp}', { 
				eager: false,
				query: '?url',
				import: 'default'
			});

			const imagePaths = Object.keys(imageModules).map(path => {
				// Konvertiere den Pfad von /static/slider/image.jpg zu /slider/image.jpg
				return path.replace('/static', '');
			});

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

	function nextSlide() {
		currentIndex = (currentIndex + 1) % images.length;
	}

	function previousSlide() {
		currentIndex = (currentIndex - 1 + images.length) % images.length;
	}

	function goToSlide(index) {
		currentIndex = index;
	}

	function startAutoplay() {
		intervalId = setInterval(() => {
			nextSlide();
		}, 5000); // Wechsel alle 5 Sekunden
	}

	function stopAutoplay() {
		if (intervalId) {
			clearInterval(intervalId);
		}
	}

	onMount(() => {
		loadImages();
		startAutoplay();

		return () => {
			stopAutoplay();
		};
	});
</script>

<div class="slider-container" onmouseenter={stopAutoplay} onmouseleave={startAutoplay}>
	{#if loading}
		<div class="loading">
			<div class="spinner"></div>
		</div>
	{:else if images.length > 0}
		<div class="slider">
			{#each images as image, index}
				{#if index === currentIndex}
					<div class="slide" transition:fade={{ duration: 800 }}>
						<img src={image} alt="Slider Bild {index + 1}" />
					</div>
				{/if}
			{/each}

			<!-- Navigation Buttons -->
			<button class="nav-button prev" onclick={previousSlide} aria-label="Vorheriges Bild">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="15 18 9 12 15 6"></polyline>
				</svg>
			</button>
			<button class="nav-button next" onclick={nextSlide} aria-label="Nächstes Bild">
				<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<polyline points="9 18 15 12 9 6"></polyline>
				</svg>
			</button>

			<!-- Dots Indicator -->
			<div class="dots">
				{#each images as _, index}
					<button 
						class="dot" 
						class:active={index === currentIndex}
						onclick={() => goToSlide(index)}
						aria-label="Gehe zu Bild {index + 1}"
					></button>
				{/each}
			</div>
		</div>
	{:else}
		<div class="no-images">
			<p>Keine Bilder im Slider-Ordner gefunden</p>
		</div>
	{/if}
</div>

<style>
	.slider-container {
		position: relative;
		width: 100%;
		max-width: 600px;
		margin: 2rem auto 0;
		aspect-ratio: 4 / 3;
		max-height: 450px;
		overflow: hidden;
		background-color: var(--bg-secondary);
		border-radius: 8px;
		box-shadow: 0 4px 20px var(--shadow);
	}

	@media (max-width: 600px) {
		.slider-container {
			max-width: calc(100% - 2rem);
			margin: 1.5rem 1rem 0;
		}
	}

	.slider {
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
		height: auto;
		max-height: 450px;
		object-fit: contain;
		object-position: center;
	}

	/* Navigation Buttons */
	.nav-button {
		position: absolute;
		top: 50%;
		transform: translateY(-50%);
		background-color: rgba(255, 255, 255, 0.2);
		backdrop-filter: blur(10px);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		width: 50px;
		height: 50px;
		border-radius: 50%;
		cursor: pointer;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.3s ease;
		opacity: 0;
		z-index: 10;
	}

	.slider-container:hover .nav-button {
		opacity: 1;
	}

	.nav-button:hover {
		background-color: rgba(255, 255, 255, 0.3);
		transform: translateY(-50%) scale(1.1);
	}

	.nav-button svg {
		width: 24px;
		height: 24px;
	}

	.nav-button.prev {
		left: 2rem;
	}

	.nav-button.next {
		right: 2rem;
	}

	@media (max-width: 768px) {
		.nav-button {
			width: 40px;
			height: 40px;
		}

		.nav-button svg {
			width: 20px;
			height: 20px;
		}

		.nav-button.prev {
			left: 1rem;
		}

		.nav-button.next {
			right: 1rem;
		}
	}

	/* Dots Indicator */
	.dots {
		position: absolute;
		bottom: 2rem;
		left: 50%;
		transform: translateX(-50%);
		display: flex;
		gap: 0.75rem;
		z-index: 10;
	}

	.dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background-color: rgba(255, 255, 255, 0.5);
		border: 2px solid rgba(255, 255, 255, 0.8);
		cursor: pointer;
		transition: all 0.3s ease;
		padding: 0;
	}

	.dot:hover {
		background-color: rgba(255, 255, 255, 0.7);
		transform: scale(1.2);
	}

	.dot.active {
		background-color: white;
		transform: scale(1.3);
	}

	@media (max-width: 768px) {
		.dots {
			bottom: 1rem;
			gap: 0.5rem;
		}

		.dot {
			width: 10px;
			height: 10px;
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
		width: 50px;
		height: 50px;
		border: 4px solid var(--border);
		border-top-color: var(--text-primary);
		border-radius: 50%;
		animation: spin 1s linear infinite;
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
