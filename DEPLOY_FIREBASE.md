# 🚀 Panduan Deploy ke Firebase Hosting

## Prerequisites

1. Install Firebase CLI:
   ```bash
   npm install -g firebase-tools
   ```

2. Login ke Firebase:
   ```bash
   firebase login
   ```

3. Pastikan sudah setup `.env.local` (lihat [ENV_SETUP.md](./ENV_SETUP.md))

4. Pastikan `.firebaserc` sudah di-update dengan project ID Anda:
   ```json
   {
     "projects": {
       "default": "your-project-id"
     }
   }
   ```

## 📦 Opsi Deploy

### Opsi 1: Static Export (Recommended untuk Next.js)

Next.js 14 mendukung static export. Tapi karena project ini menggunakan Server Actions dan dynamic routes, kita perlu deploy sebagai serverless functions.

### Opsi 2: Deploy ke Vercel (Recommended untuk Next.js dengan Server Actions)

Vercel adalah platform yang dibuat oleh creator Next.js, dan support penuh untuk Next.js dengan Server Actions.

**Deploy ke Vercel:**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Set environment variables di Vercel Dashboard:
   - Masuk ke [Vercel Dashboard](https://vercel.com/dashboard)
   - Pilih project
   - Settings > Environment Variables
   - Add semua variables dari `.env.local`

### Opsi 3: Firebase Functions + Hosting (Advanced)

Jika tetap ingin deploy ke Firebase Hosting dengan Next.js Server Actions, perlu setup Firebase Functions.

## 🔥 Deploy Firestore Rules

Sebelum deploy app, pastikan Firestore Rules sudah di-deploy:

```bash
# Deploy Firestore Rules
firebase deploy --only firestore:rules

# Deploy Firestore Indexes (jika ada)
firebase deploy --only firestore:indexes
```

## 📋 Checklist Sebelum Deploy

- [ ] `.env.local` sudah diisi dengan nilai yang benar
- [ ] `.firebaserc` sudah di-update dengan project ID
- [ ] Firestore Rules sudah di-update di Firebase Console atau via `firebase deploy --only firestore:rules`
- [ ] Build berhasil (`npm run build`)
- [ ] Test di development mode (`npm run dev`)

## 🔍 Troubleshooting

### Error: Project ID tidak ditemukan
- Pastikan `.firebaserc` sudah di-update dengan project ID yang benar
- Check dengan: `firebase projects:list`

### Error: Permission denied
- Pastikan sudah login: `firebase login`
- Pastikan user memiliki permission untuk project

### Error: Environment variables tidak ter-load
- Pastikan `.env.local` ada di root project
- Pastikan semua variables dimulai dengan `NEXT_PUBLIC_` untuk client-side
- Untuk production, set environment variables di hosting platform

### Build Error: Module not found
- Hapus `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Build lagi: `npm run build`

## 📚 Referensi

- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [Next.js Deployment](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel Deployment](https://vercel.com/docs)






