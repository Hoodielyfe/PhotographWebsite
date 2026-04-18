'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HardDrive, Images } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Spinner } from '@/components/ui/spinner'
import { createClient } from '@/lib/supabase/client'

type StorageUsageStats = {
  totalFiles: number
  usedLabel: string
  usedOutOfLabel: string | null
  limitLabel: string | null
  remainingLabel: string | null
  usagePercent: number | null
}

type BackfillResult = {
  processed: number
  generated: number
  failed: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [storageStats, setStorageStats] = useState<StorageUsageStats | null>(null)
  const [storageError, setStorageError] = useState<string | null>(null)
  const [isLoadingStorage, setIsLoadingStorage] = useState(true)
  const [isBackfilling, setIsBackfilling] = useState(false)
  const [backfillError, setBackfillError] = useState<string | null>(null)
  const [backfillResult, setBackfillResult] = useState<BackfillResult | null>(null)
  
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    let canceled = false

    async function loadStorageUsage() {
      setIsLoadingStorage(true)
      setStorageError(null)

      try {
        const response = await fetch('/api/admin/storage-usage', {
          cache: 'no-store',
        })
        const data = await response.json()

        if (!response.ok) {
          throw new Error(data.error || 'Failed to load storage usage')
        }

        if (!canceled) {
          setStorageStats(data)
        }
      } catch (error) {
        if (!canceled) {
          setStorageError(error instanceof Error ? error.message : 'Failed to load storage usage')
        }
      } finally {
        if (!canceled) {
          setIsLoadingStorage(false)
        }
      }
    }

    void loadStorageUsage()

    return () => {
      canceled = true
    }
  }, [])

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)
    setPasswordError(null)
    setPasswordSuccess(false)

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      setIsChangingPassword(false)
      return
    }

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      setIsChangingPassword(false)
      return
    }

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      })

      if (error) throw error

      setPasswordSuccess(true)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Failed to change password')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const handleBackfillDerivatives = async () => {
    setIsBackfilling(true)
    setBackfillError(null)
    setBackfillResult(null)

    try {
      const response = await fetch('/api/admin/photo-delivery/backfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to backfill derivatives')
      }

      setBackfillResult(data)
      router.refresh()
    } catch (error) {
      setBackfillError(error instanceof Error ? error.message : 'Failed to backfill derivatives')
    } finally {
      setIsBackfilling(false)
    }
  }

  return (
    <div className="space-y-6 pt-16 lg:pt-0 max-w-2xl">
      <div>
        <h1 className="text-3xl font-serif font-semibold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5 text-muted-foreground" />
            Storage Usage
          </CardTitle>
          <CardDescription>Track how much photo storage your site is currently using</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingStorage ? (
            <div className="flex items-center text-sm text-muted-foreground">
              <Spinner className="mr-2" />
              Loading storage usage...
            </div>
          ) : storageError ? (
            <p className="text-sm text-destructive">{storageError}</p>
          ) : storageStats ? (
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold">
                  {storageStats.limitLabel ? `${storageStats.usedLabel} / ${storageStats.limitLabel}` : storageStats.usedLabel}
                </p>
                <p className="text-sm text-muted-foreground">
                  {storageStats.usedOutOfLabel
                    ? `${storageStats.usedOutOfLabel}. ${storageStats.remainingLabel} remaining.`
                    : `${storageStats.totalFiles} files in storage`}
                </p>
              </div>
              {storageStats.usagePercent !== null ? (
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary transition-[width]"
                    style={{ width: `${storageStats.usagePercent}%` }}
                    aria-label={storageStats.usedOutOfLabel || 'Storage usage'}
                  />
                </div>
              ) : null}
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Images className="h-5 w-5 text-muted-foreground" />
            Photo Delivery Cache
          </CardTitle>
          <CardDescription>
            Generate crisp public derivatives for published photos ahead of time so visitors do not pay the first-load cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Published photos use optimized public WebP versions for portfolio display.</p>
            <p>Original uploads stay private. This action warms the public derivative cache for your existing published library.</p>
          </div>

          <Button type="button" onClick={handleBackfillDerivatives} disabled={isBackfilling}>
            {isBackfilling ? (
              <>
                <Spinner className="mr-2" />
                Backfilling...
              </>
            ) : (
              'Backfill Published Photo Derivatives'
            )}
          </Button>

          {backfillError ? <p className="text-sm text-destructive">{backfillError}</p> : null}
          {backfillResult ? (
            <p className="text-sm text-muted-foreground">
              Processed {backfillResult.processed} published photos. Generated {backfillResult.generated} new derivative sets.
              {backfillResult.failed > 0 ? ` ${backfillResult.failed} failed.` : ' No failures.'}
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="new-password">New Password</FieldLabel>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="confirm-password">Confirm New Password</FieldLabel>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </Field>
            </FieldGroup>

            {passwordError && (
              <p className="text-sm text-destructive">{passwordError}</p>
            )}
            {passwordSuccess && (
              <p className="text-sm text-green-600">Password changed successfully!</p>
            )}

            <Button type="submit" disabled={isChangingPassword}>
              {isChangingPassword ? (
                <>
                  <Spinner className="mr-2" />
                  Changing...
                </>
              ) : (
                'Change Password'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>Irreversible actions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sign Out</p>
              <p className="text-sm text-muted-foreground">Sign out of your account</p>
            </div>
            <Button variant="destructive" onClick={handleSignOut}>
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
