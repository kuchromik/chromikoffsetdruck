import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { 
	FIREBASE_PROJECT_ID, 
	FIREBASE_CLIENT_EMAIL, 
	FIREBASE_PRIVATE_KEY 
} from '$env/static/private';

/**
 * Initialisiert Firebase Admin SDK (nur einmal)
 */
function initFirebase() {
	// Prüfen ob Firebase bereits initialisiert wurde
	if (getApps().length > 0) {
		return getApps()[0];
	}

	// Firebase Admin SDK initialisieren
	return initializeApp({
		credential: cert({
			projectId: FIREBASE_PROJECT_ID,
			clientEmail: FIREBASE_CLIENT_EMAIL,
			// Private Key kann escaped newlines (\n) enthalten, die wir in echte Zeilenumbrüche umwandeln
			privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
		})
	});
}

/**
 * Gibt die Firestore-Instanz zurück
 */
export function getDb() {
	initFirebase();
	return getFirestore();
}

/**
 * Erstellt einen neuen Job in der Firestore-Datenbank
 * 
 * @param {Object} jobData - Die Job-Daten
 * @param {string} jobData.jobname - Name des Auftrags
 * @param {number} jobData.amount - Gesamtpreis netto
 * @param {string} jobData.customer - Kundenname (format: "(Firma,) Nachname Vorname")
 * @param {string} jobData.details - Produktzusammenfassung
 * @param {number} jobData.quantity - Auflage
 * @param {string} [jobData.producer='doe'] - Produktionsart (default: 'doe' für Digitaldruck)
 * @returns {Promise<{success: boolean, jobId?: string, error?: string}>}
 */
export async function createJob(jobData) {
	try {
		const db = getDb();
		
		// Job-Dokument erstellen
		const jobDoc = {
			jobname: jobData.jobname,
			amount: jobData.amount,
			customer: jobData.customer,
			details: jobData.details,
			quantity: jobData.quantity,
			producer: jobData.producer || 'doe',
			
			// Status-Felder (initial alles false)
			archiv: false,
			invoice_ready: false,
			paper_ready: false,
			print_ready: false,
			shipped_ready: false,
			
			// FixGuenstig-Markierung
			FixGuenstig: true,
			
			// Timestamp wird von Firestore automatisch gesetzt
			jobstart: Date.now()
		};

		// Job in Firestore speichern
	const docRef = await db.collection('Jobs').add(jobDoc);
			success: true,
			jobId: docRef.id
		};
		
	} catch (error) {
		console.error('Fehler beim Speichern des Jobs in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Hilfsfunktion: Formatiert Kundendaten für das customer-Feld
 * Format: "FirmaName Nachname Vorname" oder "Nachname Vorname" (wenn keine Firma)
 * 
 * @param {Object} kunde - Kundendaten
 * @param {string} kunde.vorname - Vorname
 * @param {string} kunde.nachname - Nachname
 * @param {string} [kunde.firma] - Firmenname (optional)
 * @returns {string} Formatierter String
 */
export function formatCustomerName(kunde) {
	if (kunde.firma && kunde.firma.trim()) {
		return `${kunde.firma} ${kunde.nachname} ${kunde.vorname}`;
	}
	return `${kunde.nachname} ${kunde.vorname}`;
}

/**
 * Hilfsfunktion: Erstellt die Details-Zusammenfassung aus Produktdaten
 * Format: "Produkt Format, Material, Umfang"
 * 
 * @param {Object} produktInfo - Produktinformationen
 * @param {string} produktInfo.produkt - Produkttyp
 * @param {string} produktInfo.format - Format
 * @param {string} produktInfo.material - Material
 * @param {string} [produktInfo.umfang] - Umfang (optional, bei manchen Produkten nicht vorhanden)
 * @returns {string} Formatierter String
 */
export function formatJobDetails(produktInfo) {
	const parts = [
		produktInfo.produkt,
		produktInfo.format,
		produktInfo.material
	];
	
	// Umfang nur hinzufügen wenn vorhanden und nicht '-'
	if (produktInfo.umfang && produktInfo.umfang !== '-') {
		parts.push(produktInfo.umfang);
	}
	
	return parts.join(', ');
}
