# 🚀 Implementasi Cloudinary - Step by Step

## 📋 Step 1: Setup Cloudinary Account

1. Sign up: https://cloudinary.com/users/register/free
2. Get credentials dari Dashboard:
   - Cloud Name
   - API Key
   - API Secret
3. Setup Upload Preset:
   - Settings > Upload > Upload presets
   - Create unsigned upload preset: `ml_default`
   - Atau kita bisa pakai signed upload (lebih secure)

---

## 📋 Step 2: Install Package

```bash
npm install cloudinary
```

---

## 📋 Step 3: Set Environment Variables

### Di `.env.local`:

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### Di Vercel Dashboard:

Tambahkan ke Environment Variables:
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

---

## 📋 Step 4: Update Komponen

Ganti `useStorageUpload` dengan `useCloudinaryUpload`:

```javascript
// ❌ Lama (Firebase Storage)
import useStorageUpload from '@/hooks/useStorageUpload'

// ✅ Baru (Cloudinary)
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'

const { uploadImage, uploading, uploadedUrl, error } = useCloudinaryUpload()
```

---

## 📋 Step 5: Upload Preset Setup

### Option A: Unsigned Upload (Mudah)

1. Cloudinary Dashboard > Settings > Upload
2. Upload presets > Add upload preset
3. Name: `ml_default`
4. Signing mode: **Unsigned**
5. Save

**Kelebihan:** Simple, langsung bisa pakai
**Kekurangan:** Less secure (anyone bisa upload)

### Option B: Signed Upload (Recommended)

1. Upload preset: `ml_default` dengan signing mode: **Signed**
2. Generate signature di server-side
3. Lebih secure

---

## ✅ File yang Sudah Dibuat

1. ✅ `src/actions/cloudinary-upload.js` - Server action untuk upload
2. ✅ `src/hooks/useCloudinaryUpload.js` - Hook untuk client-side upload
3. ✅ `CLOUDINARY_SETUP.md` - Setup guide
4. ✅ `CLOUDINARY_IMPLEMENTATION.md` - Implementation guide

---

## 🧪 Test Upload

Setelah setup:

```javascript
import useCloudinaryUpload from '@/hooks/useCloudinaryUpload'

function MyComponent() {
  const { uploadImage, uploading, uploadedUrl, error } = useCloudinaryUpload()

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    const result = await uploadImage(file, 'services')
    
    if (result.success) {
      console.log('Uploaded URL:', result.url)
      // Use result.url to save to database
    }
  }

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {uploading && <p>Uploading...</p>}
      {uploadedUrl && <img src={uploadedUrl} alt="Uploaded" />}
      {error && <p>Error: {error}</p>}
    </div>
  )
}
```

---

## 💰 Cost Comparison

| Service | Free Tier | After Free Tier |
|---------|-----------|-----------------|
| **Cloudinary** | ✅ 25GB storage<br>25GB bandwidth/month | $0.04/GB storage<br>$0.04/GB bandwidth |
| **Firebase Storage** | ✅ 5GB storage<br>1GB/day downloads | $0.026/GB storage<br>$0.12/GB downloads |
| **Vercel Blob** | ✅ 1GB storage<br>10GB bandwidth/month | $0.15/GB storage<br>$0.15/GB bandwidth |

**Kesimpulan:** Cloudinary free tier paling generous! 🎉






