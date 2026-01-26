import { NextResponse } from 'next/server'
import { createSession } from '@/actions/auth'

export async function POST(request) {
    try {
        const { idToken } = await request.json()

        if (!idToken) {
            return NextResponse.json(
                { success: false, error: 'idToken is required' },
                { status: 400 }
            )
        }

        const result = await createSession(idToken)

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Error refreshing session:', error)
        return NextResponse.json(
            { success: false, error: error.message || 'Internal server error' },
            { status: 500 }
        )
    }
}






