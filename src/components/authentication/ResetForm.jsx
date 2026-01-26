'use client'
import Link from 'next/link'
import React, { useState } from 'react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '@/lib/firebase/config'
import { useRouter } from 'next/navigation'
import Swal from 'sweetalert2'

const ResetForm = ({ path, loginPath }) => {
    const router = useRouter()
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)

        try {
            // Send password reset email
            await sendPasswordResetEmail(auth, email)

            Swal.fire({
                icon: 'success',
                title: 'Email Reset Dikirim!',
                html: `
                    <p>Kami telah mengirimkan link reset password ke email Anda:</p>
                    <p><strong>${email}</strong></p>
                    <p class="small text-muted">Silakan cek inbox email Anda dan ikuti instruksi untuk reset password.</p>
                    <p class="small text-muted">Jika tidak menemukan email, cek folder spam/junk.</p>
                `,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6'
            }).then(() => {
                if (loginPath) {
                    router.push(loginPath)
                }
            })
        } catch (error) {
            console.error('Reset password error:', error)
            let errorMessage = 'Gagal mengirim email reset password. Silakan coba lagi.'

            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Email tidak terdaftar dalam sistem.'
                    break
                case 'auth/invalid-email':
                    errorMessage = 'Format email tidak valid.'
                    break
                case 'auth/too-many-requests':
                    errorMessage = 'Terlalu banyak permintaan. Silakan tunggu beberapa saat.'
                    break
                default:
                    errorMessage = error.message || errorMessage
            }

            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: errorMessage
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <h2 className="fs-20 fw-bolder mb-4">Reset Password</h2>
            <h4 className="fs-13 fw-bold mb-2">Lupa Password?</h4>
            <p className="fs-12 fw-medium text-muted">
                Masukkan email Anda dan kami akan mengirimkan link untuk reset password.
            </p>
            <form onSubmit={handleSubmit} className="w-100 mt-4 pt-2">
                <div className="mb-4">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>
                <div className="mt-5">
                    <button type="submit" className="btn btn-lg btn-primary w-100" disabled={loading}>
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>
                </div>
            </form>
            <div className="mt-5 text-muted text-center">
                <span>Ingat password?</span>
                {' '}
                <Link href={loginPath || '/authentication/login/minimal'} className="fw-bold text-primary">
                    Login
                </Link>
            </div>
            {path && (
                <div className="mt-3 text-muted text-center">
                    <span>Belum punya akun?</span>
                    {' '}
                    <Link href={path} className="fw-bold">
                        Buat Akun
                    </Link>
                </div>
            )}
        </>
    )
}

export default ResetForm