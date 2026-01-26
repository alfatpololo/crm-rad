# Setup Environment Variables untuk Firebase Deploy

## 📋 Langkah-langkah Setup

### 1. Buat File `.env.local`

Buat file `.env.local` di root project dengan isi berikut:

```env
# ==========================================
# FIREBASE CLIENT CONFIGURATION (Public)
# ==========================================
# Dapatkan nilai-nilai ini dari Firebase Console > Project Settings > General > Your apps
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general

# API Key (Public - safe untuk client-side)
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key-here

# Auth Domain
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com

# Project ID
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id

# Storage Bucket
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com

# Messaging Sender ID
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id

# App ID
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id

# Measurement ID (Optional - untuk Google Analytics)
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX

# ==========================================
# FIREBASE ADMIN SDK (Server-side Only)
# ==========================================
# Dapatkan Service Account Key dari:
# Firebase Console > Project Settings > Service Accounts > Generate new private key
# https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/serviceaccounts/adminsdk

# Service Account Key (JSON string - jangan expose ke public!)
# Copy seluruh isi JSON file dari Firebase Console, lalu paste di sini sebagai single line
# TIPS: Gunakan jq untuk convert JSON ke single line:
#   jq -c . serviceAccountKey.json
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id","private_key_id":"","private_key":"-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n","client_email":"","client_id":"","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":""}
```

### 2. Cara Mendapatkan Nilai-nilai Environment Variables

#### A. Firebase Client Config (NEXT_PUBLIC_*)

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik **Project Settings** (⚙️ icon) di sidebar kiri
4. Pilih tab **General**
5. Scroll ke bawah ke bagian **Your apps**
6. Jika belum ada web app, klik **Add app** > pilih **Web** (</> icon)
7. Copy nilai-nilai berikut dari Firebase SDK setup:
   - `apiKey` → `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `authDomain` → `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `projectId` → `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `storageBucket` → `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `messagingSenderId` → `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `appId` → `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `measurementId` → `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` (optional)

#### B. Firebase Admin SDK (FIREBASE_SERVICE_ACCOUNT_KEY)

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Klik **Project Settings** (⚙️ icon) di sidebar kiri
4. Pilih tab **Service accounts**
5. Klik **Generate new private key**
6. Klik **Generate key** di dialog yang muncul
7. File JSON akan ter-download
8. Convert JSON file ke single line string:
   
   **Mac/Linux:**
   ```bash
   jq -c . serviceAccountKey.json
   ```
   
   **Windows (PowerShell):**
   ```powershell
   Get-Content serviceAccountKey.json | ConvertFrom-Json | ConvertTo-Json -Compress
   ```
   
   **Manual:**
   - Copy seluruh isi JSON file
   - Remove semua newline/line breaks
   - Paste sebagai single line di `.env.local`

### 3. Update `.firebaserc`

Update file `.firebaserc` dengan project ID Firebase Anda:

```json
{
  "projects": {
    "default": "your-actual-project-id"
  }
}
```

### 4. Test Konfigurasi

Setelah setup `.env.local`, test dengan:

```bash
# Install dependencies (jika belum)
npm install

# Test build
npm run build

# Test development server
npm run dev
```

## 🔒 Security Notes

1. **JANGAN** commit file `.env.local` ke Git (sudah ada di `.gitignore`)
2. **JANGAN** expose `FIREBASE_SERVICE_ACCOUNT_KEY` ke public
3. Untuk production deploy, set environment variables di:
   - Firebase Hosting: Environment variables di Firebase Console
   - Vercel: Settings > Environment Variables
   - Other platforms: Sesuai dokumentasi platform

## 📝 Template File

File ini berisi template untuk copy-paste. Ganti semua `your-*` dengan nilai yang sesuai dari Firebase Console Anda.






