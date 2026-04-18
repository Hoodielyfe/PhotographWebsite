import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { requireAdminUser } from '@/lib/server-auth'

function isMissingContactTrackingColumn(error: { message?: string; details?: string; hint?: string } | null) {
  const errorText = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ')
  return /is_contacted|contacted_at|schema cache/i.test(errorText)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAdminUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const updatePayload: Record<string, unknown> = {}

    if (typeof body.is_read === 'boolean') {
      updatePayload.is_read = body.is_read
    }

    if (typeof body.is_contacted === 'boolean') {
      updatePayload.is_contacted = body.is_contacted
      updatePayload.contacted_at = body.is_contacted ? new Date().toISOString() : null
    }

    if (Object.keys(updatePayload).length === 0) {
      return NextResponse.json({ error: 'No valid message updates provided' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data, error } = await supabase
      .from('contact_messages')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating message:', error)

      if (isMissingContactTrackingColumn(error)) {
        return NextResponse.json(
          {
            error:
              'Your database is missing the contacted-folder columns. Run supabase-local/002_contact_message_tracking.sql in Supabase SQL Editor, then try again.',
          },
          { status: 500 },
        )
      }

      return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Message PATCH API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await requireAdminUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('contact_messages')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting message:', error)
      return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message DELETE API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
