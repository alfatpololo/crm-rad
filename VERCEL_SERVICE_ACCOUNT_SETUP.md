# 🔐 Setup Service Account Key untuk Vercel

## ❌ Error yang Terjadi

```
Session creation failed. Credential implementation provided to initializeApp() 
via the "credential" property failed to fetch a valid Google OAuth2 access token 
with the following error: "Could not load the default credentials."
```

## ✅ Solusi

Error ini terjadi karena Firebase Admin SDK di Vercel **TIDAK BISA** menggunakan default credentials. Anda **WAJIB** menyetel `FIREBASE_SERVICE_ACCOUNT_KEY` di Vercel Environment Variables.

---

## 📋 Langkah-langkah

### 1. Dapatkan Service Account Key

1. Buka Firebase Console:
   ```
   https://console.firebase.google.com/project/crm-pt-rad/settings/serviceaccounts/adminsdk
   ```

2. Klik **"Generate new private key"**
   
3. Klik **"Generate key"** di dialog yang muncul

4. File JSON akan ter-download (contoh: `crm-pt-rad-firebase-adminsdk-xxxxx.json`)

### 2. Convert JSON ke Single Line String

#### Mac/Linux:
```bash
jq -c . crm-pt-rad-firebase-adminsdk-xxxxx.json
```

#### Windows PowerShell:
```powershell
Get-Content crm-pt-rad-firebase-adminsdk-xxxxx.json | ConvertFrom-Json | ConvertTo-Json -Compress
```

#### Manual:
1. Buka file JSON dengan text editor
2. Copy seluruh isi file
3. Remove semua line breaks (newlines)
4. Paste sebagai single line

### 3. Set di Vercel Dashboard

1. Buka Vercel Dashboard:
   ```
   https://vercel.com/dashboard
   ```

2. Pilih project Anda

3. Klik **Settings** > **Environment Variables**

4. Klik **"Add New"**

5. Isi form:
   - **Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`
   - **Value:** Paste JSON string hasil convert (single line)
   - **Environment:** Centang semua:
     - ✅ Production
     - ✅ Preview  
     - ✅ Development

6. Klik **"Save"**

### 4. Deploy Ulang

Setelah menambah environment variable, **WAJIB** deploy ulang:

```bash
# Via CLI
vercel --prod

# Atau trigger dari Vercel Dashboard > Deployments > Redeploy
```

---

## 🔍 Verifikasi

Setelah deploy, cek logs di Vercel Dashboard:

1. Buka **Deployments** > pilih deployment terbaru
2. Klik **View Function Logs**
3. Cari log: `✅ Initializing Firebase Admin with Service Account`
4. Jika ada error, akan muncul: `❌ Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY`

---

## ✅ Checklist

- [ ] Service Account Key sudah di-download dari Firebase Console
- [ ] JSON sudah di-convert ke single line string
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set di Vercel Dashboard
- [ ] Semua environment (Production/Preview/Development) sudah di-centang
- [ ] Deploy ulang setelah menambah variable
- [ ] Logs menunjukkan `✅ Initializing Firebase Admin with Service Account`

---

## 🆘 Troubleshooting

### Error: "Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY"

**Kemungkinan penyebab:**
1. JSON string tidak valid (ada newline atau format salah)
2. Missing required fields (project_id, private_key, client_email)

**Solusi:**
- Pastikan JSON di-convert ke single line dengan benar
- Gunakan `jq -c .` untuk convert yang benar
- Pastikan tidak ada karakter yang terpotong saat copy-paste

### Error: "Service Account Key missing required fields"

**Kemungkinan penyebab:**
- JSON string tidak lengkap atau terpotong

**Solusi:**
- Download ulang Service Account Key
- Convert lagi ke single line
- Pastikan semua field ada (terutama `project_id`, `private_key`, `client_email`)

### Error masih muncul setelah setup

**Kemungkinan penyebab:**
- Environment variable belum ter-load (perlu deploy ulang)
- Variable di-set untuk environment yang salah

**Solusi:**
- Deploy ulang setelah menambah variable
- Pastikan variable di-set untuk environment yang digunakan (Production/Preview/Development)

---

## 📝 Format Service Account Key (Contoh)

**Format yang benar (single line):**
```json
{"type":"service_account","project_id":"crm-pt-rad","private_key_id":"abc123...","private_key":"-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@crm-pt-rad.iam.gserviceaccount.com","client_id":"123456789","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40crm-pt-rad.iam.gserviceaccount.com"}
```

**⚠️ JANGAN** expose Service Account Key ke public atau commit ke Git!






