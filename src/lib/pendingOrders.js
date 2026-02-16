import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const PENDING_ORDERS_FILE = join(process.cwd(), 'pending-orders.json');
const PENDING_EMAIL_VERIFICATIONS_FILE = join(process.cwd(), 'pending-email-verifications.json');
const TOKEN_EXPIRY_HOURS = 24; // Token läuft nach 24 Stunden ab

/**
 * Erzeugt einen sicheren Zufalls-Token
 */
function generateToken() {
	return crypto.randomBytes(32).toString('hex');
}

/**
 * Lädt alle ausstehenden Bestellungen aus der JSON-Datei
 */
function loadPendingOrders() {
	if (!existsSync(PENDING_ORDERS_FILE)) {
		return {};
	}
	try {
		const data = readFileSync(PENDING_ORDERS_FILE, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Fehler beim Laden der ausstehenden Bestellungen:', error);
		return {};
	}
}

/**
 * Speichert alle ausstehenden Bestellungen in die JSON-Datei
 */
function savePendingOrders(orders) {
	try {
		writeFileSync(PENDING_ORDERS_FILE, JSON.stringify(orders, null, 2));
	} catch (error) {
		console.error('Fehler beim Speichern der ausstehenden Bestellungen:', error);
		throw error;
	}
}

/**
 * Speichert eine neue ausstehende Bestellung
 * @param {Object} orderData - Die Bestelldaten
 * @param {Array} attachments - Die PDF-Anhänge
 * @returns {string} Der generierte Token
 */
export function savePendingOrder(orderData, attachments = []) {
	const token = generateToken();
	const orders = loadPendingOrders();
	
	// Konvertiere Attachments für JSON-Serialisierung
	const serializedAttachments = attachments.map(att => ({
		filename: att.filename,
		content: att.content.toString('base64'), // Buffer zu Base64
		contentType: att.contentType
	}));
	
	orders[token] = {
		data: orderData,
		attachments: serializedAttachments,
		timestamp: new Date().toISOString(),
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
	};
	
	savePendingOrders(orders);
	console.log(`✓ Ausstehende Bestellung gespeichert mit Token: ${token}`);
	
	return token;
}

/**
 * Holt eine ausstehende Bestellung anhand des Tokens
 * @param {string} token - Der Verifizierungs-Token
 * @returns {Object|null} Die Bestelldaten oder null wenn nicht gefunden/abgelaufen
 */
export function getPendingOrder(token) {
	const orders = loadPendingOrders();
	const order = orders[token];
	
	if (!order) {
		console.log(`✗ Keine Bestellung gefunden für Token: ${token}`);
		return null;
	}
	
	// Prüfe ob Token abgelaufen ist
	if (new Date(order.expiresAt) < new Date()) {
		console.log(`✗ Token abgelaufen: ${token}`);
		deletePendingOrder(token);
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
}

/**
 * Löscht eine ausstehende Bestellung
 * @param {string} token - Der Verifizierungs-Token
 */
export function deletePendingOrder(token) {
	const orders = loadPendingOrders();
	delete orders[token];
	savePendingOrders(orders);
	console.log(`✓ Ausstehende Bestellung gelöscht: ${token}`);
}

/**
 * Bereinigt abgelaufene Bestellungen
 */
export function cleanupExpiredOrders() {
	const orders = loadPendingOrders();
	const now = new Date();
	let deletedCount = 0;
	
	for (const [token, order] of Object.entries(orders)) {
		if (new Date(order.expiresAt) < now) {
			delete orders[token];
			deletedCount++;
		}
	}
	
	if (deletedCount > 0) {
		savePendingOrders(orders);
		console.log(`✓ ${deletedCount} abgelaufene Bestellung(en) bereinigt`);
	}
	
	return deletedCount;
}

// ====================================
// E-Mail-Verifizierungs-Funktionen
// ====================================

/**
 * Lädt alle ausstehenden E-Mail-Verifizierungen aus der JSON-Datei
 */
function loadPendingEmailVerifications() {
	if (!existsSync(PENDING_EMAIL_VERIFICATIONS_FILE)) {
		return {};
	}
	try {
		const data = readFileSync(PENDING_EMAIL_VERIFICATIONS_FILE, 'utf-8');
		return JSON.parse(data);
	} catch (error) {
		console.error('Fehler beim Laden der E-Mail-Verifizierungen:', error);
		return {};
	}
}

/**
 * Speichert alle ausstehenden E-Mail-Verifizierungen in die JSON-Datei
 */
function savePendingEmailVerifications(verifications) {
	try {
		writeFileSync(PENDING_EMAIL_VERIFICATIONS_FILE, JSON.stringify(verifications, null, 2));
	} catch (error) {
		console.error('Fehler beim Speichern der E-Mail-Verifizierungen:', error);
		throw error;
	}
}

/**
 * Speichert eine neue E-Mail-Verifizierung
 * @param {string} email - Die zu verifizierende E-Mail-Adresse
 * @returns {string} Der generierte Token
 */
export function saveEmailVerification(email) {
	const token = generateToken();
	const verifications = loadPendingEmailVerifications();
	
	verifications[token] = {
		email: email,
		timestamp: new Date().toISOString(),
		expiresAt: new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000).toISOString()
	};
	
	savePendingEmailVerifications(verifications);
	console.log(`✓ E-Mail-Verifizierung gespeichert mit Token: ${token}`);
	
	return token;
}

/**
 * Holt eine E-Mail-Verifizierung anhand des Tokens
 * @param {string} token - Der Verifizierungs-Token
 * @returns {string|null} Die E-Mail-Adresse oder null wenn nicht gefunden/abgelaufen
 */
export function getEmailFromVerification(token) {
	const verifications = loadPendingEmailVerifications();
	const verification = verifications[token];
	
	if (!verification) {
		console.log(`✗ Keine E-Mail-Verifizierung gefunden für Token: ${token}`);
		return null;
	}
	
	// Prüfe ob Token abgelaufen ist
	if (new Date(verification.expiresAt) < new Date()) {
		console.log(`✗ E-Mail-Verifizierungs-Token abgelaufen: ${token}`);
		deleteEmailVerification(token);
		return null;
	}
	
	return verification.email;
}

/**
 * Löscht eine E-Mail-Verifizierung
 * @param {string} token - Der Verifizierungs-Token
 */
export function deleteEmailVerification(token) {
	const verifications = loadPendingEmailVerifications();
	delete verifications[token];
	savePendingEmailVerifications(verifications);
	console.log(`✓ E-Mail-Verifizierung gelöscht: ${token}`);
}

/**
 * Bereinigt abgelaufene E-Mail-Verifizierungen
 */
export function cleanupExpiredEmailVerifications() {
	const verifications = loadPendingEmailVerifications();
	const now = new Date();
	let deletedCount = 0;
	
	for (const [token, verification] of Object.entries(verifications)) {
		if (new Date(verification.expiresAt) < now) {
			delete verifications[token];
			deletedCount++;
		}
	}
	
	if (deletedCount > 0) {
		savePendingEmailVerifications(verifications);
		console.log(`✓ ${deletedCount} abgelaufene E-Mail-Verifizierung(en) bereinigt`);
	}
	
	return deletedCount;
}
