'use client'

import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { completePurchase } from '@/actions/payments'
import { continueMilestonePurchase } from '@/actions/participants'

export default function PaymentStatusContent() {
    const searchParams = useSearchParams()
    const orderId = searchParams.get('orderId')
    const [state, setState] = useState({
        loading: true,
        error: null,
        result: null,
        continueLoading: false,
        continueError: null,
    })

    const runComplete = useCallback(async () => {
        if (!orderId) {
            setState({ loading: false, error: 'Parameter orderId tidak ada.', result: null, continueLoading: false, continueError: null })
            return
        }
        const r = await completePurchase(orderId)
        setState((prev) => ({
            ...prev,
            loading: false,
            error: r.success ? null : r.error || 'Verifikasi gagal',
            result: r,
            continueError: null,
        }))
    }, [orderId])

    useEffect(() => {
        runComplete()
    }, [runComplete])

    async function handleContinueNext() {
        const po = state.result?.purchaseOrderId
        if (!po) return
        setState((prev) => ({ ...prev, continueLoading: true, continueError: null }))
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : undefined
        const r = await continueMilestonePurchase(po, { baseUrl })
        if (r.success && r.redirectUrl && r.orderId) {
            window.location.href = `/payments/process?orderId=${encodeURIComponent(r.orderId)}&redirectUrl=${encodeURIComponent(r.redirectUrl)}`
            return
        }
        setState((prev) => ({
            ...prev,
            continueLoading: false,
            continueError: r.error || (r.success ? null : 'Tidak dapat membuat pembayaran berikutnya.'),
        }))
    }

    if (!orderId) {
        return (
            <div className="container py-5">
                <div className="alert alert-warning">Tidak ada order pembayaran pada URL.</div>
                <Link href="/">Kembali ke beranda</Link>
            </div>
        )
    }

    if (state.loading) {
        return (
            <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: '50vh' }}>
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading</span>
                </div>
                <p className="text-muted mb-0">Memverifikasi pembayaran…</p>
            </div>
        )
    }

    const ok = state.result?.success

    return (
        <div className="container py-5" style={{ maxWidth: 560 }}>
            {state.error && !ok ? (
                <div className="alert alert-danger">{state.error}</div>
            ) : null}

            {ok ? (
                <>
                    <div className="alert alert-success mb-3">{state.result.message}</div>
                    {state.result.milestonePartial && state.result.purchaseOrderId ? (
                        <div className="mb-3">
                            <p className="small text-muted mb-2">
                                Tahap {state.result.paidMilestoneCount} dari {state.result.milestoneCount} sudah dibayar. Akses kelas dibuka setelah semua tahap lunas.
                            </p>
                            <button
                                type="button"
                                className="btn btn-primary"
                                disabled={state.continueLoading}
                                onClick={handleContinueNext}
                            >
                                {state.continueLoading ? 'Memproses…' : 'Bayar tahap berikutnya'}
                            </button>
                            {state.continueError ? <p className="text-danger small mt-2 mb-0">{state.continueError}</p> : null}
                        </div>
                    ) : null}
                </>
            ) : null}

            <div className="d-flex flex-wrap gap-2 mt-3">
                <Link href="/payments-history" className="btn btn-outline-secondary btn-sm">
                    Riwayat pembayaran
                </Link>
                <Link href="/profile" className="btn btn-outline-secondary btn-sm">
                    Profil
                </Link>
                <Link href="/services" className="btn btn-outline-primary btn-sm">
                    Katalog kelas
                </Link>
            </div>
        </div>
    )
}
