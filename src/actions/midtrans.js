'use server';

/**
 * Midtrans Payment Gateway Integration
 * Create payment transaction using Midtrans Snap
 */

const RETRY_DELAYS_MS = [1000, 2000, 3000];
const MAX_RETRIES = 3;

/**
 * Fetch with retry on network error or 5xx (transient errors)
 * @param {string} url
 * @param {RequestInit} init - body must be string so it can be reused on retry
 * @returns {Promise<Response>}
 */
async function fetchWithRetry(url, init) {
    let lastError;
    for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
            const res = await fetch(url, init);
            if (res.ok) return res;
            if (res.status >= 400 && res.status < 500) return res; // jangan retry 4xx
            if (res.status >= 500 && attempt < MAX_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
                continue;
            }
            return res;
        } catch (err) {
            lastError = err;
            if (attempt < MAX_RETRIES - 1) {
                await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
            } else {
                throw lastError;
            }
        }
    }
    throw lastError;
}

/**
 * Generate Snap Token for payment
 * @param {Object} orderDetails - Order details { orderId, amount, items, customer }
 * @returns {Promise<{success: boolean, token?: string, redirectUrl?: string, error?: string}>}
 */
export async function createMidtransTransaction(orderDetails) {
    try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        
        if (!serverKey) {
            return { success: false, error: 'Midtrans server key not configured' };
        }

        // Base64 encode server key for authorization
        const auth = Buffer.from(serverKey + ':').toString('base64');

        const terms = Array.isArray(orderDetails.installmentTerms) && orderDetails.installmentTerms.length
            ? orderDetails.installmentTerms
            : [3, 4, 5, 6, 12];
        const transactionDetails = {
            transaction_details: {
                order_id: orderDetails.orderId,
                gross_amount: orderDetails.amount,
            },
            item_details: orderDetails.items || [],
            customer_details: {
                first_name: orderDetails.customer.name?.split(' ')[0] || orderDetails.customer.name || 'Customer',
                last_name: orderDetails.customer.name?.split(' ').slice(1).join(' ') || '',
                email: orderDetails.customer.email || '',
                phone: orderDetails.customer.phone || '',
            },
            credit_card: {
                installment: {
                    required: false,
                    terms: {
                        bni: terms,
                        mandiri: terms,
                        bca: terms,
                        cimb: terms,
                        bri: terms,
                        maybank: terms,
                        offline: terms,
                    },
                },
            },
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status?orderId=${encodeURIComponent(orderDetails.orderId)}`,
                error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status?orderId=${encodeURIComponent(orderDetails.orderId)}&status=error`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status?orderId=${encodeURIComponent(orderDetails.orderId)}&status=pending`,
            },
        };

        // Determine API endpoint based on environment
        const apiUrl = isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        // Create transaction (dengan retry jika network/5xx)
        const bodyStr = JSON.stringify(transactionDetails);
        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
            body: bodyStr,
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Midtrans API Error:', errorData);
            return { 
                success: false, 
                error: errorData.error_messages?.join(', ') || 'Failed to create transaction' 
            };
        }

        const data = await response.json();

        return {
            success: true,
            token: data.token,
            redirectUrl: data.redirect_url,
        };
    } catch (error) {
        console.error('Error creating Midtrans transaction:', error);
        const isNetworkError = error?.message?.toLowerCase().includes('fetch') || error?.name === 'TypeError';
        return {
            success: false,
            error: isNetworkError
                ? 'Koneksi terganggu. Silakan coba lagi.'
                : (error.message || 'Gagal membuat transaksi pembayaran'),
        };
    }
}

/**
 * Verify payment status from Midtrans
 * @param {string} orderId - Order ID to check
 * @returns {Promise<{success: boolean, status?: string, transactionStatus?: string, error?: string}>}
 */
export async function checkMidtransPaymentStatus(orderId) {
    try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const isProduction = process.env.MIDTRANS_IS_PRODUCTION === 'true';
        
        if (!serverKey) {
            return { success: false, error: 'Midtrans server key not configured' };
        }

        const auth = Buffer.from(serverKey + ':').toString('base64');
        
        const apiUrl = isProduction
            ? `https://api.midtrans.com/v2/${orderId}/status`
            : `https://api.sandbox.midtrans.com/v2/${orderId}/status`;

        const response = await fetchWithRetry(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return {
                success: false,
                error: errorData.error_messages?.join(', ') || 'Gagal memeriksa status pembayaran',
            };
        }

        const data = await response.json();

        return {
            success: true,
            status: data.transaction_status,
            transactionStatus: data.transaction_status,
            paymentType: data.payment_type,
            fraudStatus: data.fraud_status,
            grossAmount: data.gross_amount,
            currency: data.currency,
        };
    } catch (error) {
        console.error('Error checking Midtrans payment status:', error);
        const isNetworkError = error?.message?.toLowerCase().includes('fetch') || error?.name === 'TypeError';
        return {
            success: false,
            error: isNetworkError
                ? 'Koneksi terganggu. Silakan coba lagi.'
                : (error.message || 'Gagal memeriksa status pembayaran'),
        };
    }
}

/**
 * Handle Midtrans notification (webhook)
 * @param {Object} notification - Notification data from Midtrans
 * @returns {Promise<{success: boolean, message?: string, error?: string}>}
 */
export async function handleMidtransNotification(notification) {
    try {
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const orderId = notification.order_id;
        const transactionStatus = notification.transaction_status;
        const fraudStatus = notification.fraud_status;

        if (!serverKey) {
            return { success: false, error: 'Midtrans server key not configured' };
        }

        // Verify the notification
        const statusResult = await checkMidtransPaymentStatus(orderId);
        
        if (!statusResult.success) {
            return { success: false, error: 'Failed to verify notification' };
        }

        // Handle payment status
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                // Payment successful
                // Update invoice status to 'paid'
                // This will be handled in the payment status check
                return { success: true, message: 'Payment captured successfully' };
            }
        } else if (transactionStatus === 'settlement') {
            // Payment settled
            return { success: true, message: 'Payment settled successfully' };
        } else if (transactionStatus === 'pending') {
            // Payment pending
            return { success: true, message: 'Payment pending' };
        } else if (transactionStatus === 'deny' || transactionStatus === 'expire' || transactionStatus === 'cancel') {
            // Payment failed
            return { success: true, message: 'Payment failed or cancelled' };
        }

        return { success: true, message: 'Notification processed' };
    } catch (error) {
        console.error('Error handling Midtrans notification:', error);
        return { success: false, error: error.message || 'Failed to process notification' };
    }
}






