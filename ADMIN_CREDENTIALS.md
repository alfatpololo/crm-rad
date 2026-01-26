# Admin Dummy Account Credentials

## Akun Admin Dummy

**Email:** `admin@mail.com`  
**Password:** (akan di-update setelah daftar ulang)

## Cara Setup Akun Admin

### 1. Hapus Akun Lama (Jika Ada)
1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Pilih project Anda
3. Masuk ke **Authentication** > **Users**
4. Cari user dengan email `admin@mail.com`
5. Klik menu "..." di kanan user
6. Pilih **Delete user**
7. Konfirmasi penghapusan

### 2. Daftar Akun Admin Baru
1. Buka halaman register: `/authentication/register/minimal`
2. Isi form:
   - **Nama:** `Admin` (atau nama lain)
   - **Email:** `admin@mail.com`
   - **Password:** (password yang kamu mau)
   - **Confirm Password:** (sama dengan password)
3. Klik **Register**
4. Sistem akan otomatis mengenali sebagai admin karena email `admin@mail.com`

### 3. Catat Password Baru
Setelah daftar, pastikan catat password yang digunakan agar bisa login lagi nanti.

## Catatan Penting

- Email `admin@mail.com` adalah email khusus yang otomatis menjadi admin
- Password bisa diganti sesuai kebutuhan setelah login
- Jika lupa password, gunakan fitur "Forget password?" di halaman login
- Link reset password akan dikirim ke email `admin@mail.com`

## URL

- Halaman Login: `/authentication/login/minimal`
- Halaman Register: `/authentication/register/minimal`
- Halaman Reset Password: `/authentication/reset/minimal`

