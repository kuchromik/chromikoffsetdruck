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
 * @param {boolean} [jobData.toShip=false] - Versand (true) oder Abholung (false)
 * @param {string} [jobData.shipmentAddressId] - ID der Versandadresse (optional, nur bei toShip=true und abweichender Adresse)
 * @param {string} [jobData.customerId] - ID des Kunden aus der customer Collection
 * @param {Object} [jobData.billingAddress] - Abweichende Rechnungsadresse (optional)
 * @param {string} [jobData.billingEmail] - Abweichende E-Mail für Rechnungsversand (optional)
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
			
			// Versand/Abholung
			toShip: jobData.toShip || false,
			
			// FixGuenstig-Markierung
			FixGuenstig: true,
			
			// Timestamp in Sekunden (Unix-Timestamp)
			jobstart: Math.floor(Date.now() / 1000)
		};
		
		// Versandadresse-Referenz hinzufügen (falls vorhanden)
		if (jobData.shipmentAddressId) {
			jobDoc.shipmentAddressId = jobData.shipmentAddressId;
		}
		
		// Kunden-ID hinzufügen (falls vorhanden)
		if (jobData.customerId) {
			jobDoc.customerId = jobData.customerId;
		}
		
		// Abweichende Rechnungsadresse hinzufügen (falls vorhanden)
		if (jobData.billingAddress) {
			jobDoc.billingAddress = jobData.billingAddress;
		}
		
		// Abweichende E-Mail für Rechnungsversand hinzufügen (falls vorhanden)
		if (jobData.billingEmail) {
			jobDoc.billingEmail = jobData.billingEmail;
		}

		// Job in Firestore speichern
		const docRef = await db.collection('Jobs').add(jobDoc);
		
		console.log(`Job erfolgreich in Firebase gespeichert: ${docRef.id}`);
		
		return {
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

/**
 * Sucht einen Kunden in der Firestore-Datenbank anhand der E-Mail-Adresse
 * 
 * @param {string} email - Die E-Mail-Adresse des Kunden
 * @returns {Promise<{success: boolean, customer?: Object, customerId?: string, error?: string}>}
 */
export async function getCustomerByEmail(email) {
	try {
		const db = getDb();
		
		// Suche nach Kunde mit dieser E-Mail
		const snapshot = await db.collection('customer')
			.where('email', '==', email)
			.limit(1)
			.get();
		
		if (snapshot.empty) {
			return {
				success: true,
				customer: null // Kein Kunde gefunden
			};
		}
		
		// Ersten (und einzigen) Treffer zurückgeben
		const doc = snapshot.docs[0];
		
		console.log(`Kunde gefunden: ${doc.id}`);
		
		return {
			success: true,
			customer: doc.data(),
			customerId: doc.id
		};
		
	} catch (error) {
		console.error('Fehler beim Suchen des Kunden in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Aktualisiert einen existierenden Kunden in der Firestore-Datenbank
 * 
 * @param {string} customerId - Die ID des Kunden
 * @param {Object} customerData - Die aktualisierten Kundendaten
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export async function updateCustomer(customerId, customerData) {
	try {
		const db = getDb();
		
		// Kunden-Dokument aktualisieren
		const customerDoc = {
			firstName: customerData.firstName,
			lastName: customerData.lastName,
			email: customerData.email,
			address: customerData.address,
			zip: customerData.zip,
			city: customerData.city,
			company: customerData.company || '',
			countryCode: customerData.countryCode || 'DE'
		};

		await db.collection('customer').doc(customerId).update(customerDoc);
		
		console.log(`Kunde erfolgreich aktualisiert: ${customerId}`);
		
		return {
			success: true
		};
		
	} catch (error) {
		console.error('Fehler beim Aktualisieren des Kunden in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Erstellt einen neuen Kunden in der Firestore-Datenbank (customer Collection)
 * 
 * @param {Object} customerData - Die Kundendaten
 * @param {string} customerData.firstName - Vorname
 * @param {string} customerData.lastName - Nachname
 * @param {string} customerData.email - E-Mail-Adresse
 * @param {string} customerData.address - Straße und Hausnummer
 * @param {string} customerData.zip - Postleitzahl
 * @param {string} customerData.city - Ort
 * @param {string} [customerData.company] - Firma (optional)
 * @param {string} [customerData.countryCode='DE'] - Ländercode (default: 'DE')
 * @returns {Promise<{success: boolean, customerId?: string, error?: string}>}
 */
export async function createCustomer(customerData) {
	try {
		const db = getDb();
		
		// Kunden-Dokument erstellen
		const customerDoc = {
			firstName: customerData.firstName,
			lastName: customerData.lastName,
			email: customerData.email,
			address: customerData.address,
			zip: customerData.zip,
			city: customerData.city,
			company: customerData.company || '',
			countryCode: customerData.countryCode || 'DE'
		};

		// Kunde in Firestore speichern
		const docRef = await db.collection('customer').add(customerDoc);
		
		console.log(`Kunde erfolgreich in Firebase gespeichert: ${docRef.id}`);
		
		return {
			success: true,
			customerId: docRef.id
		};
		
	} catch (error) {
		console.error('Fehler beim Speichern des Kunden in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Lädt alle Versandadressen eines Kunden aus Firebase
 * 
 * @param {string} customerId - Die ID des Kunden
 * @returns {Promise<{success: boolean, addresses?: Array<{id: string, data: Object}>, error?: string}>}
 */
export async function getShipmentAddressesByCustomerId(customerId) {
	try {
		const db = getDb();
		
		if (!customerId) {
			return {
				success: true,
				addresses: []
			};
		}
		
		// Suche alle Adressen des Kunden
		const snapshot = await db.collection('shipmentAddresses')
			.where('customerId', '==', customerId)
			.get();
		
		const addresses = [];
		snapshot.forEach(doc => {
			addresses.push({
				id: doc.id,
				data: doc.data()
			});
		});
		
		console.log(`✓ ${addresses.length} Versandadresse(n) für Kunde ${customerId} gefunden`);
		
		return {
			success: true,
			addresses: addresses
		};
		
	} catch (error) {
		console.error('Fehler beim Laden der Versandadressen in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Sucht nach einer existierenden Versandadresse in Firebase
 * 
 * @param {Object} addressData - Die Adressdaten zum Suchen
 * @param {string} addressData.name - Name/Firma
 * @param {string} addressData.street - Straße und Hausnummer
 * @param {string} addressData.zip - Postleitzahl
 * @param {string} addressData.city - Ort
 * @returns {Promise<{success: boolean, addressId?: string, address?: Object, error?: string}>}
 */
export async function findShipmentAddress(addressData) {
	try {
		const db = getDb();
		
		// Suche nach Adresse mit exakt gleichen Daten
		const snapshot = await db.collection('shipmentAddresses')
			.where('name', '==', addressData.name)
			.where('street', '==', addressData.street)
			.where('zip', '==', addressData.zip)
			.where('city', '==', addressData.city)
			.limit(1)
			.get();
		
		if (!snapshot.empty) {
			const doc = snapshot.docs[0];
			console.log(`✓ Existierende Versandadresse gefunden: ${doc.id}`);
			return {
				success: true,
				addressId: doc.id,
				address: doc.data()
			};
		}
		
		console.log('✗ Keine existierende Versandadresse gefunden');
		return {
			success: true,
			addressId: null,
			address: null
		};
		
	} catch (error) {
		console.error('Fehler beim Suchen der Versandadresse in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}

/**
 * Erstellt eine neue Versandadresse in der Firestore-Datenbank (shipmentAddresses Collection)
 * Prüft zuerst, ob die Adresse bereits existiert und vermeidet Duplikate
 * 
 * @param {Object} addressData - Die Versandadressendaten
 * @param {string} addressData.name - Name/Firma
 * @param {string} addressData.street - Straße und Hausnummer
 * @param {string} addressData.zip - Postleitzahl
 * @param {string} addressData.city - Ort
 * @param {string} [addressData.customerId] - Kunden-ID (optional, für Zuordnung)
 * @returns {Promise<{success: boolean, addressId?: string, isExisting?: boolean, error?: string}>}
 */
export async function createShipmentAddress(addressData) {
	try {
		const db = getDb();
		
		// Prüfe zuerst, ob die Adresse bereits existiert
		const existingAddress = await findShipmentAddress({
			name: addressData.name,
			street: addressData.street,
			zip: addressData.zip,
			city: addressData.city
		});
		
		if (existingAddress.success && existingAddress.addressId) {
			// Adresse existiert bereits
			console.log(`✓ Verwende existierende Versandadresse: ${existingAddress.addressId}`);
			return {
				success: true,
				addressId: existingAddress.addressId,
				isExisting: true
			};
		}
		
		// Neue Versandadresse erstellen
		const addressDoc = {
			name: addressData.name,
			street: addressData.street,
			zip: addressData.zip,
			city: addressData.city,
			createdAt: Math.floor(Date.now() / 1000) // Unix-Timestamp in Sekunden
		};
		
		// Kunden-ID hinzufügen (falls vorhanden)
		if (addressData.customerId) {
			addressDoc.customerId = addressData.customerId;
		}

		// Versandadresse in Firestore speichern
		const docRef = await db.collection('shipmentAddresses').add(addressDoc);
		
		console.log(`✓ Neue Versandadresse erfolgreich in Firebase gespeichert: ${docRef.id}`);
		
		return {
			success: true,
			addressId: docRef.id,
			isExisting: false
		};
		
	} catch (error) {
		console.error('Fehler beim Speichern der Versandadresse in Firebase:', error);
		return {
			success: false,
			error: error.message
		};
	}
}
