'use client'

/**
 * 💰 SILEXAR PULSE - Billing & Invoicing
 * Sistema de facturación y cobros
 * 
 * @description Gestión financiera:
 * - Facturas automáticas
 * - Historial de pagos
 * - Cobros pendientes
 * - Reportes financieros
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton 
} from '@/components/ui/neuromorphic'
import {
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Send,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Building2,
  Calendar,
  Plus,
  Eye,
  RefreshCw
} from 'lucide-react'

interface Invoice {
  id: string
  number: string
  tenantId: string
  tenantName: string
  amount: number
  currency: string
  status: 'paid' | 'pending' | 'overdue' | 'draft'
  issuedDate: Date
  dueDate: Date
  paidDate?: Date
  items: {
    description: string
    quantity: number
    unitPrice: number
  }[]
}

interface PaymentMethod {
  id: string
  tenantId: string
  type: 'card' | 'bank' | 'paypal'
  last4: string
  expiryDate?: string
  isDefault: boolean
}

export function BillingInvoicing() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    loadBillingData()
  }, [])

  const loadBillingData = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setInvoices([
      {
        id: 'inv_001',
        number: 'INV-2024-001',
        tenantId: 'tenant_001',
        tenantName: 'RDF Media',
        amount: 4500,
        currency: 'USD',
        status: 'paid',
        issuedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        items: [
          { description: 'Plan Enterprise - Mensual', quantity: 1, unitPrice: 3500 },
          { description: 'Usuarios adicionales (10)', quantity: 10, unitPrice: 100 }
        ]
      },
      {
        id: 'inv_002',
        number: 'INV-2024-002',
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa Chile',
        amount: 8500,
        currency: 'USD',
        status: 'paid',
        issuedDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        paidDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
        items: [
          { description: 'Plan Enterprise Plus - Mensual', quantity: 1, unitPrice: 7000 },
          { description: 'API Premium Access', quantity: 1, unitPrice: 1500 }
        ]
      },
      {
        id: 'inv_003',
        number: 'INV-2024-003',
        tenantId: 'tenant_003',
        tenantName: 'Mega Media',
        amount: 2800,
        currency: 'USD',
        status: 'overdue',
        issuedDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        items: [
          { description: 'Plan Professional - Mensual', quantity: 1, unitPrice: 2000 },
          { description: 'Soporte Premium', quantity: 1, unitPrice: 800 }
        ]
      },
      {
        id: 'inv_004',
        number: 'INV-2024-004',
        tenantId: 'tenant_001',
        tenantName: 'RDF Media',
        amount: 4500,
        currency: 'USD',
        status: 'pending',
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        items: [
          { description: 'Plan Enterprise - Mensual', quantity: 1, unitPrice: 3500 },
          { description: 'Usuarios adicionales (10)', quantity: 10, unitPrice: 100 }
        ]
      },
      {
        id: 'inv_005',
        number: 'INV-2024-005',
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa Chile',
        amount: 8500,
        currency: 'USD',
        status: 'draft',
        issuedDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        items: [
          { description: 'Plan Enterprise Plus - Mensual', quantity: 1, unitPrice: 7000 },
          { description: 'API Premium Access', quantity: 1, unitPrice: 1500 }
        ]
      }
    ])

    setIsLoading(false)
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500/20 text-green-400'
      case 'pending': return 'bg-yellow-500/20 text-yellow-400'
      case 'overdue': return 'bg-red-500/20 text-red-400'
      case 'draft': return 'bg-slate-500/20 text-slate-400'
      default: return 'bg-slate-500/20 text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-400" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />
      case 'overdue': return <AlertTriangle className="w-4 h-4 text-red-400" />
      case 'draft': return <FileText className="w-4 h-4 text-slate-400" />
      default: return <FileText className="w-4 h-4 text-slate-400" />
    }
  }

  const sendInvoice = (invoice: Invoice) => {
    
    alert(`Factura ${invoice.number} enviada a ${invoice.tenantName}`)
  }

  const markAsPaid = (invoiceId: string) => {
    setInvoices(prev => prev.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'paid', paidDate: new Date() } : inv
    ))
  }

  const filteredInvoices = invoices.filter(inv => 
    statusFilter === 'all' || inv.status === statusFilter
  )

  const totalRevenue = invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + i.amount, 0)
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, i) => sum + i.amount, 0)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando Billing...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          Billing & Invoicing
        </h3>
        <NeuromorphicButton variant="primary" size="sm">
          <Plus className="w-4 h-4 mr-1" />
          Nueva Factura
        </NeuromorphicButton>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-4 bg-green-500/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <span className="text-xs text-green-400">Este Mes</span>
          </div>
          <p className="text-2xl font-bold text-white">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Recaudado</p>
        </div>
        <div className="p-4 bg-yellow-500/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            <span className="text-xs text-yellow-400">{invoices.filter(i => i.status === 'pending').length}</span>
          </div>
          <p className="text-2xl font-bold text-white">${pendingAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Pendiente</p>
        </div>
        <div className="p-4 bg-red-500/10 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-xs text-red-400">{invoices.filter(i => i.status === 'overdue').length}</span>
          </div>
          <p className="text-2xl font-bold text-white">${overdueAmount.toLocaleString()}</p>
          <p className="text-xs text-slate-400">Vencido</p>
        </div>
        <div className="p-4 bg-slate-800/50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-white">{invoices.length}</p>
          <p className="text-xs text-slate-400">Total Facturas</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        {['all', 'paid', 'pending', 'overdue', 'draft'].map(status => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-all ${
              statusFilter === status 
                ? 'bg-green-600 text-white' 
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {status === 'all' ? 'Todas' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {/* Invoices List */}
      <div className="space-y-3">
        {filteredInvoices.map(invoice => (
          <NeuromorphicCard 
            key={invoice.id}
            variant="embossed" 
            className={`p-4 cursor-pointer hover:border-green-500/30 transition-all ${
              selectedInvoice?.id === invoice.id ? 'ring-1 ring-green-500/50' : ''
            }`}
            onClick={() => setSelectedInvoice(invoice)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {getStatusIcon(invoice.status)}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{invoice.number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <Building2 className="w-3 h-3" />
                    <span>{invoice.tenantName}</span>
                    <span>•</span>
                    <Calendar className="w-3 h-3" />
                    <span>Vence: {invoice.dueDate.toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xl font-bold text-white">
                    ${invoice.amount.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500">{invoice.currency}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    onClick={(e) => { e.stopPropagation(); sendInvoice(invoice); }}
                    className="p-1.5 text-slate-400 hover:text-blue-400"
                    title="Enviar"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button 
                    className="p-1.5 text-slate-400 hover:text-green-400"
                    title="Descargar"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  {invoice.status === 'pending' && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsPaid(invoice.id); }}
                      className="p-1.5 text-slate-400 hover:text-green-400"
                      title="Marcar como pagada"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </NeuromorphicCard>
        ))}
      </div>

      {/* Invoice Detail */}
      {selectedInvoice && (
        <NeuromorphicCard variant="glow" className="p-6">
          <h4 className="text-white font-bold mb-4 flex items-center gap-2">
            <Eye className="w-4 h-4 text-green-400" />
            Detalle: {selectedInvoice.number}
          </h4>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-slate-400">Cliente</p>
                <p className="text-white">{selectedInvoice.tenantName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Emitida</p>
                <p className="text-white">{selectedInvoice.issuedDate.toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Vencimiento</p>
                <p className="text-white">{selectedInvoice.dueDate.toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-slate-400">
                    <th className="text-left pb-2">Descripción</th>
                    <th className="text-center pb-2">Cantidad</th>
                    <th className="text-right pb-2">Precio Unit.</th>
                    <th className="text-right pb-2">Total</th>
                  </tr>
                </thead>
                <tbody className="text-white">
                  {selectedInvoice.items.map((item, i) => (
                    <tr key={i}>
                      <td className="py-2">{item.description}</td>
                      <td className="text-center py-2">{item.quantity}</td>
                      <td className="text-right py-2">${item.unitPrice}</td>
                      <td className="text-right py-2">${item.quantity * item.unitPrice}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-slate-700">
                    <td colSpan={3} className="text-right pt-3 font-bold">Total:</td>
                    <td className="text-right pt-3 font-bold text-green-400">${selectedInvoice.amount}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </NeuromorphicCard>
      )}
    </div>
  )
}

export default BillingInvoicing
