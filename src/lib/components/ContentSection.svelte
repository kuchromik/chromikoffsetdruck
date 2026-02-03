<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import SimpleImageSlider from './SimpleImageSlider.svelte';

	let { 
		id = '',
		title = '',
		description = '',
		reverse = false,
		imagePath = '',
		useSlider = false,
		sliderFolder = '',
		buttonText = '',
		buttonLink = '',
		buttonVariant = '',
		buttons = []
	} = $props();

	let visible = $state(false);
	let sectionElement;

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						visible = true;
					}
				});
			},
			{ threshold: 0.1 }
		);

		if (sectionElement) {
			observer.observe(sectionElement);
		}

		return () => {
			if (sectionElement) {
				observer.unobserve(sectionElement);
			}
		};
	});
</script>

<section {id} class="content-section section" bind:this={sectionElement}>
	<div class="container">
		{#if visible}
			<div class="content-wrapper" class:reverse transition:fly={{ y: 50, duration: 600, delay: 100 }}>
				<div class="text-content">
					<h2>{title}</h2>
					<p>{@html description}</p>
					{#if buttonText && buttonLink}
						<a href={buttonLink} class="cta-button" class:cta-button-gray={buttonVariant === 'gray'}>{buttonText}</a>
					{/if}
					{#if buttons && buttons.length > 0}
						<div class="button-group">
							{#each buttons as btn}
								<a href={btn.link} class="cta-button cta-button-small" class:cta-button-gray={btn.variant === 'gray'}>{btn.text}</a>
							{/each}
						</div>
					{/if}
				</div>
				<div class="image-placeholder">
					{#if useSlider}
						<SimpleImageSlider folderPath={sliderFolder} />
					{:else if imagePath}
						<img src={imagePath} alt={title} />
					{:else}
						<div class="placeholder-content">
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
								<circle cx="8.5" cy="8.5" r="1.5"></circle>
								<polyline points="21 15 16 10 5 21"></polyline>
							</svg>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.content-section {
		position: relative;
		padding: 5rem 0;
	}

	.content-section::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 80%;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			var(--border) 20%,
			var(--text-secondary) 50%,
			var(--border) 80%,
			transparent 100%
		);
		opacity: 0.3;
	}

	.content-section:last-child::after {
		display: none;
	}

	@media (max-width: 768px) {
		.content-section {
			padding: 3rem 0;
		}

		.content-section::after {
			width: 90%;
		}
	}

	.content-wrapper {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 4rem;
		align-items: end;
	}

	.content-wrapper.reverse {
		direction: rtl;
	}

	.content-wrapper.reverse > * {
		direction: ltr;
	}

	@media (max-width: 968px) {
		.content-wrapper {
			grid-template-columns: 1fr;
			gap: 2rem;
		}

		.content-wrapper.reverse {
			direction: ltr;
		}
	}

	.text-content h2 {
		margin-bottom: 1.5rem;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.text-content p {
		font-size: 1.1rem;
		color: var(--text-secondary);
		line-height: 1.8;
		margin-bottom: 2rem;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.cta-button-small {
		padding: 0.5rem 1.25rem !important;
		font-size: 0.85rem !important;
	}

	.cta-button.cta-button-gray {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%) !important;
		box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3) !important;
	}

	.cta-button.cta-button-gray:hover {
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
		box-shadow: 0 8px 25px rgba(156, 163, 175, 0.5) !important;
	}

	.cta-button.cta-button-gray:active {
		box-shadow: 0 4px 15px rgba(107, 114, 128, 0.4) !important;
	}

	@media (prefers-color-scheme: dark) {
		.cta-button.cta-button-gray {
			background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%) !important;
			box-shadow: 0 4px 15px rgba(156, 163, 175, 0.4) !important;
		}

		.cta-button.cta-button-gray:hover {
			background: linear-gradient(135deg, #d1d5db 0%, #9ca3af 100%) !important;
			box-shadow: 0 8px 25px rgba(209, 213, 219, 0.6) !important;
		}
	}

	.cta-button {
		display: inline-block;
		padding: 0.875rem 2rem;
		background: linear-gradient(135deg, #fc3614 0%, #d42e10 100%);
		color: #fff;
		border: 2px solid transparent;
		border-radius: 12px;
		font-size: 1rem;
		font-weight: 600;
		text-decoration: none;
		cursor: pointer;
		transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
		position: relative;
		overflow: hidden;
		box-shadow: 0 4px 15px rgba(252, 54, 20, 0.3);
		z-index: 1;
	}

	.cta-button::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		width: 0;
		height: 0;
		border-radius: 50%;
		background: rgba(255, 255, 255, 0.3);
		transform: translate(-50%, -50%);
		transition: width 0.6s, height 0.6s;
		z-index: -1;
	}

	.cta-button:hover {
		transform: translateY(-3px) scale(1.05);
		box-shadow: 0 8px 25px rgba(252, 54, 20, 0.5);
		background: linear-gradient(135deg, #ff4f2e 0%, #fc3614 100%);
	}

	.cta-button:hover::before {
		width: 300px;
		height: 300px;
	}

	.cta-button:active {
		transform: translateY(-1px) scale(1.02);
		box-shadow: 0 4px 15px rgba(252, 54, 20, 0.4);
	}

	@media (prefers-color-scheme: dark) {
		.cta-button {
			background: linear-gradient(135deg, #ff4f2e 0%, #fc3614 100%);
			box-shadow: 0 4px 15px rgba(255, 79, 46, 0.4);
		}

		.cta-button:hover {
			background: linear-gradient(135deg, #ff6548 0%, #ff4f2e 100%);
			box-shadow: 0 8px 25px rgba(255, 79, 46, 0.6);
		}
	}

	.image-placeholder {
		width: 100%;
		max-width: 600px;
		aspect-ratio: 4 / 3;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--hover-bg) 100%);
		border-radius: 16px;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		position: relative;
		border: 1px solid var(--border);
	}

	.image-placeholder img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center;
	}

	.placeholder-content {
		color: var(--text-secondary);
		opacity: 0.3;
	}

	.placeholder-content svg {
		width: 80px;
		height: 80px;
	}

	/* Hover effect for image placeholder */
	.image-placeholder::after {
		content: '';
		position: absolute;
		top: -50%;
		left: -50%;
		width: 200%;
		height: 200%;
		background: linear-gradient(
			45deg,
			transparent 30%,
			rgba(255, 255, 255, 0.05) 50%,
			transparent 70%
		);
		transform: rotate(45deg);
		animation: shimmer 3s infinite;
	}

	@keyframes shimmer {
		0% {
			transform: translateX(-100%) translateY(-100%) rotate(45deg);
		}
		100% {
			transform: translateX(100%) translateY(100%) rotate(45deg);
		}
	}
</style>
