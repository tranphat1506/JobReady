'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import AuthHeader from '@/components/layout/AuthHeader'

export default function LoginPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setErrorMsg(error.message)
      setIsLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  const handleOAuthLogin = async (provider: 'google' | 'github' | 'linkedin_oidc') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <AuthHeader />

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-sm">

          <div className="mb-8">
            <h1 className="text-3xl font-sans text-zinc-900 tracking-tight mb-2">
              {t('auth.loginTitle')}
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              {t('auth.loginSubtitle')}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                {t('auth.email')}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-3 py-2 border border-zinc-300 rounded-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm placeholder:text-zinc-400"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                  {t('auth.password')}
                </label>
                <Link href="#" className="text-xs text-zinc-500 hover:text-zinc-900 underline underline-offset-2 transition-colors">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-3 py-2 border border-zinc-300 rounded-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm placeholder:text-zinc-400"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-2.5 rounded-sm text-sm font-bold tracking-wide hover:bg-emerald-700 transition-colors disabled:opacity-70 flex justify-center items-center h-10"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                t('auth.loginButton')
              )}
            </button>
          </form>

          <div className="mt-8 relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-200"></div>
            </div>
            <span className="relative px-4 bg-white text-xs text-zinc-500 font-medium tracking-wide">
              {t('auth.orLoginWith')}
            </span>
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => handleOAuthLogin('google')}
              className="flex items-center justify-center gap-3 w-full py-2 bg-white border border-zinc-300 rounded-sm hover:bg-zinc-50 transition-colors text-sm font-medium text-zinc-700 h-10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('linkedin_oidc')}
              className="flex items-center justify-center gap-3 w-full py-2 bg-[#0A66C2] text-white rounded-sm hover:bg-[#004182] transition-colors text-sm font-medium h-10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
              LinkedIn
            </button>

            <button
              type="button"
              onClick={() => handleOAuthLogin('github')}
              className="flex items-center justify-center gap-3 w-full py-2 bg-zinc-900 text-white rounded-sm hover:bg-black transition-colors text-sm font-medium h-10"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              GitHub
            </button>
          </div>

          <div className="mt-10 text-center">
            <span className="text-sm text-zinc-500 mr-2">{t('auth.noAccount')}</span>
            <Link href="/register" className="text-sm font-bold text-zinc-900 hover:underline underline-offset-2">
              {t('auth.register')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
