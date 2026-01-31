'use server'

import { adminDb } from '@/lib/firebase/admin'

export async function getRecentParticipants(limit = 10) {
    try {
        if (!adminDb) return []

        const snapshot = await adminDb
            .collection('participants')
            .orderBy('createdAt', 'desc')
            .limit(limit)
            .get()

        const participants = []
        snapshot.forEach(doc => {
            const data = doc.data()
            participants.push({
                id: doc.id,
                name: data.name || data.displayName || 'User',
                email: data.email || '',
                phone: data.phoneNumber || data.phone || '-',
                enrolledClasses: (data.enrolledClasses || []).length,
                createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt,
                photoURL: data.photoURL || data.avatar || '/images/avatar/1.png'
            })
        })

        return participants
    } catch (error) {
        console.error('Error fetching recent participants:', error)
        return []
    }
}

export async function getPaymentStats() {
    try {
        if (!adminDb) return {
            awaiting: 0,
            completed: 0,
            rejected: 0,
            revenue: 0,
            monthlyData: []
        }

        const invoicesSnapshot = await adminDb.collection('invoices').get()
        
        let awaiting = 0
        let completed = 0
        let rejected = 0
        let totalRevenue = 0
        const monthlyStats = {}

        invoicesSnapshot.forEach(doc => {
            const data = doc.data()
            const amount = parseFloat(data.grandTotal) || 0

            // Count by status
            if (data.status === 'pending' || data.status === 'unpaid') {
                awaiting++
            } else if (data.status === 'paid' || data.paymentStatus === 'settlement') {
                completed++
                totalRevenue += amount
            } else if (data.status === 'cancelled' || data.status === 'failed') {
                rejected++
            }

            // Group by month for chart
            if (data.createdAt) {
                const date = data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt)
                const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                
                if (!monthlyStats[monthKey]) {
                    monthlyStats[monthKey] = { completed: 0, pending: 0, failed: 0 }
                }

                if (data.status === 'paid') monthlyStats[monthKey].completed++
                else if (data.status === 'pending') monthlyStats[monthKey].pending++
                else if (data.status === 'cancelled' || data.status === 'failed') monthlyStats[monthKey].failed++
            }
        })

        // Convert monthly stats to array format for chart
        const monthlyData = Object.entries(monthlyStats)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-6) // Last 6 months
            .map(([month, stats]) => ({
                month,
                ...stats
            }))

        return {
            awaiting,
            completed,
            rejected,
            revenue: totalRevenue,
            monthlyData
        }
    } catch (error) {
        console.error('Error fetching payment stats:', error)
        return {
            awaiting: 0,
            completed: 0,
            rejected: 0,
            revenue: 0,
            monthlyData: []
        }
    }
}
