'use server'

import { adminDb } from '@/lib/firebase/admin'
import { getSessionUser } from './auth'
import { revalidatePath } from 'next/cache'

/**
 * Get all participants who attended a specific service (for admin to issue certificates)
 */
export async function getEligibleParticipants(serviceId) {
    try {
        const user = await getSessionUser()
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' }
        }

        const participantsSnapshot = await adminDb.collection('participants').get()
        const eligible = []

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data()
            const attendanceHistory = data.attendanceHistory || []
            
            // Check if attended this service
            const attendance = attendanceHistory.find(att => 
                (att.serviceId === serviceId || att.eventId === serviceId) && 
                att.status === 'attended'
            )

            if (attendance) {
                // Check if already has certificate
                const certificates = data.certificates || []
                const hasCertificate = certificates.some(cert => 
                    cert.serviceId === serviceId || cert.eventId === serviceId
                )

                eligible.push({
                    participantId: docSnap.id,
                    name: data.name || data.displayName || 'Unknown',
                    email: data.email || '',
                    attendedDate: attendance.attendedDate?.toDate ? attendance.attendedDate.toDate() : attendance.attendedDate,
                    hasCertificate: hasCertificate,
                    certificateIssuedDate: hasCertificate ? 
                        (certificates.find(c => c.serviceId === serviceId || c.eventId === serviceId)?.issuedDate?.toDate?.() || 
                         certificates.find(c => c.serviceId === serviceId || c.eventId === serviceId)?.issuedDate) 
                        : null
                })
            }
        }

        return { success: true, participants: eligible }
    } catch (error) {
        console.error('Error getting eligible participants:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Issue certificate to participant
 */
export async function issueCertificate({ participantId, serviceId, serviceName, certificateUrl }) {
    try {
        const user = await getSessionUser()
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' }
        }

        // Get participant data
        const participantDoc = await adminDb.collection('participants').doc(participantId).get()
        if (!participantDoc.exists) {
            return { success: false, error: 'Peserta tidak ditemukan' }
        }

        const participantData = participantDoc.data()
        const certificates = participantData.certificates || []
        
        // Check if already has certificate for this service
        const existingCert = certificates.find(cert => 
            cert.serviceId === serviceId || cert.eventId === serviceId
        )
        
        if (existingCert) {
            return { success: false, error: 'Sertifikat sudah pernah di-issue untuk kelas ini' }
        }

        // Check if attended
        const attendanceHistory = participantData.attendanceHistory || []
        const attendance = attendanceHistory.find(att => 
            (att.serviceId === serviceId || att.eventId === serviceId) && 
            att.status === 'attended'
        )

        if (!attendance) {
            return { success: false, error: 'Peserta belum hadir di kelas ini' }
        }

        // Generate certificate number
        const certNumber = `CERT-${serviceId.slice(0, 6).toUpperCase()}-${participantId.slice(0, 6).toUpperCase()}-${Date.now()}`

        // Create certificate record
        const certificate = {
            certificateNumber: certNumber,
            serviceId: serviceId,
            eventId: serviceId, // Alias
            serviceName: serviceName,
            participantName: participantData.name || participantData.displayName || 'Unknown',
            certificateUrl: certificateUrl || null, // Store certificate file URL
            issuedDate: new Date(),
            issuedBy: user.email,
            attendedDate: attendance.attendedDate,
            status: 'issued'
        }

        // Add certificate to participant
        const updatedCertificates = [...certificates, certificate]
        
        await participantDoc.ref.update({
            certificates: updatedCertificates,
            updatedAt: new Date()
        })

        revalidatePath('/certificates')
        revalidatePath('/customers/certificates')

        return {
            success: true,
            message: 'Sertifikat berhasil di-issue',
            certificate: {
                ...certificate,
                issuedDate: certificate.issuedDate.toISOString(),
                attendedDate: certificate.attendedDate?.toDate ? certificate.attendedDate.toDate().toISOString() : 
                              certificate.attendedDate instanceof Date ? certificate.attendedDate.toISOString() : 
                              certificate.attendedDate
            }
        }
    } catch (error) {
        console.error('Error issuing certificate:', error)
        return { success: false, error: error.message || 'Gagal meng-issue sertifikat' }
    }
}

/**
 * Get user certificates (for participant)
 */
export async function getUserCertificates() {
    try {
        const user = await getSessionUser()
        if (!user) {
            return { success: false, error: 'Unauthorized' }
        }

        const participantDoc = await adminDb.collection('participants').doc(user.uid).get()
        
        if (!participantDoc.exists) {
            return { success: true, certificates: [] }
        }

        const data = participantDoc.data()
        const certificates = data.certificates || []

        // Serialize dates
        const serializedCerts = certificates.map(cert => ({
            ...cert,
            issuedDate: cert.issuedDate?.toDate?.() ? cert.issuedDate.toDate().toISOString() : cert.issuedDate,
            attendedDate: cert.attendedDate?.toDate?.() ? cert.attendedDate.toDate().toISOString() : cert.attendedDate
        }))

        return { success: true, certificates: serializedCerts }
    } catch (error) {
        console.error('Error getting user certificates:', error)
        return { success: false, error: error.message }
    }
}

/**
 * Revoke/delete certificate from participant
 */
export async function revokeCertificate({ participantId, serviceId }) {
    try {
        const user = await getSessionUser()
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' }
        }

        // Get participant data
        const participantDoc = await adminDb.collection('participants').doc(participantId).get()
        if (!participantDoc.exists) {
            return { success: false, error: 'Peserta tidak ditemukan' }
        }

        const participantData = participantDoc.data()
        const certificates = participantData.certificates || []
        
        // Remove certificate for this service
        const updatedCertificates = certificates.filter(cert => 
            cert.serviceId !== serviceId && cert.eventId !== serviceId
        )
        
        await participantDoc.ref.update({
            certificates: updatedCertificates,
            updatedAt: new Date()
        })

        revalidatePath('/certificates')
        revalidatePath('/customers/certificates')

        return {
            success: true,
            message: 'Sertifikat berhasil dihapus'
        }
    } catch (error) {
        console.error('Error revoking certificate:', error)
        return { success: false, error: error.message || 'Gagal menghapus sertifikat' }
    }
}

/**
 * Get all certificates for a service (admin view)
 */
export async function getServiceCertificates(serviceId) {
    try {
        const user = await getSessionUser()
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized' }
        }

        const participantsSnapshot = await adminDb.collection('participants').get()
        const serviceCerts = []

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data()
            const certificates = data.certificates || []
            
            const cert = certificates.find(c => 
                c.serviceId === serviceId || c.eventId === serviceId
            )

            if (cert) {
                serviceCerts.push({
                    participantId: docSnap.id,
                    participantName: data.name || data.displayName || 'Unknown',
                    participantEmail: data.email || '',
                    certificateNumber: cert.certificateNumber,
                    issuedDate: cert.issuedDate?.toDate?.() ? cert.issuedDate.toDate().toISOString() : cert.issuedDate,
                    issuedBy: cert.issuedBy,
                    status: cert.status
                })
            }
        }

        return { success: true, certificates: serviceCerts }
    } catch (error) {
        console.error('Error getting service certificates:', error)
        return { success: false, error: error.message }
    }
}
