# 📋 Vercel Environment Variables - Tabel Format

Copy-paste ke Vercel Dashboard: **Settings > Environment Variables**

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_FIREBASE_API_KEY` | `AIzaSyBudBlQo86hBrf5FoN9kpOf3i9adxg9ShU` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` | `crm-pt-rad.firebaseapp.com` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | `crm-pt-rad` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET` | `crm-pt-rad.firebasestorage.app` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | `1096984236949` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_APP_ID` | `1:1096984236949:web:119c4bafc4b01691909c9c` | ✅ Production<br>✅ Preview<br>✅ Development |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID` | `G-7NBLHP2WS4` | ✅ Production<br>✅ Preview<br>✅ Development |
| `FIREBASE_SERVICE_ACCOUNT_KEY` | `[REPLACE DENGAN SERVICE ACCOUNT KEY JSON]` | ✅ Production<br>✅ Preview<br>✅ Development |

## 🔧 Cara Mengisi FIREBASE_SERVICE_ACCOUNT_KEY

1. Buka: https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk
2. Klik **"Generate new private key"**
3. Download JSON file
4. Convert ke single line:
   ```bash
   # Mac/Linux
   jq -c . serviceAccountKey.json
   
   # Windows PowerShell
   Get-Content serviceAccountKey.json | ConvertFrom-Json | ConvertTo-Json -Compress
   ```
5. Copy hasil dan paste sebagai Value untuk `FIREBASE_SERVICE_ACCOUNT_KEY`

## ✅ Checklist

- [ ] Semua variables sudah di-add ke Vercel
- [ ] Semua environment (Production/Preview/Development) sudah di-centang
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` sudah diisi dengan Service Account Key yang valid
- [ ] Deploy ulang setelah menambah variables

