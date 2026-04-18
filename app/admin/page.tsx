import Link from 'next/link'
import { Image, FolderOpen, Mail, Eye, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { SignedImage } from '@/components/signed-image'

async function getStats() {
  const supabase = await createClient()
  
  const [photosResult, categoriesResult, messagesResult, featuredResult] = await Promise.all([
    supabase.from('photos').select('id', { count: 'exact' }),
    supabase.from('categories').select('id', { count: 'exact' }),
    supabase.from('contact_messages').select('id', { count: 'exact' }).eq('is_read', false),
    supabase.from('photos').select('id', { count: 'exact' }).eq('is_featured', true),
  ])

  return {
    totalPhotos: photosResult.count || 0,
    totalCategories: categoriesResult.count || 0,
    unreadMessages: messagesResult.count || 0,
    featuredPhotos: featuredResult.count || 0,
  }
}

function normalizePhoto(photo: any) {
  if (!photo) return photo

  return {
    ...photo,
    image_url: photo.image_url || photo.url || '',
  }
}

async function getRecentPhotos() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('photos')
    .select('*, category:categories(name)')
    .order('created_at', { ascending: false })
    .limit(5)
  return (data || []).map(normalizePhoto)
}

async function getRecentMessages() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function AdminDashboard() {
  const [stats, recentPhotos, recentMessages] = await Promise.all([
    getStats(),
    getRecentPhotos(),
    getRecentMessages(),
  ])

  return (
    <div className="space-y-8 pt-16 lg:pt-0">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Welcome back to your photography admin panel</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/photos" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Photos</CardTitle>
              <Image className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPhotos}</div>
              <p className="text-xs text-muted-foreground">
                {stats.featuredPhotos} featured
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/categories" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
              <p className="text-xs text-muted-foreground">
                Photo collections
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/messages" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
              <Mail className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unreadMessages}</div>
              <p className="text-xs text-muted-foreground">
                Pending inquiries
              </p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/admin/photos" className="block">
          <Card className="h-full transition-colors hover:bg-muted/40 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Featured</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.featuredPhotos}</div>
              <p className="text-xs text-muted-foreground">
                Highlighted on homepage
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Photos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Photos</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/photos">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPhotos.length === 0 ? (
              <p className="text-muted-foreground text-sm">No photos uploaded yet.</p>
            ) : (
              <div className="space-y-4">
                {recentPhotos.map((photo) => (
                  <div key={photo.id} className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded bg-muted overflow-hidden flex-shrink-0">
                      <SignedImage
                        src={photo.thumbnail_url || photo.image_url}
                        alt={photo.title}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{photo.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {photo.category?.name || 'Uncategorized'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {photo.is_featured && (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                          Featured
                        </span>
                      )}
                      {!photo.is_published && (
                        <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded">
                          Draft
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Messages */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/messages">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentMessages.length === 0 ? (
              <p className="text-muted-foreground text-sm">No messages yet.</p>
            ) : (
              <div className="space-y-4">
                {recentMessages.map((message) => (
                  <div key={message.id} className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-medium">
                        {message.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{message.name}</p>
                        {!message.is_read && (
                          <span className="w-2 h-2 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {message.subject || message.message.slice(0, 50)}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground flex-shrink-0">
                      {new Date(message.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/admin/photos/new">
                <Image className="h-4 w-4 mr-2" />
                Upload Photo
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/categories">
                <FolderOpen className="h-4 w-4 mr-2" />
                Manage Categories
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/admin/categories/new">
                <FolderOpen className="h-4 w-4 mr-2" />
                New Category
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/" target="_blank">
                <Eye className="h-4 w-4 mr-2" />
                View Website
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
