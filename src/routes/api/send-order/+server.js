import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_TO, EMAIL_FROM } from '$env/static/private';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// FormData verarbeiten
		const formData = await request.formData();
		const dataString = formData.get('data');
		const data = JSON.parse(dataString);
		
		// PDF-Dateien extrahieren
		const attachments = [];
		let fileIndex = 0;
		while (formData.has(`pdf${fileIndex}`)) {
			const file = formData.get(`pdf${fileIndex}`);
			if (file && file.size > 0) {
				// Datei in Buffer konvertieren
				const arrayBuffer = await file.arrayBuffer();
				const buffer = Buffer.from(arrayBuffer);
				
				attachments.push({
					filename: file.name,
					content: buffer,
					contentType: 'application/pdf'
				});
			}
			fileIndex++;
		}
		
		// Nodemailer mit Umgebungsvariablen konfigurieren
		const port = Number(EMAIL_PORT);
		const secure = EMAIL_SECURE === 'true';
		
		const transporter = nodemailer.createTransport({
			host: EMAIL_HOST,
			port: port,
			secure: secure, // true für Port 465, false für andere Ports (587, 25)
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASS
			},
			// TLS-Optionen für bessere Kompatibilität
			tls: {
				// Nicht SSL-Zertifikat-Fehler ignorieren in Produktion
				rejectUnauthorized: true,
				// Mindest-TLS-Version
				minVersion: 'TLSv1.2'
			},
			// Bei Port 587: STARTTLS erzwingen
			requireTLS: !secure,
			connectionTimeout: 10000, // 10 Sekunden
			greetingTimeout: 10000,
			socketTimeout: 20000, // 20 Sekunden
			logger: false,
			debug: false
		});

		const emailText = `
Neue Bestellung über Extraladen (Offsetdruck)

AUFTRAGSNAME: ${data.auftragsname}
========================================

PRODUKTINFORMATIONEN:
---------------------
Produkt: ${data.produktInfo.produkt}
Format: ${data.produktInfo.format}
Umfang: ${data.produktInfo.umfang}
Farbigkeit: ${data.produktInfo.farbigkeit || '-'}
${data.produktInfo.farbenVorderseite?.length ? `Farben Vorderseite: ${data.produktInfo.farbenVorderseite.join(', ')}
` : ''}${data.produktInfo.farbenRueckseite?.length ? `Farben R\u00fcckseite: ${data.produktInfo.farbenRueckseite.join(', ')}
` : ''}Auflage: ${data.produktInfo.auflage} St\u00fcck
Material: ${data.produktInfo.material}

KALKULATION (vollst\u00e4ndig):
----------------------------
Grundpreis:         ${data.preise.grundpreis?.toFixed(2)} \u20ac
Druckkosten:        ${data.preise.druckkosten?.toFixed(2)} \u20ac
  (${data.preise.klickanzahl} + ${data.preise.andruckBogen} Andruckbogen = ${(data.preise.klickanzahl || 0) + (data.preise.andruckBogen || 0)} Klicks/Durchgang${data.preise.druckDurchgaenge > 1 ? ` x ${data.preise.druckDurchgaenge} Durchgaenge` : ''} x ${data.preise.faktoren?.klickkosten?.toFixed(2) ?? '0.02'} EUR)
Materialkosten:     ${data.preise.materialkosten?.toFixed(2)} \u20ac
  (${data.preise.anzahlDruckbogen} + ${data.preise.andruckBogen} Andruckbogen = ${(data.preise.anzahlDruckbogen || 0) + (data.preise.andruckBogen || 0)} Bogen)
Schneidekosten:     ${data.preise.schneidekosten?.toFixed(2)} \u20ac
  (${data.preise.schneidelagen} Lagen x Faktor ${data.preise.schneideaufwandsfaktor} x ${data.preise.kostenJeSchnitt?.toFixed(2)} EUR)
${(data.preise.farbigkeitSummand > 0) ? `Farbwechselkosten:  ${data.preise.farbigkeitSummand?.toFixed(2)} EUR (${data.produktInfo.farbigkeit})
` : ''}${(data.preise.anzahlDruckplatten > 0) ? `Druckplatten:       ${data.preise.druckplattenkosten?.toFixed(2)} EUR (${data.preise.anzahlDruckplatten} x ${data.preise.kostenJeDruckplatte?.toFixed(2)} EUR)
` : ''}                    ----------
Summe netto:        ${data.preise.gesamtpreisNetto?.toFixed(2)} \u20ac
MwSt. 19 %:         ${data.preise.mwstBetrag?.toFixed(2)} \u20ac
Gesamtpreis brutto: ${data.preise.gesamtpreisBrutto?.toFixed(2)} \u20ac

GEWICHT & VERSAND:
------------------
Gesamtgewicht: ${data.preise.gesamtgewichtKg?.toFixed(2)} kg
${data.preise.versandkosten ? `Versand: ${data.preise.anzahlPakete} Paket(e) a max. ${data.preise.maxPaketgewichtKg} kg
Versandkosten netto:  ${data.preise.versandkostenNetto?.toFixed(2)} EUR
Versandkosten brutto: ${data.preise.versandkostenBrutto?.toFixed(2)} EUR

GESAMT INKL. VERSAND:
Netto:  ${data.preise.gesamtpreisNettoMitVersand?.toFixed(2)} EUR
MwSt.:  ${data.preise.mwstBetragMitVersand?.toFixed(2)} EUR
Brutto: ${data.preise.gesamtpreisBruttoMitVersand?.toFixed(2)} EUR
` : 'Lieferart: Abholung (keine Versandkosten)\n'}
KUNDENDATEN:
------------
Name: ${data.kunde.vorname} ${data.kunde.nachname}
${data.kunde.firma ? `Firma: ${data.kunde.firma}\n` : ''}Adresse: ${data.kunde.strasse}
         ${data.kunde.plz} ${data.kunde.ort}
E-Mail: ${data.kunde.email}

LIEFERUNG:
----------
${data.lieferung.art === 'abholung' ? `Art: Abholung
Abholadresse: Marie-Curie-Stra\u00dfe 8 in 15236 Frankfurt (Oder)
Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache` : 
`Art: Versand per DPD
${data.lieferung.lieferadresse ? `Lieferadresse (abweichend von Rechnungsadresse):
${data.lieferung.lieferadresse.name}
${data.lieferung.lieferadresse.strasse}
${data.lieferung.lieferadresse.plz} ${data.lieferung.lieferadresse.ort}` : 
`Lieferadresse: Rechnungsadresse
${data.kunde.firma ? data.kunde.firma + '\n' : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.lieferung.rechnungsadresse.strasse}
${data.lieferung.rechnungsadresse.plz} ${data.lieferung.rechnungsadresse.ort}`}`}

Datenschutz akzeptiert: ${data.kunde.datenschutz ? 'Ja' : 'Nein'}
${attachments.length > 0 ? `\nAnhang: ${attachments.map(a => a.filename).join(', ')}` : ''}
		`;

		// E-Mail an Sie (mit Anhängen)
		await transporter.sendMail({
			from: EMAIL_FROM,
			to: EMAIL_TO,
			replyTo: data.kunde.email,
			subject: `Neue Bestellung: ${data.auftragsname} - ${data.kunde.nachname}`,
			text: emailText,
			attachments: attachments // PDF-Anhänge hinzufügen
		});
		
		// Bestätigungsmail an den Kunden (ohne Anhänge)
		const kundenEmailText = `
Guten Tag ${data.kunde.vorname} ${data.kunde.nachname},

vielen Dank für Ihre Bestellung bei Chromik Offsetdruck!

Wir haben Ihre Anfrage erhalten und werden diese schnellstmöglich prüfen. 
Sie erhalten in Kürze eine detaillierte Auftragsbestätigung von uns.

IHRE BESTELLUNG:
----------------
Auftragsname: ${data.auftragsname}
Produkt: ${data.produktInfo.produkt}
Format: ${data.produktInfo.format}
${data.produktInfo.umfang !== '-' ? `Umfang: ${data.produktInfo.umfang}\n` : ''}Auflage: ${data.produktInfo.auflage} Stück
Material: ${data.produktInfo.material}

PREISÜBERSICHT:
---------------
Produktpreis (inkl. 19% MwSt.): ${data.preise.gesamtpreisBrutto.toFixed(2)} €
${data.preise.versandkosten ? `Versandkosten (inkl. 19% MwSt.): ${data.preise.versandkosten.brutto.toFixed(2)} €

GESAMTPREIS INKL. VERSAND: ${data.preise.gesamtpreisBruttoMitVersand.toFixed(2)} €` : 
`\nGESAMTPREIS: ${data.preise.gesamtpreisBrutto.toFixed(2)} €`}

LIEFERUNG:
----------
${data.lieferung.art === 'abholung' ? `Abholung bei:
Chromik Offsetdruck
Marie-Curie-Straße 8
15236 Frankfurt (Oder)

Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache` :
`Versand per DPD an:
${data.lieferung.lieferadresse ? 
`${data.lieferung.lieferadresse.name}
${data.lieferung.lieferadresse.strasse}
${data.lieferung.lieferadresse.plz} ${data.lieferung.lieferadresse.ort}` :
`${data.kunde.firma ? data.kunde.firma + '\n' : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.lieferung.rechnungsadresse.strasse}
${data.lieferung.rechnungsadresse.plz} ${data.lieferung.rechnungsadresse.ort}`}`}

IHRE KONTAKTDATEN:
------------------
${data.kunde.firma ? `${data.kunde.firma}\n` : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.kunde.strasse}
${data.kunde.plz} ${data.kunde.ort}
E-Mail: ${data.kunde.email}

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Team von Chromik Offsetdruck

---
Chromik Offsetdruck
Telefon: 0151-52457061
E-Mail: ${EMAIL_FROM}
Web: www.chromikoffsetdruck.de
		`;

		await transporter.sendMail({
			from: EMAIL_FROM,
			to: data.kunde.email,
			subject: 'Ihre Bestellung bei Chromik Offsetdruck',
			text: kundenEmailText
		});
		
		// Logge erfolgreichen Versand
		console.log('✓ Bestellung erfolgreich per E-Mail versendet an:', EMAIL_TO);
		console.log('✓ Bestätigungsmail an Kunden gesendet:', data.kunde.email);
		if (attachments.length > 0) {
			console.log(`  Mit PDF-Anhang:`, attachments.map(a => a.filename).join(', '));
		}
		
		return json({ 
			success: true,
			message: 'Bestellung erfolgreich versendet'
		});

	} catch (error) {
		console.error('Fehler beim Verarbeiten der Bestellung:', error);
		return json(
			{ success: false, error: 'Fehler beim Senden der Bestellung' },
			{ status: 500 }
		);
	}
}
