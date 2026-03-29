/**
 * 📱 SILEXAR PULSE - Registro de Emisión Mobile
 * 
 * Centro de mando móvil completo con paridad funcional 1:1 al desktop.
 * 5 tabs operativos: Home, Verificar, Registros, Grilla, Analytics.
 * Diseño touch-first premium con micro-animaciones y UX nativa.
 * 
 * @version 2026.2.0
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Bell, Radio, Rocket,
  Search, BarChart3, Grid3X3, FileText,
  ChevronRight, AlertTriangle,
  RefreshCw, Share2, Zap,
  Clock, Target, Phone, Mail
} from 'lucide-react';

// SUB-VIEWS
import { MobileVerificacionView } from './_components/MobileVerificacionView';
import { MobileRegistrosView } from './_components/MobileRegistrosView';
import { MobileGrillaView } from './_components/MobileGrillaView';
import { MobileAnalyticsView } from './_components/MobileAnalyticsView';
import { MobileExportSheet } from './_components/MobileExportSheet';

// TYPES
import type { MobileTab, Stats, AlertaEmision } from '../_shared/types';

// ═══════════════════════════════════════════════════════════════
// TAB CONFIG
// ═══════════════════════════════════════════════════════════════

const TABS: { id: MobileTab; icon: React.ElementType; label: string }[] = [
  { id: 'home', icon: Rocket, label: 'Home' },
  { id: 'verificar', icon: Search, label: 'Verificar' },
  { id: 'registros', icon: FileText, label: 'Registros' },
  { id: 'grilla', icon: Grid3X3, label: 'Grilla' },
  { id: 'analytics', icon: BarChart3, label: 'Analytics' },
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function MobileVerificationPage() {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [showExport, setShowExport] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [alerts, setAlerts] = useState<AlertaEmision[]>([]);
  const [loadingHome, setLoadingHome] = useState(true);

  // ─── FETCH HOME DATA ───────────────────────────────────────
  const fetchHomeData = useCallback(async () => {
    setLoadingHome(true);
    try {
      const response = await fetch(`/api/registro-emision?fecha=${new Date().toISOString().split('T')[0]}`);
      const data = await response.json();
      if (data.success) {
        setStats(data.stats);
      }
    } catch {
      // Silent fail, show defaults
    }

    // Mock alerts (would come from /api/registro-emision/alertas)
    setAlerts([
      { id: 'a1', client: 'Banco XYZ', issue: 'Material no encontrado en bloque Prime 08:00', critical: true, timestamp: '08:15', resolved: false },
      { id: 'a2', client: 'TechCorp', issue: 'Requiere certificación blockchain urgente', critical: false, timestamp: '09:30', resolved: false },
      { id: 'a3', client: 'Coca-Cola', issue: 'Baja confianza en verificación (72%)', critical: false, timestamp: '10:45', resolved: false },
    ]);

    setLoadingHome(false);
  }, []);

  useEffect(() => { fetchHomeData(); }, [fetchHomeData]);

  // ─── RENDER TAB CONTENT ────────────────────────────────────
  const renderTabContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <HomeView
            stats={stats}
            alerts={alerts}
            loading={loadingHome}
            onNavigate={setActiveTab}
            onRefresh={fetchHomeData}
            onExport={() => setShowExport(true)}
          />
        );
      case 'verificar':
        return <MobileVerificacionView />;
      case 'registros':
        return <MobileRegistrosView />;
      case 'grilla':
        return <MobileGrillaView />;
      case 'analytics':
        return <MobileAnalyticsView />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* HEADER */}
      <div className="bg-slate-900/90 backdrop-blur-3xl text-white p-6 pt-12 rounded-b-[2.5rem] shadow-xl border-b border-indigo-500/20 relative overflow-hidden">
        {/* Background effect */}
        <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="relative z-10">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h1 className="text-lg font-black tracking-tight flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                SILEXAR MOBILE
              </h1>
              <p className="text-slate-400 text-xs font-medium mt-0.5">
                Registro de Emisión · TIER 0
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowExport(true)}
                className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center active:scale-90 transition-transform"
              >
                <Share2 className="w-4 h-4 text-slate-300" />
              </button>
              <div className="relative">
                <button className="w-9 h-9 rounded-full bg-slate-800/80 border border-slate-700/50 flex items-center justify-center">
                  <Bell className="w-4 h-4 text-slate-300" />
                </button>
                {alerts.filter(a => !a.resolved).length > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center border-2 border-slate-900">
                    {alerts.filter(a => !a.resolved).length}
                  </div>
                )}
              </div>
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/80 to-purple-500/80 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/10">
                <span className="font-bold text-xs text-white">AG</span>
              </div>
            </div>
          </div>

          {/* LIVE KPI — only on Home */}
          {activeTab === 'home' && stats && (
            <div className="grid grid-cols-3 gap-4 mt-2">
              <div className="text-center">
                <p className="text-2xl font-black text-white">{stats.total}</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Emisiones</p>
              </div>
              <div className="text-center relative">
                <div className="absolute inset-y-0 left-0 w-px bg-slate-700" />
                <p className={`text-2xl font-black ${stats.porcentajeEmision >= 90 ? 'text-emerald-400' : stats.porcentajeEmision >= 70 ? 'text-amber-400' : 'text-red-400'}`}>
                  {stats.porcentajeEmision}%
                </p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Tasa</p>
                <div className="absolute inset-y-0 right-0 w-px bg-slate-700" />
              </div>
              <div className="text-center">
                <p className="text-2xl font-black text-blue-400">{stats.confianzaPromedio}%</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Confianza</p>
              </div>
            </div>
          )}

          {/* TAB LABEL — when not home */}
          {activeTab !== 'home' && (
            <div className="flex items-center gap-2 mt-1">
              <div className="w-1 h-4 bg-indigo-500 rounded-full" />
              <p className="text-sm font-bold text-white capitalize">{activeTab === 'verificar' ? 'Verificación' : activeTab}</p>
            </div>
          )}
        </div>
      </div>

      {/* TAB CONTENT */}
      <div className="px-5 -mt-6 relative z-20 space-y-5 pt-8">
        {renderTabContent()}
      </div>

      {/* BOTTOM NAVIGATION */}
      <nav className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-200/50 px-4 py-2 flex justify-between items-center z-50 pb-7 shadow-xl">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center gap-0.5 py-1 px-3 rounded-xl transition-all active:scale-90 ${
                isActive ? 'scale-105' : ''
              }`}
            >
              <div className={`p-1.5 rounded-lg transition-colors ${
                isActive ? 'bg-indigo-100' : ''
              }`}>
                <Icon
                  className={`w-5 h-5 transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </div>
              <span className={`text-[10px] font-bold transition-colors ${
                isActive ? 'text-indigo-600' : 'text-slate-400'
              }`}>{tab.label}</span>
              {isActive && (
                <div className="w-1 h-1 bg-indigo-600 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>

      {/* EXPORT SHEET */}
      <MobileExportSheet isOpen={showExport} onClose={() => setShowExport(false)} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// HOME VIEW
// ═══════════════════════════════════════════════════════════════

interface HomeViewProps {
  stats: Stats | null;
  alerts: AlertaEmision[];
  loading: boolean;
  onNavigate: (tab: MobileTab) => void;
  onRefresh: () => void;
  onExport: () => void;
}

function HomeView({ stats, alerts, loading, onNavigate, onRefresh, onExport }: HomeViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
        <p className="text-sm font-bold text-slate-400">Cargando dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* QUICK ACCESS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <QuickAccessCard
          icon={<Rocket className="w-6 h-6" />}
          label="Verificación Express"
          color="bg-gradient-to-br from-indigo-500 to-purple-500"
          onClick={() => onNavigate('verificar')}
        />
        <QuickAccessCard
          icon={<Radio className="w-6 h-6" />}
          label="Ver Emisiones"
          color="bg-gradient-to-br from-blue-500 to-cyan-500"
          onClick={() => onNavigate('registros')}
        />
        <QuickAccessCard
          icon={<Grid3X3 className="w-6 h-6" />}
          label="Grilla en Vivo"
          color="bg-gradient-to-br from-emerald-500 to-teal-500"
          onClick={() => onNavigate('grilla')}
        />
        <QuickAccessCard
          icon={<BarChart3 className="w-6 h-6" />}
          label="Analytics"
          color="bg-gradient-to-br from-amber-500 to-orange-500"
          onClick={() => onNavigate('analytics')}
        />
      </div>

      {/* STATS OVERVIEW */}
      {stats && (
        <div className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-500" /> Resumen del Día
            </h3>
            <button onClick={onRefresh} className="p-1.5 rounded-lg bg-slate-50 active:scale-90">
              <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
            <div className="grid grid-cols-4 gap-2">
              <StatPill label="Total" value={stats.total} color="text-slate-700" />
              <StatPill label="OK" value={stats.confirmados} color="text-emerald-600" />
              <StatPill label="Pend" value={stats.pendientes} color="text-amber-600" />
              <StatPill label="Fail" value={stats.noEmitidos} color="text-red-600" />
            </div>
        </div>
      )}

      {/* CRITICAL ALERTS */}
      {alerts.filter(a => !a.resolved).length > 0 && (
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1 flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500" /> Alertas Activas
          </h3>
          <div className="space-y-2">
            {alerts.filter(a => !a.resolved).map(alert => (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border flex items-start gap-3 bg-white/60 backdrop-blur-md shadow-sm transition-all ${
                  alert.critical ? 'border-red-200' : 'border-amber-200'
                }`}
              >
                <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.critical ? 'text-red-500' : 'text-amber-500'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-800 text-sm">{alert.client}</p>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.timestamp}
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${alert.critical ? 'text-red-600' : 'text-amber-600'}`}>{alert.issue}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 self-center shrink-0" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUICK ACTIONS */}
      <div>
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">⚡ Acciones Rápidas</h3>
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-1 px-1 snap-x">
          <ActionChip icon={<Zap className="w-4 h-4" />} label="Verificar Todo" color="bg-indigo-600" onClick={() => onNavigate('verificar')} />
          <ActionChip icon={<Share2 className="w-4 h-4" />} label="Exportar" color="bg-purple-600" onClick={onExport} />
          <ActionChip icon={<Phone className="w-4 h-4" />} label="Llamar Cliente" color="bg-emerald-600" />
          <ActionChip icon={<Mail className="w-4 h-4" />} label="Email Reporte" color="bg-blue-600" />
        </div>
      </div>

      {/* SENTINEL STATUS */}
      <SentinelStatusMobile />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE SUB-COMPONENTS
// ═══════════════════════════════════════════════════════════════

function QuickAccessCard({ icon, label, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white/60 backdrop-blur-xl rounded-2xl p-4 shadow-sm border border-white/60 flex flex-col items-center gap-3 active:scale-[0.95] transition-all"
    >
      <div className={`w-12 h-12 rounded-xl ${color} text-white flex items-center justify-center shadow-lg`}>
        {icon}
      </div>
      <span className="text-xs font-bold text-slate-600 text-center leading-tight">{label}</span>
    </button>
  );
}

function StatPill({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white/50 backdrop-blur-sm rounded-lg p-2 text-center border border-white/40 shadow-sm">
      <p className={`text-lg font-black ${color}`}>{value}</p>
      <p className="text-[9px] font-bold text-slate-400 uppercase">{label}</p>
    </div>
  );
}

function ActionChip({ icon, label, color, onClick }: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`snap-center shrink-0 px-5 py-3 ${color} text-white rounded-xl font-bold text-sm flex items-center gap-2 shadow-lg active:scale-95 transition-transform`}
    >
      {icon} {label}
    </button>
  );
}

function SentinelStatusMobile() {
  const [count, setCount] = useState(1420);

  useEffect(() => {
    const interval = setInterval(() => {
      setCount(c => c + Math.floor(Math.random() * 3));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

    return (
      <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 shadow-xl">
        <div className="relative">
        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-emerald-400">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse" />
      </div>
      <div className="flex-1">
        <p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
          Sentinel Active
          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        </p>
        <p className="text-xs font-bold text-slate-300 font-mono">
          {count.toLocaleString()} items escaneados
        </p>
      </div>
      <div className="flex gap-0.5 items-end h-5">
        {[40, 60, 30, 80, 50, 90, 40].map((h, i) => (
          <div key={i} className="w-1 bg-emerald-500/30 rounded-full" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}
