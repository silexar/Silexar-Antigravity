/**
 * COMPONENT: COACHING SYSTEM — Cortex-Coaching IA
 * 
 * @description Sistema inteligente de coaching y desarrollo.
 * Incluye: Performance analysis, plan de coaching 6 semanas,
 * recommended training, schedule, y action buttons.
 */

'use client';

import React, { useState } from 'react';
import {
  Brain, TrendingDown, Target, BookOpen, Users, Calendar,
  Phone, BarChart3, ChevronRight, Play, Clock,
  Sparkles, Video,
  MessageSquare, ArrowRight
} from 'lucide-react';

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
  issue: 'Low discovery-to-demo conversion',
  issueDetail: '34% vs team avg 52%',
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
    phase: 'Discovery Skills Boot Camp', weeks: 'WEEK 1-2',
    color: 'text-blue-700', bgColor: 'bg-blue-50', borderColor: 'border-blue-200',
    items: [
      { emoji: '📚', text: 'Required: "SPIN Selling" modules 3-5' },
      { emoji: '🎭', text: 'Role-play: 3 sessions with manager' },
      { emoji: '📞', text: 'Call shadowing: Listen to top performer calls' },
    ],
  },
  {
    phase: 'Field Application', weeks: 'WEEK 3-4',
    color: 'text-amber-700', bgColor: 'bg-amber-50', borderColor: 'border-amber-200',
    items: [
      { emoji: '🎯', text: 'Apply new techniques in 10+ discovery calls' },
      { emoji: '📊', text: 'Manager reviews: 5 recorded calls' },
      { emoji: '🏆', text: 'Target: Improve conversion to 45%' },
    ],
  },
  {
    phase: 'Mastery & Reinforcement', weeks: 'WEEK 5-6',
    color: 'text-emerald-700', bgColor: 'bg-emerald-50', borderColor: 'border-emerald-200',
    items: [
      { emoji: '🧠', text: 'Peer mentoring with Ana García' },
      { emoji: '📈', text: 'Track metrics: Daily conversion tracking' },
      { emoji: '🎉', text: 'Success milestone: 50% conversion rate' },
    ],
  },
];

const RECOMMENDED_TRAINING = [
  { title: 'Challenger Customer Methodology', type: 'Course', duration: '8h', icon: BookOpen, color: 'bg-blue-50 text-blue-600' },
  { title: 'Advanced Questioning Techniques', type: 'Workshop', duration: '4h', icon: MessageSquare, color: 'bg-purple-50 text-purple-600' },
  { title: 'Objection Handling Masterclass', type: 'Video', duration: '3h', icon: Video, color: 'bg-orange-50 text-orange-600' },
];

const SCHEDULE = [
  { event: 'Weekly 1:1s with manager', day: 'Tuesdays 10 AM', icon: Phone, color: 'bg-blue-500' },
  { event: 'Peer mentoring', day: 'Thursdays 2 PM', icon: Users, color: 'bg-purple-500' },
  { event: 'Progress review', day: 'End of month', icon: BarChart3, color: 'bg-emerald-500' },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CoachingSystem = () => {
  const [, setPlanStarted] = useState(false);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <Brain size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">Cortex-Coaching</h2>
                <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                  <Sparkles size={10} /> AI Powered
                </span>
              </div>
              <p className="text-white/80 text-sm">Recommendations Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── PERSON CARD ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-2xl">
            {COACHING_TARGET.avatar}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">{COACHING_TARGET.name}</h3>
            <p className="text-sm text-slate-400">{COACHING_TARGET.role} — {COACHING_TARGET.team}</p>
          </div>
        </div>

        {/* ──── PERFORMANCE ANALYSIS ──── */}
        <div className="bg-red-50/60 border border-red-100 rounded-xl p-5 mb-0">
          <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-red-500" /> Performance Analysis
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Current</p>
              <p className="text-2xl font-bold text-red-600">{PERFORMANCE_ANALYSIS.currentQuota}% quota</p>
              <p className="text-xs text-red-500 font-medium mt-0.5">Below {PERFORMANCE_ANALYSIS.threshold}% threshold</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Trend</p>
              <p className="text-2xl font-bold text-red-600 flex items-center gap-1">
                <TrendingDown size={20} /> {PERFORMANCE_ANALYSIS.trend}%
              </p>
              <p className="text-xs text-slate-400 mt-0.5">vs last quarter</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase font-semibold">Issue</p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{PERFORMANCE_ANALYSIS.issue}</p>
              <p className="text-xs text-red-500 font-medium mt-0.5">{PERFORMANCE_ANALYSIS.issueDetail}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ──── COACHING PLAN AUTOMÁTICO ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Target size={18} className="text-violet-500" /> Coaching Plan Automático
          <span className="text-xs bg-violet-100 text-violet-600 px-2 py-0.5 rounded-full font-semibold border border-violet-200">6 Weeks</span>
        </h3>
        <div className="space-y-4">
          {COACHING_PLAN.map((phase, idx) => (
            <div key={idx} className={`${phase.bgColor} border ${phase.borderColor} rounded-xl p-5 transition-all hover:shadow-sm`}>
              <div className="flex items-center gap-2 mb-3">
                <span className={`text-xs font-bold uppercase tracking-widest ${phase.color}`}>{phase.weeks}</span>
                <span className="text-slate-300">|</span>
                <h4 className={`font-bold text-sm ${phase.color}`}>{phase.phase}</h4>
              </div>
              <div className="space-y-2">
                {phase.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="text-sm flex-shrink-0">{item.emoji}</span>
                    <p className="text-sm text-slate-700">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Progress Timeline */}
        <div className="flex items-center justify-center gap-1 mt-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <React.Fragment key={i}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                i < 2 ? 'bg-blue-100 border-blue-400 text-blue-700' :
                i < 4 ? 'bg-amber-100 border-amber-400 text-amber-700' :
                'bg-emerald-100 border-emerald-400 text-emerald-700'
              }`}>
                W{i + 1}
              </div>
              {i < 5 && <div className="w-6 h-0.5 bg-slate-200" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ──── RECOMMENDED TRAINING ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <BookOpen size={18} className="text-blue-500" /> Recommended Training
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {RECOMMENDED_TRAINING.map((training) => (
            <div key={training.title} className="rounded-xl border border-slate-100 p-5 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${training.color} mb-3`}>
                <training.icon size={18} />
              </div>
              <h4 className="font-semibold text-slate-800 text-sm group-hover:text-blue-700 transition-colors">{training.title}</h4>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">{training.type}</span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock size={10} /> {training.duration}
                </span>
              </div>
              <button className="text-xs font-semibold text-blue-600 mt-3 flex items-center gap-1 group-hover:gap-2 transition-all">
                Start <ArrowRight size={12} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ──── SCHEDULE ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-5 flex items-center gap-2">
          <Calendar size={18} className="text-emerald-500" /> Schedule
        </h3>
        <div className="space-y-3">
          {SCHEDULE.map((item) => (
            <div key={item.event} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-all">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center text-white flex-shrink-0`}>
                <item.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-slate-800 text-sm">{item.event}</p>
                <p className="text-xs text-slate-400">{item.day}</p>
              </div>
              <button className="text-xs text-slate-400 hover:text-blue-600 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ──── ACTION BUTTONS ──── */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Start Coaching Plan', icon: Play, color: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white border-violet-600 shadow-lg shadow-violet-600/20 hover:shadow-violet-600/30' },
          { label: 'Schedule 1:1', icon: Phone, color: 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:shadow-sm' },
          { label: 'Track Progress', icon: BarChart3, color: 'bg-white text-slate-600 border-slate-200 hover:border-violet-300 hover:shadow-sm' },
        ].map((btn) => (
          <button
            key={btn.label}
            onClick={() => { if (btn.label === 'Start Coaching Plan') setPlanStarted(true); }}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all border ${btn.color}`}
          >
            <btn.icon size={16} />
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
};
