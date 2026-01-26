'use server';

/**
 * Midtrans Payment Gateway Integration
 * Create payment transaction using Midtrans Snap
 */

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

        // Prepare transaction payload
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
            callbacks: {
                finish: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status`,
                error: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status`,
                pending: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payments/status`,
            },
        };

        // Determine API endpoint based on environment
        const apiUrl = isProduction
            ? 'https://app.midtrans.com/snap/v1/transactions'
            : 'https://app.sandbox.midtrans.com/snap/v1/transactions';

        // Create transaction
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
            body: JSON.stringify(transactionDetails),
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
        return { success: false, error: error.message || 'Failed to create payment transaction' };
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

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Basic ${auth}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            return { 
                success: false, 
                error: errorData.error_messages?.join(', ') || 'Failed to check payment status' 
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
        return { success: false, error: error.message || 'Failed to check payment status' };
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






