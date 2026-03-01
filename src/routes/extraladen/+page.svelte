<script>
	import { onMount, onDestroy } from 'svelte';
	import { page } from '$app/stores';
	import Header from '$lib/components/Header.svelte';
	import Footer from '$lib/components/Footer.svelte';
	import { PDFDocument } from 'pdf-lib';

	// In Svelte runes mode use `$props()` instead of `export let`
	const { data } = $props();
	const {
		produkte,
		alleFormate,
		alleMaterialien,
		alleUmfaenge,
		formatUmfangAbweichungen,
		produktKonfiguration
	} = data?.config || {};

	// Kurzer Log, welche Datenquelle verwendet wurde
	if (typeof data?.source === 'string') {
		console.log(`Extraladen config source: ${data.source}`);
	} else {
		console.log('Extraladen config source: unknown');
	}

	// Hilfsfunktionen zum Abrufen der Datenobjekte

	// Gibt für ein Produkt (id) den Flächengewichtsbereich als String zurück
	function getFlaechengewichtBereich(produktId) {
		const mats = produktKonfiguration?.[produktId]?.materialien || [];
		const matObjs = mats.map(id => alleMaterialien?.find(m => m.id === id)).filter(Boolean);
		const zahlen = matObjs.map(m => parseInt(m.name.slice(-8)));
		if (zahlen.length === 0) return '';
		const min = Math.min(...zahlen);
		const max = Math.max(...zahlen);
		const suffix = matObjs[0]?.name.slice(-5) || 'g/m²';
		if (min === max) return `${min} ${suffix}`;
		return `${min} ${suffix} - ${max} ${suffix}`;
	}

	function getFormatData(formatName) {
		return alleFormate?.find(f => f.name === formatName);
	}

	function getMaterialData(materialName) {
		return alleMaterialien?.find(m => m.name === materialName);
	}

	function getUmfangData(umfangName) {
		return alleUmfaenge?.find(u => u.name === umfangName);
	}

	// Hilfsfunktion zur Ermittlung des Flächenfaktors (berücksichtigt Format-Abweichungen)
	function getFlaechenfaktor(formatName, umfangName) {
		if (formatUmfangAbweichungen?.[formatName]?.[umfangName]) {
			return formatUmfangAbweichungen[formatName][umfangName];
		}
		const umfangData = getUmfangData(umfangName);
		return umfangData?.flaechenfaktor || 1.0;
	}

	// Kostenvariablen
	const klickkosten = 0.1;
	const kostenJeSchnitt = 0.5;
	const mehrwertsteuer = 0.19;
	const maxKlick = 500;

	// Versandkosten
	const versandkostenNetto = 5.90;
	const versandkostenBrutto = versandkostenNetto * (1 + mehrwertsteuer);

	// Preisberechnungsfunktion
	function berechneGesamtpreis() {
		const produktData = produkte?.find(p => p.id === produktId);
		const formatData = getFormatData(format);
		const materialData = getMaterialData(material);

		if (!produktData || !formatData || !materialData) return null;

		const grundpreis = produktData.grundpreis;
		const flaechenfaktor = getFlaechenfaktor(format, umfang);

		const ist1Seitig = umfang === '1-seitig' || !umfang;
		const anzahlDruckbogen = ist1Seitig
			? Math.ceil(auflage * formatData.formatfaktor * flaechenfaktor)
			: Math.ceil((auflage * formatData.formatfaktor * flaechenfaktor) / 2);

		const klickanzahl = Math.ceil(auflage * formatData.formatfaktor * flaechenfaktor);
		const berechneDruckkosten = klickanzahl * klickkosten;
		const berechneMaterialkosten = anzahlDruckbogen * materialData.materialfaktor;
		const berechneSchneidekosten = kostenJeSchnitt * formatData.schneideaufwandsfaktor;

		// Farbwechselkosten (Offsetdruck): reaktiver Wert aus der Farbwahl
		const farbigkeitSummand = farbwechselkosten;

		const gesamtpreisNetto = grundpreis + berechneDruckkosten + berechneMaterialkosten + berechneSchneidekosten + farbigkeitSummand;
		const mwstBetrag = gesamtpreisNetto * mehrwertsteuer;
		const gesamtpreisBrutto = gesamtpreisNetto + mwstBetrag;

		return {
			grundpreis,
			druckkosten: berechneDruckkosten,
			materialkosten: berechneMaterialkosten,
			schneidekosten: berechneSchneidekosten,
			farbigkeitSummand,
			zusatzkosten: 0,
			zusatzkostenName: '',
			gesamtpreisNetto,
			mwstBetrag,
			gesamtpreisBrutto,
			anzahlDruckbogen,
			klickanzahl,
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

	// Farbarten-Definition (Offsetdruck)
	const FARBARTEN = [
		{ id: 'schwarz', name: 'Schwarz', summand: 0 },
		{ id: 'hks',     name: 'HKS',     summand: 20 },
		{ id: 'pantone', name: 'Pantone', summand: 30 }
	];

	// Eingabewerte
	let produktId = $state('');
	let auflage = $state('');
	let material = $state('');
	let format = $state('');
	let umfang = $state('');
	let ergebnis = $state('');
	let zeigErgebnis = $state(false);

	// Farbwahl-Wizard (Offsetdruck)
	let farbwahlModus = $state(''); // '' | 'vorderseite' | 'rueckseite_frage' | 'rueckseite' | 'fertig'
	let farbenVorderseite = $state([]); // [{farbart, wert, label, summand}]
	let farbenRueckseite  = $state([]); // [{farbart, wert, label, summand}]
	let aktFarbart  = $state('');       // 'schwarz' | 'hks' | 'pantone' | ''
	let aktFarbwert = $state('');       // Eingabewert für HKS-Zahl oder Pantone-Code
	let farbFehler  = $state('');
	// Verhindert dass der Reset-Effect beim Wiederherstellen des Bestellzustands greift
	let _restoringState = false;

	// Bestellprozess
	let zeigeBestellformular = $state(false);
	let preisBerechnung = $state(null);
	let bestellStatus = $state('');
	let verarbeitungsSchritt = $state(0);
	let jobId = $state(null);
	let jobstart = $state(null);
	let jobIdCopied = $state(false);

	// E-Mail-Verifizierung
	let emailVerifiziert = $state(false);
	let verifiedEmail = $state('');
	let existingCustomerId = $state(null);
	let zeigeEmailVerifizierung = $state(false);
	let emailVerifikationStatus = $state('');
	let emailZurVerifizierung = $state('');
	let pollingInterval = null;

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
	let lieferart = $state('');
	let lieferadresseGleichRechnungsadresse = $state(true);
	let lieferadresse = $state({ name: '', strasse: '', plz: '', ort: '' });

	// Versandadressen-Verwaltung
	let vorhandeneVersandadressen = $state([]);
	let gewaehlteAdresseId = $state('neu');

	// Abweichende Rechnungsadresse
	let rechnungsadresseAbweichend = $state(false);
	let rechnungsadresse = $state({ firma: '', strasse: '', plz: '', ort: '' });

	// Abweichende Rechnungs-E-Mail
	let rechnungsEmailAbweichend = $state(false);
	let rechnungsEmail = $state('');
	let versandadressenGeladen = $state(false);

	// Gefilterte Optionen basierend auf gewähltem Produkt
	let verfuegbareMaterialien = $derived(
		produktId && produktKonfiguration?.[produktId]
			? produktKonfiguration[produktId].materialien
				.map(id => alleMaterialien?.find(m => m.id === id))
				.filter(Boolean)
				.sort((a, b) => {
					const gewichtA = parseInt(a.id.match(/\d+$/)?.[0] || '0');
					const gewichtB = parseInt(b.id.match(/\d+$/)?.[0] || '0');
					return gewichtA - gewichtB;
				})
			: []
	);

	let verfuegbareFormate = $derived(
		produktId && produktKonfiguration?.[produktId]
			? produktKonfiguration[produktId].formate.map(id => alleFormate?.find(f => f.id === id)).filter(Boolean)
			: []
	);

	let verfuegbareUmfaenge = $derived.by(() => {
		if (!produktId || !produktKonfiguration?.[produktId]?.umfaenge) return [];
		const umfaengeConfig = produktKonfiguration[produktId].umfaenge;
		const verfuegbar = [];
		for (const [umfangName, wert] of Object.entries(umfaengeConfig)) {
			if (wert === true) {
				verfuegbar.push(umfangName);
			} else if (Array.isArray(wert)) {
				const formatData = getFormatData(format);
				if (!format || (formatData && wert.includes(formatData.id))) {
					verfuegbar.push(umfangName);
				}
			}
		}
		return verfuegbar;
	});

	let zeigeUmfang = $derived(
		produktId && produktKonfiguration?.[produktId]?.umfaenge !== undefined
	);

	// Farbwahl-Wizard: Farbarten die für die aktuelle Seite noch auswählbar sind
	let verfuegbareFarbarten = $derived.by(() => {
		const liste = farbwahlModus === 'rueckseite' ? farbenRueckseite : farbenVorderseite;
		return FARBARTEN.filter(fa => {
			if (fa.id === 'schwarz') return !liste.some(f => f.farbart === 'schwarz');
			return true;
		});
	});

	// Für Rückseite: Vorschläge aus Vorderseite, die noch nicht auf der Rückseite stehen
	let vorschlaegeFuerRueckseite = $derived(
		farbenVorderseite.filter(f => !farbenRueckseite.some(r => r.label === f.label))
	);

	// Farbwechselkosten: Summanden aller einzigartigen Farben (Offsetdruck)
	let farbwechselkosten = $derived.by(() => {
		let summe = 0;
		for (const f of farbenVorderseite) summe += f.summand;
		for (const f of farbenRueckseite) {
			if (!farbenVorderseite.some(v => v.label === f.label)) summe += f.summand;
		}
		return summe;
	});

	// Anzeigeformat: "3/2", "1/0" etc.
	let farbigkeitAnzeige = $derived(
		farbwahlModus === 'fertig'
			? `${farbenVorderseite.length}/${farbenRueckseite.length}`
			: ''
	);

	let farbwahlAbgeschlossen = $derived(farbwahlModus === 'fertig');

	// Farbwahl zeigen wenn Produkt + Format (+ ggf. Umfang) gewählt
	let zeigeFarbwahl = $derived(!!(produktId && format && (!zeigeUmfang || umfang)));

	// Produktname für Anzeige
	let produktName = $derived(
		produktId ? produkte?.find(p => p.id === produktId)?.name || '' : ''
	);

	// Materialbeschreibung für gewähltes Material (in extraladen ggf. ohne beschreibung)
	let materialBeschreibung = $derived(
		material ? getMaterialData(material)?.beschreibung || '' : ''
	);

	// Berechne maximale Auflage basierend auf maxKlick
	let maxAuflage = $derived.by(() => {
		if (!format) return null;
		if (zeigeUmfang && !umfang) return null;
		const formatData = getFormatData(format);
		if (!formatData) return null;
		const flaechenfaktor = zeigeUmfang ? getFlaechenfaktor(format, umfang) : 1.0;
		return Math.floor(maxKlick / (formatData.formatfaktor * flaechenfaktor));
	});

	let zeigeMaxAuflageHinweis = $derived(
		format && (!zeigeUmfang || umfang) && maxAuflage !== null
	);

	// Werte zurücksetzen wenn für neues Produkt nicht verfügbar
	$effect(() => {
		if (produktId) {
			if (material && !verfuegbareMaterialien.some(m => m.name === material)) material = '';
			if (format && !verfuegbareFormate.some(f => f.name === format)) format = '';
			if (umfang && format && verfuegbareUmfaenge.length > 0 && !verfuegbareUmfaenge.includes(umfang)) umfang = '';
		}
	});

	// Farbwahl-Wizard automatisch starten/reset wenn Format / Umfang / Produkt ändert
	$effect(() => {
		// Variablen lesen damit Svelte den Effect neu ausführt wenn sie ändern
		const _k = `${produktId}|${format}|${umfang}`;
		void _k;
		// Nicht zurücksetzen wenn Bestellzustand wiederhergestellt wird
		if (_restoringState) { _restoringState = false; return; }
		farbwahlModus = (produktId && format && (!zeigeUmfang || umfang)) ? 'vorderseite' : '';
		farbenVorderseite = [];
		farbenRueckseite  = [];
		aktFarbart  = '';
		aktFarbwert = '';
		farbFehler  = '';
	});

	function waehleProdukt(id) {
		produktId = id;
		zeigErgebnis = false;
		format = '';
	}

	// ── Farbwahl-Funktionen ───────────────────────────────────────────────────

	function farbHinzufuegen(seite) {
		farbFehler = '';
		const farbart = FARBARTEN.find(f => f.id === aktFarbart);
		if (!farbart) { farbFehler = 'Bitte eine Farbart auswählen.'; return; }

		let label = '';
		if (aktFarbart === 'schwarz') {
			label = 'Schwarz';
		} else if (aktFarbart === 'hks') {
			const num = parseInt(aktFarbwert);
			if (!aktFarbwert || isNaN(num) || num < 1 || num > 99) {
				farbFehler = 'Bitte eine ganze Zahl zwischen 1 und 99 eingeben.';
				return;
			}
			label = `HKS ${num}`;
		} else if (aktFarbart === 'pantone') {
			const trimmed = String(aktFarbwert).trim();
			if (!trimmed || trimmed.length > 12) {
				farbFehler = 'Bitte einen Pantone-Code (max. 12 Zeichen) eingeben.';
				return;
			}
			label = `Pantone ${trimmed}`;
		}

		const liste = seite === 'vorderseite' ? farbenVorderseite : farbenRueckseite;
		if (liste.some(f => f.label === label)) {
			farbFehler = `${label} wurde bereits eingegeben.`;
			return;
		}

		const eintrag = { farbart: aktFarbart, wert: aktFarbwert, label, summand: farbart.summand };
		if (seite === 'vorderseite') {
			farbenVorderseite = [...farbenVorderseite, eintrag];
		} else {
			farbenRueckseite = [...farbenRueckseite, eintrag];
		}
		aktFarbart  = '';
		aktFarbwert = '';
		farbFehler  = '';
	}

	function farbEntfernen(seite, index) {
		if (seite === 'vorderseite') {
			farbenVorderseite = farbenVorderseite.filter((_, i) => i !== index);
		} else {
			farbenRueckseite = farbenRueckseite.filter((_, i) => i !== index);
		}
	}

	function farbVorschlagHinzufuegen(eintrag) {
		if (!farbenRueckseite.some(r => r.label === eintrag.label)) {
			farbenRueckseite = [...farbenRueckseite, { ...eintrag }];
		}
	}

	function farbwahlZuruecksetzen() {
		farbwahlModus = 'vorderseite';
		farbenVorderseite = [];
		farbenRueckseite  = [];
		aktFarbart  = '';
		aktFarbwert = '';
		farbFehler  = '';
	}

	// ─────────────────────────────────────────────────────────────────────────

	function berechneErgebnis(e) {
		e.preventDefault();
		const pflichtfelderAusgefuellt = produktId && auflage && material && format
			&& (!zeigeUmfang || umfang)
			&& farbwahlAbgeschlossen && farbenVorderseite.length > 0;

		if (!pflichtfelderAusgefuellt) {
			ergebnis = 'Bitte füllen Sie alle Felder aus.';
		} else {
			preisBerechnung = berechneGesamtpreis();

			let ergebnisText = `
				<strong>Ihre Auswahl:</strong><br>
				<strong>Produkt:</strong> ${produktName}<br>
				<strong>Format:</strong> ${format}<br>`;

			if (zeigeUmfang && umfang) {
				ergebnisText += `<strong>Umfang:</strong> ${umfang}<br>`;
			}
			if (farbigkeitAnzeige) {
				ergebnisText += `<strong>Farbigkeit:</strong> ${farbigkeitAnzeige}<br>`;
				ergebnisText += `<span style="font-size:0.9em;">Vorderseite: ${farbenVorderseite.map(f => f.label).join(', ')}</span><br>`;
				if (farbenRueckseite.length > 0) {
					ergebnisText += `<span style="font-size:0.9em;">Rückseite: ${farbenRueckseite.map(f => f.label).join(', ')}</span><br>`;
				} else {
					ergebnisText += `<span style="font-size:0.9em;">Rückseite: keine Farben</span><br>`;
				}
			}

			ergebnisText += `
				<strong>Auflage:</strong> ${auflage.toLocaleString('de-DE')} Stück<br>
				<strong>Material:</strong> ${material}<br><br>
				<div style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid currentColor; font-family: monospace; font-size: 0.92em;">
					<div style="margin-bottom: 0.25rem; font-weight: bold; font-family: sans-serif; font-size: 1.05em;">🔢 Kalkulation (Developer-Ansicht)</div>
					<table style="width: 100%; border-collapse: collapse; margin-bottom: 0.75rem;">
						<tr><td style="padding: 2px 0;">Grundpreis</td><td style="text-align: right;">${preisBerechnung.grundpreis.toFixed(2)} €</td></tr>
						<tr><td style="padding: 2px 0;">Druckkosten (${preisBerechnung.klickanzahl} Klicks × ${preisBerechnung.faktoren.klickkosten.toFixed(2)} €)</td><td style="text-align: right;">${preisBerechnung.druckkosten.toFixed(2)} €</td></tr>
						<tr><td style="padding: 2px 0;">Materialkosten (${preisBerechnung.anzahlDruckbogen} Bogen × ${preisBerechnung.faktoren.materialfaktor.toFixed(4)} €)</td><td style="text-align: right;">${preisBerechnung.materialkosten.toFixed(2)} €</td></tr>
						<tr><td style="padding: 2px 0;">Schneidekosten (Faktor ${preisBerechnung.faktoren.schneideaufwandsfaktor} × ${preisBerechnung.faktoren.kostenJeSchnitt.toFixed(2)} €)</td><td style="text-align: right;">${preisBerechnung.schneidekosten.toFixed(2)} €</td></tr>
						${preisBerechnung.farbigkeitSummand > 0 ? `<tr><td style="padding: 2px 0;">Farbwechselkosten (${farbigkeitAnzeige})</td><td style="text-align: right;">${preisBerechnung.farbigkeitSummand.toFixed(2)} €</td></tr>` : ''}
						<tr style="border-top: 1px solid currentColor;"><td style="padding: 4px 0 2px; font-weight: bold; font-family: sans-serif;">Summe netto</td><td style="text-align: right; font-weight: bold;">${preisBerechnung.gesamtpreisNetto.toFixed(2)} €</td></tr>
						<tr><td style="padding: 2px 0; font-size: 0.95em;">zzgl. 19% MwSt.</td><td style="text-align: right; font-size: 0.95em;">${preisBerechnung.mwstBetrag.toFixed(2)} €</td></tr>
						<tr style="border-top: 1px solid currentColor;"><td style="padding: 4px 0 2px; font-weight: bold; font-family: sans-serif; font-size: 1.1em;">Gesamtpreis brutto</td><td style="text-align: right; font-weight: bold; font-size: 1.1em;">${preisBerechnung.gesamtpreisBrutto.toFixed(2)} €</td></tr>
					</table>
					<div style="font-size: 0.85em; color: #666; font-family: sans-serif;">Faktoren: Formatfaktor ${preisBerechnung.faktoren.formatfaktor}, Flächenfaktor ${preisBerechnung.faktoren.flaechenfaktor}</div>
				</div>
			`;
			ergebnis = ergebnisText;
		}
		zeigErgebnis = true;

		setTimeout(() => {
			const resultBox = document.querySelector('.result-box');
			if (resultBox) resultBox.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
		if (!emailVerifiziert) {
			zeigeEmailVerifizierung = true;
			emailVerifikationStatus = '';
		} else {
			zeigeBestellformular = true;
		}
		setTimeout(() => {
			const target = document.querySelector('.email-verification-box, .order-form-box');
			if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 100);
	}

	async function ladeVersandadressen() {
		if (!existingCustomerId || versandadressenGeladen) return;
		try {
			const response = await fetch(`/api/get-shipment-addresses?customerId=${existingCustomerId}`);
			const result = await response.json();
			if (result.success) {
				vorhandeneVersandadressen = result.addresses || [];
				versandadressenGeladen = true;
			}
		} catch (error) {
			console.error('Fehler beim Laden der Versandadressen:', error);
		}
	}

	$effect(() => {
		if (existingCustomerId && lieferart === 'versand' && !lieferadresseGleichRechnungsadresse && !versandadressenGeladen) {
			ladeVersandadressen();
		}
	});

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
			lieferadresse = { name: '', strasse: '', plz: '', ort: '' };
		}
	});

	async function sendeEmailVerifizierung() {
		if (!emailZurVerifizierung || !emailZurVerifizierung.includes('@')) {
			alert('Bitte geben Sie eine gültige E-Mail-Adresse ein.');
			return;
		}
		emailVerifikationStatus = 'sending';
		try {
			const orderState = {
				produktId, produktName, auflage, material, format, umfang,
				farbenVorderseite: [...farbenVorderseite],
				farbenRueckseite: [...farbenRueckseite],
				farbigkeitAnzeige,
				preisBerechnung
			};
			const response = await fetch('/api/verify-email', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email: emailZurVerifizierung, orderState })
			});
			if (response.ok) {
				emailVerifikationStatus = 'sent';
				starteEmailPolling();
			} else {
				emailVerifikationStatus = 'error';
			}
		} catch (error) {
			console.error('Fehler beim Senden der E-Mail-Verifizierung:', error);
			emailVerifikationStatus = 'error';
		}
	}

	function starteEmailPolling() {
		if (pollingInterval) clearInterval(pollingInterval);
		let pollCount = 0;
		const maxPolls = 60;
		pollingInterval = setInterval(async () => {
			pollCount++;
			try {
				const response = await fetch('/api/poll-email-verification', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ email: emailZurVerifizierung })
				});
				const result = await response.json();
				if (result.success && result.verified) {
					stoppeEmailPolling();
					verarbeiteVerifizierung(result);
				} else if (pollCount >= maxPolls) {
					stoppeEmailPolling();
				}
			} catch (error) {
				console.error('Fehler beim Polling:', error);
			}
		}, 5000);
	}

	function stoppeEmailPolling() {
		if (pollingInterval) {
			clearInterval(pollingInterval);
			pollingInterval = null;
		}
	}

	function verarbeiteVerifizierung(result) {
		emailVerifiziert = true;
		verifiedEmail = result.email;
		kundenDaten.email = result.email;
		if (result.customerExists && result.customerData) {
			existingCustomerId = result.customerId;
			kundenDaten.vorname = result.customerData.firstName || '';
			kundenDaten.nachname = result.customerData.lastName || '';
			kundenDaten.firma = result.customerData.company || '';
			kundenDaten.strasse = result.customerData.address || '';
			kundenDaten.plz = result.customerData.zip || '';
			kundenDaten.ort = result.customerData.city || '';
		}
		if (result.orderState) {
			try {
				const orderState = result.orderState;
				_restoringState = true; // Verhindert Effect-Reset während der Wiederherstellung
				produktId = orderState.produktId;
				auflage = orderState.auflage;
				material = orderState.material;
				format = orderState.format;
				umfang = orderState.umfang;
				// Farbwahl wiederherstellen
				farbenVorderseite = orderState.farbenVorderseite || [];
				farbenRueckseite  = orderState.farbenRueckseite  || [];
				farbwahlModus = farbenVorderseite.length > 0 ? 'fertig' : 'vorderseite';
				preisBerechnung = orderState.preisBerechnung;
				zeigErgebnis = true;
				zeigeBestellformular = true;
			} catch (e) {
				console.error('Fehler beim Wiederherstellen des Bestellzustands:', e);
			}
		}
		emailVerifikationStatus = '';
		zeigeEmailVerifizierung = false;
		setTimeout(() => {
			const orderForm = document.querySelector('.order-form-box');
			const productSection = document.querySelector('.product-selection');
			const target = orderForm || productSection;
			if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 500);
	}

	onMount(async () => {
		const emailToken = $page.url.searchParams.get('emailToken');
		if (emailToken) {
			zeigeEmailVerifizierung = true;
			emailVerifikationStatus = 'verifying';
			try {
				const response = await fetch('/api/check-verified-email', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ token: emailToken })
				});
				const result = await response.json();
				if (result.success) {
					emailVerifikationStatus = 'verified-close-tab';
					verifiedEmail = result.email;
					const url = new URL(window.location.href);
					url.searchParams.delete('emailToken');
					window.history.replaceState({}, '', url);
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

	onDestroy(() => {
		stoppeEmailPolling();
	});

	function abbrechenBestellung() {
		stoppeEmailPolling();
		produktId = ''; auflage = ''; material = ''; format = ''; umfang = '';
		ergebnis = ''; zeigErgebnis = false; zeigeBestellformular = false;
		zeigeEmailVerifizierung = false; preisBerechnung = null; bestellStatus = '';
		emailVerifiziert = false; verifiedEmail = ''; existingCustomerId = null;
		emailVerifikationStatus = ''; emailZurVerifizierung = '';
		kundenDaten = { vorname: '', nachname: '', firma: '', strasse: '', plz: '', ort: '', email: '', datenschutz: false };
		pdfDateien = []; pdfSeitenInfo = null; auftragsname = '';
		if (fileInputElement) fileInputElement.value = '';
		lieferart = ''; lieferadresseGleichRechnungsadresse = true;
		lieferadresse = { name: '', strasse: '', plz: '', ort: '' };
		vorhandeneVersandadressen = []; gewaehlteAdresseId = 'neu'; versandadressenGeladen = false;
		rechnungsadresseAbweichend = false; rechnungsadresse = { firma: '', strasse: '', plz: '', ort: '' };
		rechnungsEmailAbweichend = false; rechnungsEmail = '';
	}

	async function handleFileChange(event) {
		const files = Array.from(event.target.files || []);
		const validFiles = files.filter(file => {
			if (file.type !== 'application/pdf') { alert(`"${file.name}" ist keine PDF-Datei und wurde ignoriert.`); return false; }
			if (file.size > 10 * 1024 * 1024) { alert(`"${file.name}" ist zu groß (max. 10MB).`); return false; }
			return true;
		}).slice(0, 1);

		if (validFiles.length > 0) {
			const file = validFiles[0];
			try {
				const arrayBuffer = await file.arrayBuffer();
				const pdfDoc = await PDFDocument.load(arrayBuffer);
				const pageCount = pdfDoc.getPageCount();
				const ist1Seitig = umfang === '1-seitig';
				let hinweisText = '';
				let hinweisTyp = 'info';
				if (ist1Seitig && pageCount !== 1) {
					hinweisTyp = 'warning';
					hinweisText = `⚠️ Ihre PDF hat ${pageCount} Seiten. Für 1-seitige Produkte muss die PDF genau 1 Seite enthalten.`;
				} else if (!ist1Seitig && pageCount !== 2) {
					hinweisTyp = 'warning';
					hinweisText = `⚠️ Ihre PDF hat ${pageCount} Seite${pageCount !== 1 ? 'n' : ''}. Für mehrseitige Produkte muss die PDF genau 2 Seiten enthalten (Vorder- und Rückseite).`;
				} else {
					hinweisTyp = 'success';
					hinweisText = ist1Seitig
						? `✓ PDF mit 1 Seite hochgeladen – perfekt für 1-seitige Produkte.`
						: `✓ PDF mit 2 Seiten hochgeladen – perfekt für mehrseitige Produkte.`;
				}
				pdfSeitenInfo = { pageCount, hinweisText, hinweisTyp };
			} catch (error) {
				pdfSeitenInfo = { pageCount: 0, hinweisText: '⚠️ Die PDF-Datei konnte nicht gelesen werden.', hinweisTyp: 'warning' };
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

		const progressInterval = setInterval(() => {
			if (verarbeitungsSchritt < 4) verarbeitungsSchritt++;
		}, 1500);

		try {
			let finalerAuftragsname = auftragsname.trim();
			if (!finalerAuftragsname && pdfDateien.length > 0) finalerAuftragsname = pdfDateien[0].name.replace(/\.pdf$/i, '');
			if (!finalerAuftragsname) finalerAuftragsname = `${produktName} - ${new Date().toLocaleDateString('de-DE')}`;

			const versandkosten = lieferart === 'versand' ? {
				netto: versandkostenNetto,
				mwst: versandkostenNetto * mehrwertsteuer,
				brutto: versandkostenBrutto
			} : null;

			const gesamtpreisNettoMitVersand = preisBerechnung.gesamtpreisNetto + (versandkosten ? versandkosten.netto : 0);
			const mwstBetragMitVersand = preisBerechnung.mwstBetrag + (versandkosten ? versandkosten.mwst : 0);
			const gesamtpreisBruttoMitVersand = preisBerechnung.gesamtpreisBrutto + (versandkosten ? versandkosten.brutto : 0);

			const formData = new FormData();
			const bestellDaten = {
				auftragsname: finalerAuftragsname,
				producer: 'chr', // Offsetdruck
				produktInfo: {
					produkt: produktName,
					format,
					umfang: umfang || '-',
					farbigkeit: farbigkeitAnzeige || '-',
					farbenVorderseite: farbenVorderseite.map(f => f.label),
					farbenRueckseite: farbenRueckseite.map(f => f.label),
					farbwechselkosten,
					auflage,
					material
				},
				preise: {
					anzahlDruckbogen: preisBerechnung.anzahlDruckbogen,
					klickanzahl: preisBerechnung.klickanzahl,
					grundpreis: preisBerechnung.grundpreis,
					druckkosten: preisBerechnung.druckkosten,
					materialkosten: preisBerechnung.materialkosten,
					schneidekosten: preisBerechnung.schneidekosten,
					farbigkeitSummand: preisBerechnung.farbigkeitSummand,
					zusatzkosten: preisBerechnung.zusatzkosten,
					zusatzkostenName: preisBerechnung.zusatzkostenName,
					gesamtpreisNetto: preisBerechnung.gesamtpreisNetto,
					mwstBetrag: preisBerechnung.mwstBetrag,
					gesamtpreisBrutto: preisBerechnung.gesamtpreisBrutto,
					versandkosten,
					gesamtpreisNettoMitVersand,
					mwstBetragMitVersand,
					gesamtpreisBruttoMitVersand
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
				},
				abweichendeRechnungsadresse: rechnungsadresseAbweichend ? {
					firma: rechnungsadresse.firma,
					strasse: rechnungsadresse.strasse,
					plz: rechnungsadresse.plz,
					ort: rechnungsadresse.ort,
					land: 'DE'
				} : null,
				abweichendeRechnungsEmail: rechnungsEmailAbweichend ? rechnungsEmail : null
			};

			formData.append('data', JSON.stringify(bestellDaten));
			formData.append('existingCustomerId', existingCustomerId || 'null');
			pdfDateien.forEach((file, index) => formData.append(`pdf${index}`, file));

			const response = await fetch('/api/submit-verified-order', {
				method: 'POST',
				body: formData
			});

			clearInterval(progressInterval);
			verarbeitungsSchritt = 5;

			if (response.ok) {
				const result = await response.json();
				if (result.success && result.jobId) {
					jobId = result.jobId;
					jobstart = Date.now();
				}
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
	<title>Extraladen – Chromik Offsetdruck</title>
	<meta name="description" content="Exklusive Druckprodukte im Sonderfarben-Offsetdruck: Briefbogen und Visitenkarten in HKS und Pantone" />
</svelte:head>

<div class="page-wrapper">
	<Header />

	<main id="main-content" class="container">
		<section class="form-section">
			<h1>Extraladen</h1>
			<p class="intro">Exklusive Druckprodukte im Sonderfarben-Offsetdruck – Briefbogen und Visitenkarten in HKS und Pantone:</p>

			{#if emailVerifikationStatus === 'verified-close-tab'}
				<div class="email-verification-box" style="margin-top: 2rem; padding: 2rem; background-color: #f0fdfa; border-radius: 8px;">
					<div class="success-message" style="padding: 2rem; background-color: #ccfbf1; border-left: 4px solid #0f766e; border-radius: 4px; text-align: center;">
						<h3 style="color: #0f4e47; margin-bottom: 1rem;">✓ E-Mail erfolgreich verifiziert!</h3>
						<p style="color: #0f4e47; font-size: 1.1em; margin-bottom: 1.5rem;">
							Ihre E-Mail-Adresse <strong>{verifiedEmail}</strong> wurde erfolgreich bestätigt.
						</p>
						<div style="background-color: #99f6e4; padding: 1.5rem; margin: 1.5rem 0; border-radius: 6px;">
							<p style="color: #0f4e47; margin: 0; font-size: 1.05em; line-height: 1.6;">
								<strong>Sie können diesen Tab jetzt schließen</strong> und zu Ihrer ursprünglichen Bestellseite (ggfs. anderer Browser-Tab) zurückkehren.<br>
								Ihre Daten werden dort automatisch geladen.
							</p>
						</div>
						<p style="color: #666; font-size: 0.9em; margin-top: 1rem;">
							Falls Sie die ursprüngliche Seite geschlossen haben, können Sie jetzt mit einer neuen Bestellung beginnen.
						</p>
						<button
							class="btn btn-primary"
							onclick={() => { window.location.href = '/extraladen'; }}
							style="margin-top: 1rem; font-size: 1.1em; padding: 0.75rem 2rem;"
						>
							Neue Bestellung starten
						</button>
					</div>
				</div>
			{:else if !produktId}
				<!-- Produktauswahl -->
				<div class="product-selection">
					<h2>Produkt wählen</h2>
					<div class="product-grid">
						{#each produkte as prod}
							<button
								class="product-button"
								onclick={() => waehleProdukt(prod.id)}
							>
								<div>{prod.name}</div>
								<div style="font-size:0.6em; font-weight: lighter; color:#888; margin-top:2px;">
									{getFlaechengewichtBereich(prod.id)}
								</div>
								{#if prod.beschreibung}
									<div style="font-size:0.6em; font-weight: lighter; color:#888; margin-top:6px;">{prod.beschreibung}</div>
								{/if}
							</button>
						{/each}
					</div>
				</div>
			{:else}
				<!-- Konfigurationsformular -->
				<div class="product-header">
					<h2>{produktName}</h2>
					<button class="btn-back" onclick={() => {
						produktId = ''; format = ''; material = ''; umfang = ''; auflage = ''; zeigErgebnis = false;
					}}>
						← Anderes Produkt wählen
					</button>
				</div>

				<form class="calculator-form" onsubmit={berechneErgebnis}>
					<div class="form-group">
						<label for="format">Format</label>
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

					{#if zeigeFarbwahl}
						<div class="farb-wizard">
							<!-- Kopfzeile -->
							<div class="farb-wizard-header">
								{#if farbwahlModus === 'vorderseite'}
									<h4 class="farb-wizard-titel">Farben &mdash; Vorderseite</h4>
								{:else if farbwahlModus === 'rueckseite_frage' || farbwahlModus === 'rueckseite'}
									<h4 class="farb-wizard-titel">Farben &mdash; R&uuml;ckseite</h4>
								{:else if farbwahlModus === 'fertig'}
									<h4 class="farb-wizard-titel">Farbigkeit</h4>
								{/if}
							</div>

							{#if farbwahlModus === 'vorderseite' || farbwahlModus === 'rueckseite'}
								{@const aktSeite = farbwahlModus}
								{@const aktiveListe = aktSeite === 'vorderseite' ? farbenVorderseite : farbenRueckseite}

								<!-- Bereits eingegebene Farben als Tags -->
								{#if aktiveListe.length > 0}
									<div class="farb-tags">
										{#each aktiveListe as f, i}
											<span class="farb-tag">
												{f.label}
												<button type="button" class="farb-tag-remove" onclick={() => farbEntfernen(aktSeite, i)}>&times;</button>
											</span>
										{/each}
									</div>
								{/if}

								<!-- Vorschl&auml;ge f&uuml;r R&uuml;ckseite aus Vorderseite -->
								{#if aktSeite === 'rueckseite' && vorschlaegeFuerRueckseite.length > 0}
									<div class="farb-vorschlaege">
										<span class="farb-vorschlag-label">Vorschlag:</span>
										{#each vorschlaegeFuerRueckseite as vf}
											<button type="button" class="farb-vorschlag-btn" onclick={() => farbVorschlagHinzufuegen(vf)}>
												+ {vf.label}
											</button>
										{/each}
									</div>
								{/if}

								<!-- Neue Farbe eingeben (max. 3) -->
								{#if aktiveListe.length < 3}
									<div class="farb-eingabe-block">
										<div class="farbart-auswahl">
											{#each verfuegbareFarbarten as fa}
												<button
													type="button"
													class="farbart-btn"
													class:aktiv={aktFarbart === fa.id}
													onclick={() => { aktFarbart = fa.id; aktFarbwert = ''; farbFehler = ''; }}
												>{fa.name}</button>
											{/each}
										</div>

										{#if aktFarbart === 'hks'}
											<input
												type="number"
												min="1"
												max="99"
												bind:value={aktFarbwert}
												placeholder="Zahl 1&ndash;99"
												class="farb-wert-input"
											/>
										{:else if aktFarbart === 'pantone'}
											<input
												type="text"
												maxlength="12"
												bind:value={aktFarbwert}
												placeholder="z.B. COOL GRAY 1"
												class="farb-wert-input"
											/>
										{/if}

										{#if farbFehler}
											<div class="farb-fehler">{farbFehler}</div>
										{/if}

										<button
											type="button"
											class="btn btn-secondary farb-add-btn"
											onclick={() => farbHinzufuegen(aktSeite)}
											disabled={!aktFarbart || (aktFarbart !== 'schwarz' && !aktFarbwert)}
										>Farbe hinzuf&uuml;gen</button>
									</div>
								{/if}

								<!-- Seite abschlie&szlig;en (erst nach min. 1 Farbe) -->
								{#if aktiveListe.length > 0}
									<button
										type="button"
										class="btn btn-primary farb-abschliessen-btn"
										onclick={() => {
											aktFarbart = ''; aktFarbwert = ''; farbFehler = '';
											if (aktSeite === 'vorderseite') {
												// 1-seitig: Rückseite überspringen
												if (umfang === '1-seitig') {
													farbenRueckseite = [];
													farbwahlModus = 'fertig';
												} else {
													farbwahlModus = 'rueckseite_frage';
												}
											} else {
												farbwahlModus = 'fertig';
											}
										}}
									>
										{aktSeite === 'vorderseite' ? 'Vorderseite abschlie\u00dfen \u2192' : 'R\u00fcckseite abschlie\u00dfen \u2192'}
									</button>
								{/if}

							{:else if farbwahlModus === 'rueckseite_frage'}
								<p class="farb-frage-text">Hat das Produkt gedruckte Farben auf der R&uuml;ckseite?</p>
								<div class="button-group">
									<button
										type="button"
										class="btn btn-secondary"
										onclick={() => { farbenRueckseite = []; farbwahlModus = 'fertig'; }}
									>Keine Farben auf der R&uuml;ckseite</button>
									<button
										type="button"
										class="btn btn-primary"
										onclick={() => { farbwahlModus = 'rueckseite'; aktFarbart = ''; aktFarbwert = ''; farbFehler = ''; }}
									>Farben R&uuml;ckseite eingeben &rarr;</button>
								</div>

							{:else if farbwahlModus === 'fertig'}
								<div class="farb-ergebnis">
									<div class="farb-ergebnis-zeile">
										<strong>Farbigkeit:</strong>
										<span class="farb-kennzahl">{farbigkeitAnzeige}</span>
									</div>
									<div class="farb-detail">
										{#if farbenVorderseite.length > 0}
											<div><strong>VS:</strong> {farbenVorderseite.map(f => f.label).join(' \u00b7 ')}</div>
										{/if}
										{#if farbenRueckseite.length > 0}
											<div><strong>RS:</strong> {farbenRueckseite.map(f => f.label).join(' \u00b7 ')}</div>
										{:else}
											<div><strong>RS:</strong> keine Farben</div>
										{/if}
									</div>
									<div class="farb-ergebnis-zeile">
										<strong>Farbwechselkosten:</strong> {farbwechselkosten.toFixed(2)}&nbsp;&euro;
									</div>
									<button type="button" class="btn btn-secondary farb-neustart-btn" onclick={farbwahlZuruecksetzen}>
										Farben neu eingeben
									</button>
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

					</div>

					<div class="form-group">
						<label for="auflage">Auflage (Stück)</label>
						<select id="auflage" bind:value={auflage} required>
							<option value="">Bitte wählen...</option>
							{#each [500,1000,1500,2000,2500,3000,3500,4000,4500,5000,5500,6000,6500,7000,7500,8000,8500,9000,9500,10000] as stk}
								<option value={stk}>{stk.toLocaleString('de-DE')}</option>
							{/each}
						</select>
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
					<div class="email-verification-box" style="margin-top: 2rem; padding: 2rem; background-color: #f0fdfa; border-radius: 8px;">
						<h3 style="margin-bottom: 1.5rem;">E-Mail-Adresse bestätigen</h3>
						<p style="margin-bottom: 1.5rem;">
							Um mit Ihrer Bestellung fortzufahren, bestätigen Sie bitte zunächst Ihre E-Mail-Adresse.
							<strong>Falls Sie bereits bei uns bestellt haben, werden Ihre Daten automatisch geladen.</strong>
						</p>

						{#if emailVerifikationStatus === 'sent'}
							<div class="success-message" style="padding: 1.5rem; background-color: #ccfbf1; border-left: 4px solid #0f766e; border-radius: 4px; margin-bottom: 1.5rem;">
								<h4 style="color: #0f4e47; margin-bottom: 0.5rem;">✓ E-Mail versendet!</h4>
								<p style="color: #0f4e47; margin: 0;">Wir haben Ihnen eine Verifizierungsmail an <strong>{emailZurVerifizierung}</strong> gesendet.</p>
								<p style="color: #0f4e47; margin: 0.75rem 0 0;"><strong>Bitte überprüfen Sie Ihr E-Mail-Postfach und klicken Sie auf den Verifizierungslink.</strong></p>
								<div style="background-color: #99f6e4; padding: 1rem; margin-top: 1rem; border-radius: 4px;">
									<p style="color: #0f4e47; margin: 0; font-size: 0.95em;">
										💡 <strong>Wichtig:</strong> Nach dem Klick auf den Verifizierungslink öffnet sich ein neuer Browser-Tab mit einer Bestätigung. Ihre bereits vorliegenden Daten werden <strong>in diesem Browser-Tab</strong> automatisch geladen und Sie können direkt mit der Bestellung fortfahren.
									</p>
								</div>
								<p style="color: #666; margin: 0.75rem 0 0; font-size: 0.9em;">Der Link ist 24 Stunden gültig.</p>
							</div>
							<div class="button-group">
								<button class="btn btn-secondary" onclick={() => { emailVerifikationStatus = ''; emailZurVerifizierung = ''; }}>
									Andere E-Mail-Adresse verwenden
								</button>
								<button class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
							</div>
						{:else if emailVerifikationStatus === 'error'}
							<div style="padding: 1.5rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 1.5rem;">
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
					<div class="order-form-box" style="margin-top: 2rem; padding: 2rem; background-color: #f0fdfa; border-radius: 8px;">
						<h3 style="margin-bottom: 1.5rem;">Auftragsformular</h3>

						<!-- Zusammenfassung der Bestellung -->
						<div style="background-color: white; padding: 1.5rem; border-radius: 6px; margin-bottom: 2rem;">
							<h4 style="margin-bottom: 1rem;">Ihre Bestellung:</h4>
							<p><strong>Produkt:</strong> {produktName}</p>
							<p><strong>Format:</strong> {format}</p>
							{#if umfang}
								<p><strong>Umfang:</strong> {umfang}</p>
							{/if}
							{#if farbigkeitAnzeige}
								<p><strong>Farbigkeit:</strong> {farbigkeitAnzeige}</p>
								<p style="font-size:0.9em; color:#555;">VS: {farbenVorderseite.map(f => f.label).join(', ')}</p>
								{#if farbenRueckseite.length > 0}<p style="font-size:0.9em; color:#555;">RS: {farbenRueckseite.map(f => f.label).join(', ')}</p>{/if}
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
							<div class="success-message" style="padding: 1.5rem; background-color: #ccfbf1; border-left: 4px solid #0f766e; border-radius: 4px; margin-bottom: 1.5rem;">
								<h4 style="color: #0f4e47; margin-bottom: 0.5rem;">✓ Bestellung erfolgreich abgeschickt!</h4>
								<p style="color: #0f4e47; margin: 0;">Vielen Dank für Ihre Bestellung!</p>
								<p style="color: #0f4e47; margin: 0.5rem 0 0;">
									<strong>Wir haben Ihre Bestellung erhalten und Ihnen eine Bestätigungsmail an {kundenDaten.email} gesendet.</strong><br>
									Sie erhalten in Kürze eine detaillierte Auftragsbestätigung von uns.
								</p>

								{#if pdfDateien.length === 0 && jobId}
									<div style="margin-top: 1.5rem; padding: 1rem; background-color: #fff3cd; border: 2px solid #ffc107; border-radius: 4px;">
										<h5 style="color: #856404; margin: 0 0 0.75rem 0; font-size: 1.1em;">⚠️ Wichtig: Druckdatei erforderlich</h5>
										<p style="color: #856404; margin: 0; line-height: 1.6;">
											<strong>Bitte senden Sie bis {new Date(jobstart + 24 * 60 * 60 * 1000).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })} um {new Date(jobstart + 24 * 60 * 60 * 1000).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })} Uhr</strong> die Druckdatei (PDF) an:<br><br>
											📧 <strong style="font-size: 1.05em;">daten.chromik@online.de</strong><br><br>
											Bitte geben Sie im Betreff die Job-ID an:<br>
											<strong style="font-size: 1.05em; font-family: monospace; background-color: #fff; padding: 0.25rem 0.5rem; border-radius: 3px;">{jobId}</strong>
											<button type="button" aria-label="Job-ID kopieren" title="Job-ID kopieren"
												style="border:none;background:none;padding:0 0.25em;cursor:pointer;vertical-align:middle;"
												onclick={() => {navigator.clipboard.writeText(jobId); jobIdCopied = true; setTimeout(() => jobIdCopied = false, 1200);}}>
												<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 16 16" style="vertical-align:middle;">
													<path d="M10 1.5A1.5 1.5 0 0 1 11.5 3v1H13a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-1.5H4A1.5 1.5 0 0 1 2.5 10V3A1.5 1.5 0 0 1 4 1.5h6zm1.5 3V3A.5.5 0 0 0 11 2.5H4A.5.5 0 0 0 3.5 3v7a.5.5 0 0 0 .5.5h.5V6a2 2 0 0 1 2-2h5zM6 5a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1H6z"/>
												</svg>
											</button>
											{#if jobIdCopied}
												<span style="font-size:0.95em;color:#0f766e;margin-left:0.5em;">Kopiert!</span>
											{/if}
										</p>
									</div>
								{/if}
							</div>
							<button class="btn btn-secondary" onclick={abbrechenBestellung}>Neue Bestellung</button>
						{:else if bestellStatus === 'error'}
							<div style="padding: 1.5rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; margin-bottom: 1.5rem;">
								<h4 style="color: #721c24; margin-bottom: 0.5rem;">✗ Fehler beim Senden</h4>
								<p style="color: #721c24; margin: 0;">Leider ist ein Fehler aufgetreten. Bitte versuchen Sie es erneut oder kontaktieren Sie uns direkt.</p>
							</div>
							<div class="button-group">
								<button class="btn btn-primary" onclick={() => bestellStatus = ''}>Erneut versuchen</button>
								<button class="btn btn-secondary" onclick={abbrechenBestellung}>Abbrechen</button>
							</div>
						{:else if bestellStatus === 'sending'}
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
									<div style="padding: 1rem 1.5rem; background-color: #ccfbf1; border-left: 4px solid #0f766e; border-radius: 4px; margin-bottom: 1.5rem;">
										<p style="color: #0f4e47; margin: 0;">
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
										<input type="text" id="plz" bind:value={kundenDaten.plz} inputmode="numeric" maxlength="5" minlength="4" placeholder="12345" required />
									</div>
									<div class="form-group" style="margin-bottom: 0;">
										<label for="ort">Ort *</label>
										<input type="text" id="ort" bind:value={kundenDaten.ort} required />
									</div>
								</div>

								<div class="form-group">
									<label for="email">
										E-Mail-Adresse *
										{#if emailVerifiziert}<span style="color: #0f766e; font-weight: normal;">✓ Verifiziert</span>{/if}
									</label>
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
										<small style="color: #6c757d; display: block; margin-top: 0.25rem;">Diese E-Mail-Adresse wurde erfolgreich verifiziert.</small>
									{/if}
								</div>

								<div class="form-group" style="margin-top: 1.5rem;">
									<label for="pdf-upload">Druckdaten-PDF hochladen (optional, max. 10 MB)</label>
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
														<button type="button" onclick={() => entferneDatei(index)}
															style="margin-left: 0.5rem; padding: 0.1rem 0.4rem; font-size: 0.8em; background-color: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer;">
															Entfernen
														</button>
													</li>
												{/each}
											</ul>
										</div>
									{/if}
									{#if pdfSeitenInfo}
										<div style="margin-top: 0.75rem; padding: 0.75rem; border-radius: 4px; border: 1px solid {pdfSeitenInfo.hinweisTyp === 'success' ? '#c3e6cb' : pdfSeitenInfo.hinweisTyp === 'warning' ? '#ffeaa7' : '#bee5eb'}; background-color: {pdfSeitenInfo.hinweisTyp === 'success' ? '#d4edda' : pdfSeitenInfo.hinweisTyp === 'warning' ? '#fff3cd' : '#d1ecf1'};">
											<span style="font-size: 0.9em;">{pdfSeitenInfo.hinweisText}</span>
										</div>
									{/if}
									<p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">
										<strong>Wichtig:</strong> Für <strong>1-seitige Produkte</strong> muss die PDF <strong>1 Seite</strong> enthalten.<br>
										Für <strong>mehrseitige Produkte</strong> muss die PDF <strong>2 Seiten</strong> enthalten (Vorder- und Rückseite).
									</p>
									{#if pdfDateien.length === 0}
										<div style="margin-top: 1rem; padding: 1rem 1.25rem; background-color: #f8d7da; border-left: 4px solid #dc3545; border-radius: 4px; color: #721c24; font-weight: 500;">
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
										placeholder="z.B. Visitenkarten Geschäftsführer"
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

								<!-- Abweichende Rechnungsadresse -->
								<div class="form-group" style="margin-top: 2rem; padding: 1.5rem; background-color: #fff9e6; border: 2px solid #ffc107; border-radius: 6px;">
									<h4 style="margin-bottom: 1rem;">Abweichende Rechnungsadresse (optional)</h4>
									<div style="margin-bottom: 1rem;">
										<label style="display: flex; align-items: center; cursor: pointer;">
											<input type="checkbox" bind:checked={rechnungsadresseAbweichend} style="margin-right: 0.5rem;" />
											<span style="font-size: 0.95em;">Ich möchte eine abweichende Rechnungsadresse angeben</span>
										</label>
									</div>
									{#if rechnungsadresseAbweichend}
										<div style="border-top: 1px solid #ffd54f; padding-top: 1rem; margin-top: 1rem;">
											<div class="form-group">
												<label for="rechnung-firma">Firma *</label>
												<input type="text" id="rechnung-firma" bind:value={rechnungsadresse.firma} placeholder="z.B. Musterfirma GmbH" required />
											</div>
											<div class="form-group">
												<label for="rechnung-strasse">Straße und Hausnummer *</label>
												<input type="text" id="rechnung-strasse" bind:value={rechnungsadresse.strasse} placeholder="z.B. Musterstraße 123" required />
											</div>
											<div class="form-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1rem;">
												<div class="form-group" style="margin-bottom: 0;">
													<label for="rechnung-plz">PLZ *</label>
													<input type="text" id="rechnung-plz" bind:value={rechnungsadresse.plz} inputmode="numeric" maxlength="5" minlength="4" placeholder="12345" required />
												</div>
												<div class="form-group" style="margin-bottom: 0;">
													<label for="rechnung-ort">Ort *</label>
													<input type="text" id="rechnung-ort" bind:value={rechnungsadresse.ort} required />
												</div>
											</div>
											<p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">Die Rechnungsadresse wird automatisch mit Länderschlüssel "DE" (Deutschland) gespeichert.</p>
										</div>
									{/if}
								</div>

								<!-- Abweichende Rechnungs-E-Mail -->
								<div class="form-group" style="margin-top: 1.5rem; padding: 1.5rem; background-color: #f0fdfa; border: 2px solid #0f766e; border-radius: 6px;">
									<h4 style="margin-bottom: 1rem;">Abweichende E-Mail für Rechnungsversand (optional)</h4>
									<div style="margin-bottom: 1rem;">
										<label style="display: flex; align-items: center; cursor: pointer;">
											<input type="checkbox" bind:checked={rechnungsEmailAbweichend} style="margin-right: 0.5rem;" />
											<span style="font-size: 0.95em;">Die Rechnung soll an eine andere E-Mail-Adresse gesendet werden</span>
										</label>
									</div>
									{#if rechnungsEmailAbweichend}
										<div style="border-top: 1px solid #5eead4; padding-top: 1rem; margin-top: 1rem;">
											<div class="form-group">
												<label for="rechnung-email">E-Mail-Adresse für Rechnungsversand *</label>
												<input type="email" id="rechnung-email" bind:value={rechnungsEmail} placeholder="rechnung@email.de" required />
											</div>
											<p style="font-size: 0.85em; color: #666; margin-top: 0.5rem;">
												Die Rechnung wird an diese E-Mail-Adresse versendet. Die Auftragsbestätigung wird weiterhin an <strong>{kundenDaten.email}</strong> gesendet.
											</p>
										</div>
									{/if}
								</div>

								<!-- Lieferung / Abholung -->
								<div class="form-group" style="margin-top: 2rem; padding: 1.5rem; background-color: #fff; border: 2px solid #0f766e; border-radius: 6px;">
									<h4 style="margin-bottom: 1rem;">Lieferung / Abholung *</h4>
									<div style="margin-bottom: 1rem;">
										<label style="display: flex; align-items: flex-start; cursor: pointer; margin-bottom: 0.75rem;">
											<input type="radio" name="lieferart" value="abholung" bind:group={lieferart} required style="margin-right: 0.75rem; margin-top: 0.25rem;" />
											<div>
												<strong style="font-size: 1em;">Abholung (kostenlos)</strong><br>
												<span style="font-size: 0.9em; color: #666;">
													Marie-Curie-Straße 8 in 15236 Frankfurt (Oder)<br>
													Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache
												</span>
											</div>
										</label>
										<label style="display: flex; align-items: flex-start; cursor: pointer;">
											<input type="radio" name="lieferart" value="versand" bind:group={lieferart} required style="margin-right: 0.75rem; margin-top: 0.25rem;" />
											<div>
												<strong style="font-size: 1em;">Versand per DPD (+{versandkostenNetto.toFixed(2)} € netto / +{versandkostenBrutto.toFixed(2)} € brutto)</strong><br>
												<span style="font-size: 0.9em; color: #666;">Lieferung innerhalb Deutschlands</span>
											</div>
										</label>
									</div>

									{#if lieferart === 'versand'}
										<div style="margin-top: 1.5rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px;">
											<div style="margin-bottom: 1rem;">
												<label style="display: flex; align-items: center; cursor: pointer;">
													<input type="checkbox" bind:checked={lieferadresseGleichRechnungsadresse} style="margin-right: 0.5rem;" />
													<span style="font-size: 0.95em;">Lieferadresse entspricht der Rechnungsadresse</span>
												</label>
											</div>

											{#if lieferadresseGleichRechnungsadresse}
												<div style="border-top: 1px solid #dee2e6; padding-top: 1rem; margin-top: 1rem;">
													<h5 style="margin-bottom: 1rem; font-size: 1em;">Lieferadresse (Rechnungsadresse):</h5>
													<div style="padding: 1rem; background-color: #f0fdfa; border-left: 3px solid #0f766e; border-radius: 4px;">
														<p style="margin: 0.25rem 0; font-size: 0.95em;"><strong>{kundenDaten.firma ? kundenDaten.firma : `${kundenDaten.vorname} ${kundenDaten.nachname}`}</strong></p>
														{#if kundenDaten.firma}<p style="margin: 0.25rem 0; font-size: 0.95em;">{kundenDaten.vorname} {kundenDaten.nachname}</p>{/if}
														<p style="margin: 0.25rem 0; font-size: 0.95em;">{kundenDaten.strasse}</p>
														<p style="margin: 0.25rem 0; font-size: 0.95em;">{kundenDaten.plz} {kundenDaten.ort}</p>
													</div>
												</div>
											{:else}
												<div style="border-top: 1px solid #dee2e6; padding-top: 1rem; margin-top: 1rem;">
													<h5 style="margin-bottom: 1rem; font-size: 1em;">Abweichende Lieferadresse:</h5>

													{#if existingCustomerId && vorhandeneVersandadressen.length > 0}
														<div style="margin-bottom: 1.5rem;">
															<p style="margin-bottom: 0.75rem; font-weight: 600;">Adresse auswählen *</p>
															<label style="display: block; padding: 1rem; margin-bottom: 0.75rem; border: 2px solid {gewaehlteAdresseId === 'neu' ? '#0f766e' : '#dee2e6'}; border-radius: 8px; cursor: pointer; background-color: {gewaehlteAdresseId === 'neu' ? '#f0fdfa' : '#fff'}; transition: all 0.2s;">
																<input type="radio" name="adressauswahl" value="neu" bind:group={gewaehlteAdresseId} required style="margin-right: 0.75rem; cursor: pointer;" />
																<strong style="font-size: 1em;">➕ Neue Adresse hinzufügen</strong>
															</label>
															{#each vorhandeneVersandadressen as adresse}
																<label style="display: block; padding: 1rem; margin-bottom: 0.75rem; border: 2px solid {gewaehlteAdresseId === adresse.id ? '#0f766e' : '#dee2e6'}; border-radius: 8px; cursor: pointer; background-color: {gewaehlteAdresseId === adresse.id ? '#f0fdfa' : '#fff'}; transition: all 0.2s;">
																	<input type="radio" name="adressauswahl" value={adresse.id} bind:group={gewaehlteAdresseId} required style="margin-right: 0.75rem; cursor: pointer;" />
																	<div style="display: inline-block; vertical-align: top;">
																		<strong style="font-size: 0.95em; display: block; margin-bottom: 0.25rem;">{adresse.data.name}</strong>
																		<span style="font-size: 0.9em; color: #666; display: block;">{adresse.data.street}</span>
																		<span style="font-size: 0.9em; color: #666; display: block;">{adresse.data.zip} {adresse.data.city}</span>
																	</div>
																</label>
															{/each}
														</div>
													{/if}

													{#if !existingCustomerId || gewaehlteAdresseId === 'neu'}
														<div class="form-group">
															<label for="liefer-name">Name / Firma *</label>
															<input type="text" id="liefer-name" bind:value={lieferadresse.name} placeholder="z.B. Max Mustermann oder Musterfirma GmbH" required />
														</div>
														<div class="form-group">
															<label for="liefer-strasse">Straße und Hausnummer *</label>
															<input type="text" id="liefer-strasse" bind:value={lieferadresse.strasse} placeholder="z.B. Musterstraße 123" required />
														</div>
														<div class="form-row" style="display: grid; grid-template-columns: 1fr 2fr; gap: 1rem; margin-bottom: 1rem;">
															<div class="form-group" style="margin-bottom: 0;">
																<label for="liefer-plz">PLZ *</label>
																<input type="text" id="liefer-plz" bind:value={lieferadresse.plz} inputmode="numeric" maxlength="5" minlength="4" placeholder="12345" required />
															</div>
															<div class="form-group" style="margin-bottom: 0;">
																<label for="liefer-ort">Ort *</label>
																<input type="text" id="liefer-ort" bind:value={lieferadresse.ort} required />
															</div>
														</div>
													{:else if gewaehlteAdresseId !== 'neu'}
														<div style="padding: 1rem; background-color: #f0fdfa; border-left: 3px solid #0f766e; border-radius: 4px; margin-top: 1rem;">
															<p style="margin: 0.25rem 0; font-size: 0.95em;"><strong>{lieferadresse.name}</strong></p>
															<p style="margin: 0.25rem 0; font-size: 0.95em;">{lieferadresse.strasse}</p>
															<p style="margin: 0.25rem 0; font-size: 0.95em;">{lieferadresse.plz} {lieferadresse.ort}</p>
														</div>
													{/if}
												</div>
											{/if}

											<div style="margin-top: 1.5rem; padding: 1rem; background-color: #ccfbf1; border: 1px solid #5eead4; border-radius: 4px;">
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
										<input type="checkbox" bind:checked={kundenDaten.datenschutz} required style="margin-right: 0.5rem; margin-top: 0.25rem;" />
										<span style="font-size: 0.9em;">
											Ich habe die <a href="/datenschutz" target="_blank" style="color: #0f766e; text-decoration: underline;">Datenschutzerklärung</a> zur Kenntnis genommen. Ich stimme zu, dass meine Angaben zur Kontaktaufnahme und für Rückfragen dauerhaft gespeichert werden. *
										</span>
									</label>
								</div>

								<div style="font-size: 0.85em; color: #666; margin: 1.5rem 0; padding: 1rem; background-color: #f0fdfa; border-radius: 4px;">
									<strong>Hinweis zum Datenschutz:</strong><br>
									Die von Ihnen eingegebenen Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und gemäß der Datenschutzgrundverordnung (DSGVO) verarbeitet. Ihre Daten werden nicht an Dritte weitergegeben.
								</div>

								<div class="button-group" style="margin-top: 2rem;">
									<button type="submit" class="btn btn-primary" disabled={bestellStatus === 'sending'} style="font-size: 1.1em;">
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
		background: linear-gradient(135deg, #0f766e 0%, #0d4f49 100%);
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
		border-color: #0f766e;
		background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
	}

	/* Produkt-Header */
	.product-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #5eead4;
	}

	.product-header h2 {
		font-size: 1.8rem;
		color: #0f766e;
		margin: 0;
	}

	.btn-back {
		padding: 0.5rem 1rem;
		background: transparent;
		border: 2px solid #5eead4;
		border-radius: 8px;
		color: #0f766e;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.btn-back:hover {
		background: #f0fdfa;
		border-color: #0f766e;
	}

	.calculator-form {
		background: var(--bg-secondary);
		padding: 2.5rem;
		border-radius: 16px;
		border: 1px solid #5eead4;
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
		border-color: #0f766e;
		box-shadow: 0 0 0 3px rgba(15, 118, 110, 0.12);
	}

	input[type="number"]::placeholder {
		color: var(--text-secondary);
		opacity: 0.6;
	}

	.material-info {
		margin-top: 0.75rem;
		padding: 0.875rem 1rem;
		background: linear-gradient(135deg, rgba(15, 118, 110, 0.05) 0%, rgba(15, 118, 110, 0.1) 100%);
		border-left: 3px solid #0f766e;
		border-radius: 6px;
		font-size: 0.9rem;
		line-height: 1.5;
		color: var(--text-secondary);
		animation: slideIn 0.3s ease;
	}

	/* ── Farbwahl-Wizard ──────────────────────────────────────────── */

	.farb-wizard {
		margin-bottom: 1.75rem;
		padding: 1.25rem;
		background: linear-gradient(135deg, rgba(15, 118, 110, 0.04) 0%, rgba(15, 118, 110, 0.10) 100%);
		border: 2px solid #5eead4;
		border-radius: 10px;
	}

	.farb-wizard-header { margin-bottom: 0.75rem; }

	.farb-wizard-titel {
		margin: 0 0 0.25rem;
		font-size: 1rem;
		font-weight: 700;
		color: #0f766e;
		letter-spacing: 0.01em;
	}

	/* Eingegeben Farben als Tags */
	.farb-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.75rem; }

	.farb-tag {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.3rem 0.7rem;
		background: #ccfbf1;
		border: 1px solid #5eead4;
		border-radius: 999px;
		font-size: 0.88rem;
		font-weight: 600;
		color: #0f4e47;
	}

	.farb-tag-remove {
		background: none;
		border: none;
		cursor: pointer;
		font-size: 1rem;
		line-height: 1;
		color: #0f766e;
		padding: 0;
	}

	/* Vorschläge Rückseite */
	.farb-vorschlaege {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.farb-vorschlag-label { font-size: 0.85rem; color: var(--text-secondary); }

	.farb-vorschlag-btn {
		padding: 0.3rem 0.75rem;
		background: #f0fdfa;
		border: 1px dashed #0f766e;
		border-radius: 999px;
		font-size: 0.85rem;
		color: #0f766e;
		cursor: pointer;
		transition: background 0.2s;
	}
	.farb-vorschlag-btn:hover { background: #ccfbf1; }

	/* Eingabe-Block */
	.farb-eingabe-block { display: flex; flex-direction: column; gap: 0.6rem; }

	.farbart-auswahl { display: flex; flex-wrap: wrap; gap: 0.5rem; }

	.farbart-btn {
		padding: 0.45rem 1rem;
		background: var(--bg-primary);
		border: 2px solid var(--border);
		border-radius: 8px;
		font-size: 0.9rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		color: var(--text-primary);
	}
	.farbart-btn:hover { border-color: #0f766e; color: #0f766e; }
	.farbart-btn.aktiv {
		background: #0f766e;
		border-color: #0f766e;
		color: #fff;
	}

	.farb-wert-input {
		width: 100%;
		padding: 0.7rem 1rem;
		font-size: 1rem;
		border: 2px solid var(--border);
		border-radius: 8px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-family: inherit;
		transition: border-color 0.2s;
	}
	.farb-wert-input:focus { outline: none; border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15,118,110,0.12); }

	.farb-fehler {
		padding: 0.5rem 0.75rem;
		background: #fff3cd;
		border-left: 3px solid #ffc107;
		border-radius: 4px;
		font-size: 0.88rem;
		color: #856404;
	}

	.farb-add-btn { margin-top: 0.25rem; }

	.farb-abschliessen-btn { margin-top: 0.75rem; }

	.farb-frage-text {
		margin: 0 0 1rem;
		font-size: 0.95rem;
		color: var(--text-secondary);
	}

	/* Ergebnis-Anzeige */
	.farb-ergebnis { display: flex; flex-direction: column; gap: 0.5rem; }

	.farb-ergebnis-zeile { font-size: 0.95rem; }

	.farb-kennzahl {
		font-size: 1.2rem;
		font-weight: 700;
		color: #0f766e;
		letter-spacing: 0.05em;
		margin-left: 0.35rem;
	}

	.farb-detail {
		padding: 0.5rem 0.75rem;
		background: #f0fdfa;
		border-radius: 6px;
		font-size: 0.88rem;
		line-height: 1.7;
		color: var(--text-secondary);
	}

	.farb-neustart-btn { margin-top: 0.5rem; align-self: flex-start; }

	/* ─────────────────────────────────────────────────────────────── */

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
		background: linear-gradient(135deg, #0f766e 0%, #0d4f49 100%);
		color: #fff;
		box-shadow: 0 4px 15px rgba(15, 118, 110, 0.35);
	}

	.btn-primary:hover {
		transform: translateY(-2px);
		box-shadow: 0 6px 20px rgba(15, 118, 110, 0.45);
		background: linear-gradient(135deg, #0d9488 0%, #0f766e 100%);
	}

	.btn-primary:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.btn-secondary {
		background: transparent;
		color: var(--text-primary);
		border: 2px solid var(--border);
	}

	.btn-secondary:hover {
		background: var(--hover-bg);
		border-color: #0f766e;
	}

	.result-box {
		margin-top: 2rem;
		padding: 2rem;
		background: linear-gradient(135deg, #f0fdfa 0%, #ccfbf1 100%);
		border-radius: 12px;
		border: 2px solid #5eead4;
		animation: slideIn 0.4s ease;
	}

	.result-box :global(strong) {
		color: var(--text-primary);
	}

	.spinner {
		width: 50px;
		height: 50px;
		margin: 0 auto;
		border: 4px solid #ccfbf1;
		border-top: 4px solid #0f766e;
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

	.progress-step.active { opacity: 1; }
	.progress-step.completed { opacity: 1; }

	.progress-step.completed .step-icon {
		background: #0f766e;
		color: white;
		border-color: #0f766e;
	}

	.progress-step.active:not(.completed) .step-icon {
		background: #0f766e;
		color: white;
		border-color: #0f766e;
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
		from { opacity: 0; transform: translateY(20px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@keyframes pulse {
		0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(15, 118, 110, 0.7); }
		50% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(15, 118, 110, 0); }
	}

	@keyframes spin {
		0% { transform: rotate(0deg); }
		100% { transform: rotate(360deg); }
	}

	@keyframes slideIn {
		from { opacity: 0; transform: translateY(-10px); }
		to { opacity: 1; transform: translateY(0); }
	}

	@media (max-width: 768px) {
		main { padding: 2rem 0; }
		h1 { font-size: 2rem; }
		.product-grid { grid-template-columns: 1fr; }
		.product-header { flex-direction: column; gap: 1rem; align-items: flex-start; }
		.calculator-form { padding: 1.5rem; }
		.button-group { flex-direction: column; }
		.btn { width: 100%; }
		.loading-content { padding: 2rem 1rem; }
		.progress-steps { flex-direction: column; gap: 1rem; }
		.progress-step { flex-direction: row; justify-content: flex-start; width: 100%; }
		.step-label { text-align: left; max-width: none; }
	}

	@media (max-width: 640px) {
		.form-row { grid-template-columns: 1fr !important; }
	}

	/* Modernes Styling für Auftragsformular-Eingabefelder */
	.order-form-box input[type="text"],
	.order-form-box input[type="email"],
	.order-form-box input[type="number"],
	.order-form-box input[type="file"],
	.order-form-box select {
		width: 100%;
		padding: 0.75em 1em;
		font-size: 1.08em;
		border: 1.5px solid #5eead4;
		border-radius: 6px;
		margin-top: 0.25em;
		margin-bottom: 0.7em;
		background: #f8fefd;
		transition: border-color 0.2s, box-shadow 0.2s;
		box-sizing: border-box;
	}
	.order-form-box input[type="text"]:focus,
	.order-form-box input[type="email"]:focus,
	.order-form-box input[type="number"]:focus,
	.order-form-box input[type="file"]:focus,
	.order-form-box select:focus {
		border-color: #0f766e;
		outline: none;
		box-shadow: 0 0 0 2px rgba(15, 118, 110, 0.15);
		background: #fff;
	}
	.order-form-box label {
		font-size: 1.08em;
		font-weight: 500;
		margin-bottom: 0.25em;
		color: #0f4e47;
		display: block;
	}
	.order-form-box .form-group {
		margin-bottom: 1.2em;
	}
	.order-form-box input[type="checkbox"],
	.order-form-box input[type="radio"] {
		width: 1.2em;
		height: 1.2em;
		accent-color: #0f766e;
		margin-right: 0.5em;
	}
	.order-form-box input[disabled] {
		background: #e0faf5;
		color: #888;
		cursor: not-allowed;
	}
</style>
