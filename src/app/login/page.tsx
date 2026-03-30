'use client'

/**
 * /login — Silexar Pulse Authentication Page
 *
 * Auth flow:
 *  1. User submits email + password
 *  2. useAuth().login() calls POST /api/auth/login (real API)
 *  3. JWT stored as httpOnly cookie by the server
 *  4. Redirect based on user role returned by the API
 */

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  NeuromorphicCard,
  NeuromorphicButton,
} from '@/components/ui/neuromorphic'
import {
  Zap, Mail, Lock, Eye, EyeOff, Smartphone, AlertTriangle,
  ArrowRight, Loader, CheckCircle, Building, User,
} from 'lucide-react'
import { useAuth } from '@/components/security-initializer'

// ─── Role → route mapping ─────────────────────────────────────

function getRedirectForRole(category: string): string {
  const cat = category?.toLowerCase() ?? ''
  if (cat.includes('super') || cat === 'super_ceo' || cat === 'admin') {
    return '/super-admin'
  }
  if (cat === 'client_admin' || cat === 'gerente_ventas') {
    return '/admin-cliente'
  }
  return '/dashboard'
}

// ─── Component ────────────────────────────────────────────────

export default function LoginPage() {
  const router = useRouter()
  const { login, user, isAuthenticated } = useAuth()

  const [step, setStep] = useState<'credentials' | '2fa' | 'success'>('credentials')
  const [email, setEmail]         = useState('')
  const [password, setPassword]   = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // 2FA state (for when server requests it)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [pendingCategory, setPendingCategory] = useState<string | null>(null)

  // If already authenticated, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      router.replace(getRedirectForRole(user.category))
    }
  }, [isAuthenticated, user, router])

  // ─── Submit credentials ──────────────────────────────────────

  const handleLogin = async () => {
    setError(null)

    if (!email.trim())    { setError('El email es requerido'); return }
    if (!password.trim()) { setError('La contraseña es requerida'); return }

    setIsLoading(true)

    const result = await login(email.trim().toLowerCase(), password)

    setIsLoading(false)

    if (!result.success) {
      setError(result.error ?? 'Credenciales inválidas')
      return
    }

    // success — useAuth updates user context asynchronously;
    // useEffect above will handle redirect when user is populated.
    setStep('success')
    setPendingCategory(null)
  }

  // ─── 2FA (triggered if API explicitly requests it) ───────────

  const verify2FA = async () => {
    setError(null)
    if (twoFactorCode.length !== 6) { setError('El código debe tener 6 dígitos'); return }

    setIsLoading(true)

    const result = await fetch('/api/auth/verify-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ code: twoFactorCode }),
    })

    setIsLoading(false)

    if (!result.ok) {
      setError('Código incorrecto o expirado')
      return
    }

    setStep('success')
  }

  // ─── Key press helpers ────────────────────────────────────────

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (step === 'credentials') handleLogin()
      if (step === '2fa') verify2FA()
    }
  }

  // ─── Render ───────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4 shadow-lg shadow-orange-500/20">
            <Zap className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Silexar Pulse</h1>
          <p className="text-slate-400 text-sm mt-2">Enterprise Marketing Platform</p>
        </div>

        <NeuromorphicCard variant="glow" className="p-8">

          {/* ── Step: Credentials ── */}
          {step === 'credentials' && (
            <div className="space-y-5">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
                <p className="text-slate-400 text-sm mt-1">Ingresa tus credenciales</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="text-slate-400 text-xs block mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="text-slate-400 text-xs block mb-2">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full pl-12 pr-14 py-3.5 bg-slate-800/80 border border-slate-700 rounded-xl text-white focus:border-orange-500 focus:outline-none transition-colors"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-orange-500"
                  />
                  <span className="text-slate-400 text-sm">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-orange-400 text-sm hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <NeuromorphicButton
                variant="primary"
                className="w-full py-4 text-lg"
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </NeuromorphicButton>
            </div>
          )}

          {/* ── Step: 2FA ── */}
          {step === '2fa' && (
            <div className="space-y-5">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-500/20 mb-4">
                  <Smartphone className="w-8 h-8 text-blue-400" />
                </div>
                <h2 className="text-xl font-bold text-white">Verificación 2FA</h2>
                <p className="text-slate-400 text-sm mt-2">
                  Ingresa el código de 6 dígitos de tu app autenticadora
                </p>
              </div>

              <label htmlFor="login-2fa" className="sr-only">Código de verificación 2FA</label>
              <input
                id="login-2fa"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={onKeyDown}
                className="w-full px-4 py-5 bg-slate-800 border border-slate-700 rounded-xl text-white text-center text-3xl tracking-[0.5em] focus:border-orange-500 focus:outline-none font-mono"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
                aria-label="Código de verificación de 6 dígitos"
              />

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <NeuromorphicButton
                variant="primary"
                className="w-full py-4"
                onClick={verify2FA}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-5 h-5 animate-spin" /> : 'Verificar Código'}
              </NeuromorphicButton>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(null) }}
                className="w-full text-slate-400 text-sm hover:text-white py-2 transition-colors"
              >
                ← Volver al login
              </button>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
                <CheckCircle className="w-10 h-10 text-green-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Bienvenido!</h2>
              <p className="text-slate-300 mb-6">Sesión iniciada correctamente</p>
              <div className="mt-4">
                <Loader className="w-8 h-8 animate-spin text-orange-400 mx-auto" />
                <p className="text-slate-500 text-sm mt-3">Redirigiendo a tu panel...</p>
              </div>
            </div>
          )}

        </NeuromorphicCard>

        {/* Role legend */}
        <div className="mt-8 p-5 bg-slate-800/40 rounded-xl border border-slate-700/50">
          <p className="text-slate-500 text-xs text-center mb-3 font-medium uppercase tracking-wider">Accesos del sistema</p>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-red-500/5 border border-red-500/20">
              <Zap className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-xs font-medium">Super Admin</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-blue-500/5 border border-blue-500/20">
              <Building className="w-4 h-4 text-blue-400" />
              <span className="text-blue-400 text-xs font-medium">Admin</span>
            </div>
            <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-green-500/5 border border-green-500/20">
              <User className="w-4 h-4 text-green-400" />
              <span className="text-green-400 text-xs font-medium">Usuario</span>
            </div>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-slate-600 text-xs">© 2025 Silexar Pulse · Enterprise Platform</p>
        </div>
      </div>
    </div>
  )
}
