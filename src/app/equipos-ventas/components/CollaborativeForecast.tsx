/**
 * COMPONENT: COLLABORATIVE FORECAST — Sistema de Predicción Inteligente
 * 
 * @description Forecast colaborativo avanzado con tabla multi-rep (commit/best/worst),
 * Cortex-Forecast insights, pipeline health, y actions required.
 * Todo en español.
 * 
 * DESIGN: Neumorphic con base #dfeaff, sombras #bec8de y #ffffff
 * Sistema correcto: bg-light-surface + shadow-neumorphic-outset/inset
 */

'use client';

import React, { useState } from 'react';
import {
  Target, TrendingUp, AlertTriangle, Brain, BarChart3,
  ChevronRight, Sparkles, Send,
  Zap, PieChart, Activity
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

const FORECAST_META = { teamName: 'Enterprise West', manager: 'Carlos López', quarter: 'Q1 2025' };

interface RepForecast {
  name: string;
  commit: number;
  bestCase: number;
  worstCase: number;
  quota: number;
}

const REP_FORECASTS: RepForecast[] = [
  { name: 'Ana García', commit: 420000, bestCase: 580000, worstCase: 320000, quota: 600000 },
  { name: 'Roberto Silva', commit: 380000, bestCase: 510000, worstCase: 280000, quota: 600000 },
  { name: 'María López', commit: 310000, bestCase: 420000, worstCase: 240000, quota: 600000 },
  { name: 'Carlos Chen', commit: 180000, bestCase: 240000, worstCase: 120000, quota: 600000 },
];

const teamTotal = {
  commit: REP_FORECASTS.reduce((s, r) => s + r.commit, 0),
  bestCase: REP_FORECASTS.reduce((s, r) => s + r.bestCase, 0),
  worstCase: REP_FORECASTS.reduce((s, r) => s + r.worstCase, 0),
  quota: REP_FORECASTS.reduce((s, r) => s + r.quota, 0),
};

const CORTEX_INSIGHTS = [
  { type: 'success', icon: TrendingUp, text: 'Alta confianza: El equipo excederá $1.4M (87% probabilidad)', color: '#059669', bg: '#d1fae5', border: '#10b981' },
  { type: 'warning', icon: AlertTriangle, text: 'Riesgo: Carlos Chen necesita construir pipeline (solo $240K pipe)', color: '#d97706', bg: '#fef3c7', border: '#f59e0b' },
  { type: 'opportunity', icon: Zap, text: 'Oportunidad: 3 deals grandes podrían llevar al equipo a $1.8M', color: '#2563eb', bg: '#dbeafe', border: '#3b82f6' },
  { type: 'action', icon: Target, text: 'Recomendación: Enfocarse en generación de pipeline Q1 AHORA', color: '#7c3aed', bg: '#f3e8ff', border: '#8b5cf6' },
];

const PIPELINE_HEALTH = [
  { label: 'Pipeline Total', value: '$2.8M', detail: '2.3x coverage', color: '#6888ff' },
  { label: 'Pipeline Cualificado', value: '$1.9M', detail: '1.6x coverage', color: '#10b981' },
  { label: 'Categoría Commit', value: '$1.29M', detail: 'deals confirmados', color: '#8b5cf6' },
  { label: 'Evaluación de Riesgo', value: 'Medio', detail: 'coverage adecuado', color: '#f59e0b' },
];

const ACTIONS_REQUIRED = [
  { text: 'Carlos Chen: Construir pipeline a 3x coverage ($1.8M necesario)', urgency: 'high' },
  { text: 'Equipo: Cualificar 15 oportunidades adicionales este mes', urgency: 'medium' },
  { text: 'Enfoque: Deals enterprise >$100K para aceleración Q1', urgency: 'low' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const fmt = (v: number) => v >= 1e6 ? `$${(v / 1e6).toFixed(2)}M` : `$${(v / 1000).toFixed(0)}K`;
const pct = (actual: number, quota: number) => `${Math.round((actual / quota) * 100)}%`;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CollaborativeForecast = () => {
  const [, setSubmitted] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, #6888ff, #5a77d9, #6888ff)`,
          boxShadow: shadowOut(6)
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
        <div className="relative z-10 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieChart size={18} className="text-blue-200" />
              <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Pronóstico Colaborativo</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
              >
                {FORECAST_META.quarter}
              </span>
            </div>
            <h2 className="text-2xl font-bold mt-1 text-white">Equipo {FORECAST_META.teamName}</h2>
            <p className="text-blue-200 text-sm">Manager: {FORECAST_META.manager}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200">Cuota del Equipo</p>
            <p className="text-2xl font-bold">{fmt(teamTotal.quota)}</p>
          </div>
        </div>
      </div>

      {/* ──── FORECAST TABLE ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <div className="p-4 mb-4">
          <h3 className="font-bold flex items-center gap-2" style={{ color: '#1e293b' }}>
            <BarChart3 size={18} style={{ color: N.accent }} /> Resumen de Forecast
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left">
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider" style={{ color: N.text }}>Rep</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: N.text }}>Commit</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: N.text }}>Mejor Caso</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: N.text }}>Peor Caso</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: N.text }}>Cuota</th>
                <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-right" style={{ color: N.text }}>Cumplimiento</th>
              </tr>
            </thead>
            <tbody>
              {REP_FORECASTS.map((rep) => {
                const att = Math.round((rep.commit / rep.quota) * 100);
                return (
                  <tr key={rep.name} className="transition-colors">
                    <td className="px-4 py-4 font-semibold text-sm" style={{ color: '#1e293b' }}>{rep.name}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono font-semibold" style={{ color: '#059669' }}>{fmt(rep.commit)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono" style={{ color: '#2563eb' }}>{fmt(rep.bestCase)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono" style={{ color: '#dc2626' }}>{fmt(rep.worstCase)}</td>
                    <td className="px-4 py-4 text-sm text-right font-mono" style={{ color: N.textSub }}>{fmt(rep.quota)}</td>
                    <td className="px-4 py-4 text-right">
                      <span
                        className="text-xs font-bold px-2 py-1 rounded-full"
                        style={{
                          background: att >= 60 ? '#d1fae5' : att >= 40 ? '#fef3c7' : '#fee2e2',
                          color: att >= 60 ? '#059669' : att >= 40 ? '#d97706' : '#dc2626'
                        }}
                      >
                        {att}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* TOTALS ROW */}
              <tr
                className="font-bold rounded-b-2xl"
                style={{
                  background: `linear-gradient(145deg, ${N.accent}, #5a77d9)`,
                  color: 'white'
                }}
              >
                <td className="px-4 py-4 text-sm rounded-bl-2xl">TOTAL EQUIPO</td>
                <td className="px-4 py-4 text-sm text-right font-mono">{fmt(teamTotal.commit)}</td>
                <td className="px-4 py-4 text-sm text-right font-mono">{fmt(teamTotal.bestCase)}</td>
                <td className="px-4 py-4 text-sm text-right font-mono">{fmt(teamTotal.worstCase)}</td>
                <td className="px-4 py-4 text-sm text-right font-mono">{fmt(teamTotal.quota)}</td>
                <td className="px-4 py-4 text-right rounded-br-2xl">
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                  >
                    {pct(teamTotal.commit, teamTotal.quota)}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ──── CORTEX-FORECAST INSIGHTS ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-4 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <Brain size={18} style={{ color: '#8b5cf6' }} />
          Insights Cortex-Forecast
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1 ml-auto"
            style={{
              background: '#f3e8ff',
              color: '#8b5cf6'
            }}
          >
            <Sparkles size={10} /> IA
          </span>
        </h3>
        <div className="space-y-2">
          {CORTEX_INSIGHTS.map((insight, idx) => {
            const IconComponent = insight.icon;
            return (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-xl border cursor-pointer hover:scale-[1.01] transition-all group"
                style={{
                  background: insight.bg,
                  borderColor: insight.border
                }}
              >
                <IconComponent size={16} style={{ color: insight.color }} className="mt-0.5 flex-shrink-0" />
                <p className="text-sm font-medium flex-1" style={{ color: '#1e293b' }}>{insight.text}</p>
                <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" style={{ color: insight.color }} />
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── PIPELINE HEALTH ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-4 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <Activity size={18} style={{ color: N.accent }} /> Salud del Pipeline
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {PIPELINE_HEALTH.map((item, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3)
              }}
            >
              <p className="text-xs uppercase font-semibold mb-1" style={{ color: N.text }}>{item.label}</p>
              <p className="text-xl font-bold" style={{ color: item.color }}>{item.value}</p>
              <p className="text-xs mt-1" style={{ color: N.textSub }}>{item.detail}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTIONS REQUIRED ──── */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-4 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <Target size={18} style={{ color: '#dc2626' }} /> Acciones Requeridas
        </h3>
        <div className="space-y-3">
          {ACTIONS_REQUIRED.map((action, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-xl"
              style={{
                background: gradientBase,
                boxShadow: shadowIn(2)
              }}
            >
              <span
                className="w-2 h-2 rounded-full mt-2 flex-shrink-0"
                style={{
                  background: action.urgency === 'high' ? '#dc2626' : action.urgency === 'medium' ? '#f59e0b' : '#6888ff'
                }}
              />
              <p className="text-sm" style={{ color: '#1e293b' }}>{action.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── SUBMIT BUTTON ──── */}
      <div className="flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
          style={{
            background: `linear-gradient(145deg, ${N.accent}, #5a77d9)`,
            boxShadow: shadowOut(4)
          }}
        >
          <Send size={18} /> Enviar Forecast
        </button>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: gradientBase,
            color: N.text,
            boxShadow: shadowOut(4)
          }}
        >
          <BarChart3 size={18} /> Ver Tendencias
        </button>
      </div>
    </div>
  );
};
