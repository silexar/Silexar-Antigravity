/**
 * COMPONENT: LEADERBOARD GAMIFICADO — Sistema de Clasificación TIER 0 NEUMORPHIC
 * 
 * @description Leaderboard enterprise con streaks, badges, milestones,
 * activity leaders, y spiffs/contests activos. Real-time update feel.
 * Todo en español. Diseño neumórfico oficial de Silexar Pulse.
 */

'use client';

import React, { useState } from 'react';
import {
  Trophy, Flame, Zap, Target,
  Phone, Calendar, TrendingUp, Gift,
  Crown, ArrowRight, Sparkles
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

interface LeaderEntry {
  rank: number;
  name: string;
  team: string;
  attainment: number;
  revenue: string;
  streak: number;
  badge: string;
  badgeEmoji: string;
  nextMilestone?: string;
  rankEmoji: string;
  fireLevel: 'high' | 'medium' | 'low';
}

const QUOTA_LEADERS: LeaderEntry[] = [
  {
    rank: 1, name: 'Ana García', team: 'Enterprise West', attainment: 156,
    revenue: '$847K', streak: 4, badge: 'Quota Crusher', badgeEmoji: '🏆',
    nextMilestone: "President's Club (175%)", rankEmoji: '🌟', fireLevel: 'high'
  },
  {
    rank: 2, name: 'Roberto Silva', team: 'Enterprise West', attainment: 145,
    revenue: '$723K', streak: 3, badge: 'Consistent Performer', badgeEmoji: '⭐',
    rankEmoji: '💎', fireLevel: 'high'
  },
  {
    rank: 3, name: 'María López', team: 'Mid-Market North', attainment: 141,
    revenue: '$634K', streak: 2, badge: 'Rising Star', badgeEmoji: '🌟',
    rankEmoji: '🚀', fireLevel: 'medium'
  },
  {
    rank: 4, name: 'Pedro Martínez', team: 'Enterprise East', attainment: 128,
    revenue: '$512K', streak: 2, badge: 'Breakout Quarter', badgeEmoji: '💫',
    rankEmoji: '⚡', fireLevel: 'medium'
  },
  {
    rank: 5, name: 'Lucia Fernández', team: 'Mid-Market South', attainment: 119,
    revenue: '$476K', streak: 1, badge: 'Steady Climb', badgeEmoji: '📈',
    rankEmoji: '🎯', fireLevel: 'low'
  },
];

const ACTIVITY_LEADERS = [
  { category: 'Más Llamadas', name: 'Sofia Rodríguez', role: 'SDR', value: '342 llamadas este mes', icon: Phone, color: '#6888ff' },
  { category: 'Más Reuniones', name: 'Diego Chen', role: 'AE', value: '89 reuniones', icon: Calendar, color: '#8b5cf6' },
  { category: 'Mejor Conversión', name: 'Ana García', role: 'AE', value: '34% reunión-a-cierre', icon: TrendingUp, color: '#10b981' },
];

const SPIFFS_CONTESTS = [
  { emoji: '🎄', title: 'Push Navideño', description: 'Extra $5K por deals cerrados antes del 31 Dic', color: '#ef4444', daysLeft: 12 },
  { emoji: '🆕', title: 'Concurso New Logo', description: '$10K + viaje a Hawaii por más clientes nuevos', color: '#0ea5e9', daysLeft: 30 },
  { emoji: '📞', title: 'SDR Blitz Week', description: 'Extra $500/semana por >50 llamadas/día', color: '#f59e0b', daysLeft: 5 },
];

/* ─── FIRE INDICATOR ──────────────────────────────────────────── */

const FireIndicator = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
  if (level === 'high') return <span style={{ color: '#ea580c' }}>🔥</span>;
  if (level === 'medium') return <span style={{ color: '#f59e0b' }}>⚡</span>;
  return <span style={{ color: '#6888ff' }}>🎯</span>;
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const LeaderboardGamificado = () => {
  const [activeView, setActiveView] = useState<'performance' | 'alltime' | 'contests'>('performance');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6 text-white relative overflow-hidden"
        style={{
          background: `linear-gradient(145deg, #f59e0b, #ea580c, #dc2626)`,
          boxShadow: shadowOut(6)
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(255,255,255,0.2)',
                boxShadow: shadowOut(2)
              }}
            >
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Tabla de Posiciones</h2>
              <p className="text-white/80 text-sm">Q4 2024</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2 py-0.5 rounded-full font-bold flex items-center gap-1"
              style={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white'
              }}
            >
              <Sparkles size={10} /> Clasificado por IA
            </span>
            <div
              className="flex items-center gap-1 rounded-full px-3 py-1"
              style={{ background: 'rgba(255,255,255,0.2)' }}
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: '#10b981' }}
              />
              <span className="text-xs font-semibold">EN VIVO</span>
            </div>
          </div>
        </div>
      </div>

      {/* ──── QUOTA ATTAINMENT LEADERS NEUMORPHIC ──── */}
      <div
        className="rounded-2xl p-6"
        style={{
          background: gradientBase,
          boxShadow: shadowIn(4)
        }}
      >
        <h3
          className="font-bold mb-5 flex items-center gap-2"
          style={{ color: '#1e293b' }}
        >
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(145deg, #f59e0b, #ea580c)` }}
          >
            <Crown size={18} className="text-white" />
          </div>
          Líderes de Cumplimiento de Cuota
        </h3>
        <div className="space-y-4">
          {QUOTA_LEADERS.map((leader) => (
            <div
              key={leader.rank}
              className={`rounded-2xl p-5 transition-all duration-300 hover:scale-[1.01] cursor-pointer group ${leader.rank === 1 ? 'border-2' : leader.rank <= 3 ? 'border-2' : 'border border-transparent'}`}
              style={{
                background: gradientBase,
                boxShadow: shadowOut(4),
                ...(leader.rank === 1
                  ? { borderColor: '#f59e0b' }
                  : leader.rank === 2
                    ? { borderColor: '#94a3b8' }
                    : leader.rank === 3
                      ? { borderColor: '#ea580c' }
                      : {})
              }}
            >
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                  <span className="text-2xl">{leader.rankEmoji}</span>
                  <span className="text-xs font-bold" style={{ color: N.text }}>#{leader.rank}</span>
                </div>

                {/* Name & Team */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold group-hover:text-orange-700 transition-colors" style={{ color: '#1e293b' }}>{leader.name}</h4>
                    <span className="text-xs" style={{ color: N.textSub }}>({leader.team})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Streak */}
                    <span
                      className="text-xs font-medium px-2 py-1 rounded-full"
                      style={{
                        background: 'rgba(255,255,255,0.6)',
                        color: N.text
                      }}
                    >
                      <Flame size={12} style={{ color: '#ea580c' }} /> Racha: {leader.streak} meses {'>'}cuota
                    </span>
                    {/* Badge */}
                    <span
                      className="text-xs font-bold px-2 py-1 rounded-full border"
                      style={{
                        background: '#fef3c7',
                        color: '#d97706',
                        borderColor: '#fcd34d'
                      }}
                    >
                      {leader.badgeEmoji} {leader.badge}
                    </span>
                    {/* Next milestone */}
                    {leader.nextMilestone && (
                      <span
                        className="text-xs font-semibold flex items-center gap-1"
                        style={{ color: '#8b5cf6' }}
                      >
                        <Target size={10} /> Siguiente: {leader.nextMilestone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="text-right flex items-center gap-3">
                  <FireIndicator level={leader.fireLevel} />
                  <div
                    className="rounded-xl px-3 py-2"
                    style={{
                      background: 'rgba(255,255,255,0.8)',
                      boxShadow: shadowOut(2)
                    }}
                  >
                    <p className="text-lg font-bold" style={{ color: '#1e293b' }}>{leader.attainment}%</p>
                    <p className="text-xs" style={{ color: N.text }}>{leader.revenue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTIVITY LEADERS NEUMORPHIC ──── */}
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
          <Zap size={18} style={{ color: '#f59e0b' }} /> Líderes de Actividad
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACTIVITY_LEADERS.map((leader, idx) => {
            const IconComponent = leader.icon;
            return (
              <div
                key={idx}
                className="rounded-xl p-4"
                style={{
                  background: gradientBase,
                  boxShadow: shadowOut(3)
                }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: `${leader.color}20` }}
                  >
                    <IconComponent size={20} style={{ color: leader.color }} />
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: N.textSub }}>{leader.category}</p>
                    <p className="font-semibold" style={{ color: '#1e293b' }}>{leader.name}</p>
                  </div>
                </div>
                <p className="text-sm" style={{ color: N.text }}>{leader.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ──── SPIFFS & CONTESTS NEUMORPHIC ──── */}
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
          <Gift size={18} style={{ color: '#8b5cf6' }} /> Concursos y Spiffs Activos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPIFFS_CONTESTS.map((contest, idx) => (
            <div
              key={idx}
              className="rounded-xl p-4 border-2"
              style={{
                background: gradientBase,
                boxShadow: shadowOut(3),
                borderColor: `${contest.color}30`
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <span className="text-3xl">{contest.emoji}</span>
                <span
                  className="text-xs px-2 py-1 rounded-full font-semibold"
                  style={{
                    background: `${contest.color}20`,
                    color: contest.color
                  }}
                >
                  {contest.daysLeft} días
                </span>
              </div>
              <h4 className="font-bold mb-1" style={{ color: '#1e293b' }}>{contest.title}</h4>
              <p className="text-xs" style={{ color: N.text }}>{contest.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
