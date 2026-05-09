'use client'

import Link from 'next/link'
import FormField from '@/app/auth/components/FormField'
import Input from '@/app/auth/components/Input'
import Button from '@/app/auth/components/Button'
import {
  signUpPage,
  pageInner,
  formRoot,
  footerRow,
  footerLink,
  signInHeading,
  signInSubtitle,
} from '@/app/auth/formStyles'

export default function ForgotPasswordPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
              required
            />
          </FormField>

          <Button type="submit">Reset Password</Button>
        </form>

        <p className={footerRow}>
          Remember your password?{' '}
          <Link href="/auth/sign-in" className={footerLink}>Sign in</Link>
        </p>
      </div>
    </main>
  )
}
