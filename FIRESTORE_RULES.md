# Firestore Security Rules

## ⚠️ PENTING: Rules untuk Database Belum Ada!

Agar user (selain admin) bisa melihat kelas yang diinput admin di halaman `/services`, **Anda HARUS mengupdate Firestore Security Rules di Firebase Console**.

## File Rules Sudah Dibuat

File `firestore.rules` sudah dibuat di root project dengan rules lengkap untuk semua collections.

## Cara Deploy Rules ke Firebase:

### Opsi 1: Via Firebase Console (Paling Mudah)

1. **Buka Firebase Console**
   - https://console.firebase.google.com/
   - Pilih project Anda

2. **Pergi ke Firestore Database > Rules**
   - Di sidebar kiri, klik "Firestore Database"
   - Klik tab "Rules"

3. **Copy Rules dari File**
   - Buka file `firestore.rules` di project ini
   - Copy semua isinya

4. **Paste ke Firebase Console**
   - Paste rules yang sudah di-copy
   - Klik **"Publish"** untuk save

### Opsi 2: Via Firebase CLI (Jika sudah install)

```bash
# Install Firebase CLI (jika belum)
npm install -g firebase-tools

# Login ke Firebase
firebase login

# Init Firebase (jika belum)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

## Rules yang Sudah Dikonfigurasi:

✅ **Services collection**: Authenticated users bisa read, hanya admin bisa write  
✅ **Participants collection**: User bisa read/update data sendiri, admin bisa read semua  
✅ **Invoices collection**: User bisa read invoice mereka, admin bisa read/write semua  
✅ **Products collection**: Sama seperti services  

## Troubleshooting:

Jika kelas masih tidak muncul di user POV setelah update rules:

1. **Refresh browser** setelah update rules (rules bisa butuh beberapa detik untuk aktif)
2. **Cek console browser** (F12) untuk melihat error
3. **Pastikan user sudah login** (authenticated)
4. **Pastikan collection name** adalah `services` (bukan `service` atau lainnya)
5. **Pastikan email user** tidak sama dengan `admin@mail.com` (tapi masih ter-authenticate)

## Test Rules:

Setelah deploy rules, coba:
1. Login sebagai user (bukan admin)
2. Buka halaman `/services`
3. Buka console browser (F12)
4. Lihat apakah ada error `permission-denied`
5. Jika tidak ada error, kelas seharusnya muncul

Jika masih ada masalah, cek log di console browser untuk detail error.

