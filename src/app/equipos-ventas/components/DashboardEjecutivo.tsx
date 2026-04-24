/**
 * VIEW: DASHBOARD EJECUTIVO — Diseño Neumórfico Oficial
 * 
 * @description Vista principal para el Ejecutivo de Ventas.
 * Diseño neumórfico con base #dfeaff, sombras #bec8de y #ffffff.
 * Todo en español.
 */

'use client';

import React, { useState } from 'react';
import { ComisionesWidget } from './ComisionesWidget';
import { ForecastPanel } from './ForecastPanel';
import { SmartTodoPanel } from './SmartTodoPanel';
import { DailyActivityTracker } from './DailyActivityTracker';
import { DealQuickActions } from './DealQuickActions';
import { AgendaInteractiva } from './AgendaInteractiva';
import { PipelineKanban } from './PipelineKanban';
import { MOCK_USER, MOCK_DEALS } from '../mock-data';
import {
  Trophy, Brain,
  ArrowUpRight, Flame, BookOpen, ChevronRight,
  Sparkles, AlertTriangle, TrendingUp,
  MoreHorizontal, Target, Calendar, Phone, Mail
} from 'lucide-react';

/* ─── COLORES NEUMÓRFICOS ───────────────────────────────────────────────── */

const N = {
  base: '#dfeaff',
  dark: '#bec8de',
  light: '#ffffff',
  accent: '#6888ff',
  text: '#69738c',
  textSub: '#9aa3b8'
};

const gradientBase = 'linear-gradient(145deg, #e6e6e6, #ffffff)';

const shadowOut = (s: number) => `${s}px ${s}px ${s * 2}px ${N.dark}, -${s}px -${s}px ${s * 2}px ${N.light}`;
const shadowIn = (s: number) => `inset ${s}px ${s}px ${s * 2}px ${N.dark}, inset -${s}px -${s}px ${s * 2}px ${N.light}`;

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MORNING_BRIEF = {
  greeting: `Buenos días, ${MOCK_USER.name}`,
  topPriority: 'Retail Giant cierra en 3 días — llama a las 10AM',
  dealsAtRisk: 1,
  pendingFollowUps: 3,
  meetingsToday: 4,
  aiAdvice: 'Enfócate en cerrar Retail Giant ($120K) hoy. Si cierras, alcanzas 95% de quota.',
};

const MINI_LEADERBOARD = [
  { name: 'Ana García', attainment: 141, streak: 4, badge: '🏆' },
  { name: 'Roberto Silva', attainment: 121, streak: 3, badge: '💎' },
  { name: MOCK_USER.name, attainment: Math.round((MOCK_USER.currentSales / MOCK_USER.quota) * 100), streak: 1, badge: '⭐', isYou: true },
];

const COACHING_TIPS = [
  { title: 'Dominio de Descubrimiento', progress: 72, color: '#6888ff' },
  { title: 'Habilidades de Negociación', progress: 45, color: '#8b5cf6' },
  { title: 'Técnicas de Cierre', progress: 88, color: '#10b981' },
];

const ENHANCED_DEALS = MOCK_DEALS.map((deal, i) => ({
  ...deal,
  nextStep: ['Llamar para confirmar decisión', 'Enviar propuesta revisada', 'Cerrado — facturar'][i] || 'Definir next step',
  daysSinceActivity: [2, 7, 0][i] || 0,
  aiSignal: ['🟢 En camino', '🟡 Necesita atención', '✅ Ganado'][i] || '',
}));

/* ─── COMPONENT ───────────────────────────────────────────── */

export const DashboardEjecutivo = () => {
  const userAttainment = Math.round((MOCK_USER.currentSales / MOCK_USER.quota) * 100);
  const [quickActionDeal, setQuickActionDeal] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── MORNING BRIEF NEUMÓRFICO ──── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, ${N.accent}, #5a77d9)`,
          boxShadow: shadowOut(6)
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.1),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} style={{ color: '#fef3c7' }} />
                <span className="text-xs uppercase font-bold tracking-widest" style={{ color: '#fef3c7' }}>Resumen Matutino</span>
              </div>
              <h2 className="text-2xl font-bold">{MORNING_BRIEF.greeting} 👋</h2>
              <p className="text-white/80 text-sm mt-1">
                Llevas <span className={`font-bold ${userAttainment >= 100 ? 'text-emerald-300' : userAttainment >= 80 ? 'text-amber-300' : 'text-red-300'}`}>{userAttainment}%</span> de quota este mes
              </p>
              {/* Attainment bar */}
              <div className="w-64 rounded-full h-2 mt-3" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <div
                  className="h-2 rounded-full transition-all duration-1000"
                  style={{
                    width: `${Math.min(userAttainment, 100)}%`,
                    background: userAttainment >= 100 ? '#10b981' : userAttainment >= 80 ? '#f59e0b' : '#ef4444'
                  }}
                />
              </div>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.7)' }}>
                ${MOCK_USER.currentSales.toLocaleString()} / ${MOCK_USER.quota.toLocaleString()}
              </p>
            </div>
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-xl border-2"
              style={{
                background: userAttainment >= 100 ? 'rgba(16,185,129,0.2)' : userAttainment >= 80 ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)',
                borderColor: userAttainment >= 100 ? '#10b981' : userAttainment >= 80 ? '#f59e0b' : '#ef4444',
                color: 'white'
              }}
            >
              {userAttainment}%
            </div>
          </div>

          {/* AI Advice */}
          <div
            className="mt-4 p-3 rounded-xl flex items-start gap-2"
            style={{
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)'
            }}
          >
            <Brain size={16} style={{ color: '#fef3c7' }} className="mt-0.5 flex-shrink-0" />
            <p className="text-sm text-white/90">{MORNING_BRIEF.aiAdvice}</p>
          </div>
        </div>
      </div>

      {/* ──── STATS CARDS NEUMÓRFICAS ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Deals en Riesgo', value: MORNING_BRIEF.dealsAtRisk, icon: AlertTriangle, color: '#ef4444' },
          { label: 'Seguimientos Pendientes', value: MORNING_BRIEF.pendingFollowUps, icon: Phone, color: '#f59e0b' },
          { label: 'Reuniones Hoy', value: MORNING_BRIEF.meetingsToday, icon: Calendar, color: '#6888ff' },
          { label: 'Prioridad Máxima', value: '1', icon: Target, color: '#10b981' },
        ].map((stat, idx) => {
          const IconComponent = stat.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl p-4 transition-all hover:scale-[1.02]"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(4)
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <IconComponent size={16} style={{ color: stat.color }} />
                <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>{stat.label}</span>
              </div>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* ──── MINI LEADERBOARD NEUMÓRFICO ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
          <Trophy size={18} style={{ color: '#f59e0b' }} /> Tabla de Posiciones Rápida
        </h3>
        <div className="space-y-3">
          {MINI_LEADERBOARD.map((entry, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{
                background: gradientBase,
                boxShadow: entry.isYou ? shadowIn(3) : shadowOut(3),
                ...(entry.isYou ? { border: `2px solid ${N.accent}` } : {})
              }}
            >
              <span className="text-xl">{entry.badge}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm" style={{ color: '#1e293b' }}>{entry.name}</span>
                  {entry.isYou && (
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${N.accent}20`, color: N.accent }}>Tú</span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Flame size={12} style={{ color: '#ea580c' }} />
                  <span className="text-xs" style={{ color: N.textSub }}>{entry.streak} meses sobre quota</span>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded-full font-bold text-sm"
                style={{
                  background: entry.attainment >= 100 ? '#d1fae5' : '#fef3c7',
                  color: entry.attainment >= 100 ? '#059669' : '#d97706'
                }}
              >
                {entry.attainment}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── COACHING TIPS NEUMÓRFICO ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
          <BookOpen size={18} style={{ color: '#8b5cf6' }} /> Progreso de Coaching
        </h3>
        <div className="space-y-3">
          {COACHING_TIPS.map((tip, idx) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium" style={{ color: '#1e293b' }}>{tip.title}</span>
                  <span className="text-sm font-bold" style={{ color: tip.color }}>{tip.progress}%</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: '#e2e8f0' }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${tip.progress}%`, background: tip.color }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── DEALS LIST NEUMÓRFICO ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
          <TrendingUp size={18} style={{ color: N.accent }} /> Pipeline con AI Insights
        </h3>
        <div className="space-y-3">
          {ENHANCED_DEALS.map((deal, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl transition-all hover:scale-[1.01] cursor-pointer"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3)
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <span className="text-sm mt-1">{deal.aiSignal}</span>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{deal.clientName}</p>
                    <p className="text-xs" style={{ color: N.textSub }}>{deal.stage}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold" style={{ color: '#1e293b' }}>${deal.amount.toLocaleString()}</p>
                  <p className="text-xs" style={{ color: N.textSub }}>{deal.stage}</p>
                </div>
              </div>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-xs" style={{ color: N.text }}>📋 {deal.nextStep}</span>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#d1fae5', color: '#059669' }}
                  >
                    <Phone size={12} />
                  </button>
                  <button
                    className="p-1.5 rounded-lg transition-colors"
                    style={{ background: '#dbeafe', color: '#2563eb' }}
                  >
                    <Mail size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
