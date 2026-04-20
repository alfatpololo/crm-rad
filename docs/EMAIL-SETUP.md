# Supaya Email Benar-Benar Masuk Inbox

Aplikasi mengirim email via **Resend** (QR kehadiran, blast promo). Kalau kirim "berhasil" tapi email tidak sampai, cek poin berikut.

## 1. API Key & From address

- Di `.env.local` (dan di Vercel Environment Variables) set:
  - `RESEND_API_KEY` = API key dari [Resend Dashboard](https://resend.com/api-keys)
  - `RESEND_FROM` = alamat pengirim, contoh: `CRM <noreply@domain-anda.com>`

## 2. Verifikasi domain di Resend

- **Tanpa verifikasi domain**: Resend hanya mengizinkan kirim **dari** `onboarding@resend.dev` dan **hanya ke email akun Resend Anda**. Ke alamat lain bisa ditolak atau tidak terkirim.
- **Dengan verifikasi domain**:
  1. Buka [Resend → Domains](https://resend.com/domains)
  2. Tambah domain (mis. `domain-anda.com`)
  3. Pasang record DNS yang diminta (SPF, DKIM, optional DMARC)
  4. Set `RESEND_FROM` pakai email di domain itu, contoh: `CRM <noreply@domain-anda.com>`

Setelah domain verified, kirim ke berbagai alamat (Gmail, Yahoo, dll) biasanya bisa dan lebih jarang masuk spam.

## 3. Cek folder Spam

- Email bisa terkirim tapi masuk **Spam/Junk**. Cek folder itu dan tandai "Bukan spam" agar ke depan masuk Inbox.

## 4. Batasan Resend

- Free tier: jumlah kirim per bulan terbatas.
- From address **harus** domain yang sudah di-verify di Resend (atau `onboarding@resend.dev` dengan batasan di atas).

## Ringkas

| Gejala              | Kemungkinan penyebab              | Solusi |
|---------------------|-----------------------------------|--------|
| "Berhasil" tapi tidak ada email | `RESEND_API_KEY` salah/kosong     | Cek env dan API key di Resend |
| Tidak masuk inbox   | Domain belum verified / pakai onboarding | Verifikasi domain, pakai `RESEND_FROM` dari domain itu |
| Masuk spam          | Domain belum verified / reputasi  | Verifikasi domain + DNS; cek folder Spam |
