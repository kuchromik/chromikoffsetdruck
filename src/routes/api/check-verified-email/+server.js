import { json } from '@sveltejs/kit';
import { getEmailFromVerification, deleteEmailVerification, cleanupExpiredEmailVerifications } from '$lib/pendingOrders.js';
import { getCustomerByEmail } from '$lib/firebaseService.js';

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
		
		// Bereinige zuerst abgelaufene Verifizierungen
		cleanupExpiredEmailVerifications();
		
		// Hole E-Mail für diesen Token
		const email = getEmailFromVerification(token);
		
		if (!email) {
			return json(
				{ success: false, error: 'E-Mail-Verifizierung nicht gefunden oder bereits abgelaufen. Der Link ist nur 24 Stunden gültig.' },
				{ status: 404 }
			);
		}
		
		// Suche nach existierendem Kunden in Firebase
		const customerResult = await getCustomerByEmail(email);
		
		if (!customerResult.success) {
			// Fehler bei Firebase-Abfrage
			console.error('Fehler beim Suchen des Kunden:', customerResult.error);
			// Trotzdem fortfahren - E-Mail ist verifiziert
		}
		
		// Token löschen (einmalige Verwendung)
		deleteEmailVerification(token);
		
		// Rückgabe: E-Mail und ggf. Kundendaten
		const response = {
			success: true,
			email: email,
			customerExists: !!customerResult.customer,
			customerData: customerResult.customer || null
		};
		
		if (customerResult.customer) {
			console.log('✓ Existierender Kunde gefunden für:', email);
		} else {
			console.log('✓ Neuer Kunde für:', email);
		}
		
		return json(response);

	} catch (error) {
		console.error('Fehler beim Überprüfen der E-Mail-Verifizierung:', error);
		return json(
			{ success: false, error: 'Fehler bei der Verifizierung' },
			{ status: 500 }
		);
	}
}
