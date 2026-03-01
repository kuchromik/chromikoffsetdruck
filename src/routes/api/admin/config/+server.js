import { json } from '@sveltejs/kit';
import { getDb, verifyAdminToken } from '$lib/firebaseService.js';

function getTokenFromRequest(request) {
  const auth = request.headers.get('authorization') || '';
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length !== 2) return null;
  return parts[1];
}

export async function GET({ request }) {
  const token = getTokenFromRequest(request);
  if (!token) return json({ success: false, error: 'missing_token' }, { status: 401 });

  const verified = await verifyAdminToken(token);
  if (!verified.success) {
    return json({ success: false, error: 'unauthorized' }, { status: 403 });
  }

  // allow ?doc=extraladen (default: fixguenstig)
  const url = new URL(request.url);
  const docId = url.searchParams.get('doc') || 'fixguenstig';

  try {
    const db = getDb();
    const doc = await db.collection('config').doc(docId).get();
    if (!doc.exists) return json({ success: true, config: null });
    return json({ success: true, config: doc.data() });
  } catch (err) {
    console.error('Error reading config in admin API', err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT({ request }) {
  const token = getTokenFromRequest(request);
  if (!token) return json({ success: false, error: 'missing_token' }, { status: 401 });

  const verified = await verifyAdminToken(token);
  if (!verified.success) {
    return json({ success: false, error: 'unauthorized' }, { status: 403 });
  }

  try {
    const url = new URL(request.url);
    const docId = url.searchParams.get('doc') || 'fixguenstig';

    const body = await request.json();
    if (!body || typeof body.config !== 'object') {
      return json({ success: false, error: 'invalid_payload' }, { status: 400 });
    }

    const db = getDb();
    await db.collection('config').doc(docId).set(body.config, { merge: false });
    return json({ success: true });
  } catch (err) {
    console.error('Error writing config in admin API', err);
    return json({ success: false, error: err.message }, { status: 500 });
  }
}
