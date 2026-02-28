import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

async function run() {
  try {
    const saPath = path.resolve('./codutb-38c1e-firebase-adminsdk-346mp-2afb925ee4.json');
    const saRaw = await fs.readFile(saPath, 'utf8');
    const sa = JSON.parse(saRaw);

    admin.initializeApp({ credential: admin.credential.cert(sa) });
    const auth = admin.auth();

    console.log('Listing up to 1000 users (uid - email):');
    const list = await auth.listUsers(1000);
    list.users.forEach(u => {
      console.log(u.uid, '-', u.email || '(no email)');
    });

    if (list.pageToken) {
      console.log('More users exist; consider calling listUsers with a pageToken to iterate.');
    }
  } catch (err) {
    console.error('Error listing users:', err);
    process.exitCode = 1;
  }
}

run();
