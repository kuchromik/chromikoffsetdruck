import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import crypto from 'crypto';

const PENDING_ORDERS_FILE = join(process.cwd(), 'pending-orders.json');
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
