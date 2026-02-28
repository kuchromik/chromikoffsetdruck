import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

async function run() {
  try {
    const jsonPath = path.resolve('./src/lib/config/fixguenstig.json');
    const raw = await fs.readFile(jsonPath, 'utf8');
    const data = JSON.parse(raw);

    // Service-Account JSON dynamisch laden (keine `import ... assert` wegen Node-Umgebung)
    const saPath = path.resolve('./codutb-38c1e-firebase-adminsdk-346mp-2afb925ee4.json');
    const saRaw = await fs.readFile(saPath, 'utf8');
    const serviceAccount = JSON.parse(saRaw);

    // Firebase initialisieren
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const db = admin.firestore();

    await db.collection('config').doc('fixguenstig').set(data);
    console.log('✓ Konfiguration erfolgreich hochgeladen: config/fixguenstig');
  } catch (err) {
    console.error('Fehler beim Hochladen der Konfiguration:', err);
    process.exitCode = 1;
  }
}

run();
