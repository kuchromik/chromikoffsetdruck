import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_TO, EMAIL_FROM } from '$env/static/private';
import { getPendingOrder, deletePendingOrder, cleanupExpiredOrders } from '$lib/pendingOrders.js';
import { createJob, formatCustomerName, formatJobDetails } from '$lib/firebaseService.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// Token aus Request holen
		const { token } = await request.json();
		
		if (!token) {
			return json(
				{ success: false, error: 'Kein Token angegeben' },
				{ status: 400 }
			);
		}
		
		// Bereinige zuerst abgelaufene Bestellungen
		cleanupExpiredOrders();
		
		// Hole ausstehende Bestellung
		const pendingOrder = getPendingOrder(token);
		
		if (!pendingOrder) {
			return json(
				{ success: false, error: 'Bestellung nicht gefunden oder bereits abgelaufen. Der Link ist nur 24 Stunden gültig.' },
				{ status: 404 }
			);
		}
		
		const { data, attachments } = pendingOrder;
		
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

		// E-Mail-Text für den Betreiber
		const emailText = `
Neue BESTÄTIGTE Bestellung über Fix&günstig

AUFTRAGSNAME: ${data.auftragsname}
========================================

PRODUKTINFORMATIONEN:
---------------------
Produkt: ${data.produktInfo.produkt}
Format: ${data.produktInfo.format}
Umfang: ${data.produktInfo.umfang}
Auflage: ${data.produktInfo.auflage} Stück
Material: ${data.produktInfo.material}

PREISBERECHNUNG:
----------------
Gesamtpreis (netto): ${data.preise.gesamtpreisNetto.toFixed(2)} €
MwSt. (19%): ${data.preise.mwstBetrag.toFixed(2)} €
GESAMTPREIS (brutto): ${data.preise.gesamtpreisBrutto.toFixed(2)} €

${data.preise.versandkosten ? `VERSANDKOSTEN:
--------------
Netto: ${data.preise.versandkosten.netto.toFixed(2)} €
MwSt. (19%): ${data.preise.versandkosten.mwst.toFixed(2)} €
Brutto: ${data.preise.versandkosten.brutto.toFixed(2)} €

GESAMTPREIS INKL. VERSAND:
--------------------------
Netto: ${data.preise.gesamtpreisNettoMitVersand.toFixed(2)} €
MwSt. (19%): ${data.preise.mwstBetragMitVersand.toFixed(2)} €
BRUTTO: ${data.preise.gesamtpreisBruttoMitVersand.toFixed(2)} €

` : ''}KUNDENDATEN:
------------
Name: ${data.kunde.vorname} ${data.kunde.nachname}
${data.kunde.firma ? `Firma: ${data.kunde.firma}\n` : ''}Adresse: ${data.kunde.strasse}
         ${data.kunde.plz} ${data.kunde.ort}
E-Mail: ${data.kunde.email}

LIEFERUNG:
----------
${data.lieferung.art === 'abholung' ? `Art: Abholung
Abholadresse: Marie-Curie-Straße 8 in 15236 Frankfurt (Oder)
Abholzeiten: Montag bis Donnerstag, 9:00 - 15:00 Uhr oder nach Absprache` : 
`Art: Versand per DPD
${data.lieferung.lieferadresse ? `Lieferadresse (abweichend von Rechnungsadresse):
${data.lieferung.lieferadresse.name}
${data.lieferung.lieferadresse.strasse}
${data.lieferung.lieferadresse.plz} ${data.lieferung.lieferadresse.ort}` : 
`Lieferadresse: Rechnungsadresse
${data.lieferung.rechnungsadresse.strasse}
${data.lieferung.rechnungsadresse.plz} ${data.lieferung.rechnungsadresse.ort}`}`}

Datenschutz akzeptiert: ${data.kunde.datenschutz ? 'Ja' : 'Nein'}
${attachments.length > 0 ? `\nAnhang: ${attachments.map(a => a.filename).join(', ')}` : ''}

HINWEIS: Diese Bestellung wurde vom Kunden per E-Mail-Bestätigungslink verifiziert.
		`;

		// Bestellung sofort aus temporärem Speicher löschen
		deletePendingOrder(token);
		
		// E-Mails ASYNCHRON im Hintergrund versenden (blockiert nicht die Antwort)
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
`${data.lieferung.rechnungsadresse.strasse}
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

		// Sofort Erfolgsantwort zurückgeben (bevor E-Mails versendet werden)
		// Dies verhindert lange Wartezeiten bei großen PDF-Anhängen
		const responsePromise = json({ 
			success: true,
			message: 'Bestellung erfolgreich bestätigt'
		});
		
		// E-Mails ASYNCHRON im Hintergrund versenden (fire-and-forget)
		// Dies blockiert nicht die HTTP-Antwort an den Client
		(async () => {
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
				
				// Logge erfolgreichen Versand
				console.log('✓ Bestellung erfolgreich per E-Mail versendet an:', EMAIL_TO);
				console.log('✓ Bestätigungsmail an Kunden gesendet:', data.kunde.email);
				if (attachments.length > 0) {
					console.log(`  Mit PDF-Anhang:`, attachments.map(a => a.filename).join(', '));
				}
				
				// Job in Firebase speichern (nach erfolgreichem E-Mail-Versand)
				const jobResult = await createJob({
					jobname: data.auftragsname,
					amount: data.preise.gesamtpreisNetto,
					customer: formatCustomerName(data.kunde),
					details: formatJobDetails(data.produktInfo),
					quantity: data.produktInfo.auflage,
					producer: 'doe' // Digitaldruck
				});
				
				if (jobResult.success) {
					console.log('✓ Job erfolgreich in Firebase gespeichert. Job-ID:', jobResult.jobId);
				} else {
					console.error('✗ Fehler beim Speichern in Firebase:', jobResult.error);
					// E-Mails wurden bereits versendet, Job-Speicherung ist optional
				}
				
			} catch (error) {
				console.error('✗ Fehler beim Versenden der E-Mails (asynchron):', error);
				// Hinweis: Der Benutzer hat bereits eine Erfolgsbestätigung erhalten
				// In einer produktiven Umgebung sollte hier ggf. eine Benachrichtigung erfolgen
			}
		})();
		
		return responsePromise;

	} catch (error) {
		console.error('Fehler beim Bestätigen der Bestellung:', error);
		return json(
			{ success: false, error: 'Fehler beim Verarbeiten der Bestellung' },
			{ status: 500 }
		);
	}
}
