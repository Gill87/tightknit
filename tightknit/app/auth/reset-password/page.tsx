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

export default function ResetPasswordPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
              required
            />
          </FormField>

          <FormField label="Confirm New Password">
            <Input
              showPasswordToggle
              placeholder="Repeat your new password"
              name="confirmPassword"
              autoComplete="new-password"
              required
            />
          </FormField>

          <Button type="submit">Reset Password</Button>
        </form>

        <p className={footerRow}>
          <Link href="/auth/sign-in" className={footerLink}>Back to sign in</Link>
        </p>
      </div>
    </main>
  )
}
