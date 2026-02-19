import { json } from '@sveltejs/kit';
import { getShipmentAddressesByCustomerId } from '$lib/firebaseService.js';

/** @type {import('./$types').RequestHandler} */
export async function GET({ url }) {
	try {
		const customerId = url.searchParams.get('customerId');
		
		if (!customerId) {
			return json(
				{ success: false, error: 'Kunden-ID fehlt' },
				{ status: 400 }
			);
		}
		
		const result = await getShipmentAddressesByCustomerId(customerId);
		
		if (result.success) {
			return json({
				success: true,
				addresses: result.addresses || []
			});
		} else {
			return json(
				{ success: false, error: result.error },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error('Fehler beim Abrufen der Versandadressen:', error);
		return json(
			{ success: false, error: 'Fehler beim Abrufen der Versandadressen' },
			{ status: 500 }
		);
	}
}
