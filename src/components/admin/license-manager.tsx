'use client'

/**
 * ðŸ“‹ SILEXAR PULSE - License Manager
 * Complete license management with expiration tracking
 * 
 * @description Manages client licenses with:
 * - Expiration tracking and alerts
 * - Renewal workflow
 * - License status overview
 * - CEO and client notifications
 * 
 * @version 2025.3.0
 * @tier TIER_0_FORTUNE_10
 * 
 * @last_modified 2025-04-27 - Migrated to AdminDesignSystem pattern
 */

import { useState, useEffect } from 'react'
import { N, NeuCard, NeuButton, StatusBadge, getShadow } from './_sdk/AdminDesignSystem'
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
        return <StatusBadge status="success" label="Activa" />
      case 'expiring_soon':
        return (
          <StatusBadge
            status={daysRemaining <= 7 ? "danger" : "warning"}
            label={`${daysRemaining} días`}
          />
        )
      case 'expired':
        return <StatusBadge status="danger" label="Expirada" />
      case 'suspended':
        return <StatusBadge status="warning" label="Suspendida" />
    }
  }

  const getPlanBadge = (plan: License['plan']) => {
    const colors: Record<string, string> = {
      starter: '#64748b',
      professional: '#6888ff',
      enterprise: '#6888ff',
      enterprise_plus: '#6888ff'
    }
    const names: Record<string, string> = {
      starter: 'Starter',
      professional: 'Professional',
      enterprise: 'Enterprise',
      enterprise_plus: 'Enterprise+'
    }
    return (
      <span style={{
        padding: '0.125rem 0.5rem',
        fontSize: '0.75rem',
        background: colors[plan],
        color: N.base,
        borderRadius: 4
      }}>
        {names[plan]}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 256 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 48,
            height: 48,
            border: '4px solid #6888ff30',
            borderTopColor: '#6888ff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem'
          }} />
          <p style={{ color: N.textSub }}>Cargando licencias...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Total Licencias</p>
              <p style={{ color: N.text, fontSize: '1.5rem', fontWeight: 700 }}>{licenses.length}</p>
            </div>
            <Shield style={{ width: 32, height: 32, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Activas</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>
                {licenses.filter(l => l.status === 'active').length}
              </p>
            </div>
            <CheckCircle style={{ width: 32, height: 32, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Por Expirar</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>
                {licenses.filter(l => l.status === 'expiring_soon').length}
              </p>
            </div>
            <Clock style={{ width: 32, height: 32, color: '#6888ff' }} />
          </div>
        </NeuCard>

        <NeuCard style={{ boxShadow: getShadow() }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ color: N.textSub, fontSize: '0.75rem', marginBottom: '0.25rem' }}>Expiradas</p>
              <p style={{ color: '#6888ff', fontSize: '1.5rem', fontWeight: 700 }}>
                {licenses.filter(l => l.status === 'expired').length}
              </p>
            </div>
            <XCircle style={{ width: 32, height: 32, color: '#6888ff' }} />
          </div>
        </NeuCard>
      </div>

      {/* Alerts Section */}
      {alerts.length > 0 && (
        <NeuCard style={{ boxShadow: getShadow(), background: '#6888ff15' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell style={{ color: '#6888ff', width: 20, height: 20 }} />
            Alertas de Licencia ({alerts.length})
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {alerts.slice(0, 5).map(alert => (
              <div
                key={alert.licenseId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.75rem',
                  borderRadius: 8,
                  background: alert.type === 'expired' || alert.type === 'expiring_1' ? '#6888ff15' : '#6888ff15',
                  border: `1px solid ${alert.type === 'expired' || alert.type === 'expiring_1' ? '#6888ff50' : '#6888ff50'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <AlertTriangle style={{
                    width: 20,
                    height: 20,
                    color: alert.type === 'expired' || alert.type === 'expiring_1' ? '#6888ff' : '#6888ff'
                  }} />
                  <div>
                    <p style={{
                      color: alert.type === 'expired' || alert.type === 'expiring_1' ? '#6888ff' : '#6888ff',
                      fontWeight: 500
                    }}>
                      {alert.tenantName}
                    </p>
                    <p style={{ color: N.textSub, fontSize: '0.75rem' }}>{alert.message}</p>
                  </div>
                </div>
                <NeuButton
                  variant="secondary"
                  onClick={() => {
                    const license = licenses.find(l => l.id === alert.licenseId)
                    if (license) sendRenewalNotification(license)
                  }}
                >
                  <Mail style={{ width: 16, height: 16, marginRight: 4 }} />
                  Notificar
                </NeuButton>
              </div>
            ))}
          </div>
        </NeuCard>
      )}

      {/* License List */}
      <NeuCard style={{ boxShadow: getShadow() }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ color: N.text, fontSize: '1.125rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Shield style={{ color: '#6888ff', width: 20, height: 20 }} />
            Gestión de Licencias
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 16, height: 16, color: N.textSub }} />
              <input
                type="text"
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                  background: `${N.dark}50`,
                  border: `1px solid ${N.dark}70`,
                  borderRadius: 8,
                  color: N.text,
                  fontSize: '0.875rem',
                  width: 200
                }}
              />
            </div>

            {/* Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', background: `${N.dark}50`, borderRadius: 8, padding: '0.25rem' }}>
              {(['all', 'active', 'expiring', 'expired'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  style={{
                    padding: '0.375rem 0.75rem',
                    fontSize: '0.875rem',
                    borderRadius: 6,
                    border: 'none',
                    cursor: 'pointer',
                    background: filter === f ? '#6888ff' : 'transparent',
                    color: filter === f ? N.base : N.textSub,
                    fontWeight: filter === f ? 600 : 400
                  }}
                >
                  {f === 'all' ? 'Todas' :
                    f === 'active' ? 'Activas' :
                      f === 'expiring' ? 'Por Expirar' : 'Expiradas'}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {filteredLicenses.map(license => (
            <div
              key={license.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '1rem',
                background: `${N.dark}30`,
                borderRadius: 8,
                border: `1px solid ${N.dark}50`
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: license.status === 'active' ? '#6888ff20' :
                    license.status === 'expiring_soon' ? '#6888ff20' :
                      '#6888ff20'
                }}>
                  <Building2 style={{
                    width: 24,
                    height: 24,
                    color: license.status === 'active' ? '#6888ff' :
                      license.status === 'expiring_soon' ? '#6888ff' :
                        '#6888ff'
                  }} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ color: N.text, fontWeight: 500 }}>{license.tenantName}</span>
                    {getPlanBadge(license.plan)}
                    {getStatusBadge(license.status, license.daysRemaining)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '0.75rem', color: N.textSub }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Calendar style={{ width: 12, height: 12 }} />
                      Expira: {license.expirationDate.toLocaleDateString()}
                    </span>
                    <span>
                      ${license.monthlyValue.toLocaleString()}/mes
                    </span>
                    {license.autoRenewal && (
                      <span style={{ color: '#6888ff' }}>ðŸ”„ Auto-renovación</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {license.status !== 'active' && (
                  <NeuButton
                    variant="primary"
                    onClick={() => renewLicense(license.id, 12)}
                  >
                    <RefreshCw style={{ width: 16, height: 16, marginRight: 4 }} />
                    Renovar
                  </NeuButton>
                )}
                <NeuButton
                  variant="secondary"
                  onClick={() => sendRenewalNotification(license)}
                >
                  <Mail style={{ width: 16, height: 16, marginRight: 4 }} />
                  Notificar
                </NeuButton>
                {license.status !== 'suspended' && license.status !== 'expired' && (
                  <NeuButton
                    variant="secondary"
                    onClick={() => suspendLicense(license.id)}
                  >
                    Suspender
                  </NeuButton>
                )}
              </div>
            </div>
          ))}
        </div>
      </NeuCard>
    </div>
  )
}

export default LicenseManager
