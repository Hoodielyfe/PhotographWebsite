import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'

function isMissingContactTrackingColumn(error: { message?: string; details?: string; hint?: string } | null) {
  const errorText = [error?.message, error?.details, error?.hint].filter(Boolean).join(' ')
  return /phone|is_contacted|contacted_at|schema cache/i.test(errorText)
}

const contactMessageSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  phone: z
    .string()
    .trim()
    .min(7)
    .max(30)
    .regex(/^[0-9+().\-\s]+$/, 'Please provide a valid phone number'),
  subject: z.string().trim().max(200).optional().or(z.literal('')),
  message: z.string().trim().min(1).max(5000),
})

function hasTrustedOrigin(request: NextRequest) {
  const origin = request.headers.get('origin')

  if (!origin) {
    return true
  }

  try {
    const originUrl = new URL(origin)
    return originUrl.host === request.nextUrl.host && originUrl.protocol === request.nextUrl.protocol
  } catch {
    return false
  }
}

export async function GET() {
  return NextResponse.json({
    ok: true,
    route: '/api/contact',
    method: 'POST',
    message: 'This endpoint accepts POST requests from the contact form.',
  })
}

export async function POST(request: NextRequest) {
  try {
    if (!hasTrustedOrigin(request)) {
      return NextResponse.json({ error: 'Untrusted request origin' }, { status: 403 })
    }

    if (!request.headers.get('content-type')?.includes('application/json')) {
      return NextResponse.json(
        { error: 'Content-Type must be application/json' },
        { status: 415 },
      )
    }

    const parsedBody = contactMessageSchema.safeParse(await request.json())

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Please provide a valid name, email, phone number, subject, and message.' },
        { status: 400 },
      )
    }

    const { name, email, phone, subject, message } = parsedBody.data

    const supabase = createServiceClient()

    const { error } = await supabase
      .from('contact_messages')
      .insert({
        name,
        email,
        phone,
        subject: subject || null,
        message,
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving contact message:', error)

      if (isMissingContactTrackingColumn(error)) {
        return NextResponse.json(
          {
            error:
              'Your database is missing the new contact tracking columns. Run supabase-local/002_contact_message_tracking.sql in Supabase SQL Editor, then try again.',
          },
          { status: 500 },
        )
      }

      return NextResponse.json(
        { error: error.message || 'Failed to save message' },
        { status: 500 }
      )
    }

    revalidatePath('/admin/messages')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Contact API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
