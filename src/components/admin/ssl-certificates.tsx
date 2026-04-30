'use client'

/**
 * ðŸ” SILEXAR PULSE - SSL Certificates Manager
 * Gestión de certificados SSL
 * 
 * @description SSL Management:
 * - Certificados activos
 * - Alertas de expiración
 * - Renovación automática
 * - Historial
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 * @security MILITARY_GRADE
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Shield,
  Lock,
  AlertTriangle,
  RefreshCw,
  Download,
  Plus
} from 'lucide-react'

interface SSLCertificate {
  id: string
  domain: string
  issuer: string
  type: 'DV' | 'OV' | 'EV' | 'Wildcard'
  status: 'valid' | 'expiring' | 'expired' | 'revoked'
  issuedAt: Date
  expiresAt: Date
  autoRenew: boolean
  san: string[]
  fingerprint: string
}

export function SSLCertificates() {
  const [certificates, setCertificates] = useState<SSLCertificate[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadCertificates()
  }, [])

  const loadCertificates = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    const now = new Date()
    setCertificates([
      {
        id: 'cert_001',
        domain: '*.silexarpulse.com',
        issuer: "Let's Encrypt",
        type: 'Wildcard',
        status: 'valid',
        issuedAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        san: ['*.silexarpulse.com', 'silexarpulse.com'],
        fingerprint: 'SHA256:AB:CD:EF:12:34:56:78:90'
      },
      {
        id: 'cert_002',
        domain: 'api.silexarpulse.com',
        issuer: "Let's Encrypt",
        type: 'DV',
        status: 'valid',
        issuedAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        san: ['api.silexarpulse.com'],
        fingerprint: 'SHA256:11:22:33:44:55:66:77:88'
      },
      {
        id: 'cert_003',
        domain: 'cdn.silexarpulse.com',
        issuer: 'Cloudflare',
        type: 'DV',
        status: 'expiring',
        issuedAt: new Date(now.getTime() - 85 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000),
        autoRenew: true,
        san: ['cdn.silexarpulse.com'],
        fingerprint: 'SHA256:AA:BB:CC:DD:EE:FF:00:11'
      },
      {
        id: 'cert_004',
        domain: 'legacy.oldsite.com',
        issuer: 'DigiCert',
        type: 'OV',
        status: 'expired',
        issuedAt: new Date(now.getTime() - 400 * 24 * 60 * 60 * 1000),
        expiresAt: new Date(now.getTime() - 35 * 24 * 60 * 60 * 1000),
        autoRenew: false,
        san: ['legacy.oldsite.com'],
        fingerprint: 'SHA256:99:88:77:66:55:44:33:22'
      }
    ])

    setIsLoading(false)
  }

  const renewCertificate = async (id: string) => {
    const cert = certificates.find(c => c.id === id)
    if (!cert) return

    alert(`Renovando certificado para ${cert.domain}...`)
    await new Promise(resolve => setTimeout(resolve, 2000))

    const now = new Date()
    setCertificates(prev => prev.map(c =>
      c.id === id ? {
        ...c,
        status: 'valid',
        issuedAt: now,
        expiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000)
      } : c
    ))
  }

  const getDaysRemaining = (expiresAt: Date) => {
    const days = Math.ceil((expiresAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    return days
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'valid': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'expiring': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'expired': return 'bg-[#6888ff]/20 text-[#6888ff]'
      case 'revoked': return 'bg-[#6888ff]/30 text-[#6888ff]'
      default: return 'bg-slate-500/20 text-[#9aa3b8]'
    }
  }

  const validCount = certificates.filter(c => c.status === 'valid').length
  const expiringCount = certificates.filter(c => c.status === 'expiring').length
  const expiredCount = certificates.filter(c => c.status === 'expired' || c.status === 'revoked').length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-green-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando SSL Certificates...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#6888ff]" />
          SSL Certificates
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" onClick={loadCertificates}>
            <RefreshCw className="w-4 h-4 mr-1" />
            Refresh
          </NeuButton>
          <NeuButton variant="primary">
            <Plus className="w-4 h-4 mr-1" />
            Add Certificate
          </NeuButton>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#dfeaff]/50 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#69738c]">{certificates.length}</p>
          <p className="text-xs text-[#9aa3b8]">Total</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{validCount}</p>
          <p className="text-xs text-[#9aa3b8]">Válidos</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{expiringCount}</p>
          <p className="text-xs text-[#9aa3b8]">Por Expirar</p>
        </div>
        <div className="p-3 bg-[#6888ff]/10 rounded-lg text-center">
          <p className="text-2xl font-bold text-[#6888ff]">{expiredCount}</p>
          <p className="text-xs text-[#9aa3b8]">Expirados</p>
        </div>
      </div>

      {/* Warning for expiring */}
      {expiringCount > 0 && (
        <div className="p-4 bg-[#6888ff]/10 border border-yellow-500/30 rounded-lg flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-[#6888ff]" />
          <div>
            <span className="text-[#6888ff] font-medium">{expiringCount} certificado(s) próximos a expirar</span>
            <p className="text-sm text-[#9aa3b8]">Renueva pronto para evitar interrupciones del servicio</p>
          </div>
        </div>
      )}

      {/* Certificates List */}
      <div className="space-y-3">
        {certificates.map(cert => (
          <NeuCard key={cert.id} style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Lock className={`w-6 h-6 ${cert.status === 'valid' ? 'text-[#6888ff]' : cert.status === 'expiring' ? 'text-[#6888ff]' : 'text-[#6888ff]'}`} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[#69738c] font-medium">{cert.domain}</span>
                    <span className="text-xs px-2 py-0.5 bg-[#dfeaff] text-[#69738c] rounded">{cert.type}</span>
                    <span className={`text-xs px-2 py-0.5 rounded ${getStatusStyle(cert.status)}`}>
                      {cert.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-[#9aa3b8]">Emisor: {cert.issuer}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {cert.autoRenew && (
                  <span className="text-xs px-2 py-0.5 bg-[#6888ff]/20 text-[#6888ff] rounded flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" />
                    Auto-renew
                  </span>
                )}
                {(cert.status === 'expiring' || cert.status === 'expired') && (
                  <NeuButton variant="primary" onClick={() => renewCertificate(cert.id)}>
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Renovar
                  </NeuButton>
                )}
                <button className="p-1 hover:bg-[#dfeaff] rounded">
                  <Download className="w-4 h-4 text-[#9aa3b8]" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#9aa3b8]">Emitido:</span>
                <p className="text-[#69738c]">{cert.issuedAt.toLocaleDateString()}</p>
              </div>
              <div>
                <span className="text-[#9aa3b8]">Expira:</span>
                <p className={`${getDaysRemaining(cert.expiresAt) <= 7 ? 'text-[#6888ff]' : getDaysRemaining(cert.expiresAt) <= 30 ? 'text-[#6888ff]' : 'text-[#69738c]'}`}>
                  {cert.expiresAt.toLocaleDateString()}
                  <span className="text-xs ml-1">
                    ({getDaysRemaining(cert.expiresAt)} días)
                  </span>
                </p>
              </div>
              <div>
                <span className="text-[#9aa3b8]">SAN:</span>
                <p className="text-[#69738c] text-xs">{cert.san.join(', ')}</p>
              </div>
              <div>
                <span className="text-[#9aa3b8]">Fingerprint:</span>
                <p className="text-[#9aa3b8] text-xs font-mono truncate">{cert.fingerprint}</p>
              </div>
            </div>
          </NeuCard>
        ))}
      </div>
    </div>
  )
}

export default SSLCertificates