/**
 * CEO Command Center Page
 * 
 * Main dashboard for Silexar Pulse CEO with total control over the platform.
 * Includes all management modules: Tenants, Services, Database, Feature Flags,
 * Pricing, Users, Limits, Metrics, and Notifications.
 * 
 * Line Reference: command-center/page.tsx:1
 */

'use client';

import { useState, useEffect } from 'react';

// Import all command center panels
import TenantManagementPanel from '@/components/command-center/TenantManagementPanel';
import ServiceControlPanel from '@/components/command-center/ServiceControlPanel';
import DatabaseFailoverPanel from '@/components/command-center/DatabaseFailoverPanel';
import FeatureFlagsPanel from '@/components/command-center/FeatureFlagsPanel';
import PricingPlansPanel from '@/components/command-center/PricingPlansPanel';
import UserManagementPanel from '@/components/command-center/UserManagementPanel';
import SystemLimitsPanel from '@/components/command-center/SystemLimitsPanel';
import MetricsGraphsPanel from '@/components/command-center/MetricsGraphsPanel';
import NotificationsConfigPanel from '@/components/command-center/NotificationsConfigPanel';
import OperationsPanel from '@/components/command-center/OperationsPanel';
import WilAssistant from '@/components/command-center/WilAssistant';
import FinanceCenter from '@/components/command-center/FinanceCenter';
import SecurityCenter from '@/components/command-center/SecurityCenter';
import SupportTickets from '@/components/command-center/SupportTickets';
import AutomationRules from '@/components/command-center/AutomationRules';
import ExternalIntegrations from '@/components/command-center/ExternalIntegrations';
import ExecutiveDashboard from '@/components/command-center/ExecutiveDashboard';

// Mock data for demonstration
const mockHealthScore = 82;
const mockAlerts = [
  { id: '1', severity: 'warning', title: 'DB Pool 78%', message: 'Proyección: 90% en 4h', time: 'Hace 5 min' },
  { id: '2', severity: 'info', title: 'Storage OK', message: 'Llenado en ~45 días', time: 'Hace 1h' },
  { id: '3', severity: 'critical', title: 'Email Error Rate', message: '15/min, impactando 23 users', time: 'Hace 12 min' },
];

const mockProviders = [
  { id: '1', name: 'Supabase PostgreSQL', type: 'database', status: 'healthy', latency: 23 },
  { id: '2', name: 'Cloudflare R2', type: 'storage', status: 'healthy', latency: 45 },
  { id: '3', name: 'OpenAI Whisper', type: 'speech', status: 'healthy', latency: 234 },
  { id: '4', name: 'Redis Cache', type: 'cache', status: 'healthy', latency: 2 },
  { id: '5', name: 'Resend Email', type: 'email', status: 'degraded', latency: 890 },
];

const mockMetrics = {
  clients: 47,
  users: 2450,
  requestsPerHour: 15674,
  uptime: 99.9,
  clientsTrend: '+3',
  usersTrend: '+127',
};

const killSwitches = [
  { id: 'emergency_stop', name: 'Emergency Stop', description: 'Para toda la plataforma', active: false },
  { id: 'maintenance_mode', name: 'Maintenance Mode', description: 'Modo mantenimiento', active: false },
  { id: 'security_lockdown', name: 'Security Lockdown', description: 'Bloqueo de seguridad', active: false },
  { id: 'read_only', name: 'Read Only Mode', description: 'Solo lectura global', active: false },
];

type TabId = 'dashboard' | 'tenants' | 'services' | 'database' | 'features' | 'plans' | 'users' | 'limits' | 'metrics' | 'notifications' | 'operations' | 'wil' | 'finance' | 'security' | 'tickets' | 'automation' | 'integrations' | 'executive';

const tabs = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'tenants', label: 'Clientes/Tenants', icon: '🏢' },
  { id: 'services', label: 'Servicios', icon: '⚙️' },
  { id: 'database', label: 'Database', icon: '🗄️' },
  { id: 'features', label: 'Feature Flags', icon: '🚩' },
  { id: 'plans', label: 'Planes', icon: '💰' },
  { id: 'users', label: 'Usuarios', icon: '👥' },
  { id: 'limits', label: 'Límites', icon: '📏' },
  { id: 'metrics', label: 'Métricas', icon: '📈' },
  { id: 'notifications', label: 'Notificaciones', icon: '🔔' },
  { id: 'operations', label: 'Operaciones', icon: '📋' },
  { id: 'wil', label: 'Wil IA', icon: '🤖' },
  { id: 'finance', label: 'Finanzas', icon: '💹' },
  { id: 'security', label: 'Seguridad', icon: '🔒' },
  { id: 'tickets', label: 'Tickets', icon: '🎫' },
  { id: 'automation', label: 'Automation', icon: '⚡' },
  { id: 'integrations', label: 'Integraciones', icon: '🔗' },
  { id: 'executive', label: 'Ejecutivo', icon: '👑' },
];

export default function CommandCenterPage() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard');
  const [healthScore, setHealthScore] = useState(mockHealthScore);
  const [alerts, setAlerts] = useState(mockAlerts);
  const [switches, setSwitches] = useState(killSwitches);

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getHealthBg = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 50) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500';
      case 'degraded': return 'bg-yellow-500';
      case 'unhealthy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-red-500 bg-red-50';
      case 'warning': return 'border-yellow-500 bg-yellow-50';
      case 'info': return 'border-blue-500 bg-blue-50';
      default: return 'border-gray-500 bg-gray-50';
    }
  };

  const toggleKillSwitch = (id: string) => {
    if (id === 'emergency_stop') {
      const confirmed = confirm('⚠️ CRÍTICO: Esta acción detendrá TODA la plataforma. ¿Está seguro?');
      if (!confirmed) return;
    }
    setSwitches(prev => prev.map(s =>
      s.id === id ? { ...s, active: !s.active } : s
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-full mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-xl">🛸</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Centro de Comando CEO</h1>
                <p className="text-sm text-slate-400">Control total de Silexar Pulse</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-full text-sm font-medium">
                👑 CEO Access
              </span>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold">
                A
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs - Horizontal Scroll */}
      <nav className="border-b border-slate-700 bg-slate-900/50 overflow-x-auto">
        <div className="max-w-full mx-auto px-6">
          <div className="flex gap-1 min-w-max">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id
                  ? 'text-indigo-400 border-b-2 border-indigo-400 bg-indigo-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-full mx-auto px-6 py-8">
        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Health Score Section */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">🏥 Salud del Sistema</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthBg(healthScore)} ${getHealthColor(healthScore)}`}>
                  {healthScore}/100
                </span>
              </div>

              {/* Health Bar */}
              <div className="h-4 bg-slate-700 rounded-full overflow-hidden mb-4">
                <div
                  className={`h-full transition-all duration-500 ${healthScore >= 80 ? 'bg-gradient-to-r from-green-500 to-emerald-500' :
                    healthScore >= 50 ? 'bg-gradient-to-r from-yellow-500 to-amber-500' :
                      'bg-gradient-to-r from-red-500 to-rose-500'
                    }`}
                  style={{ width: `${healthScore}%` }}
                />
              </div>

              {/* Predictions */}
              <div className="bg-slate-900/50 rounded-xl p-4 border border-slate-700">
                <h3 className="text-sm font-medium text-slate-300 mb-2">🤖 Predicciones IA (72h)</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                    87% probabilidad de alta carga en BD (estimado: mañana)
                  </li>
                  <li className="flex items-center gap-2 text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    45% probabilidad de rate limit en API
                  </li>
                </ul>
              </div>
            </section>

            {/* Global Metrics */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Clientes', value: mockMetrics.clients, trend: mockMetrics.clientsTrend, color: 'from-blue-500 to-cyan-500' },
                { label: 'Usuarios', value: mockMetrics.users.toLocaleString(), trend: mockMetrics.usersTrend, color: 'from-purple-500 to-pink-500' },
                { label: 'Requests/h', value: mockMetrics.requestsPerHour.toLocaleString(), trend: '+12%', color: 'from-amber-500 to-orange-500' },
                { label: 'Uptime', value: `${mockMetrics.uptime}%`, trend: '45 días', color: 'from-green-500 to-emerald-500' },
              ].map((metric, i) => (
                <div key={i} className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
                  <p className="text-sm text-slate-400 mb-1">{metric.label}</p>
                  <p className="text-3xl font-bold text-white mb-1">{metric.value}</p>
                  <p className="text-xs text-green-400">{metric.trend}</p>
                  <div className={`mt-4 h-1 rounded-full bg-gradient-to-r ${metric.color} opacity-50`} />
                </div>
              ))}
            </section>

            {/* Active Alerts */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold text-white">🚨 Alertas Activas</h2>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm">
                  {alerts.length} alertas
                </span>
              </div>

              <div className="space-y-4">
                {alerts.map(alert => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border ${getSeverityColor(alert.severity)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium text-slate-800">{alert.title}</h3>
                        <p className="text-sm text-slate-600">{alert.message}</p>
                      </div>
                      <span className="text-xs text-slate-500">{alert.time}</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <button className="px-3 py-1 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700">
                        Ver Detalles
                      </button>
                      <button className="px-3 py-1 bg-indigo-500 text-white text-xs rounded-lg hover:bg-indigo-600">
                        Ejecutar Acción
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Kill Switches */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-red-900/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">🚨 Kill Switches</h2>
                  <p className="text-sm text-red-400">⚠️ CRÍTICO: Estas acciones afectan a TODOS los clientes</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {switches.map(sw => (
                  <div
                    key={sw.id}
                    className={`p-4 rounded-xl border ${sw.active
                      ? 'bg-red-500/20 border-red-500'
                      : 'bg-slate-900/50 border-slate-700'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`font-medium ${sw.active ? 'text-red-400' : 'text-white'}`}>
                          {sw.name}
                        </h3>
                        <p className="text-xs text-slate-400">{sw.description}</p>
                      </div>
                      <button
                        onClick={() => toggleKillSwitch(sw.id)}
                        className={`relative w-14 h-7 rounded-full transition-colors ${sw.active ? 'bg-red-500' : 'bg-slate-600'
                          }`}
                      >
                        <span
                          className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${sw.active ? 'left-8' : 'left-1'
                            }`}
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Quick Actions */}
            <section className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-6">
              <h2 className="text-lg font-semibold text-white mb-6">⚡ Acciones Rápidas</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: '🔄 Flush Cache', action: 'flush' },
                  { label: '💾 Force Backup', action: 'backup' },
                  { label: '🗄️ Failover DB', action: 'failover' },
                  { label: '📧 Test Email', action: 'test' },
                  { label: '📊 Regenerate Stats', action: 'stats' },
                  { label: '🔐 Clear Sessions', action: 'sessions' },
                  { label: '🧹 Clear Logs', action: 'logs' },
                  { label: '📈 Health Check', action: 'health' },
                ].map((action, i) => (
                  <button
                    key={i}
                    className="p-4 bg-slate-900/50 rounded-xl border border-slate-700 text-white text-sm hover:bg-slate-700 hover:border-slate-600 transition-all"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {/* Tenants Tab */}
        {activeTab === 'tenants' && <TenantManagementPanel />}

        {/* Services Tab */}
        {activeTab === 'services' && <ServiceControlPanel />}

        {/* Database Tab */}
        {activeTab === 'database' && <DatabaseFailoverPanel />}

        {/* Feature Flags Tab */}
        {activeTab === 'features' && <FeatureFlagsPanel />}

        {/* Plans Tab */}
        {activeTab === 'plans' && <PricingPlansPanel />}

        {/* Users Tab */}
        {activeTab === 'users' && <UserManagementPanel />}

        {/* Limits Tab */}
        {activeTab === 'limits' && <SystemLimitsPanel />}

        {/* Metrics Tab */}
        {activeTab === 'metrics' && <MetricsGraphsPanel />}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && <NotificationsConfigPanel />}

        {/* Operations Tab */}
        {activeTab === 'operations' && <OperationsPanel />}

        {/* Wil AI Tab */}
        {activeTab === 'wil' && <WilAssistant />}

        {/* Finance Tab */}
        {activeTab === 'finance' && <FinanceCenter />}

        {/* Security Tab */}
        {activeTab === 'security' && <SecurityCenter />}

        {/* Tickets Tab */}
        {activeTab === 'tickets' && <SupportTickets />}

        {/* Automation Tab */}
        {activeTab === 'automation' && <AutomationRules />}

        {/* Integrations Tab */}
        {activeTab === 'integrations' && <ExternalIntegrations />}

        {/* Executive Tab */}
        {activeTab === 'executive' && <ExecutiveDashboard />}

      </main>
    </div>
  );
}
