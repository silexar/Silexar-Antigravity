'use client'

/**
 * ðŸŽ¨ SILEXAR PULSE - Branding Settings (Client)
 * White-label y personalización de marca
 * 
 * @description Branding:
 * - Logo y colores
 * - Dominio personalizado
 * - Email templates
 * - Landing pages
 * 
 * @version 2025.1.0
 * @tier CLIENT_ADMIN
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Palette,
  Image,
  Globe,
  Save,
  Upload,
  RefreshCw,
  Mail,
  Eye,
  Check
} from 'lucide-react'

interface BrandingConfig {
  logo: {
    primary: string
    secondary: string
    favicon: string
  }
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  domain: {
    custom: string
    subdomain: string
    sslEnabled: boolean
  }
  emailFrom: {
    name: string
    email: string
  }
  metadata: {
    companyName: string
    tagline: string
    supportEmail: string
  }
}

export function BrandingSettings() {
  const [config, setConfig] = useState<BrandingConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    loadConfig()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadConfig = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setConfig({
      logo: {
        primary: '/logos/company-logo.png',
        secondary: '/logos/company-logo-white.png',
        favicon: '/logos/favicon.ico'
      },
      colors: {
        primary: '#6888ff',
        secondary: '#6888ff',
        accent: '#6888ff',
        background: '#0f172a'
      },
      domain: {
        custom: 'app.miempresa.com',
        subdomain: 'miempresa',
        sslEnabled: true
      },
      emailFrom: {
        name: 'Mi Empresa',
        email: 'noreply@miempresa.com'
      },
      metadata: {
        companyName: 'Mi Empresa S.A.',
        tagline: 'Tu socio digital',
        supportEmail: 'soporte@miempresa.com'
      }
    })

    setIsLoading(false)
  }

  const updateConfig = (path: string, value: string) => {
    if (!config) return

    const keys = path.split('.')
    const newConfig = { ...config }
    let current: Record<string, unknown> = newConfig

    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]] as Record<string, unknown>
    }
    current[keys[keys.length - 1]] = value

    setConfig(newConfig as BrandingConfig)
    setHasChanges(true)
  }

  const saveConfig = () => {
    setHasChanges(false)
    alert('Configuración de marca guardada!')
  }

  if (isLoading || !config) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Branding Settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Palette className="w-5 h-5 text-[#6888ff]" />
          Branding & White-Label
        </h3>
        <div className="flex items-center gap-2">
          <NeuButton variant="secondary" >
            <Eye className="w-4 h-4 mr-1" />
            Preview
          </NeuButton>
          <NeuButton variant="primary" onClick={saveConfig} disabled={!hasChanges}>
            <Save className="w-4 h-4 mr-1" />
            Guardar
          </NeuButton>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Logo Settings */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Image className="w-4 h-4 text-[#9aa3b8]" />
            Logos
          </h4>
          <div className="space-y-4">
            <div>
              <label className="text-[#9aa3b8] text-xs">Logo Principal</label>
              <div className="mt-1 p-4 bg-[#dfeaff]/50 rounded-lg flex items-center justify-between">
                <div className="w-32 h-12 bg-[#dfeaff] rounded flex items-center justify-center text-[#9aa3b8] text-xs">
                  Logo Preview
                </div>
                <NeuButton variant="secondary" >
                  <Upload className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>
            <div>
              <label className="text-[#9aa3b8] text-xs">Favicon</label>
              <div className="mt-1 p-4 bg-[#dfeaff]/50 rounded-lg flex items-center justify-between">
                <div className="w-8 h-8 bg-[#dfeaff] rounded flex items-center justify-center text-[#9aa3b8] text-xs">
                  32x32
                </div>
                <NeuButton variant="secondary" >
                  <Upload className="w-4 h-4" />
                </NeuButton>
              </div>
            </div>
          </div>
        </NeuCard>

        {/* Color Scheme */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#9aa3b8]" />
            Esquema de Colores
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(config.colors).map(([key, value]) => (
              <div key={key}>
                <label className="text-[#9aa3b8] text-xs capitalize">{key}</label>
                <div className="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => updateConfig(`colors.${key}`, e.target.value)}
                    className="w-10 h-10 rounded border-0 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => updateConfig(`colors.${key}`, e.target.value)}
                    className="flex-1 px-2 py-1 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c] text-sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </NeuCard>

        {/* Domain Settings */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#9aa3b8]" />
            Dominio Personalizado
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[#9aa3b8] text-xs">Subdominio</label>
              <div className="mt-1 flex items-center">
                <input
                  type="text"
                  value={config.domain.subdomain}
                  onChange={(e) => updateConfig('domain.subdomain', e.target.value)}
                  className="flex-1 px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded-l text-[#69738c]"
                />
                <span className="px-3 py-2 bg-[#dfeaff] text-[#9aa3b8] rounded-r">.silexar.app</span>
              </div>
            </div>
            <div>
              <label className="text-[#9aa3b8] text-xs">Dominio Personalizado</label>
              <input
                type="text"
                value={config.domain.custom}
                onChange={(e) => updateConfig('domain.custom', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
                placeholder="app.tudominio.com"
              />
            </div>
            <div className="flex items-center justify-between p-2 bg-[#dfeaff]/50 rounded">
              <span className="text-[#69738c] text-sm">SSL Habilitado</span>
              <span className="flex items-center gap-1 text-[#6888ff] text-xs">
                <Check className="w-4 h-4" />
                Activo
              </span>
            </div>
          </div>
        </NeuCard>

        {/* Email Settings */}
        <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1rem', background: N.base }}>
          <h4 className="text-[#69738c] font-medium mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#9aa3b8]" />
            Configuración de Email
          </h4>
          <div className="space-y-3">
            <div>
              <label className="text-[#9aa3b8] text-xs">Nombre del Remitente</label>
              <input
                type="text"
                value={config.emailFrom.name}
                onChange={(e) => updateConfig('emailFrom.name', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
              />
            </div>
            <div>
              <label className="text-[#9aa3b8] text-xs">Email del Remitente</label>
              <input
                type="email"
                value={config.emailFrom.email}
                onChange={(e) => updateConfig('emailFrom.email', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
              />
            </div>
            <div>
              <label className="text-[#9aa3b8] text-xs">Email de Soporte</label>
              <input
                type="email"
                value={config.metadata.supportEmail}
                onChange={(e) => updateConfig('metadata.supportEmail', e.target.value)}
                className="mt-1 w-full px-3 py-2 bg-[#dfeaff] border border-slate-700 rounded text-[#69738c]"
              />
            </div>
          </div>
        </NeuCard>
      </div>
    </div>
  )
}

export default BrandingSettings