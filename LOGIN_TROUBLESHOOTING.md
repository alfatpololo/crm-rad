# 🔍 Troubleshooting Login Issue

## ❌ Error: "Still can't login"

### Langkah-langkah Debugging

#### 1. Cek Environment Variables di Vercel

**PENTING:** Pastikan `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set di Vercel Environment Variables!

1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. **Settings** > **Environment Variables**
4. Cek apakah `FIREBASE_SERVICE_ACCOUNT_KEY` ada dan sudah di-set untuk:
   - ✅ Production
   - ✅ Preview
   - ✅ Development

#### 2. Verifikasi Service Account Key Format

**Service Account Key HARUS:**
- JSON string (single line)
- Tidak ada newline/line breaks
- Semua field ada (terutama `project_id`, `private_key`, `client_email`)

**Cara convert JSON ke single line:**

```bash
# Mac/Linux
jq -c . serviceAccountKey.json

# Windows PowerShell
Get-Content serviceAccountKey.json | ConvertFrom-Json | ConvertTo-Json -Compress
```

#### 3. Cek Logs di Vercel

Setelah mencoba login, cek logs:

1. Buka **Deployments** > pilih deployment terbaru
2. Klik **View Function Logs**
3. Cari error messages:
   - ❌ `Firebase Admin not initialized`
   - ❌ `Failed to parse FIREBASE_SERVICE_ACCOUNT_KEY`
   - ❌ `Credential implementation failed`
   - ✅ `✅ Initializing Firebase Admin with Service Account`
   - ✅ `✅ Session created successfully`

#### 4. Test di Local Development

Pastikan login berfungsi di local:

```bash
# Pastikan .env.local ada dengan FIREBASE_SERVICE_ACCOUNT_KEY
npm run dev

# Coba login dan cek console untuk error
```

---

## 🔧 Common Issues & Solutions

### Issue 1: "Firebase Admin not initialized"

**Penyebab:**
- `FIREBASE_SERVICE_ACCOUNT_KEY` tidak di-set di Vercel
- Format Service Account Key salah

**Solusi:**
1. Download Service Account Key dari Firebase Console
2. Convert ke single line JSON
3. Set di Vercel Environment Variables
4. Deploy ulang

### Issue 2: "Credential implementation failed"

**Penyebab:**
- Service Account Key format salah
- Missing required fields
- JSON tidak valid

**Solusi:**
1. Download ulang Service Account Key
2. Pastikan convert ke single line dengan benar
3. Pastikan tidak ada karakter yang terpotong
4. Test dengan `jq` untuk memastikan valid JSON

### Issue 3: Login berhasil tapi tidak redirect

**Penyebab:**
- Error di `createSession` tapi tidak di-handle dengan baik
- Middleware blocking redirect

**Solusi:**
1. Cek browser console untuk error
2. Cek Network tab untuk request ke `/api/auth`
3. Cek cookies apakah session cookie sudah ter-set

### Issue 4: Google Login tidak bekerja

**Penyebab:**
- OAuth consent screen belum dikonfigurasi
- Domain tidak di-whitelist di Firebase Console

**Solusi:**
1. Buka Firebase Console > Authentication > Sign-in method
2. Pastikan Google provider sudah enabled
3. Pastikan domain Vercel sudah di-whitelist di Authorized domains

---

## 📋 Checklist

- [ ] `FIREBASE_SERVICE_ACCOUNT_KEY` sudah di-set di Vercel Environment Variables
- [ ] Service Account Key format sudah benar (JSON single line)
- [ ] Semua environment (Production/Preview/Development) sudah di-centang
- [ ] Deploy ulang setelah menambah/mengubah environment variables
- [ ] Cek logs di Vercel untuk error messages
- [ ] Login berfungsi di local development
- [ ] Google OAuth sudah di-enable di Firebase Console
- [ ] Domain Vercel sudah di-whitelist di Firebase Console

---

## 🧪 Test Login Flow

### Step 1: Test Email/Password Login

1. Buka halaman login
2. Isi email dan password
3. Klik "Login"
4. Cek browser console (F12) untuk error
5. Cek Network tab untuk request ke server
6. Jika error, cek message di alert/Swal

### Step 2: Test Google Login

1. Buka halaman login
2. Klik "Continue with Google"
3. Pilih Google account
4. Authorize app
5. Cek browser console untuk error
6. Cek apakah redirect ke dashboard berhasil

### Step 3: Cek Vercel Logs

1. Setelah mencoba login, buka Vercel Dashboard
2. Deployments > Latest deployment > View Function Logs
3. Cari log messages:
   - `🔄 Creating session cookie...`
   - `✅ Session created successfully`
   - Atau error messages

---

## 🆘 Jika Masih Error

1. **Copy error message lengkap** dari:
   - Browser console
   - Vercel logs
   - Swal alert

2. **Cek apakah Service Account Key valid:**
   ```bash
   # Test parse JSON
   echo 'YOUR_SERVICE_ACCOUNT_KEY_STRING' | jq .
   ```

3. **Pastikan Firebase Admin initialized:**
   - Cek logs untuk: `✅ Initializing Firebase Admin with Service Account`

4. **Test di local development:**
   - Pastikan `.env.local` ada dengan `FIREBASE_SERVICE_ACCOUNT_KEY`
   - Test login di local
   - Jika bekerja di local tapi tidak di Vercel = environment variable issue

---

## 📞 Quick Fix Commands

```bash
# 1. Pull environment variables dari Vercel
vercel env pull .env.production

# 2. Cek apakah FIREBASE_SERVICE_ACCOUNT_KEY ada
grep FIREBASE_SERVICE_ACCOUNT_KEY .env.production

# 3. Deploy ulang
vercel --prod
```






