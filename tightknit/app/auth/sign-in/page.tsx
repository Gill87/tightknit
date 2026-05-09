import Link from 'next/link'
import { signUpPage, pageInner, logoRow, appTitle, tagline, footerRow, footerLink } from '@/app/auth/formStyles'

export default function SignInPage() {
  return (
    <main className={signUpPage}>
      <div className={pageInner}>
        <div className={logoRow}>
          <span>🧵</span>
          <h1 className={appTitle}>Tightknit</h1>
        </div>
        <p className={tagline}>Sign in coming soon.</p>
        <p className={footerRow}>
          <Link href="/auth/sign-up" className={footerLink}>Create an account</Link>
        </p>
      </div>
    </main>
  )
}
