# 📸 Fitur Upload Image - Cloudinary Integration

## ✅ Yang Sudah Diimplementasikan

### 1. Upload Image di Form Tambah Kelas/Event

Fitur upload image sudah ditambahkan di `ServiceCreate.jsx`:
- ✅ Upload langsung ke Cloudinary (GRATIS 25GB)
- ✅ Preview image sebelum upload
- ✅ Progress indicator saat uploading
- ✅ Validasi file type (hanya gambar)
- ✅ Validasi file size (max 10MB)
- ✅ Remove image functionality
- ✅ Image URL otomatis tersimpan ke database

---

## 🎯 Cara Pakai

### Di Form Tambah Kelas/Event:

1. Klik tombol **"Pilih Gambar"**
2. Pilih file gambar (JPG, PNG, GIF, WEBP)
3. Image akan langsung di-upload ke Cloudinary
4. Preview image akan muncul
5. Setelah upload selesai, image URL otomatis tersimpan saat submit form

### Image Akan Tampil Di:

1. ✅ **Services Table** (`/master-data/services`) - Thumbnail di kolom "Gambar"
2. ✅ **Services List** (`/services`) - Image banner di card kelas

---

## 📋 Fitur yang Tersedia

### ✅ Upload Features:
- Upload langsung dari browser ke Cloudinary
- Progress indicator saat uploading
- Preview sebelum upload selesai
- Remove image jika salah pilih
- Auto-save URL ke database saat submit

### ✅ Validasi:
- File type: Hanya image (JPG, PNG, GIF, WEBP)
- File size: Max 10MB (Cloudinary free tier limit)
- Error handling yang jelas

### ✅ UI/UX:
- Preview image dengan Next.js Image component
- Loading state saat uploading
- Success indicator setelah upload
- Error message jika upload gagal

---

## 🔧 Technical Details

### Komponen yang Digunakan:

1. **`useCloudinaryUpload`** hook:
   - Handle upload ke Cloudinary
   - Manage upload state (uploading, progress, error)
   - Return uploaded URL

2. **`ServiceCreate.jsx`**:
   - Image upload UI
   - Preview functionality
   - Integration dengan form submit

3. **`createService`** action:
   - Save imageUrl ke Firestore
   - Image URL disimpan di field `imageUrl`

---

## 📝 Environment Variables Required

Pastikan sudah di-set di Vercel:
- `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=dqdbfnmlh`
- `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=ml_default`

---

## 🧪 Test Upload

1. Buka: `/master-data/services/create`
2. Klik **"Pilih Gambar"**
3. Pilih file gambar
4. Tunggu upload selesai (progress bar akan muncul)
5. Submit form
6. Cek di `/master-data/services` - image seharusnya muncul di kolom "Gambar"
7. Cek di `/services` - image seharusnya muncul di card kelas

---

## 💡 Tips

1. **Ukuran file:** Gunakan gambar yang sudah di-compress untuk upload lebih cepat
2. **Format:** PNG untuk gambar dengan transparansi, JPG untuk foto
3. **Resolution:** Cloudinary akan otomatis optimize image
4. **CDN:** Image akan di-deliver via Cloudinary CDN (cepat worldwide)

---

## 🆘 Troubleshooting

### Image tidak ter-upload:
- Cek apakah environment variables sudah di-set di Vercel
- Cek browser console untuk error
- Pastikan upload preset `ml_default` sudah dibuat di Cloudinary Dashboard

### Image tidak muncul setelah upload:
- Cek apakah `imageUrl` tersimpan di Firestore
- Cek apakah URL dari Cloudinary valid
- Pastikan `next.config.mjs` sudah allow `res.cloudinary.com`

### Upload error:
- Cek file size (max 10MB)
- Cek file type (harus image)
- Cek Cloudinary dashboard untuk quota usage

---

## ✅ Checklist

- [x] Upload UI sudah ditambahkan di form
- [x] Preview image functionality
- [x] Upload ke Cloudinary integration
- [x] Image URL save ke database
- [x] Display image di ServicesTable
- [x] Display image di ServicesContent
- [ ] Test upload (pending user test)
- [ ] Test display image (pending user test)






