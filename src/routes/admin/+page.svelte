<script>
import { onMount } from 'svelte';

let firebaseApp;
let auth;
let email = '';
let password = '';
let loggedIn = false;
let idToken = null;
let userEmail = '';
let configText = '';
let statusMsg = '';
let docId = 'fixguenstig';

function initFirebaseClient() {
  // Dynamically import firebase client libs to avoid server-side import issues
  if (firebaseApp) return;
  const cfg = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
  };
  return import('firebase/app').then(({ initializeApp }) => {
    firebaseApp = initializeApp(cfg);
    return import('firebase/auth').then(({ getAuth: _getAuth }) => {
      auth = _getAuth(firebaseApp);
    });
  });
}

async function doLogin() {
  statusMsg = 'Signing in...';
  try {
    await initFirebaseClient();
    const { signInWithEmailAndPassword } = await import('firebase/auth');
    const userCred = await signInWithEmailAndPassword(auth, email, password);
    idToken = await userCred.user.getIdToken();
    userEmail = userCred.user.email || '';
    loggedIn = true;
    statusMsg = 'Signed in';
    await loadConfig();
  } catch (err) {
    console.error('login error', err);
    statusMsg = 'Login failed: ' + (err.message || err);
  }
}

async function loadConfig() {
  statusMsg = 'Loading config...';
  try {
    const res = await fetch('/api/admin/config?doc=' + encodeURIComponent(docId), {
      headers: { Authorization: 'Bearer ' + idToken }
    });
    const body = await res.json();
    if (!body.success) {
      statusMsg = 'Load failed: ' + (body.error || res.status);
      return;
    }
    configText = JSON.stringify(body.config || {}, null, 2);
    statusMsg = 'Loaded';
  } catch (err) {
    console.error('loadConfig error', err);
    statusMsg = 'Error loading config';
  }
}

async function saveConfig() {
  statusMsg = 'Saving...';
  try {
    const parsed = JSON.parse(configText);
    const res = await fetch('/api/admin/config?doc=' + encodeURIComponent(docId), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + idToken
      },
      body: JSON.stringify({ config: parsed })
    });
    const body = await res.json();
    if (!body.success) {
      statusMsg = 'Save failed: ' + (body.error || res.status);
      return;
    }
    statusMsg = 'Saved successfully';
  } catch (err) {
    console.error('saveConfig error', err);
    statusMsg = 'Error saving config: ' + (err.message || err);
  }
}

async function doLogout() {
  statusMsg = 'Logging out...';
  try {
    const { signOut } = await import('firebase/auth');
    await signOut(auth);
  } catch (e) {
    console.warn('signOut failed', e);
  }
  // clear local state
  loggedIn = false;
  idToken = null;
  userEmail = '';
  configText = '';
  statusMsg = 'Logged out';
}

onMount(() => {
  initFirebaseClient();
});
</script>

<svelte:head>
  <title>Admin - Konfiguration</title>
</svelte:head>

<div class="admin-page">
  <h1>Admin — FixGuenstig Konfiguration</h1>
  {#if loggedIn}
    <div style="margin-bottom:0.6rem">
      <label>Dokument
        <select bind:value={docId}>
          <option value="fixguenstig">fixguenstig</option>
          <option value="extraladen">extraladen</option>
        </select>
      </label>
    </div>
  {/if}
  {#if !loggedIn}
    <div class="login">
      <label>
        Email
        <input type="email" bind:value={email} />
      </label>
      <label>
        Passwort
        <input type="password" bind:value={password} />
      </label>
      <button class="primary" on:click={doLogin}>Login</button>
      <div class="status">{statusMsg}</div>
    </div>
  {:else}
    <div class="editor">
      <div class="admin-header">
        <div class="admin-info">Angemeldet als: <strong>{userEmail}</strong></div>
        <div class="admin-actions">
          <button on:click={doLogout}>Logout</button>
        </div>
      </div>
      <div class="controls">
        <button on:click={loadConfig}>Reload</button>
        <button class="primary" on:click={saveConfig}>Save</button>
        <span class="status">{statusMsg}</span>
      </div>
      <textarea rows="30" bind:value={configText} class="json-editor"></textarea>
    </div>
  {/if}
</div>

<style>
  .admin-page { padding: 1.25rem; font-family: system-ui, Arial, sans-serif; }
  h1 { margin-bottom: 0.75rem; color: #004b23; }
  .login { max-width: 480px; background: #f7fff7; border: 1px solid #e6f4ea; padding: 1rem; border-radius: 8px; }
  label { display:block; margin-bottom:0.6rem; font-size: 0.95rem }
  input { width: 100%; padding: 0.5rem; border-radius: 6px; border: 1px solid #cfeadf }
  .controls { margin: 0.75rem 0; display:flex; gap:0.5rem; align-items:center }
  button { padding: 0.45rem 0.75rem; border-radius: 6px; border: 1px solid transparent; cursor: pointer; background: #eee }
  button.primary { background: #ff8c00; color: white; border-color: #ff8c00 }
  .status { margin-left: 0.5rem; color: #333; font-size: 0.95rem }
  .editor { background: linear-gradient(180deg,#ffffff,#fbfffb); border: 1px solid #e6f4ea; padding: 0.8rem; border-radius: 8px }
  .admin-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem }
  .admin-info { font-size: 0.95rem; color: #045; }
  .admin-actions button { background: #fff; border: 1px solid #ddd }
  .json-editor { width: 100%; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, 'Roboto Mono', 'Courier New', monospace; font-size: 0.95rem; padding: 0.6rem; border-radius: 6px; border: 1px solid #ddd }
  .primary:hover { filter:brightness(0.95) }
</style>
