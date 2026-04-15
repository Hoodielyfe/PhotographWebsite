'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Camera, Image, FolderOpen, Mail, Settings, LogOut, Menu, X, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import type { User } from '@supabase/supabase-js'

const navItems = [
  { href: '/admin', label: 'Dashboard', icon: Home },
  { href: '/admin/photos', label: 'Photos', icon: Image },
  { href: '/admin/categories', label: 'Categories', icon: FolderOpen },
  { href: '/admin/messages', label: 'Messages', icon: Mail },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

interface AdminSidebarProps {
  user: User
}

export function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-background border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2 font-serif text-lg font-semibold">
          <Camera className="h-5 w-5" />
          <span>Studio Admin</span>
        </Link>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-200 lg:translate-x-0',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="p-6 border-b border-border hidden lg:block">
          <Link href="/admin" className="flex items-center gap-2 font-serif text-xl font-semibold">
            <Camera className="h-6 w-6" />
            <span>Studio Admin</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 pt-20 lg:pt-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href))
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
              {user.email?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.email}</p>
            </div>
          </div>
          <div className="space-y-1">
            <Link
              href="/"
              className="flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <Home className="h-4 w-4" />
              View Website
            </Link>
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
