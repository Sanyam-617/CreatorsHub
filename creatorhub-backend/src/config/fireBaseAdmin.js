const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

if (!admin.apps.length) {
    const serviceAccountPath = path.resolve(process.env.FIREBASE_ADMIN_SDK_PATH);

    if (!fs.existsSync(serviceAccountPath)) {
        console.error(` Service account file not found at: ${serviceAccountPath}`);
        process.exit(1);
    }

    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

module.exports = admin;