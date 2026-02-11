import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";
import { readFileSync, existsSync, readdirSync } from "fs";
import { join } from "path";

const isServer = typeof window === "undefined";

const ADMIN_NOT_CONFIGURED_MSG =
    "Firebase Admin belum dikonfigurasi. Letakkan file JSON dari Firebase (nama apa saja, misal serviceAccountKey.json atau crm-pt-rad-firebase-adminsdk-xxx.json) di root project. " +
    "Atau isi FIREBASE_SERVICE_ACCOUNT_KEY di .env.local. Ambil dari: Firebase Console → Project Settings → Service accounts → Generate new private key.";

function getServiceAccountFromEnv() {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    if (!raw || typeof raw !== "string" || !raw.trim()) return null;
    try {
        const key = raw.trim();
        if (!key.startsWith("{")) return null;
        const parsed = JSON.parse(key);
        if (!parsed.project_id || !parsed.private_key || !parsed.client_email) return null;
        return parsed;
    } catch {
        return null;
    }
}

function findServiceAccountJsonPath() {
    const cwd = process.cwd();
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS && existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
        return process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
    if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH && existsSync(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)) {
        return process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
    }
    const exact = join(cwd, "serviceAccountKey.json");
    if (existsSync(exact)) return exact;
    try {
        const files = readdirSync(cwd);
        const found = files.find((f) =>
            f.endsWith(".json") && (f.includes("firebase") || f.includes("adminsdk") || f.startsWith("serviceAccountKey"))
        );
        if (found) return join(cwd, found);
    } catch (_) {}
    return null;
}

function getServiceAccountFromFile() {
    if (!isServer) return null;
    try {
        const path = findServiceAccountJsonPath();
        if (!path) return null;
        const content = readFileSync(path, "utf8");
        const parsed = JSON.parse(content);
        if (!parsed.project_id || !parsed.private_key || !parsed.client_email) return null;
        return parsed;
    } catch {
        return null;
    }
}

function getServiceAccount() {
    return getServiceAccountFromEnv() || getServiceAccountFromFile();
}

let _adminApp = null;
let _adminDb = null;
let _adminAuth = null;
let _adminStorage = null;

function initAdminOnce() {
    if (!isServer) return;
    if (_adminApp) return;
    const serviceAccount = getServiceAccount();
    if (!serviceAccount) {
        throw new Error(ADMIN_NOT_CONFIGURED_MSG);
    }
    if (getApps().length === 0) {
        _adminApp = initializeApp({
            credential: cert(serviceAccount),
            projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        });
    } else {
        _adminApp = getApp();
    }
    _adminDb = getFirestore(_adminApp);
    _adminAuth = getAuth(_adminApp);
    _adminStorage = getStorage(_adminApp);
}

// Proxy yang cuma lempar error (tidak wrap instance Firestore) — hindari "Cannot redefine property: _settingsFrozen"
const throwProxy = () =>
    new Proxy({}, {
        get() {
            throw new Error(ADMIN_NOT_CONFIGURED_MSG);
        },
    });

// Inisialisasi sekali di server saat ada credentials; export instance asli (bukan Proxy) supaya Firestore SDK tidak error _settingsFrozen
if (isServer) {
    try {
        if (getServiceAccount()) initAdminOnce();
    } catch (_) {}
}

export const adminDb = isServer ? (_adminDb ?? throwProxy()) : throwProxy();
export const adminAuth = isServer ? (_adminAuth ?? throwProxy()) : throwProxy();
export const adminStorage = isServer ? (_adminStorage ?? throwProxy()) : throwProxy();
