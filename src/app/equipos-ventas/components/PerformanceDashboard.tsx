/**
 * COMPONENT: PERFORMANCE DASHBOARD — Centro de Inteligencia
 * 
 * @description Vista avanzada de rendimiento en tiempo real para un equipo.
 * Incluye: Performance financiera, individual breakdown con badges,
 * métricas de actividad con trends, e insights IA automáticos.
 */

'use client';

import React, { useState } from 'react';
import {
  Target, TrendingUp, Users, Phone, Calendar,
  Monitor, Zap, Brain, ChevronRight, AlertTriangle,
  Rocket, BarChart3, ArrowUpRight, Sparkles,
  DollarSign, LineChart
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const TEAM_PERFORMANCE = {
  teamName: 'Enterprise West',
  manager: 'Carlos López',
  quarter: 'Q4 2024',
  financial: {
    quota: 3200000,
    actual: 4980000,
    attainment: 156,
    pipeline: 2100000,
    pipelineQualified: 66,
    forecastProbable: 1400000,
  },
};

interface MemberPerformance {
  id: string;
  name: string;
  role: 'AE' | 'SDR';
  metric: string;
  target: string;
  attainment: number;
  badge: string;
  badgeEmoji: string;
  status: 'top' | 'solid' | 'ontrack' | 'coaching' | 'crushing' | 'strong';
  statusLabel: string;
  avatar: string;
}

const INDIVIDUAL_PERFORMANCE: MemberPerformance[] = [
  { id: '1', name: 'Ana García', role: 'AE', metric: '$847K', target: '600K', attainment: 141, badge: 'Top Performer', badgeEmoji: '🏆', status: 'top', statusLabel: 'Top Performer', avatar: '🌟' },
  { id: '2', name: 'Roberto Silva', role: 'AE', metric: '$723K', target: '600K', attainment: 121, badge: 'Consistent', badgeEmoji: '✅', status: 'solid', statusLabel: 'Solid', avatar: '💎' },
  { id: '3', name: 'María López', role: 'AE', metric: '$634K', target: '600K', attainment: 106, badge: 'On Track', badgeEmoji: '✅', status: 'ontrack', statusLabel: 'On Track', avatar: '🥇' },
  { id: '4', name: 'Carlos Chen', role: 'AE', metric: '$423K', target: '600K', attainment: 71, badge: 'Needs Coaching', badgeEmoji: '🔄', status: 'coaching', statusLabel: 'Coaching', avatar: '⚠️' },
  { id: '5', name: 'Sofia Rodríguez', role: 'SDR', metric: '145 SQLs', target: '114', attainment: 127, badge: 'Crushing It', badgeEmoji: '🎯', status: 'crushing', statusLabel: 'Crushing', avatar: '🚀' },
  { id: '6', name: 'Diego Morales', role: 'SDR', metric: '134 SQLs', target: '114', attainment: 117, badge: 'Strong', badgeEmoji: '✅', status: 'strong', statusLabel: 'Strong', avatar: '📞' },
];

const ACTIVITY_METRICS = [
  { label: 'Calls', value: '1,247', change: '+23%', icon: Phone, positive: true },
  { label: 'Meetings', value: '342', change: '+18%', icon: Calendar, positive: true },
  { label: 'Demos', value: '89', change: '+12%', icon: Monitor, positive: true },
  { label: 'Conversion Rate', value: '24%', target: '22%', icon: Target, positive: true },
];

const AI_INSIGHTS = [
  { type: 'warning' as const, icon: AlertTriangle, text: 'Carlos Chen necesita coaching en discovery (34% conv rate vs team 52%)', color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { type: 'success' as const, icon: Rocket, text: 'Sofia Rodríguez lista para promotion a AE (next cycle)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' },
  { type: 'info' as const, icon: TrendingUp, text: 'Team proyectado para 165% quota attainment (high confidence)', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { type: 'action' as const, icon: Zap, text: 'Territory North tiene opportunity gap — consider expansion', color: 'text-purple-600 bg-purple-50 border-purple-200' },
];

/* ─── STATUS COLOR MAP ────────────────────────────────────────── */

const statusColor: Record<string, string> = {
  top: 'bg-amber-100 text-amber-800 border-amber-300',
  solid: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  ontrack: 'bg-blue-100 text-blue-800 border-blue-300',
  coaching: 'bg-orange-100 text-orange-800 border-orange-300',
  crushing: 'bg-violet-100 text-violet-800 border-violet-300',
  strong: 'bg-teal-100 text-teal-800 border-teal-300',
};

const attainmentBarColor = (pct: number): string => {
  if (pct >= 120) return 'bg-gradient-to-r from-emerald-500 to-emerald-400';
  if (pct >= 100) return 'bg-gradient-to-r from-blue-500 to-blue-400';
  if (pct >= 80) return 'bg-gradient-to-r from-amber-500 to-amber-400';
  return 'bg-gradient-to-r from-red-500 to-red-400';
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const PerformanceDashboard = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'coaching' | 'comp' | 'forecast'>('overview');
  const { financial, teamName, manager, quarter } = TEAM_PERFORMANCE;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-slate-700/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(139,92,246,0.08),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Target size={18} className="text-orange-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-orange-400">Performance Dashboard</span>
                <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded-full border border-orange-500/30">{quarter}</span>
              </div>
              <h2 className="text-2xl font-bold mt-1">Equipo {teamName}</h2>
              <p className="text-slate-400 text-sm mt-0.5">Manager: {manager}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> En Vivo
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── PERFORMANCE FINANCIERA ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <DollarSign size={18} className="text-emerald-500" /> Performance Financiera
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Quota</p>
            <p className="text-2xl font-bold text-slate-800">${(financial.quota / 1e6).toFixed(1)}M</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Actual</p>
            <p className="text-2xl font-bold text-emerald-600">${(financial.actual / 1e6).toFixed(2)}M</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Pipeline</p>
            <p className="text-2xl font-bold text-blue-600">${(financial.pipeline / 1e6).toFixed(1)}M</p>
            <p className="text-xs text-slate-400">{financial.pipelineQualified}% qualified</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">Forecast</p>
            <p className="text-2xl font-bold text-purple-600">${(financial.forecastProbable / 1e6).toFixed(1)}M</p>
            <p className="text-xs text-slate-400">probable</p>
          </div>
        </div>
        {/* Attainment Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-600">Attainment</span>
            <span className="text-lg font-bold text-emerald-600">{financial.attainment}%</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ${attainmentBarColor(financial.attainment)}`} 
              style={{ width: `${Math.min(financial.attainment, 200) / 2}%` }} 
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>0%</span><span>50%</span><span>100%</span><span>150%</span><span>200%</span>
          </div>
        </div>
      </div>

      {/* ──── PERFORMANCE INDIVIDUAL ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Users size={18} className="text-blue-500" /> Performance Individual
        </h3>
        <div className="space-y-3">
          {INDIVIDUAL_PERFORMANCE.map((member) => (
            <div key={member.id} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 hover:shadow-sm transition-all cursor-pointer group">
              {/* Avatar */}
              <div className="text-2xl w-10 text-center flex-shrink-0">{member.avatar}</div>

              {/* Name & Role */}
              <div className="min-w-[160px]">
                <p className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{member.name}</p>
                <span className="text-xs text-slate-400">{member.role}</span>
              </div>

              {/* Metric */}
              <div className="min-w-[120px] text-sm">
                <span className="font-bold text-slate-700">{member.metric}</span>
                <span className="text-slate-400">/{member.target}</span>
              </div>

              {/* Attainment */}
              <div className="min-w-[60px] text-right">
                <span className={`text-sm font-bold ${member.attainment >= 100 ? 'text-emerald-600' : member.attainment >= 80 ? 'text-amber-600' : 'text-red-500'}`}>
                  {member.attainment}%
                </span>
              </div>

              {/* Progress bar mini */}
              <div className="flex-1 max-w-[120px] hidden lg:block">
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className={`h-1.5 rounded-full ${attainmentBarColor(member.attainment)}`} style={{ width: `${Math.min(member.attainment, 150) / 1.5}%` }} />
                </div>
              </div>

              {/* Status Badge */}
              <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColor[member.status]}`}>
                {member.badgeEmoji} {member.statusLabel}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── MÉTRICAS DE ACTIVIDAD ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <BarChart3 size={18} className="text-orange-500" /> Métricas de Actividad
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {ACTIVITY_METRICS.map((m) => (
            <div key={m.label} className="bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-orange-200 transition-colors group">
              <div className="flex items-center justify-between mb-2">
                <m.icon size={16} className="text-slate-400 group-hover:text-orange-500 transition-colors" />
                {m.change && (
                  <span className={`text-xs font-bold flex items-center gap-0.5 ${m.positive ? 'text-emerald-600' : 'text-red-500'}`}>
                    <ArrowUpRight size={12} /> {m.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-slate-800">{m.value}</p>
              <p className="text-xs text-slate-400 mt-1">{m.label}</p>
              {'target' in m && m.target && (
                <p className="text-xs mt-1">
                  <span className="text-slate-400">Target: </span>
                  <span className="text-emerald-600 font-semibold">{m.target}</span>
                  <span className="text-emerald-500 ml-1">🎯</span>
                </p>
              )}
              {m.change && !('target' in m) && (
                <p className="text-xs text-slate-400 mt-1">vs last quarter</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ──── INSIGHTS IA AUTOMÁTICOS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Brain size={18} className="text-violet-500" />
          <span>Insights IA Automáticos</span>
          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold border border-violet-200 flex items-center gap-1">
            <Sparkles size={10} /> Cortex AI
          </span>
        </h3>
        <div className="space-y-3">
          {AI_INSIGHTS.map((insight, idx) => (
            <div key={idx} className={`flex items-start gap-3 p-4 rounded-xl border ${insight.color} transition-all hover:shadow-sm cursor-pointer group`}>
              <insight.icon size={18} className="mt-0.5 flex-shrink-0" />
              <p className="text-sm font-medium flex-1">{insight.text}</p>
              <ChevronRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Deep Dive', icon: LineChart, active: activeTab === 'overview' },
          { label: 'Coaching Plan', icon: Brain, active: activeTab === 'coaching' },
          { label: 'Comp Calculator', icon: DollarSign, active: activeTab === 'comp' },
          { label: 'Forecast', icon: Target, active: activeTab === 'forecast' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => setActiveTab(btn.label.toLowerCase().replace(/\s/g, '') as 'overview' | 'coaching' | 'comp' | 'forecast')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              btn.active
                ? 'bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:shadow-sm'
            }`}
          >
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
