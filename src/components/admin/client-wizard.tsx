'use client'

/**
 * 🏢 SILEXAR PULSE - Client Creation Wizard
 * Multi-step wizard for creating new tenant clients
 * 
 * @description Complete client onboarding with:
 * - Company information
 * - Plan and features selection
 * - License configuration
 * - URL slug generation
 * - Admin credentials
 * - Welcome email dispatch
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton, 
  NeuromorphicInput 
} from '@/components/ui/neuromorphic'
import {
  Building2,
  User,
  Mail,
  Phone,
  Globe,
  CreditCard,
  Calendar,
  Shield,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Zap,
  Star,
  Crown,
  Send,
  Copy,
  Eye,
  EyeOff,
  AlertCircle
} from 'lucide-react'

// Plan definitions
const PLANS = {
  starter: {
    name: 'Starter',
    price: 99000,
    features: ['campaigns', 'reports'],
    maxUsers: 5,
    icon: Zap,
    color: 'from-slate-600 to-slate-700'
  },
  professional: {
    name: 'Professional',
    price: 299000,
    features: ['campaigns', 'analytics', 'reports', 'api_access'],
    maxUsers: 25,
    icon: Star,
    color: 'from-blue-600 to-cyan-600'
  },
  enterprise: {
    name: 'Enterprise',
    price: 599000,
    features: ['campaigns', 'analytics', 'reports', 'api_access', 'ai_assistant', 'priority_support'],
    maxUsers: 100,
    icon: Shield,
    color: 'from-purple-600 to-pink-600'
  },
  enterprise_plus: {
    name: 'Enterprise Plus',
    price: 999000,
    features: ['campaigns', 'analytics', 'reports', 'api_access', 'ai_assistant', 'white_label', 'priority_support', 'custom_integrations'],
    maxUsers: -1, // unlimited
    icon: Crown,
    color: 'from-yellow-500 to-orange-600'
  }
}

type PlanType = keyof typeof PLANS

interface ClientFormData {
  // Step 1: Company Info
  companyName: string
  tradeName: string
  taxId: string
  address: string
  city: string
  country: string
  phone: string
  website: string
  
  // Step 2: Plan Selection
  plan: PlanType
  customFeatures: string[]
  
  // Step 3: License
  licenseDuration: number // months
  licenseStartDate: Date
  autoRenewal: boolean
  
  // Step 4: URL & Access
  urlSlug: string
  adminName: string
  adminEmail: string
  adminPassword: string
  
  // Step 5: Commercial Terms
  discountPercent: number
  billingCycle: 'monthly' | 'quarterly' | 'annual'
  paymentMethod: 'transfer' | 'card' | 'invoice'
  notes: string
}

interface ClientWizardProps {
  onComplete: (client: ClientFormData) => void
  onCancel: () => void
}

export function ClientWizard({ onComplete, onCancel }: ClientWizardProps) {
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState<ClientFormData>({
    companyName: '',
    tradeName: '',
    taxId: '',
    address: '',
    city: '',
    country: 'Chile',
    phone: '',
    website: '',
    plan: 'professional',
    customFeatures: [],
    licenseDuration: 12,
    licenseStartDate: new Date(),
    autoRenewal: true,
    urlSlug: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    discountPercent: 0,
    billingCycle: 'monthly',
    paymentMethod: 'transfer',
    notes: ''
  })

  const totalSteps = 5

  const updateFormData = (field: keyof ClientFormData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20)
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    updateFormData('adminPassword', password)
  }

  const validateStep = (): boolean => {
    setError(null)
    
    switch (step) {
      case 1:
        if (!formData.companyName || !formData.taxId || !formData.phone) {
          setError('Complete todos los campos obligatorios')
          return false
        }
        break
      case 3:
        if (formData.licenseDuration < 1) {
          setError('La duración de licencia debe ser al menos 1 mes')
          return false
        }
        break
      case 4:
        if (!formData.urlSlug || !formData.adminName || !formData.adminEmail || !formData.adminPassword) {
          setError('Complete todos los campos de acceso')
          return false
        }
        if (formData.adminPassword.length < 8) {
          setError('La contraseña debe tener al menos 8 caracteres')
          return false
        }
        break
    }
    
    return true
  }

  const nextStep = () => {
    if (validateStep()) {
      setStep(prev => Math.min(prev + 1, totalSteps))
    }
  }

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1))
  }

  const handleSubmit = async () => {
    if (!validateStep()) return
    
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    onComplete(formData)
    setIsSubmitting(false)
  }

  const calculateTotal = () => {
    const plan = PLANS[formData.plan]
    const monthlyPrice = plan.price * (1 - formData.discountPercent / 100)
    
    let multiplier = 1
    if (formData.billingCycle === 'quarterly') multiplier = 3
    if (formData.billingCycle === 'annual') multiplier = 12
    
    return monthlyPrice * multiplier
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-8">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div 
          key={i}
          className={`flex items-center ${i < totalSteps - 1 ? 'flex-1' : ''}`}
        >
          <div 
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
              i + 1 < step 
                ? 'bg-green-600 text-white' 
                : i + 1 === step 
                  ? 'bg-blue-600 text-white ring-4 ring-blue-500/30' 
                  : 'bg-slate-700 text-slate-400'
            }`}
          >
            {i + 1 < step ? <CheckCircle className="w-5 h-5" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`flex-1 h-1 mx-2 rounded ${
              i + 1 < step ? 'bg-green-600' : 'bg-slate-700'
            }`} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <NeuromorphicCard variant="embossed" className="max-w-4xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-white mb-2 text-center">
        Crear Nuevo Cliente
      </h2>
      <p className="text-slate-400 text-center mb-6">
        Complete el asistente para crear una nueva cuenta de cliente
      </p>

      {renderStepIndicator()}

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-6">
          <AlertCircle className="w-5 h-5 text-red-400" />
          <span className="text-sm text-red-400">{error}</span>
        </div>
      )}

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-400" />
            Información de la Empresa
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicInput
              label="Razón Social *"
              placeholder="Empresa S.A."
              value={formData.companyName}
              onChange={(e) => {
                updateFormData('companyName', e.target.value)
                updateFormData('urlSlug', generateSlug(e.target.value))
              }}
              icon={<Building2 className="w-4 h-4" />}
            />
            <NeuromorphicInput
              label="Nombre Comercial"
              placeholder="Mi Empresa"
              value={formData.tradeName}
              onChange={(e) => updateFormData('tradeName', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicInput
              label="RUT / Tax ID *"
              placeholder="12.345.678-9"
              value={formData.taxId}
              onChange={(e) => updateFormData('taxId', e.target.value)}
              icon={<CreditCard className="w-4 h-4" />}
            />
            <NeuromorphicInput
              label="Teléfono *"
              placeholder="+56 9 1234 5678"
              value={formData.phone}
              onChange={(e) => updateFormData('phone', e.target.value)}
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <NeuromorphicInput
            label="Dirección"
            placeholder="Av. Principal 123, Oficina 456"
            value={formData.address}
            onChange={(e) => updateFormData('address', e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicInput
              label="Ciudad"
              placeholder="Santiago"
              value={formData.city}
              onChange={(e) => updateFormData('city', e.target.value)}
            />
            <NeuromorphicInput
              label="Sitio Web"
              placeholder="https://www.ejemplo.com"
              value={formData.website}
              onChange={(e) => updateFormData('website', e.target.value)}
              icon={<Globe className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* Step 2: Plan Selection */}
      {step === 2 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Selección de Plan
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => {
              const Icon = plan.icon
              const isSelected = formData.plan === key
              
              return (
                <div
                  key={key}
                  onClick={() => updateFormData('plan', key)}
                  className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-500/10' 
                      : 'border-slate-700 bg-slate-800/30 hover:border-slate-600'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h4 className="text-lg font-bold text-white mb-1">{plan.name}</h4>
                  <p className="text-2xl font-bold text-white mb-2">
                    ${plan.price.toLocaleString()} <span className="text-sm text-slate-400">/mes</span>
                  </p>
                  
                  <ul className="space-y-1 text-sm text-slate-400">
                    <li>• Hasta {plan.maxUsers === -1 ? 'ilimitados' : plan.maxUsers} usuarios</li>
                    <li>• {plan.features.length} módulos incluidos</li>
                  </ul>

                  {isSelected && (
                    <div className="mt-4 flex items-center gap-2 text-blue-400">
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Seleccionado</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Step 3: License Configuration */}
      {step === 3 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Configuración de Licencia
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duración (meses)
              </label>
              <select
                value={formData.licenseDuration}
                onChange={(e) => updateFormData('licenseDuration', parseInt(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              >
                <option value={1}>1 mes</option>
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Fecha de Inicio
              </label>
              <input
                type="date"
                value={formData.licenseStartDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData('licenseStartDate', new Date(e.target.value))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="p-4 bg-slate-800/50 rounded-lg">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoRenewal}
                onChange={(e) => updateFormData('autoRenewal', e.target.checked)}
                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-500"
              />
              <div>
                <span className="text-white font-medium">Renovación Automática</span>
                <p className="text-xs text-slate-400">
                  La licencia se renovará automáticamente al vencer
                </p>
              </div>
            </label>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300">
              📅 La licencia expirará el: {' '}
              <strong>
                {new Date(
                  formData.licenseStartDate.getTime() + 
                  formData.licenseDuration * 30 * 24 * 60 * 60 * 1000
                ).toLocaleDateString()}
              </strong>
            </p>
          </div>
        </div>
      )}

      {/* Step 4: Access Configuration */}
      {step === 4 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-green-400" />
            Configuración de Acceso
          </h3>

          <div className="p-4 bg-slate-800/50 rounded-lg">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL de Acceso
            </label>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">silexar.com/</span>
              <input
                type="text"
                value={formData.urlSlug}
                onChange={(e) => updateFormData('urlSlug', generateSlug(e.target.value))}
                className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white"
                placeholder="miempresa"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`silexar.com/${formData.urlSlug}`)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          <h4 className="text-white font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Usuario Administrador
          </h4>

          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicInput
              label="Nombre del Admin *"
              placeholder="Juan Pérez"
              value={formData.adminName}
              onChange={(e) => updateFormData('adminName', e.target.value)}
              icon={<User className="w-4 h-4" />}
            />
            <NeuromorphicInput
              label="Email del Admin *"
              type="email"
              placeholder="admin@empresa.com"
              value={formData.adminEmail}
              onChange={(e) => updateFormData('adminEmail', e.target.value)}
              icon={<Mail className="w-4 h-4" />}
            />
          </div>

          <div className="relative">
            <NeuromorphicInput
              label="Contraseña Inicial *"
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.adminPassword}
              onChange={(e) => updateFormData('adminPassword', e.target.value)}
              icon={<Shield className="w-4 h-4" />}
            />
            <div className="absolute right-3 top-9 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                className="text-xs px-2 py-1 bg-blue-600 text-white rounded"
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Summary & Terms */}
      {step === 5 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            Resumen y Confirmación
          </h3>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-xs text-slate-400 uppercase mb-2">Empresa</h4>
                <p className="text-white font-medium">{formData.companyName}</p>
                <p className="text-sm text-slate-400">{formData.taxId}</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-xs text-slate-400 uppercase mb-2">Plan</h4>
                <p className="text-white font-medium">{PLANS[formData.plan].name}</p>
                <p className="text-sm text-slate-400">{formData.licenseDuration} meses</p>
              </div>

              <div className="p-4 bg-slate-800/50 rounded-lg">
                <h4 className="text-xs text-slate-400 uppercase mb-2">Acceso</h4>
                <p className="text-white font-medium">silexar.com/{formData.urlSlug}</p>
                <p className="text-sm text-slate-400">{formData.adminEmail}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={formData.discountPercent}
                  onChange={(e) => updateFormData('discountPercent', parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Ciclo de Facturación
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => updateFormData('billingCycle', e.target.value as ClientFormData['billingCycle'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                >
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>

              <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                <h4 className="text-xs text-green-400 uppercase mb-2">Total a Cobrar</h4>
                <p className="text-2xl font-bold text-white">
                  ${calculateTotal().toLocaleString()} CLP
                </p>
                <p className="text-xs text-slate-400">
                  {formData.billingCycle === 'monthly' ? 'Por mes' : 
                   formData.billingCycle === 'quarterly' ? 'Por trimestre' : 'Por año'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-300 flex items-center gap-2">
              <Send className="w-4 h-4" />
              Al confirmar, se enviará un email de bienvenida a <strong>{formData.adminEmail}</strong> con las credenciales de acceso.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-700">
        <NeuromorphicButton
          variant="secondary"
          onClick={step === 1 ? onCancel : prevStep}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </NeuromorphicButton>

        {step < totalSteps ? (
          <NeuromorphicButton variant="primary" onClick={nextStep}>
            Siguiente
            <ArrowRight className="w-4 h-4 ml-2" />
          </NeuromorphicButton>
        ) : (
          <NeuromorphicButton
            variant="success"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Crear Cliente
          </NeuromorphicButton>
        )}
      </div>
    </NeuromorphicCard>
  )
}

export default ClientWizard
