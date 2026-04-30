'use client'

/**
 * 🚀 SILEXAR PULSE - Onboarding Wizard
 * Wizard de bienvenida para nuevos usuarios
 * 
 * @description Onboarding Features:
 * - Tour interactivo por módulos
 * - Configuración inicial
 * - Tips y mejores prácticas
 * - Personalización
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { N, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Zap, Users, Megaphone, BarChart3,
  CheckCircle, ChevronRight, ChevronLeft,
  Rocket, Target, Sparkles, Lock, Bell, Palette,
  Globe, Smartphone, X
} from 'lucide-react'

interface OnboardingStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  content: React.ReactNode
  action?: string
}

interface OnboardingWizardProps {
  userName: string
  userCategory: string
  onComplete: () => void
  onSkip: () => void
}

export function OnboardingWizard({ userName, userCategory, onComplete, onSkip }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [, setCompletedSteps] = useState<Set<string>>(new Set())
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    notifications: true,
    language: 'es',
    timezone: 'America/Santiago'
  })

  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: '¡Bienvenido a Silexar Pulse!',
      description: 'Tu plataforma de marketing enterprise',
      icon: <Rocket className="w-8 h-8 text-orange-400" />,
      content: (
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
            <Zap className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Hola, {userName}! 👋</h3>
          <p className="text-slate-400 mb-6">
            Estamos emocionados de tenerte como parte de Silexar Pulse.<br />
            Te guiaremos en tus primeros pasos.
          </p>
          <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto mt-8">
            {[
              { icon: <Users className="w-6 h-6" />, label: 'CRM Inteligente' },
              { icon: <Megaphone className="w-6 h-6" />, label: 'Campañas' },
              { icon: <BarChart3 className="w-6 h-6" />, label: 'Analytics' }
            ].map((feature, i) => (
              <div key={`${feature}-${i}`} className="p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                <div className="text-orange-400 mb-2">{feature.icon}</div>
                <p className="text-white text-sm">{feature.label}</p>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      id: 'permissions',
      title: 'Tus Permisos',
      description: 'Lo que puedes hacer en el sistema',
      icon: <Lock className="w-8 h-8 text-blue-400" />,
      content: (
        <div className="py-6">
          <p className="text-slate-400 mb-6 text-center">
            Como <span className="text-orange-400 font-medium">{userCategory}</span>, tienes acceso a:
          </p>
          <div className="grid grid-cols-2 gap-3 max-w-lg mx-auto">
            {[
              { name: 'Ver Clientes', enabled: true },
              { name: 'Crear Clientes', enabled: true },
              { name: 'Editar Clientes', enabled: true },
              { name: 'Ver Reportes', enabled: true },
              { name: 'Crear Campañas', enabled: userCategory !== 'vendedor' },
              { name: 'Configuración', enabled: userCategory === 'admin' }
            ].map((perm, i) => (
              <div key={`${perm}-${i}`} className={`p-3 rounded-lg flex items-center gap-3 ${perm.enabled
                ? 'bg-green-500/10 border border-green-500/30'
                : 'bg-slate-800/50 border border-slate-700'
                }`}>
                <CheckCircle className={`w-5 h-5 ${perm.enabled ? 'text-green-400' : 'text-slate-600'}`} />
                <span className={perm.enabled ? 'text-white' : 'text-slate-500'}>{perm.name}</span>
              </div>
            ))}
          </div>
          <p className="text-slate-500 text-xs text-center mt-6">
            Tu administrador puede modificar estos permisos
          </p>
        </div>
      )
    },
    {
      id: 'preferences',
      title: 'Personaliza tu Experiencia',
      description: 'Configura tus preferencias',
      icon: <Palette className="w-8 h-8 text-purple-400" />,
      content: (
        <div className="py-6 max-w-md mx-auto space-y-4">
          <div>
            <label className="text-slate-400 text-sm block mb-2">Tema</label>
            <div className="flex gap-2">
              {['dark', 'light', 'system'].map(theme => (
                <button
                  key={theme}
                  onClick={() => setPreferences({ ...preferences, theme })}
                  className={`flex-1 p-3 rounded-lg border ${preferences.theme === theme
                    ? 'bg-orange-500/20 border-orange-500/50 text-orange-400'
                    : 'bg-slate-800/50 border-slate-700 text-slate-400'
                    }`}
                >
                  {theme === 'dark' ? '🌙 Oscuro' : theme === 'light' ? '☀️ Claro' : '💻 Sistema'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Idioma</label>
            <select
              value={preferences.language}
              onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="es">🇪🇸 Español</option>
              <option value="en">🇺🇸 English</option>
              <option value="pt">🇧🇷 Português</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 text-sm block mb-2">Zona Horaria</label>
            <select
              value={preferences.timezone}
              onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
              className="w-full p-3 bg-slate-800 border border-slate-700 rounded-lg text-white"
            >
              <option value="America/Santiago">Santiago, Chile (UTC-3)</option>
              <option value="America/Buenos_Aires">Buenos Aires (UTC-3)</option>
              <option value="America/Mexico_City">Ciudad de México (UTC-6)</option>
              <option value="America/New_York">Nueva York (UTC-5)</option>
            </select>
          </div>

          <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer">
            <input
              type="checkbox"
              checked={preferences.notifications}
              onChange={(e) => setPreferences({ ...preferences, notifications: e.target.checked })}
              className="w-5 h-5"
            />
            <div>
              <p className="text-white">Habilitar notificaciones</p>
              <p className="text-slate-500 text-xs">Recibe alertas de tareas, tickets y más</p>
            </div>
          </label>
        </div>
      )
    },
    {
      id: 'tips',
      title: 'Tips para Empezar',
      description: 'Mejores prácticas',
      icon: <Sparkles className="w-8 h-8 text-yellow-400" />,
      content: (
        <div className="py-6 max-w-lg mx-auto space-y-4">
          {[
            { icon: <Target className="w-5 h-5" />, tip: 'Completa tu perfil para una mejor experiencia', color: 'orange' },
            { icon: <Bell className="w-5 h-5" />, tip: 'Configura tus notificaciones según tu preferencia', color: 'blue' },
            { icon: <Smartphone className="w-5 h-5" />, tip: 'Activa 2FA para mayor seguridad', color: 'green' },
            { icon: <Globe className="w-5 h-5" />, tip: 'Usa los atajos de teclado para ser más productivo', color: 'purple' }
          ].map((item, i) => (
            <div key={`${item}-${i}`} className={`p-4 bg-${item.color}-500/10 rounded-xl border border-${item.color}-500/30 flex items-center gap-3`}>
              <div className={`text-${item.color}-400`}>{item.icon}</div>
              <p className="text-white">{item.tip}</p>
            </div>
          ))}
        </div>
      )
    },
    {
      id: 'ready',
      title: '¡Todo Listo!',
      description: 'Estás listo para comenzar',
      icon: <CheckCircle className="w-8 h-8 text-green-400" />,
      content: (
        <div className="text-center py-8">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-2">¡Felicitaciones! 🎉</h3>
          <p className="text-slate-400 mb-8">
            Tu configuración está completa.<br />
            Ya puedes comenzar a usar Silexar Pulse.
          </p>
          <NeuButton variant="primary" onClick={onComplete}>
            <Rocket className="w-5 h-5 mr-2" />
            Comenzar a Trabajar
          </NeuButton>
        </div>
      )
    }
  ]

  const currentStepData = steps[currentStep]

  const handleNext = () => {
    setCompletedSteps(prev => new Set([...prev, currentStepData.id]))
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }} className="w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {currentStepData.icon}
            <div>
              <h2 className="text-xl font-bold text-white">{currentStepData.title}</h2>
              <p className="text-slate-400 text-sm">{currentStepData.description}</p>
            </div>
          </div>
          <button onClick={onSkip} className="text-slate-500 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress */}
        <div className="px-6 py-3 bg-slate-800/50 flex items-center gap-2">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${i < currentStep
                ? 'bg-green-500 text-white'
                : i === currentStep
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-slate-400'
                }`}>
                {i < currentStep ? <CheckCircle className="w-5 h-5" /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-12 h-1 mx-1 rounded ${i < currentStep ? 'bg-green-500' : 'bg-slate-700'
                  }`} />
              )}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStepData.content}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg ${currentStep === 0
              ? 'text-slate-600 cursor-not-allowed'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="flex items-center gap-3">
            <button onClick={onSkip} className="text-slate-500 hover:text-white text-sm">
              Omitir tour
            </button>
            {currentStep < steps.length - 1 && (
              <NeuButton variant="primary" onClick={handleNext}>
                Siguiente
                <ChevronRight className="w-5 h-5 ml-1" />
              </NeuButton>
            )}
          </div>
        </div>
      </NeuCard>
    </div>
  )
}

export default OnboardingWizard
