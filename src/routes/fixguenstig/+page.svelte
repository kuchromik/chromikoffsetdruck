<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { PDFDocument } from 'pdf-lib';

	// Produktliste
	const produkte = [
		{ name: 'Visitenkarten', id: 'visitenkarten', grundpreis: 10 },
		{ name: 'Flyer', id: 'flyer', grundpreis: 10 },
		{ name: 'Folder', id: 'folder', grundpreis: 10 },
		{ name: 'Karten', id: 'karten', grundpreis: 10 },
		{ name: 'Klappkarten', id: 'klappkarten', grundpreis: 10 },
		{ name: 'Plakate', id: 'plakate', grundpreis: 10 }
	];

	// Alle verfügbaren Formate mit IDs und Formatfaktoren
	const alleFormate = [
		{ id: 'format-85x55', name: '8,5 x 5,5 cm', formatfaktor: 0.1250, schneideaufwandsfaktor: 13 },
		{ id: 'format-a6', name: 'DIN A6', formatfaktor: 0.2500, schneideaufwandsfaktor: 8 },
		{ id: 'format-a5', name: 'DIN A5', formatfaktor: 0.5000, schneideaufwandsfaktor: 6 },
		{ id: 'format-lang', name: 'DIN lang', formatfaktor: 0.3334, schneideaufwandsfaktor: 7 },
		{ id: 'format-21x21', name: '21 x 21cm', formatfaktor: 1.0000, schneideaufwandsfaktor: 5 },
		{ id: 'format-a4', name: 'DIN A4', formatfaktor: 1.0000, schneideaufwandsfaktor: 5 },
		{ id: 'format-a3', name: 'DIN A3', formatfaktor: 2, schneideaufwandsfaktor: 4 }
	];

	// Alle verfügbaren Materialien mit IDs und Materialfaktoren
	// Der Materialfaktor gibt den Preis je Bogen A3+ an
	const alleMaterialien = [
		{ id: 'mat-senglatt308', name: 'Senator glatt 308 g/m²', materialfaktor: 0.25, beschreibung: 'Hochwertiger weißer Karton mit glatter Oberfläche, ideal für edle Visitenkarten und Einladungen.' },
		{ id: 'mat-senlein246', name: 'Senator leinen 246 g/m²', materialfaktor: 0.20, beschreibung: 'Hochwertiger weißer Karton mit feiner Leinenstruktur, ideal für edle Visitenkarten und Einladungen.' },
		{ id: 'mat-conqwovewhite300', name: 'Conqueror naturweiß 300 g/m²', materialfaktor: 0.25, beschreibung: 'Hochwertiger naturweißer Karton mit matter Oberfläche, ideal für edle Visitenkarten und Einladungen.' },
		{ id: 'mat-sopor350', name: 'Soporset 350 g/m²', materialfaktor: 0.14, beschreibung: 'Fester hochweißer Karton mit leicht rauer Oberfläche.' },
		{ id: 'mat-bild300', name: 'Bilderdruck matt 300 g/m²', materialfaktor: 0.11, beschreibung: 'Klassischer matter Bilderdruckkarton, vielseitig einsetzbar mit sehr guter Farbwiedergabe.' },
		{ id: 'mat-bild350', name: 'Bilderdruck matt 350 g/m²', materialfaktor: 0.13, beschreibung: 'Stärkerer Bilderdruckkarton mit matter Oberfläche, besonders stabil und hochwertig.' },
		{ id: 'mat-bild135', name: 'Bilderdruck matt 135 g/m²', materialfaktor: 0.04, beschreibung: 'Leichtes Papier für Flyer und Folder, wirtschaftlich mit sehr guter Farbwiedergabe.' },
		{ id: 'mat-bild170', name: 'Bilderdruck matt 170 g/m²', materialfaktor: 0.05, beschreibung: 'Mittleres Papier für Flyer und Folder, wirtschaftlich mit sehr guter Farbwiedergabe.' }
	];

	// Alle verfügbaren Umfänge mit IDs und Flächenfaktoren
	const alleUmfaenge = [
		{ id: 'umfang-1s', name: '1-seitig', flaechenfaktor: 0.5 },
		{ id: 'umfang-2s', name: '2-seitig', flaechenfaktor: 1.0 },
		{ id: 'umfang-4s', name: '4-seitig', flaechenfaktor: 2.0 },
		{ id: 'umfang-6s', name: '6-seitig', flaechenfaktor: 4.0 }
	];

	// Formatspezifische Abweichungen für Flächenfaktoren
	const formatUmfangAbweichungen = {
		'DIN lang': {
			'4-seitig': 3.0,
			'6-seitig': 3.0
		}
	};

	// Produktzentrische Konfiguration (verwendet IDs)
	const produktKonfiguration = {
		visitenkarten: {
			formate: ['format-85x55'],
			materialien: ['mat-senglatt308','mat-senlein246', 'mat-conqwovewhite300', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
			umfaenge: {
				'1-seitig': true, // für alle Formate verfügbar
				'2-seitig': true // für alle Formate verfügbar
			}
		},
		flyer: {
			formate: ['format-a6', 'format-a5', 'format-lang', 'format-21x21', 'format-a4', 'format-a3'],
			materialien: ['mat-bild135', 'mat-bild170'],
			umfaenge: {
				'1-seitig': true, // für alle Formate verfügbar
				'2-seitig': true // für alle Formate verfügbar
			}
		},
		folder: {
			formate: ['format-a6', 'format-a5', 'format-lang', 'format-21x21', 'format-a4'],
			materialien: ['mat-bild135', 'mat-bild170'],
			umfaenge: {
				'4-seitig': true, // für alle Formate verfügbar
				'6-seitig': ['format-a6', 'format-a5', 'format-lang'] // nur für diese Formate
			}
		},
		karten: {
			formate: ['format-a6', 'format-a5', 'format-lang', 'format-21x21', 'format-a4', 'format-a3'],
			materialien: ['mat-senglatt308','mat-senlein246', 'mat-conqwovewhite300', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
			umfaenge: {
				'1-seitig': true, // für alle Formate verfügbar
				'2-seitig': true // für alle Formate verfügbar
			}
		},
		klappkarten: {
			formate: ['format-a6', 'format-a5', 'format-lang', 'format-21x21', 'format-a4', 'format-a3'],
			materialien: ['mat-senglatt308','mat-senlein246', 'mat-conqwovewhite300', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
			umfaenge: {
				'4-seitig': true, // für alle Formate verfügbar
				'6-seitig': ['format-a6', 'format-a5', 'format-lang'] // nur für diese Formate
			}
		},
		plakate: {
			formate: ['format-a4', 'format-a3'],
			materialien: ['mat-bild135', 'mat-bild170'],
			umfaenge: {
				'1-seitig': true, // für alle Formate verfügbar
				'2-seitig': true // für alle Formate verfügbar
			}
		}
	};

	// Hilfsfunktionen zum Abrufen der Datenobjekte
	function getFormatData(formatName) {
		return alleFormate.find(f => f.name === formatName);
	}

	function getMaterialData(materialName) {
		return alleMaterialien.find(m => m.name === materialName);
	}

	function getUmfangData(umfangName) {
		return alleUmfaenge.find(u => u.name === umfangName);
	}

	// Hilfsfunktion zur Ermittlung des Flächenfaktors (berücksichtigt Format-Abweichungen)
	function getFlaechenfaktor(formatName, umfangName) {
		// Prüfe ob formatspezifische Abweichung existiert
		if (formatUmfangAbweichungen[formatName]?.[umfangName]) {
			return formatUmfangAbweichungen[formatName][umfangName];
		}
		// Sonst Standard-Flächenfaktor verwenden
		const umfangData = getUmfangData(umfangName);
		return umfangData?.flaechenfaktor || 1.0;
	}

	// Kostenvariablen (Platzhalter-Werte, werden später angepasst)
	const klickkosten = 0.1; // Kosten pro Klick
	const kostenJeSchnitt = 0.5; // Kosten je Schnitt
	const mehrwertsteuer = 0.19; // Mehrwertsteuer 19%
	const maxKlick = 500; // Maximale Klickanzahl aus wirtschaftlichen Gründen
	const grundpreisFalzen4Seitig = 5; // Grundpreis Falzen 4-seitig
	const grundpreisFalzen6Seitig = 5; // Grundpreis Falzen 6-seitig
	const grundpreisRillen4Seitig = 3; // Grundpreis Rillen 4-seitig
	const grundpreisRillen6Seitig = 5; // Grundpreis Rillen 6-seitig
	const kostenJeStueckFalzen = 0.01; // Kosten je Stück beim Falzen
	const kostenJeStueckRillen4Seitig = 0.05; // Kosten je Stück beim Rillen 4-seitig
	const kostenJeStueckRillen6Seitig = 0.09; // Kosten je Stück beim Rillen 6-seitig

	// Preisberechnungsfunktion
	function berechneGesamtpreis() {
		const produktData = produkte.find(p => p.id === produktId);
		const formatData = getFormatData(format);
		const materialData = getMaterialData(material);
		const umfangData = umfang ? getUmfangData(umfang) : null;

		if (!produktData || !formatData || !materialData) return null;

		// Grundpreis
		const grundpreis = produktData.grundpreis;

		// Ermittle Flächenfaktor (berücksichtigt Format-Umfang-Kombinationen)
		const flaechenfaktor = getFlaechenfaktor(format, umfang);

		// Berechne Anzahl Druckbogen: 
		// Bei 1-seitigen Produkten: Auflage × Formatfaktor × Flächenfaktor (nicht durch 2 teilen)
		// Bei mehrseitigen Produkten: (Auflage × Formatfaktor × Flächenfaktor) / 2 (beide Seiten nutzbar)
		const ist1Seitig = umfang === '1-seitig' || !umfang; // Wenn kein Umfang angegeben, nehmen wir 1-seitig an
		const anzahlDruckbogen = ist1Seitig 
			? Math.ceil(auflage * formatData.formatfaktor * flaechenfaktor)
			: Math.ceil((auflage * formatData.formatfaktor * flaechenfaktor) / 2);

		// Berechne Klickanzahl: Auflage × Formatfaktor × Flächenfaktor (aufgerundet)
		const klickanzahl = Math.ceil(auflage * formatData.formatfaktor * flaechenfaktor);

		// Berechne Druckkosten: Klickanzahl × Klickkosten
		const berechneDruckkosten = klickanzahl * klickkosten;

		// Berechne Materialkosten: Anzahl Druckbogen × Materialfaktor
		const berechneMaterialkosten = anzahlDruckbogen * materialData.materialfaktor;

		// Berechne Schneidekosten: Kosten je Schnitt × Schneideaufwandsfaktor
		const berechneSchneidekosten = kostenJeSchnitt * formatData.schneideaufwandsfaktor;

		// Zusätzliche produktspezifische Kosten
		let zusatzkosten = 0;
		let zusatzkostenName = '';

		if (produktId === 'folder') {
			// Bestimme Falzkosten basierend auf dem Umfang
			let grundpreisFalzen = 0;
			if (umfang === '4-seitig') {
				grundpreisFalzen = grundpreisFalzen4Seitig;
			} else if (umfang === '6-seitig') {
				grundpreisFalzen = grundpreisFalzen6Seitig;
			}
			// Falzkosten = Grundpreis + (Auflage * Kosten je Stück)
			zusatzkosten = grundpreisFalzen + (auflage * kostenJeStueckFalzen);
			zusatzkostenName = 'Falzkosten';
		} else if (produktId === 'klappkarten') {
			// Bestimme Rillkosten basierend auf dem Umfang
			let grundpreisRillen = 0;
			let kostenJeStueckRillen = 0;
			if (umfang === '4-seitig') {
				grundpreisRillen = grundpreisRillen4Seitig;
				kostenJeStueckRillen = kostenJeStueckRillen4Seitig;
			} else if (umfang === '6-seitig') {
				grundpreisRillen = grundpreisRillen6Seitig;
				kostenJeStueckRillen = kostenJeStueckRillen6Seitig;
			}
			// Rillkosten = Grundpreis + (Auflage * Kosten je Stück)
			zusatzkosten = grundpreisRillen + (auflage * kostenJeStueckRillen);
			zusatzkostenName = 'Rillkosten';
		}

		// Gesamtpreis
		const gesamtpreisNetto = grundpreis + berechneDruckkosten + berechneMaterialkosten + berechneSchneidekosten + zusatzkosten;
		const mwstBetrag = gesamtpreisNetto * mehrwertsteuer;
		const gesamtpreisBrutto = gesamtpreisNetto + mwstBetrag;

		return {
			grundpreis,
			druckkosten: berechneDruckkosten,
			materialkosten: berechneMaterialkosten,
			schneidekosten: berechneSchneidekosten,
			zusatzkosten,
			zusatzkostenName,
			gesamtpreisNetto,
			mwstBetrag,
			gesamtpreisBrutto,
			anzahlDruckbogen,
			klickanzahl,
			// Detaillierte Faktoren für transparente Darstellung
			faktoren: {
				klickkosten,
				formatfaktor: formatData.formatfaktor,
				flaechenfaktor,
				materialfaktor: materialData.materialfaktor,
				schneideaufwandsfaktor: formatData.schneideaufwandsfaktor,
				kostenJeSchnitt,
				auflage
			}
		};
	}

	// Eingabewerte
	let produktId = $state('');
	let auflage = $state('');
	let material = $state('');
	let format = $state('');
	let umfang = $state('');
	let falzart = $state('');
	let ergebnis = $state('');
	let zeigErgebnis = $state(false);

	// Bestellprozess
	let zeigeBestellformular = $state(false);
	let preisBerechnung = $state(null);
	let bestellStatus = $state(''); // '', 'sending', 'success', 'error'
	let verarbeitungsSchritt = $state(0); // Aktueller Schritt für Fortschrittsanzeige

	// E-Mail-Verifizierung
	let emailVerifiziert = $state(false);
	let verifiedEmail = $state('');
	let existingCustomerId = $state(null);
	let zeigeEmailVerifizierung = $state(false);
	let emailVerifikationStatus = $state(''); // '', 'sending', 'sent', 'error', 'verifying'
	let emailZurVerifizierung = $state('');

	// Kundendaten
	let kundenDaten = $state({
		vorname: '',
		nachname: '',
		firma: '',
		strasse: '',
		plz: '',
		ort: '',
		email: '',
		datenschutz: false
	});

	// PDF-Uploads und Auftragsname
	let pdfDateien = $state([]);
	let pdfSeitenInfo = $state(null);
	let fileInputElement = $state(null);
	let auftragsname = $state('');
	
	// Lieferung/Abholung
	let lieferart = $state(''); // 'abholung' oder 'versand'
	let lieferadresseGleichRechnungsadresse = $state(true);
	let lieferadresse = $state({
		name: '',
		strasse: '',
		plz: '',
		ort: ''
	});
	
	// Versandadressen-Verwaltung
	let vorhandeneVersandadressen = $state([]);
	let gewaehlteAdresseId = $state('neu'); // 'neu' oder eine Adress-ID
	let versandadressenGeladen = $state(false);
	
	// Versandkosten
	const versandkostenNetto = 5.90;
	const versandkostenBrutto = versandkostenNetto * (1 + mehrwertsteuer);

	// Verfügbare Falzarten
	const alleFalzarten = ['Wickelfalz', 'Zickzackfalz'];

	// Gefilterte Optionen basierend auf gewähltem Produkt (gibt Objekte zurück)
	let verfuegbareMaterialien = $derived(
		produktId && produktKonfiguration[produktId] 
			? produktKonfiguration[produktId].materialien
				.map(id => alleMaterialien.find(m => m.id === id))
				.filter(Boolean)
				.sort((a, b) => {
					// Extrahiere Flächengewicht aus ID (z.B. 308 aus 'mat-opal308')
					const gewichtA = parseInt(a.id.match(/\d+$/)?.[0] || '0');
					const gewichtB = parseInt(b.id.match(/\d+$/)?.[0] || '0');
					return gewichtA - gewichtB;
				})
			: []
	);

	let verfuegbareFormate = $derived(
		produktId && produktKonfiguration[produktId] 
			? produktKonfiguration[produktId].formate.map(id => alleFormate.find(f => f.id === id)).filter(Boolean)
			: []
	);

	let verfuegbareUmfaenge = $derived.by(() => {
		if (!produktId || !produktKonfiguration[produktId]?.umfaenge) return [];
		
		const umfaengeConfig = produktKonfiguration[produktId].umfaenge;
		const verfuegbar = [];
		
		for (const [umfangName, wert] of Object.entries(umfaengeConfig)) {
			// Wenn wert === true, ist Umfang für alle Formate verfügbar
			if (wert === true) {
				verfuegbar.push(umfangName);
			} 
			// Wenn wert ein Array ist, nur für diese Formate verfügbar (Array enthält Format-IDs)
			else if (Array.isArray(wert)) {
				// Hole Format-ID aus dem aktuellen Format-Namen
				const formatData = getFormatData(format);
				if (!format || (formatData && wert.includes(formatData.id))) {
					verfuegbar.push(umfangName);
				}
			}
		}
		
		return verfuegbar;
	});

	// Prüfen ob Umfang-Feld angezeigt werden soll
	let zeigeUmfang = $derived(
		produktId && produktKonfiguration[produktId]?.umfaenge !== undefined
	);

	// Prüfen ob Falzart-Feld angezeigt werden soll (nur bei folder/klappkarten mit 6-seitigem Umfang)
	let zeigeFalzart = $derived(
		(produktId === 'folder' || produktId === 'klappkarten') && umfang === '6-seitig'
	);

	// Produktname für Anzeige
	let produktName = $derived(
		produktId ? produkte.find(p => p.id === produktId)?.name || '' : ''
	);

	// Format-Label (produktspezifisch)
	let formatLabel = $derived(
		produktId === 'folder' || produktId === 'klappkarten' ? 'Format (geschlossen)' : 'Format'
	);

	// Materialbeschreibung für gewähltes Material
	let materialBeschreibung = $derived(
		material ? getMaterialData(material)?.beschreibung || '' : ''
	);

	// Berechne maximale Auflage basierend auf maxKlick
	// Formel: klickanzahl = auflage * formatfaktor * flaechenfaktor
	// Also: maxAuflage = maxKlick / (formatfaktor * flaechenfaktor)
	let maxAuflage = $derived.by(() => {
		if (!format) return null;
		if (zeigeUmfang && !umfang) return null;
		
		const formatData = getFormatData(format);
		if (!formatData) return null;
		
		const flaechenfaktor = zeigeUmfang ? getFlaechenfaktor(format, umfang) : 1.0;
		const maxAufl = Math.floor(maxKlick / (formatData.formatfaktor * flaechenfaktor));
		
		return maxAufl;
	});

	// Zeige Hinweis zur maximalen Auflage
	let zeigeMaxAuflageHinweis = $derived(
		format && (!zeigeUmfang || umfang) && maxAuflage !== null
	);

	// Werte zurücksetzen, wenn sie für neues Produkt nicht verfügbar sind
	$effect(() => {
		if (produktId) {
			// Material prüfen (material enthält Namen, verfuegbareMaterialien enthält Objekte)
			if (material && !verfuegbareMaterialien.some(m => m.name === material)) {
				material = '';
			}
			// Format prüfen (format enthält Namen, verfuegbareFormate enthält Objekte)
			if (format && !verfuegbareFormate.some(f => f.name === format)) {
				format = '';
			}
			// Umfang zurücksetzen wenn Format sich ändert und nicht mehr gültig
			if (umfang && format && verfuegbareUmfaenge.length > 0 && !verfuegbareUmfaenge.includes(umfang)) {
				umfang = '';
			}
			// Falzart zurücksetzen wenn sie nicht mehr angezeigt werden soll
			if (falzart && !zeigeFalzart) {
				falzart = '';
			}
		}
	});

	function waehleProdukt(id) {
		produktId = id;
		zeigErgebnis = false;
	}

	function berechneErgebnis(e) {
		e.preventDefault();
		// Prüfe ob alle Pflichtfelder ausgefüllt sind
		const pflichtfelderAusgefuellt = produktId && auflage && material && format && (!zeigeUmfang || umfang) && (!zeigeFalzart || falzart);
		
		if (!pflichtfelderAusgefuellt) {
			ergebnis = 'Bitte füllen Sie alle Felder aus.';
		} else {
			// Hole die Datenobjekte mit Preisfaktoren
			const formatData = getFormatData(format);
			const materialData = getMaterialData(material);
			const umfangData = umfang ? getUmfangData(umfang) : null;
			
			// Berechne Gesamtpreis und speichere für Bestellprozess
			preisBerechnung = berechneGesamtpreis();

			let ergebnisText = `
				<strong>Ihre Auswahl:</strong><br>
				<strong>Produkt:</strong> ${produktName}<br>
				<strong>Format:</strong> ${format}<br>`;
			
			if (zeigeUmfang && umfangData) {
				ergebnisText += `<strong>Umfang:</strong> ${umfang}<br>`;
			}
			
			ergebnisText += `
				<strong>Auflage:</strong> ${auflage} Stück<br>
				<strong>Material:</strong> ${material}<br><br>
				<div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid currentColor;">
					<div style="margin-bottom: 0.5rem;">Gesamtpreis (netto): ${preisBerechnung.gesamtpreisNetto.toFixed(2)} €</div>
					<div style="margin-bottom: 0.75rem; font-size: 0.95em;">zzgl. 19% MwSt.: ${preisBerechnung.mwstBetrag.toFixed(2)} €</div>
					<strong style="font-size: 1.2em;">Gesamtpreis (brutto): ${preisBerechnung.gesamtpreisBrutto.toFixed(2)} €</strong>
				</div>
			`;
			ergebnis = ergebnisText;
		}
		zeigErgebnis = true;
		
		// Smooth scroll zum Ergebnis-Button nach kurzer Verzögerung
		setTimeout(() => {
			const resultBox = document.querySelector('.result-box');
			if (resultBox) {
				resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
			}
		}, 100);
	}

	function zurücksetzen() {
		auflage = '';
		material = '';
		format = '';
		umfang = '';
		falzart = '';
		ergebnis = '';
		zeigErgebnis = false;
		zeigeBestellformular = false;
	}

	function startBestellprozess() {
		// Prüfen ob E-Mail bereits verifiziert ist
		if (!emailVerifiziert) {
			// Zeige E-Mail-Verifizierung an
			zeigeEmailVerifizierung = true;
			emailVerifikationStatus = '';
		} else {
			// E-Mail bereits verifiziert - zeige direkt Bestellformular
			zeigeBestellformular = true;
		}
		
		// Smooth scroll zum Formular nach kurzer Verzögerung
		setTimeout(() => {
			const target = document.querySelector('.email-verification-box, .order-form-box');
			if (target) {
				target.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	// Lade Versandadressen für existierenden Kunden
	async function ladeVersandadressen() {
		if (!existingCustomerId || versandadressenGeladen) {
			return;
		}
		
		try {
			const response = await fetch(`/api/get-shipment-addresses?customerId=${existingCustomerId}`);
			const result = await response.json();
			
			if (result.success) {
				vorhandeneVersandadressen = result.addresses || [];
				versandadressenGeladen = true;
				console.log(`✓ ${vorhandeneVersandadressen.length} Versandadresse(n) geladen`);
			} else {
				console.error('Fehler beim Laden der Versandadressen:', result.error);
			}
		} catch (error) {
			console.error('Fehler beim Laden der Versandadressen:', error);
		}
	}
	
	// Effekt: Lade Versandadressen wenn Kunde identifiziert wird und Versand gewählt ist
	$effect(() => {
		if (existingCustomerId && lieferart === 'versand' && !lieferadresseGleichRechnungsadresse && !versandadressenGeladen) {
			ladeVersandadressen();
		}
	});
	
	// Wenn eine vorhandene Adresse ausgewählt wird, fülle die Felder
	$effect(() => {
		if (gewaehlteAdresseId && gewaehlteAdresseId !== 'neu') {
			const adresse = vorhandeneVersandadressen.find(a => a.id === gewaehlteAdresseId);
			if (adresse) {
				lieferadresse = {
					name: adresse.data.name,
					strasse: adresse.data.street,
					plz: adresse.data.zip,
					ort: adresse.data.city
				};
			}
		} else if (gewaehlteAdresseId === 'neu') {
			// Felder leeren für neue Adresse
			lieferadresse = {
				name: '',
				strasse: '',
				plz: '',
				ort: ''
			};
		}
	});

	async function sendeEmailVerifizierung() {
		if (!emailZurVerifizierung || !emailZurVerifizierung.includes('@')) {
			alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
			return;
		}

		emailVerifikationStatus = 'sending';

		try {
			// Erstelle orderState zum Speichern
			const orderState = {
				produktId,
				produktName,
				auflage,
				material,
				format,
				umfang,
				falzart,
				preisBerechnung
			};
			
			const response = await fetch('/api/verify-email', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ 
					email: emailZurVerifizierung,
					orderState: orderState
				})
			});

			if (response.ok) {
				emailVerifikationStatus = 'sent';
			} else {
				emailVerifikationStatus = 'error';
			}
		} catch (error) {
			console.error('Fehler beim Senden der E-Mail-Verifizierung:', error);
			emailVerifikationStatus = 'error';
		}
	}

	// Beim Laden der Seite prüfen, ob ein E-Mail-Token im URL ist
	onMount(async () => {
		const emailToken = $page.url.searchParams.get('emailToken');
		
		if (emailToken) {
			emailVerifikationStatus = 'verifying';
			
			try {
				const response = await fetch('/api/check-verified-email', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ token: emailToken })
				});

				const result = await response.json();

				if (result.success) {
					// E-Mail wurde verifiziert
					emailVerifiziert = true;
					verifiedEmail = result.email;
					kundenDaten.email = result.email;
					
					// Wenn Kundendaten existieren, Formular vorausfüllen
					if (result.customerExists && result.customerData) {
						existingCustomerId = result.customerId;
						kundenDaten.vorname = result.customerData.firstName || '';
						kundenDaten.nachname = result.customerData.lastName || '';
						kundenDaten.firma = result.customerData.company || '';
						kundenDaten.strasse = result.customerData.address || '';
						kundenDaten.plz = result.customerData.zip || '';
						kundenDaten.ort = result.customerData.city || '';
					}
					
					// Stelle Bestellzustand aus Server-Response wieder her
					if (result.orderState) {
						try {
							const orderState = result.orderState;
							produktId = orderState.produktId;
							auflage = orderState.auflage;
							material = orderState.material;
							format = orderState.format;
							umfang = orderState.umfang;
							falzart = orderState.falzart;
							preisBerechnung = orderState.preisBerechnung;
							
							// Zeige Ergebnis und Bestellformular
							zeigErgebnis = true;
							zeigeBestellformular = true;
							
							console.log('✓ Bestellzustand wiederhergestellt:', orderState);
						} catch (e) {
							console.error('Fehler beim Wiederherstellen des Bestellzustands:', e);
						}
					}
					
					emailVerifikationStatus = '';
					
					// Entferne Token aus URL
					const url = new URL(window.location.href);
					url.searchParams.delete('emailToken');
					window.history.replaceState({}, '', url);
					
					// Scroll zum Bestellformular falls vorhanden, sonst zur Produktauswahl
					setTimeout(() => {
						const orderForm = document.querySelector('.order-form-box');
						const productSection = document.querySelector('.product-selection');
						const target = orderForm || productSection;
						if (target) {
							target.scrollIntoView({ behavior: 'smooth', block: 'start' });
						}
					}, 500);
					
				} else {
					emailVerifikationStatus = 'error';
					alert('E-Mail-Verifizierung fehlgeschlagen: ' + (result.error || 'Unbekannter Fehler'));
				}
			} catch (error) {
				console.error('Fehler bei E-Mail-Verifizierung:', error);
				emailVerifikationStatus = 'error';
				alert('Fehler bei der E-Mail-Verifizierung. Bitte versuchen Sie es erneut.');
			}
		}
	});

	function abbrechenBestellung() {
		// Komplett zurücksetzen - zurück zur Produktauswahl
		produktId = '';
		auflage = '';
		material = '';
		format = '';
		umfang = '';
		falzart = '';
		ergebnis = '';
		zeigErgebnis = false;
		zeigeBestellformular = false;
		zeigeEmailVerifizierung = false;
		preisBerechnung = null;
		bestellStatus = '';
		
		// E-Mail-Verifizierung zurücksetzen
		emailVerifiziert = false;
		verifiedEmail = '';
		existingCustomerId = null;
		emailVerifikationStatus = '';
		emailZurVerifizierung = '';
		
		// Kundendaten zurücksetzen
		kundenDaten = {
			vorname: '',
			nachname: '',
			firma: '',
			strasse: '',
			plz: '',
			ort: '',
			email: '',
			datenschutz: false
		};
		
		// PDF-Dateien und Auftragsname zurücksetzen
		pdfDateien = [];
		pdfSeitenInfo = null;
		auftragsname = '';
		if (fileInputElement) {
			fileInputElement.value = '';
		}
		
		// Lieferoptionen zurücksetzen
		lieferart = '';
		lieferadresseGleichRechnungsadresse = true;
		lieferadresse = {
			name: '',
			strasse: '',
			plz: '',
			ort: ''
		};
		
		// Versandadressen zurücksetzen
		vorhandeneVersandadressen = [];
		gewaehlteAdresseId = 'neu';
		versandadressenGeladen = false;
	}

	async function handleFileChange(event) {
		const files = Array.from(event.target.files || []);
		
		// Validierung: Nur 1 Datei, nur PDFs, max 10MB
		const validFiles = files.filter(file => {
			if (file.type !== 'application/pdf') {
				alert(`"${file.name}" ist keine PDF-Datei und wurde ignoriert.`);
				return false;
			}
			if (file.size > 10 * 1024 * 1024) { // 10MB
				alert(`"${file.name}" ist zu groß (max. 10MB).`);
				return false;
			}
			return true;
		}).slice(0, 1); // Nur 1 Datei erlauben
		
		if (validFiles.length > 0) {
			const file = validFiles[0];
			
			// PDF-Seitenzahl ermitteln
			try {
				const arrayBuffer = await file.arrayBuffer();
				const pdfDoc = await PDFDocument.load(arrayBuffer);
				const pageCount = pdfDoc.getPageCount();
				
				// Hinweis basierend auf Umfang und Seitenzahl
				const ist1Seitig = umfang === '1-seitig';
				let hinweisText = '';
				let hinweisTyp = 'info'; // 'success', 'warning', 'info'
				
				if (ist1Seitig && pageCount !== 1) {
					hinweisTyp = 'warning';
					hinweisText = `⚠️ Ihre PDF hat ${pageCount} Seiten. Für 1-seitige Produkte muss die PDF genau 1 Seite enthalten.`;
				} else if (!ist1Seitig && pageCount !== 2) {
					hinweisTyp = 'warning';
					hinweisText = `⚠️ Ihre PDF hat ${pageCount} Seite${pageCount !== 1 ? 'n' : ''}. Für mehrseitige Produkte muss die PDF genau 2 Seiten enthalten ( und Rückseite).`;
				} else {
					hinweisTyp = 'success';
					if (ist1Seitig) {
						hinweisText = `✓ PDF mit 1 Seite hochgeladen – perfekt für 1-seitige Produkte.`;
					} else {
						hinweisText = `✓ PDF mit 2 Seiten hochgeladen – perfekt für mehrseitige Produkte.`;
					}
				}
				
				pdfSeitenInfo = { pageCount, hinweisText, hinweisTyp };
				
			} catch (error) {
				console.error('Fehler beim Lesen der PDF:', error);
				pdfSeitenInfo = { 
					pageCount: 0, 
					hinweisText: '⚠️ Die PDF-Datei konnte nicht gelesen werden.', 
					hinweisTyp: 'warning' 
				};
			}
		}
		
		pdfDateien = validFiles;
	}

	function entferneDatei(index) {
		pdfDateien = pdfDateien.filter((_, i) => i !== index);
		if (fileInputElement && pdfDateien.length === 0) {
			fileInputElement.value = '';
			pdfSeitenInfo = null;
		}
	}

	async function sendeBestellung(e) {
		e.preventDefault();
		bestellStatus = 'sending';
		verarbeitungsSchritt = 0;

		// Simuliere Fortschritt (da wir keinen Feedback vom Server haben)
		const progressInterval = setInterval(() => {
			if (verarbeitungsSchritt < 4) {
				verarbeitungsSchritt++;
			}
		}, 1500); // Alle 1.5 Sekunden ein Schritt

		try {
			// Ermittle finalen Auftragsnamen
			let finalerAuftragsname = auftragsname.trim();
			if (!finalerAuftragsname && pdfDateien.length > 0) {
				// Verwende PDF-Namen ohne .pdf Suffix
				finalerAuftragsname = pdfDateien[0].name.replace(/\.pdf$/i, '');
			}
			if (!finalerAuftragsname) {
				finalerAuftragsname = `${produktName} - ${new Date().toLocaleDateString('de-DE')}`;
			}
			
			// Berechne Versandkosten wenn Versand gewählt
			const versandkosten = lieferart === 'versand' ? {
				netto: versandkostenNetto,
				mwst: versandkostenNetto * mehrwertsteuer,
				brutto: versandkostenBrutto
			} : null;
			
			// Berechne Gesamtpreis inklusive Versand
			const gesamtpreisNettoMitVersand = preisBerechnung.gesamtpreisNetto + (versandkosten ? versandkosten.netto : 0);
			const mwstBetragMitVersand = preisBerechnung.mwstBetrag + (versandkosten ? versandkosten.mwst : 0);
			const gesamtpreisBruttoMitVersand = preisBerechnung.gesamtpreisBrutto + (versandkosten ? versandkosten.brutto : 0);
			
			// Verwende FormData für Datei-Upload
			const formData = new FormData();
			
			// Bestelldaten als JSON-String hinzufügen
			const bestellDaten = {
				auftragsname: finalerAuftragsname,
				produktInfo: {
					produkt: produktName,
					format: format,
					umfang: umfang || '-',
					falzart: falzart || '-',
					auflage: auflage,
					material: material
				},
				preise: {
					anzahlDruckbogen: preisBerechnung.anzahlDruckbogen,
					klickanzahl: preisBerechnung.klickanzahl,
					grundpreis: preisBerechnung.grundpreis,
					druckkosten: preisBerechnung.druckkosten,
					materialkosten: preisBerechnung.materialkosten,
					schneidekosten: preisBerechnung.schneidekosten,
					zusatzkosten: preisBerechnung.zusatzkosten,
					zusatzkostenName: preisBerechnung.zusatzkostenName,
					gesamtpreisNetto: preisBerechnung.gesamtpreisNetto,
					mwstBetrag: preisBerechnung.mwstBetrag,
					gesamtpreisBrutto: preisBerechnung.gesamtpreisBrutto,
					versandkosten: versandkosten,
					gesamtpreisNettoMitVersand: gesamtpreisNettoMitVersand,
					mwstBetragMitVersand: mwstBetragMitVersand,
					gesamtpreisBruttoMitVersand: gesamtpreisBruttoMitVersand
				},
				kunde: kundenDaten,
				lieferung: {
					art: lieferart,
					rechnungsadresse: lieferart === 'abholung' ? null : {
						strasse: kundenDaten.strasse,
						plz: kundenDaten.plz,
						ort: kundenDaten.ort
					},
					lieferadresse: (lieferart === 'versand' && !lieferadresseGleichRechnungsadresse) ? lieferadresse : null
				}
			};
			
			formData.append('data', JSON.stringify(bestellDaten));
			
			// ExistingCustomerId hinzufügen (wenn vorhanden)
			formData.append('existingCustomerId', existingCustomerId || 'null');
			
			// PDF-Dateien hinzufügen
			pdfDateien.forEach((file, index) => {
				formData.append(`pdf${index}`, file);
			});

			// API-Route aufrufen (verarbeitet Bestellung direkt, da E-Mail bereits verifiziert)
			const response = await fetch('/api/submit-verified-order', {
				method: 'POST',
				body: formData // Kein Content-Type Header - wird automatisch gesetzt
			});

			clearInterval(progressInterval);
			verarbeitungsSchritt = 5; // Abgeschlossen

			if (response.ok) {
				bestellStatus = 'success';
			} else {
				bestellStatus = 'error';
			}
		} catch (error) {
			console.error('Fehler beim Senden der Bestellung:', error);
			clearInterval(progressInterval);
			bestellStatus = 'error';
		}
	}
</script>

<svelte:head>
	<title>Fix&günstig - Chromik Offsetdruck</title>
	<meta name="description" content="Schnelle und preiswerte Drucklösungen" />
</svelte:head>

<div class="page-wrapper">
	<Header />
	
	<main id="main-content" class="container">
		<section class="form-section">
			<h1>Fix&günstig</h1>
			<p class="intro">Schnelle und preiswerte Lösungen im 4-farbigen Digitaldruck:</p>

			{#if !produktId}
				<!-- Produktauswahl -->
				<div class="product-selection">
					<h2>Produkt wählen</h2>
					<div class="product-grid">
						{#each produkte as prod}
							<button 
								class="product-button" 
								onclick={() => waehleProdukt(prod.id)}
							>
								{prod.name}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Konfigurationsformular -->
				<div class="product-header">
					<h2>{produktName}</h2>
					<button class="btn-back" onclick={() => { 
						produktId = ''; 
						format = '';
						material = '';
						umfang = '';
						falzart = '';
						auflage = '';
						zeigErgebnis = false; 
					}}>
						← Anderes Produkt wählen
					</button>
				</div>

				<form class="calculator-form" onsubmit={berechneErgebnis}>
					<div class="form-group">
						<label for="format">{formatLabel}</label>
						<select id="format" bind:value={format} required>
							<option value="">Bitte wählen...</option>
							{#each verfuegbareFormate as fmt}
							<option value={fmt.name}>{fmt.name}</option>
							{/each}
						</select>
					</div>

					{#if zeigeUmfang}
						<div class="form-group">
							<label for="umfang">Umfang</label>
							<select id="umfang" bind:value={umfang} required disabled={!format}>
								<option value="">{format ? 'Bitte wählen...' : 'Zuerst Format wählen'}</option>
								{#each verfuegbareUmfaenge as umf}
									<option value={umf}>{umf}</option>
								{/each}
							</select>
						</div>
					{/if}

					{#if zeigeFalzart}
						<div class="form-group">
							<label for="falzart">Falzart</label>
							<select id="falzart" bind:value={falzart} required>
								<option value="">Bitte wählen...</option>
								{#each alleFalzarten as fz}
									<option value={fz}>{fz}</option>
								{/each}
							</select>
							{#if falzart === 'Wickelfalz'}
								<div class="material-info" style="margin-top: 0.75rem;">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
										<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
										<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
									</svg>
									<strong>Hinweis zu den Falzlängen:</strong> 2 x 100 mm + Einklapper 97 mm
								</div>
							{:else if falzart === 'Zickzackfalz'}
								<div class="material-info" style="margin-top: 0.75rem;">
									<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
										<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
										<path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
									</svg>
									<strong>Hinweis zu den Falzlängen:</strong> 3 x 99 mm
								</div>
							{/if}
						</div>
					{/if}

					<div class="form-group">
					<label for="material">Material</label>
					<select id="material" bind:value={material} required>
						<option value="">Bitte wählen...</option>
						{#each verfuegbareMaterialien as mat}
						<option value={mat.name}>{mat.name}</option>
						{/each}
					</select>
					{#if materialBeschreibung}
						<div class="material-info">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
								<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
								<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
							</svg>
							{materialBeschreibung}
						</div>
					{/if}
					{#if zeigeMaxAuflageHinweis}
						<div class="max-auflage-info" style="margin-top: 0.75rem; padding: 0.75rem; background-color: #e8f4f8; border-left: 3px solid #0066cc; border-radius: 4px;">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px; color: #0066cc;">
								<path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
								<path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
							</svg>
							<strong>Hinweis:</strong> Die maximale wirtschaftlich sinnvolle Auflage beträgt <strong>{maxAuflage.toLocaleString('de-DE')} Stück</strong> (entspricht max. {maxKlick} Klicks).
						</div>
					{/if}
				</div>

				<div class="form-group">
					<label for="auflage">Auflage (Stück)</label>
					<input 
						type="number" 
						id="auflage" 
						bind:value={auflage} 
						min="1"
						max={maxAuflage || undefined}
						step="1"
						placeholder={maxAuflage ? `Max. ${maxAuflage.toLocaleString('de-DE')}` : "z.B. 500"}
						required
					/>
					{#if auflage && maxAuflage && parseInt(auflage) > maxAuflage}
						<div class="auflage-warnung" style="margin-top: 0.5rem; padding: 0.5rem; background-color: #fff3cd; border-left: 3px solid #ffc107; border-radius: 4px; color: #856404;">
							<svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
								<path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
							</svg>
							<strong>Warnung:</strong> Die angegebene Auflage überschreitet die wirtschaftlich sinnvolle Grenze von {maxAuflage.toLocaleString('de-DE')} Stück.
						</div>
					{/if}
				</div>

				<div class="button-group">
					<button type="submit" class="btn btn-primary">Ergebnis</button>
					<button type="button" class="btn btn-secondary" onclick={zurücksetzen}>Zurücksetzen</button>
				</div>
			</form>

			{#if zeigErgebnis}
				<div class="result-box">
					{@html ergebnis}
					<div style="margin-top: 1.5rem; text-align: center;">
						<button class="btn btn-primary" onclick={startBestellprozess} style="font-size: 1.1em; padding: 0.75rem 2rem;">
							Weiter zum Bestellformular
						</button>
					</div>
				</div>
			{/if}

			{#if zeigeEmailVerifizierung}
				<div class="email-verification-box" style="margin-top: 2rem; padding: 2rem; background-color: #f8f9fa; border-radius: 8px;">
					<h3 style="margin-bottom: 1.5rem;">E-Mail-Adresse bestätigen</h3>
					
					<p style="margin-bottom: 1.5rem;">
						Um mit Ihrer Bestellung fortzufahren, bestätigen Sie bitte zunächst Ihre E-Mail-Adresse. 
						<strong>Falls Sie bereits bei uns bestellt haben, werden Ihre Daten automatisch geladen.</strong>
					</p>

					{#if emailVerifikationStatus === 'sent'}
						<div class="success-message" style="padding: 1.5rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 1.5rem;">
							<h4 style="color: #155724; margin-bottom: 0.5rem;">✓ E-Mail versendet!</h4>
							<p style="color: #155724; margin: 0;">Wir haben Ihnen eine Verifizierungsmail an <strong>{emailZurVerifizierung}</strong> gesendet.</p>
							<p style="color: #155724; margin: 0.5rem 0 0;">
								<strong>Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Verifizierungslink.</strong>
								<br>Der Link ist 24 Stunden gültig.
							</p>
						</div>
						<div class="button-group">
							<button class="btn btn-secondary" onclick={() => { emailVerifikationStatus = ''; emailZurVerifizierung = ''; }}>
								Andere E-Mail-Adresse verwenden
							</button>
							<button class="btn btn-secondary" onclick={abbrechenBestellung}>
								Abbrechen
							</button>
						</div>
					{:else if emailVerifikationStatus === 'error'}
						<div class="error-message" style="padding: 1.5rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 1.5rem;">
							<h4 style="color: #721c24; margin-bottom: 0.5rem;">✗ Fehler beim Senden</h4>
							<p style="color: #721c24; margin: 0;">Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.</p>
						</div>
						<div class="button-group">
							<button class="btn btn-primary" onclick={() => emailVerifikationStatus = ''}>Erneut versuchen</button>
							<button class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
						</div>
					{:else if emailVerifikationStatus === 'verifying'}
						<div style="text-align: center; padding: 2rem;">
							<div class="spinner"></div>
							<p style="margin-top: 1rem;">E-Mail-Adresse wird verifiziert...</p>
						</div>
					{:else}
						<div style="background-color: white; padding: 1.5rem; border-radius: 6px; margin-bottom: 1.5rem;">
							<div class="form-group">
								<label for="email-verification">E-Mail-Adresse *</label>
								<input 
									type="email" 
									id="email-verification" 
									bind:value={emailZurVerifizierung} 
									placeholder="ihre@email.de" 
									required 
									disabled={emailVerifikationStatus === 'sending'}
									style="width: 100%; padding: 0.75rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"
								/>
							</div>
						</div>

						<div class="button-group">
							<button 
								class="btn btn-primary" 
								onclick={sendeEmailVerifizierung}
								disabled={emailVerifikationStatus === 'sending' || !emailZurVerifizierung}
								style="font-size: 1.1em; padding: 0.75rem 2rem;"
							>
								{emailVerifikationStatus === 'sending' ? 'Wird gesendet...' : 'E-Mail bestätigen'}
							</button>
							<button class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
						</div>
					{/if}
				</div>
			{/if}

			{#if zeigeBestellformular}
				<div class="order-form-box" style="margin-top: 2rem; padding: 2rem; background-color: #f8f9fa; border-radius: 8px;">
					<h3 style="margin-bottom: 1.5rem;">Auftragsformular</h3>
					
					<!-- Zusammenfassung der Bestellung -->
					<div style="background-color: white; padding: 1.5rem; border-radius: 6px; margin-bottom: 2rem;">
						<h4 style="margin-bottom: 1rem;">Ihre Bestellung:</h4>
						<p><strong>Produkt:</strong> {produktName}</p>
						<p><strong>Format:</strong> {format}</p>
						{#if umfang}
							<p><strong>Umfang:</strong> {umfang}</p>
						{/if}
						{#if falzart}
							<p><strong>Falzart:</strong> {falzart}</p>
						{/if}
						<p><strong>Auflage:</strong> {auflage} Stück</p>
						<p><strong>Material:</strong> {material}</p>
						<hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
						<p><strong>Produktpreis (brutto):</strong> {preisBerechnung.gesamtpreisBrutto.toFixed(2)} €</p>
						{#if lieferart === 'versand'}
							<p><strong>Versandkosten (brutto):</strong> {versandkostenBrutto.toFixed(2)} €</p>
							<hr style="margin: 1rem 0; border: none; border-top: 1px solid #ddd;">
							<p style="font-size: 1.1em;"><strong>Gesamtpreis inkl. Versand (brutto): {(preisBerechnung.gesamtpreisBrutto + versandkostenBrutto).toFixed(2)} €</strong></p>
						{:else}
							<p style="font-size: 1.1em;"><strong>Gesamtpreis (brutto): {preisBerechnung.gesamtpreisBrutto.toFixed(2)} €</strong></p>
						{/if}
					</div>

					{#if bestellStatus === 'success'}
						<div class="success-message" style="padding: 1.5rem; background-color: #d4edda; border-left: 4px solid #28a745; border-radius: 4px; margin-bottom: 1.5rem;">
							<h4 style="color: #155724; margin-bottom: 0.5rem;">✓ Bestellung erfolgreich abgeschickt!</h4>
							<p style="color: #155724; margin: 0;">Vielen Dank für Ihre Bestellung!</p>
							<p style="color: #155724; margin: 0.5rem 0 0;">
								<strong>Wir haben Ihre Bestellung erhalten und Ihnen eine Bestätigungsmail an {kundenDaten.email} gesendet.</strong>
								<br>Sie erhalten in Kürze eine detaillierte Auftragsbestätigung von uns.
							</p>
						</div>
						<button class="btn btn-secondary" onclick={abbrechenBestellung}>Neue Bestellung</button>
					{:else if bestellStatus === 'error'}
						<div class="error-message" style="padding: 1.5rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 1.5rem;">
							<h4 style="color: #721c24; margin-bottom: 0.5rem;">✗ Fehler beim Senden</h4>
							<p style="color: #721c24; margin: 0;">Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.</p>
						</div>
						<div class="button-group">
							<button class="btn btn-primary" onclick={() => bestellStatus = ''}>Erneut versuchen</button>
							<button class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
						</div>
					{:else if bestellStatus === 'sending'}
						<!-- Loading-Indikator mit Fortschrittsanzeige -->
						<div class="loading-overlay">
							<div class="loading-content">
								<div class="spinner"></div>
								<h3 style="margin: 2rem 0 1rem 0; color: #374151;">Ihre Bestellung wird verarbeitet...</h3>
								<p style="color: #6b7280; margin-bottom: 2rem;">Bitte haben Sie einen Moment Geduld. Dies kann je nach Größe Ihrer PDF-Dateien einige Sekunden dauern.</p>
								
								<div class="progress-steps">
									<div class="progress-step" class:active={verarbeitungsSchritt >= 1} class:completed={verarbeitungsSchritt > 1}>
										<div class="step-icon">{verarbeitungsSchritt > 1 ? '✓' : '1'}</div>
										<div class="step-label">Daten vorbereiten</div>
									</div>
									<div class="progress-step" class:active={verarbeitungsSchritt >= 2} class:completed={verarbeitungsSchritt > 2}>
										<div class="step-icon">{verarbeitungsSchritt > 2 ? '✓' : '2'}</div>
										<div class="step-label">Kunde anlegen</div>
									</div>
									<div class="progress-step" class:active={verarbeitungsSchritt >= 3} class:completed={verarbeitungsSchritt > 3}>
										<div class="step-icon">{verarbeitungsSchritt > 3 ? '✓' : '3'}</div>
										<div class="step-label">Auftrag erstellen</div>
									</div>
									<div class="progress-step" class:active={verarbeitungsSchritt >= 4} class:completed={verarbeitungsSchritt > 4}>
										<div class="step-icon">{verarbeitungsSchritt > 4 ? '✓' : '4'}</div>
										<div class="step-label">E-Mails versenden</div>
									</div>
									<div class="progress-step" class:active={verarbeitungsSchritt >= 5} class:completed={verarbeitungsSchritt >= 5}>
										<div class="step-icon">{verarbeitungsSchritt >= 5 ? '✓' : '5'}</div>
										<div class="step-label">Abschließen</div>
									</div>
								</div>
							</div>
						</div>
					{:else}
						<form onsubmit={sendeBestellung}>
							<h4 style="margin-bottom: 1.5rem;">Ihre Kontaktdaten:</h4>
							
							{#if existingCustomerId}
								<div class="info-message" style="padding: 1rem 1.5rem; background-color: #d1ecf1; border-left: 4px solid #17a2b8; border-radius: 4px; margin-bottom: 1.5rem;">
									<p style="color: #0c5460; margin: 0;">
										<strong>ℹ️ Willkommen zurück!</strong><br>
										Wir haben Ihre Daten aus einer früheren Bestellung geladen. 
										Bitte überprüfen Sie die Angaben und aktualisieren Sie diese bei Bedarf.
									</p>
								</div>
							{/if}
							
							<div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
								<div class="form-group" style="margin-bottom: 0;">
									<label for="vorname">Vorname *</label>
									<input type="text" id="vorname" bind:value={kundenDaten.vorname} required />
								</div>
								<div class="form-group" style="margin-bottom: 0;">
									<label for="nachname">Nachname *</label>
									<input type="text" id="nachname" bind:value={kundenDaten.nachname} required />
								</div>
							</div>

							<div class="form-group">
								<label for="firma">Firma (optional)</label>
								<input type="text" id="firma" bind:value={kundenDaten.firma} />
							</div>

							<div class="form-group">
								<label for="strasse">Straße und Hausnummer *</label>
								<input type="text" id="strasse" bind:value={kundenDaten.strasse} placeholder="z.B. Musterstraße 123" required />
							</div>

							<div class="form-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1rem;">
								<div class="form-group" style="margin-bottom: 0;">
									<label for="plz">PLZ *</label>
									<input 
										type="text" 
										id="plz" 
										bind:value={kundenDaten.plz} 
										inputmode="numeric"
										maxlength="5"
										minlength="4"
										placeholder="12345" 
										required 
									/>
								</div>
								<div class="form-group" style="margin-bottom: 0;">
									<label for="ort">Ort *</label>
									<input type="text" id="ort" bind:value={kundenDaten.ort} required />
								</div>
							</div>

							<div class="form-group">
								<label for="email">E-Mail-Adresse * {#if emailVerifiziert}<span style="color: #28a745; font-weight: normal;">✓ Verifiziert</span>{/if}</label>
								<input 
									type="email" 
									id="email" 
									bind:value={kundenDaten.email} 
									placeholder="ihre@email.de" 
									required 
									disabled={emailVerifiziert}
									style={emailVerifiziert ? 'background-color: #e9f7ef; cursor: not-allowed;' : ''}
								/>
								{#if emailVerifiziert}
									<small style="color: #6c757d; display: block; margin-top: 0.25rem;">
										Diese E-Mail-Adresse wurde erfolgreich verifiziert.
									</small>
								{/if}
							</div>

							<div class="form-group" style="margin-top: 1.5rem;">
								<label for="pdf-upload">Druckdaten-PDF hochladen (optional, max. 20 MB)</label>
								<input 
									type="file" 
									id="pdf-upload" 
									bind:this={fileInputElement}
									onchange={handleFileChange}
									accept="application/pdf"
									style="margin-top: 0.5rem;"
								/>
								{#if pdfDateien.length > 0}
									<div style="margin-top: 0.75rem; padding: 0.75rem; background-color: #f0f0f0; border-radius: 4px;">
										<strong style="font-size: 0.9em;">Ausgewählte Dateien:</strong>
										<ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
											{#each pdfDateien as file, index}
												<li style="margin-bottom: 0.25rem; font-size: 0.9em;">
													{file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
													<button 
														type="button" 
														onclick={() => entferneDatei(index)}
														style="margin-left: 0.5rem; padding: 0.1rem 0.4rem; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;"
													>
														Entfernen
													</button>
												</li>
											{/each}
										</ul>
									</div>
								{/if}
								{#if pdfSeitenInfo}
									<div style="
										margin-top: 0.75rem; 
										padding: 0.75rem; 
										border-radius: 4px; 
										border: 1px solid {pdfSeitenInfo.hinweisTyp === 'success' ? '#c3e6cb' : pdfSeitenInfo.hinweisTyp === 'warning' ? '#ffeaa7' : '#bee5eb'};
										background-color: {pdfSeitenInfo.hinweisTyp === 'success' ? '#d4edda' : pdfSeitenInfo.hinweisTyp === 'warning' ? '#fff3cd' : '#d1ecf1'};
									">
										<span style="font-size: 0.9em;">{pdfSeitenInfo.hinweisText}</span>
									</div>
								{/if}
								<p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">
									<strong>Wichtig:</strong> Für <strong>1-seitige Produkte</strong> muss die PDF <strong>1 Seite</strong> enthalten (nur Vorderseite).<br>
									Für <strong>mehrseitige Produkte</strong> muss die PDF <strong>2 Seiten</strong> enthalten (Vorder- und Rückseite) bzw. (Außen- und Innenseiten).
								</p>
								{#if pdfDateien.length === 0}
									<div style="
										margin-top: 1rem; 
										padding: 1rem 1.25rem; 
										background-color: #f8d7da; 
										border-left: 4px solid #dc3545; 
										border-radius: 4px;
										color: #721c24;
										font-weight: 500;
									">
									 Beschnittzugabe von mind. zwei Millimetern nicht vergessen!
									</div>
								{/if}
							</div>

							<div class="form-group" style="margin-top: 1.5rem;">
								<label for="auftragsname">Auftragsname (optional)</label>
								<input 
									type="text" 
									id="auftragsname" 
									bind:value={auftragsname} 
									placeholder="z.B. Firmenflyer 2026"
									style="margin-top: 0.5rem;"
								/>
								<p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">
									{#if pdfDateien.length > 0}
										Falls leer, wird der PDF-Name verwendet: <strong>{pdfDateien[0].name.replace(/\.pdf$/i, '')}</strong>
									{:else}
										Geben Sie Ihrem Auftrag einen Namen zur besseren Übersicht.
									{/if}
								</p>
							</div>

							<div class="form-group" style="margin-top: 2rem; padding: 1.5rem; background-color: #fff; border: 2px solid #0066cc; border-radius: 6px;">
								<h4 style="margin-bottom: 1rem;">Lieferung / Abholung *</h4>
								
								<div style="margin-bottom: 1rem;">
									<label style="display: flex; align-items: flex-start; cursor: pointer; margin-bottom: 0.75rem;">
										<input 
											type="radio" 
											name="lieferart" 
											value="abholung"
											bind:group={lieferart}
											required
											style="margin-right: 0.75rem; margin-top: 0.25rem;"
										/>
										<div>
											<strong style="font-size: 1em;">Abholung (kostenlos)</strong><br>
											<span style="font-size: 0.9em; color: #666;">
												Marie-Curie-Straße 8 in 15236 Frankfurt (Oder)<br>
												Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache
											</span>
										</div>
									</label>
									
									<label style="display: flex; align-items: flex-start; cursor: pointer;">
										<input 
											type="radio" 
											name="lieferart" 
											value="versand"
											bind:group={lieferart}
											required
											style="margin-right: 0.75rem; margin-top: 0.25rem;"
										/>
										<div>
											<strong style="font-size: 1em;">Versand per DPD (+{versandkostenNetto.toFixed(2)} € netto / +{versandkostenBrutto.toFixed(2)} € brutto)</strong><br>
											<span style="font-size: 0.9em; color: #666;">
												Lieferung innerhalb Deutschlands
											</span>
										</div>
									</label>
								</div>
								
								{#if lieferart === 'versand'}
									<div style="margin-top: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px;">
										<div style="margin-bottom: 1rem;">
											<label style="display: flex; align-items: center; cursor: pointer;">
												<input 
													type="checkbox" 
													bind:checked={lieferadresseGleichRechnungsadresse}
													style="margin-right: 0.5rem;"
												/>
												<span style="font-size: 0.95em;">Lieferadresse entspricht der Rechnungsadresse</span>
											</label>
										</div>
										
									{#if lieferadresseGleichRechnungsadresse}
										<div style="border-top: 1px solid #dee2e6; padding-top: 1rem; margin-top: 1rem;">
											<h5 style="margin-bottom: 1rem; font-size: 1em;">Lieferadresse (Rechnungsadresse):</h5>
											<div style="padding: 1rem; background-color: #e7f3ff; border-left: 3px solid #0066cc; border-radius: 4px;">
												<p style="margin: 0.25rem 0; font-size: 0.95em;">
													<strong>{kundenDaten.firma ? kundenDaten.firma : `${kundenDaten.vorname} ${kundenDaten.nachname}`}</strong>
												</p>
												{#if kundenDaten.firma}
													<p style="margin: 0.25rem 0; font-size: 0.95em;">
														{kundenDaten.vorname} {kundenDaten.nachname}
													</p>
												{/if}
												<p style="margin: 0.25rem 0; font-size: 0.95em;">{kundenDaten.strasse}</p>
												<p style="margin: 0.25rem 0; font-size: 0.95em;">{kundenDaten.plz} {kundenDaten.ort}</p>
											</div>
										</div>
									{:else}
									<div style="border-top: 1px solid #dee2e6; padding-top: 1rem; margin-top: 1rem;">
										<h5 style="margin-bottom: 1rem; font-size: 1em;">Abweichende Lieferadresse:</h5>
										
										{#if existingCustomerId && vorhandeneVersandadressen.length > 0}
											<!-- Auswahl: Vorhandene Adresse oder neue Adresse -->
											<div class="form-group" style="margin-bottom: 1.5rem;">
												<label for="adress-auswahl">Adresse auswählen *</label>
												<select 
													id="adress-auswahl" 
													bind:value={gewaehlteAdresseId}
													style="width: 100%; padding: 0.5rem; border: 1px solid #ccc; border-radius: 4px; font-size: 1rem;"
													required
												>
													<option value="neu">➕ Neue Adresse hinzufügen</option>
													{#each vorhandeneVersandadressen as adresse}
														<option value={adresse.id}>
															{adresse.data.name}, {adresse.data.street}, {adresse.data.zip} {adresse.data.city}
														</option>
													{/each}
												</select>
											</div>
										{/if}
										
										{#if !existingCustomerId || gewaehlteAdresseId === 'neu'}
											<!-- Eingabefelder für neue Adresse -->
											<div class="form-group">
												<label for="liefer-name">Name / Firma *</label>
												<input 
													type="text" 
													id="liefer-name" 
													bind:value={lieferadresse.name} 
													placeholder="z.B. Max Mustermann oder Musterfirma GmbH" 
													required 
												/>
											</div>
											
											<div class="form-group">
												<label for="liefer-strasse">Straße und Hausnummer *</label>
												<input 
													type="text" 
													id="liefer-strasse" 
													bind:value={lieferadresse.strasse} 
													placeholder="z.B. Musterstraße 123" 
													required 
												/>
											</div>

											<div class="form-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1rem;">
												<div class="form-group" style="margin-bottom: 0;">
													<label for="liefer-plz">PLZ *</label>
													<input 
														type="text" 
														id="liefer-plz" 
														bind:value={lieferadresse.plz} 
														inputmode="numeric"
														maxlength="5"
														minlength="4"
														placeholder="12345" 
														required 
													/>
												</div>
												<div class="form-group" style="margin-bottom: 0;">
													<label for="liefer-ort">Ort *</label>
													<input type="text" id="liefer-ort" bind:value={lieferadresse.ort} required />
												</div>
											</div>
										{:else if gewaehlteAdresseId !== 'neu'}
											<!-- Anzeige der ausgewählten Adresse -->
											<div style="padding: 1rem; background-color: #e7f3ff; border-left: 3px solid #0066cc; border-radius: 4px; margin-top: 1rem;">
												<p style="margin: 0.25rem 0; font-size: 0.95em;">
													<strong>{lieferadresse.name}</strong>
												</p>
												<p style="margin: 0.25rem 0; font-size: 0.95em;">{lieferadresse.strasse}</p>
												<p style="margin: 0.25rem 0; font-size: 0.95em;">{lieferadresse.plz} {lieferadresse.ort}</p>
											</div>
										{/if}
									</div>
								{/if}
								
								<div style="margin-top: 1.5rem; padding: 1rem; background-color: #d4edda; border: 1px solid #c3e6cb; border-radius: 4px;">
									<strong style="font-size: 0.95em;">Versandkosten:</strong><br>
									<span style="font-size: 0.9em;">
										Netto: {versandkostenNetto.toFixed(2)} €<br>
										zzgl. 19% MwSt.: {(versandkostenNetto * mehrwertsteuer).toFixed(2)} €<br>
										<strong>Brutto: {versandkostenBrutto.toFixed(2)} €</strong>
									</span>
								</div>
							</div>
						{/if}
					</div>

					<div class="form-group" style="margin-top: 1.5rem;">
								<label style="display: flex; align-items: flex-start; cursor: pointer;">
									<input 
										type="checkbox" 
										bind:checked={kundenDaten.datenschutz} 
										required 
										style="margin-right: 0.5rem; margin-top: 0.25rem;"
									/>
									<span style="font-size: 0.9em;">
										Ich habe die <a href="/datenschutz" target="_blank" style="color: #0066cc; text-decoration: underline;">Datenschutzerklärung</a> zur Kenntnis genommen. Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen dauerhaft gespeichert werden. *
									</span>
								</label>
							</div>

							<div style="font-size: 0.85em; color: #666; margin: 1.5rem 0; padding: 1rem; background-color: #f0f0f0; border-radius: 4px;">
								<strong>Hinweis zum Datenschutz:</strong><br>
								Die von Ihnen eingegebenen Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und gemäß der Datenschutzgrundverordnung (DSGVO) verarbeitet. Ihre Daten werden nicht an Dritte weitergegeben. Sie haben jederzeit das Recht auf Auskunft, Berichtigung, Löschung oder Einschränkung der Verarbeitung Ihrer personenbezogenen Daten.
							</div>

							<div class="button-group" style="margin-top: 2rem;">
								<button 
									type="submit" 
									class="btn btn-primary" 
									disabled={bestellStatus === 'sending'}
									style="font-size: 1.1em;"
								>
									{bestellStatus === 'sending' ? 'Wird gesendet...' : 'Verbindlich bestellen'}
								</button>
								<button type="button" class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
							</div>
						</form>
					{/if}
				</div>
			{/if}
		{/if}
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
		padding: 4rem 1rem;
	}

	.form-section {
		max-width: 700px;
		margin: 0 auto;
		padding: 0 1rem;
	}

	h1 {
		font-size: 2.5rem;
		margin-bottom: 1rem;
		background: linear-gradient(135deg, var(--text-primary) 0%, var(--text-secondary) 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	.intro {
		font-size: 1.1rem;
		color: var(--text-secondary);
		margin-bottom: 3rem;
		line-height: 1.6;
	}

	/* Produktauswahl */
	.product-selection {
		text-align: center;
	}

	.product-selection h2 {
		font-size: 1.8rem;
		margin-bottom: 2rem;
		color: var(--text-primary);
	}

	.product-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1.5rem;
		margin-bottom: 2rem;
	}

	.product-button {
		padding: 2rem 1.5rem;
		background: linear-gradient(135deg, var(--bg-secondary) 0%, var(--hover-bg) 100%);
		border: 2px solid var(--border);
		border-radius: 16px;
		font-size: 1.2rem;
		font-weight: 600;
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.3s ease;
		box-shadow: 0 4px 15px var(--shadow);
	}

	.product-button:hover {
		transform: translateY(-5px);
		box-shadow: 0 8px 25px var(--shadow);
		border-color: #6b7280;
		background: linear-gradient(135deg, var(--hover-bg) 0%, var(--bg-secondary) 100%);
	}

	/* Produkt-Header */
	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid var(--border);
	}

	.product-header h2 {
		font-size: 1.8rem;
		color: var(--text-primary);
		margin: 0;
	}

	.btn-back {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid var(--border);
		border-radius: 8px;
		color: var(--text-primary);
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-back:hover {
		background: var(--hover-bg);
		border-color: var(--text-secondary);
	}

	.calculator-form {
		background: var(--bg-secondary);
		padding: 2.5rem;
		border-radius: 16px;
		border: 1px solid var(--border);
		box-shadow: 0 4px 20px var(--shadow);
	}

	@media (max-width: 640px) {
		.calculator-form {
			padding: 1.25rem;
			border-radius: 12px;
		}
	}

	.form-group {
		margin-bottom: 1.75rem;
	}

	.form-group:last-of-type {
		margin-bottom: 2.5rem;
	}

	label {
		display: block;
		font-weight: 600;
		margin-bottom: 0.5rem;
		color: var(--text-primary);
		font-size: 0.95rem;
	}

	select,
	input[type="number"] {
		width: 100%;
		padding: 0.875rem 1rem;
		font-size: 1rem;
		border: 2px solid var(--border);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		transition: all 0.3s ease;
		font-family: inherit;
	}

	select:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		background: var(--bg-secondary);
	}

	select:focus,
	input[type="number"]:focus {
		outline: none;
		border-color: #6b7280;
		box-shadow: 0 0 0 3px rgba(107, 114, 128, 0.1);
	}

	input[type="number"]::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.material-info {
		margin-top: 0.75rem;
		padding: 0.875rem 1rem;
		background: linear-gradient(135deg, rgba(107, 114, 128, 0.05) 0%, rgba(107, 114, 128, 0.1) 100%);
		border-left: 3px solid #6b7280;
		border-radius: 6px;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--text-secondary);
		animation: slideIn 0.3s ease;
	}

	.button-group {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.btn {
		flex: 1;
		min-width: 150px;
		padding: 0.875rem 2rem;
		font-size: 1rem;
		font-weight: 600;
		border: none;
		border-radius: 12px;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}

	.btn-primary {
		background: linear-gradient(135deg, #6b7280 0%, #4b5563 100%);
		color: #fff;
		box-shadow: 0 4px 15px rgba(107, 114, 128, 0.3);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(107, 114, 128, 0.4);
		background: linear-gradient(135deg, #9ca3af 0%, #6b7280 100%);
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border: 2px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--hover-bg);
		border-color: var(--text-secondary);
	}

	.result-box {
		margin-top: 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
		border-radius: 12px;
		border: 2px solid #d1d5db;
		animation: slideIn 0.4s ease;
	}

	.result-box :global(strong) {
		color: var(--text-primary);
	}

	.button-group {
		display: flex;
		gap: 1rem;
		margin-top: 1rem;
	}

	.spinner {
		width: 50px;
		height: 50px;
		margin: 0 auto;
		border: 4px solid #f3f4f6;
		border-top: 4px solid #6b7280;
		border-radius: 50%;
		animation: spin 1s linear infinite;
	}

	.loading-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		animation: fadeIn 0.3s ease;
	}

	.loading-content {
		background: white;
		padding: 3rem;
		border-radius: 12px;
		max-width: 600px;
		width: 90%;
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
		text-align: center;
		animation: slideUp 0.4s ease;
	}

	.progress-steps {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 0.5rem;
		margin-top: 2rem;
	}

	.progress-step {
		flex: 1;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.5rem;
		opacity: 0.4;
		transition: opacity 0.3s ease;
	}

	.progress-step.active {
		opacity: 1;
	}

	.progress-step.completed {
		opacity: 1;
	}

	.progress-step.completed .step-icon {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}

	.progress-step.active:not(.completed) .step-icon {
		background: #6b7280;
		color: white;
		border-color: #6b7280;
		animation: pulse 1.5s ease-in-out infinite;
	}

	.step-icon {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		background: white;
		border: 2px solid #e5e7eb;
		display: flex;
		align-items: center;
		justify-content: center;
		font-weight: 600;
		font-size: 0.9rem;
		transition: all 0.3s ease;
	}

	.step-label {
		font-size: 0.75rem;
		color: #6b7280;
		text-align: center;
		line-height: 1.3;
		max-width: 80px;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	@keyframes slideUp {
		from {
			opacity: 0;
			transform: translateY(20px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@keyframes pulse {
		0%, 100% {
			transform: scale(1);
			box-shadow: 0 0 0 0 rgba(107, 114, 128, 0.7);
		}
		50% {
			transform: scale(1.05);
			box-shadow: 0 0 0 10px rgba(107, 114, 128, 0);
		}
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes slideIn {
		from {
			opacity: 0;
			transform: translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 768px) {
		main {
			padding: 2rem 0;
		}

		h1 {
			font-size: 2rem;
		}

		.product-grid {
			grid-template-columns: 1fr;
		}

		.product-header {
			flex-direction: column;
			gap: 1rem;
			align-items: flex-start;
		}

		.calculator-form {
			padding: 1.5rem;
		}

		.button-group {
			flex-direction: column;
		}

		.btn {
			width: 100%;
		}

		.loading-content {
			padding: 2rem 1rem;
		}

		.progress-steps {
			flex-direction: column;
			gap: 1rem;
		}

		.progress-step {
			flex-direction: row;
			justify-content: flex-start;
			width: 100%;
		}

		.step-label {
			text-align: left;
			max-width: none;
		}
	}

	/* Alle Formularfelder untereinander auf schmalen Viewports */
	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr !important;
		}
	}
</style>
