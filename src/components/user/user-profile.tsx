'use client'

/**
 * 👤 SILEXAR PULSE - User Profile Enterprise
 * Perfil de usuario completo nivel Fortune 10
 * 
 * @description Profile Features:
 * - Datos personales y avatar
 * - Seguridad: 2FA, contraseña, sesiones activas
 * - Preferencias: tema, idioma, timezone
 * - Notificaciones personalizadas
 * - Historial de actividad
 * - Atajos de teclado
 * - Centro de ayuda
 * - Favoritos y widgets
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
  User, Shield, Bell, Settings, Activity, HelpCircle, Star,
  Camera, Mail, Phone, Building, MapPin, Globe, Clock,
  Lock, Key, Smartphone, Monitor, Laptop, Trash2, LogOut,
  Sun, Moon, Palette, Languages, Calendar, Eye, EyeOff,
  CheckCircle, XCircle, AlertTriangle, Copy, Download,
  Keyboard, LayoutDashboard, Heart, BookOpen, Video, MessageSquare,
  ChevronRight, RefreshCw, X, Plus, Edit, Save
} from 'lucide-react'

// Types
interface UserSession {
  id: string
  device: string
  browser: string
  ip: string
  location: string
  lastActive: Date
  isCurrent: boolean
}

interface ActivityLog {
  id: string
  action: string
  resource: string
  timestamp: Date
  ip: string
  result: 'success' | 'warning' | 'error'
}

interface NotificationSetting {
  id: string
  name: string
  description: string
  email: boolean
  push: boolean
  inApp: boolean
}

interface KeyboardShortcut {
  id: string
  action: string
  keys: string
  customizable: boolean
}

interface FavoriteItem {
  id: string
  name: string
  path: string
  icon: string
  type: 'module' | 'report' | 'action'
}

interface UserProfileData {
  id: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  avatar?: string
  timezone: string
  language: string
  theme: 'dark' | 'light' | 'system'
  dateFormat: string
  twoFactorEnabled: boolean
  backupCodes: string[]
  createdAt: Date
  lastLogin: Date
}

const TABS = [
  { id: 'profile', name: 'Mi Perfil', icon: <User className="w-4 h-4" /> },
  { id: 'security', name: 'Seguridad', icon: <Shield className="w-4 h-4" /> },
  { id: 'preferences', name: 'Preferencias', icon: <Settings className="w-4 h-4" /> },
  { id: 'notifications', name: 'Notificaciones', icon: <Bell className="w-4 h-4" /> },
  { id: 'activity', name: 'Actividad', icon: <Activity className="w-4 h-4" /> },
  { id: 'shortcuts', name: 'Atajos', icon: <Keyboard className="w-4 h-4" /> },
  { id: 'favorites', name: 'Favoritos', icon: <Star className="w-4 h-4" /> },
  { id: 'help', name: 'Ayuda', icon: <HelpCircle className="w-4 h-4" /> }
]

const TIMEZONES = [
  'America/Santiago', 'America/Buenos_Aires', 'America/Lima', 'America/Bogota',
  'America/Mexico_City', 'America/New_York', 'America/Los_Angeles', 'Europe/Madrid',
  'Europe/London', 'Asia/Tokyo', 'Australia/Sydney'
]

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'pt', name: 'Português' }
]

const DATE_FORMATS = [
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY (31/12/2025)' },
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY (12/31/2025)' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD (2025-12-31)' }
]

export function UserProfile() {
  const [activeTab, setActiveTab] = useState('profile')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  
  // Profile data
  const [profile, setProfile] = useState<UserProfileData | null>(null)
  const [sessions, setSessions] = useState<UserSession[]>([])
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([])
  const [notificationSettings, setNotificationSettings] = useState<NotificationSetting[]>([])
  const [shortcuts, setShortcuts] = useState<KeyboardShortcut[]>([])
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  
  // Modals
  const [showChangePassword, setShowChangePassword] = useState(false)
  const [showEnable2FA, setShowEnable2FA] = useState(false)
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)

  // Password change form
  const [passwordForm, setPasswordForm] = useState({
    current: '', new: '', confirm: ''
  })
  const [showPasswords, setShowPasswords] = useState(false)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    setIsLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const now = new Date()

    // Profile
    setProfile({
      id: 'user_001',
      name: 'Ana Silva',
      email: 'ana.silva@empresa.com',
      phone: '+56 9 8765 4321',
      department: 'Ventas',
      position: 'Ejecutiva Comercial',
      timezone: 'America/Santiago',
      language: 'es',
      theme: 'dark',
      dateFormat: 'DD/MM/YYYY',
      twoFactorEnabled: false,
      backupCodes: ['A1B2C3D4', 'E5F6G7H8', 'I9J0K1L2', 'M3N4O5P6', 'Q7R8S9T0'],
      createdAt: new Date('2024-03-15'),
      lastLogin: new Date(now.getTime() - 2 * 60 * 60 * 1000)
    })

    // Sessions
    setSessions([
      { id: 's1', device: 'Windows PC', browser: 'Chrome 120', ip: '192.168.1.100', location: 'Santiago, Chile', lastActive: new Date(), isCurrent: true },
      { id: 's2', device: 'iPhone 15', browser: 'Safari Mobile', ip: '192.168.1.105', location: 'Santiago, Chile', lastActive: new Date(now.getTime() - 30 * 60 * 1000), isCurrent: false },
      { id: 's3', device: 'MacBook Pro', browser: 'Safari 17', ip: '10.0.0.50', location: 'Viña del Mar, Chile', lastActive: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), isCurrent: false }
    ])

    // Activity logs
    setActivityLogs([
      { id: 'a1', action: 'Login exitoso', resource: 'auth', timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000), ip: '192.168.1.100', result: 'success' },
      { id: 'a2', action: 'Cliente creado: Tech Solutions', resource: 'crm', timestamp: new Date(now.getTime() - 3 * 60 * 60 * 1000), ip: '192.168.1.100', result: 'success' },
      { id: 'a3', action: 'Reporte exportado: Ventas Q4', resource: 'reports', timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000), ip: '192.168.1.100', result: 'success' },
      { id: 'a4', action: 'Intento de acceso a módulo sin permiso', resource: 'campaigns', timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), ip: '192.168.1.100', result: 'warning' },
      { id: 'a5', action: 'Contraseña cambiada', resource: 'security', timestamp: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), ip: '192.168.1.100', result: 'success' }
    ])

    // Notification settings
    setNotificationSettings([
      { id: 'n1', name: 'Nuevos clientes asignados', description: 'Cuando te asignan un nuevo cliente', email: true, push: true, inApp: true },
      { id: 'n2', name: 'Tareas pendientes', description: 'Recordatorios de tareas por vencer', email: true, push: true, inApp: true },
      { id: 'n3', name: 'Tickets de soporte', description: 'Actualizaciones en tus tickets', email: true, push: false, inApp: true },
      { id: 'n4', name: 'Reportes programados', description: 'Cuando un reporte está listo', email: true, push: false, inApp: true },
      { id: 'n5', name: 'Alertas de seguridad', description: 'Logins desde nuevos dispositivos', email: true, push: true, inApp: true },
      { id: 'n6', name: 'Novedades del sistema', description: 'Nuevas funcionalidades y mejoras', email: false, push: false, inApp: true }
    ])

    // Shortcuts
    setShortcuts([
      { id: 'k1', action: 'Búsqueda global', keys: 'Ctrl + K', customizable: true },
      { id: 'k2', action: 'Nuevo cliente', keys: 'Ctrl + N', customizable: true },
      { id: 'k3', action: 'Ir a CRM', keys: 'G + C', customizable: true },
      { id: 'k4', action: 'Ir a Reportes', keys: 'G + R', customizable: true },
      { id: 'k5', action: 'Abrir ayuda', keys: 'Ctrl + ?', customizable: false },
      { id: 'k6', action: 'Cerrar modal', keys: 'Escape', customizable: false }
    ])

    // Favorites
    setFavorites([
      { id: 'f1', name: 'Dashboard de Ventas', path: '/dashboard/sales', icon: '📊', type: 'module' },
      { id: 'f2', name: 'Mis Clientes', path: '/crm/my-clients', icon: '👥', type: 'module' },
      { id: 'f3', name: 'Reporte Semanal', path: '/reports/weekly', icon: '📈', type: 'report' }
    ])

    setIsLoading(false)
  }

  const saveProfile = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    alert('✅ Perfil actualizado correctamente')
  }

  const changePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Las contraseñas no coinciden')
      return
    }
    if (passwordForm.new.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres')
      return
    }
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    setIsSaving(false)
    setShowChangePassword(false)
    setPasswordForm({ current: '', new: '', confirm: '' })
    alert('✅ Contraseña cambiada correctamente')
  }

  const enable2FA = async () => {
    setIsSaving(true)
    await new Promise(r => setTimeout(r, 1000))
    if (profile) {
      setProfile({ ...profile, twoFactorEnabled: true })
    }
    setIsSaving(false)
    setShowEnable2FA(false)
    setShowBackupCodes(true)
  }

  const disable2FA = async () => {
    if (!confirm('¿Desactivar autenticación de dos factores?')) return
    if (profile) {
      setProfile({ ...profile, twoFactorEnabled: false })
    }
  }

  const revokeSession = (sessionId: string) => {
    if (!confirm('¿Cerrar esta sesión?')) return
    setSessions(prev => prev.filter(s => s.id !== sessionId))
  }

  const revokeAllSessions = () => {
    if (!confirm('¿Cerrar todas las sesiones excepto la actual?')) return
    setSessions(prev => prev.filter(s => s.isCurrent))
  }

  const toggleNotification = (id: string, channel: 'email' | 'push' | 'inApp') => {
    setNotificationSettings(prev => prev.map(n => 
      n.id === id ? { ...n, [channel]: !n[channel] } : n
    ))
  }

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id))
  }

  const getDeviceIcon = (device: string) => {
    if (device.includes('iPhone') || device.includes('Android')) return <Smartphone className="w-5 h-5" />
    if (device.includes('Mac')) return <Laptop className="w-5 h-5" />
    return <Monitor className="w-5 h-5" />
  }

  if (isLoading || !profile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500/30 border-t-orange-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando perfil...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center text-white text-2xl font-bold">
              {profile.name.split(' ').map(n => n[0]).join('')}
            </div>
            <button
              onClick={() => setShowAvatarUpload(true)}
              className="absolute bottom-0 right-0 w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white"
              aria-label="Cambiar foto de perfil"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{profile.name}</h2>
            <p className="text-slate-400">{profile.position} • {profile.department}</p>
            <p className="text-xs text-slate-500">Último acceso: {profile.lastLogin.toLocaleString()}</p>
          </div>
        </div>
        <NeuromorphicButton variant="primary" onClick={saveProfile} disabled={isSaving}>
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
          Guardar Cambios
        </NeuromorphicButton>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              activeTab === tab.id ? 'bg-orange-500 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
            }`}
          >
            {tab.icon}
            {tab.name}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-400" />
              Información Personal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Nombre completo</label>
                <input type="text" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Email</label>
                <input type="email" value={profile.email} disabled
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Teléfono</label>
                <input type="tel" value={profile.phone || ''} onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Departamento</label>
                <input type="text" value={profile.department || ''} disabled
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Cargo</label>
                <input type="text" value={profile.position || ''} disabled
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 cursor-not-allowed" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Miembro desde</label>
                <input type="text" value={profile.createdAt.toLocaleDateString()} disabled
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-500 cursor-not-allowed" />
              </div>
            </div>
          </NeuromorphicCard>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-4">
            {/* Password */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Key className="w-5 h-5 text-yellow-400" />
                    Contraseña
                  </h3>
                  <p className="text-slate-500 text-sm">Última modificación hace 7 días</p>
                </div>
                <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowChangePassword(true)}>
                  Cambiar Contraseña
                </NeuromorphicButton>
              </div>
            </NeuromorphicCard>

            {/* 2FA */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-400" />
                    Autenticación de Dos Factores (2FA)
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {profile.twoFactorEnabled ? '✅ Activado' : '⚠️ No activado - Recomendado activar'}
                  </p>
                </div>
                {profile.twoFactorEnabled ? (
                  <div className="flex gap-2">
                    <NeuromorphicButton variant="secondary" size="sm" onClick={() => setShowBackupCodes(true)}>
                      Ver Códigos
                    </NeuromorphicButton>
                    <NeuromorphicButton variant="secondary" size="sm" onClick={disable2FA}>
                      Desactivar
                    </NeuromorphicButton>
                  </div>
                ) : (
                  <NeuromorphicButton variant="primary" size="sm" onClick={() => setShowEnable2FA(true)}>
                    Activar 2FA
                  </NeuromorphicButton>
                )}
              </div>
            </NeuromorphicCard>

            {/* Active Sessions */}
            <NeuromorphicCard variant="embossed" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium flex items-center gap-2">
                  <Monitor className="w-5 h-5 text-green-400" />
                  Sesiones Activas ({sessions.length})
                </h3>
                <NeuromorphicButton variant="secondary" size="sm" onClick={revokeAllSessions}>
                  Cerrar Todas
                </NeuromorphicButton>
              </div>
              <div className="space-y-3">
                {sessions.map(session => (
                  <div key={session.id} className={`p-3 rounded-lg border ${session.isCurrent ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.device)}
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-white">{session.device}</span>
                            {session.isCurrent && <span className="text-xs px-2 py-0.5 bg-green-500/20 text-green-400 rounded">Actual</span>}
                          </div>
                          <p className="text-xs text-slate-500">{session.browser} • {session.ip} • {session.location}</p>
                          <p className="text-xs text-slate-500">Última actividad: {session.lastActive.toLocaleString()}</p>
                        </div>
                      </div>
                      {!session.isCurrent && (
                        <button onClick={() => revokeSession(session.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" aria-label="Cerrar sesión">
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </NeuromorphicCard>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5 text-purple-400" />
              Preferencias del Sistema
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Tema</label>
                  <select value={profile.theme} onChange={(e) => setProfile({ ...profile, theme: e.target.value as 'dark' | 'light' | 'system' })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    <option value="dark">🌙 Oscuro</option>
                    <option value="light">☀️ Claro</option>
                    <option value="system">💻 Sistema</option>
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Idioma</label>
                  <select value={profile.language} onChange={(e) => setProfile({ ...profile, language: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    {LANGUAGES.map(lang => (
                      <option key={lang.code} value={lang.code}>{lang.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Zona Horaria</label>
                  <select value={profile.timezone} onChange={(e) => setProfile({ ...profile, timezone: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    {TIMEZONES.map(tz => (
                      <option key={tz} value={tz}>{tz}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-slate-400 text-xs block mb-1">Formato de Fecha</label>
                  <select value={profile.dateFormat} onChange={(e) => setProfile({ ...profile, dateFormat: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white">
                    {DATE_FORMATS.map(df => (
                      <option key={df.value} value={df.value}>{df.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </NeuromorphicCard>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5 text-yellow-400" />
              Preferencias de Notificaciones
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 text-center text-xs text-slate-400 border-b border-slate-700 pb-2">
                <div className="text-left">Notificación</div>
                <div>Email</div>
                <div>Push</div>
                <div>In-App</div>
              </div>
              {notificationSettings.map(setting => (
                <div key={setting.id} className="grid grid-cols-4 gap-4 items-center p-3 bg-slate-800/50 rounded-lg">
                  <div>
                    <p className="text-white text-sm">{setting.name}</p>
                    <p className="text-slate-500 text-xs">{setting.description}</p>
                  </div>
                  <div className="text-center">
                    <button onClick={() => toggleNotification(setting.id, 'email')}
                      className={`w-8 h-8 rounded ${setting.email ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}
                      aria-label="Activar/Desactivar notificación email">
                      {setting.email ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                    </button>
                  </div>
                  <div className="text-center">
                    <button onClick={() => toggleNotification(setting.id, 'push')}
                      className={`w-8 h-8 rounded ${setting.push ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}
                      aria-label="Activar/Desactivar notificación push">
                      {setting.push ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                    </button>
                  </div>
                  <div className="text-center">
                    <button onClick={() => toggleNotification(setting.id, 'inApp')}
                      className={`w-8 h-8 rounded ${setting.inApp ? 'bg-green-500/20 text-green-400' : 'bg-slate-700 text-slate-500'}`}
                      aria-label="Activar/Desactivar notificación in-app">
                      {setting.inApp ? <CheckCircle className="w-4 h-4 mx-auto" /> : <XCircle className="w-4 h-4 mx-auto" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              Historial de Actividad
            </h3>
            <div className="space-y-3">
              {activityLogs.map(log => (
                <div key={log.id} className={`p-3 rounded-lg border ${
                  log.result === 'success' ? 'bg-green-500/5 border-green-500/20' :
                  log.result === 'warning' ? 'bg-yellow-500/5 border-yellow-500/20' :
                  'bg-red-500/5 border-red-500/20'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {log.result === 'success' && <CheckCircle className="w-5 h-5 text-green-400" />}
                      {log.result === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-400" />}
                      {log.result === 'error' && <XCircle className="w-5 h-5 text-red-400" />}
                      <div>
                        <p className="text-white">{log.action}</p>
                        <p className="text-xs text-slate-500">{log.resource} • {log.ip}</p>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{log.timestamp.toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        )}

        {/* Shortcuts Tab */}
        {activeTab === 'shortcuts' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-purple-400" />
              Atajos de Teclado
            </h3>
            <div className="space-y-2">
              {shortcuts.map(shortcut => (
                <div key={shortcut.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <span className="text-white">{shortcut.action}</span>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-slate-700 rounded text-sm text-white font-mono">{shortcut.keys}</kbd>
                    {shortcut.customizable && (
                      <button className="p-1 hover:bg-slate-700 rounded text-slate-400" aria-label="Editar">
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </NeuromorphicCard>
        )}

        {/* Favorites Tab */}
        {activeTab === 'favorites' && (
          <NeuromorphicCard variant="embossed" className="p-6">
            <h3 className="text-white font-medium mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-400" />
              Mis Favoritos
            </h3>
            <div className="space-y-2">
              {favorites.map(fav => (
                <div key={fav.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{fav.icon}</span>
                    <div>
                      <p className="text-white">{fav.name}</p>
                      <p className="text-xs text-slate-500">{fav.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-slate-700 rounded text-blue-400" aria-label="Ir a favorito">
                      <ChevronRight className="w-4 h-4" />
                    </button>
                    <button onClick={() => removeFavorite(fav.id)} className="p-2 hover:bg-red-500/20 rounded text-red-400" aria-label="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
              <button className="w-full p-3 border-2 border-dashed border-slate-700 rounded-lg text-slate-500 hover:border-orange-500/50 hover:text-orange-400 flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" />
                Agregar Favorito
              </button>
            </div>
          </NeuromorphicCard>
        )}

        {/* Help Tab */}
        {activeTab === 'help' && (
          <div className="grid grid-cols-2 gap-4">
            <NeuromorphicCard variant="embossed" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-blue-400" />
                Guías y Tutoriales
              </h3>
              <div className="space-y-2">
                {['Primeros Pasos', 'Gestión de Clientes', 'Crear Reportes', 'Atajos Avanzados'].map(guide => (
                  <button key={guide} className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-white">{guide}</span>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </button>
                ))}
              </div>
            </NeuromorphicCard>
            <NeuromorphicCard variant="embossed" className="p-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <Video className="w-5 h-5 text-purple-400" />
                Videos de Capacitación
              </h3>
              <div className="space-y-2">
                {['Introducción al Sistema', 'CRM Avanzado', 'Reportes Pro', 'Tips de Productividad'].map(video => (
                  <button key={video} className="w-full p-3 bg-slate-800/50 hover:bg-slate-800 rounded-lg flex items-center justify-between">
                    <span className="text-white">{video}</span>
                    <span className="text-xs text-slate-500">5:30</span>
                  </button>
                ))}
              </div>
            </NeuromorphicCard>
            <NeuromorphicCard variant="embossed" className="p-6 col-span-2">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-400" />
                ¿Necesitas más ayuda?
              </h3>
              <p className="text-slate-400 mb-4">Nuestro equipo de soporte está disponible 24/7 para ayudarte.</p>
              <div className="flex gap-3">
                <NeuromorphicButton variant="primary">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Crear Ticket de Soporte
                </NeuromorphicButton>
                <NeuromorphicButton variant="secondary">
                  <Mail className="w-4 h-4 mr-2" />
                  Enviar Email
                </NeuromorphicButton>
              </div>
            </NeuromorphicCard>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showChangePassword && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <NeuromorphicCard variant="glow" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold">Cambiar Contraseña</h4>
              <button onClick={() => setShowChangePassword(false)} aria-label="Cerrar"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs block mb-1">Contraseña actual</label>
                <input type={showPasswords ? 'text' : 'password'} value={passwordForm.current}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Nueva contraseña</label>
                <input type={showPasswords ? 'text' : 'password'} value={passwordForm.new}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
              </div>
              <div>
                <label className="text-slate-400 text-xs block mb-1">Confirmar contraseña</label>
                <input type={showPasswords ? 'text' : 'password'} value={passwordForm.confirm}
                  onChange={(e) => setPasswordForm({ ...passwordForm, confirm: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded text-white" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={showPasswords} onChange={(e) => setShowPasswords(e.target.checked)} className="w-4 h-4" />
                <span className="text-slate-400 text-sm">Mostrar contraseñas</span>
              </label>
              <NeuromorphicButton variant="primary" className="w-full" onClick={changePassword}>
                Cambiar Contraseña
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>
        </div>
      )}

      {/* Backup Codes Modal */}
      {showBackupCodes && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <NeuromorphicCard variant="glow" className="w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-white font-bold">Códigos de Respaldo</h4>
              <button onClick={() => setShowBackupCodes(false)} aria-label="Cerrar"><X className="w-5 h-5 text-slate-400" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">Guarda estos códigos en un lugar seguro. Cada código solo se puede usar una vez.</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {profile.backupCodes.map((code, i) => (
                <div key={i} className="p-2 bg-slate-800 rounded text-center font-mono text-white">{code}</div>
              ))}
            </div>
            <div className="flex gap-2">
              <NeuromorphicButton variant="secondary" className="flex-1" onClick={() => navigator.clipboard.writeText(profile.backupCodes.join('\n'))}>
                <Copy className="w-4 h-4 mr-1" />Copiar
              </NeuromorphicButton>
              <NeuromorphicButton variant="secondary" className="flex-1">
                <Download className="w-4 h-4 mr-1" />Descargar
              </NeuromorphicButton>
            </div>
          </NeuromorphicCard>
        </div>
      )}
    </div>
  )
}

export default UserProfile
