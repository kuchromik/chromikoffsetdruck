import { getDb } from '$lib/firebaseService.js';

/**
 * Lädt die Konfiguration für die FixGuenstig-Route aus Firestore.
 * Fallback: lokal gespeicherte JSON unter src/lib/config/fixguenstig.json
 */
export async function load() {
  try {
    const db = getDb();
    const docRef = db.collection('config').doc('fixguenstig');
    const doc = await docRef.get();
    if (doc.exists) {
      console.log('FixGuenstig config loaded from Firestore');
      return { config: doc.data(), source: 'firebase' };
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
