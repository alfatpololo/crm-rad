import { initializeApp, getApps, getApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { getStorage } from "firebase-admin/storage";

// Helper to check if we're in a server environment
const isServer = typeof window === 'undefined';

let adminApp;
let adminDb;
let adminAuth;
let adminStorage;

if (isServer) {
    if (getApps().length === 0) {
        // Check if we have service account credentials in env
        let serviceAccount = null;
        const hasServiceAccountKey = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
        const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL === '1';

        if (hasServiceAccountKey) {
            try {
                const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
                
                // Validate that it's a valid JSON string
                if (serviceAccountKey.trim().startsWith('{')) {
                    serviceAccount = JSON.parse(serviceAccountKey);
                    
                    // Validate required fields
                    if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
                        throw new Error('Service Account Key missing required fields (project_id, private_key, client_email)');
                    }
                } else {
                    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY is not a valid JSON string');
                }
            } catch (e) {
                console.error('❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY:', e.message);
                console.error('Please check your environment variable in Vercel Dashboard');
                
                // In production, throw error instead of falling back
                if (isProduction) {
                    throw new Error(
                        'FIREBASE_SERVICE_ACCOUNT_KEY is required in production but is missing or invalid. ' +
                        'Please set it in Vercel Dashboard > Project Settings > Environment Variables. ' +
                        'Get the key from: https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/serviceaccounts/adminsdk'
                    );
                }
            }
        }

        if (serviceAccount) {
            console.log('✅ Initializing Firebase Admin with Service Account');
            try {
                adminApp = initializeApp({
                    credential: cert(serviceAccount),
                    projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                });
                console.log('✅ Firebase Admin initialized successfully');
            } catch (e) {
                console.error('❌ Failed to initialize Firebase Admin with Service Account:', e.message);
                throw e;
            }
        } else {
            // Only allow default credentials in development/local
            if (isProduction) {
                throw new Error(
                    'FIREBASE_SERVICE_ACCOUNT_KEY is required in production. ' +
                    'Please set it in Vercel Dashboard > Project Settings > Environment Variables. ' +
                    'For local development, create a .env.local file with FIREBASE_SERVICE_ACCOUNT_KEY.'
                );
            }
            
            console.log('⚠️ Initializing Firebase Admin with Default Credentials (development only)');
            try {
                adminApp = initializeApp({
                    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
                });
            } catch (e) {
                console.error('❌ Failed to initialize Firebase Admin:', e.message);
                throw new Error(
                    'Failed to initialize Firebase Admin. ' +
                    'Please set FIREBASE_SERVICE_ACCOUNT_KEY in your environment variables.'
                );
            }
        }

    } else {
        adminApp = getApp();
    }

    try {
        adminDb = getFirestore(adminApp);
        adminAuth = getAuth(adminApp);
        adminStorage = getStorage(adminApp);
    } catch (e) {
        console.error('❌ Failed to initialize Firebase Admin services:', e.message);
        throw e;
    }
}

export { adminDb, adminAuth, adminStorage };
