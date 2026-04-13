/**
 * COMPONENT: MOBILE SALES COMMAND — Complete Mobile App
 * 
 * @description Vista móvil completa que refleja el módulo desktop.
 * Soporta multi-rol (Ejecutivo, Manager, VP) con contenido adaptado.
 * Bottom tabs funcionales con contenido real en cada pestaña:
 *   Home → Morning Brief + KPIs
 *   Pipeline → Deals activos con quick-actions
 *   Activity → Actividad diaria + Agenda
 *   Team → Mi equipo / Teams (según rol)
 *   More → Comisiones, Coaching, Leaderboard, Notificaciones
 * 
 * @version 2.0.0
 */

'use client';

import React, { useState } from 'react';
import {
  Home, Users, Target, MoreHorizontal,
  ChevronRight, Phone, AlertTriangle,
  Bell, DollarSign,
  Calendar, ArrowUpRight, Shield, Smartphone,
  Mail, Brain,
  Trophy, BookOpen, Activity, FileText,
  ChevronDown,
  Briefcase, PieChart, Search, Moon, Sun,
  Crown, Heart, ShieldAlert
} from 'lucide-react';
import { MobileDealRoom } from './MobileDealRoom';
import { MobileSmartMessaging } from './MobileSmartMessaging';
import { MobileDealUrgency } from './MobileDealUrgency';
import { MobileMeetingPrep } from './MobileMeetingPrep';
import { MobileActivityHeatmap } from './MobileActivityHeatmap';
import { MobileObjectionHandler } from './MobileObjectionHandler';
import { MobileKAMDashboard } from './MobileKAMDashboard';
import { MobileRelationshipMap } from './MobileRelationshipMap';
import { MobileAccountHealth } from './MobileAccountHealth';
import { MobileSuccessionFlightRisk } from './MobileSuccessionFlightRisk';

/* ─── TYPES ───────────────────────────────────────────────────── */

type MobileTab = 'home' | 'pipeline' | 'activity' | 'team' | 'more';
type MobileRole = 'ejecutivo' | 'manager' | 'vp' | 'kam';
type MobileSubView = '' | 'dealroom' | 'messaging' | 'urgency' | 'meetprep' | 'heatmap' | 'objections' | 'kam-dashboard' | 'kam-relationships' | 'kam-health' | 'kam-succession';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MOCK_BRIEF = {
  greeting: 'Buenos días',
  userName: 'Ana García',
  attainment: 75,
  quota: 100000,
  currentSales: 75000,
  dealsAtRisk: 1,
  meetingsToday: 4,
  pendingFollowUps: 3,
  aiTip: 'Focus en cerrar Retail Giant ($120K) hoy — alcanzás 95% de quota.',
};

const MOCK_DEALS = [
  { id: 'd-1', client: 'TechCorp SA', amount: 50000, stage: 'Propuesta', prob: 60, nextStep: 'Llamar para confirmar', days: 2, signal: '🟢' },
  { id: 'd-2', client: 'Retail Giant', amount: 120000, stage: 'Negociación', prob: 80, nextStep: 'Enviar pricing final', days: 7, signal: '🟡' },
  { id: 'd-3', client: 'Startup Inc', amount: 15000, stage: 'Cerrado ✅', prob: 100, nextStep: 'Facturar', days: 0, signal: '✅' },
];

const MOCK_AGENDA = [
  { time: '10:00', title: 'Demo TechCorp', type: 'demo', client: 'TechCorp SA' },
  { time: '11:30', title: 'Call Cierre Retail Giant', type: 'call', client: 'Retail Giant' },
  { time: '13:00', title: 'Almuerzo Prospect', type: 'meeting', client: 'FinanzasPlus' },
  { time: '14:30', title: 'Follow-up HealthTech', type: 'call', client: 'HealthTech Labs' },
  { time: '16:00', title: '1:1 con Manager', type: 'internal', client: 'Interno' },
];

const MOCK_ACTIVITIES = [
  { type: 'Llamadas', done: 4, target: 8, icon: Phone, color: 'text-blue-500' },
  { type: 'Emails', done: 12, target: 15, icon: Mail, color: 'text-purple-500' },
  { type: 'Reuniones', done: 2, target: 4, icon: Users, color: 'text-emerald-500' },
  { type: 'Demos', done: 1, target: 2, icon: Briefcase, color: 'text-orange-500' },
];

const MOCK_TEAM_MEMBERS = [
  { name: 'Ana García', attainment: 141, status: 'active', calls: 12 },
  { name: 'Roberto Silva', attainment: 121, status: 'active', calls: 8 },
  { name: 'Carlos Ruiz', attainment: 83, status: 'idle', calls: 3 },
  { name: 'Elena Torres', attainment: 60, status: 'active', calls: 6 },
];

const MOCK_LEADERBOARD = [
  { pos: 1, name: 'Ana García', pct: 141, badge: '🏆' },
  { pos: 2, name: 'Roberto Silva', pct: 121, badge: '💎' },
  { pos: 3, name: 'Carlos Ruiz', pct: 83, badge: '⭐' },
];

const MOCK_COACHING = [
  { skill: 'Discovery', progress: 72, color: 'bg-blue-500' },
  { skill: 'Negociación', progress: 45, color: 'bg-purple-500' },
  { skill: 'Closing', progress: 88, color: 'bg-emerald-500' },
];

const MOCK_NOTIFICATIONS = [
  { text: 'Retail Giant: deal at risk — 3 días restantes', type: 'warning', time: '45m' },
  { text: 'Comisión de enero aprobada: $4,500', type: 'success', time: '2h' },
  { text: 'Meeting HealthTech reprogramada a 14:30', type: 'info', time: '3h' },
];

/* ─── BOTTOM TABS CONFIG ──────────────────────────────────────── */

const TABS: { key: MobileTab; icon: React.ElementType; label: string }[] = [
  { key: 'home', icon: Home, label: 'Home' },
  { key: 'pipeline', icon: Target, label: 'Pipeline' },
  { key: 'activity', icon: Activity, label: 'Actividad' },
  { key: 'team', icon: Users, label: 'Equipo' },
  { key: 'more', icon: MoreHorizontal, label: 'Más' },
];

const TYPE_COLORS: Record<string, string> = {
  demo: 'bg-purple-500',
  call: 'bg-blue-500',
  meeting: 'bg-emerald-500',
  internal: 'bg-slate-400',
};

/* ─── TAB CONTENT COMPONENTS ─────────────────────────────────── */

/** HOME TAB — Morning Brief + KPIs */
const HomeTab = ({ role }: { role: MobileRole }) => (
  <div className="space-y-4">
    {/* AI Morning Brief */}
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-4 border border-orange-100">
      <div className="flex items-center gap-1.5 mb-2">
        <Brain size={12} className="text-orange-500" />
        <span className="text-[10px] uppercase font-bold text-orange-600 tracking-widest">IA Morning Brief</span>
      </div>
      <p className="text-xs text-orange-800">{MOCK_BRIEF.aiTip}</p>
    </div>

    {/* Quick KPIs */}
    <div className="grid grid-cols-2 gap-2">
      <div className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Attainment</p>
        <p className={`text-2xl font-bold ${MOCK_BRIEF.attainment >= 100 ? 'text-emerald-600' : MOCK_BRIEF.attainment >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
          {MOCK_BRIEF.attainment}%
        </p>
        <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1">
          <div className={`h-1.5 rounded-full ${MOCK_BRIEF.attainment >= 100 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${Math.min(MOCK_BRIEF.attainment, 100)}%` }} />
        </div>
      </div>
      <div className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Ventas</p>
        <p className="text-2xl font-bold text-slate-800">${(MOCK_BRIEF.currentSales / 1000).toFixed(0)}K</p>
        <p className="text-[10px] text-slate-400">/ ${(MOCK_BRIEF.quota / 1000).toFixed(0)}K quota</p>
      </div>
      <div className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Reuniones</p>
        <p className="text-2xl font-bold text-blue-600">{MOCK_BRIEF.meetingsToday}</p>
        <p className="text-[10px] text-slate-400">hoy</p>
      </div>
      <div className="bg-white/60 backdrop-blur-md rounded-xl p-3 border border-white/60 shadow-sm">
        <p className="text-[10px] text-slate-400 uppercase font-semibold">Follow-ups</p>
        <p className="text-2xl font-bold text-amber-600">{MOCK_BRIEF.pendingFollowUps}</p>
        <p className="text-[10px] text-slate-400">pendientes</p>
      </div>
    </div>

    {/* Comisiones Mini */}
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 rounded-2xl p-4 text-white">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase font-bold text-emerald-200">Comisión Acumulada</p>
          <p className="text-2xl font-bold mt-1">$4,500</p>
          <p className="text-xs text-emerald-200">Potencial: $8,200</p>
        </div>
        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
          <DollarSign size={24} className="text-white" />
        </div>
      </div>
      <div className="mt-2 bg-white/20 rounded-full h-1.5">
        <div className="bg-white h-1.5 rounded-full" style={{ width: '55%' }} />
      </div>
      <p className="text-[10px] text-emerald-200 mt-1">55% hacia el objetivo • Tier 1</p>
    </div>

    {/* Role-specific content */}
    {role !== 'ejecutivo' && (
      <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
        <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
          <AlertTriangle size={10} className="text-red-500" /> Alertas del Equipo
        </h4>
        <div className="space-y-2">
          {MOCK_NOTIFICATIONS.map((n, i) => (
            <div key={`${n}-${i}`} className={`text-xs p-2.5 rounded-xl border ${
              n.type === 'warning' ? 'bg-red-50 border-red-100 text-red-700' :
              n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
              'bg-blue-50 border-blue-100 text-blue-700'
            }`}>
              <div className="flex justify-between">
                <span className="font-medium">{n.text}</span>
                <span className="text-slate-400 ml-2 flex-shrink-0">{n.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* KAM-specific content */}
    {role === 'kam' && (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl p-4 border border-amber-100">
        <p className="text-[10px] uppercase font-bold text-amber-600 tracking-widest mb-1">KAM Quick Stats</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="text-center">
            <p className="text-lg font-bold text-slate-800">$847K</p>
            <p className="text-[9px] text-slate-400">Portfolio</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-emerald-600">94%</p>
            <p className="text-[9px] text-slate-400">Health Avg</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-bold text-blue-600">7</p>
            <p className="text-[9px] text-slate-400">Expansion</p>
          </div>
        </div>
      </div>
    )}
  </div>
);

/** PIPELINE TAB — Deals with Quick Actions + Mini Kanban */
const PipelineTab = () => {
  const [expandedDeal, setExpandedDeal] = useState<string | null>(null);

  const KANBAN_STAGES = [
    { label: 'Prospección', count: 2, value: 125, color: 'bg-slate-400' },
    { label: 'Discovery', count: 1, value: 35, color: 'bg-blue-500' },
    { label: 'Propuesta', count: 2, value: 78, color: 'bg-purple-500' },
    { label: 'Negociación', count: 1, value: 120, color: 'bg-amber-500' },
    { label: 'Cerrado', count: 1, value: 15, color: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-3">
      {/* Mini Kanban — Horizontal Stages */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
        {KANBAN_STAGES.map(stage => (
          <div key={stage.label} className="flex-shrink-0 w-24 bg-white/60 backdrop-blur-md rounded-xl p-2.5 border border-white/60 shadow-sm text-center">
            <div className={`w-2 h-2 rounded-full ${stage.color} mx-auto mb-1`} />
            <p className="text-[9px] font-bold text-slate-500 uppercase">{stage.label}</p>
            <p className="text-sm font-bold text-slate-800">{stage.count}</p>
            <p className="text-[9px] text-slate-400">${stage.value}K</p>
          </div>
        ))}
      </div>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
          <Target size={12} className="text-blue-500" /> Mis Oportunidades
        </h3>
        <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{MOCK_DEALS.length} deals</span>
      </div>
      {MOCK_DEALS.map(deal => (
        <div key={deal.id} className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 shadow-sm overflow-hidden">
          <button
            onClick={() => setExpandedDeal(expandedDeal === deal.id ? null : deal.id)}
            className="w-full p-4 text-left active:bg-slate-50 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{deal.signal}</span>
                  <span className="font-semibold text-sm text-slate-800">{deal.client}</span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{deal.stage} • {deal.prob}% prob</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-sm text-slate-800">${(deal.amount / 1000).toFixed(0)}K</p>
                {deal.days > 0 && (
                  <p className={`text-[10px] ${deal.days >= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                    {deal.days}d sin actividad
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 bg-blue-50 rounded-lg px-3 py-1.5 flex items-center gap-1">
              <ArrowUpRight size={10} className="text-blue-500" />
              <span className="text-[11px] text-blue-700 font-medium">{deal.nextStep}</span>
            </div>
          </button>

          {/* Expanded Quick Actions */}
          {expandedDeal === deal.id && (
            <div className="px-4 pb-4 pt-0 border-t border-slate-50 animate-in slide-in-from-top-1 duration-200">
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { icon: Phone, label: 'Llamar', color: 'bg-blue-500' },
                  { icon: Mail, label: 'Email', color: 'bg-purple-500' },
                  { icon: Calendar, label: 'Agendar', color: 'bg-emerald-500' },
                  { icon: FileText, label: 'Nota', color: 'bg-amber-500' },
                ].map(action => (
                  <button key={action.label} className="flex flex-col items-center gap-1 py-2 rounded-xl active:scale-95 transition-transform">
                    <div className={`w-10 h-10 ${action.color} rounded-xl flex items-center justify-center text-white`}>
                      <action.icon size={16} />
                    </div>
                    <span className="text-[10px] font-medium text-slate-600">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

/** ACTIVITY TAB — Daily Tracker + Agenda */
const ActivityTab = () => (
  <div className="space-y-4">
    {/* Daily Activity */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
        <Activity size={12} className="text-orange-500" /> Actividad de Hoy
      </h4>
      <div className="grid grid-cols-2 gap-3">
        {MOCK_ACTIVITIES.map(a => {
          const pct = Math.round((a.done / a.target) * 100);
          return (
            <div key={a.type} className="flex items-center gap-3 p-2 rounded-xl bg-slate-50">
              <div className="relative w-10 h-10">
                <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                  <path className="text-slate-200" strokeDasharray="100,100" strokeWidth="3" fill="none" stroke="currentColor" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                  <path className={a.color} strokeDasharray={`${pct},100`} strokeWidth="3" fill="none" stroke="currentColor" strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                </svg>
                <a.icon size={12} className={`absolute inset-0 m-auto ${a.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-700">{a.type}</p>
                <p className="text-[10px] text-slate-400">{a.done}/{a.target}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>

    {/* Agenda */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
        <Calendar size={12} className="text-blue-500" /> Agenda
        <span className="text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-full ml-1">{MOCK_AGENDA.length}</span>
      </h4>
      <div className="space-y-2">
        {MOCK_AGENDA.map((ev, i) => (
          <div key={`${ev}-${i}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors">
            <div className={`w-1 h-8 rounded-full ${TYPE_COLORS[ev.type] || 'bg-slate-300'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{ev.title}</p>
              <p className="text-[10px] text-slate-400">{ev.time} • {ev.client}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** TEAM TAB — Reps + Quick Stats */
const TeamTab = ({ role }: { role: MobileRole }) => (
  <div className="space-y-4">
    {/* Team Members */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
        <Users size={12} className="text-blue-500" /> {role === 'ejecutivo' ? 'Mi Posición' : 'Mi Equipo'}
      </h4>
      <div className="space-y-2">
        {MOCK_TEAM_MEMBERS.map((m, i) => (
          <div key={`${m}-${i}`} className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 active:bg-slate-50 transition-colors">
            <div className={`w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-emerald-400' : 'bg-slate-300'}`} />
            <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-500">
              #{i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-800 truncate">{m.name}</p>
              <p className="text-[10px] text-slate-400">{m.calls} calls hoy</p>
            </div>
            <span className={`text-sm font-bold ${m.attainment >= 120 ? 'text-emerald-600' : m.attainment >= 100 ? 'text-blue-600' : 'text-amber-600'}`}>
              {m.attainment}%
            </span>
          </div>
        ))}
      </div>
    </div>

    {/* Mini Leaderboard */}
    <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-4 text-white">
      <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1">
        <Trophy size={10} className="text-amber-400" /> Top Performers
      </h4>
      <div className="space-y-2">
        {MOCK_LEADERBOARD.map(entry => (
          <div key={entry.pos} className="flex items-center gap-3 bg-white/5 rounded-xl p-2.5 border border-white/5">
            <span className="text-lg">{entry.badge}</span>
            <div className="flex-1">
              <p className="text-xs font-semibold">{entry.name}</p>
            </div>
            <span className="text-sm font-bold text-emerald-400">{entry.pct}%</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/** MORE TAB (with Dark Mode toggle) */
const MoreTabContent = ({ onToggleDark, isDarkMode, onOpenSubView }: { onToggleDark: () => void; isDarkMode: boolean; onOpenSubView: (v: MobileSubView) => void }) => (
  <div className="space-y-4">
    {/* Dark Mode Toggle */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm flex items-center justify-between">
      <div className="flex items-center gap-3">
        {isDarkMode ? <Moon size={16} className="text-indigo-500" /> : <Sun size={16} className="text-amber-500" />}
        <div>
          <p className="text-xs font-semibold text-slate-700">Modo Oscuro</p>
          <p className="text-[10px] text-slate-400">{isDarkMode ? 'Activado' : 'Desactivado'}</p>
        </div>
      </div>
      <button
        onClick={onToggleDark}
        className={`w-11 h-6 rounded-full transition-colors relative ${isDarkMode ? 'bg-indigo-500' : 'bg-slate-200'}`}
      >
        <div className={`w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-[22px]' : 'translate-x-0.5'}`} />
      </button>
    </div>

    {/* Search */}
    <button className="w-full bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 flex items-center gap-3 active:scale-95 transition-transform shadow-sm">
      <Search size={16} className="text-slate-400" />
      <span className="text-xs font-semibold text-slate-500">Buscar deals, contactos, secciones...</span>
    </button>
    {/* Coaching Progress */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
        <Brain size={12} className="text-violet-500" /> Mi Desarrollo
      </h4>
      {MOCK_COACHING.map(c => (
        <div key={c.skill} className="mb-3 last:mb-0">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600 font-medium">{c.skill}</span>
            <span className="text-slate-500 font-bold">{c.progress}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div className={`h-2 rounded-full ${c.color} transition-all`} style={{ width: `${c.progress}%` }} />
          </div>
        </div>
      ))}
      <button className="text-xs font-semibold text-violet-600 flex items-center gap-1 mt-3">
        <BookOpen size={12} /> Ver plan completo <ChevronRight size={12} />
      </button>
    </div>

    {/* Notificaciones */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl p-4 border border-white/60 shadow-sm">
      <h4 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-1">
        <Bell size={12} className="text-red-500" /> Notificaciones
      </h4>
      <div className="space-y-2">
        {MOCK_NOTIFICATIONS.map((n, i) => (
          <div key={`${n}-${i}`} className={`p-3 rounded-xl border text-xs ${
            n.type === 'warning' ? 'bg-red-50 border-red-100 text-red-700' :
            n.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
            'bg-blue-50 border-blue-100 text-blue-700'
          }`}>
            <div className="flex justify-between items-start">
              <p className="font-medium">{n.text}</p>
              <span className="text-slate-400 ml-2 flex-shrink-0">{n.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Quick Links */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-sm">
      {[
        { label: 'Calculadora de Comisiones', icon: DollarSign, color: 'text-emerald-500' },
        { label: 'Forecast Colaborativo', icon: PieChart, color: 'text-blue-500' },
        { label: 'Seguridad & RBAC', icon: Shield, color: 'text-red-500' },
      ].map((link, i) => (
        <button key={`${link}-${i}`} className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-b-0 active:bg-slate-50 transition-colors">
          <link.icon size={16} className={link.color} />
          <span className="text-xs font-semibold text-slate-700 flex-1 text-left">{link.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
      ))}
    </div>

    {/* Premium Sales Tools */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-sm">
      <p className="px-4 py-2 text-[10px] font-bold text-slate-400 uppercase border-b border-white/60">Premium Tools</p>
      {[
        { key: 'dealroom' as MobileSubView, label: 'Deal Room 360°', icon: Briefcase, color: 'text-indigo-500' },
        { key: 'messaging' as MobileSubView, label: 'Smart Messaging IA', icon: Mail, color: 'text-purple-500' },
        { key: 'urgency' as MobileSubView, label: 'Urgencia Deals', icon: AlertTriangle, color: 'text-red-500' },
        { key: 'meetprep' as MobileSubView, label: 'Meeting Prep IA', icon: BookOpen, color: 'text-emerald-500' },
        { key: 'heatmap' as MobileSubView, label: 'Mi Actividad', icon: Activity, color: 'text-green-500' },
        { key: 'objections' as MobileSubView, label: 'Objection Handler', icon: Shield, color: 'text-rose-500' },
      ].map((link, i) => (
        <button key={`${link}-${i}`} onClick={() => onOpenSubView(link.key)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-b-0 active:bg-slate-50 transition-colors">
          <link.icon size={16} className={link.color} />
          <span className="text-xs font-semibold text-slate-700 flex-1 text-left">{link.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
      ))}
    </div>

    {/* KAM Tools */}
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white/60 overflow-hidden shadow-sm">
      <p className="px-4 py-2 text-[10px] font-bold text-amber-500 uppercase border-b border-white/60">KAM Tools</p>
      {[
        { key: 'kam-dashboard' as MobileSubView, label: 'KAM Dashboard', icon: Crown, color: 'text-amber-500' },
        { key: 'kam-relationships' as MobileSubView, label: 'Relationship Map', icon: Users, color: 'text-violet-500' },
        { key: 'kam-health' as MobileSubView, label: 'Account Health', icon: Heart, color: 'text-pink-500' },
        { key: 'kam-succession' as MobileSubView, label: 'Succession & Flight Risk', icon: ShieldAlert, color: 'text-red-500' },
      ].map((link, i) => (
        <button key={`${link}-${i}`} onClick={() => onOpenSubView(link.key)}
          className="w-full flex items-center gap-3 px-4 py-3.5 border-b border-slate-50 last:border-b-0 active:bg-slate-50 transition-colors">
          <link.icon size={16} className={link.color} />
          <span className="text-xs font-semibold text-slate-700 flex-1 text-left">{link.label}</span>
          <ChevronRight size={14} className="text-slate-300" />
        </button>
      ))}
    </div>
  </div>
);

/* ─── MAIN COMPONENT ──────────────────────────────────────────── */

export const MobileSalesCommand = () => {
  const [activeTab, setActiveTab] = useState<MobileTab>('home');
  const [role, setRole] = useState<MobileRole>('ejecutivo');
  const [showRolePicker, setShowRolePicker] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [subView, setSubView] = useState<MobileSubView>('');
  const notifCount = MOCK_NOTIFICATIONS.length;

  // Safe function to prevent object injection
  const getRoleLabel = (r: MobileRole): string => {
    switch (r) {
      case 'ejecutivo': return 'Ejecutivo';
      case 'manager': return 'Manager';
      case 'vp': return 'VP';
      case 'kam': return 'KAM';
      default: return 'Ejecutivo';
    }
  };

  return (
    <div className="max-w-md mx-auto bg-slate-50 min-h-[700px] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative flex flex-col">

      {/* ──── STATUS BAR ──── */}
      <div className="bg-[#F0EDE8] text-white px-5 py-2 flex justify-between items-center text-xs">
        <span className="font-semibold">9:41</span>
        <div className="flex items-center gap-1">
          <Smartphone size={10} />
          <span className="font-mono text-[10px]">5G</span>
          <div className="w-5 h-2.5 border border-white/60 rounded-sm relative ml-1">
            <div className="absolute inset-[1px] right-[3px] bg-emerald-400 rounded-sm" />
          </div>
        </div>
      </div>

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white px-5 py-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Shield size={14} className="text-orange-400" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Sales Command</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Role Picker */}
              <button
                onClick={() => setShowRolePicker(!showRolePicker)}
                className="flex items-center gap-1 bg-white/10 rounded-lg px-2 py-1 text-[10px] font-semibold border border-white/10"
              >
                {getRoleLabel(role)}
                <ChevronDown size={10} />
              </button>
              {/* Notifications */}
              <div className="relative">
                <Bell size={18} className="text-slate-300" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold flex items-center justify-center">{notifCount}</span>
                )}
              </div>
            </div>
          </div>

          {/* Role Dropdown */}
          {showRolePicker && (
            <div className="absolute right-5 top-12 bg-white rounded-xl shadow-xl border border-slate-200 z-50 animate-in fade-in duration-150">
              {(['ejecutivo', 'manager', 'vp', 'kam'] as MobileRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => { setRole(r); setShowRolePicker(false); }}
                  className={`block w-full text-left px-4 py-2.5 text-xs font-medium first:rounded-t-xl last:rounded-b-xl transition-colors ${
                    role === r ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {getRoleLabel(r)}
                </button>
              ))}
            </div>
          )}

          {/* Compact Greeting */}
          <h2 className="text-base font-bold mt-3">{MOCK_BRIEF.greeting}, {MOCK_BRIEF.userName} 👋</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            <span className={`font-bold ${MOCK_BRIEF.attainment >= 100 ? 'text-emerald-400' : 'text-amber-400'}`}>{MOCK_BRIEF.attainment}%</span> de quota •{' '}
            {MOCK_BRIEF.meetingsToday} reuniones hoy
          </p>
        </div>
      </div>

      {/* ──── SCROLLABLE CONTENT ──── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-20">
        {activeTab === 'home' && <HomeTab role={role} />}
        {activeTab === 'pipeline' && <PipelineTab />}
        {activeTab === 'activity' && <ActivityTab />}
        {activeTab === 'team' && <TeamTab role={role} />}
        {activeTab === 'more' && subView === '' && <MoreTabContent onToggleDark={() => setIsDarkMode(!isDarkMode)} isDarkMode={isDarkMode} onOpenSubView={setSubView} />}
        {activeTab === 'more' && subView === 'dealroom' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileDealRoom /></>}
        {activeTab === 'more' && subView === 'messaging' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileSmartMessaging /></>}
        {activeTab === 'more' && subView === 'urgency' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileDealUrgency /></>}
        {activeTab === 'more' && subView === 'meetprep' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileMeetingPrep /></>}
        {activeTab === 'more' && subView === 'heatmap' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileActivityHeatmap /></>}
        {activeTab === 'more' && subView === 'objections' && <><button onClick={() => setSubView('')} className="text-xs text-indigo-600 font-bold mb-2">← Volver</button><MobileObjectionHandler /></>}
        {activeTab === 'more' && subView === 'kam-dashboard' && <><button onClick={() => setSubView('')} className="text-xs text-amber-600 font-bold mb-2">← Volver</button><MobileKAMDashboard /></>}
        {activeTab === 'more' && subView === 'kam-relationships' && <><button onClick={() => setSubView('')} className="text-xs text-amber-600 font-bold mb-2">← Volver</button><MobileRelationshipMap /></>}
        {activeTab === 'more' && subView === 'kam-health' && <><button onClick={() => setSubView('')} className="text-xs text-amber-600 font-bold mb-2">← Volver</button><MobileAccountHealth /></>}
        {activeTab === 'more' && subView === 'kam-succession' && <><button onClick={() => setSubView('')} className="text-xs text-amber-600 font-bold mb-2">← Volver</button><MobileSuccessionFlightRisk /></>}
      </div>

      {/* ──── BOTTOM NAVIGATION ──── */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-2 py-2 flex justify-around items-center safe-area-bottom">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${
              activeTab === tab.key
                ? 'text-orange-600'
                : 'text-slate-400'
            }`}
          >
            <tab.icon size={18} strokeWidth={activeTab === tab.key ? 2.5 : 1.5} />
            <span className={`text-[9px] font-medium ${activeTab === tab.key ? 'font-bold' : ''}`}>{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
