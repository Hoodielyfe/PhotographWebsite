'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Pencil, Trash2, Star, Eye, EyeOff } from 'lucide-react'
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
import type { Photo, Category } from '@/lib/types'
import { cn } from '@/lib/utils'

interface PhotosTableProps {
  photos: Photo[]
  categories: Category[]
}

export function PhotosTable({ photos, categories }: PhotosTableProps) {
  const router = useRouter()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deleteId) return
    setIsDeleting(true)
    
    try {
      const response = await fetch(`/api/photos/${deleteId}`, {
        method: 'DELETE',
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error('Error deleting photo:', error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const toggleFeatured = async (photo: Photo) => {
    try {
      await fetch(`/api/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_featured: !photo.is_featured }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error updating photo:', error)
    }
  }

  const togglePublished = async (photo: Photo) => {
    try {
      await fetch(`/api/photos/${photo.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_published: !photo.is_published }),
      })
      router.refresh()
    } catch (error) {
      console.error('Error updating photo:', error)
    }
  }

  if (photos.length === 0) {
    return (
      <Empty
        icon={<div className="w-12 h-12 rounded-lg bg-muted" />}
        title="No photos yet"
        description="Upload your first photo to get started"
        action={
          <Button asChild>
            <Link href="/admin/photos/new">Add Photo</Link>
          </Button>
        }
      />
    )
  }

  return (
    <>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {photos.map((photo) => (
              <TableRow key={photo.id}>
                <TableCell>
                  <div className="w-12 h-12 rounded bg-muted overflow-hidden">
                    <Image
                      src={photo.thumbnail_url || photo.image_url}
                      alt={photo.title}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{photo.title}</div>
                  {photo.description && (
                    <div className="text-sm text-muted-foreground truncate max-w-xs">
                      {photo.description}
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  {photo.category?.name || (
                    <span className="text-muted-foreground">Uncategorized</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {photo.is_featured && (
                      <Badge variant="default" className="gap-1">
                        <Star className="h-3 w-3" />
                        Featured
                      </Badge>
                    )}
                    <Badge variant={photo.is_published ? 'secondary' : 'outline'}>
                      {photo.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/photos/${photo.id}`}>
                          <Pencil className="h-4 w-4 mr-2" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => toggleFeatured(photo)}>
                        <Star className={cn('h-4 w-4 mr-2', photo.is_featured && 'fill-current')} />
                        {photo.is_featured ? 'Remove Featured' : 'Mark Featured'}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => togglePublished(photo)}>
                        {photo.is_published ? (
                          <>
                            <EyeOff className="h-4 w-4 mr-2" />
                            Unpublish
                          </>
                        ) : (
                          <>
                            <Eye className="h-4 w-4 mr-2" />
                            Publish
                          </>
                        )}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => setDeleteId(photo.id)}
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

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be undone.
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
