'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '@/lib/utils'

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        'group peer relative inline-flex h-8 w-16 shrink-0 items-center rounded-full border border-border/60 bg-muted px-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary/15 data-[state=checked]:text-primary',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-0 transition-opacity duration-200 group-data-[state=checked]:opacity-100"
      >
        On
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 opacity-100 transition-opacity duration-200 group-data-[state=checked]:opacity-0"
      >
        Off
      </span>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none absolute left-1 top-1/2 block size-6 -translate-y-1/2 rounded-full bg-background shadow-sm ring-0 transition-transform duration-200 ease-out group-data-[state=checked]:translate-x-8 group-data-[state=unchecked]:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
