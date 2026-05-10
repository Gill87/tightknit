'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase/client'
import FormField from '@/app/auth/components/FormField'
import Input from '@/app/auth/components/Input'
import Button from '@/app/auth/components/Button'
import {
  signUpPage,
  signUpPageCentered,
  pageInner,
  pageInnerCentered,
  formRoot,
  footerRow,
  footerLink,
  errorBanner,
  signInHeading,
  signInSubtitle,
  successPanel,
  successPanelTitle,
  successPanelBody,
  successPanelEmail,
} from '@/app/auth/formStyles'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: resetError } = await getSupabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    })

    setIsLoading(false)

    if (resetError) {
      setError(resetError.message)
    } else {
      setSent(true)
    }
  }

  if (sent) {
    return (
      <main className={signUpPageCentered}>
        <div className={pageInnerCentered}>
          <div className={successPanel}>
            <span aria-hidden>✉️</span>
            <p className={successPanelTitle}>Reset link sent!</p>
            <p className={successPanelBody}>
              We've sent a password reset link to{' '}
              <span className={successPanelEmail}>{email}</span>
            </p>
            <p className={successPanelBody}>Check your inbox.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={signUpPage}>
      <div className={pageInner}>
        <h1 className={signInHeading}>Forgot password?</h1>
        <p className={signInSubtitle}>
          Enter your email and we'll send you a reset link.
        </p>

        <form className={formRoot} onSubmit={handleSubmit}>
          <FormField label="Email">
            <Input
              type="email"
              placeholder="alex@email.com"
              name="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </FormField>

          {error && <p className={errorBanner}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Sending…' : 'Reset Password'}
          </Button>
        </form>

        <p className={footerRow}>
          Remember your password?{' '}
          <Link href="/auth/sign-in" className={footerLink}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
