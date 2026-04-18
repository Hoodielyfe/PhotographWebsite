import { NextResponse } from 'next/server'
import { backfillPublishedPhotoDelivery } from '@/lib/photo-delivery'
import { requireAdminUser } from '@/lib/server-auth'

export async function POST() {
  try {
    const user = await requireAdminUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await backfillPublishedPhotoDelivery()
    return NextResponse.json(result)
  } catch (error) {
    console.error('Photo delivery backfill API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}