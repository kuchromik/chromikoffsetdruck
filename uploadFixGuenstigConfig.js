// node uploadFixGuenstigConfig.js
import { getDb } from './src/lib/firebaseService.js';
import fs from 'fs';

async function run() {
  const db = getDb();
  const json = JSON.parse(fs.readFileSync('src/lib/config/fixguenstig.json', 'utf8'));
  await db.collection('config').doc('fixguenstig').set(json);
  console.log('Konfiguration hochgeladen.');
}
run().catch(err => { console.error(err); process.exit(1); });