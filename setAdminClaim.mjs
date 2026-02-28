import admin from 'firebase-admin';
import fs from 'fs/promises';
import path from 'path';

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: node setAdminClaim.mjs <email>');
    process.exit(2);
  }

  try {
    const saPath = path.resolve('./codutb-38c1e-firebase-adminsdk-346mp-2afb925ee4.json');
    const saRaw = await fs.readFile(saPath, 'utf8');
    const sa = JSON.parse(saRaw);

    admin.initializeApp({ credential: admin.credential.cert(sa) });
    const auth = admin.auth();

    const user = await auth.getUserByEmail(email);
    console.log('Found user:', user.uid, user.email);

    await auth.setCustomUserClaims(user.uid, { admin: true });
    console.log(`Set custom claim { admin: true } for ${email}`);

    // Optional: revoke existing sessions so tokens must be refreshed
    await auth.revokeRefreshTokens(user.uid);
    console.log('Revoked refresh tokens for user; they must sign in again to obtain updated claims.');

  } catch (err) {
    console.error('Error setting admin claim:', err);
    process.exitCode = 1;
  }
}

run();
