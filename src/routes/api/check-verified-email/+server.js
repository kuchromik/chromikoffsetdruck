import { json } from '@sveltejs/kit';
import { getEmailVerification, deleteEmailVerification, cleanupExpiredEmailVerifications } from '$lib/pendingOrders.js';
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
		
		// Hole E-Mail und orderState für diesen Token
		const verification = getEmailVerification(token);
		
		if (!verification) {
			return json(
				{ success: false, error: 'E-Mail-Verifizierung nicht gefunden oder bereits abgelaufen. Der Link ist nur 24 Stunden gültig.' },
				{ status: 404 }
			);
		}
		
		const { email, orderState } = verification;
		
		// Suche nach existierendem Kunden in Firebase
		const customerResult = await getCustomerByEmail(email);
		
		if (!customerResult.success) {
			// Fehler bei Firebase-Abfrage
			console.error('Fehler beim Suchen des Kunden:', customerResult.error);
			// Trotzdem fortfahren - E-Mail ist verifiziert
		}
		
		// Token löschen (einmalige Verwendung)
		deleteEmailVerification(token);
		
		// Rückgabe: E-Mail, ggf. Kundendaten und ggf. orderState
		const response = {
			success: true,
			email: email,
			customerExists: !!customerResult.customer,
			customerData: customerResult.customer || null,
			customerId: customerResult.customerId || null,
			orderState: orderState
		};
		
		if (customerResult.customer) {
			console.log('✓ Existierender Kunde gefunden für:', email);
		} else {
			console.log('✓ Neuer Kunde für:', email);
		}
		
		if (orderState) {
			console.log('✓ Bestellzustand wiederhergestellt');
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
