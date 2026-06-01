'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { useTranslation } from '@/hooks/useTranslation'
import AuthHeader from '@/components/layout/AuthHeader'

export default function RegisterPage() {
  const router = useRouter()
  const { t } = useTranslation()
  const [isLoading, setIsLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const supabase = createClient()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMsg('')
    setSuccessMsg('')

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    })

    if (error) {
      setErrorMsg(error.message)
    } else {
      setSuccessMsg('Đăng ký thành công! Vui lòng kiểm tra email để kích hoạt tài khoản.')
      // Optional: auto redirect or wait for user to check email
    }
    setIsLoading(false)
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
              {t('auth.registerTitle')}
            </h1>
            <p className="text-sm text-zinc-500 font-medium">
              {t('auth.registerSubtitle')}
            </p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm border border-red-200">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="mb-6 p-3 bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
              {successMsg}
            </div>
          )}

          <form onSubmit={handleEmailRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                {t('auth.fullName')}
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={t('auth.fullNamePlaceholder')}
                className="w-full px-3 py-2 border border-zinc-300 rounded-sm focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all text-sm placeholder:text-zinc-400"
              />
            </div>

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
              <label className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                {t('auth.password')}
              </label>
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
              disabled={isLoading || !!successMsg}
              className="w-full bg-primary text-white py-2.5 rounded-sm text-sm font-bold tracking-wide hover:bg-emerald-700 transition-colors disabled:opacity-70 flex justify-center items-center h-10"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                t('auth.registerButton')
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
          </div>

          <div className="mt-10 text-center">
            <span className="text-sm text-zinc-500 mr-2">{t('auth.hasAccount')}</span>
            <Link href="/login" className="text-sm font-bold text-zinc-900 hover:underline underline-offset-2">
              {t('auth.loginNow')}
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
