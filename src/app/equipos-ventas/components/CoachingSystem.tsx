/**
 * COMPONENT: COACHING SYSTEM — Sistema de Coaching IA TIER 0 NEUMORPHIC
 * 
 * @description Sistema inteligente de coaching y desarrollo.
 * Incluye: Performance analysis, plan de coaching 6 semanas,
 * recommended training, schedule, y action buttons.
 * Todo en español. Diseño neumórfico oficial de Silexar Pulse.
 */

'use client';

import React, { useState } from 'react';
import {
  Brain, TrendingDown, Target, BookOpen, Users, Calendar,
  Phone, BarChart3, ChevronRight, Play, Clock,
  Sparkles, Video,
  MessageSquare, ArrowRight
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

const COACHING_TARGET = {
  name: 'Carlos Chen',
  role: 'Account Executive',
  team: 'Enterprise West',
  avatar: '👤',
};

const PERFORMANCE_ANALYSIS = {
  currentQuota: 71,
  threshold: 80,
  trend: -8,
  issue: 'Baja conversión discovery-a-demo',
  issueDetail: '34% vs promedio equipo 52%',
  monthsBelow: 2,
};

interface CoachingWeek {
  phase: string;
  weeks: string;
  color: string;
  bgColor: string;
  borderColor: string;
  items: { emoji: string; text: string }[];
}

const COACHING_PLAN: CoachingWeek[] = [
  {
    phase: 'Boot Camp de Habilidades de Descubrimiento', weeks: 'SEMANA 1-2',
    color: '#1e40af', bgColor: '#dbeafe', borderColor: '#3b82f6',
    items: [
      { emoji: '📚', text: 'Requerido: Módulos 3-5 de "SPIN Selling"' },
      { emoji: '🎭', text: 'Role-play: 3 sesiones con manager' },
      { emoji: '📞', text: 'Shadow de llamadas: Escuchar top performers' },
    ],
  },
  {
    phase: 'Aplicación en Terreno', weeks: 'SEMANA 3-4',
    color: '#b45309', bgColor: '#fef3c7', borderColor: '#f59e0b',
    items: [
      { emoji: '🎯', text: 'Aplicar nuevas técnicas en 10+ llamadas discovery' },
      { emoji: '📊', text: 'Manager reviews: 5 llamadas grabadas' },
      { emoji: '🏆', text: 'Meta: Mejorar conversión a 45%' },
    ],
  },
  {
    phase: 'Dominio y Refuerzo', weeks: 'SEMANA 5-6',
    color: '#047857', bgColor: '#d1fae5', borderColor: '#10b981',
    items: [
      { emoji: '🧠', text: 'Mentoring con Ana García' },
      { emoji: '📈', text: 'Track metrics: Seguimiento diario de conversión' },
      { emoji: '🎉', text: 'Hito de éxito: 50% tasa de conversión' },
    ],
  },
];

const RECOMMENDED_TRAINING = [
  { title: 'Metodología Challenger Customer', type: 'Curso', duration: '8h', icon: BookOpen, color: '#6888ff' },
  { title: 'Técnicas Avanzadas de Preguntas', type: 'Workshop', duration: '4h', icon: MessageSquare, color: '#8b5cf6' },
  { title: 'Masterclass Manejo de Objeciones', type: 'Video', duration: '3h', icon: Video, color: '#f59e0b' },
];

const SCHEDULE = [
  { event: '1:1s semanales con manager', day: 'Martes 10 AM', icon: Phone, color: '#6888ff' },
  { event: 'Mentoring peer', day: 'Jueves 2 PM', icon: Users, color: '#8b5cf6' },
  { event: 'Revisión de progreso', day: 'Fin de mes', icon: BarChart3, color: '#10b981' },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CoachingSystem = () => {
  const [, setPlanStarted] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, #8b5cf6, #a855f7, #8b5cf6)`,
          boxShadow: shadowOut(6)
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                boxShadow: shadowOut(2)
              }}
            >
              <Brain size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Cortex-Coaching</h2>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-semibold flex items-center gap-1"
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    color: 'white'
                  }}
                >
                  <Sparkles size={10} /> Potenciado por IA
                </span>
              </div>
              <p className="text-white/80 text-sm">Motor de Recomendaciones</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── PERSON CARD NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: gradientBase,
          boxShadow: shadowIn(4)
        }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl"
            style={{
              background: gradientBase,
              boxShadow: shadowOut(4)
            }}
          >
            {COACHING_TARGET.avatar}
          </div>
          <div>
            <h3 className="text-xl font-bold" style={{ color: '#1e293b' }}>{COACHING_TARGET.name}</h3>
            <p className="text-sm" style={{ color: N.text }}>{COACHING_TARGET.role} — {COACHING_TARGET.team}</p>
          </div>
        </div>

        {/* ──── PERFORMANCE ANALYSIS NEUMORPHIC ──── */}
        <div
          className="rounded-2xl p-5"
          style={{
            background: gradientBase,
            boxShadow: shadowIn(3)
          }}
        >
          <h4
            className="font-bold mb-4 flex items-center gap-2"
            style={{ color: '#1e293b' }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `linear-gradient(145deg, #ef4444, #dc2626)` }}
            >
              <BarChart3 size={16} className="text-white" />
            </div>
            Análisis de Performance
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div
              className="rounded-xl p-4"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3)
              }}
            >
              <p className="text-xs uppercase font-bold" style={{ color: N.text }}>Actual</p>
              <p className="text-2xl font-bold mt-1" style={{ color: '#dc2626' }}>{PERFORMANCE_ANALYSIS.currentQuota}% cuota</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#ef4444' }}>Bajo umbral de {PERFORMANCE_ANALYSIS.threshold}%</p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3)
              }}
            >
              <p className="text-xs uppercase font-bold" style={{ color: N.text }}>Tendencia</p>
              <p className="text-2xl font-bold flex items-center gap-1 mt-1" style={{ color: '#dc2626' }}>
                <TrendingDown size={20} /> {PERFORMANCE_ANALYSIS.trend}%
              </p>
              <p className="text-xs mt-0.5" style={{ color: N.textSub }}>vs último trimestre</p>
            </div>
            <div
              className="rounded-xl p-4"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3)
              }}
            >
              <p className="text-xs uppercase font-bold" style={{ color: N.text }}>Problema</p>
              <p className="text-sm font-bold mt-1" style={{ color: '#1e293b' }}>{PERFORMANCE_ANALYSIS.issue}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: '#ef4444' }}>{PERFORMANCE_ANALYSIS.issueDetail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── COACHING PLAN AUTOMÁTICO NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(145deg, #8b5cf6, #a855f7)` }}
          >
            <Target size={18} className="text-white" />
          </div>
          Plan de Coaching Automático
          <span
            className="text-xs px-2 py-0.5 rounded-full font-bold ml-auto"
            style={{
              background: '#f3e8ff',
              color: '#8b5cf6'
            }}
          >6 Semanas</span>
        </h3>
        <div className="space-y-4">
          {COACHING_PLAN.map((phase, idx) => (
            <div
              key={idx}
              className="border-2 rounded-2xl p-5 transition-all hover:scale-[1.01]"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(4),
                borderColor: phase.borderColor
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-xs font-black uppercase tracking-widest"
                  style={{ color: phase.color }}
                >
                  {phase.weeks}
                </span>
                <span style={{ color: '#cbd5e1' }}>|</span>
                <h4
                  className="font-black text-sm"
                  style={{ color: phase.color }}
                >
                  {phase.phase}
                </h4>
              </div>
              <div className="space-y-2">
                {phase.items.map((item, i) => (
                  <div key={`${item}-${i}`} className="flex items-start gap-2">
                    <span className="text-lg">{item.emoji}</span>
                    <span className="text-sm" style={{ color: '#475569' }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── RECOMMENDED TRAINING NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <BookOpen size={18} style={{ color: '#6888ff' }} /> Capacitaciones Recomendadas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED_TRAINING.map((training, idx) => {
            const IconComponent = training.icon;
            return (
              <div
                key={idx}
                className="rounded-xl p-4 transition-all hover:scale-[1.02]"
                style={{
                  background: gradientBase,
                  boxShadow: shadowOut(3)
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${training.color}20` }}
                  >
                    <IconComponent size={20} style={{ color: training.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: N.textSub }}>{training.type}</p>
                    <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{training.title}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock size={12} style={{ color: N.textSub }} />
                  <span className="text-xs" style={{ color: N.text }}>{training.duration}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── SCHEDULE NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: gradientBase,
          boxShadow: shadowOut(4)
        }}
      >
        <h3
          className="font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <Calendar size={18} style={{ color: '#10b981' }} /> Programación
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SCHEDULE.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 rounded-xl p-4"
                style={{
                  background: gradientBase,
                  boxShadow: shadowOut(3)
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ background: item.color }}
                >
                  <IconComponent size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{item.event}</p>
                  <p className="text-xs" style={{ color: N.text }}>{item.day}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex gap-3">
        <button
          className="flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-white transition-all hover:scale-[1.02]"
          style={{
            background: `linear-gradient(145deg, #8b5cf6, #a855f7)`,
            boxShadow: shadowOut(4)
          }}
        >
          <Play size={18} /> Iniciar Plan de Coaching
        </button>
        <button
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: gradientBase,
            color: N.text,
            boxShadow: shadowOut(4)
          }}
        >
          <ArrowRight size={18} /> Ver Detalles Completos
        </button>
      </div>
    </div>
  );
};
