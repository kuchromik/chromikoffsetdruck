import crypto from 'crypto';
import { getDb } from './firebaseService.js';

const TOKEN_EXPIRY_HOURS = 24; // Token läuft nach 24 Stunden ab

/**
 * Erzeugt einen sicheren Zufalls-Token
 */
function generateToken() {
	return crypto.randomBytes(32).toString('hex');
}

/**
 * Speichert eine neue ausstehende Bestellung in Firestore
 * @param {Object} orderData - Die Bestelldaten
 * @param {Array} attachments - Die PDF-Anhänge
 * @returns {Promise<string>} Der generierte Token
 */
export async function savePendingOrder(orderData, attachments = []) {
	const token = generateToken();
	const db = getDb();
	
	// Konvertiere Attachments für Firestore-Serialisierung
	const serializedAttachments = attachments.map(att => ({
		filename: att.filename,
		content: att.content.toString('base64'), // Buffer zu Base64
		contentType: att.contentType
	}));
	
	const orderDoc = {
		data: orderData,
		attachments: serializedAttachments,
		timestamp: new Date().toISOString(),
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
	};
	
	try {
		await db.collection('PendingOrders').doc(token).set(orderDoc);
		console.log(`✓ Ausstehende Bestellung gespeichert mit Token: ${token}`);
		return token;
	} catch (error) {
		console.error('Fehler beim Speichern der ausstehenden Bestellung:', error);
		throw error;
	}
}

/**
 * Holt eine ausstehende Bestellung anhand des Tokens aus Firestore
 * @param {string} token - Der Verifizierungs-Token
 * @returns {Promise<Object|null>} Die Bestelldaten oder null wenn nicht gefunden/abgelaufen
 */
export async function getPendingOrder(token) {
	const db = getDb();
	
	try {
		const doc = await db.collection('PendingOrders').doc(token).get();
		
		if (!doc.exists) {
			console.log(`✗ Keine Bestellung gefunden für Token: ${token}`);
			return null;
		}
		
		const order = doc.data();
		
		// Prüfe ob Token abgelaufen ist
		if (new Date(order.expiresAt) < new Date()) {
			console.log(`✗ Token abgelaufen: ${token}`);
			await deletePendingOrder(token);
			return null;
		}
		
		// Konvertiere Attachments zurück zu Buffern
		const attachments = order.attachments.map(att => ({
			filename: att.filename,
			content: Buffer.from(att.content, 'base64'),
			contentType: att.contentType
		}));
		
		return {
			data: order.data,
			attachments: attachments
		};
	} catch (error) {
		console.error('Fehler beim Laden der Bestellung:', error);
		return null;
	}
}

/**
 * Löscht eine ausstehende Bestellung aus Firestore
 * @param {string} token - Der Verifizierungs-Token
 */
export async function deletePendingOrder(token) {
	const db = getDb();
	
	try {
		await db.collection('PendingOrders').doc(token).delete();
		console.log(`✓ Ausstehende Bestellung gelöscht: ${token}`);
	} catch (error) {
		console.error('Fehler beim Löschen der Bestellung:', error);
	}
}

/**
 * Bereinigt abgelaufene Bestellungen aus Firestore
 */
export async function cleanupExpiredOrders() {
	const db = getDb();
	const now = new Date();
	
	try {
		const snapshot = await db.collection('PendingOrders')
			.where('expiresAt', '<', now.toISOString())
			.get();
		
		const batch = db.batch();
		snapshot.docs.forEach(doc => {
			batch.delete(doc.ref);
		});
		
		await batch.commit();
		console.log(`✓ ${snapshot.size} abgelaufene Bestellung(en) bereinigt`);
		return snapshot.size;
	} catch (error) {
		console.error('Fehler beim Bereinigen abgelaufener Bestellungen:', error);
		return 0;
	}
}

// ====================================
// E-Mail-Verifizierungs-Funktionen
// ====================================

/**
 * Speichert eine neue E-Mail-Verifizierung in Firestore
 * @param {string} email - Die zu verifizierende E-Mail-Adresse
 * @param {Object} [orderState] - Optional: Der Bestellzustand zum Wiederherstellen
 * @returns {Promise<string>} Der generierte Token
 */
export async function saveEmailVerification(email, orderState = null) {
	const token = generateToken();
	const db = getDb();
	
	const verificationDoc = {
		email: email,
		orderState: orderState,
		timestamp: new Date().toISOString(),
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
	};
	
	try {
		await db.collection('PendingEmailVerifications').doc(token).set(verificationDoc);
		console.log(`✓ E-Mail-Verifizierung gespeichert mit Token: ${token}`);
		return token;
	} catch (error) {
		console.error('Fehler beim Speichern der E-Mail-Verifizierung:', error);
		throw error;
	}
}

/**
 * Holt eine E-Mail-Verifizierung anhand des Tokens aus Firestore
 * @param {string} token - Der Verifizierungs-Token
 * @returns {Promise<Object|null>} Ein Objekt mit { email, orderState } oder null wenn nicht gefunden/abgelaufen
 */
export async function getEmailVerification(token) {
	const db = getDb();
	
	try {
		const doc = await db.collection('PendingEmailVerifications').doc(token).get();
		
		if (!doc.exists) {
			console.log(`✗ Keine E-Mail-Verifizierung gefunden für Token: ${token}`);
			return null;
		}
		
		const verification = doc.data();
		
		// Prüfe ob Token abgelaufen ist
		if (new Date(verification.expiresAt) < new Date()) {
			console.log(`✗ E-Mail-Verifizierungs-Token abgelaufen: ${token}`);
			await deleteEmailVerification(token);
			return null;
		}
		
		return {
			email: verification.email,
			orderState: verification.orderState || null
		};
	} catch (error) {
		console.error('Fehler beim Laden der E-Mail-Verifizierung:', error);
		return null;
	}
}

/**
 * Löscht eine E-Mail-Verifizierung aus Firestore
 * @param {string} token - Der Verifizierungs-Token
 */
export async function deleteEmailVerification(token) {
	const db = getDb();
	
	try {
		await db.collection('PendingEmailVerifications').doc(token).delete();
		console.log(`✓ E-Mail-Verifizierung gelöscht: ${token}`);
	} catch (error) {
		console.error('Fehler beim Löschen der E-Mail-Verifizierung:', error);
	}
}

/**
 * Bereinigt abgelaufene E-Mail-Verifizierungen aus Firestore
 */
export async function cleanupExpiredEmailVerifications() {
	const db = getDb();
	const now = new Date();
	
	try {
		const snapshot = await db.collection('PendingEmailVerifications')
			.where('expiresAt', '<', now.toISOString())
			.get();
		
		const batch = db.batch();
		snapshot.docs.forEach(doc => {
			batch.delete(doc.ref);
		});
		
		await batch.commit();
		console.log(`✓ ${snapshot.size} abgelaufene E-Mail-Verifizierung(en) bereinigt`);
		return snapshot.size;
	} catch (error) {
		console.error('Fehler beim Bereinigen abgelaufener E-Mail-Verifizierungen:', error);
		return 0;
	}
}

/**
 * Markiert eine E-Mail als verifiziert (für Polling-Abfragen)
 * Speichert die Verifizierung temporär (5 Minuten) in einer separaten Collection
 * @param {string} email - Die verifizierte E-Mail-Adresse
 * @param {Object} orderState - Der Bestellzustand
 * @param {Object} customerData - Die Kundendaten
 * @returns {Promise<void>}
 */
export async function markEmailAsVerified(email, orderState, customerData) {
	const db = getDb();
	const expiresAt = new Date();
	expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 Minuten gültig
	
	const verificationDoc = {
		email: email,
		orderState: orderState || null,
		customerData: customerData || null,
		verifiedAt: new Date().toISOString(),
		expiresAt: expiresAt.toISOString()
	};
	
	try {
		// Verwende E-Mail als Dokument-ID (encoded für Firebase-Kompatibilität)
		const docId = Buffer.from(email).toString('base64').replace(/[\/\+\=]/g, '_');
		await db.collection('VerifiedEmails').doc(docId).set(verificationDoc);
		console.log(`✓ E-Mail als verifiziert markiert: ${email}`);
	} catch (error) {
		console.error('Fehler beim Markieren der E-Mail als verifiziert:', error);
		throw error;
	}
}

/**
 * Prüft, ob eine E-Mail kürzlich verifiziert wurde (für Polling)
 * @param {string} email - Die zu prüfende E-Mail-Adresse
 * @returns {Promise<Object|null>} Ein Objekt mit { email, orderState, customerData } oder null
 */
export async function checkIfEmailWasVerified(email) {
	const db = getDb();
	
	try {
		const docId = Buffer.from(email).toString('base64').replace(/[\/\+\=]/g, '_');
		const doc = await db.collection('VerifiedEmails').doc(docId).get();
		
		if (!doc.exists) {
			return null;
		}
		
		const verification = doc.data();
		
		// Prüfe ob Verifizierung abgelaufen ist
		if (new Date(verification.expiresAt) < new Date()) {
			console.log(`✗ Verifizierung abgelaufen für: ${email}`);
			await db.collection('VerifiedEmails').doc(docId).delete();
			return null;
		}
		
		// Lösche nach erfolgreichem Abruf (einmalige Verwendung)
		await db.collection('VerifiedEmails').doc(docId).delete();
		console.log(`✓ Verifizierung abgerufen und gelöscht für: ${email}`);
		
		return {
			email: verification.email,
			orderState: verification.orderState || null,
			customerData: verification.customerData || null
		};
	} catch (error) {
		console.error('Fehler beim Prüfen der E-Mail-Verifizierung:', error);
		return null;
	}
}
