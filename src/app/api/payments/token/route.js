import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebase/admin'
import { getSessionUser } from '@/actions/auth'

export const dynamic = 'force-dynamic'

export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url)
        const orderId = searchParams.get('orderId')

        if (!orderId) {
            return NextResponse.json(
                { success: false, error: 'Order ID is required' },
                { status: 400 }
            )
        }

        // Verify user is authenticated
        const user = await getSessionUser()
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            )
        }

        // Get invoice with payment token
        const invoicesSnapshot = await adminDb
            .collection('invoices')
            .where('orderId', '==', orderId)
            .where('client.email', '==', user.email)
            .limit(1)
            .get()

        if (invoicesSnapshot.empty) {
            return NextResponse.json(
                { success: false, error: 'Invoice not found' },
                { status: 404 }
            )
        }

        const invoiceDoc = invoicesSnapshot.docs[0]
        const invoiceData = invoiceDoc.data()

        if (!invoiceData.midtransToken) {
            return NextResponse.json(
                { success: false, error: 'Payment token not found' },
                { status: 404 }
            )
        }

        return NextResponse.json({
            success: true,
            token: invoiceData.midtransToken,
            redirectUrl: invoiceData.midtransRedirectUrl,
        })
    } catch (error) {
        console.error('Error fetching payment token:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}






