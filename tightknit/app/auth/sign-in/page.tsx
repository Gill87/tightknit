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
  forgotPassword,
} from '@/app/auth/formStyles'

export default function SignInPage() {
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
  }

  return (
    <main className={signUpPage}>
      <div className={pageInner}>
        <h1 className={signInHeading}>Welcome back.</h1>
        <p className={signInSubtitle}>Good to see you again.</p>

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

          <FormField label="Password">
            <Input
              showPasswordToggle
              placeholder="Your password"
              name="password"
              autoComplete="current-password"
              required
            />
          </FormField>

          <p className={forgotPassword}>Forgot password?</p>

          <Button type="submit">Log in</Button>
        </form>

        <p className={footerRow}>
          New to Tightknit?{' '}
          <Link href="/auth/sign-up" className={footerLink}>Sign up</Link>
        </p>
      </div>
    </main>
  )
}
