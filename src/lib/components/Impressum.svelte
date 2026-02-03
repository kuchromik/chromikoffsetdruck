<script>
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';

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

<section id="impressum" class="impressum-section" bind:this={sectionElement}>
	<div class="container">
		{#if visible}
			<div class="impressum-content" transition:fly={{ y: 50, duration: 600, delay: 100 }}>
				<h2>Impressum</h2>
				
				<div class="impressum-grid">
					<div class="impressum-block">
						<h3>Angaben gemäß § 5 TMG</h3>
						<p>
							Chromik Offsetdruck<br>
							Inhaber: Kai-Uwe Chromik<br>
							Marie-Curie-Straße 8<br>
							15236 Frankfurt (Oder)
						</p>
					</div>

					<div class="impressum-block">
						<h3>Kontakt</h3>
						<p>
							Telefon: +49 151 5245 7061<br>
							E-Mail: kai.chromik@online.de
						</p>
					</div>

					<div class="impressum-block">
						<h3>Umsatzsteuer-ID</h3>
						<p>
							Umsatzsteuer-Identifikationsnummer gemäß §&nbsp;27a Umsatzsteuergesetz:
							DE139006820 
						</p>
					</div>

					<div class="impressum-block">
						<h3>Verantwortlich für den Inhalt</h3>
						<p>
							Verantwortlich nach §&nbsp;55&nbsp;Abs.&nbsp;2 RStV:<br>
							Kai-Uwe Chromik<br>
							Marie-Curie-Straße 8<br>
							15236 Frankfurt (Oder)
						</p>
					</div>

					<div class="impressum-block full-width">
						<h3>Haftungsausschluss</h3>
						<h4>Haftung für Inhalte</h4>
						<p>
							Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß §&nbsp;7&nbsp;Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§&nbsp;8 bis&nbsp;10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
						</p>

						<h4>Haftung für Links</h4>
						<p>
							Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
						</p>

						<h4>Urheberrecht</h4>
						<p>
							Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
						</p>
					</div>

					<div class="impressum-block full-width">
						<h3>EU-Streitschlichtung</h3>
						<p>
							Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:<br>
							<a href="https://ec.europa.eu/consumers/odr/" target="_blank" rel="noopener noreferrer">https://ec.europa.eu/consumers/odr/</a><br>
							Unsere E-Mail-Adresse finden Sie oben im Impressum.
						</p>
						
						<h4>Verbraucherstreitbeilegung / Universalschlichtungsstelle</h4>
						<p>
							Wir sind nicht bereit oder verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.impressum-section {
		padding: 5rem 0;
		background: var(--bg-primary);
		border-top: 1px solid var(--border);
	}

	.impressum-content {
		max-width: 1000px;
		margin: 0 auto;
	}

	.impressum-content h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 3rem;
		text-align: center;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.impressum-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.impressum-block {
		background: var(--bg-secondary);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border);
	}

	.impressum-block.full-width {
		grid-column: 1 / -1;
	}

	.impressum-block h3 {
		font-size: 1.3rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.impressum-block h4 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	.impressum-block p {
		line-height: 1.8;
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}

	.impressum-block p:last-child {
		margin-bottom: 0;
	}

	@media (max-width: 768px) {
		.impressum-section {
			padding: 3rem 0;
		}

		.impressum-content h2 {
			font-size: 2rem;
			margin-bottom: 2rem;
		}

		.impressum-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.impressum-block {
			padding: 1.5rem;
		}
	}
</style>
