'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import FormField from '@/app/auth/components/FormField'
import Input from '@/app/auth/components/Input'
import Button from '@/app/auth/components/Button'
import {
  signUpPage,
  pageInner,
  formRoot,
  footerRow,
  footerLink,
  errorBanner,
  signInHeading,
  signInSubtitle,
} from '@/app/auth/formStyles'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setIsLoading(true)

    const { error: updateError } = await getSupabase().auth.updateUser({ password })

    setIsLoading(false)

    if (updateError) {
      setError(updateError.message)
    } else {
      router.push('/home')
    }
  }

  return (
    <main className={signUpPage}>
      <div className={pageInner}>
        <h1 className={signInHeading}>Reset password</h1>
        <p className={signInSubtitle}>Choose a strong new password.</p>

        <form className={formRoot} onSubmit={handleSubmit}>
          <FormField label="New Password">
            <Input
              showPasswordToggle
              placeholder="At least 8 characters"
              name="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Confirm New Password">
            <Input
              showPasswordToggle
              placeholder="Repeat your new password"
              name="confirmPassword"
              autoComplete="new-password"
              minLength={8}
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
            />
          </FormField>

          {error && <p className={errorBanner}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Updating…' : 'Reset Password'}
          </Button>
        </form>

        <p className={footerRow}>
          <Link href="/auth/sign-in" className={footerLink}>Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}
