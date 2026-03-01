import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_TO, EMAIL_FROM } from '$env/static/private';
import { createJob, createCustomer, updateCustomer, formatCustomerName, formatJobDetails, createShipmentAddress } from '$lib/firebaseService.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// FormData verarbeiten
		const formData = await request.formData();
		const dataString = formData.get('data');
		const existingCustomerIdString = formData.get('existingCustomerId');
		
		const data = JSON.parse(dataString);
		const existingCustomerId = existingCustomerIdString && existingCustomerIdString !== 'null' ? existingCustomerIdString : null;
		
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
			secure: secure,
			auth: {
				user: EMAIL_USER,
				pass: EMAIL_PASS
			},
			tls: {
				rejectUnauthorized: true,
				minVersion: 'TLSv1.2'
			},
			requireTLS: !secure,
			connectionTimeout: 10000,
			greetingTimeout: 10000,
			socketTimeout: 20000,
			logger: false,
			debug: false
		});
		
		// Berechne Deadline für PDF-Upload (24 Stunden nach jobstart)
		const jobstartTime = Date.now();
		const deadlineTime = new Date(jobstartTime + 24 * 60 * 60 * 1000);
		const deadlineFormatted = deadlineTime.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' um ' + deadlineTime.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' }) + ' Uhr';

		// Firebase-Operationen ZUERST ausführen (vor E-Mail-Versand)
		// Kundendaten in Firebase speichern oder aktualisieren
		let customerId = existingCustomerId;
		let customerResult;
		
		if (existingCustomerId) {
			// Existierenden Kunden aktualisieren
			customerResult = await updateCustomer(existingCustomerId, {
				firstName: data.kunde.vorname,
				lastName: data.kunde.nachname,
				email: data.kunde.email,
				address: data.kunde.strasse,
				zip: data.kunde.plz,
				city: data.kunde.ort,
				company: data.kunde.firma || '',
				countryCode: 'DE'
			});
			
			if (customerResult.success) {
				console.log('✓ Kunde erfolgreich aktualisiert in Firebase. Kunden-ID:', existingCustomerId);
			} else {
				console.error('✗ Fehler beim Aktualisieren des Kunden in Firebase:', customerResult.error);
			}
		} else {
			// Neuen Kunden anlegen
			customerResult = await createCustomer({
				firstName: data.kunde.vorname,
				lastName: data.kunde.nachname,
				email: data.kunde.email,
				address: data.kunde.strasse,
				zip: data.kunde.plz,
				city: data.kunde.ort,
				company: data.kunde.firma || '',
				countryCode: 'DE'
			});
			
			if (customerResult.success) {
				customerId = customerResult.customerId;
				console.log('✓ Neuer Kunde erfolgreich in Firebase gespeichert. Kunden-ID:', customerId);
			} else {
				console.error('✗ Fehler beim Speichern des Kunden in Firebase:', customerResult.error);
			}
		}
		
		// Versandadresse in Firebase speichern (falls vorhanden und abweichend)
		let shipmentAddressId = null;
		
		if (data.lieferung.art === 'versand' && data.lieferung.lieferadresse) {
			// Abweichende Lieferadresse vorhanden
			const addressResult = await createShipmentAddress({
				name: data.lieferung.lieferadresse.name,
				street: data.lieferung.lieferadresse.strasse,
				zip: data.lieferung.lieferadresse.plz,
				city: data.lieferung.lieferadresse.ort,
				customerId: customerId || null
			});
			
			if (addressResult.success) {
				shipmentAddressId = addressResult.addressId;
				if (addressResult.isExisting) {
					console.log('✓ Existierende Versandadresse wiederverwendet. Adress-ID:', shipmentAddressId);
				} else {
					console.log('✓ Neue Versandadresse in Firebase gespeichert. Adress-ID:', shipmentAddressId);
				}
			} else {
				console.error('✗ Fehler beim Verarbeiten der Versandadresse in Firebase:', addressResult.error);
			}
		}
		
		// Job in Firebase speichern (mit customerId)
		const jobResult = await createJob({
			jobname: data.auftragsname,
			amount: data.preise.gesamtpreisNetto,
			customer: formatCustomerName(data.kunde),
			details: formatJobDetails(data.produktInfo),
			quantity: data.produktInfo.auflage,
			producer: data.producer || 'doe',
			toShip: data.lieferung.art === 'versand',
			shipmentAddressId: shipmentAddressId,
			customerId: customerId,
			billingAddress: data.abweichendeRechnungsadresse || null,
			billingEmail: data.abweichendeRechnungsEmail || null
		});
		
		if (jobResult.success) {
			console.log('✓ Job erfolgreich in Firebase gespeichert. Job-ID:', jobResult.jobId);
		} else {
			console.error('✗ Fehler beim Speichern in Firebase:', jobResult.error);
			// Weiter mit E-Mail-Versand, auch wenn Job nicht gespeichert wurde
		}
		
		// Farbigkeit-Label für E-Mails aufbauen (nur Offsetdruck / extraladen)
		const farbigkeitLabel = (() => {
			const vs = data.produktInfo.farbenVorderseite;
			if (!Array.isArray(vs) || vs.length === 0) return null;
			const rs = Array.isArray(data.produktInfo.farbenRueckseite) && data.produktInfo.farbenRueckseite.length > 0
				? data.produktInfo.farbenRueckseite.join(', ')
				: 'keine';
			return `${data.produktInfo.farbigkeit}-farbig ${vs.join(', ')} / ${rs}`;
		})();

		// E-Mail-Text für den Betreiber (NACH Firebase-Job-Erstellung, mit echter jobId)
		const emailText = `
Neue BESTÄTIGTE Bestellung

AUFTRAGSNAME: ${data.auftragsname}
========================================

PRODUKTINFORMATIONEN:
---------------------
Produkt: ${data.produktInfo.produkt}
Format: ${data.produktInfo.format}
${data.produktInfo.umfang && data.produktInfo.umfang !== '-' ? `Umfang: ${data.produktInfo.umfang}\n` : ''}${data.produktInfo.falzart && data.produktInfo.falzart !== '-' ? `Falzart: ${data.produktInfo.falzart}\n` : ''}${farbigkeitLabel ? `Farbigkeit: ${farbigkeitLabel}\n` : ''}Auflage: ${data.produktInfo.auflage} Stück
Material: ${data.produktInfo.material}

KALKULATION:
------------
Anzahl Druckbogen: ${data.preise.anzahlDruckbogen}
Klickanzahl: ${data.preise.klickanzahl}

Grundpreis: ${data.preise.grundpreis.toFixed(2)} €
Druckkosten: ${data.preise.druckkosten.toFixed(2)} €
Materialkosten: ${data.preise.materialkosten.toFixed(2)} €
Schneidekosten: ${data.preise.schneidekosten.toFixed(2)} €
${data.preise.farbigkeitSummand > 0 ? `Farbwechselkosten: ${data.preise.farbigkeitSummand.toFixed(2)} €\n` : ''}${data.preise.zusatzkosten > 0 ? `${data.preise.zusatzkostenName}: ${data.preise.zusatzkosten.toFixed(2)} €\n` : ''}
--------------------
Produktpreis netto: ${data.preise.gesamtpreisNetto.toFixed(2)} €
${data.preise.versandkosten ? `Versandkosten netto: ${data.preise.versandkosten.netto.toFixed(2)} €\n` : ''}${data.preise.versandkosten ? `--------------------\nGesamtpreis netto: ${data.preise.gesamtpreisNettoMitVersand.toFixed(2)} €\n` : ''}
zzgl. 19% MwSt.: ${(data.preise.versandkosten ? data.preise.mwstBetragMitVersand : data.preise.mwstBetrag).toFixed(2)} €
--------------------
GESAMTPREIS BRUTTO: ${(data.preise.versandkosten ? data.preise.gesamtpreisBruttoMitVersand : data.preise.gesamtpreisBrutto).toFixed(2)} €

KUNDENDATEN:
------------
${data.kunde.firma ? `Firma: ${data.kunde.firma}\n` : ''}Vorname: ${data.kunde.vorname}
Nachname: ${data.kunde.nachname}
${data.kunde.firma ? `Firma: ${data.kunde.firma}\n` : ''}Adresse: ${data.kunde.strasse}
         ${data.kunde.plz} ${data.kunde.ort}
E-Mail: ${data.kunde.email}

${data.abweichendeRechnungsadresse ? `ABWEICHENDE RECHNUNGSADRESSE:
---------------------------------
Firma: ${data.abweichendeRechnungsadresse.firma}
Adresse: ${data.abweichendeRechnungsadresse.strasse}
         ${data.abweichendeRechnungsadresse.plz} ${data.abweichendeRechnungsadresse.ort}
Land: ${data.abweichendeRechnungsadresse.land}

` : ''}${data.abweichendeRechnungsEmail ? `ABWEICHENDE E-MAIL FÜR RECHNUNGSVERSAND:
-----------------------------------------
E-Mail: ${data.abweichendeRechnungsEmail}

` : ''}LIEFERUNG:
----------
${data.lieferung.art === 'abholung' ? `Art: Abholung
Abholadresse: Marie-Curie-Straße 8 in 15236 Frankfurt (Oder)
Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache` : 
`Art: Versand per DPD
${data.lieferung.lieferadresse ? `Lieferadresse (abweichend von Rechnungsadresse):
${data.lieferung.lieferadresse.name}
${data.lieferung.lieferadresse.strasse}
${data.lieferung.lieferadresse.plz} ${data.lieferung.lieferadresse.ort}` :
`Lieferadresse: ${data.kunde.firma ? data.kunde.firma + '\n' : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.lieferung.rechnungsadresse.strasse}
${data.lieferung.rechnungsadresse.plz} ${data.lieferung.rechnungsadresse.ort}`}`}

Datenschutz akzeptiert: ${data.kunde.datenschutz ? 'Ja' : 'Nein'}
${attachments.length > 0 ? `\nAnhang: ${attachments.map(a => a.filename).join(', ')}` : `\n⚠️  ACHTUNG: KEINE DRUCKDATEI HOCHGELADEN!\n   --> Kunde muss PDF bis ${deadlineFormatted} an daten.chromik@online.de senden\n   --> Job-ID: ${jobResult.success && jobResult.jobId ? jobResult.jobId : '[N/A]'}`}

HINWEIS: Diese Bestellung wurde vom Kunden per E-Mail-Verifizierung bestätigt.
${existingCustomerId ? '\n[BESTANDSKUNDE - Kundendaten wurden aktualisiert]' : '\n[NEUKUNDE - Erstbestellung]'}
		`;
		
		// Bestätigungsmail-Text für den Kunden (NACH Firebase-Job-Erstellung)
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
${data.produktInfo.umfang && data.produktInfo.umfang !== '-' ? `Umfang: ${data.produktInfo.umfang}\n` : ''}${data.produktInfo.falzart && data.produktInfo.falzart !== '-' ? `Falzart: ${data.produktInfo.falzart}\n` : ''}${farbigkeitLabel ? `Farbigkeit: ${farbigkeitLabel}\n` : ''}Auflage: ${data.produktInfo.auflage} Stück
Material: ${data.produktInfo.material}

PREIS:
------
Produktpreis (brutto): ${data.preise.gesamtpreisBrutto.toFixed(2)} €
${data.preise.versandkosten ? `Versandkosten (brutto): ${data.preise.versandkosten.brutto.toFixed(2)} €\n` : ''}${data.preise.versandkosten ? `------\nGesamtpreis (brutto): ${data.preise.gesamtpreisBruttoMitVersand.toFixed(2)} €` : ''}

LIEFERUNG:
----------
${data.lieferung.art === 'abholung' ? `Art: Abholung
Abholadresse: Marie-Curie-Straße 8 in 15236 Frankfurt (Oder)
Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache` :
`Art: Versand per DPD
${data.lieferung.lieferadresse ? 
`Lieferadresse:
${data.lieferung.lieferadresse.name}
${data.lieferung.lieferadresse.strasse}
${data.lieferung.lieferadresse.plz} ${data.lieferung.lieferadresse.ort}` :
`Lieferadresse:
${data.kunde.firma ? data.kunde.firma + '\\n' : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.lieferung.rechnungsadresse.strasse}
${data.lieferung.rechnungsadresse.plz} ${data.lieferung.rechnungsadresse.ort}`}`}

IHRE KONTAKTDATEN:
------------------
${data.kunde.firma ? `${data.kunde.firma}\n` : ''}${data.kunde.vorname} ${data.kunde.nachname}
${data.kunde.strasse}
${data.kunde.plz} ${data.kunde.ort}
E-Mail: ${data.kunde.email}
${data.abweichendeRechnungsadresse ? `

ABWEICHENDE RECHNUNGSADRESSE:
------------------------------
${data.abweichendeRechnungsadresse.firma}
${data.abweichendeRechnungsadresse.strasse}
${data.abweichendeRechnungsadresse.plz} ${data.abweichendeRechnungsadresse.ort}
Land: ${data.abweichendeRechnungsadresse.land}` : ''}${data.abweichendeRechnungsEmail ? `

ABWEICHENDE E-MAIL FÜR RECHNUNGSVERSAND:
-----------------------------------------
${data.abweichendeRechnungsEmail}` : ''}
${attachments.length === 0 ? `

════════════════════════════════════════════════════════════════
⚠️  WICHTIG: DRUCKDATEI ERFORDERLICH
════════════════════════════════════════════════════════════════

Sie haben noch keine Druckdatei hochgeladen!

Bitte senden Sie bis ${deadlineFormatted} 
die Druckdatei (PDF) an:

📧  daten.chromik@online.de

Geben Sie dabei bitte im Betreff die Job-ID an:
${jobResult.success && jobResult.jobId ? jobResult.jobId : '[wird nachgereicht]'}

Ohne Druckdatei können wir Ihren Auftrag leider nicht bearbeiten.

════════════════════════════════════════════════════════════════
` : ''}

Bei Rückfragen stehen wir Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen
Ihr Team von Chromik Offsetdruck

---
Chromik Offsetdruck
Telefon: 0151-52457061
E-Mail: ${EMAIL_FROM}
Web: www.chromikoffsetdruck.de
		`;
		
		// E-Mails versenden (nach Firebase-Operationen)
		try {
			// E-Mail an Betreiber (mit Anhängen)
			await transporter.sendMail({
				from: EMAIL_FROM,
				to: EMAIL_TO,
				replyTo: data.kunde.email,
				subject: `Neue Bestellung: ${data.auftragsname} - ${data.kunde.nachname}`,
				text: emailText,
				attachments: attachments
			});
			
			// Bestätigungsmail an den Kunden (ohne Anhänge)
			await transporter.sendMail({
				from: EMAIL_FROM,
				to: data.kunde.email,
				subject: 'Ihre Bestellung bei Chromik Offsetdruck',
				text: kundenEmailText
			});
			
			console.log('✓ Bestellung erfolgreich per E-Mail versendet an:', EMAIL_TO);
			console.log('✓ Bestätigungsmail an Kunden gesendet:', data.kunde.email);
			if (attachments.length > 0) {
				console.log(`  Mit PDF-Anhang:`, attachments.map(a => a.filename).join(', '));
			}
		} catch (emailError) {
			console.error('✗ Fehler beim Versenden der E-Mails:', emailError);
			// Firebase-Daten sind bereits gespeichert, E-Mail-Fehler ist nicht kritisch
		}
		
		// Erfolgsantwort zurückgeben (nachdem alles abgeschlossen ist)
		return json({ 
			success: true,
			message: 'Bestellung erfolgreich abgeschickt',
			jobId: jobResult.success ? jobResult.jobId : null
		});

	} catch (error) {
		console.error('Fehler beim Verarbeiten der Bestellung:', error);
		return json(
			{ success: false, error: 'Fehler beim Verarbeiten der Bestellung' },
			{ status: 500 }
		);
	}
}
