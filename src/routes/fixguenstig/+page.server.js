import { redirect } from '@sveltejs/kit';
import { dev } from '$app/environment';
import { getDb, sanitizeFirestoreData } from '$lib/firebaseService.js';

/**
 * Lädt die Konfiguration für die FixGuenstig-Route aus Firestore.
 * Fallback: lokal gespeicherte JSON unter src/lib/config/fixguenstig.json
 */
export async function load() {
  // Wartungsmodus: Im Production-Build für alle Besucher blockieren ((!dev) => redirect)
  // Nur im lokalen Dev-Mode (npm run dev) ist die Seite erreichbar.
  // TEMPORÄR DEAKTIVIERT:
  // if (!dev) {
  //   redirect(302, '/fixguenstig/wartung');
  // }

  try {
    const db = getDb();
    const docRef = db.collection('config').doc('fixguenstig');
    const doc = await docRef.get();
    if (doc.exists) {
      const sanitized = sanitizeFirestoreData(doc.data());
      return { config: sanitized, source: 'firebase' };
    }
  } catch (err) {
    console.error('Fehler beim Laden der FixGuenstig-Konfiguration aus Firestore:', err?.message || err);
  }

  // Fallback: lokale JSON-Datei
  try {
    const mod = await import('$lib/config/fixguenstig.json');
    console.log('FixGuenstig config loaded from local JSON fallback');
    return { config: mod.default || mod, source: 'local' };
  } catch (err) {
    console.error('Fehler beim Laden der lokalen FixGuenstig-Konfiguration:', err?.message || err);
    return { config: {}, source: 'none' };
  }
}
