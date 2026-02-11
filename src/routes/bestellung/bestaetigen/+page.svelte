<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	
	let status = 'verifying'; // 'verifying', 'success', 'error'
	let message = 'Ihre Bestellung wird bestätigt...';
	let errorDetails = '';
	
	onMount(async () => {
		const token = $page.url.searchParams.get('token');
		
		if (!token) {
			status = 'error';
			message = 'Ungültiger Bestätigungslink';
			errorDetails = 'Der Link enthält keinen gültigen Token.';
			return;
		}
		
		try {
			// API aufrufen um Token zu verifizieren und Bestellung zu verarbeiten
			const response = await fetch('/api/confirm-order', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ token })
			});
			
			const result = await response.json();
			
			if (result.success) {
				status = 'success';
				message = 'Vielen Dank! Ihre Bestellung wurde erfolgreich bestätigt.';
			} else {
				status = 'error';
				message = 'Bestätigung fehlgeschlagen';
				errorDetails = result.error || 'Ein unbekannter Fehler ist aufgetreten.';
			}
		} catch (error) {
			status = 'error';
			message = 'Bestätigung fehlgeschlagen';
			errorDetails = 'Es gab ein Problem bei der Kommunikation mit dem Server.';
			console.error('Fehler bei der Bestätigung:', error);
		}
	});
</script>

<svelte:head>
	<title>Bestellung bestätigen - Chromik Offsetdruck</title>
</svelte:head>

<Header />

<main class="confirmation-page">
	<div class="container">
		{#if status === 'verifying'}
			<div class="status-box verifying">
				<div class="spinner"></div>
				<h1>{message}</h1>
				<p>Bitte haben Sie einen Moment Geduld...</p>
			</div>
		{:else if status === 'success'}
			<div class="status-box success">
				<svg class="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
					<circle class="checkmark-circle" cx="26" cy="26" r="25" fill="none"/>
					<path class="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
				</svg>
				<h1>{message}</h1>
				<p>Sie erhalten in Kürze eine E-Mail mit allen Details zu Ihrer Bestellung.</p>
				<p>Wir werden Ihre Anfrage schnellstmöglich bearbeiten und uns bei Ihnen melden.</p>
				<a href="/" class="back-button">Zurück zur Startseite</a>
			</div>
		{:else if status === 'error'}
			<div class="status-box error">
				<svg class="error-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
					<circle class="error-circle" cx="26" cy="26" r="25" fill="none"/>
					<path class="error-cross" fill="none" d="M16 16 36 36 M36 16 16 36"/>
				</svg>
				<h1>{message}</h1>
				<p>{errorDetails}</p>
				<div class="error-reasons">
					<h3>Mögliche Gründe:</h3>
					<ul>
						<li>Der Bestätigungslink ist bereits abgelaufen (24 Stunden Gültigkeit)</li>
						<li>Die Bestellung wurde bereits bestätigt</li>
						<li>Der Link ist fehlerhaft oder unvollständig</li>
					</ul>
				</div>
				<p>Bitte versuchen Sie es erneut oder kontaktieren Sie uns:</p>
				<p class="contact">
					<strong>Telefon:</strong> 0151-52457061<br>
					<strong>E-Mail:</strong> info@chromikoffsetdruck.de
				</p>
				<a href="/fixguenstig" class="back-button">Neue Bestellung aufgeben</a>
			</div>
		{/if}
	</div>
</main>

<Footer />

<style>
	.confirmation-page {
		min-height: calc(100vh - 200px);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 2rem 1rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
	}
	
	.container {
		max-width: 600px;
		width: 100%;
	}
	
	.status-box {
		background: white;
		border-radius: 12px;
		padding: 3rem 2rem;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
		text-align: center;
	}
	
	.status-box h1 {
		margin: 1.5rem 0 1rem;
		font-size: 1.8rem;
		color: #333;
	}
	
	.status-box p {
		color: #666;
		line-height: 1.6;
		margin-bottom: 1rem;
	}
	
	/* Spinner Animation */
	.spinner {
		margin: 0 auto;
		width: 50px;
		height: 50px;
		border: 4px solid #f3f3f3;
		border-top: 4px solid #667eea;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}
	
	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}
	
	/* Success Checkmark */
	.checkmark {
		width: 80px;
		height: 80px;
		margin: 0 auto;
		display: block;
	}
	
	.checkmark-circle {
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		stroke-width: 2;
		stroke-miterlimit: 10;
		stroke: #4CAF50;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}
	
	.checkmark-check {
		transform-origin: 50% 50%;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		stroke-width: 3;
		stroke: #4CAF50;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
	}
	
	@keyframes stroke {
		100% {
			stroke-dashoffset: 0;
		}
	}
	
	/* Error Icon */
	.error-icon {
		width: 80px;
		height: 80px;
		margin: 0 auto;
		display: block;
	}
	
	.error-circle {
		stroke-dasharray: 166;
		stroke-dashoffset: 166;
		stroke-width: 2;
		stroke-miterlimit: 10;
		stroke: #f44336;
		animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
	}
	
	.error-cross {
		transform-origin: 50% 50%;
		stroke-dasharray: 48;
		stroke-dashoffset: 48;
		stroke-width: 3;
		stroke: #f44336;
		animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.6s forwards;
	}
	
	.error-reasons {
		text-align: left;
		margin: 2rem 0;
		padding: 1rem;
		background: #f5f5f5;
		border-radius: 8px;
	}
	
	.error-reasons h3 {
		margin-top: 0;
		color: #333;
		font-size: 1.1rem;
	}
	
	.error-reasons ul {
		margin: 0.5rem 0 0;
		padding-left: 1.5rem;
	}
	
	.error-reasons li {
		color: #666;
		margin-bottom: 0.5rem;
	}
	
	.contact {
		background: #f0f7ff;
		padding: 1rem;
		border-radius: 8px;
		border-left: 4px solid #667eea;
		margin: 1.5rem 0;
	}
	
	.back-button {
		display: inline-block;
		margin-top: 2rem;
		padding: 0.8rem 2rem;
		background: #667eea;
		color: white;
		text-decoration: none;
		border-radius: 8px;
		font-weight: 500;
		transition: background 0.3s ease;
	}
	
	.back-button:hover {
		background: #5568d3;
	}
	
	@media (max-width: 768px) {
		.status-box {
			padding: 2rem 1.5rem;
		}
		
		.status-box h1 {
			font-size: 1.5rem;
		}
	}
</style>
