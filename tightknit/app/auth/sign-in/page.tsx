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
  forgotPassword,
} from '@/app/auth/formStyles'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: signInError } = await getSupabase().auth.signInWithPassword({ email, password })

    setIsLoading(false)

    if (signInError) {
      setError('Invalid credentials.')
    } else {
      router.push('/home')
    }
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
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Password">
            <Input
              showPasswordToggle
              placeholder="Your password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FormField>

          <p className={forgotPassword}>Forgot password?</p>

          {error && <p className={errorBanner}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging in…' : 'Log in'}
          </Button>
        </form>

        <p className={footerRow}>
          New to Tightknit?{' '}
          <Link href="/auth/sign-up" className={footerLink}>Sign up</Link>
        </p>
      </div>
    </main>
  )
}
