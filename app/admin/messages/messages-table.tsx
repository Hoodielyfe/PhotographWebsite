'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Mail, MoreHorizontal, Trash2, Eye, EyeOff, ExternalLink, Phone, FolderCheck, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Empty } from '@/components/ui/empty'
import type { ContactMessage } from '@/lib/types'
import { cn } from '@/lib/utils'

interface MessagesTableProps {
  messages: ContactMessage[]
}

export function MessagesTable({ messages }: MessagesTableProps) {
  const router = useRouter()
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeFolder, setActiveFolder] = useState<'inbox' | 'contacted'>('inbox')

  const inboxMessages = messages.filter((message) => !message.is_contacted)
  const contactedMessages = messages.filter((message) => message.is_contacted)
  const visibleMessages = activeFolder === 'inbox' ? inboxMessages : contactedMessages

  const handleView = async (message: ContactMessage) => {
    setSelectedMessage(message)
    
    if (!message.is_read) {
      try {
        await fetch(`/api/messages/${message.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ is_read: true }),
        })
        router.refresh()
      } catch (error) {
        console.error('Error marking message as read:', error)
      }
    }
  }

  const toggleRead = async (message: ContactMessage) => {
    try {
      await fetch(`/api/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_read: !message.is_read }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error updating message:', error)
    }
  }

  const toggleContacted = async (message: ContactMessage) => {
    try {
      await fetch(`/api/messages/${message.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_contacted: !message.is_contacted }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error updating contacted status:', error)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/messages/${deleteId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting message:', error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  if (messages.length === 0) {
    return (
      <Empty
        icon={<Mail className="w-12 h-12 text-muted-foreground" />}
        title="No messages yet"
        description="Contact form submissions will appear here"
      />
    )
  }

  const emptyFolderTitle = activeFolder === 'inbox' ? 'Inbox is clear' : 'No contacted messages yet'
  const emptyFolderDescription =
    activeFolder === 'inbox'
      ? 'New contact form submissions will appear here until you move them to Contacted.'
      : 'Messages you mark as contacted will move here for follow-up tracking.'

  return (
    <>
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant={activeFolder === 'inbox' ? 'default' : 'outline'}
          onClick={() => setActiveFolder('inbox')}
          className="gap-2"
        >
          <Inbox className="h-4 w-4" />
          Inbox
          <Badge variant="secondary" className="ml-1">{inboxMessages.length}</Badge>
        </Button>
        <Button
          type="button"
          variant={activeFolder === 'contacted' ? 'default' : 'outline'}
          onClick={() => setActiveFolder('contacted')}
          className="gap-2"
        >
          <FolderCheck className="h-4 w-4" />
          Contacted Folder
          <Badge variant="secondary" className="ml-1">{contactedMessages.length}</Badge>
        </Button>
      </div>

      {visibleMessages.length === 0 ? (
        <Empty
          icon={activeFolder === 'inbox' ? <Inbox className="w-12 h-12 text-muted-foreground" /> : <FolderCheck className="w-12 h-12 text-muted-foreground" />}
          title={emptyFolderTitle}
          description={emptyFolderDescription}
        />
      ) : (
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visibleMessages.map((message) => (
              <TableRow
                key={message.id}
                className={cn(
                  'cursor-pointer',
                  !message.is_read && !message.is_contacted && 'bg-primary/5',
                )}
                onClick={() => handleView(message)}
              >
                <TableCell>
                  {!message.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary block" />
                  )}
                </TableCell>
                <TableCell>
                  <div className={cn('font-medium', !message.is_read && 'font-semibold')}>
                    {message.name}
                  </div>
                  <div className="text-sm text-muted-foreground">{message.email}</div>
                  {message.phone ? (
                    <div className="text-sm text-muted-foreground">{message.phone}</div>
                  ) : null}
                </TableCell>
                <TableCell>
                  <div className={cn(!message.is_read && 'font-medium')}>
                    {message.subject || (
                      <span className="text-muted-foreground">No subject</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground truncate max-w-xs">
                    {message.message.slice(0, 60)}...
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={message.is_contacted ? 'secondary' : 'outline'}>
                    {message.is_contacted ? 'Contacted' : 'Inbox'}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(message.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(message)}>
                        <Eye className="h-4 w-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleRead(message)}>
                        {message.is_read ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Mark as Unread
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Mark as Read
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleContacted(message)}>
                        {message.is_contacted ? (
                          <>
                            <Inbox className="h-4 w-4 mr-2" />
                            Move to Inbox
                          </>
                        ) : (
                          <>
                            <FolderCheck className="h-4 w-4 mr-2" />
                            Move to Contacted
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <a href={`mailto:${message.email}`}>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Reply via Email
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(message.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      )}

      {/* View Message Dialog */}
      <Dialog open={!!selectedMessage} onOpenChange={() => setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject || 'No Subject'}</DialogTitle>
            <DialogDescription>
              From {selectedMessage?.name} ({selectedMessage?.email}) on{' '}
              {selectedMessage && new Date(selectedMessage.created_at).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 rounded-lg border p-4 text-sm sm:grid-cols-2">
            <div>
              <p className="text-muted-foreground">Email</p>
              <p className="font-medium">{selectedMessage?.email}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Phone</p>
              <p className="font-medium">{selectedMessage?.phone || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Folder</p>
              <p className="font-medium">{selectedMessage?.is_contacted ? 'Contacted' : 'Inbox'}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Read Status</p>
              <p className="font-medium">{selectedMessage?.is_read ? 'Read' : 'Unread'}</p>
            </div>
          </div>
          <div className="mt-4">
            <p className="whitespace-pre-wrap text-sm">{selectedMessage?.message}</p>
          </div>
          <div className="mt-6 flex gap-3">
            <Button asChild>
              <a href={`mailto:${selectedMessage?.email}`}>
                <Mail className="h-4 w-4 mr-2" />
                Reply
              </a>
            </Button>
            {selectedMessage?.phone ? (
              <Button variant="outline" asChild>
                <a href={`tel:${selectedMessage.phone}`}>
                  <Phone className="h-4 w-4 mr-2" />
                  Call
                </a>
              </Button>
            ) : null}
            <Button
              variant="outline"
              onClick={() => {
                if (!selectedMessage) return
                void toggleContacted(selectedMessage)
                setSelectedMessage((current) =>
                  current
                    ? {
                        ...current,
                        is_contacted: !current.is_contacted,
                      }
                    : current,
                )
              }}
            >
              {selectedMessage?.is_contacted ? 'Move to Inbox' : 'Move to Contacted'}
            </Button>
            <Button variant="outline" onClick={() => setSelectedMessage(null)}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
