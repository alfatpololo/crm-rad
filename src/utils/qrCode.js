/**
 * Generate QR Code data string for attendance
 * Format: SERVICE_ID|PARTICIPANT_ID|PURCHASE_DATE|RANDOM_TOKEN
 */
export function generateQRCodeData(serviceId, participantId, purchaseDate) {
    const timestamp = purchaseDate instanceof Date ? purchaseDate.getTime() : new Date(purchaseDate).getTime()
    const randomToken = Math.random().toString(36).substring(2, 15)
    return `${serviceId}|${participantId}|${timestamp}|${randomToken}`
}

/**
 * Parse QR Code data
 */
export function parseQRCodeData(qrData) {
    try {
        const parts = qrData.split('|')
        if (parts.length !== 4) {
            return null
        }
        return {
            serviceId: parts[0],
            participantId: parts[1],
            purchaseTimestamp: parseInt(parts[2]),
            token: parts[3]
        }
    } catch (error) {
        console.error('Error parsing QR code data:', error)
        return null
    }
}

/**
 * Validate QR Code data
 */
export function validateQRCodeData(qrData, expectedServiceId, expectedParticipantId) {
    const parsed = parseQRCodeData(qrData)
    if (!parsed) return false
    
    return parsed.serviceId === expectedServiceId && 
           parsed.participantId === expectedParticipantId
}



