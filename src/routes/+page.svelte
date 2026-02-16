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
			{ text: 'Zum Extraladen', link: '/extraladen', tooltip: 'Exklusive Premium-Produkte & Veredelungen entdecken' },
			{ text: 'Zu Fix&günstig', link: '/fixguenstig', variant: 'gray', tooltip: 'Standardprodukte online kalkulieren & direkt bestellen' }
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
			description: 'Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. Itaque earum rerum hic tenetur a sapiente delectus.',
			reverse: true
		}
	];
</script>
<svelte:head>
	<title>Chromik Offsetdruck - Moderne Drucklösungen</title>
	<meta name="description" content="Professionelle Drucklösungen mit modernster Technologie" />
	
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
