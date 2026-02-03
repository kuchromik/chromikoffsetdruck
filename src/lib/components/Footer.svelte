<script>
	const currentYear = new Date().getFullYear();

	const menuItems = [
		{ label: 'Qualität seit 1990', href: '#thema1' },
		{ label: 'Heißfolienprägung', href: '#thema2' },
		{ label: 'Blindprägung', href: '#thema3' },
		{ label: 'Stanzungen', href: '#thema4' }
	];
</script>

<footer class="footer">
	<div class="container">
		<div class="footer-content">
			<div class="footer-section">
				<h3>Über uns</h3>
				<p>Bewährte Lösungen für Ihre Anforderungen. Qualität und Präzision seit über 35 Jahren.</p>
				<div class="logo-footer">
					<img src="/logo.png" alt="Logo" />
				</div>
			</div>

			<div class="footer-section">
				<h3>Navigation</h3>
				<ul class="footer-links">
					{#each menuItems as item}
						<li><a href={item.href}>{item.label}</a></li>
					{/each}
				</ul>
			</div>

			<div class="footer-section">
				<h3>Weitere Links</h3>
				<ul class="footer-links">
					<li><a href="#thema5">Pantone & HKS</a></li>
					<li><a href="#thema6">Besondere Materialien</a></li>
				</ul>
			</div>

			<div class="footer-section">
				<h3>Kontakt</h3>
				<ul class="footer-links">
					<li>E-Mail: kai.chromik@online.de</li>
					<li>Telefon: +49 151 5245 7061</li>
					<li>Marie-Curie-Straße 8</li>
					<li>15236 Frankfurt/Oder</li>
				</ul>
			</div>
		</div>

		<div class="footer-bottom">
			<p>&copy; {currentYear} Chromik Offsetdruck. Alle Rechte vorbehalten.</p>
			<div class="footer-bottom-links">
				<a href="/datenschutz">Datenschutz</a>
				<a href="/impressum">Impressum</a>
			</div>
		</div>
	</div>
</footer>

<style>
	.footer {
		background-color: var(--bg-secondary);
		border-top: 1px solid var(--border);
		padding: 4rem 0 2rem;
		margin-top: 4rem;
	}

	.footer-content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 3rem;
		margin-bottom: 3rem;
	}

	@media (max-width: 768px) {
		.footer-content {
			grid-template-columns: 1fr;
			gap: 2rem;
		}
	}

	.footer-section h3 {
		font-size: 1.2rem;
		margin-bottom: 1rem;
		font-weight: 600;
	}

	.footer-section p {
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.logo-footer {
		margin-top: 1.5rem;
	}

	.logo-footer img {
		height: 40px;
		width: auto;
		object-fit: contain;
		opacity: 0.8;
		transition: opacity 0.3s ease;
	}

	.logo-footer img:hover {
		opacity: 1;
	}

	.footer-links {
		list-style: none;
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.footer-links li {
		color: var(--text-secondary);
		transition: color 0.2s ease, transform 0.2s ease;
	}

	.footer-links li a {
		display: inline-block;
		transition: transform 0.2s ease;
	}

	.footer-links li a:hover {
		transform: translateX(5px);
		color: var(--text-primary);
	}

	.footer-bottom {
		padding-top: 2rem;
		border-top: 1px solid var(--border);
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.footer-bottom p {
		color: var(--text-secondary);
		font-size: 0.9rem;
	}

	.footer-bottom-links {
		display: flex;
		gap: 2rem;
	}

	.footer-bottom-links a {
		color: var(--text-secondary);
		font-size: 0.9rem;
		transition: color 0.2s ease;
	}

	.footer-bottom-links a:hover {
		color: var(--text-primary);
	}

	@media (max-width: 768px) {
		.footer-bottom {
			flex-direction: column;
			text-align: center;
		}

		.footer-bottom-links {
			flex-direction: column;
			gap: 0.5rem;
		}
	}
</style>
