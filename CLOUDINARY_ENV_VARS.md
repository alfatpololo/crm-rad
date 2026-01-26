# 📋 Cloudinary Environment Variables

## 🔐 Environment Variables yang Diperlukan

### Untuk Client-Side Upload (Recommended - Lebih Mudah)

**Di `.env.local`:**
```env
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default
```

**Di Vercel Dashboard:**
- Key: `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` → Value: cloud name Anda
- Key: `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` → Value: `ml_default`

**Catatan:** 
- Pakai `NEXT_PUBLIC_` prefix agar bisa diakses di client-side
- Upload langsung dari browser ke Cloudinary (lebih efisien)
- Tidak perlu API Secret untuk unsigned upload preset

---

### Untuk Server-Side Upload (Optional - Lebih Secure)

Jika ingin upload via server action:

**Di `.env.local`:**
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=ml_default
CLOUDINARY_API_SECRET=your-api-secret  # Optional, untuk signed upload
```

**Di Vercel Dashboard:**
- Key: `CLOUDINARY_CLOUD_NAME`
- Key: `CLOUDINARY_UPLOAD_PRESET`
- Key: `CLOUDINARY_API_SECRET` (optional)

---

## 🎯 Recommended: Client-Side Upload

**Kenapa?**
- ✅ Lebih cepat (upload langsung, tidak lewat server)
- ✅ Lebih efisien (tidak pakai server bandwidth)
- ✅ Lebih simple (tidak perlu API Secret)
- ✅ Cloudinary handle optimization otomatis

**Setup:**
1. Buat unsigned upload preset di Cloudinary Dashboard
2. Set `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` dan `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`
3. Done!

---

## 📝 Quick Copy untuk Vercel

**Key 1:** `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`  
**Value:** `[PASTE CLOUD NAME DARI CLOUDINARY DASHBOARD]`

**Key 2:** `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET`  
**Value:** `ml_default`

**Environment:** ✅ Production ✅ Preview ✅ Development

---

## ✅ Checklist

- [ ] Sign up Cloudinary (gratis 25GB)
- [ ] Buat upload preset `ml_default` (unsigned)
- [ ] Set environment variables di `.env.local`
- [ ] Set environment variables di Vercel
- [ ] Deploy ulang setelah menambah variables
- [ ] Test upload






