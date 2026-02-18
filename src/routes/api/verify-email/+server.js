import { json } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } from '$env/static/private';
import { env } from '$env/dynamic/public';
import { saveEmailVerification } from '$lib/pendingOrders.js';

/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		// E-Mail und optionalen orderState aus Request holen
		const { email, orderState } = await request.json();
		
		if (!email) {
			return json(
				{ success: false, error: 'Keine E-Mail-Adresse angegeben' },
				{ status: 400 }
			);
		}
		
		// E-Mail-Verifizierung speichern (mit orderState) und Token generieren
		const token = await saveEmailVerification(email, orderState);
		
		// Verifizierungslink erstellen
		const baseUrl = env.PUBLIC_BASE_URL || `https://${request.headers.get('host')}`;
		const verificationLink = `${baseUrl}/fixguenstig?emailToken=${token}`;
		
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

		// Verifizierungs-E-Mail
		const verificationEmailText = `
Guten Tag,

vielen Dank für Ihr Interesse an Chromik Offsetdruck!

Um sicherzustellen, dass diese E-Mail-Adresse Ihnen gehört, bitten wir Sie,
Ihre E-Mail-Adresse zu verifizieren, indem Sie auf den folgenden Link klicken:

${verificationLink}

Nach der Verifizierung können Sie mit Ihrer Bestellung fortfahren.

WICHTIG:
--------
- Dieser Verifizierungslink ist 24 Stunden gültig
- Nach der Verifizierung werden Ihre bisherigen Kundendaten automatisch geladen (falls vorhanden)
- Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail ignorieren

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
			to: email,
			subject: 'Bitte verifizieren Sie Ihre E-Mail-Adresse',
			text: verificationEmailText
		});
		
		// Logge erfolgreichen Versand
		console.log('✓ E-Mail-Verifizierungs-Mail gesendet an:', email);
		console.log('✓ Token:', token);
		
		return json({ 
			success: true,
			message: 'Bitte überprüfen Sie Ihr E-Mail-Postfach und verifizieren Sie Ihre E-Mail-Adresse.'
		});

	} catch (error) {
		console.error('Fehler beim Verarbeiten der E-Mail-Verifizierungs-Anfrage:', error);
		return json(
			{ success: false, error: 'Fehler beim Senden der Verifizierungs-Mail' },
			{ status: 500 }
		);
	}
}
