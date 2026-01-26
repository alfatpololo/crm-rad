# 🔧 Vercel Environment Variables

Copy semua variables berikut ke Vercel Dashboard:
**Settings > Environment Variables > Add New**

Atau gunakan Vercel CLI:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# ... dst
```

---

## 📋 List Environment Variables

### 🔵 Client-side (NEXT_PUBLIC_*)

**Key:** `NEXT_PUBLIC_FIREBASE_API_KEY`  
**Value:**
```
AIzaSyBudBlQo86hBrf5FoN9kpOf3i9adxg9ShU
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`  
**Value:**
```
crm-pt-rad.firebaseapp.com
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_PROJECT_ID`  
**Value:**
```
crm-pt-rad
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`  
**Value:**
```
crm-pt-rad.firebasestorage.app
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`  
**Value:**
```
1096984236949
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_APP_ID`  
**Value:**
```
1:1096984236949:web:119c4bafc4b01691909c9c
```

---

**Key:** `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`  
**Value:**
```
G-7NBLHP2WS4
```

---

### 🔴 Server-side (FIREBASE_SERVICE_ACCOUNT_KEY)

**Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`  
**Value:** (JSON string - copy dari Service Account Key yang sudah di-convert ke single line)

```
{"type":"service_account","project_id":"crm-pt-rad","private_key_id":"YOUR_PRIVATE_KEY_ID","private_key":"-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@crm-pt-rad.iam.gserviceaccount.com","client_id":"YOUR_CLIENT_ID","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-xxxxx%40crm-pt-rad.iam.gserviceaccount.com"}
```

**⚠️ Catatan:** Ganti `YOUR_PRIVATE_KEY_ID`, `YOUR_PRIVATE_KEY_HERE`, dll dengan nilai sebenarnya dari Service Account Key JSON.

---

## 📝 Cara Copy ke Vercel

### Method 1: Via Dashboard (Recommended)

1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. Klik **Settings** > **Environment Variables**
4. Klik **Add New**
5. Copy **Key** dan **Value** dari list di atas
6. Pilih environment: **Production**, **Preview**, **Development** (atau semua)
7. Klik **Save**

### Method 2: Via CLI

```bash
# Install Vercel CLI jika belum
npm install -g vercel

# Login
vercel login

# Add variables (pilih environment: production/preview/development)
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY production
# Paste value: AIzaSyBudBlQo86hBrf5FoN9kpOf3i9adxg9ShU
# Enter

vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN production
# Paste value: crm-pt-rad.firebaseapp.com
# Enter

# ... ulangi untuk semua variables
```

### Method 3: Bulk Import (jika support)

Atau gunakan file `.env` dengan format Vercel dan import via CLI:

```bash
vercel env pull .env.production
# Edit file .env.production dengan semua variables
vercel env push .env.production production
```

---

## ✅ Checklist

- [ ] Semua `NEXT_PUBLIC_*` variables sudah di-set
- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set (dengan Service Account Key yang valid)
- [ ] Variables di-set untuk environment yang tepat (Production/Preview/Development)
- [ ] Deploy ulang setelah menambah variables baru

---

## 🔍 Verifikasi

Setelah menambah variables, deploy ulang project untuk memastikan variables ter-load:

```bash
vercel --prod
```

Atau trigger deployment baru dari Vercel Dashboard.






