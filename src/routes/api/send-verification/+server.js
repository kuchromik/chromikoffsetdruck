import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '$env/static/private';
import { PUBLIC_BASE_URL } from '$env/static/public';
import { savePendingOrder } from '$lib/pendingOrders.js';

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
		
		// Bestellung temporär speichern und Token generieren
		const token = savePendingOrder(data, attachments);
		
		// Bestätigungslink erstellen
		const baseUrl = PUBLIC_BASE_URL || `https://${request.headers.get('host')}`;
		const verificationLink = `${baseUrl}/bestellung/bestaetigen?token=${token}`;
		
		// Nodemailer konfigurieren
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

		// Verifizierungs-E-Mail an den Kunden
		const verificationEmailText = `
Guten Tag ${data.kunde.vorname} ${data.kunde.nachname},

Sie haben eine Bestellung bei Chromik Offsetdruck aufgegeben.

Um sicherzustellen, dass diese E-Mail-Adresse Ihnen gehört, bitten wir Sie,
Ihre Bestellung zu bestätigen, indem Sie auf den folgenden Link klicken:

${verificationLink}

IHRE BESTELLUNG:
----------------
Auftragsname: ${data.auftragsname}
Produkt: ${data.produktInfo.produkt}
Format: ${data.produktInfo.format}
${data.produktInfo.umfang !== '-' ? `Umfang: ${data.produktInfo.umfang}\n` : ''}Auflage: ${data.produktInfo.auflage} Stück
Material: ${data.produktInfo.material}

Gesamtpreis: ${data.preise.gesamtpreisBruttoMitVersand ? data.preise.gesamtpreisBruttoMitVersand.toFixed(2) : data.preise.gesamtpreisBrutto.toFixed(2)} €

WICHTIG:
--------
- Dieser Bestätigungslink ist 24 Stunden gültig
- Erst nach Ihrer Bestätigung wird die Bestellung bearbeitet
- Falls Sie diese Bestellung nicht aufgegeben haben, können Sie diese E-Mail ignorieren

Bei Fragen stehen wir Ihnen gerne zur Verfügung.

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
			subject: 'Bitte bestätigen Sie Ihre Bestellung bei Chromik Offsetdruck',
			text: verificationEmailText
		});
		
		// Logge erfolgreichen Versand
		console.log('✓ Verifizierungs-Mail gesendet an:', data.kunde.email);
		console.log('✓ Token:', token);
		
		return json({ 
			success: true,
			message: 'Bitte überprüfen Sie Ihr E-Mail-Postfach und bestätigen Sie Ihre Bestellung.'
		});

	} catch (error) {
		console.error('Fehler beim Verarbeiten der Verifizierungs-Anfrage:', error);
		return json(
			{ success: false, error: 'Fehler beim Senden der Verifizierungs-Mail' },
			{ status: 500 }
		);
	}
}
