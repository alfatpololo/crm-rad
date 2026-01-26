# 🔐 Setup .env.local dengan Credentials Firebase Anda

## ✅ Credentials yang Sudah Diterima

Project ID: **crm-pt-rad**

## 📝 Langkah-langkah

### 1. Buat File `.env.local`

Buat file `.env.local` di root project dengan isi berikut:

```env
# ==========================================
# FIREBASE CLIENT CONFIGURATION (Public)
# ==========================================
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBudBlQo86hBrf5FoN9kpOf3i9adxg9ShU
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=crm-pt-rad.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=crm-pt-rad
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=crm-pt-rad.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1096984236949
NEXT_PUBLIC_FIREBASE_APP_ID=1:1096984236949:web:119c4bafc4b01691909c9c
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-7NBLHP2WS4

# ==========================================
# FIREBASE ADMIN SDK (Server-side Only)
# ==========================================
# ⚠️ PENTING: Anda perlu mendapatkan Service Account Key dari Firebase Console
# 
# Cara mendapatkan:
# 1. Buka: https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk
# 2. Klik "Generate new private key"
# 3. Download JSON file
# 4. Convert ke single line string:
#    
#    Mac/Linux:
#    jq -c . serviceAccountKey.json
#    
#    Windows (PowerShell):
#    Get-Content serviceAccountKey.json | ConvertFrom-Json | ConvertTo-Json -Compress
#    
# 5. Copy hasil dan paste di bawah ini (sebagai single line):
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"crm-pt-rad","private_key_id":"","private_key":"-----BEGIN PRIVATE KEY-----\n\n-----END PRIVATE KEY-----\n","client_email":"","client_id":"","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":""}
```

### 2. Dapatkan Service Account Key

1. Buka: https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk
2. Klik **"Generate new private key"**
3. Klik **"Generate key"** di dialog
4. File JSON akan ter-download
5. Convert JSON ke single line:
   
   **Mac/Linux:**
   ```bash
   jq -c . serviceAccountKey.json
   ```
   
   **Windows (PowerShell):**
   ```powershell
   Get-Content serviceAccountKey.json | ConvertFrom-Json | ConvertTo-Json -Compress
   ```
   
6. Copy hasil (sebagai single line) dan paste ke `FIREBASE_SERVICE_ACCOUNT_KEY` di `.env.local`

### 3. Test Setup

Setelah file `.env.local` dibuat dengan Service Account Key, test dengan:

```bash
# Test build
npm run build

# Test dev server
npm run dev
```

## ✅ Checklist

- [x] `.firebaserc` sudah di-update dengan project ID: `crm-pt-rad`
- [ ] File `.env.local` sudah dibuat dengan client credentials (NEXT_PUBLIC_*)
- [ ] Service Account Key sudah ditambahkan ke `FIREBASE_SERVICE_ACCOUNT_KEY`
- [ ] Build berhasil (`npm run build`)
- [ ] Dev server berjalan (`npm run dev`)

## 🔒 Security Notes

- **JANGAN** commit file `.env.local` ke Git (sudah di-ignore)
- **JANGAN** expose `FIREBASE_SERVICE_ACCOUNT_KEY` ke public
- File ini hanya untuk local development
- Untuk production deploy, set environment variables di hosting platform

## 📚 Next Steps

Setelah `.env.local` setup:
1. Deploy Firestore Rules: `firebase deploy --only firestore:rules`
2. Test aplikasi di local: `npm run dev`
3. Deploy ke Firebase Hosting atau Vercel (lihat `DEPLOY_FIREBASE.md`)






