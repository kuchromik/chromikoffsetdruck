// Body-Size-Limit wird jetzt in svelte.config.js konfiguriert
// Diese Datei kann leer bleiben oder für andere Hook-Funktionen verwendet werden

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	return resolve(event);
}
