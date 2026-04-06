import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getDb, sanitizeFirestoreData } from '$lib/firebaseService.js';

/**
 * Lädt die Konfiguration für die Extraladen-Route aus Firestore.
 * Fallback: lokal gespeicherte JSON unter src/lib/config/extraladen.json
 */
export async function load() {
  // Wartungsmodus: Im Production-Build für alle Besucher blockieren ((!dev) => redirect)
  // Nur im lokalen Dev-Mode (npm run dev) ist die Seite erreichbar.
  // TEMPORÄR DEAKTIVIERT:
  // if (!dev) {
  //   redirect(302, '/extraladen/wartung');
  // }

  try {
    const db = getDb();
    const docRef = db.collection('config').doc('extraladen');
    const doc = await docRef.get();
    if (doc.exists) {
      const sanitized = sanitizeFirestoreData(doc.data());

      // Fallback für Prägungsfarben falls noch nicht in Firebase
      if (!Array.isArray(sanitized.praegefarben) || sanitized.praegefarben.length === 0) {
        sanitized.praegefarben = ['Gold', 'Silber'];
      }

      return { config: sanitized, source: 'firebase' };
    }
  } catch (err) {
    console.error('Fehler beim Laden der Extraladen-Konfiguration aus Firestore:', err?.message || err);
  }

  // Fallback: lokale JSON-Datei
  try {
    const mod = await import('$lib/config/extraladen.json');
    return { config: mod.default || mod, source: 'local' };
  } catch (err) {
    console.error('Fehler beim Laden der lokalen Extraladen-Konfiguration:', err?.message || err);
    return { config: {}, source: 'none' };
  }
}
