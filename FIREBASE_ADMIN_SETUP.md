# 🔧 Firebase Admin SDK Setup untuk Next.js + Vercel

## ⚠️ Perbedaan: Node.js vs Next.js/Vercel

### ❌ Yang TIDAK BISA digunakan di Vercel (Node.js biasa):

```javascript
// ❌ INI TIDAK BEKERJA DI VERCEL/NEXT.JS
var admin = require("firebase-admin");
var serviceAccount = require("path/to/serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
```

**Mengapa tidak bisa:**
- File `serviceAccountKey.json` tidak tersedia di Vercel runtime
- Tidak bisa menggunakan `require()` dengan path file di serverless environment
- File system tidak persistent di Vercel

### ✅ Yang BENAR untuk Next.js/Vercel:

```javascript
// ✅ INI YANG BENAR UNTUK VERCEL/NEXT.JS
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";

// Ambil Service Account Key dari environment variable (JSON string)
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

const adminApp = initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
});

export const adminDb = getFirestore(adminApp);
export const adminAuth = getAuth(adminApp);
```

**Mengapa ini benar:**
- Service Account Key disimpan sebagai **JSON string** di environment variable
- Tidak perlu file system access
- Bekerja di Vercel serverless functions
- Secure (tidak expose ke client)

---

## 📋 Setup yang Sudah Diterapkan di Project Ini

File `src/lib/firebase/admin.js` sudah menggunakan approach yang benar:

1. ✅ Mengambil `FIREBASE_SERVICE_ACCOUNT_KEY` dari environment variable
2. ✅ Parse JSON string menjadi object
3. ✅ Validasi required fields
4. ✅ Error handling yang proper
5. ✅ Fallback untuk development (local)

---

## 🔐 Cara Set Service Account Key di Vercel

### Step 1: Download Service Account Key

1. Buka: https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk
2. Klik **"Generate new private key"**
3. Download file JSON (contoh: `crm-pt-rad-firebase-adminsdk-xxxxx.json`)

### Step 2: Convert JSON File ke Single Line String

**File JSON (multiline):**
```json
{
  "type": "service_account",
  "project_id": "crm-pt-rad",
  "private_key_id": "abc123...",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-xxxxx@crm-pt-rad.iam.gserviceaccount.com",
  ...
}
```

**Convert ke single line (untuk environment variable):**
```json
{"type":"service_account","project_id":"crm-pt-rad","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@crm-pt-rad.iam.gserviceaccount.com",...}
```

#### Mac/Linux:
```bash
jq -c . crm-pt-rad-firebase-adminsdk-xxxxx.json
```

#### Windows PowerShell:
```powershell
Get-Content crm-pt-rad-firebase-adminsdk-xxxxx.json | ConvertFrom-Json | ConvertTo-Json -Compress
```

#### Online Tools:
- https://www.freeformatter.com/json-formatter.html
- Pilih "Minify JSON" atau "Compact JSON"

### Step 3: Set di Vercel Environment Variables

1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. **Settings** > **Environment Variables**
4. Klik **"Add New"**
5. Isi:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Paste JSON string (single line) hasil convert
   - **Environment:** ✅ Production, ✅ Preview, ✅ Development
6. Klik **"Save"**

### Step 4: Deploy Ulang

```bash
vercel --prod
```

Atau trigger redeploy dari Vercel Dashboard.

---

## 🧪 Test Setup

Setelah deploy, cek logs di Vercel:

1. Buka **Deployments** > pilih deployment terbaru
2. Klik **View Function Logs**
3. Cari log:
   - ✅ `✅ Initializing Firebase Admin with Service Account`
   - ✅ `✅ Firebase Admin initialized successfully`

Jika ada error:
- ❌ `❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY`
- ❌ `❌ Service Account Key missing required fields`

---

## 📝 Format Environment Variable

Di `.env.local` (untuk local development):
```env
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"crm-pt-rad","private_key_id":"abc123","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@crm-pt-rad.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40crm-pt-rad.iam.gserviceaccount.com"}
```

Di Vercel Dashboard (Production):
- Key: `FIREBASE_SERVICE_ACCOUNT_KEY`
- Value: (sama seperti di atas, paste sebagai single line)

---

## ✅ Checklist

- [ ] Service Account Key sudah di-download dari Firebase Console
- [ ] JSON sudah di-convert ke single line string
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set di Vercel Environment Variables
- [ ] Semua environment (Production/Preview/Development) sudah di-centang
- [ ] Deploy ulang setelah menambah variable
- [ ] Logs menunjukkan `✅ Initializing Firebase Admin with Service Account`
- [ ] Login Google berfungsi di Vercel

---

## 🔒 Security Notes

- ⚠️ **JANGAN** commit file `serviceAccountKey.json` ke Git
- ⚠️ **JANGAN** expose `FIREBASE_SERVICE_ACCOUNT_KEY` ke public
- ✅ File `serviceAccountKey.json` sudah di-ignore di `.gitignore`
- ✅ `FIREBASE_SERVICE_ACCOUNT_KEY` hanya untuk server-side (tidak ada `NEXT_PUBLIC_` prefix)

---

## 🆘 Troubleshooting

### Error: "Could not load the default credentials"

**Penyebab:** `FIREBASE_SERVICE_ACCOUNT_KEY` tidak di-set atau tidak valid di Vercel

**Solusi:**
1. Pastikan `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set di Vercel Dashboard
2. Pastikan JSON string valid (single line)
3. Deploy ulang setelah menambah variable

### Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"

**Penyebab:** JSON string tidak valid atau ada karakter yang salah

**Solusi:**
1. Convert ulang JSON file ke single line dengan `jq -c .`
2. Pastikan tidak ada newline yang tersisa
3. Pastikan semua quote sudah escaped dengan benar

### Error: "Service Account Key missing required fields"

**Penyebab:** JSON string tidak lengkap atau field yang diperlukan hilang

**Solusi:**
1. Download ulang Service Account Key dari Firebase Console
2. Pastikan field `project_id`, `private_key`, `client_email` ada
3. Convert ulang ke single line






