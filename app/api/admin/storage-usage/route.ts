import { NextResponse } from 'next/server'
import { getStorageUsageStats } from '@/lib/storage-usage'
import { requireAdminUser } from '@/lib/server-auth'

export async function GET() {
  try {
    const user = await requireAdminUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stats = await getStorageUsageStats()
    return NextResponse.json(stats, {
      headers: {
        'Cache-Control': 'private, max-age=60, stale-while-revalidate=120',
      },
    })
  } catch (error) {
    console.error('Storage usage API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 },
    )
  }
}