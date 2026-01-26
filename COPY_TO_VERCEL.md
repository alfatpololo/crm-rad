# 📋 Copy Service Account Key ke Vercel - Quick Guide

## 🎯 Langkah Sederhana

### 1. Buka File Ini
File: **`SERVICE_ACCOUNT_KEY_FOR_VERCEL.txt`**

Copy **SEMUA** isi file (satu baris panjang).

---

### 2. Buka Vercel Dashboard

🔗 **https://vercel.com/dashboard**

→ Pilih project  
→ **Settings** > **Environment Variables**  
→ Klik **"Add New"**

---

### 3. Paste di Vercel

- **Key:** `FIREBASE_SERVICE_ACCOUNT_KEY`
- **Value:** Paste JSON string dari file di atas
- **Environment:** ✅ Production ✅ Preview ✅ Development

**Save**

---

### 4. Deploy Ulang

**PENTING!** Deploy ulang setelah menambah variable:

- Via Dashboard: Deployments → Latest → **"Redeploy"**
- Via CLI: `vercel --prod`

---

## ✅ Done!

Setelah deploy ulang, coba login lagi. Seharusnya sudah berfungsi! 🎉

---

## 🔍 Cek Hasil

1. Login di aplikasi Vercel
2. Jika masih error, cek:
   - Browser console (F12)
   - Vercel logs: Deployments → View Function Logs
   - Cari: `✅ Initializing Firebase Admin with Service Account`






