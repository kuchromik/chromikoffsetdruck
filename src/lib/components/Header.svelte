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
		{ id: 7, label: 'Extraladen', href: '/#thema7' },
		{ id: 8, label: 'Fix&günstig', href: '/#thema8' },
		{ id: 9, label: 'Impressum', href: '/impressum' },
		{ id: 10, label: 'Datenschutz', href: '/datenschutz' }
	];

	$effect(() => {
		const handleScroll = () => {
			scrolled = window.scrollY > 50;
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
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
		<nav class="nav">
			<a href="/" class="logo">
				<img src="/logo.png" alt="Logo" />
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
			<button class="menu-toggle" onclick={toggleMobileMenu} aria-label="Toggle menu">
				<span></span>
				<span></span>
				<span></span>
			</button>
		</nav>
	</div>

	<!-- Mobile Menu -->
	{#if mobileMenuOpen}
		<div class="mobile-menu-overlay" onclick={closeMobileMenu} transition:fade={{ duration: 200 }}>
			<div class="mobile-menu" onclick={(e) => e.stopPropagation()} transition:fly={{ x: 300, duration: 300 }}>
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
		transition: all 0.3s ease;
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
		width: auto;
		object-fit: contain;
		transition: all 0.4s ease;
	}

	.header.scrolled .logo img {
		height: 40px;
	}

	/* Logo größer auf Desktop */
	@media (min-width: 768px) {
		.logo img {
			height: 70px;
		}

		.header.scrolled .logo img {
			height: 50px;
		}
	}

	.logo:hover img {
		transform: scale(1.05);
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
		transition: all 0.4s ease;
	}

	.menu-toggle span {
		width: 30px;
		height: 3px;
		background-color: var(--text-primary);
		transition: all 0.4s ease;
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
	}

	.mobile-menu {
		position: fixed;
		top: 0;
		right: 0;
		bottom: 0;
		width: min(300px, 80vw);
		background-color: var(--bg-primary);
		padding: 6rem 2rem 2rem;
		overflow-y: auto;
		box-shadow: -4px 0 20px var(--shadow);
	}

	.mobile-menu ul {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 1rem;
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
