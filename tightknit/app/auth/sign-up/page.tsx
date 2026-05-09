'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase/client'
import FormField from '../components/FormField'
import Input from '../components/Input'
import Button from '../components/Button'
import {
  signUpPage,
  pageInner,
  headerSection,
  logoRow,
  appTitle,
  tagline,
  formRoot,
  footerRow,
  footerLink,
  errorBanner,
} from '../components/formStyles'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    const { error: signUpError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        data: { name, username, phone },
      },
    })

    setIsLoading(false)

    if (signUpError) {
      setError(signUpError.message)
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className={signUpPage}>
        <div className={pageInner}>
          <div className={logoRow}>
            <span>🧵</span>
            <h1 className={appTitle}>Tightknit</h1>
          </div>
          <p className={tagline}>Check your email to confirm your account.</p>
        </div>
      </div>
    )
  }

  return (
    <main className={signUpPage}>
      <div className={pageInner}>
        <header className={headerSection}>
          <div className={logoRow}>
            <span>🧵</span>
            <h1 className={appTitle}>Tightknit</h1>
          </div>
          <p className={tagline}>Trade hours with your neighbors,<br />not money.</p>
        </header>

        <form className={formRoot} onSubmit={handleSubmit}>
          <FormField label="Your name">
            <Input
              placeholder="Alex Rivera"
              name="name"
              autoComplete="name"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Username">
            <Input
              placeholder="@alexrivera"
              name="username"
              autoComplete="username"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
          </FormField>

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
              placeholder="At least 8 characters"
              name="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </FormField>

          <FormField
            label="Phone number"
            helperPrefix="For neighbor verification only. Never shared "
            helperLinkText="publicly."
          >
            <Input
              type="tel"
              placeholder="+1 (555) 000-0000"
              name="phone"
              autoComplete="tel"
              value={phone}
              onChange={e => setPhone(e.target.value)}
            />
          </FormField>

          {error && <p className={errorBanner}>{error}</p>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating account…' : 'Create account'}
          </Button>
        </form>

        <p className={footerRow}>
          Already have an account?{' '}
          <Link href="/auth/sign-in" className={footerLink}>
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
