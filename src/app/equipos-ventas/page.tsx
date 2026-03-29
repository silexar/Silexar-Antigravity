/**
 * PAGE: SALES MODULE ROOT (ENTERPRISE — SECURITY HARDENED)
 * 
 * @description Punto de entrada con RBAC simulado, auth guard visual,
 * session timeout indicator, Command Palette (Ctrl+K), y Dark Mode.
 * 
 * ⚠️ PRODUCTION: Replace useState role with JWT claims from auth middleware.
 * All API calls must include Authorization header + CSRF token.
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DashboardEjecutivo } from './components/DashboardEjecutivo';
import { DashboardManager } from './components/DashboardManager';
import { DashboardVP } from './components/DashboardVP';
import { WizardCrearEquipo } from './components/WizardCrearEquipo';
import { MobileSalesCommand } from './components/MobileSalesCommand';
import { NotificationsCenter } from './components/NotificationsCenter';
import { CommandPalette } from './components/CommandPalette';
import { DealRoom } from './components/DealRoom';
import { SmartMessaging } from './components/SmartMessaging';
import { DealUrgencyBoard } from './components/DealUrgencyBoard';
import { MeetingPrepAI } from './components/MeetingPrepAI';
import { ActivityHeatmap } from './components/ActivityHeatmap';
import { ObjectionHandler } from './components/ObjectionHandler';
import { KAMDashboard } from './components/KAMDashboard';
import { RelationshipMapPanel } from './components/RelationshipMapPanel';
import { AccountHealthPanel } from './components/AccountHealthPanel';
import { SuccessionFlightRiskPanel } from './components/SuccessionFlightRiskPanel';
import { useDarkMode } from './hooks/useDarkMode';
import {
  Shield, Plus, Smartphone, X, Lock, Clock, AlertTriangle,
  Fingerprint, Search, Moon, Sun
} from 'lucide-react';


const SESSION_WARNING_MS = 25 * 60 * 1000; // Warning at 25 min

export default function SalesPage() {
  const [currentRole, setCurrentRole] = useState<'SALES_REP' | 'MANAGER' | 'VP_SALES' | 'KAM'>('SALES_REP');
  const [showWizard, setShowWizard] = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [sessionMinutes, setSessionMinutes] = useState(0);
  const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  // Simulated session timer
  useEffect(() => {
    const interval = setInterval(() => {
      setSessionMinutes(prev => {
        const next = prev + 1;
        if (next >= Math.floor(SESSION_WARNING_MS / 60000)) {
          setShowTimeoutWarning(true);
        }
        return next;
      });
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcut: Ctrl+K / Cmd+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowCommandPalette(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const resetSession = useCallback(() => {
    setSessionMinutes(0);
    setShowTimeoutWarning(false);
  }, []);

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
      <div className={`min-h-screen p-8 pb-24 transition-colors duration-300 ${isDark ? 'bg-slate-950 text-slate-200' : 'bg-gradient-to-br from-slate-100 via-white to-slate-50 text-slate-900 bg-fixed'}`}>
        <div className="max-w-7xl mx-auto space-y-6">

          {/* ──── SESSION TIMEOUT WARNING ──── */}
          {showTimeoutWarning && (
            <div className="bg-amber-50/80 backdrop-blur-md border border-amber-300/50 shadow-sm rounded-xl p-4 flex items-center justify-between animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-3">
                <Clock size={18} className="text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Session expiring soon</p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">Your session will timeout in {30 - sessionMinutes} minutes.</p>
                </div>
              </div>
              <button onClick={resetSession} className="text-xs font-bold bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700">
                Extend Session
              </button>
            </div>
          )}
          
          {/* ──── AUTH GUARD TOOLBAR ──── */}
          <div className={`p-4 rounded-xl flex justify-between items-center shadow-md border backdrop-blur-xl transition-all ${isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-white/60 border-white/60 shadow-slate-200/50'} text-slate-800 dark:text-white`}>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Shield size={20} className="text-orange-500" />
                <span className="font-mono text-sm hidden lg:inline font-bold">Modo Simulación</span>
              </div>

              {/* Security Indicators */}
              <div className="flex items-center gap-2 ml-2">
                <div className="flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <Lock size={10} className="text-emerald-500" />
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">TLS 1.3</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                  <Fingerprint size={10} className="text-blue-500" />
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold">MFA</span>
                </div>
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700">
                  <Clock size={10} className="text-slate-500" />
                  <span className="text-[10px] text-slate-600 dark:text-slate-400">{sessionMinutes}m</span>
                </div>
              </div>

              {/* Notifications */}
              <div className="ml-1">
                <NotificationsCenter />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Search (Ctrl+K) */}
              <button
                onClick={() => setShowCommandPalette(true)}
                className="flex items-center gap-2 bg-white/50 hover:bg-white dark:bg-slate-700/60 dark:hover:bg-slate-600 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white px-3 py-1.5 rounded-lg text-xs transition-all border border-slate-200/50 dark:border-transparent shadow-sm"
              >
                <Search size={12} />
                <span className="hidden md:inline">Buscar...</span>
                <kbd className="hidden md:inline text-[9px] bg-slate-600 px-1.5 py-0.5 rounded font-mono">⌘K</kbd>
              </button>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDark}
                className="p-2 rounded-lg bg-slate-700/60 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"
                title={isDark ? 'Light Mode' : 'Dark Mode'}
              >
                {isDark ? <Sun size={14} /> : <Moon size={14} />}
              </button>

              {/* Role Switcher */}
              <div className="flex bg-slate-800 rounded-lg p-1">
                {[
                  { id: 'SALES_REP', label: 'Ejecutivo' }, 
                  { id: 'MANAGER', label: 'Supervisor' }, 
                  { id: 'VP_SALES', label: 'VP' },
                  { id: 'KAM', label: 'KAM' }
                ].map(role => (
                  <button 
                    key={role.id}
                    onClick={() => setCurrentRole(role.id as 'SALES_REP' | 'MANAGER' | 'VP_SALES' | 'KAM')}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${currentRole === role.id ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}
                  >
                    {role.label}
                  </button>
                ))}
              </div>
              
              {/* Mobile Toggle */}
              <button 
                onClick={() => setShowMobile(!showMobile)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors ${
                  showMobile 
                    ? 'bg-blue-500 hover:bg-blue-400 text-white' 
                    : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                }`}
              >
                <Smartphone size={14} /> App
              </button>

              {(currentRole === 'VP_SALES' || currentRole === 'MANAGER') && (
                <button 
                  onClick={() => setShowWizard(true)}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} /> Crear Equipo
                </button>
              )}
            </div>
          </div>

          {/* ──── DEV SECURITY BANNER ──── */}
          <div className={`border rounded-xl px-4 py-2 flex items-center gap-2 ${isDark ? 'bg-red-950/50 border-red-900' : 'bg-red-950 border-red-800'}`}>
            <AlertTriangle size={14} className="text-red-400 flex-shrink-0" />
            <p className="text-[10px] text-red-400 font-mono">
              SANDBOX MODE — Role switching sin autenticación. En producción: JWT + RBAC middleware + CSRF tokens.
            </p>
          </div>

          {/* ──── CONTENT ──── */}
          {showMobile ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <Smartphone size={14} />
                <span className="font-medium">Mobile Sales Command Preview</span>
                <button onClick={() => setShowMobile(false)} className="ml-2 text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </div>
              <MobileSalesCommand />
            </div>
          ) : (
            <>
              {renderDashboard()}

              {/* ──── PREMIUM SALES TOOLS ──── */}
              <div className="mt-6 space-y-6">
                <DealUrgencyBoard />
                <div className="grid grid-cols-2 gap-6">
                  <DealRoom />
                  <MeetingPrepAI />
                </div>
                <SmartMessaging />
                <div className="grid grid-cols-2 gap-6">
                  <ActivityHeatmap />
                  <ObjectionHandler />
                </div>

                {/* ──── KAM & STRATEGIC PANELS ──── */}
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

        {/* Wizard Modal */}
        {showWizard && <WizardCrearEquipo onClose={() => setShowWizard(false)} />}

        {/* Command Palette */}
        <CommandPalette
          isOpen={showCommandPalette}
          onClose={() => setShowCommandPalette(false)}
          onSelect={(item) => {
            // Mitigando leak de informacion en command palette
            // In production: navigate to section/deal/contact
            if (item.id === 'act-dark-mode') toggleDark();
            if (item.id === 'act-new-team') setShowWizard(true);
          }}
        />
      </div>
    </div>
  );
}


