import { json } from '@sveltejs/kit';
import { checkIfEmailWasVerified } from '$lib/pendingOrders.js';

/**
 * API-Endpoint für Polling der E-Mail-Verifizierung
 * Prüft, ob eine E-Mail verifiziert wurde (ohne Token)
 */
/** @type {import('./$types').RequestHandler} */
export async function POST({ request }) {
	try {
		const { email } = await request.json();
		
		if (!email) {
			return json(
				{ success: false, error: 'Keine E-Mail-Adresse angegeben' },
				{ status: 400 }
			);
		}
		
		// Prüfe, ob die E-Mail kürzlich verifiziert wurde
		const verification = await checkIfEmailWasVerified(email);
		
		if (!verification) {
			// Noch nicht verifiziert
			return json({ 
				success: true,
				verified: false
			});
		}
		
		// E-Mail wurde verifiziert
		const customerData = verification.customerData || {};
		
		return json({
			success: true,
			verified: true,
			email: verification.email,
			customerExists: customerData.customerExists || false,
			customerData: customerData.customerData || null,
			customerId: customerData.customerId || null,
			orderState: verification.orderState || null
		});
		
	} catch (error) {
		console.error('Fehler beim Polling der E-Mail-Verifizierung:', error);
		return json(
			{ success: false, error: 'Fehler beim Polling' },
			{ status: 500 }
		);
	}
}
