'use client'

/**
 * 💳 SILEXAR PULSE - Client Billing (Client)
 * Facturación y suscripción para clientes
 * 
 * @description Billing:
 * - Ver plan actual
 * - Historial de facturas
 * - Upgrade/Downgrade
 * - Métodos de pago
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { formatCurrency } from '@/lib/utils'
import {
  NeuromorphicCard,
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  CreditCard,
  FileText,
  Download,
  TrendingUp,
  Star,
  Crown,
  Zap,
  RefreshCw
} from 'lucide-react'

interface Subscription {
  id: string
  plan: 'starter' | 'professional' | 'enterprise'
  status: 'active' | 'past_due' | 'cancelled'
  currentPeriodStart: Date
  currentPeriodEnd: Date
  amount: number
  currency: string
  interval: 'monthly' | 'annual'
  features: string[]
  users: { current: number; max: number }
}

interface Invoice {
  id: string
  number: string
  date: Date
  dueDate: Date
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  downloadUrl: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank'
  last4: string
  brand?: string
  isDefault: boolean
  expiresAt?: string
}

export function ClientBilling() {
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setSubscription({
      id: 'sub_001',
      plan: 'professional',
      status: 'active',
      currentPeriodStart: new Date('2025-01-01'),
      currentPeriodEnd: new Date('2025-12-31'),
      amount: 299000,
      currency: 'CLP',
      interval: 'monthly',
      features: ['campaigns', 'analytics', 'reports', 'api_access', 'ai_assistant'],
      users: { current: 5, max: 25 }
    })

    setInvoices([
      { id: 'inv_001', number: 'INV-2025-001', date: new Date('2025-01-01'), dueDate: new Date('2025-01-15'), amount: 299000, status: 'paid', downloadUrl: '#' },
      { id: 'inv_002', number: 'INV-2024-012', date: new Date('2024-12-01'), dueDate: new Date('2024-12-15'), amount: 299000, status: 'paid', downloadUrl: '#' },
      { id: 'inv_003', number: 'INV-2024-011', date: new Date('2024-11-01'), dueDate: new Date('2024-11-15'), amount: 299000, status: 'paid', downloadUrl: '#' }
    ])

    setPaymentMethods([
      { id: 'pm_001', type: 'card', last4: '4242', brand: 'Visa', isDefault: true, expiresAt: '12/26' },
      { id: 'pm_002', type: 'bank', last4: '6789', isDefault: false }
    ])

    setIsLoading(false)
  }

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'starter': return <Zap className="w-6 h-6 text-slate-400" />
      case 'professional': return <Star className="w-6 h-6 text-blue-400" />
      case 'enterprise': return <Crown className="w-6 h-6 text-yellow-400" />
      default: return <Zap className="w-6 h-6" />
    }
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': case 'active': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'overdue': case 'past_due': return 'bg-red-500/20 text-red-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  if (isLoading || !subscription) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Client Billing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-green-400" />
          Billing & Subscription
        </h3>
        <NeuromorphicButton variant="secondary" size="sm" onClick={loadBillingData}>
          <RefreshCw className="w-4 h-4 mr-1" />
          Refresh
        </NeuromorphicButton>
      </div>

      {/* Current Plan */}
      <NeuromorphicCard variant="glow" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              {getPlanIcon(subscription.plan)}
            </div>
            <div>
              <p className="text-slate-400 text-sm">Plan Actual</p>
              <h2 className="text-2xl font-bold text-white capitalize">{subscription.plan}</h2>
              <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusStyle(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-white">{formatCurrency(subscription.amount)}</p>
            <p className="text-slate-400 text-sm">/{subscription.interval === 'monthly' ? 'mes' : 'año'}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
          <div>
            <p className="text-slate-400 text-xs">Usuarios</p>
            <p className="text-white font-medium">{subscription.users.current} / {subscription.users.max}</p>
          </div>
          <div>
            <p className="text-slate-400 text-xs">Próximo Cobro</p>
            <p className="text-white font-medium">{subscription.currentPeriodEnd.toLocaleDateString()}</p>
          </div>
          <div className="text-right">
            <NeuromorphicButton variant="primary" size="sm">
              <TrendingUp className="w-4 h-4 mr-1" />
              Upgrade
            </NeuromorphicButton>
          </div>
        </div>
      </NeuromorphicCard>

      <div className="grid grid-cols-2 gap-4">
        {/* Invoices */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2">
            <FileText className="w-4 h-4 text-slate-400" />
            Facturas Recientes
          </h4>
          <div className="space-y-2">
            {invoices.map(invoice => (
              <div key={invoice.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div>
                  <span className="text-white text-sm">{invoice.number}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-slate-500">{invoice.date.toLocaleDateString()}</span>
                    <span className={`text-xs px-2 py-0.5 rounded capitalize ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-white font-medium">{formatCurrency(invoice.amount)}</span>
                  <button className="p-1 hover:bg-slate-700 rounded" aria-label="Descargar">
                    <Download className="w-4 h-4 text-blue-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </NeuromorphicCard>

        {/* Payment Methods */}
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-white font-medium flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-slate-400" />
              Métodos de Pago
            </h4>
            <NeuromorphicButton variant="secondary" size="sm">
              Agregar
            </NeuromorphicButton>
          </div>
          <div className="space-y-2">
            {paymentMethods.map(pm => (
              <div key={pm.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <span className="text-white text-sm">
                      {pm.type === 'card' ? `${pm.brand} •••• ${pm.last4}` : `Banco •••• ${pm.last4}`}
                    </span>
                    {pm.expiresAt && (
                      <p className="text-xs text-slate-500">Exp: {pm.expiresAt}</p>
                    )}
                  </div>
                </div>
                {pm.isDefault && (
                  <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      </div>
    </div>
  )
}

export default ClientBilling
