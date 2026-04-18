import { createServiceClient } from '@/lib/supabase/service'
import { MessagesTable } from './messages-table'
import type { ContactMessage } from '@/lib/types'
import { requireAdminPageUser } from '@/lib/server-auth'

async function getMessages(): Promise<ContactMessage[]> {
  await requireAdminPageUser()

  const adminSupabase = createServiceClient()
  const { data, error } = await adminSupabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching contact messages:', error)
    throw new Error('Failed to load contact messages')
  }

  return data || []
}

export default async function MessagesPage() {
  const messages = await getMessages()

  return (
    <div className="space-y-6 pt-16 lg:pt-0">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Messages</h1>
        <p className="text-muted-foreground mt-1">Contact form submissions from visitors</p>
      </div>

      <MessagesTable messages={messages} />
    </div>
  )
}
