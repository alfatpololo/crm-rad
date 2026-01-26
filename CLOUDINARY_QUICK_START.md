# ⚡ Cloudinary Quick Start - 5 Menit Setup

## 🎯 Solusi Gratis untuk Upload File

**Free Tier Cloudinary:**
- ✅ 25GB storage (vs Firebase 5GB)
- ✅ 25GB bandwidth/month (vs Firebase 1GB/day)
- ✅ Image optimization otomatis
- ✅ CDN included
- ✅ 100% GRATIS untuk start!

---

## 📋 Setup (5 Menit)

### Step 1: Sign Up Cloudinary (1 menit)

1. Buka: https://cloudinary.com/users/register/free
2. Sign up (bisa pakai Google)
3. Done! Langsung dapat **25GB gratis**

### Step 2: Dapatkan Credentials (1 menit)

1. Setelah login, Dashboard akan muncul
2. Copy **Cloud Name** (ada di Dashboard)
3. Settings > API Keys:
   - Copy **API Key**
   - (Optional) Copy **API Secret** (untuk signed upload)

### Step 3: Setup Upload Preset (1 menit)

1. Settings > Upload > Upload presets
2. Klik **"Add upload preset"**
3. Isi:
   - **Preset name:** `ml_default`
   - **Signing mode:** **Unsigned** (untuk mudah)
   - **Folder:** (opsional, bisa set default folder)
4. **Save**

### Step 4: Install Package (30 detik)

```bash
npm install cloudinary
```

### Step 5: Set Environment Variables (1 menit)

#### Di `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name-here
CLOUDINARY_UPLOAD_PRESET=ml_default
```

**Catatan:** Untuk unsigned upload (mudah), cukup 2 variable di atas!

#### Di Vercel Dashboard:

1. Settings > Environment Variables
2. Add:
   - Key: `CLOUDINARY_CLOUD_NAME` → Value: cloud name Anda
   - Key: `CLOUDINARY_UPLOAD_PRESET` → Value: `ml_default`
3. Environment: ✅ Production ✅ Preview ✅ Development
4. Save

### Step 6: Deploy Ulang

```bash
vercel --prod
```

---

## ✅ Done!

Sekarang upload sudah bisa pakai Cloudinary (GRATIS 25GB)!

---

## 🔄 Cara Pakai di Komponen

Ganti hook yang lama dengan hook baru:

```javascript
// ❌ Lama (Firebase Storage - kena biaya)
import useStorageUpload from '@/hooks/useStorageUpload'

// ✅ Baru (Cloudinary - GRATIS 25GB)
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'

const { uploadImage, uploading, uploadedUrl, error } = useCloudinaryUpload()

// Upload file
const handleFileChange = async (e) => {
  const file = e.target.files[0]
  const result = await uploadImage(file, 'services')
  
  if (result.success) {
    console.log('Uploaded! URL:', result.url)
    // Save result.url ke database
  }
}
```

---

## 💰 Perbandingan Biaya

| Service | Free Tier | Biaya Setelah Free |
|---------|-----------|-------------------|
| **Cloudinary** ✅ | 25GB storage<br>25GB bandwidth/month | $0.04/GB storage |
| Firebase Storage | 5GB storage<br>1GB/day downloads | $0.026/GB storage<br>$0.12/GB downloads |

**Kesimpulan:** Cloudinary free tier **5x lebih besar** dari Firebase! 🎉

---

## 📚 File yang Sudah Dibuat

- ✅ `src/actions/cloudinary-upload.js` - Server action
- ✅ `src/hooks/useCloudinaryUpload.js` - Client hook
- ✅ `CLOUDINARY_SETUP.md` - Setup guide lengkap
- ✅ `CLOUDINARY_IMPLEMENTATION.md` - Implementation details

---

## 🧪 Test

Setelah setup, test upload:
1. Gunakan komponen yang pakai upload
2. Upload image
3. Cek apakah URL yang didapat dari Cloudinary (seharusnya: `https://res.cloudinary.com/...`)

---

## 🆘 Troubleshooting

### Error: "Cloudinary credentials not configured"
→ Pastikan `CLOUDINARY_CLOUD_NAME` sudah di-set di environment variables

### Error: "Upload preset not found"
→ Pastikan upload preset `ml_default` sudah dibuat di Cloudinary Dashboard
→ Atau ubah `CLOUDINARY_UPLOAD_PRESET` sesuai nama preset Anda

### Error: "Upload failed"
→ Cek browser console untuk detail error
→ Pastikan file size < 10MB (Cloudinary free tier limit)






