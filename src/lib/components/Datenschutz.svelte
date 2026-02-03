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

<section id="datenschutz" class="datenschutz-section" bind:this={sectionElement}>
	<div class="container">
		{#if visible}
			<div class="datenschutz-content" transition:fly={{ y: 50, duration: 600, delay: 100 }}>
				<h2>Datenschutzerklärung</h2>
				
				<div class="datenschutz-grid">
					<div class="datenschutz-block full-width">
						<h3>1. Datenschutz auf einen Blick</h3>
						<h4>Allgemeine Hinweise</h4>
						<p>
							Die folgenden Hinweise geben einen einfachen Überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können. Ausführliche Informationen zum Thema Datenschutz entnehmen Sie unserer unter diesem Text aufgeführten Datenschutzerklärung.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>2. Verantwortliche Stelle</h3>
						<p>
							Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
						</p>
						<p>
							Chromik Offsetdruck<br>
							Kai-Uwe Chromik<br>
							Marie-Curie-Straße 8<br>
							15236 Frankfurt (Oder)<br><br>
							Telefon: +49 151 5245 7061<br>
							E-Mail: kai.chromik@online.de
						</p>
						<p>
							Verantwortliche Stelle ist die natürliche oder juristische Person, die allein oder gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung von personenbezogenen Daten (z.&nbsp;B. Namen, E-Mail-Adressen o.&nbsp;Ä.) entscheidet.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>3. Datenerfassung auf dieser Website</h3>
						<h4>Server-Log-Dateien</h4>
						<p>
							Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
						</p>
						<ul>
							<li>Browsertyp und Browserversion</li>
							<li>verwendetes Betriebssystem</li>
							<li>Referrer URL</li>
							<li>Hostname des zugreifenden Rechners</li>
							<li>Uhrzeit der Serveranfrage</li>
							<li>IP-Adresse</li>
						</ul>
						<p>
							Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen. Die Erfassung dieser Daten erfolgt auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO. Der Websitebetreiber hat ein berechtigtes Interesse an der technisch fehlerfreien Darstellung und der Optimierung seiner Website – hierzu müssen die Server-Log-Files erfasst werden.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>4. Kontaktaufnahme</h3>
						<p>
							Wenn Sie uns per E-Mail kontaktieren, werden Ihre Angaben inklusive der von Ihnen dort angegebenen Kontaktdaten zwecks Bearbeitung der Anfrage und für den Fall von Anschlussfragen bei uns gespeichert. Diese Daten geben wir nicht ohne Ihre Einwilligung weiter.
						</p>
						<p>
							Die Verarbeitung dieser Daten erfolgt auf Grundlage von Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO, sofern Ihre Anfrage mit der Erfüllung eines Vertrags zusammenhängt oder zur Durchführung vorvertraglicher Maßnahmen erforderlich ist. In allen übrigen Fällen beruht die Verarbeitung auf unserem berechtigten Interesse an der effektiven Bearbeitung der an uns gerichteten Anfragen (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO) oder auf Ihrer Einwilligung (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;a DSGVO) sofern diese abgefragt wurde.
						</p>
						<p>
							Die von Ihnen an uns per Kontaktanfragen übersandten Daten verbleiben bei uns, bis Sie uns zur Löschung auffordern, Ihre Einwilligung zur Speicherung widerrufen oder der Zweck für die Datenspeicherung entfällt (z.&nbsp;B. nach abgeschlossener Bearbeitung Ihrer Anfrage). Zwingende gesetzliche Bestimmungen – insbesondere gesetzliche Aufbewahrungsfristen – bleiben unberührt.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>5. Ihre Rechte als betroffene Person</h3>
						<p>
							Sie haben das Recht:
						</p>
						<ul>
							<li>gemäß Art.&nbsp;15 DSGVO Auskunft über Ihre von uns verarbeiteten personenbezogenen Daten zu verlangen;</li>
							<li>gemäß Art.&nbsp;16 DSGVO unverzüglich die Berichtigung unrichtiger oder Vervollständigung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen;</li>
							<li>gemäß Art.&nbsp;17 DSGVO die Löschung Ihrer bei uns gespeicherten personenbezogenen Daten zu verlangen;</li>
							<li>gemäß Art.&nbsp;18 DSGVO die Einschränkung der Verarbeitung Ihrer personenbezogenen Daten zu verlangen;</li>
							<li>gemäß Art.&nbsp;20 DSGVO Ihre personenbezogenen Daten, die Sie uns bereitgestellt haben, in einem strukturierten, gängigen und maschinenlesebaren Format zu erhalten oder die Übermittlung an einen anderen Verantwortlichen zu verlangen;</li>
							<li>gemäß Art.&nbsp;7 Abs.&nbsp;3 DSGVO Ihre einmal erteilte Einwilligung jederzeit gegenüber uns zu widerrufen;</li>
							<li>gemäß Art.&nbsp;77 DSGVO sich bei einer Aufsichtsbehörde zu beschweren.</li>
						</ul>
					</div>

					<div class="datenschutz-block full-width">
						<h3>6. Widerspruchsrecht</h3>
						<p>
							Sofern Ihre personenbezogenen Daten auf Grundlage von berechtigten Interessen gemäß Art.&nbsp;6 Abs.&nbsp;1 S.&nbsp;1 lit.&nbsp;f DSGVO verarbeitet werden, haben Sie das Recht, gemäß Art.&nbsp;21 DSGVO Widerspruch gegen die Verarbeitung Ihrer personenbezogenen Daten einzulegen, soweit dafür Gründe vorliegen, die sich aus Ihrer besonderen Situation ergeben.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>7. Datensicherheit</h3>
						<p>
							Wir verwenden innerhalb des Website-Besuchs das verbreitete SSL-Verfahren (Secure Socket Layer) in Verbindung mit der jeweils höchsten Verschlüsselungsstufe, die von Ihrem Browser unterstützt wird. In der Regel handelt es sich dabei um eine 256 Bit Verschlüsselung. Falls Ihr Browser keine 256-Bit Verschlüsselung unterstützt, greifen wir stattdessen auf 128-Bit v3 Technologie zurück. Ob eine einzelne Seite unseres Internetauftrittes verschlüsselt übertragen wird, erkennen Sie an der geschlossenen Darstellung des Schüssel- beziehungsweise Schloss-Symbols in der unteren Statusleiste Ihres Browsers.
						</p>
						<p>
							Wir bedienen uns im Übrigen geeigneter technischer und organisatorischer Sicherheitsmaßnahmen, um Ihre Daten gegen zufällige oder vorsätzliche Manipulationen, teilweisen oder vollständigen Verlust, Zerstörung oder gegen den unbefugten Zugriff Dritter zu schützen. Unsere Sicherheitsmaßnahmen werden entsprechend der technologischen Entwicklung fortlaufend verbessert.
						</p>
					</div>

					<div class="datenschutz-block full-width">
						<h3>8. Aktualität und Änderung dieser Datenschutzerklärung</h3>
						<p>
							Diese Datenschutzerklärung ist aktuell gültig und hat den Stand Februar 2026. Durch die Weiterentwicklung unserer Website und Angebote darüber oder aufgrund geänderter gesetzlicher beziehungsweise behördlicher Vorgaben kann es notwendig werden, diese Datenschutzerklärung zu ändern.
						</p>
					</div>
				</div>
			</div>
		{/if}
	</div>
</section>

<style>
	.datenschutz-section {
		padding: 5rem 0;
		background: var(--bg-primary);
		border-top: 1px solid var(--border);
	}

	.datenschutz-content {
		max-width: 1000px;
		margin: 0 auto;
	}

	.datenschutz-content h2 {
		font-size: 2.5rem;
		font-weight: 700;
		margin-bottom: 3rem;
		text-align: center;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.datenschutz-grid {
		display: flex;
		flex-direction: column;
		gap: 2rem;
	}

	.datenschutz-block {
		background: var(--bg-secondary);
		padding: 2rem;
		border-radius: 12px;
		border: 1px solid var(--border);
	}

	.datenschutz-block.full-width {
		width: 100%;
	}

	.datenschutz-block h3 {
		font-size: 1.4rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: var(--text-primary);
	}

	.datenschutz-block h4 {
		font-size: 1.1rem;
		font-weight: 600;
		margin-top: 1.5rem;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
	}

	.datenschutz-block h4:first-of-type {
		margin-top: 0;
	}

	.datenschutz-block p {
		line-height: 1.8;
		color: var(--text-secondary);
		margin-bottom: 1rem;
	}

	.datenschutz-block p:last-child {
		margin-bottom: 0;
	}

	.datenschutz-block ul {
		margin: 1rem 0;
		padding-left: 2rem;
		color: var(--text-secondary);
	}

	.datenschutz-block li {
		line-height: 1.8;
		margin-bottom: 0.5rem;
	}

	@media (max-width: 768px) {
		.datenschutz-section {
			padding: 3rem 0;
		}

		.datenschutz-content h2 {
			font-size: 2rem;
			margin-bottom: 2rem;
		}

		.datenschutz-grid {
			gap: 1.5rem;
		}

		.datenschutz-block {
			padding: 1.5rem;
		}

		.datenschutz-block ul {
			padding-left: 1.5rem;
		}
	}
</style>
