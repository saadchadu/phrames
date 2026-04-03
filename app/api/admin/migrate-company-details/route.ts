import { NextRequest, NextResponse } from 'next/server'
import { adminDb, adminAuth } from '@/lib/firebase-admin'
import { COMPANY_DETAILS } from '@/lib/invoice'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const db = adminDb

export async function POST(request: NextRequest) {
    try {
        // Verify admin auth
        const authHeader = request.headers.get('authorization')
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const token = authHeader.split('Bearer ')[1]
        const decoded = await adminAuth.verifyIdToken(token)
        if (!decoded.isAdmin) {
            return NextResponse.json({ error: 'Forbidden – admin only' }, { status: 403 })
        }

        // Fetch all payment records
        const paymentsSnap = await db.collection('payments').get()

        if (paymentsSnap.empty) {
            return NextResponse.json({ updated: 0, message: 'No payment records found.' })
        }

        // Batch-write in groups of 500 (Firestore batch limit)
        const BATCH_SIZE = 500
        let updated = 0
        let batchDocs = paymentsSnap.docs

        while (batchDocs.length > 0) {
            const chunk = batchDocs.splice(0, BATCH_SIZE)
            const batch = db.batch()

            chunk.forEach((doc) => {
                const data = doc.data()
                const correctAmount = data.baseAmount || data.amount || 0
                batch.update(doc.ref, {
                    companyDetails: COMPANY_DETAILS,
                    totalAmount: correctAmount,
                    baseAmount: correctAmount,
                })
                updated++
            })

            await batch.commit()
        }

        return NextResponse.json({
            success: true,
            updated,
            companyDetails: COMPANY_DETAILS,
            message: `Successfully updated companyDetails on ${updated} payment records.`,
        })
    } catch (error: any) {
        console.error('Migration error:', error)
        return NextResponse.json({ error: 'Migration failed' }, { status: 500 })
    }
}
