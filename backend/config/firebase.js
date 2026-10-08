const fs = require("fs");
const path = require("path");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const localKeyPath = path.join(__dirname, "serviceAccountKey.json");
const renderKeyPath = "/etc/secrets/serviceAccountKey.json";

const keyPath = fs.existsSync(renderKeyPath)
    ? renderKeyPath
    : localKeyPath;

let db;

if (fs.existsSync(keyPath)) {
    const serviceAccount = require(keyPath);
    initializeApp({
        credential: cert(serviceAccount)
    });
    db = getFirestore();
    console.log("✅ Firebase initialized from serviceAccountKey.json");
} else {
    console.warn("⚠️  serviceAccountKey.json not found — running Firebase in stub mode");
    // Minimal stub so routes that touch Firebase return errors instead of crashing on boot
    const notInit = () => {
        throw new Error("Firebase not initialized (serviceAccountKey.json missing)");
    };
    db = {
        collection: () => ({
            doc: () => ({
                set: notInit,
                get: notInit,
                update: notInit,
                delete: notInit
            }),
            add: notInit,
            get: notInit
        })
    };
}

module.exports = db;