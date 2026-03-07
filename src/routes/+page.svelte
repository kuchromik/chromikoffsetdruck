<script>
	import Header from '$lib/components/Header.svelte';
	// import Slider from '$lib/components/Slider.svelte';
	import ContentSection from '$lib/components/ContentSection.svelte';
	import Footer from '$lib/components/Footer.svelte';

	const sections = [
		{
			id: 'thema1',
			title: 'Qualität seit 1990',
			description: 'Herzlich Willkommen, wo Gedrucktes noch handgemacht ist. Jeder Auftrag ist einzigartig und wird sorgfältig bearbeitet. Wir lieben die besonderen Dinge, den außergewöhnlichen Glanz und Gold für alle! Oder Silber. Oder Bronze.<br><br>Gern kümmern wir uns um das, was sonst das fünfte Rad am Wagen ist: Papiere und Kartons mit spannender Haptik, Nummerierungen, Stanzungen, Heißfolien- oder Blindprägungen.',
			reverse: false,
			useSlider: true,
			sliderFolder: 'heroSlider',
			buttons: [
			{ text: 'Zu Fix&günstig', link: '/fixguenstig', variant: 'gray', tooltip: 'Standardprodukte online kalkulieren & direkt bestellen' },
			{ text: 'Zum Extraladen', link: '/extraladen', tooltip: 'Exklusive Premium-Produkte & Veredelungen entdecken' }
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
			description: 'Farben, die im Gedächtnis bleiben! Mit Sonderfarben nach Pantone und HKS verleihen wir Ihren Drucksachen eine Brillanz, die der herkömmliche Vierfarbdruck nicht erreichen kann. Ob leuchtendes Orange, tiefes Violett oder Ihr individueller Firmenfarbon – jeder Auftrag wird mit exakter Farbkonstanz produziert. Heute und morgen, in hunderte oder tausende Exemplaren. nehmen Sie die Intensität der Farben wahr, die nicht verblassen, sondern strahlen - Verlässlichkeit in ihrer schönsten Form.',
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
	<meta name="description" content="Chromik Offsetdruck in Frankfurt (Oder) – Ihr Spezialist für Briefbogen und Visitenkarten in HKS- & Pantone-Sonderfarben. Heißfolienprägung, Blindprägung, Stanzung & edle Spezialpapiere. Qualität seit 1990." />
	<meta name="keywords" content="Offsetdruckerei Frankfurt Oder, Briefbogen drucken, Visitenkarten HKS Pantone, Sonderfarben Offsetdruck, Heißfolienprägung, Blindprägung, Stanzung, Briefpapier drucken, Firmenbriefbogen, Druckerei Frankfurt Oder" />

	<!-- Open Graph -->
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="de_DE" />
	<meta property="og:site_name" content="Chromik Offsetdruck" />
	<meta property="og:title" content="Offsetdruckerei Frankfurt (Oder) | Briefbogen, Visitenkarten & Sonderfarben" />
	<meta property="og:description" content="Chromik Offsetdruck – Briefbogen und Visitenkarten in HKS- & Pantone-Sonderfarben, Heißfolienprägung, Blindprägung und Stanzung. Qualität seit 1990 in Frankfurt (Oder)." />
	<meta property="og:image" content="/logo.png" />
	<meta property="og:url" content="https://chromikoffsetdruck.de/" />

	<!-- JSON-LD: LocalBusiness -->
	{@html `<script type="application/ld+json">${JSON.stringify({
		"@context": "https://schema.org",
		"@type": "LocalBusiness",
		"name": "Chromik Offsetdruck",
		"description": "Offsetdruckerei in Frankfurt (Oder) – spezialisiert auf Briefbogen und Visitenkarten in HKS- und Pantone-Sonderfarben, Heißfolienprägung, Blindprägung, Stanzungen und edle Spezialpapiere. Qualität seit 1990.",
		"url": "https://chromikoffsetdruck.de",
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
				{ "@type": "Offer", "itemOffered": { "@type": "Service", "name": "Heißfolienprägung" } },
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
</style>
