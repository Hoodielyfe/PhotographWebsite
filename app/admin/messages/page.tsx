import { createClient } from '@/lib/supabase/server'
import { MessagesTable } from './messages-table'
import type { ContactMessage } from '@/lib/types'

async function getMessages(): Promise<ContactMessage[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
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
