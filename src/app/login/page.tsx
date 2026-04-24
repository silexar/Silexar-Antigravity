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
      const params = new URLSearchParams(window.location.search)
      const callbackUrl = params.get('callbackUrl')
      if (callbackUrl) {
        router.replace(callbackUrl)
      } else {
        router.replace(getRedirectForRole(user.category))
      }
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
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: '#dfeaff' }}>
      
      {/* Decorative Neumorphic spheres */}
      <div className="absolute top-10 left-10 w-64 h-64 rounded-full pointer-events-none" style={{ background: '#dfeaff', boxShadow: '16px 16px 32px #bec8de,-16px -16px 32px #ffffff', opacity: 0.5 }} />
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full pointer-events-none" style={{ background: '#dfeaff', boxShadow: 'inset 8px 8px 16px #bec8de,inset -8px -8px 16px #ffffff', opacity: 0.35 }} />

      <div className="w-full max-w-md relative z-10">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl mb-6" style={{ background: '#dfeaff', boxShadow: '8px 8px 16px #bec8de,-8px -8px 16px #ffffff' }}>
            <Zap className="w-12 h-12" style={{ color: '#6888ff' }} />
          </div>
          <h1 className="text-4xl font-black tracking-tight" style={{ color: '#69738c' }}>Silexar Pulse</h1>
          <p className="font-medium text-sm mt-2 uppercase tracking-widest" style={{ color: '#9aa3b8' }}>Enterprise Platform</p>
        </div>

        <div className="p-10 rounded-3xl" style={{ background: '#dfeaff', boxShadow: '12px 12px 24px #bec8de,-12px -12px 24px #ffffff' }}>

          {/* ── Step: Credentials ── */}
          {step === 'credentials' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold" style={{ color: '#69738c' }}>Iniciar Sesión</h2>
                <p className="font-medium text-sm mt-2" style={{ color: '#9aa3b8' }}>Ingresa tus credenciales autorizadas</p>
              </div>

              {/* Email */}
              <div>
                <label htmlFor="login-email" className="font-bold text-xs uppercase tracking-wider block mb-3" style={{ color: '#9aa3b8' }}>Correo Electrónico</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6888ff' }} aria-hidden="true" />
                  <input
                    id="login-email"
                    type="email"
                    placeholder="tu@empresa.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl font-medium focus:outline-none transition-all"
                    style={{ background: '#dfeaff', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff', color: '#69738c' }}
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="login-password" className="font-bold text-xs uppercase tracking-wider block mb-3" style={{ color: '#9aa3b8' }}>Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5" style={{ color: '#6888ff' }} aria-hidden="true" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={onKeyDown}
                    className="w-full pl-12 pr-14 py-4 rounded-2xl font-medium focus:outline-none transition-all"
                    style={{ background: '#dfeaff', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff', color: '#69738c' }}
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-xl transition-colors"
                    style={{ color: '#9aa3b8' }}
                    tabIndex={-1}
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" aria-hidden="true" /> : <Eye className="w-5 h-5" aria-hidden="true" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-6 h-6">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="w-6 h-6 bg-[#EAF0F6] rounded-md shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff] border border-white/40 peer-checked:bg-violet-50 transition-colors" />
                    <div className="absolute opacity-0 peer-checked:opacity-100 text-violet-600 pointer-events-none transition-opacity">
                      <svg viewBox="0 0 14 14" fill="none" className="w-3.5 h-3.5">
                        <path d="M3 8L6 11L11 3.5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" stroke="currentColor"/>
                      </svg>
                    </div>
                  </div>
                  <span className="text-slate-500 font-bold text-sm group-hover:text-slate-700 transition-colors">Recordarme</span>
                </label>
                <button
                  type="button"
                  onClick={() => router.push('/forgot-password')}
                  className="text-violet-600 font-bold text-sm hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {/* Error */}
              {error && (
                <div className="p-4 rounded-2xl flex items-center gap-3 mt-4" style={{ background: '#dfeaff', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff', border: '1px solid #ef444440' }}>
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="font-bold text-sm text-red-500">{error}</span>
                </div>
              )}

              <button
                type="button"
                className="w-full mt-6 flex items-center justify-center gap-2 py-4 rounded-2xl font-black text-lg transition-all duration-300"
                style={isLoading 
                  ? { background: '#dfeaff', color: '#9aa3b8', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff' }
                  : { background: '#6888ff', color: '#ffffff', boxShadow: '6px 6px 12px #bec8de,-4px -4px 8px #ffffff' }
                }
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-6 h-6 animate-spin" style={{ color: '#6888ff' }} />
                ) : (
                  <>
                    ACCEDER AL SISTEMA
                    <ArrowRight className="w-6 h-6" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* ── Step: 2FA ── */}
          {step === '2fa' && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#EAF0F6] shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] mb-6">
                  <Smartphone className="w-10 h-10 text-violet-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-700">Verificación 2FA</h2>
                <p className="text-slate-500 font-medium mt-2">
                  Ingresa el código de seguridad de tu app
                </p>
              </div>

              <label htmlFor="login-2fa" className="sr-only">Código de verificación</label>
              <input
                id="login-2fa"
                type="text"
                inputMode="numeric"
                placeholder="000000"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={onKeyDown}
                className="w-full px-4 py-6 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-white/40 rounded-2xl text-slate-700 text-center text-4xl font-black tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-violet-500/20"
                maxLength={6}
                autoComplete="one-time-code"
                autoFocus
              />

              {error && (
                <div className="p-4 bg-[#EAF0F6] shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff] border border-red-300/50 rounded-2xl flex items-center gap-3">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                  <span className="text-red-600 font-bold text-sm">{error}</span>
                </div>
              )}

              <button
                type="button"
                className={`
                  w-full mt-6 py-4 rounded-2xl font-black text-lg transition-all duration-300 border border-white/40
                  ${isLoading 
                    ? 'bg-[#EAF0F6] text-slate-400 shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
                    : 'bg-[#EAF0F6] text-violet-600 shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff] active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]'
                  }
                `}
                onClick={verify2FA}
                disabled={isLoading}
              >
                {isLoading ? <Loader className="w-6 h-6 animate-spin mx-auto" /> : 'VERIFICAR CÓDIGO'}
              </button>

              <button
                type="button"
                onClick={() => { setStep('credentials'); setError(null) }}
                className="w-full text-slate-500 font-bold text-sm hover:text-violet-600 py-2 transition-colors mt-2"
              >
                ← Volver al login
              </button>
            </div>
          )}

          {/* ── Step: Success ── */}
          {step === 'success' && (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full mb-8" style={{ background: '#dfeaff', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff' }}>
                <CheckCircle className="w-12 h-12 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-black mb-3" style={{ color: '#69738c' }}>¡Bienvenido!</h2>
              <p className="font-medium mb-8" style={{ color: '#9aa3b8' }}>Credenciales validadas con éxito</p>
              
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: '#bec8de' }}></div>
                <div className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: '#6888ff', borderTopColor: 'transparent' }}></div>
              </div>
              <p className="font-bold text-sm mt-6 animate-pulse" style={{ color: '#6888ff' }}>Redirigiendo a tu espacio de trabajo...</p>
            </div>
          )}

        </div>

        <div className="text-center mt-12">
          <p className="font-bold text-xs uppercase tracking-widest" style={{ color: '#9aa3b8' }}>© 2026 Silexar Pulse TIER 0</p>
        </div>
      </div>
    </div>
  )
}
