'use client'

/**
 * ðŸ¢ SILEXAR PULSE - Client Creation Wizard
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
import { NeuCard, NeuButton, StatusBadge } from './_sdk/AdminDesignSystem'
import { getShadow } from './_sdk/AdminDesignSystem'
import { N } from './_sdk/AdminDesignSystem'
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
    colorStart: '#475569',
    colorEnd: '#334155'
  },
  professional: {
    name: 'Professional',
    price: 299000,
    features: ['campaigns', 'analytics', 'reports', 'api_access'],
    maxUsers: 25,
    icon: Star,
    colorStart: '#6888ff',
    colorEnd: '#6888ff'
  },
  enterprise: {
    name: 'Enterprise',
    price: 599000,
    features: ['campaigns', 'analytics', 'reports', 'api_access', 'ai_assistant', 'priority_support'],
    maxUsers: 100,
    icon: Shield,
    colorStart: '#6888ff',
    colorEnd: '#6888ff'
  },
  enterprise_plus: {
    name: 'Enterprise Plus',
    price: 999000,
    features: ['campaigns', 'analytics', 'reports', 'api_access', 'ai_assistant', 'white_label', 'priority_support', 'custom_integrations'],
    maxUsers: -1, // unlimited
    icon: Crown,
    colorStart: '#6888ff',
    colorEnd: '#ea580c'
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
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '2rem' }}>
      {Array.from({ length: totalSteps }).map((_, i) => (
        <div
          key={`step-${i}`}
          style={{ display: 'flex', alignItems: 'center', flex: i < totalSteps - 1 ? 1 : 'none' }}
        >
          <div
            style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              transition: 'all 0.2s',
              background: i + 1 < step ? '#6888ff' : i + 1 === step ? '#6888ff' : '#334155',
              color: i + 1 <= step ? '#fff' : '#94a3b8',
              boxShadow: i + 1 === step ? `0 0 0 4px rgba(59,130,246,0.3)` : 'none'
            }}
          >
            {i + 1 < step ? <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div style={{
              flex: 1,
              height: '0.25rem',
              marginLeft: '0.5rem',
              marginRight: '0.5rem',
              borderRadius: '0.125rem',
              background: i + 1 < step ? '#6888ff' : '#334155'
            }} />
          )}
        </div>
      ))}
    </div>
  )

  return (
    <NeuCard style={{ boxShadow: getShadow(), maxWidth: '56rem', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text, marginBottom: '0.5rem', textAlign: 'center' }}>
        Crear Nuevo Cliente
      </h2>
      <p style={{ color: N.textSub, textAlign: 'center', marginBottom: '1.5rem' }}>
        Complete el asistente para crear una nueva cuenta de cliente
      </p>

      {renderStepIndicator()}

      {error && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <AlertCircle style={{ width: '1.25rem', height: '1.25rem', color: '#f87171' }} />
          <span style={{ fontSize: '0.875rem', color: '#f87171' }}>{error}</span>
        </div>
      )}

      {/* Step 1: Company Info */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 style={{ width: '1.25rem', height: '1.25rem', color: '#60a5fa' }} />
            Información de la Empresa
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Razón Social *</label>
              <input
                type="text"
                placeholder="Empresa S.A."
                value={formData.companyName}
                onChange={(e) => {
                  updateFormData('companyName', e.target.value)
                  updateFormData('urlSlug', generateSlug(e.target.value))
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Nombre Comercial</label>
              <input
                type="text"
                placeholder="Mi Empresa"
                value={formData.tradeName}
                onChange={(e) => updateFormData('tradeName', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>RUT / Tax ID *</label>
              <input
                type="text"
                placeholder="12.345.678-9"
                value={formData.taxId}
                onChange={(e) => updateFormData('taxId', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Teléfono *</label>
              <input
                type="text"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Dirección</label>
            <input
              type="text"
              placeholder="Av. Principal 123, Oficina 456"
              value={formData.address}
              onChange={(e) => updateFormData('address', e.target.value)}
              style={{
                padding: '0.5rem 0.75rem',
                background: N.base,
                border: `1px solid ${N.dark}`,
                borderRadius: '0.5rem',
                color: N.text,
                fontSize: '0.875rem'
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Ciudad</label>
              <input
                type="text"
                placeholder="Santiago"
                value={formData.city}
                onChange={(e) => updateFormData('city', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Sitio Web</label>
              <input
                type="text"
                placeholder="https://www.ejemplo.com"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Plan Selection */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Star style={{ width: '1.25rem', height: '1.25rem', color: '#facc15' }} />
            Selección de Plan
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            {(Object.entries(PLANS) as [PlanType, typeof PLANS[PlanType]][]).map(([key, plan]) => {
              const Icon = plan.icon
              const isSelected = formData.plan === key

              return (
                <div
                  key={key}
                  onClick={() => updateFormData('plan', key)}
                  style={{
                    padding: '1.5rem',
                    borderRadius: '0.75rem',
                    border: `2px solid ${isSelected ? '#6888ff' : N.dark}`,
                    background: isSelected ? 'rgba(37,99,235,0.1)' : 'rgba(30,41,59,0.3)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = N.dark
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.borderColor = N.dark
                  }}
                >
                  <div style={{
                    width: '3rem',
                    height: '3rem',
                    borderRadius: '0.75rem',
                    background: `linear-gradient(135deg, ${plan.colorStart}, ${plan.colorEnd})`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '1rem'
                  }}>
                    <Icon style={{ width: '1.5rem', height: '1.5rem', color: '#fff' }} />
                  </div>

                  <h4 style={{ fontSize: '1.125rem', fontWeight: 700, color: N.text, marginBottom: '0.25rem' }}>{plan.name}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text, marginBottom: '0.5rem' }}>
                    ${plan.price.toLocaleString()} <span style={{ fontSize: '0.875rem', color: N.textSub }}>/mes</span>
                  </p>

                  <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', fontSize: '0.875rem', color: N.textSub }}>
                    <li>• Hasta {plan.maxUsers === -1 ? 'ilimitados' : plan.maxUsers} usuarios</li>
                    <li>• {plan.features.length} módulos incluidos</li>
                  </ul>

                  {isSelected && (
                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa' }}>
                      <CheckCircle style={{ width: '1.25rem', height: '1.25rem' }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Seleccionado</span>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar style={{ width: '1.25rem', height: '1.25rem', color: '#c084fc' }} />
            Configuración de Licencia
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>
                Duración (meses)
              </label>
              <select
                value={formData.licenseDuration}
                onChange={(e) => updateFormData('licenseDuration', parseInt(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              >
                <option value={1}>1 mes</option>
                <option value={3}>3 meses</option>
                <option value={6}>6 meses</option>
                <option value={12}>12 meses</option>
                <option value={24}>24 meses</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>
                Fecha de Inicio
              </label>
              <input
                type="Fecha"
                value={formData.licenseStartDate.toISOString().split('T')[0]}
                onChange={(e) => updateFormData('licenseStartDate', new Date(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '0.5rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.autoRenewal}
                onChange={(e) => updateFormData('autoRenewal', e.target.checked)}
                style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  borderRadius: '0.25rem',
                  border: `1px solid ${N.dark}`,
                  background: N.base,
                  accentColor: '#6888ff'
                }}
              />
              <div>
                <span style={{ color: N.text, fontWeight: 500 }}>Renovación Automática</span>
                <p style={{ fontSize: '0.75rem', color: N.textSub }}>
                  La licencia se renovará automáticamente al vencer
                </p>
              </div>
            </label>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#93c5fd' }}>
              ðŸ“… La licencia expirará el: {' '}
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Globe style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
            Configuración de Acceso
          </h3>

          <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: N.textSub, marginBottom: '0.5rem' }}>
              URL de Acceso
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ color: N.textSub }}>silexar.com/</span>
              <input
                type="text"
                value={formData.urlSlug}
                onChange={(e) => updateFormData('urlSlug', generateSlug(e.target.value))}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
                placeholder="miempresa"
              />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(`silexar.com/${formData.urlSlug}`)}
                style={{ padding: '0.5rem', color: N.textSub, background: 'none', border: 'none', cursor: 'pointer' }}
              >
                <Copy style={{ width: '1.25rem', height: '1.25rem' }} />
              </button>
            </div>
          </div>

          <h4 style={{ color: N.text, fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <User style={{ width: '1rem', height: '1rem' }} />
            Usuario Administrador
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Nombre del Admin *</label>
              <input
                type="text"
                placeholder="Juan Pérez"
                value={formData.adminName}
                onChange={(e) => updateFormData('adminName', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>Email del Admin *</label>
              <input
                type="email"
                placeholder="admin@empresa.com"
                value={formData.adminEmail}
                onChange={(e) => updateFormData('adminEmail', e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem',
                  background: N.base,
                  border: `1px solid ${N.dark}`,
                  borderRadius: '0.5rem',
                  color: N.text,
                  fontSize: '0.875rem'
                }}
              />
            </div>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: N.textSub, marginBottom: '0.25rem' }}>
              Contraseña Inicial *
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mínimo 8 caracteres"
              value={formData.adminPassword}
              onChange={(e) => updateFormData('adminPassword', e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem 0.75rem',
                paddingRight: '6rem',
                background: N.base,
                border: `1px solid ${N.dark}`,
                borderRadius: '0.5rem',
                color: N.text,
                fontSize: '0.875rem'
              }}
            />
            <div style={{ position: 'absolute', right: '0.75rem', top: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ color: N.textSub, background: 'none', border: 'none', cursor: 'pointer', padding: '0.25rem' }}
              >
                {showPassword ? <EyeOff style={{ width: '1.25rem', height: '1.25rem' }} /> : <Eye style={{ width: '1.25rem', height: '1.25rem' }} />}
              </button>
              <button
                type="button"
                onClick={generatePassword}
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: '#6888ff', color: '#fff', borderRadius: '0.25rem', border: 'none', cursor: 'pointer' }}
              >
                Generar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 5: Summary & Terms */}
      {step === 5 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: N.text, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />
            Resumen y Confirmación
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: N.textSub, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Empresa</h4>
                <p style={{ color: N.text, fontWeight: 500 }}>{formData.companyName}</p>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{formData.taxId}</p>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: N.textSub, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Plan</h4>
                <p style={{ color: N.text, fontWeight: 500 }}>{PLANS[formData.plan].name}</p>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{formData.licenseDuration} meses</p>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(30,41,59,0.5)', borderRadius: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: N.textSub, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Acceso</h4>
                <p style={{ color: N.text, fontWeight: 500 }}>silexar.com/{formData.urlSlug}</p>
                <p style={{ fontSize: '0.875rem', color: N.textSub }}>{formData.adminEmail}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>
                  Descuento (%)
                </label>
                <input
                  type="number"
                  min={0}
                  max={50}
                  value={formData.discountPercent}
                  onChange={(e) => updateFormData('discountPercent', parseInt(e.target.value) || 0)}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: N.base,
                    border: `1px solid ${N.dark}`,
                    borderRadius: '0.5rem',
                    color: N.text,
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 500, color: N.textSub }}>
                  Ciclo de Facturación
                </label>
                <select
                  value={formData.billingCycle}
                  onChange={(e) => updateFormData('billingCycle', e.target.value as ClientFormData['billingCycle'])}
                  style={{
                    width: '100%',
                    padding: '0.5rem 0.75rem',
                    background: N.base,
                    border: `1px solid ${N.dark}`,
                    borderRadius: '0.5rem',
                    color: N.text,
                    fontSize: '0.875rem'
                  }}
                >
                  <option value="monthly">Mensual</option>
                  <option value="quarterly">Trimestral</option>
                  <option value="annual">Anual</option>
                </select>
              </div>

              <div style={{ padding: '1rem', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: '0.5rem' }}>
                <h4 style={{ fontSize: '0.75rem', color: '#4ade80', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Total a Cobrar</h4>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: N.text }}>
                  ${calculateTotal().toLocaleString()} CLP
                </p>
                <p style={{ fontSize: '0.75rem', color: N.textSub }}>
                  {formData.billingCycle === 'monthly' ? 'Por mes' :
                    formData.billingCycle === 'quarterly' ? 'Por trimestre' : 'Por año'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '1rem', background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '0.5rem' }}>
            <p style={{ fontSize: '0.875rem', color: '#93c5fd', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Send style={{ width: '1rem', height: '1rem' }} />
              Al confirmar, se enviará un email de bienvenida a <strong>{formData.adminEmail}</strong> con las credenciales de acceso.
            </p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1.5rem', borderTop: `1px solid ${N.dark}` }}>
        <NeuButton variant="secondary" onClick={step === 1 ? onCancel : prevStep}>
          <ArrowLeft style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
          {step === 1 ? 'Cancelar' : 'Anterior'}
        </NeuButton>

        {step < totalSteps ? (
          <NeuButton variant="primary" onClick={nextStep}>
            Siguiente
            <ArrowRight style={{ width: '1rem', height: '1rem', marginLeft: '0.5rem' }} />
          </NeuButton>
        ) : (
          <NeuButton variant="primary" onClick={handleSubmit} disabled={isSubmitting}>
            <CheckCircle style={{ width: '1rem', height: '1rem', marginRight: '0.5rem' }} />
            Crear Cliente
          </NeuButton>
        )}
      </div>
    </NeuCard>
  )
}

export default ClientWizard
