'use client'

/**
 * 📋 SILEXAR PULSE - License Manager
 * Complete license management with expiration tracking
 * 
 * @description Manages client licenses with:
 * - Expiration tracking and alerts
 * - Renewal workflow
 * - License status overview
 * - CEO and client notifications
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { 
  NeuromorphicCard, 
  NeuromorphicButton, 
  NeuromorphicStatus,
  NeuromorphicGrid
} from '@/components/ui/neuromorphic'
import {
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  Mail,
  Calendar,
  Building2,
  Bell,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react'

interface License {
  id: string
  tenantId: string
  tenantName: string
  plan: 'starter' | 'professional' | 'enterprise' | 'enterprise_plus'
  status: 'active' | 'expiring_soon' | 'expired' | 'suspended'
  startDate: Date
  expirationDate: Date
  daysRemaining: number
  autoRenewal: boolean
  lastNotificationSent?: Date
  contactEmail: string
  monthlyValue: number
}

interface LicenseAlert {
  licenseId: string
  tenantName: string
  type: 'expiring_30' | 'expiring_15' | 'expiring_7' | 'expiring_1' | 'expired'
  message: string
  timestamp: Date
  acknowledged: boolean
}

export function LicenseManager() {
  const [licenses, setLicenses] = useState<License[]>([])
  const [alerts, setAlerts] = useState<LicenseAlert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'expiring' | 'expired' | 'active'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadLicenses()
  }, [])

  const loadLicenses = async () => {
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))

    // Demo licenses with various states
    const demoLicenses: License[] = [
      {
        id: 'lic_001',
        tenantId: 'tenant_001',
        tenantName: 'RDF Media',
        plan: 'enterprise',
        status: 'active',
        startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 275 * 24 * 60 * 60 * 1000),
        daysRemaining: 275,
        autoRenewal: true,
        contactEmail: 'admin@rdfmedia.com',
        monthlyValue: 599000
      },
      {
        id: 'lic_002',
        tenantId: 'tenant_002',
        tenantName: 'Grupo Prisa Chile',
        plan: 'enterprise_plus',
        status: 'active',
        startDate: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 185 * 24 * 60 * 60 * 1000),
        daysRemaining: 185,
        autoRenewal: true,
        contactEmail: 'it@grupoprisachile.com',
        monthlyValue: 999000
      },
      {
        id: 'lic_003',
        tenantId: 'tenant_003',
        tenantName: 'Mega Media',
        plan: 'professional',
        status: 'expiring_soon',
        startDate: new Date(Date.now() - 350 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        daysRemaining: 15,
        autoRenewal: false,
        lastNotificationSent: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        contactEmail: 'contacto@megamedia.cl',
        monthlyValue: 299000
      },
      {
        id: 'lic_004',
        tenantId: 'tenant_004',
        tenantName: 'Radio Cooperativa',
        plan: 'enterprise',
        status: 'expiring_soon',
        startDate: new Date(Date.now() - 358 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        daysRemaining: 7,
        autoRenewal: false,
        lastNotificationSent: new Date(),
        contactEmail: 'sistemas@cooperativa.cl',
        monthlyValue: 599000
      },
      {
        id: 'lic_005',
        tenantId: 'tenant_005',
        tenantName: 'Tele13 Digital',
        plan: 'starter',
        status: 'expired',
        startDate: new Date(Date.now() - 395 * 24 * 60 * 60 * 1000),
        expirationDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        daysRemaining: -5,
        autoRenewal: false,
        contactEmail: 'admin@tele13.cl',
        monthlyValue: 99000
      }
    ]

    setLicenses(demoLicenses)

    // Generate alerts based on license status
    const generatedAlerts: LicenseAlert[] = demoLicenses
      .filter(lic => lic.daysRemaining <= 30)
      .map(lic => ({
        licenseId: lic.id,
        tenantName: lic.tenantName,
        type: lic.daysRemaining <= 0 ? 'expired' :
              lic.daysRemaining <= 1 ? 'expiring_1' :
              lic.daysRemaining <= 7 ? 'expiring_7' :
              lic.daysRemaining <= 15 ? 'expiring_15' : 'expiring_30',
        message: lic.daysRemaining <= 0 
          ? `Licencia expirada hace ${Math.abs(lic.daysRemaining)} días`
          : `Licencia expira en ${lic.daysRemaining} días`,
        timestamp: new Date(),
        acknowledged: false
      }))

    setAlerts(generatedAlerts)
    setIsLoading(false)
  }

  const sendRenewalNotification = async (license: License) => {
    // Simulate sending email

    setLicenses(prev => prev.map(lic => 
      lic.id === license.id 
        ? { ...lic, lastNotificationSent: new Date() }
        : lic
    ))
  }

  const renewLicense = async (licenseId: string, months: number) => {
    setLicenses(prev => prev.map(lic => {
      if (lic.id === licenseId) {
        const newExpiration = new Date(
          Math.max(lic.expirationDate.getTime(), Date.now()) + 
          months * 30 * 24 * 60 * 60 * 1000
        )
        return {
          ...lic,
          expirationDate: newExpiration,
          daysRemaining: Math.ceil((newExpiration.getTime() - Date.now()) / (24 * 60 * 60 * 1000)),
          status: 'active' as const
        }
      }
      return lic
    }))
  }

  const suspendLicense = (licenseId: string) => {
    setLicenses(prev => prev.map(lic => 
      lic.id === licenseId 
        ? { ...lic, status: 'suspended' as const }
        : lic
    ))
  }

  const filteredLicenses = licenses.filter(lic => {
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'expiring' ? lic.status === 'expiring_soon' :
      filter === 'expired' ? lic.status === 'expired' || lic.status === 'suspended' :
      lic.status === 'active'
    
    const matchesSearch = lic.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
    
    return matchesFilter && matchesSearch
  })

  const getStatusBadge = (status: License['status'], daysRemaining: number) => {
    switch (status) {
      case 'active':
        return <span className="px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">Activa</span>
      case 'expiring_soon':
        return (
          <span className={`px-2 py-1 text-xs rounded-full ${
            daysRemaining <= 7 
              ? 'bg-red-500/20 text-red-400' 
              : 'bg-yellow-500/20 text-yellow-400'
          }`}>
            {daysRemaining} días
          </span>
        )
      case 'expired':
        return <span className="px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">Expirada</span>
      case 'suspended':
        return <span className="px-2 py-1 text-xs bg-slate-500/20 text-slate-400 rounded-full">Suspendida</span>
    }
  }

  const getPlanBadge = (plan: License['plan']) => {
    const colors = {
      starter: 'bg-slate-600',
      professional: 'bg-blue-600',
      enterprise: 'bg-purple-600',
      enterprise_plus: 'bg-gradient-to-r from-yellow-500 to-orange-600'
    }
    const names = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
      enterprise_plus: 'Enterprise+'
    }
    return (
      <span className={`px-2 py-0.5 text-xs ${colors[plan]} text-white rounded`}>
        {names[plan]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando licencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <NeuromorphicGrid columns={4} gap="md">
        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Total Licencias</p>
              <p className="text-2xl font-bold text-white">{licenses.length}</p>
            </div>
            <Shield className="w-8 h-8 text-blue-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Activas</p>
              <p className="text-2xl font-bold text-green-400">
                {licenses.filter(l => l.status === 'active').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Por Expirar</p>
              <p className="text-2xl font-bold text-yellow-400">
                {licenses.filter(l => l.status === 'expiring_soon').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </NeuromorphicCard>

        <NeuromorphicCard variant="embossed" className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-400 mb-1">Expiradas</p>
              <p className="text-2xl font-bold text-red-400">
                {licenses.filter(l => l.status === 'expired').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-red-400" />
          </div>
        </NeuromorphicCard>
      </NeuromorphicGrid>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <NeuromorphicCard variant="glow" className="p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-orange-400" />
            Alertas de Licencia ({alerts.length})
          </h3>
          <div className="space-y-2">
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.licenseId}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  alert.type === 'expired' || alert.type === 'expiring_1'
                    ? 'bg-red-500/10 border border-red-500/30'
                    : 'bg-yellow-500/10 border border-yellow-500/30'
                }`}
              >
                <div className="flex items-center gap-3">
                  <AlertTriangle className={`w-5 h-5 ${
                    alert.type === 'expired' || alert.type === 'expiring_1'
                      ? 'text-red-400'
                      : 'text-yellow-400'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      alert.type === 'expired' || alert.type === 'expiring_1'
                        ? 'text-red-400'
                        : 'text-yellow-400'
                    }`}>
                      {alert.tenantName}
                    </p>
                    <p className="text-xs text-slate-400">{alert.message}</p>
                  </div>
                </div>
                <NeuromorphicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const license = licenses.find(l => l.id === alert.licenseId)
                    if (license) sendRenewalNotification(license)
                  }}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Notificar
                </NeuromorphicButton>
              </div>
            ))}
          </div>
        </NeuromorphicCard>
      )}

      {/* License List */}
      <NeuromorphicCard variant="embossed" className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-blue-400" />
            Gestión de Licencias
          </h3>
          
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-1 bg-slate-800 rounded-lg p-1">
              {(['all', 'active', 'expiring', 'expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1 text-sm rounded ${
                    filter === f 
                      ? 'bg-blue-600 text-white' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {f === 'all' ? 'Todas' : 
                   f === 'active' ? 'Activas' : 
                   f === 'expiring' ? 'Por Expirar' : 'Expiradas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredLicenses.map(license => (
            <div 
              key={license.id}
              className="flex items-center justify-between p-4 bg-slate-800/30 rounded-lg border border-slate-700/50"
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  license.status === 'active' ? 'bg-green-600/20' :
                  license.status === 'expiring_soon' ? 'bg-yellow-600/20' :
                  'bg-red-600/20'
                }`}>
                  <Building2 className={`w-6 h-6 ${
                    license.status === 'active' ? 'text-green-400' :
                    license.status === 'expiring_soon' ? 'text-yellow-400' :
                    'text-red-400'
                  }`} />
                </div>
                
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-medium">{license.tenantName}</span>
                    {getPlanBadge(license.plan)}
                    {getStatusBadge(license.status, license.daysRemaining)}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Expira: {license.expirationDate.toLocaleDateString()}
                    </span>
                    <span>
                      ${license.monthlyValue.toLocaleString()}/mes
                    </span>
                    {license.autoRenewal && (
                      <span className="text-green-400">🔄 Auto-renovación</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {license.status !== 'active' && (
                  <NeuromorphicButton
                    variant="success"
                    size="sm"
                    onClick={() => renewLicense(license.id, 12)}
                  >
                    <RefreshCw className="w-4 h-4 mr-1" />
                    Renovar
                  </NeuromorphicButton>
                )}
                <NeuromorphicButton
                  variant="secondary"
                  size="sm"
                  onClick={() => sendRenewalNotification(license)}
                >
                  <Mail className="w-4 h-4 mr-1" />
                  Notificar
                </NeuromorphicButton>
                {license.status !== 'suspended' && license.status !== 'expired' && (
                  <NeuromorphicButton
                    variant="danger"
                    size="sm"
                    onClick={() => suspendLicense(license.id)}
                  >
                    Suspender
                  </NeuromorphicButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuromorphicCard>
    </div>
  )
}

export default LicenseManager
