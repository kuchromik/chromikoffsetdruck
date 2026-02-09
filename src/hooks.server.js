/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	// Body-Limit auf 20 MB erhöhen für PDF-Uploads
	if (event.url.pathname === '/api/send-order') {
		event.request.headers.set('content-length-limit', '20971520'); // 20 MB in bytes
	}
	
	return resolve(event);
}
