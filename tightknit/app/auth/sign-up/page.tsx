'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getSupabase } from '@/lib/supabase/client'
import FormField from '@/app/auth/components/FormField'
import Input from '@/app/auth/components/Input'
import Button from '@/app/auth/components/Button'
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
} from '@/app/auth/formStyles'

export default function SignUpPage() {
  const [name, setName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // #region agent log
  const _submitCallCount = { n: 0 }
  // #endregion

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // #region agent log
    _submitCallCount.n++
    fetch('http://127.0.0.1:7374/ingest/e055fc60-e903-4835-a5fe-06f9d070f299',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'60d608'},body:JSON.stringify({sessionId:'60d608',hypothesisId:'H-A H-E',location:'sign-up/page.tsx:handleSubmit',message:'handleSubmit invoked',data:{callN:_submitCallCount.n,isLoadingAtEntry:isLoading,email},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    setError(null)
    setIsLoading(true)

    // #region agent log
    fetch('http://127.0.0.1:7374/ingest/e055fc60-e903-4835-a5fe-06f9d070f299',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'60d608'},body:JSON.stringify({sessionId:'60d608',hypothesisId:'H-A H-B',location:'sign-up/page.tsx:before-signUp',message:'About to call supabase.auth.signUp',data:{callN:_submitCallCount.n,email},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
    const { error: signUpError } = await getSupabase().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/onboarding/location`,
        data: { name, username, phone },
      },
    })

    // #region agent log
    fetch('http://127.0.0.1:7374/ingest/e055fc60-e903-4835-a5fe-06f9d070f299',{method:'POST',headers:{'Content-Type':'application/json','X-Debug-Session-Id':'60d608'},body:JSON.stringify({sessionId:'60d608',hypothesisId:'H-A H-C',location:'sign-up/page.tsx:after-signUp',message:'supabase.auth.signUp returned',data:{callN:_submitCallCount.n,hasError:!!signUpError,errorMsg:signUpError?.message},timestamp:Date.now()})}).catch(()=>{})
    // #endregion
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
