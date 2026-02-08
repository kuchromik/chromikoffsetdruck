<script>
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
		{ id: 'mat-opal308', name: 'Opalkarten 308 g/m²', materialfaktor: 0.25, beschreibung: 'Hochwertiger weißer Karton mit glatter Oberfläche, ideal für edle Visitenkarten und Einladungen.' },
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
			materialien: ['mat-opal308', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
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
			materialien: ['mat-opal308', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
			umfaenge: {
				'1-seitig': true, // für alle Formate verfügbar
				'2-seitig': true // für alle Formate verfügbar
			}
		},
		klappkarten: {
			formate: ['format-a6', 'format-a5', 'format-lang', 'format-21x21', 'format-a4', 'format-a3'],
			materialien: ['mat-opal308', 'mat-sopor350', 'mat-bild300', 'mat-bild350'],
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
	let ergebnis = $state('');
	let zeigErgebnis = $state(false);

	// Bestellprozess
	let zeigeBestellformular = $state(false);
	let preisBerechnung = $state(null);
	let bestellStatus = $state(''); // '', 'sending', 'success', 'error'

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
	
	// Versandkosten
	const versandkostenNetto = 5.90;
	const versandkostenBrutto = versandkostenNetto * (1 + mehrwertsteuer);

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
		}
	});

	function waehleProdukt(id) {
		produktId = id;
		zeigErgebnis = false;
	}

	function berechneErgebnis(e) {
		e.preventDefault();
		// Prüfe ob alle Pflichtfelder ausgefüllt sind
		const pflichtfelderAusgefuellt = produktId && auflage && material && format && (!zeigeUmfang || umfang);
		
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
				<strong style="font-size: 1.1em;">Detaillierte Preisberechnung:</strong><br>
				<div style="margin-left: 1rem; margin-top: 0.5rem; line-height: 1.6;">				<strong>Anzahl Druckbogen:</strong> ${preisBerechnung.anzahlDruckbogen}<br>
				<span style="color: #666; font-size: 0.9em;">
					= (Auflage (${preisBerechnung.faktoren.auflage}) × 
					Formatfaktor (${preisBerechnung.faktoren.formatfaktor}) × 
					Flächenfaktor (${preisBerechnung.faktoren.flaechenfaktor})) / 2, aufgerundet
				</span><br>
				<br>					<strong>Klickanzahl:</strong> ${preisBerechnung.klickanzahl}<br>
					<span style="color: #666; font-size: 0.9em;">
						= Auflage (${preisBerechnung.faktoren.auflage}) × 
					Formatfaktor (${preisBerechnung.faktoren.formatfaktor}) × 
						Flächenfaktor (${preisBerechnung.faktoren.flaechenfaktor}), aufgerundet
					</span><br>
					<br>
					<strong>Grundpreis:</strong> ${preisBerechnung.grundpreis.toFixed(2)} €<br>
					<br>
					<strong>Druckkosten:</strong> ${preisBerechnung.druckkosten.toFixed(2)} €<br>
					<span style="color: #666; font-size: 0.9em;">
					= Klickanzahl (${preisBerechnung.klickanzahl}) × 
					Klickkosten (${preisBerechnung.faktoren.klickkosten})
					</span><br>
					<br>
					<strong>Materialkosten:</strong> ${preisBerechnung.materialkosten.toFixed(2)} €<br>
					<span style="color: #666; font-size: 0.9em;">
					= Anzahl Druckbogen (${preisBerechnung.anzahlDruckbogen}) × 
					Materialfaktor (${preisBerechnung.faktoren.materialfaktor})
					</span><br>
					<br>
					<strong>Schneidekosten:</strong> ${preisBerechnung.schneidekosten.toFixed(2)} €<br>
					<span style="color: #666; font-size: 0.9em;">
						= Kosten je Schnitt (${preisBerechnung.faktoren.kostenJeSchnitt}) × 
						Schneideaufwandsfaktor (${preisBerechnung.faktoren.schneideaufwandsfaktor})
					</span><br>`;
			
			if (preisBerechnung.zusatzkosten > 0) {
				ergebnisText += `		<br><strong>${preisBerechnung.zusatzkostenName}:</strong> ${preisBerechnung.zusatzkosten.toFixed(2)} €<br>`;
			}
			
			ergebnisText += `
				</div>
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
		ergebnis = '';
		zeigErgebnis = false;
		zeigeBestellformular = false;
	}

	function startBestellprozess() {
		zeigeBestellformular = true;
		
		// Smooth scroll zum Bestellformular nach kurzer Verzögerung
		setTimeout(() => {
			const orderForm = document.querySelector('.order-form-box');
			if (orderForm) {
				orderForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}
		}, 100);
	}

	function abbrechenBestellung() {
		// Komplett zurücksetzen - zurück zur Produktauswahl
		produktId = '';
		auflage = '';
		material = '';
		format = '';
		umfang = '';
		ergebnis = '';
		zeigErgebnis = false;
		zeigeBestellformular = false;
		preisBerechnung = null;
		bestellStatus = '';
		
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
			
			// PDF-Dateien hinzufügen
			pdfDateien.forEach((file, index) => {
				formData.append(`pdf${index}`, file);
			});

			// API-Route aufrufen
			const response = await fetch('/api/send-order', {
				method: 'POST',
				body: formData // Kein Content-Type Header - wird automatisch gesetzt
			});

			if (response.ok) {
				bestellStatus = 'success';
			} else {
				bestellStatus = 'error';
			}
		} catch (error) {
			console.error('Fehler beim Senden der Bestellung:', error);
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
	
	<main class="container">
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
							<h4 style="color: #155724; margin-bottom: 0.5rem;">✓ Bestellung erfolgreich gesendet!</h4>
							<p style="color: #155724; margin: 0;">Vielen Dank für Ihre Bestellung. Wir werden uns in Kürze bei Ihnen melden.</p>
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
					{:else}
						<form onsubmit={sendeBestellung}>
							<h4 style="margin-bottom: 1.5rem;">Ihre Kontaktdaten:</h4>
							
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
								<label for="email">E-Mail-Adresse *</label>
								<input type="email" id="email" bind:value={kundenDaten.email} placeholder="ihre@email.de" required />
							</div>

							<div class="form-group" style="margin-top: 1.5rem;">
								<label for="pdf-upload">Druckdaten-PDF hochladen (optional, max. 10MB)</label>
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

	@media (prefers-color-scheme: dark) {
		.result-box {
			background: linear-gradient(135deg, #374151 0%, #1f2937 100%);
			border-color: #4b5563;
		}
	}

	.result-box :global(strong) {
		color: var(--text-primary);
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
	}

	/* Alle Formularfelder untereinander auf schmalen Viewports */
	@media (max-width: 640px) {
		.form-row {
			grid-template-columns: 1fr !important;
		}
	}
</style>
