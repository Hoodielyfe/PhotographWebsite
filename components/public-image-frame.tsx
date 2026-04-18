'use client'

import type { DragEvent, MouseEvent, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface PublicImageFrameProps {
  children: ReactNode
  className?: string
  shieldClassName?: string
}

function blockImageInteraction(event: MouseEvent<HTMLElement> | DragEvent<HTMLElement>) {
  event.preventDefault()
}

export function PublicImageFrame({ children, className, shieldClassName }: PublicImageFrameProps) {
  return (
    <div
      className={cn('relative overflow-hidden select-none', className)}
      onContextMenu={blockImageInteraction}
      onDragStart={blockImageInteraction}
      style={{ WebkitTouchCallout: 'none', WebkitUserSelect: 'none', userSelect: 'none' }}
    >
      <div className="pointer-events-none relative h-full w-full">{children}</div>
      <div
        aria-hidden="true"
        className={cn('absolute inset-0 z-10 cursor-default bg-transparent', shieldClassName)}
        onContextMenu={blockImageInteraction}
        onDragStart={blockImageInteraction}
      />
    </div>
  )
}