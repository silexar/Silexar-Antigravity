'use client'

/**
 * š™ï¸ SILEXAR PULSE - Configuration Manager
 * Configuración centralizada del sistema
 * 
 * @description Gestión completa de configuración:
 * - Parámetros del sistema
 * - Variables de entorno
 * - Configuración por tenant
 * - Historial de cambios
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect } from 'react'
import { N, getShadow, getSmallShadow, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  Settings,
  Save,
  RefreshCw,
  Search,
  History,
  Lock,
  Globe,
  Database,
  Mail,
  Bell,
  Shield,
  Zap,
  ChevronDown,
  ChevronRight,
  Check,
  AlertTriangle
} from 'lucide-react'

interface ConfigCategory {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  settings: ConfigSetting[]
}

interface ConfigSetting {
  key: string
  label: string
  value: string | number | boolean
  type: 'text' | 'number' | 'boolean' | 'select' | 'password'
  options?: string[]
  description: string
  sensitive: boolean
  lastModified: Date
  modifiedBy: string
}

export function ConfigManager() {
  const [categories, setCategories] = useState<ConfigCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfiguration()
  }, [])

  const loadConfiguration = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 500))

    setCategories([
      {
        id: 'general',
        name: 'General',
        icon: <Settings className="w-5 h-5" />,
        description: 'Configuración general del sistema',
        settings: [
          { key: 'app_name', label: 'Nombre de la Aplicación', value: 'Silexar Pulse', type: 'text', description: 'Nombre mostrado en la UI', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'maintenance_mode', label: 'Modo Mantenimiento', value: false, type: 'boolean', description: 'Activa modo mantenimiento global', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'max_sessions_per_user', label: 'Sesiones Máximas por Usuario', value: 5, type: 'number', description: 'Límite de sesiones simultáneas', sensitive: false, lastModified: new Date(), modifiedBy: 'System' },
          { key: 'default_language', label: 'Idioma por Defecto', value: 'es', type: 'select', options: ['es', 'en', 'pt'], description: 'Idioma predeterminado', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'security',
        name: 'Seguridad',
        icon: <Shield className="w-5 h-5" />,
        description: 'Configuración de seguridad',
        settings: [
          { key: 'two_factor_required', label: '2FA Obligatorio', value: true, type: 'boolean', description: 'Requiere autenticación de dos factores', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'session_timeout', label: 'Timeout de Sesión (min)', value: 30, type: 'number', description: 'Tiempo de inactividad antes de cerrar sesión', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'password_min_length', label: 'Longitud Mínima Contraseña', value: 12, type: 'number', description: 'Caracteres mínimos para contraseñas', sensitive: false, lastModified: new Date(), modifiedBy: 'System' },
          { key: 'max_login_attempts', label: 'Intentos de Login Máximos', value: 5, type: 'number', description: 'Antes de bloquear la cuenta', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'api',
        name: 'API & Integrations',
        icon: <Globe className="w-5 h-5" />,
        description: 'Configuración de APIs',
        settings: [
          { key: 'api_rate_limit', label: 'Rate Limit Global (req/min)', value: 1000, type: 'number', description: 'Límite global de requests por minuto', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'api_key', label: 'API Key Principal', value: '••••••••••••••••', type: 'password', description: 'Clave de API maestra', sensitive: true, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'webhook_secret', label: 'Webhook Secret', value: '••••••••••••••••', type: 'password', description: 'Secret para validar webhooks', sensitive: true, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'email',
        name: 'Email',
        icon: <Mail className="w-5 h-5" />,
        description: 'Configuración de correos',
        settings: [
          { key: 'smtp_host', label: 'SMTP Host', value: 'smtp.silexar.com', type: 'text', description: 'Servidor SMTP', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'smtp_port', label: 'SMTP Port', value: 587, type: 'number', description: 'Puerto SMTP', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'sender_email', label: 'Email Remitente', value: 'noreply@silexar.com', type: 'text', description: 'Email para envíos', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'smtp_password', label: 'SMTP Password', value: '••••••••••••••••', type: 'password', description: 'Contraseña SMTP', sensitive: true, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'ai',
        name: 'Inteligencia Artificial',
        icon: <Zap className="w-5 h-5" />,
        description: 'Configuración de IA',
        settings: [
          { key: 'ai_enabled', label: 'IA Habilitada', value: true, type: 'boolean', description: 'Activa funciones de IA', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'ai_model', label: 'Modelo de IA', value: 'gpt-4-turbo', type: 'select', options: ['gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo', 'claude-3'], description: 'Modelo de lenguaje a usar', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'ai_max_tokens', label: 'Max Tokens por Request', value: 4096, type: 'number', description: 'Límite de tokens', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'openai_api_key', label: 'OpenAI API Key', value: '••••••••••••••••', type: 'password', description: 'Clave de API de OpenAI', sensitive: true, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'notifications',
        name: 'Notificaciones',
        icon: <Bell className="w-5 h-5" />,
        description: 'Configuración de alertas',
        settings: [
          { key: 'push_enabled', label: 'Push Notifications', value: true, type: 'boolean', description: 'Activa notificaciones push', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'sms_enabled', label: 'SMS Notifications', value: true, type: 'boolean', description: 'Activa notificaciones SMS', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' },
          { key: 'twilio_sid', label: 'Twilio SID', value: '••••••••••••••••', type: 'password', description: 'Twilio Account SID', sensitive: true, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      },
      {
        id: 'database',
        name: 'Base de Datos',
        icon: <Database className="w-5 h-5" />,
        description: 'Configuración de BD',
        settings: [
          { key: 'db_pool_size', label: 'Pool Size', value: 20, type: 'number', description: 'Tamaño del pool de conexiones', sensitive: false, lastModified: new Date(), modifiedBy: 'System' },
          { key: 'db_timeout', label: 'Query Timeout (ms)', value: 30000, type: 'number', description: 'Timeout para queries', sensitive: false, lastModified: new Date(), modifiedBy: 'System' },
          { key: 'backup_retention_days', label: 'Retención de Backups (días)', value: 90, type: 'number', description: 'Días que se guardan backups', sensitive: false, lastModified: new Date(), modifiedBy: 'CEO' }
        ]
      }
    ])

    setSelectedCategory('general')
    setIsLoading(false)
  }

  const updateSetting = (categoryId: string, key: string, value: string | number | boolean) => {
    setCategories(prev => prev.map(cat => {
      if (cat.id !== categoryId) return cat
      return {
        ...cat,
        settings: cat.settings.map(s =>
          s.key === key ? { ...s, value, lastModified: new Date(), modifiedBy: 'CEO' } : s
        )
      }
    }))
    setHasChanges(true)
  }

  const saveConfiguration = async () => {
    setIsSaving(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsSaving(false)
    setHasChanges(false)

  }

  const selectedCategoryData = categories.find(c => c.id === selectedCategory)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#6888ff]/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#9aa3b8]">Cargando Configuración...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold text-[#69738c] flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#6888ff]" />
          Configuration Manager
        </h3>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <span className="text-xs text-[#6888ff] flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Cambios sin guardar
            </span>
          )}
          <NeuButton
            variant="primary"

            onClick={saveConfiguration}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <Save className="w-4 h-4 mr-1" />
                Guardar
              </>
            )}
          </NeuButton>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
        <input
          type="text"
          placeholder="Buscar configuración..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-9 pr-4 py-2 bg-[#dfeaff] border border-slate-700 rounded-lg text-[#69738c] text-sm"
        />
      </div>

      <div className="grid grid-cols-4 gap-4">
        {/* Categories Sidebar */}
        <div className="space-y-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`w-full flex items-center gap-2 p-3 rounded-lg text-left transition-all ${selectedCategory === cat.id
                ? 'bg-[#6888ff]/20 border border-[#6888ff]/30 text-white'
                : 'bg-[#dfeaff]/50 text-[#9aa3b8] hover:bg-[#dfeaff] hover:text-[#69738c]'
                }`}
            >
              {cat.icon}
              <div>
                <p className="text-sm font-medium">{cat.name}</p>
                <p className="text-xs text-[#9aa3b8]">{cat.settings.length} settings</p>
              </div>
              {selectedCategory === cat.id ? (
                <ChevronDown className="w-4 h-4 ml-auto" />
              ) : (
                <ChevronRight className="w-4 h-4 ml-auto" />
              )}
            </button>
          ))}
        </div>

        {/* Settings Panel */}
        <div className="col-span-3">
          {selectedCategoryData && (
            <NeuCard style={{ boxShadow: getSmallShadow(), padding: '1.5rem', background: N.base }}>
              <h4 className="text-[#69738c] font-bold mb-2 flex items-center gap-2">
                {selectedCategoryData.icon}
                {selectedCategoryData.name}
              </h4>
              <p className="text-sm text-[#9aa3b8] mb-4">{selectedCategoryData.description}</p>

              <div className="space-y-4">
                {selectedCategoryData.settings
                  .filter(s => s.label.toLowerCase().includes(searchTerm.toLowerCase()))
                  .map(setting => (
                    <div key={setting.key} className="p-4 bg-[#dfeaff]/30 rounded-lg">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <label className="text-[#69738c] font-medium flex items-center gap-2">
                            {setting.label}
                            {setting.sensitive && <Lock className="w-3 h-3 text-[#6888ff]" />}
                          </label>
                          <p className="text-xs text-[#9aa3b8]">{setting.description}</p>
                        </div>
                        <span className="text-xs text-[#9aa3b8] flex items-center gap-1">
                          <History className="w-3 h-3" />
                          {setting.lastModified.toLocaleDateString()}
                        </span>
                      </div>

                      {setting.type === 'boolean' ? (
                        <button
                          onClick={() => updateSetting(selectedCategoryData.id, setting.key, !setting.value)}
                          className={`px-3 py-1.5 rounded text-sm ${setting.value
                            ? 'bg-[#6888ff]/20 text-[#6888ff]'
                            : 'bg-[#dfeaff] text-[#9aa3b8]'
                            }`}
                        >
                          {setting.value ? (
                            <span className="flex items-center gap-1"><Check className="w-3 h-3" /> Activado</span>
                          ) : 'Desactivado'}
                        </button>
                      ) : setting.type === 'select' ? (
                        <select
                          value={setting.value as string}
                          onChange={(e) => updateSetting(selectedCategoryData.id, setting.key, e.target.value)}
                          className="bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2"
                        >
                          {setting.options?.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={setting.type}
                          value={setting.value as string}
                          onChange={(e) => updateSetting(
                            selectedCategoryData.id,
                            setting.key,
                            setting.type === 'number' ? parseInt(e.target.value) : e.target.value
                          )}
                          className="bg-[#dfeaff] text-[#69738c] text-sm rounded px-3 py-2 w-full max-w-xs"
                        />
                      )}
                    </div>
                  ))}
              </div>
            </NeuCard>
          )}
        </div>
      </div>
    </div>
  )
}

export default ConfigManager