/**
 * COMPONENT: LEADERBOARD GAMIFICADO — Sistema de Clasificación
 * 
 * @description Leaderboard enterprise con streaks, badges, milestones,
 * activity leaders, y spiffs/contests activos. Real-time update feel.
 */

'use client';

import React, { useState } from 'react';
import {
  Trophy, Flame, Zap, Target,
  Phone, Calendar, TrendingUp, Gift,
  Crown, ArrowRight
} from 'lucide-react';

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
  { category: 'Most Calls', name: 'Sofia Rodríguez', role: 'SDR', value: '342 calls this month', icon: Phone, color: 'text-blue-600 bg-blue-50' },
  { category: 'Most Meetings', name: 'Diego Chen', role: 'AE', value: '89 meetings', icon: Calendar, color: 'text-purple-600 bg-purple-50' },
  { category: 'Best Conversion', name: 'Ana García', role: 'AE', value: '34% meeting-to-close', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
];

const SPIFFS_CONTESTS = [
  { emoji: '🎄', title: 'Holiday Push', description: 'Extra $5K for deals closed by Dec 31', color: 'from-red-500 to-green-600', daysLeft: 12 },
  { emoji: '🆕', title: 'New Logo Contest', description: '$10K + trip to Hawaii for most new customers', color: 'from-blue-500 to-cyan-500', daysLeft: 30 },
  { emoji: '📞', title: 'SDR Blitz Week', description: 'Extra $500 per week for >50 calls/day', color: 'from-orange-500 to-amber-500', daysLeft: 5 },
];

/* ─── FIRE INDICATOR ──────────────────────────────────────────── */

const FireIndicator = ({ level }: { level: 'high' | 'medium' | 'low' }) => {
  if (level === 'high') return <span className="text-orange-500 animate-pulse">🔥</span>;
  if (level === 'medium') return <span className="text-amber-500">⚡</span>;
  return <span className="text-blue-500">🎯</span>;
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const LeaderboardGamificado = () => {
  const [activeView, setActiveView] = useState<'performance' | 'alltime' | 'contests'>('performance');

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Trophy size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">Sales Leaderboard</h2>
              <p className="text-white/80 text-sm">Q4 2024 — Updated Real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span className="text-xs font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* ──── QUOTA ATTAINMENT LEADERS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Crown size={18} className="text-amber-500" /> Quota Attainment Leaders
        </h3>
        <div className="space-y-4">
          {QUOTA_LEADERS.map((leader) => (
            <div key={leader.rank} className={`rounded-xl border p-5 transition-all hover:shadow-md cursor-pointer group ${
              leader.rank === 1 ? 'border-amber-200 bg-gradient-to-r from-amber-50/80 to-orange-50/50' :
              leader.rank === 2 ? 'border-slate-200 bg-gradient-to-r from-slate-50/80 to-slate-50/30' :
              leader.rank === 3 ? 'border-orange-200 bg-gradient-to-r from-orange-50/50 to-amber-50/30' :
              'border-slate-100 bg-white'
            }`}>
              <div className="flex items-start gap-4">
                {/* Rank */}
                <div className="flex flex-col items-center gap-1 min-w-[40px]">
                  <span className="text-2xl">{leader.rankEmoji}</span>
                  <span className="text-xs font-bold text-slate-400">#{leader.rank}</span>
                </div>

                {/* Name & Team */}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-slate-800 group-hover:text-orange-700 transition-colors">{leader.name}</h4>
                    <span className="text-xs text-slate-400">({leader.team})</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 mt-2">
                    {/* Streak */}
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <Flame size={12} className="text-orange-500" /> Streak: {leader.streak} months {'>'}quota
                    </span>
                    {/* Badge */}
                    <span className="text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                      {leader.badgeEmoji} {leader.badge}
                    </span>
                    {/* Next milestone */}
                    {leader.nextMilestone && (
                      <span className="text-xs text-purple-600 font-medium flex items-center gap-1">
                        <Target size={10} /> Next: {leader.nextMilestone}
                      </span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="text-right flex items-center gap-3">
                  <FireIndicator level={leader.fireLevel} />
                  <div>
                    <p className="text-lg font-bold text-slate-800">{leader.attainment}%</p>
                    <p className="text-xs text-slate-400">{leader.revenue}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTIVITY LEADERS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Zap size={18} className="text-blue-500" /> Activity Leaders
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {ACTIVITY_LEADERS.map((leader) => (
            <div key={leader.category} className={`rounded-xl border border-slate-100 p-5 hover:shadow-sm transition-all`}>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${leader.color} mb-3`}>
                <leader.icon size={18} />
              </div>
              <p className="text-xs text-slate-400 uppercase font-semibold tracking-wide">{leader.category}</p>
              <p className="font-bold text-slate-800 mt-1">{leader.name} <span className="text-xs text-slate-400 font-normal">({leader.role})</span></p>
              <p className="text-sm text-slate-500 mt-0.5">{leader.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ──── SPIFFS & CONTESTS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Gift size={18} className="text-pink-500" /> Current Spiffs & Contests
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SPIFFS_CONTESTS.map((contest) => (
            <div key={contest.title} className="rounded-xl border border-slate-100 overflow-hidden hover:shadow-md transition-all cursor-pointer group">
              <div className={`bg-gradient-to-r ${contest.color} p-4 text-white`}>
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{contest.emoji}</span>
                  <span className="text-xs bg-white/25 backdrop-blur-sm px-2 py-0.5 rounded-full font-semibold">
                    {contest.daysLeft}d left
                  </span>
                </div>
                <h4 className="font-bold text-lg mt-2">{contest.title}</h4>
              </div>
              <div className="p-4">
                <p className="text-sm text-slate-600">{contest.description}</p>
                <button className="text-xs font-semibold text-orange-600 mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                  Ver detalles <ArrowRight size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'My Performance', icon: Target, key: 'performance' },
          { label: 'All-time Leaders', icon: Crown, key: 'alltime' },
          { label: 'Active Contests', icon: Gift, key: 'contests' },
        ].map((btn) => (
          <button
            key={btn.key}
            onClick={() => setActiveView(btn.key as 'performance' | 'alltime' | 'contests')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${
              activeView === btn.key
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white border-amber-500 shadow-lg shadow-amber-500/20'
                : 'bg-white text-slate-600 border-slate-200 hover:border-orange-300 hover:shadow-sm'
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
