'use server';

import crypto from 'crypto';

const DOKU_CLIENT_ID = (process.env.DOKU_CLIENT_ID || '').trim().replace(/^\uFEFF/, '');
const DOKU_SECRET_KEY = (process.env.DOKU_SECRET_KEY || '').trim().replace(/^\uFEFF/, '');

function dokuEnvIsProduction() {
    const v = (process.env.DOKU_IS_PRODUCTION || '').trim().toLowerCase();
    return v === 'true' || v === '1' || v === 'yes';
}

const DOKU_IS_PRODUCTION = dokuEnvIsProduction();
const BASE_URL_SANDBOX = 'https://api-sandbox.doku.com';
const BASE_URL_PROD = 'https://api.doku.com';

const REQUEST_TARGET_PAYMENT = '/checkout/v1/payment';

function getDokuApiBases() {
    if (DOKU_IS_PRODUCTION) return [BASE_URL_PROD];
    return [BASE_URL_SANDBOX];
}

function getRequestTimestamp() {
    return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/**
 * Doku Checkout mengizinkan hanya: a-z A-Z 0-9 . - / + , = _ : ' @ %
 * Karakter lain (mis. (), unicode, &) menyebabkan error API.
 */
function sanitizeDokuField(input, maxLen = 255) {
    const raw = String(input ?? '');
    const ascii = raw
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9.\-+,_=:''@%\/]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLen);
    return ascii || 'Item';
}

function generateRequestId() {
    return crypto.randomUUID();
}

function generateDigest(body) {
    const str = typeof body === 'string' ? body : JSON.stringify(body);
    return crypto.createHash('sha256').update(str, 'utf8').digest('base64');
}

function generateSignature({ clientId, requestId, requestTimestamp, requestTarget, digest, secretKey }) {
    const parts = [
        `Client-Id:${clientId}`,
        `Request-Id:${requestId}`,
        `Request-Timestamp:${requestTimestamp}`,
        `Request-Target:${requestTarget}`,
    ];
    if (digest != null && digest !== '') {
        parts.push(`Digest:${digest}`);
    }
    const componentString = parts.join('\n');
    const hmac = crypto.createHmac('sha256', secretKey);
    hmac.update(componentString, 'utf8');
    return `HMACSHA256=${hmac.digest('base64')}`;
}

function formatDokuErrorPayload(data) {
    const errFromMessages = Array.isArray(data?.error_messages)
        ? data.error_messages.filter(Boolean).join('; ')
        : '';
    if (errFromMessages) return errFromMessages;
    if (data?.error?.message) return data.error.message;
    if (typeof data?.message === 'string') return data.message;
    if (Array.isArray(data?.message)) return data.message.filter(Boolean).join('; ');
    if (typeof data?.errors === 'string') return data.errors;
    if (data?.errors?.[0]?.message) return data.errors[0].message;
    return '';
}

/**
 * Ekstrak payment URL dari berbagai bentuk respons Doku / gateway.
 */
function extractPaymentUrl(data) {
    if (!data || typeof data !== 'object') return null;
    const candidates = [
        data?.response?.payment?.url,
        data?.response?.payment?.link,
        data?.payment?.url,
        data?.payment?.link,
        data?.url,
        data?.data?.response?.payment?.url,
        data?.data?.payment?.url,
        data?.data?.url,
    ];
    for (const u of candidates) {
        if (typeof u === 'string' && u.startsWith('http')) return u;
    }
    return null;
}

/**
 * @param {Object} params
 * @param {string} params.invoiceNumber
 * @param {number} params.amount - IDR integer
 * @param {number} [params.paymentDueMinutes]
 * @param {string} [params.callbackUrl]
 * @param {string} [params.callbackUrlCancel]
 * @param {{ name?: string, email?: string, phone?: string }} [params.customer]
 * @param {{ id: string, name: string, quantity: number, price: number }[]} [params.lineItems]
 */
export async function createDokuPayment({
    invoiceNumber,
    amount,
    paymentDueMinutes = 60,
    callbackUrl,
    callbackUrlCancel,
    customer,
    lineItems,
}) {
    if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
        return { success: false, error: 'Doku belum dikonfigurasi (DOKU_CLIENT_ID / DOKU_SECRET_KEY).' };
    }

    const amountInt = Math.round(Number(amount));
    if (!Number.isFinite(amountInt) || amountInt <= 0) {
        return { success: false, error: 'Amount tidak valid.' };
    }

    const dueMinutes = Math.min(Math.max(Number(paymentDueMinutes) || 60, 1), 999999);
    const invoiceNum = sanitizeDokuField(String(invoiceNumber), 64).replace(/\s/g, '_');

    const order = {
        amount: amountInt,
        invoice_number: invoiceNum,
        currency: 'IDR',
        language: 'ID',
        auto_redirect: Boolean(callbackUrl),
    };

    if (callbackUrl) {
        order.callback_url = callbackUrl;
        order.callback_url_result = callbackUrl;
    }
    if (callbackUrlCancel) order.callback_url_cancel = callbackUrlCancel;

    if (Array.isArray(lineItems) && lineItems.length > 0) {
        order.line_items = lineItems.map((item) => ({
            id: sanitizeDokuField(String(item.id || '1'), 64).replace(/\s/g, '_'),
            name: sanitizeDokuField(item.name || 'Item', 255),
            quantity: Math.max(1, Math.round(Number(item.quantity) || 1)),
            price: Math.round(Number(item.price) || 0),
        }));
    }

    const body = {
        order,
        payment: { payment_due_date: dueMinutes },
    };

    if (customer && (customer.email || customer.name || customer.phone)) {
        body.customer = {
            name: sanitizeDokuField(customer.name || 'Customer', 100),
            email: sanitizeDokuField(customer.email || '', 120),
        };
        if (customer.phone) {
            let p = String(customer.phone).replace(/\D/g, '');
            if (p.startsWith('0')) p = `62${p.slice(1)}`;
            else if (p && !p.startsWith('62')) p = `62${p}`;
            if (p) body.customer.phone = p.slice(0, 16);
        }
    }

    const requestId = generateRequestId();
    const requestTimestamp = getRequestTimestamp();
    const bodyString = JSON.stringify(body);
    const digest = generateDigest(bodyString);
    const signature = generateSignature({
        clientId: DOKU_CLIENT_ID,
        requestId,
        requestTimestamp,
        requestTarget: REQUEST_TARGET_PAYMENT,
        digest,
        secretKey: DOKU_SECRET_KEY,
    });

    const attempt = async (baseUrl) => {
        const res = await fetch(`${baseUrl}${REQUEST_TARGET_PAYMENT}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Client-Id': DOKU_CLIENT_ID,
                'Request-Id': requestId,
                'Request-Timestamp': requestTimestamp,
                Signature: signature,
            },
            body: bodyString,
        });

        let data = {};
        const text = await res.text().catch(() => '');
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = { _raw: text?.slice(0, 500) };
        }

        if (!res.ok) {
            const errMsg = formatDokuErrorPayload(data) || res.statusText || `HTTP ${res.status}`;
            console.error(
                'Doku createPayment failed:',
                res.status,
                'production:',
                DOKU_IS_PRODUCTION,
                'baseUrl:',
                baseUrl,
                'bodyPreview:',
                bodyString.slice(0, 200),
                'response:',
                text?.slice(0, 800)
            );
            return { success: false, error: errMsg };
        }

        const paymentUrl = extractPaymentUrl(data);
        if (!paymentUrl) {
            console.error('Doku createPayment no URL in response:', text?.slice(0, 1200));
            return { success: false, error: 'Doku tidak mengembalikan payment URL.' };
        }

        return { success: true, paymentUrl, raw: data };
    };

    try {
        const bases = getDokuApiBases();
        let lastResult = { success: false, error: 'Gagal membuat pembayaran Doku.' };

        for (const baseUrl of bases) {
            try {
                const result = await attempt(baseUrl);
                if (result.success) return result;
                lastResult = result;
            } catch (err) {
                lastResult = { success: false, error: err?.message || 'Gagal membuat pembayaran Doku.' };
            }
        }

        return lastResult;
    } catch (err) {
        console.error('Doku createPayment error:', err);
        return { success: false, error: err?.message || 'Gagal membuat pembayaran Doku.' };
    }
}

export async function checkDokuOrderStatus(invoiceNumber) {
    if (!DOKU_CLIENT_ID || !DOKU_SECRET_KEY) {
        return { success: false, error: 'Doku belum dikonfigurasi.' };
    }

    const inv = String(invoiceNumber || '').trim();
    if (!inv) return { success: false, error: 'Invoice number kosong.' };

    const requestId = generateRequestId();
    const requestTimestamp = getRequestTimestamp();
    const requestTarget = `/orders/v1/status/${encodeURIComponent(inv)}`;
    const signature = generateSignature({
        clientId: DOKU_CLIENT_ID,
        requestId,
        requestTimestamp,
        requestTarget,
        digest: null,
        secretKey: DOKU_SECRET_KEY,
    });

    const attempt = async (baseUrl) => {
        const res = await fetch(`${baseUrl}${requestTarget}`, {
            method: 'GET',
            headers: {
                'Client-Id': DOKU_CLIENT_ID,
                'Request-Id': requestId,
                'Request-Timestamp': requestTimestamp,
                Signature: signature,
            },
        });

        let data = {};
        const text = await res.text().catch(() => '');
        try {
            data = text ? JSON.parse(text) : {};
        } catch {
            data = {};
        }

        if (!res.ok) {
            const errMsg = formatDokuErrorPayload(data) || res.statusText || `HTTP ${res.status}`;
            return { success: false, error: errMsg };
        }

        const inner = data?.response && typeof data.response === 'object' ? data.response : data;
        const orderStatus = inner?.order?.status ?? data?.order?.status;
        const transactionStatus = inner?.transaction?.status ?? data?.transaction?.status;
        return { success: true, orderStatus, transactionStatus, raw: data };
    };

    try {
        const bases = getDokuApiBases();
        let lastResult = { success: false, error: 'Gagal cek status Doku.' };

        for (const baseUrl of bases) {
            const result = await attempt(baseUrl);
            if (result.success) return result;
            lastResult = result;
        }

        return lastResult;
    } catch (err) {
        console.error('Doku checkOrderStatus error:', err);
        return { success: false, error: err?.message || 'Gagal cek status Doku.' };
    }
}
