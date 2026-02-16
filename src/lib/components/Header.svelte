<script>
	import { fly, fade } from 'svelte/transition';
	
	let mobileMenuOpen = $state(false);
	let scrolled = $state(false);
	
	const menuItems = [
		{ id: 1, label: 'Qualität seit 1990', href: '/#thema1' },
		{ id: 2, label: 'Heißfolienprägung', href: '/#thema2' },
		{ id: 3, label: 'Blindprägung', href: '/#thema3' },
		{ id: 4, label: 'Stanzungen', href: '/#thema4' },
		{ id: 5, label: 'Pantone & HKS', href: '/#thema5' },
		{ id: 6, label: 'Besondere Materialien', href: '/#thema6' },
		{ id: 9, label: 'Impressum', href: '/impressum' },
		{ id: 10, label: 'Datenschutz', href: '/datenschutz' }
	];

	$effect(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 50;
		};

		const handleKeyDown = (e) => {
			if (e.key === 'Escape' && mobileMenuOpen) {
				closeMobileMenu();
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', handleScroll);
			window.addEventListener('keydown', handleKeyDown);
			return () => {
				window.removeEventListener('scroll', handleScroll);
				window.removeEventListener('keydown', handleKeyDown);
			};
		}
	});

	function toggleMobileMenu() {
		mobileMenuOpen = !mobileMenuOpen;
	}

	function closeMobileMenu() {
		mobileMenuOpen = false;
	}
</script>

<header class="header" class:scrolled>
	<div class="container">
		<nav class="nav" aria-label="Hauptnavigation">
			<a href="/" class="logo">
				<img 
					src="/logo.png" 
					alt="Chromik Offsetdruck - Startseite" 
					width="210" 
					height="70"
					fetchpriority="high"
				/>
			</a>

			<!-- Desktop Menu -->
			<!-- <ul class="menu desktop-menu">
				{#each menuItems as item}
					<li>
						<a href={item.href}>{item.label}</a>
					</li>
				{/each}
			</ul> -->

			<!-- Mobile Menu Button -->
			<button 
				class="menu-toggle" 
				onclick={toggleMobileMenu} 
				aria-label={mobileMenuOpen ? 'Menü schließen' : 'Menü öffnen'}
				aria-expanded={mobileMenuOpen}
				aria-controls="mobile-menu"
			>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
				<span aria-hidden="true"></span>
			</button>
		</nav>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div class="mobile-menu-overlay" onclick={closeMobileMenu} transition:fade={{ duration: 200 }}>
			<!-- svelte-ignore a11y-click-events-have-key-events -->
			<div 
				id="mobile-menu"
				class="mobile-menu" 
				onclick={(e) => e.stopPropagation()} 
				transition:fly={{ x: 300, duration: 300 }}
				role="dialog"
				aria-modal="true"
				aria-label="Navigationsmenü"
				tabindex="-1"
			>
				<ul>
					{#each menuItems as item}
						<li>
							<a href={item.href} onclick={closeMobileMenu}>{item.label}</a>
						</li>
					{/each}
				</ul>
			</div>
		</div>
	{/if}
</header>

<style>
	.header {
		position: sticky;
		top: 0;
		z-index: 1000;
		background-color: var(--bg-primary);
		border-bottom: 1px solid var(--border);
		/* Optimierte Transition nur für transform und opacity */
		transition: box-shadow 0.3s ease;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
		will-change: box-shadow;
		/* Verhindert Repaint */
		contain: layout style;
	}

	.header.scrolled {
		box-shadow: 0 4px 20px var(--shadow);
	}

	.nav {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 0;
	}

	.logo {
		display: flex;
		align-items: center;
		z-index: 1001;
	}

	.logo img {
		height: 50px;
		width: 150px; /* Explizite Breite verhindert CLS */
		object-fit: contain;
		/* Optimierte Transition */
		transition: transform 0.4s ease;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
	}

	.header.scrolled .logo img {
		height: 40px;
	}

	/* Logo größer auf Desktop */
	@media (min-width: 768px) {
		.logo img {
			height: 70px;
			width: 210px;
		}

		.header.scrolled .logo img {
			height: 50px;
			width: 150px;
		}
	}

	.logo:hover img {
		transform: scale(1.05) translateZ(0);
	}

	.menu {
		display: flex;
		gap: 2rem;
		list-style: none;
	}

	.menu li a {
		font-weight: 500;
		font-size: 0.95rem;
		position: relative;
		padding: 0.5rem 0;
		transition: color 0.3s ease;
	}

	.menu li a::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 0;
		width: 0;
		height: 2px;
		background-color: var(--text-primary);
		transition: width 0.3s ease;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
	}

	.menu li a:hover::after {
		width: 100%;
	}

	.desktop-menu {
		display: none;
	}

	/* Removed desktop breakpoint - hamburger menu always visible */

	/* Mobile Menu Toggle */
	.menu-toggle {
		display: flex;
		flex-direction: column;
		gap: 6px;
		background: none;
		border: none;
		cursor: pointer;
		padding: 0.5rem;
		z-index: 1001;
		transition: gap 0.4s ease;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
	}

	.menu-toggle span {
		width: 30px;
		height: 3px;
		background-color: var(--text-primary);
		transition: all 0.4s ease;
		/* Hardware-Beschleunigung */
		transform: translateZ(0);
	}

	.header.scrolled .menu-toggle {
		gap: 5px;
	}

	.header.scrolled .menu-toggle span {
		width: 25px;
		height: 2px;
	}

	/* Removed desktop breakpoint - hamburger menu always visible */

	/* Mobile Menu Overlay */
	.mobile-menu-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: rgba(0, 0, 0, 0.5);
		z-index: 999;
		/* Hardware-Beschleunigung für Overlay */
		transform: translateZ(0);
	}

	.mobile-menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(300px, 80vw);
		height: 100vh;
		background-color: var(--bg-primary);
		padding: 6rem 2rem 2rem;
		overflow-y: auto;
		box-shadow: -4px 0 20px var(--shadow);
		/* Optimierte Scroll-Performance */
		-webkit-overflow-scrolling: touch;
	}

	.mobile-menu ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
		min-height: calc(100vh - 8rem); /* Berücksichtigt das Padding */
	}

	.mobile-menu li a {
		display: block;
		padding: 1rem;
		font-size: 1.1rem;
		font-weight: 500;
		border-bottom: 1px solid var(--border);
		transition: background-color 0.2s ease;
	}

	.mobile-menu li a:hover {
		background-color: var(--hover-bg);
	}
</style>
