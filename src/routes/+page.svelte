<script>
	import Header from '$lib/components/Header.svelte';
	// import Slider from '$lib/components/Slider.svelte';
	import ContentSection from '$lib/components/ContentSection.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const sections = [
		{
			id: 'thema1',
			title: 'Tradition und Moderne vereint',
			description: 'Jeder Auftrag ist einzigartig und wird sorgfältig bearbeitet. Wir lieben die besonderen Dinge, den außergewöhnlichen Glanz und Gold für alle! Oder Silber. Oder Bronze.<br><br>Gern kümmern wir uns um das, was sonst das fünfte Rad am Wagen ist: Papiere und Kartons mit spannender Haptik, Nummerierungen, Personalisierungen, Stanzungen, Heißfolien- oder Blindprägungen.',
			reverse: false,
			useSlider: true,
			sliderFolder: 'heroSlider',
			buttons: [
			{ text: 'Zu Fix&günstig', link: '/fixguenstig', variant: 'gray', hint: 'Wenn´s schnell gehen soll', tooltip: 'Standardprodukte im Digitaldruck online kalkulieren & direkt bestellen' },
			{ text: 'Zum Extraladen', link: '/extraladen', hint: 'HKS, Pantone und ECHTE Heißfolie', tooltip: 'Produkte im Offsetdruck mit Sonderfarben und Heißfolienprägung online kalkulieren & direkt bestellen' }
			]
		},
		{
			id: 'thema2',
			title: 'Heißfolienprägung',
			description: 'Lassen Sie Ihre Drucksachen strahlen! Mit edler Heißfolienprägung verleihen wir Ihren Projekten den besonderen Glanz, der im Gedächtnis bleibt. Ob glänzendes Gold, elegantes Silber oder schimmerndes Kupfer – jede Prägung ist ein Versprechen von Qualität und Exklusivität. Spüren Sie den Unterschied, wenn Ihre Finger über die geprägte metallische Oberfläche gleiten. Das ist mehr als Druck – das ist Handwerkskunst, die berührt.',
			reverse: true,
			useSlider: true,
			sliderFolder: 'foilSlider'
		},
		{
			id: 'thema3',
			title: 'Blindprägung',
			description: 'Schlichte Eleganz trifft auf fühlbare Raffinesse. Mit Blindprägungen verleihen wir Ihren Drucksachen eine dreidimensionale Tiefe, die ganz ohne Farbe wirkt. Erhabene Konturen spielen mit Licht und Schatten, schaffen subtile Akzente, die den Blick fesseln und die haptisch faszinieren. Spüren Sie die Struktur unter Ihren Fingerspitzen – eine Prägung, die leise spricht, aber nachhaltig beeindruckt.',
			reverse: false,
			useSlider: true,
			sliderFolder: 'blindSlider'
		},
		{
			id: 'thema4',
			title: 'Stanzungen',
			description: 'Formen, die begeistern! Mit präzisen Stanzungen verwandeln wir einfaches Papier in außergewöhnliche Meisterwerke. Ob filigrane Fenster, die neugierig machen, ausgefallene Konturen, die überraschen, oder praktische Registersätze, die überzeugen – jede Stanzung ist ein Versprechen von Kreativität und Perfektion. Erleben Sie, wie aus Ihrer Idee eine greifbare Form wird, die nicht nur gesehen, sondern gefühlt werden will. Von festlichen Adventskalendern bis zu individuellen Karten – wir bringen Ihre Vision in Form.',
			reverse: true,
			useSlider: true,
			sliderFolder: 'cutSlider'
		},
		{
			id: 'thema5',
			title: 'Pantone & HKS',
			description: 'Farben, die im Gedächtnis bleiben! Mit Sonderfarben nach Pantone und HKS verleihen wir Ihren Drucksachen eine Brillanz, die der herkömmliche Vierfarbdruck nicht erreichen kann. Ob leuchtendes Orange, tiefes Violett oder Ihr individueller Firmenfarbton – jeder Auftrag wird mit exakter Farbkonstanz produziert, heute und morgen, in hunderten oder tausenden Exemplaren. Nehmen Sie die Intensität der Farben wahr, die nicht verblassen, sondern strahlen - Verlässlichkeit in ihrer schönsten Form.',
			reverse: false,
			useSlider: true,
			sliderFolder: 'pantoneSlider'
		},
		{
			id: 'thema6',
			title: 'Besondere Materialien',
			description: 'Spüren Sie den Unterschied! In unserer Druckerei arbeiten wir mit einer vielfältigen Auswahl außergewöhnlicher Papiere und Kartons, die nicht nur das Auge, sondern vor allem die Sinne berühren. Von samtig-weichen Naturpapieren über strukturierte Leinenpapiere bis hin zu glänzenden Metallic-Kartons – jedes Material erzählt seine eigene Geschichte. Erleben Sie die faszinierende Haptik von gerippten, geprägten oder handgeschöpften Oberflächen. Lassen Sie sich inspirieren von der Vielfalt der Texturen, Stärken und Finish-Varianten, die Ihre Drucksachen zu echten Unikaten machen.',
			reverse: true,
			useSlider: true,
			sliderFolder: 'paperSlider'
		}
	];
</script>
<svelte:head>
	<title>Offsetdruckerei Frankfurt (Oder) | Briefbogen, Visitenkarten & Sonderfarben – Chromik Offsetdruck</title>
	<link rel="canonical" href="https://www.chromikoffsetdruck.de/" />
	<meta name="description" content="Chromik Offsetdruck in Frankfurt (Oder) – Ihr Spezialist für Briefbogen und Visitenkarten in HKS- & Pantone-Sonderfarben. Heißfolienprägung, Blindprägung, Stanzung & edle Spezialpapiere. Qualität seit 1990." />
	<meta name="keywords" content="Offsetdruckerei Frankfurt Oder, Briefbogen drucken, Visitenkarten HKS Pantone, Sonderfarben Offsetdruck, Heißfolienprägung, Goldprägung, Silberprägung, Kupferprägung, Visitenkarten Goldfolie, Briefbogen Goldprägung, Folienprägung, Blindprägung, Stanzung, Briefpapier drucken, Firmenbriefbogen, Druckerei Frankfurt Oder" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="Chromik Offsetdruck" />
	<meta property="og:title" content="Offsetdruckerei Frankfurt (Oder) | Briefbogen, Visitenkarten & Sonderfarben" />
	<meta property="og:description" content="Chromik Offsetdruck – Briefbogen und Visitenkarten in HKS- & Pantone-Sonderfarben, Heißfolienprägung, Blindprägung und Stanzung. Qualität seit 1990 in Frankfurt (Oder)." />
	<meta property="og:image" content="/logo.png" />
	<meta property="og:url" content="https://www.chromikoffsetdruck.de/" />

	<!-- JSON-LD: LocalBusiness -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"name": "Chromik Offsetdruck",
		"description": "Offsetdruckerei in Frankfurt (Oder) – spezialisiert auf Briefbogen und Visitenkarten in HKS- und Pantone-Sonderfarben, Heißfolienprägung, Blindprägung, Stanzungen und edle Spezialpapiere. Qualität seit 1990.",
		"url": "https://www.chromikoffsetdruck.de",
		"telephone": "+4915152457061",
		"email": "kai.chromik@online.de",
		"address": {
			"@type": "PostalAddress",
			"streetAddress": "Marie-Curie-Straße 8",
			"addressLocality": "Frankfurt (Oder)",
			"postalCode": "15236",
			"addressCountry": "DE"
		},
		"geo": {
			"@type": "GeoCoordinates",
			"latitude": 52.3412,
			"longitude": 14.5507
		},
		"openingHoursSpecification": {
			"@type": "OpeningHoursSpecification",
			"dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
			"opens": "08:00",
			"closes": "17:00"
		},
		"foundingDate": "1990",
		"hasOfferCatalog": {
			"@type": "OfferCatalog",
			"name": "Druckprodukte",
			"itemListElement": [
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Briefbogen in HKS- und Pantone-Sonderfarben" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Visitenkarten in HKS- und Pantone-Sonderfarben" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Plakate mit Abrissperforation DIN A3" } },
					{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Heißfolienprägung in Gold, Silber und Kupfer" } },
					{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Visitenkarten mit Goldprägung" } },
					{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Briefbogen mit Heißfolienprägung" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Blindprägung" } },
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Stanzungen" } }
			]
		}
	})}</script>`}

	<!-- Preload kritischer Ressourcen -->
	<link rel="preload" href="/logo.png" as="image" type="image/png" />

	<!-- Performance Hints -->
	<meta name="theme-color" content="#ffffff" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main id="main-content">
		<!-- <Slider /> -->
		
		{#each sections as section}
			<ContentSection 
				id={section.id}
				title={section.title}
				description={section.description}
				reverse={section.reverse}
				imagePath={section.imagePath}
				useSlider={section.useSlider}
				sliderFolder={section.sliderFolder}
				buttonText={section.buttonText}
				buttonLink={section.buttonLink}
				buttonVariant={section.buttonVariant}
				buttons={section.buttons}
			/>
		{/each}

		<!-- Feature-Strip: Heißfolienprägung online buchbar -->
		<section class="foil-strip" aria-label="Heißfolienprägung jetzt online buchbar">
			<div class="foil-strip-inner">
				<div class="foil-strip-icon" aria-hidden="true">✨</div>
				<div class="foil-strip-content">
					<span class="foil-strip-badge">Jetzt online buchbar</span>
					<h2 class="foil-strip-headline">Hei&szlig;folienpr&auml;gung direkt mitkonfigurieren</h2>
					<p class="foil-strip-copy">Veredeln Sie Ihre Visitenkarten, Karten oder Briefbogen mit edler Gold- oder Silberfolie &ndash; ganz ohne Umwege. Im Extraladen geben Sie einfach die Pr&auml;gefl&auml;che an und der Preis wird sofort berechnet.</p>
				</div>
				<a href="/extraladen" class="foil-strip-btn">Jetzt im Extraladen konfigurieren &rarr;</a>
			</div>
		</section>
	</main>

	<Footer />
</div>

<style>
	.page-wrapper {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
	}

	main {
		flex: 1;
	}

	/* ── Heißfolienprägung Feature-Strip ─────────────────────────── */

	@keyframes foil-shimmer {
		0%   { background-position: -200% center; }
		100% { background-position: 200% center; }
	}

	.foil-strip {
		padding: 3.5rem 1.5rem;
		background: linear-gradient(135deg, #fdf9f0 0%, #fefcf5 40%, #fdf9f0 100%);
		border-top: 2px solid #f9423a;
		border-bottom: 2px solid #f9423a;
		box-shadow: 0 8px 25px rgba(252, 54, 20, 0.15);
		position: relative;
		overflow: hidden;
	}
	.foil-strip::before {
		content: '';
		position: absolute;
		inset: 0;
		background: linear-gradient(105deg,
			transparent 30%,
			rgba(249, 66, 58, 0.08) 45%,
			rgba(250, 85, 78, 0.14) 50%,
			rgba(249, 66, 58, 0.08) 55%,
			transparent 70%);
		background-size: 250% 100%;
		animation: foil-shimmer 4s linear 2;
		pointer-events: none;
	}

	.foil-strip-inner {
		max-width: 1100px;
		margin: 0 auto;
		display: flex;
		align-items: center;
		gap: 2rem;
		position: relative;
		z-index: 1;
	}

	.foil-strip-icon {
		font-size: 2.8rem;
		line-height: 1;
		flex-shrink: 0;
		filter: drop-shadow(0 0 8px rgba(249, 66, 58, 0.45));
	}

	.foil-strip-content {
		flex: 1;
		min-width: 0;
	}

	.foil-strip-badge {
		display: inline-block;
		background: linear-gradient(135deg, #f9423a, #fa554e);
		color: #fff;
		font-size: 0.72rem;
		font-weight: 700;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		padding: 0.2rem 0.65rem;
		border-radius: 20px;
		margin-bottom: 0.6rem;
	}

	.foil-strip-headline {
		margin: 0 0 0.5rem;
		font-size: 1.55rem;
		color: #3a2200;
		font-weight: 700;
		line-height: 1.2;
	}

	.foil-strip-copy {
		margin: 0;
		font-size: 0.95rem;
		color: #7a5c20;
		line-height: 1.55;
	}

	.foil-strip-btn {
		flex-shrink: 0;
		background: linear-gradient(135deg, #f9423a, #fa554e);
		background-size: 200% 100%;
		color: #fff;
		font-weight: 700;
		font-size: 0.95rem;
		padding: 0.85rem 1.5rem;
		border-radius: 8px;
		text-decoration: none;
		white-space: nowrap;
		transition: background-position 0.3s, box-shadow 0.3s;
		box-shadow: 0 8px 25px rgba(252, 54, 20, 0.40);
	}
	.foil-strip-btn:hover {
		background-position: right center;
		box-shadow: 0 10px 30px rgba(252, 54, 20, 0.55);
	}

	@media (max-width: 700px) {
		.foil-strip-inner {
			flex-direction: column;
			text-align: center;
			gap: 1.25rem;
		}
		.foil-strip-btn {
			width: 100%;
			text-align: center;
		}
		.foil-strip-headline { font-size: 1.25rem; }
	}
</style>
