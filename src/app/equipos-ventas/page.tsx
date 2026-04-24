/**
 * PAGE: EQUIPOS DE VENTAS — SILEXAR PULSE TIER 0
 * Diseño Neumórfico Oficial
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useDarkMode } from './hooks/useDarkMode';

const lazyPanel = (loader: () => Promise<Record<string, React.ComponentType<any>>>, name: string): React.ComponentType<any> =>
  dynamic(() => loader().then((m) => {
    const entries = Object.entries(m);
    const found = entries.find(([key]) => key === name);
    return { default: found ? (found[1] as React.ComponentType<any>) : (() => null) };
  }), { loading: () => <div className="h-48 animate-pulse rounded-3xl" style={{ background: '#dfeaff', boxShadow: 'inset 4px 4px 8px #bec8de,inset -4px -4px 8px #ffffff' }} />, ssr: false });

const DashboardEjecutivo = lazyPanel(() => import('./components/DashboardEjecutivo'), 'DashboardEjecutivo');
const DashboardManager    = lazyPanel(() => import('./components/DashboardManager'), 'DashboardManager');
const DashboardVP         = lazyPanel(() => import('./components/DashboardVP'), 'DashboardVP');
const WizardCrearEquipo   = lazyPanel(() => import('./components/WizardCrearEquipo'), 'WizardCrearEquipo');
const MobileSalesCommand  = lazyPanel(() => import('./components/MobileSalesCommand'), 'MobileSalesCommand');
const NotificationsCenter = lazyPanel(() => import('./components/NotificationsCenter'), 'NotificationsCenter');
const CommandPalette      = lazyPanel(() => import('./components/CommandPalette'), 'CommandPalette');
const DealRoom            = lazyPanel(() => import('./components/DealRoom'), 'DealRoom');
const SmartMessaging      = lazyPanel(() => import('./components/SmartMessaging'), 'SmartMessaging');
const DealUrgencyBoard    = lazyPanel(() => import('./components/DealUrgencyBoard'), 'DealUrgencyBoard');
const MeetingPrepAI       = lazyPanel(() => import('./components/MeetingPrepAI'), 'MeetingPrepAI');
const ActivityHeatmap     = lazyPanel(() => import('./components/ActivityHeatmap'), 'ActivityHeatmap');
const ObjectionHandler    = lazyPanel(() => import('./components/ObjectionHandler'), 'ObjectionHandler');
const KAMDashboard        = lazyPanel(() => import('./components/KAMDashboard'), 'KAMDashboard');
const RelationshipMapPanel      = lazyPanel(() => import('./components/RelationshipMapPanel'), 'RelationshipMapPanel');
const AccountHealthPanel        = lazyPanel(() => import('./components/AccountHealthPanel'), 'AccountHealthPanel');
const SuccessionFlightRiskPanel = lazyPanel(() => import('./components/SuccessionFlightRiskPanel'), 'SuccessionFlightRiskPanel');

import {
  Shield, Plus, Smartphone, X, Lock, Clock, AlertTriangle,
  Fingerprint, Search, Moon, Sun, ArrowLeft, LayoutDashboard, Users
} from 'lucide-react';

const N = { base: '#dfeaff', dark: '#bec8de', light: '#ffffff', accent: '#6888ff', text: '#69738c', textSub: '#9aa3b8' };
const shadowOut = (s: number) => `${s}px ${s}px ${s*2}px ${N.dark}, -${s}px -${s}px ${s*2}px ${N.light}`;
const shadowIn  = (s: number) => `inset ${s}px ${s}px ${s*2}px ${N.dark}, inset -${s}px -${s}px ${s*2}px ${N.light}`;

const SESSION_WARNING_MS = 25 * 60 * 1000;

export default function SalesPage() {
  const router = useRouter();
  const [currentRole, setCurrentRole] = useState<'SALES_REP' | 'MANAGER' | 'VP_SALES' | 'KAM'>('SALES_REP');
  const [showWizard, setShowWizard] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(prev => {
        const next = prev + 1;
        if (next >= Math.floor(SESSION_WARNING_MS / 60000)) setShowTimeoutWarning(true);
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowCommandPalette(p => !p); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const resetSession = useCallback(() => { setSessionMinutes(0); setShowTimeoutWarning(false); }, []);

  const renderDashboard = () => {
    switch (currentRole) {
      case 'SALES_REP': return <DashboardEjecutivo />;
      case 'MANAGER': return <DashboardManager />;
      case 'VP_SALES': return <DashboardVP />;
      case 'KAM': return <KAMDashboard />;
      default: return <DashboardEjecutivo />;
    }
  };

  return (
    <div className={isDark ? 'dark' : ''}>
      <div className="min-h-screen p-6 lg:p-8 transition-colors duration-300" style={{ background: N.base, color: N.text }}>
        <div className="max-w-7xl mx-auto space-y-5">

          {/* Header con Volver */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="flex items-center justify-center w-9 h-9 rounded-xl transition-all" title="Volver al Dashboard"
              style={{ background: N.base, boxShadow: shadowOut(3), color: N.textSub }}>
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="p-2.5 rounded-xl" style={{ background: N.accent, boxShadow: shadowOut(3) }}>
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-black leading-none" style={{ color: N.text }}>Equipos de Ventas</h1>
              <p className="text-[10px] font-bold" style={{ color: N.textSub }}>Ejecutivos · Supervisores · VP · KAM</p>
            </div>
          </div>

          {/* Session Warning */}
          {showTimeoutWarning && (
            <div className="p-4 rounded-2xl flex items-center justify-between" style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
              <div className="flex items-center gap-3">
                <Clock size={18} style={{ color: '#f59e0b' }} />
                <div>
                  <p className="text-xs font-black" style={{ color: '#f59e0b' }}>Sesión expirando pronto</p>
                  <p className="text-[10px] font-bold" style={{ color: N.textSub }}>Timeout en {30 - sessionMinutes} minutos.</p>
                </div>
              </div>
              <button onClick={resetSession} className="text-xs font-bold px-3 py-1.5 rounded-lg text-white" style={{ background: '#f59e0b', boxShadow: shadowOut(2) }}>
                Extender
              </button>
            </div>
          )}

          {/* Toolbar Neumórfico */}
          <div className="p-3 rounded-2xl flex flex-wrap justify-between items-center gap-3" style={{ background: N.base, boxShadow: shadowOut(6) }}>
            <div className="flex items-center gap-2">
              <Shield size={18} style={{ color: N.accent }} />
              <span className="font-mono text-xs font-bold hidden lg:inline" style={{ color: N.text }}>Modo Simulación</span>
              <div className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', border: '1px solid rgba(34,197,94,0.2)' }}>
                <Lock size={10} /> TLS 1.3
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black"
                style={{ background: 'rgba(104,136,255,0.1)', color: N.accent, border: `1px solid ${N.accent}30` }}>
                <Fingerprint size={10} /> MFA
              </div>
              <div className="ml-1"><NotificationsCenter /></div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
                style={{ background: N.base, boxShadow: shadowIn(2), color: N.textSub }}>
                <Search size={12} /> <span className="hidden md:inline">Buscar...</span> <kbd className="hidden md:inline text-[9px] font-mono px-1 rounded" style={{ background: N.base, boxShadow: shadowIn(1) }}>⌘K</kbd>
              </button>
              <button onClick={toggleDark} className="p-2 rounded-xl transition-all" title={isDark ? 'Light Mode' : 'Dark Mode'}
                style={{ background: N.base, boxShadow: shadowOut(2), color: N.textSub }}>
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>
              <div className="flex rounded-xl p-1" style={{ background: N.base, boxShadow: shadowIn(2) }}>
                {[{ id: 'SALES_REP', label: 'Ejecutivo' }, { id: 'MANAGER', label: 'Supervisor' }, { id: 'VP_SALES', label: 'VP' }, { id: 'KAM', label: 'KAM' }].map(role => (
                  <button key={role.id} onClick={() => setCurrentRole(role.id as any)}
                    className="px-2.5 py-1.5 rounded-lg text-[11px] font-black transition-all"
                    style={currentRole === role.id ? { background: N.accent, color: '#fff', boxShadow: shadowOut(2) } : { color: N.textSub }}>
                    {role.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setShowMobile(!showMobile)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-all"
                style={showMobile ? { background: N.accent, color: '#fff', boxShadow: shadowOut(2) } : { background: N.base, boxShadow: shadowOut(2), color: N.textSub }}>
                <Smartphone size={14} /> App
              </button>
              {(currentRole === 'VP_SALES' || currentRole === 'MANAGER') && (
                <button onClick={() => setShowWizard(true)}
                  className="text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 text-white transition-all"
                  style={{ background: '#22c55e', boxShadow: shadowOut(2) }}>
                  <Plus size={14} /> Crear Equipo
                </button>
              )}
            </div>
          </div>

          {/* Sandbox Banner */}
          <div className="p-3 rounded-xl flex items-center gap-2" style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <AlertTriangle size={14} style={{ color: '#ef4444' }} />
            <p className="text-[10px] font-bold font-mono" style={{ color: '#ef4444' }}>
              SANDBOX MODE — Role switching sin autenticación. En producción: JWT + RBAC middleware + CSRF tokens.
            </p>
          </div>

          {/* Content */}
          {showMobile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: N.textSub }}>
                <Smartphone size={14} /> Mobile Sales Command Preview
                <button onClick={() => setShowMobile(false)} className="ml-2" style={{ color: N.textSub }}><X size={14} /></button>
              </div>
              <MobileSalesCommand />
            </div>
          ) : (
            <>
              {renderDashboard()}
              <div className="mt-6 space-y-6">
                <DealUrgencyBoard />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DealRoom />
                  <MeetingPrepAI />
                </div>
                <SmartMessaging />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ActivityHeatmap />
                  <ObjectionHandler />
                </div>
                {(currentRole === 'KAM' || currentRole === 'VP_SALES') && (
                  <>
                    <AccountHealthPanel />
                    <RelationshipMapPanel />
                    <SuccessionFlightRiskPanel />
                  </>
                )}
              </div>
            </>
          )}
        </div>

        {showWizard && <WizardCrearEquipo onClose={() => setShowWizard(false)} />}
        <CommandPalette isOpen={showCommandPalette} onClose={() => setShowCommandPalette(false)}
          onSelect={(item: { id: string }) => { if (item.id === 'act-dark-mode') toggleDark(); if (item.id === 'act-new-team') setShowWizard(true); }} />
      </div>
    </div>
  );
}
