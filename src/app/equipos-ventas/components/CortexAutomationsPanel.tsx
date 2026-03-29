/**
 * COMPONENT: CORTEX AUTOMATIONS PANEL — Intelligent Automation Engine
 * 
 * @description Dashboard de automatizaciones inteligentes Tier 0.
 * Muestra los 3 motores de automatización: Performance Monitoring,
 * Territory Rebalancing, y Coaching Triggers con flujos visuales.
 */

'use client';

import React, { useState } from 'react';
import {
  Brain, Activity, MapPin, GraduationCap, Zap, CheckCircle,
  Clock, TrendingUp, Play,
  ChevronDown, ChevronRight, Sparkles, Settings,
  Eye, Bell, RefreshCw
} from 'lucide-react';

/* ─── AUTOMATION DEFINITIONS ──────────────────────────────────── */

interface AutomationStep {
  label: string;
  emoji: string;
  detail: string;
  status: 'completed' | 'running' | 'pending';
}

interface AutomationFlow {
  id: string;
  title: string;
  icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  trigger: string;
  triggerFrequency: string;
  status: 'active' | 'paused' | 'idle';
  lastRun: string;
  nextRun: string;
  automationsTriggered: number;
  steps: AutomationStep[];
  results: { label: string; value: string }[];
}

const AUTOMATIONS: AutomationFlow[] = [
  {
    id: 'perf-monitor',
    title: 'Supervisión Automática del Rendimiento',
    icon: Activity,
    color: 'text-blue-600',
    gradientFrom: 'from-blue-500',
    gradientTo: 'to-cyan-500',
    trigger: 'Daily performance data sync',
    triggerFrequency: 'Every 24h',
    status: 'active',
    lastRun: 'Hoy 06:00 AM',
    nextRun: 'Mañana 06:00 AM',
    automationsTriggered: 47,
    steps: [
      { label: 'Cortex analiza metrics vs targets por rep', emoji: '📊', detail: '6 reps analizados', status: 'completed' },
      { label: 'Identifica patrones de under/over performance', emoji: '🔍', detail: '2 under, 3 over detected', status: 'completed' },
      { label: 'Calcula probability de quota attainment', emoji: '🎯', detail: 'Carlos Chen: 45% risk', status: 'completed' },
      { label: 'Si risk >70%: Genera coaching recommendation', emoji: '⚠️', detail: '1 recommendation generada', status: 'completed' },
      { label: 'Notifica manager con action plan específico', emoji: '📩', detail: 'Notification enviada', status: 'completed' },
      { label: 'Programa check-ins y follow-ups automáticos', emoji: '📅', detail: '3 check-ins programados', status: 'completed' },
      { label: 'Trackea improvement metrics week-over-week', emoji: '📈', detail: 'Tracking activo', status: 'running' },
    ],
    results: [
      { label: 'Reps Monitored', value: '6' },
      { label: 'Risk Alerts', value: '1' },
      { label: 'Auto-Coaching', value: '2' },
      { label: 'Improvement Rate', value: '+12%' },
    ],
  },
  {
    id: 'territory-rebal',
    title: 'Reequilibrio Inteligente del Territorio',
    icon: MapPin,
    color: 'text-emerald-600',
    gradientFrom: 'from-emerald-500',
    gradientTo: 'to-teal-500',
    trigger: 'Monthly territory analysis',
    triggerFrequency: 'Every 30d',
    status: 'active',
    lastRun: 'Feb 1, 2024',
    nextRun: 'Mar 1, 2024',
    automationsTriggered: 12,
    steps: [
      { label: 'Cortex evalúa account distribution y performance', emoji: '🗺️', detail: '4 territories', status: 'completed' },
      { label: 'Identifica territories desbalanceados', emoji: '⚖️', detail: 'North: overloaded', status: 'completed' },
      { label: 'Calcula optimal redistribution basado en capacity', emoji: '🧮', detail: 'Optimal: 3 moves', status: 'completed' },
      { label: 'Si improvement >15%: Sugiere rebalance', emoji: '💡', detail: 'Projected: +22% yield', status: 'completed' },
      { label: 'Genera impact analysis para management review', emoji: '📊', detail: 'Report generated', status: 'completed' },
      { label: 'Automatiza transition plan con timelines', emoji: '📋', detail: 'Awaiting approval', status: 'pending' },
      { label: 'Monitorea performance post-change', emoji: '👁️', detail: 'Queued', status: 'pending' },
    ],
    results: [
      { label: 'Territories', value: '4' },
      { label: 'Imbalance Found', value: '1' },
      { label: 'Projected Lift', value: '+22%' },
      { label: 'Moves Suggested', value: '3' },
    ],
  },
  {
    id: 'coaching-triggers',
    title: 'Coaching Triggers Automáticos',
    icon: GraduationCap,
    color: 'text-violet-600',
    gradientFrom: 'from-violet-500',
    gradientTo: 'to-purple-500',
    trigger: 'Performance metrics deviation',
    triggerFrequency: 'Real-time',
    status: 'active',
    lastRun: 'Hoy 11:30 AM',
    nextRun: 'On trigger',
    automationsTriggered: 89,
    steps: [
      { label: 'Identifica specific skill gaps automáticamente', emoji: '🔬', detail: 'Discovery: Carlos Chen', status: 'completed' },
      { label: 'Asigna training modules personalizados', emoji: '📚', detail: 'SPIN Selling assigned', status: 'completed' },
      { label: 'Programa role-playing sessions con manager', emoji: '🎭', detail: '3 sessions scheduled', status: 'completed' },
      { label: 'Trackea progress contra learning objectives', emoji: '📈', detail: 'Week 2 of 6', status: 'running' },
      { label: 'Si no improvement en 30 días: Escala a PIP', emoji: '🚨', detail: 'Not triggered', status: 'pending' },
      { label: 'Genera success stories para share con team', emoji: '🏆', detail: 'Queued', status: 'pending' },
      { label: 'Optimiza coaching programs basado en outcomes', emoji: '🧠', detail: 'ML model learning', status: 'running' },
    ],
    results: [
      { label: 'Active Plans', value: '3' },
      { label: 'Skills Improved', value: '7' },
      { label: 'Avg Improvement', value: '+18%' },
      { label: 'PIP Escalations', value: '0' },
    ],
  },
];

/* ─── STATUS BADGE ────────────────────────────────────────────── */

const StatusBadge = ({ status }: { status: 'active' | 'paused' | 'idle' }) => {
  const config = {
    active: { label: 'Active', color: 'bg-emerald-100 text-emerald-700 border-emerald-300', dot: 'bg-emerald-500' },
    paused: { label: 'Paused', color: 'bg-amber-100 text-amber-700 border-amber-300', dot: 'bg-amber-500' },
    idle: { label: 'Idle', color: 'bg-slate-100 text-slate-500 border-slate-300', dot: 'bg-slate-400' },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${c.color}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {c.label}
    </span>
  );
};

const StepStatusIcon = ({ status }: { status: 'completed' | 'running' | 'pending' }) => {
  if (status === 'completed') return <CheckCircle size={14} className="text-emerald-500 flex-shrink-0" />;
  if (status === 'running') return <RefreshCw size={14} className="text-blue-500 animate-spin flex-shrink-0" />;
  return <Clock size={14} className="text-slate-300 flex-shrink-0" />;
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CortexAutomationsPanel = () => {
  const [expandedFlow, setExpandedFlow] = useState<string | null>('perf-monitor');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(99,102,241,0.15),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Brain size={18} className="text-indigo-400" />
                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Cortex-Performance</span>
                <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full border border-indigo-500/30 flex items-center gap-1">
                  <Sparkles size={10} /> Motor de Optimización
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1">Automatizaciones Inteligentes</h2>
              <p className="text-slate-400 text-sm mt-0.5">3 motores activos • 148 automatizaciones ejecutadas este mes</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" /> All Systems Online
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-3 mt-5">
            {[
              { label: 'Automations Run', value: '148', icon: Zap, color: 'text-amber-400' },
              { label: 'Alerts Generated', value: '23', icon: Bell, color: 'text-red-400' },
              { label: 'Actions Taken', value: '89', icon: CheckCircle, color: 'text-emerald-400' },
              { label: 'Improvement', value: '+16%', icon: TrendingUp, color: 'text-blue-400' },
            ].map((s) => (
              <div key={s.label} className="bg-white/5 backdrop-blur-sm rounded-xl p-3 border border-white/10">
                <s.icon size={14} className={s.color} />
                <p className="text-lg font-bold mt-1">{s.value}</p>
                <p className="text-[10px] text-slate-400">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ──── AUTOMATION FLOWS ──── */}
      {AUTOMATIONS.map((flow) => {
        const isExpanded = expandedFlow === flow.id;
        const completedSteps = flow.steps.filter(s => s.status === 'completed').length;
        const progress = Math.round((completedSteps / flow.steps.length) * 100);

        return (
          <div key={flow.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden transition-all">
            {/* Flow Header */}
            <button
              onClick={() => setExpandedFlow(isExpanded ? null : flow.id)}
              className="w-full p-5 flex items-center gap-4 text-left hover:bg-slate-50/50 transition-colors"
            >
              <div className={`w-12 h-12 bg-gradient-to-br ${flow.gradientFrom} ${flow.gradientTo} rounded-xl flex items-center justify-center text-white shadow-lg`}>
                <flow.icon size={22} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-slate-800 text-sm">{flow.title}</h3>
                  <StatusBadge status={flow.status} />
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-slate-400">Trigger: {flow.trigger}</span>
                  <span className="text-xs text-slate-300">•</span>
                  <span className="text-xs text-slate-400">{flow.triggerFrequency}</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className={`h-1.5 rounded-full bg-gradient-to-r ${flow.gradientFrom} ${flow.gradientTo}`} style={{ width: `${progress}%` }} />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-400">Last: {flow.lastRun}</p>
                  <p className="text-xs text-slate-400">Next: {flow.nextRun}</p>
                </div>
                {isExpanded ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-slate-100 p-5 space-y-5">
                {/* Results Grid */}
                <div className="grid grid-cols-4 gap-3">
                  {flow.results.map((r) => (
                    <div key={r.label} className="bg-slate-50 rounded-xl p-3 text-center">
                      <p className="text-lg font-bold text-slate-800">{r.value}</p>
                      <p className="text-[10px] text-slate-400 uppercase font-semibold">{r.label}</p>
                    </div>
                  ))}
                </div>

                {/* Flow Steps */}
                <div className="space-y-2">
                  {flow.steps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50/60">
                      <div className="flex flex-col items-center gap-1 mt-0.5">
                        <StepStatusIcon status={step.status} />
                        {idx < flow.steps.length - 1 && <div className="w-px h-4 bg-slate-200" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700">
                          <span className="mr-1">{step.emoji}</span>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">{step.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Flow Actions */}
                <div className="flex gap-2">
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-800 transition-colors">
                    <Play size={12} /> Run Now
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <Eye size={12} /> View Logs
                  </button>
                  <button className="flex items-center gap-1.5 px-4 py-2 bg-white text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                    <Settings size={12} /> Configure
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
