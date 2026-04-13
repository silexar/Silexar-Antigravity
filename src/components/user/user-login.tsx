'use client'

/**
 * ⚠️ DEVELOPMENT ONLY — Mock Login Component
 * Contains hardcoded test credentials. MUST NOT be deployed to production.
 * Production uses Better Auth with real backend.
 *
 * 🔐 SILEXAR PULSE - User Login Component
 * Autenticación para usuarios operadores
 *
 * @description Login Features:
 * - Autenticación con email y contraseña
 * - 2FA support
 * - Remember me
 * - Forgot password
 * - Redirección según rol/permisos
 *
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  Zap, Mail, Lock, Eye, EyeOff, Smartphone, AlertTriangle,
  ArrowRight, Loader, CheckCircle, RefreshCw
} from 'lucide-react'

interface LoginCredentials {
  email: string
  password: string
  rememberMe: boolean
}

interface UserLoginProps {
  onLogin?: (user: AuthenticatedUser) => void
  tenantId?: string
}

interface AuthenticatedUser {
  id: string
  name: string
  email: string
  category: string
  permissions: string[]
  tenantId: string
  tenantName: string
  requires2FA: boolean
}

// Mock users database
const MOCK_USERS: Record<string, { password: string; user: AuthenticatedUser }> = {
  'maria@empresa.com': {
    password: 'Admin123!',
    user: {
      id: 'user_001', name: 'María González', email: 'maria@empresa.com',
      category: 'super_user', permissions: ['*'],
      tenantId: 'tenant_001', tenantName: 'Empresa Demo', requires2FA: true
    }
  },
  'carlos@empresa.com': {
    password: 'Ejecutivo123!',
    user: {
      id: 'user_002', name: 'Carlos Rodríguez', email: 'carlos@empresa.com',
      category: 'ejecutivo', permissions: ['crm_view', 'crm_export', 'rep_view', 'rep_create', 'camp_view'],
      tenantId: 'tenant_001', tenantName: 'Empresa Demo', requires2FA: false
    }
  },
  'ana@empresa.com': {
    password: 'Vendedor123!',
    user: {
      id: 'user_003', name: 'Ana Silva', email: 'ana@empresa.com',
      category: 'vendedor', permissions: ['crm_view', 'crm_create', 'crm_edit', 'rep_view'],
      tenantId: 'tenant_001', tenantName: 'Empresa Demo', requires2FA: false
    }
  },
  'pedro@empresa.com': {
    password: 'Trafico123!',
    user: {
      id: 'user_004', name: 'Pedro López', email: 'pedro@empresa.com',
      category: 'trafico', permissions: ['camp_view', 'camp_create', 'camp_edit', 'camp_publish', 'rep_view'],
      tenantId: 'tenant_001', tenantName: 'Empresa Demo', requires2FA: false
    }
  }
}

export function UserLogin({ onLogin, tenantId }: UserLoginProps) {
  // ⚠️ DEVELOPMENT ONLY: Must never run in production
  if (process.env.NODE_ENV === 'production') {
    throw new Error('MockLogin: Development only component - must not run in production');
  }

  const [step, setStep] = useState<'credentials' | '2fa' | 'success'>('credentials')
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const [pendingUser, setPendingUser] = useState<AuthenticatedUser | null>(null)

  const handleLogin = async () => {
    setError(null)
    
    if (!credentials.email.trim()) {
      setError('El email es requerido')
      return
    }
    
    if (!credentials.password) {
      setError('La contraseña es requerida')
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000))

    const userRecord = MOCK_USERS[credentials.email.toLowerCase()]
    
    if (!userRecord) {
      setError('Usuario no encontrado')
      setIsLoading(false)
      return
    }

    if (userRecord.password !== credentials.password) {
      setError('Contraseña incorrecta')
      setIsLoading(false)
      return
    }

    const user = userRecord.user

    // Check if 2FA is required
    if (user.requires2FA) {
      setPendingUser(user)
      setStep('2fa')
      setIsLoading(false)
      return
    }

    // Login successful
    completeLogin(user)
  }

  const verify2FA = async () => {
    setError(null)

    if (!/^\d{6}$/.test(twoFactorCode)) {
      setError('El código debe tener exactamente 6 dígitos numéricos')
      return
    }

    if (!pendingUser) return

    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: pendingUser.id, code: twoFactorCode }),
      })

      const data = await res.json() as { success: boolean; error?: string }

      if (!data.success) {
        setError(data.error ?? 'Código inválido')
        setIsLoading(false)
        return
      }

      completeLogin(pendingUser)
    } catch {
      setError('Error al verificar el código. Intenta nuevamente.')
      setIsLoading(false)
    }
  }

  const completeLogin = (user: AuthenticatedUser) => {
    setStep('success')
    setIsLoading(false)

    // NOTE: user data is only kept in component state — never persisted to
    // localStorage/sessionStorage (tokens live in httpOnly cookies via the
    // real auth flow; this mock only triggers onLogin for dev UI testing).

    // Callback after animation
    setTimeout(() => {
      if (onLogin) {
        onLogin(user)
      }
    }, 1500)
  }

  const getCategoryInfo = (category: string) => {
    const categories: Record<string, { name: string; icon: string }> = {
      vendedor: { name: 'Vendedor', icon: '💰' },
      ejecutivo: { name: 'Ejecutivo', icon: '👔' },
      trafico: { name: 'Tráfico Digital', icon: '📊' },
      operacional: { name: 'Operacional', icon: '⚙️' },
      super_user: { name: 'Super Usuario', icon: '👑' },
      analista: { name: 'Analista', icon: '📈' },
      soporte: { name: 'Soporte', icon: '🎧' }
    }
    return categories[category] || { name: category, icon: '👤' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 mb-4">
            <Zap className="w-8 h-8 text-[#2C2C2A]" />
          </div>
          <h1 className="text-2xl font-bold text-[#2C2C2A]">Silexar Pulse</h1>
          <p className="text-[#888780] text-sm mt-1">Accede a tu cuenta</p>
        </div>

        <NeuromorphicCard variant="glow" className="p-6">
          {/* Credentials Step */}
          {step === 'credentials' && (
            <div className="space-y-4">
              <div>
                <label className="text-[#888780] text-xs block mb-1">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888780]" />
                  <input
                    type="email"
                    placeholder="tu@empresa.com"
                    aria-label="Email"
                    value={credentials.email}
                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                    className="w-full pl-11 pr-4 py-3 bg-[#E8E5E0] border border-[#D4D1CC] rounded-lg text-[#2C2C2A] focus:border-orange-500 focus:outline-none"
                    autoComplete="email"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#888780] text-xs block mb-1">Contraseña</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#888780]" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    aria-label="Contraseña"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
                    className="w-full pl-11 pr-12 py-3 bg-[#E8E5E0] border border-[#D4D1CC] rounded-lg text-[#2C2C2A] focus:border-orange-500 focus:outline-none"
                    autoComplete="current-password"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    aria-label={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5 text-[#888780]" />
                    ) : (
                      <Eye className="w-5 h-5 text-[#888780]" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={credentials.rememberMe}
                    onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
                    className="w-4 h-4 rounded bg-[#D4D1CC] border-[#CCCAC5]"
                  />
                  <span className="text-[#888780] text-sm">Recordarme</span>
                </label>
                <button className="text-orange-400 text-sm hover:underline">
                  ¿Olvidaste tu contraseña?
                </button>
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <NeuromorphicButton 
                variant="primary" 
                className="w-full py-3" 
                onClick={handleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Iniciar Sesión
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </NeuromorphicButton>

              <div className="text-center pt-4 border-t border-[#D4D1CC]">
                <p className="text-[#888780] text-xs">
                  ¿No tienes acceso? Contacta a tu administrador
                </p>
              </div>
            </div>
          )}

          {/* 2FA Step */}
          {step === '2fa' && (
            <div className="space-y-4">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-500/20 mb-3">
                  <Smartphone className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-[#2C2C2A] font-medium">Verificación en dos pasos</h3>
                <p className="text-[#888780] text-sm mt-1">
                  Ingresa el código de 6 dígitos de tu app
                </p>
              </div>

              <div>
                <input
                  type="text"
                  placeholder="000000"
                  aria-label="Código de verificación 2FA"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={(e) => e.key === 'Enter' && verify2FA()}
                  className="w-full px-4 py-4 bg-[#E8E5E0] border border-[#D4D1CC] rounded-lg text-[#2C2C2A] text-center text-2xl tracking-widest focus:border-orange-500 focus:outline-none"
                  maxLength={6}
                  autoComplete="one-time-code"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">{error}</span>
                </div>
              )}

              <NeuromorphicButton 
                variant="primary" 
                className="w-full py-3" 
                onClick={verify2FA}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Verificar
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </NeuromorphicButton>

              <button 
                onClick={() => { setStep('credentials'); setError(null) }}
                className="w-full text-[#888780] text-sm hover:text-[#2C2C2A]"
              >
                ← Volver al login
              </button>
            </div>
          )}

          {/* Success Step */}
          {step === 'success' && pendingUser && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/20 mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-[#2C2C2A] font-medium text-lg mb-1">¡Bienvenido!</h3>
              <p className="text-[#888780] mb-4">{pendingUser.name}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#E8E5E0] rounded-full">
                <span>{getCategoryInfo(pendingUser.category).icon}</span>
                <span className="text-[#2C2C2A] text-sm">{getCategoryInfo(pendingUser.category).name}</span>
              </div>
              <div className="mt-6">
                <Loader className="w-6 h-6 animate-spin text-orange-400 mx-auto" />
                <p className="text-[#888780] text-sm mt-2">Cargando tu portal...</p>
              </div>
            </div>
          )}
        </NeuromorphicCard>

        {/* Demo Credentials */}
        <div className="mt-6 p-4 bg-[#E8E5E0]/50 rounded-lg border border-[#D4D1CC]">
          <p className="text-[#888780] text-xs text-center mb-3">Usuarios de prueba:</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 bg-[#F0EDE8]/50 rounded">
              <p className="text-orange-400">👑 Super User</p>
              <p className="text-[#888780]">maria@empresa.com</p>
            </div>
            <div className="p-2 bg-[#F0EDE8]/50 rounded">
              <p className="text-blue-400">👔 Ejecutivo</p>
              <p className="text-[#888780]">carlos@empresa.com</p>
            </div>
            <div className="p-2 bg-[#F0EDE8]/50 rounded">
              <p className="text-green-400">💰 Vendedor</p>
              <p className="text-[#888780]">ana@empresa.com</p>
            </div>
            <div className="p-2 bg-[#F0EDE8]/50 rounded">
              <p className="text-purple-400">📊 Tráfico</p>
              <p className="text-[#888780]">pedro@empresa.com</p>
            </div>
          </div>
          <p className="text-slate-600 text-xs text-center mt-2">Contraseña: [Rol]123!</p>
        </div>
      </div>
    </div>
  )
}

export default UserLogin
