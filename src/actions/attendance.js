'use server';

import { adminDb } from '@/lib/firebase/admin';
import { getSessionUser } from './auth';
import { revalidatePath } from 'next/cache';
import { parseQRCodeData } from '@/utils/qrCode';

/**
 * Helper function to serialize Firestore data
 */
function serializeFirestoreData(data) {
    if (data === null || data === undefined) return data;
    
    if (data.toDate && typeof data.toDate === 'function') {
        return data.toDate().toISOString();
    }
    
    if (data instanceof Date) {
        return data.toISOString();
    }
    
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }
    
    if (typeof data === 'object' && data.constructor === Object) {
        const serialized = {};
        for (const [key, value] of Object.entries(data)) {
            serialized[key] = serializeFirestoreData(value);
        }
        return serialized;
    }
    
    return data;
}

/**
 * Scan QR Code and mark attendance
 */
export async function scanAttendance(qrCodeData) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { success: false, error: 'Unauthorized. Hanya admin yang bisa scan QR code.' };
        }

        // Parse QR code data
        const parsed = parseQRCodeData(qrCodeData);
        if (!parsed) {
            return { success: false, error: 'QR Code tidak valid' };
        }

        const { serviceId, participantId } = parsed;

        // Get participant data
        const participantDoc = await adminDb.collection('participants').doc(participantId).get();
        if (!participantDoc.exists) {
            return { success: false, error: 'Peserta tidak ditemukan' };
        }

        const participantData = participantDoc.data();
        const enrolledClasses = participantData.enrolledClasses || [];
        
        // Check if participant is enrolled in this service
        const enrolledClass = enrolledClasses.find(cls => cls.id === serviceId || cls.serviceId === serviceId);
        if (!enrolledClass) {
            return { success: false, error: 'Peserta tidak terdaftar di kelas ini' };
        }

        // Get service data
        const serviceDoc = await adminDb.collection('services').doc(serviceId).get();
        if (!serviceDoc.exists) {
            return { success: false, error: 'Kelas tidak ditemukan' };
        }

        const serviceData = serviceDoc.data();

        // Check attendance history
        const attendanceHistory = participantData.attendanceHistory || [];
        const existingAttendance = attendanceHistory.find(att => 
            (att.serviceId === serviceId || att.eventId === serviceId) &&
            att.status === 'attended'
        );

        if (existingAttendance) {
            // Return as success but with flag
            return { 
                success: true, 
                data: {
                    participantName: participantData.name || participantData.displayName || 'Unknown',
                    className: serviceData.name || enrolledClass.name || 'Unknown',
                    alreadyAttended: true
                }
            };
        }

        // Create attendance record
        const attendanceRecord = {
            serviceId: serviceId,
            eventId: serviceId, // Alias for compatibility
            serviceName: serviceData.name || enrolledClass.name || 'Unknown',
            status: 'attended',
            registeredDate: enrolledClass.purchaseDate 
                ? (typeof enrolledClass.purchaseDate === 'string' 
                    ? new Date(enrolledClass.purchaseDate) 
                    : enrolledClass.purchaseDate)
                : new Date(),
            attendedDate: new Date(),
            scannedBy: user.email,
            notes: `Scanned via QR Code`,
        };

        // Update participant document
        const updatedAttendanceHistory = [...attendanceHistory, attendanceRecord];
        
        await participantDoc.ref.update({
            attendanceHistory: updatedAttendanceHistory,
            updatedAt: new Date(),
        });

        revalidatePath('/customers/attendance-history');
        revalidatePath('/profile');

        return {
            success: true,
            message: 'Kehadiran berhasil dicatat',
            data: {
                participantName: participantData.name || participantData.displayName || 'Unknown',
                className: serviceData.name || enrolledClass.name || 'Unknown',
                alreadyAttended: false
            }
        };
    } catch (error) {
        console.error('Error scanning attendance:', error);
        return { success: false, error: error.message || 'Gagal memproses scan QR code' };
    }
}

/**
 * Get attendance records for a service
 */
export async function getServiceAttendance(serviceId) {
    try {
        const user = await getSessionUser();
        if (!user || user.email !== 'admin@mail.com') {
            return { error: 'Unauthorized' };
        }

        const participantsSnapshot = await adminDb.collection('participants').get();
        const attendance = [];

        for (const docSnap of participantsSnapshot.docs) {
            const data = docSnap.data();
            const attendanceHistory = data.attendanceHistory || [];

            for (const record of attendanceHistory) {
                if (record.serviceId === serviceId || record.eventId === serviceId) {
                    attendance.push({
                        id: `${docSnap.id}-${record.serviceId}`,
                        participantId: docSnap.id,
                        participantName: data.name || data.displayName || 'Unknown',
                        participantEmail: data.email || '',
                        status: record.status || 'registered',
                        registeredDate: serializeFirestoreData(record.registeredDate || record.createdAt),
                        attendedDate: record.attendedDate ? serializeFirestoreData(record.attendedDate) : null,
                        scannedBy: record.scannedBy || null,
                    });
                }
            }
        }

        return { attendance: attendance.sort((a, b) => {
            const dateA = a.attendedDate || a.registeredDate || '';
            const dateB = b.attendedDate || b.registeredDate || '';
            return dateB.localeCompare(dateA);
        }) };
    } catch (error) {
        console.error('Error fetching service attendance:', error);
        return { error: error.message };
    }
}



