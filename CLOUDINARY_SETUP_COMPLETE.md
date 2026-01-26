# ✅ Cloudinary Setup - Credentials Sudah Diterima!

## 🎉 Credentials Cloudinary Anda

- **Cloud Name:** `dqdbfnmlh`
- **API Key:** `684649163284329`
- **API Secret:** `d93HZ2aFRbBOU-aWQ_swVFS96s0`

---

## 📋 Langkah Setup (5 Menit)

### Step 1: Buat Upload Preset di Cloudinary

1. Buka: https://console.cloudinary.com/settings/upload
2. Scroll ke **"Upload presets"**
3. Klik **"Add upload preset"**
4. Isi:
   - **Preset name:** `ml_default`
   - **Signing mode:** **Unsigned** (untuk mudah)
   - **Folder:** (opsional, bisa kosong atau set `services`)
5. **Save**

### Step 2: Set Environment Variables

#### Di `.env.local`:

```env
# Cloudinary (Gratis 25GB)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqdbfnmlh
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

#### Di Vercel Dashboard:

1. Buka: https://vercel.com/dashboard
2. Pilih project Anda
3. **Settings** > **Environment Variables**
4. Klik **"Add New"**

**Variable 1:**
- **Key:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`
- **Value:** `dqdbfnmlh`
- **Environment:** ✅ Production ✅ Preview ✅ Development
- **Save**

**Variable 2:**
- **Key:** `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
- **Value:** `ml_default`
- **Environment:** ✅ Production ✅ Preview ✅ Development
- **Save**

### Step 3: Install Package

```bash
npm install cloudinary
```

### Step 4: Deploy Ulang

```bash
vercel --prod
```

Atau trigger redeploy dari Vercel Dashboard.

---

## ✅ Checklist

- [x] Cloudinary credentials sudah diterima
- [ ] Upload preset `ml_default` sudah dibuat di Cloudinary Dashboard
- [ ] Environment variables sudah di-set di `.env.local`
- [ ] Environment variables sudah di-set di Vercel Dashboard
- [ ] Package `cloudinary` sudah di-install
- [ ] Deploy ulang setelah menambah variables
- [ ] Test upload image

---

## 🔄 Cara Pakai di Komponen

Ganti hook yang lama dengan hook baru:

```javascript
// ❌ Lama (Firebase Storage - kena biaya)
import useStorageUpload from '@/hooks/useStorageUpload'

// ✅ Baru (Cloudinary - GRATIS 25GB)
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'

function MyComponent() {
  const { uploadImage, uploading, uploadedUrl, error } = useCloudinaryUpload()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    const result = await uploadImage(file, 'services')
    
    if (result.success) {
      console.log('Uploaded! URL:', result.url)
      // Save result.url ke database (Firestore)
    }
  }

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {uploadedUrl && <img src={uploadedUrl} alt="Uploaded" />}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

---

## 🧪 Test Upload

Setelah setup:

1. Gunakan komponen yang pakai upload
2. Upload image
3. Cek apakah URL yang didapat dari Cloudinary:
   - Format: `https://res.cloudinary.com/dqdbfnmlh/image/upload/...`
4. Image seharusnya langsung bisa diakses

---

## 💰 Free Tier Cloudinary

- ✅ **25GB storage** - Cukup untuk ribuan images
- ✅ **25GB bandwidth/month** - Cukup untuk traffic sedang
- ✅ **Image optimization** - Otomatis optimize & resize
- ✅ **CDN included** - Fast delivery worldwide
- ✅ **Video support** - Upload video juga bisa

**vs Firebase Storage:**
- Firebase: 5GB storage, 1GB/day downloads
- **Cloudinary 5x lebih besar!** 🎉

---

## 📝 File yang Sudah Dibuat

- ✅ `src/hooks/useCloudinaryUpload.js` - Hook untuk upload
- ✅ `src/actions/cloudinary-upload.js` - Server action (optional)
- ✅ `CLOUDINARY_CREDENTIALS.txt` - Credentials Anda
- ✅ `vercel-env-cloudinary-complete.txt` - Siap copy ke Vercel
- ✅ `next.config.mjs` - Sudah di-update untuk allow Cloudinary images

---

## 🆘 Troubleshooting

### Error: "Cloudinary cloud name not configured"
→ Pastikan `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` sudah di-set di Vercel

### Error: "Upload preset not found"
→ Pastikan upload preset `ml_default` sudah dibuat di Cloudinary Dashboard
→ Settings > Upload > Upload presets > Add upload preset

### Error: "Upload failed"
→ Cek browser console untuk detail error
→ Pastikan file size < 10MB (Cloudinary free tier limit)
→ Pastikan file adalah image (jpg, png, gif, webp)

---

## 🎯 Next Steps

1. Buat upload preset `ml_default` di Cloudinary Dashboard
2. Set environment variables di Vercel
3. Deploy ulang
4. Ganti `useStorageUpload` dengan `useCloudinaryUpload` di komponen yang pakai upload
5. Test upload!

Setelah ini, upload file akan pakai Cloudinary (GRATIS 25GB) bukan Firebase Storage! 🚀






