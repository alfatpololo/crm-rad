# ☁️ Setup Cloudinary untuk Upload File Gratis

## 📋 Langkah Setup

### Step 1: Buat Akun Cloudinary

1. Buka: https://cloudinary.com/users/register/free
2. Sign up dengan email atau Google
3. Setelah sign up, akan langsung ke Dashboard

### Step 2: Dapatkan API Credentials

1. Di Dashboard, klik **Settings** (gear icon di kanan atas)
2. Atau langsung ke: https://console.cloudinary.com/settings/api
3. Copy credentials berikut:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### Step 3: Install Package

```bash
npm install cloudinary
```

### Step 4: Set Environment Variables

Tambahkan ke `.env.local`:

```env
# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

Tambahkan ke Vercel Environment Variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## ✅ Free Tier Cloudinary

- ✅ **25GB storage** - Cukup untuk ribuan images
- ✅ **25GB bandwidth/month** - Cukup untuk traffic sedang
- ✅ **Image optimization** - Otomatis optimize & resize
- ✅ **CDN included** - Fast delivery worldwide
- ✅ **Video support** - Upload video juga bisa

---

## 🔒 Security

- **API Secret** hanya untuk server-side (tidak pakai `NEXT_PUBLIC_`)
- Upload bisa via:
  - Server Action (secure)
  - Signed upload URL (client-side, secure)

---

## 📚 Next Steps

Setelah setup credentials, kita akan buat:
1. Server Action untuk upload ke Cloudinary
2. Hook untuk client-side upload
3. Update komponen yang pakai upload

Lihat implementasi di file yang akan dibuat berikutnya!






