<script>
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
</script>

<svelte:head>
	<title>Extraladen - Chromik Offsetdruck</title>
	<meta name="description" content="Bald verfügbar: Besondere Druckprodukte im Extraladen" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main class="extraladen-page">
		<div class="container">
			<div class="content-box">
				<div class="icon-container">
					<svg class="gift-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<polyline points="20 12 20 22 4 22 4 12"></polyline>
						<rect x="2" y="7" width="20" height="5"></rect>
						<line x1="12" y1="22" x2="12" y2="7"></line>
						<path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"></path>
						<path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"></path>
					</svg>
				</div>
				
				<h1>Extraladen</h1>
				
				<div class="status-badge">
					<span class="pulse"></span>
					In Vorbereitung
				</div>
				
				<div class="main-message">
					<p class="lead">
						Hier entsteht etwas Besonderes!
					</p>
					<p>
						Unser <strong>Extraladen</strong> wird bald eröffnen und bietet Ihnen eine 
						handverlesene Auswahl an besonderen Druckprodukten, die über unser 
						Standard-Sortiment hinausgehen.
					</p>
				</div>
				
				<div class="features-grid">
					<div class="feature-card">
						<div class="feature-icon">✨</div>
						<h3>Premium-Materialien</h3>
						<p>Exklusive Papiere und Veredelungen für besondere Anlässe</p>
					</div>
					
					<div class="feature-card">
						<div class="feature-icon">🎨</div>
						<h3>Kreative Designs</h3>
						<p>Individuelle Gestaltungsmöglichkeiten für Ihre Projekte</p>
					</div>
					
					<div class="feature-card">
						<div class="feature-icon">🚀</div>
						<h3>Innovative Produkte</h3>
						<p>Neue Drucklösungen, die begeistern</p>
					</div>
				</div>
				
				<div class="cta-section">
					<p class="cta-text">
						Bis dahin stehen Ihnen unsere bewährten Druckprodukte zur Verfügung:
					</p>
					<a href="/fixguenstig" class="btn-primary">
						<span>Zu Fix&günstig</span>
						<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
							<line x1="5" y1="12" x2="19" y2="12"></line>
							<polyline points="12 5 19 12 12 19"></polyline>
						</svg>
					</a>
				</div>
				
				<div class="footer-note">
					<p>
						Sie haben Fragen oder Wünsche für besondere Druckprodukte?<br>
						<a href="mailto:info@chromikoffsetdruck.de">Sprechen Sie uns gerne an!</a>
					</p>
				</div>
			</div>
		</div>
	</main>

	<Footer />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	.extraladen-page {
		flex: 1;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 3rem 1rem;
	}
	
	.container {
		max-width: 900px;
		margin: 0 auto;
	}
	
	.content-box {
		background: white;
		border-radius: 16px;
		padding: 3rem 2.5rem;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
		text-align: center;
	}
	
	.icon-container {
		margin-bottom: 1.5rem;
	}
	
	.gift-icon {
		width: 80px;
		height: 80px;
		color: #667eea;
		animation: float 3s ease-in-out infinite;
	}
	
	@keyframes float {
		0%, 100% {
			transform: translateY(0px);
		}
		50% {
			transform: translateY(-10px);
		}
	}
	
	h1 {
		font-size: 2.5rem;
		color: #333;
		margin-bottom: 1rem;
		font-weight: 700;
	}
	
	.status-badge {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1.25rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border-radius: 50px;
		font-weight: 500;
		font-size: 0.9rem;
		margin-bottom: 2rem;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.pulse {
		width: 8px;
		height: 8px;
		background: white;
		border-radius: 50%;
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% {
			opacity: 1;
			transform: scale(1);
		}
		50% {
			opacity: 0.5;
			transform: scale(0.8);
		}
	}
	
	.main-message {
		margin: 2rem 0 3rem;
	}
	
	.lead {
		font-size: 1.5rem;
		font-weight: 600;
		color: #333;
		margin-bottom: 1rem;
	}
	
	.main-message p {
		font-size: 1.1rem;
		line-height: 1.7;
		color: #555;
		max-width: 700px;
		margin: 0 auto 1rem;
	}
	
	.features-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
		gap: 1.5rem;
		margin: 3rem 0;
	}
	
	.feature-card {
		padding: 2rem 1.5rem;
		background: linear-gradient(135deg, #f8f9ff 0%, #f0f3ff 100%);
		border-radius: 12px;
		transition: transform 0.3s ease, box-shadow 0.3s ease;
	}
	
	.feature-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 30px rgba(102, 126, 234, 0.2);
	}
	
	.feature-icon {
		font-size: 2.5rem;
		margin-bottom: 1rem;
	}
	
	.feature-card h3 {
		font-size: 1.2rem;
		color: #333;
		margin-bottom: 0.75rem;
		font-weight: 600;
	}
	
	.feature-card p {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.5;
		margin: 0;
	}
	
	.cta-section {
		margin: 3rem 0 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #f8f9ff 0%, #fff 100%);
		border-radius: 12px;
		border: 2px solid #e5e7ff;
	}
	
	.cta-text {
		font-size: 1.1rem;
		color: #555;
		margin-bottom: 1.5rem;
		font-weight: 500;
	}
	
	.btn-primary {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		padding: 1rem 2rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		text-decoration: none;
		border-radius: 50px;
		font-weight: 600;
		font-size: 1.1rem;
		transition: transform 0.2s ease, box-shadow 0.2s ease;
		box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
	}
	
	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 25px rgba(102, 126, 234, 0.4);
	}
	
	.btn-primary svg {
		transition: transform 0.2s ease;
	}
	
	.btn-primary:hover svg {
		transform: translateX(5px);
	}
	
	.footer-note {
		margin-top: 2.5rem;
		padding-top: 2rem;
		border-top: 1px solid #eee;
	}
	
	.footer-note p {
		font-size: 0.95rem;
		color: #666;
		line-height: 1.6;
	}
	
	.footer-note a {
		color: #667eea;
		text-decoration: none;
		font-weight: 500;
		border-bottom: 2px solid transparent;
		transition: border-color 0.2s ease;
	}
	
	.footer-note a:hover {
		border-bottom-color: #667eea;
	}
	
	@media (max-width: 768px) {
		.extraladen-page {
			padding: 2rem 1rem;
		}
		
		.content-box {
			padding: 2rem 1.5rem;
		}
		
		h1 {
			font-size: 2rem;
		}
		
		.lead {
			font-size: 1.25rem;
		}
		
		.main-message p {
			font-size: 1rem;
		}
		
		.features-grid {
			grid-template-columns: 1fr;
			gap: 1rem;
		}
		
		.feature-card {
			padding: 1.5rem 1.25rem;
		}
		
		.cta-section {
			padding: 1.5rem;
		}
		
		.btn-primary {
			padding: 0.875rem 1.75rem;
			font-size: 1rem;
		}
	}
</style>
