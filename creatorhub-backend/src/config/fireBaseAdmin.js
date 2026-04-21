const admin = require("firebase-admin");

if (!admin.apps.length) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

    // Fix private key formatting issue
    serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

module.exports = admin;