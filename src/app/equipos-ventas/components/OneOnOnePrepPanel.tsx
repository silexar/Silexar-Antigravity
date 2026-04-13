/**
 * COMPONENT: MANAGER 1:1 MEETING PREP
 * 
 * @description Generador automatizado de prep para reuniones 1:1.
 * Recopila datos de performance, deals at risk, coaching suggestions,
 * y talking points para cada rep del equipo.
 */

'use client';

import React, { useState } from 'react';
import {
  Users, AlertTriangle,
  CheckCircle, MessageSquare, Target, Sparkles, ChevronDown,
  ChevronUp, Clock, BarChart3
} from 'lucide-react';

/* ─── MOCK DATA ──────────────────────────────────────────────── */

interface RepPrepData {
  name: string;
  role: string;
  avatar: string;
  attainment: number;
  dealsAtRisk: number;
  lastOneOnOne: string;
  topWin: string;
  topChallenge: string;
  aiTalkingPoints: string[];
  coachingFocus: string;
  mood: 'positive' | 'neutral' | 'struggling';
}

const REPS: RepPrepData[] = [
  {
    name: 'Ana García', role: 'Sr. Account Executive', avatar: 'AG',
    attainment: 128, dealsAtRisk: 0, lastOneOnOne: '7 days ago',
    topWin: 'Closed TechCorp $180K — 15 days ahead of schedule',
    topChallenge: 'Pipeline coverage dropping to 2.1x next quarter',
    aiTalkingPoints: ['Discuss promotion readiness', 'Mentoring assignment for junior reps', 'Q2 territory expansion opportunity'],
    coachingFocus: 'Leadership development',
    mood: 'positive',
  },
  {
    name: 'Roberto Méndez', role: 'Account Executive', avatar: 'RM',
    attainment: 87, dealsAtRisk: 3, lastOneOnOne: '14 days ago',
    topWin: 'Advanced DataFlow deal to Negotiation stage',
    topChallenge: '3 deals stale > 10 days, responding slowly to prospects',
    aiTalkingPoints: ['Review stale deal strategy', 'Time management assessment', 'Offer call shadowing with Ana'],
    coachingFocus: 'Pipeline management & urgency',
    mood: 'struggling',
  },
  {
    name: 'Laura Vásquez', role: 'Account Executive', avatar: 'LV',
    attainment: 102, dealsAtRisk: 1, lastOneOnOne: '5 days ago',
    topWin: 'Multi-threaded RetailMax deal — 4 stakeholders engaged',
    topChallenge: 'Need executive sponsor for CloudNova opportunity',
    aiTalkingPoints: ['Celebrate consistent overperformance', 'Plan exec sponsor intro for CloudNova', 'Discuss specialization path'],
    coachingFocus: 'Enterprise selling skills',
    mood: 'positive',
  },
  {
    name: 'Miguel Torres', role: 'BDR', avatar: 'MT',
    attainment: 65, dealsAtRisk: 0, lastOneOnOne: '21 days ago',
    topWin: 'Generated 12 qualified meetings this month',
    topChallenge: 'Low email response rates (8% vs 15% team avg)',
    aiTalkingPoints: ['Review email templates together', 'A/B test subject lines', 'Discuss career path to AE role'],
    coachingFocus: 'Outbound messaging effectiveness',
    mood: 'neutral',
  },
];

const MOOD_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  positive: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Positive' },
  neutral: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Neutral' },
  struggling: { bg: 'bg-red-100', text: 'text-red-700', label: 'Struggling' },
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const OneOnOnePrepPanel = () => {
  const [expandedRep, setExpandedRep] = useState<string | null>(REPS[0].name);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-violet-900 via-purple-800 to-violet-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(168,85,247,0.2),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Users size={18} className="text-purple-300" />
            <span className="text-xs font-bold uppercase tracking-widest text-purple-300">AI Meeting Prep</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">1:1 Meeting Preparation</h2>
          <p className="text-purple-300 text-sm mt-1">Auto-generated briefings for {REPS.length} direct reports</p>
        </div>
      </div>

      {/* ──── QUICK OVERVIEW ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Avg Attainment</p>
          <p className="text-2xl font-bold text-slate-800">{Math.round(REPS.reduce((a, r) => a + r.attainment, 0) / REPS.length)}%</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Deals at Risk</p>
          <p className="text-2xl font-bold text-red-500">{REPS.reduce((a, r) => a + r.dealsAtRisk, 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Overdue 1:1s</p>
          <p className="text-2xl font-bold text-amber-500">{REPS.filter(r => r.lastOneOnOne.includes('14') || r.lastOneOnOne.includes('21')).length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 uppercase font-semibold">Need Attention</p>
          <p className="text-2xl font-bold text-purple-500">{REPS.filter(r => r.mood === 'struggling').length}</p>
        </div>
      </div>

      {/* ──── REP PREP CARDS ──── */}
      <div className="space-y-3">
        {REPS.map((rep) => {
          const isExpanded = expandedRep === rep.name;
          const moodStyle = MOOD_STYLES[rep.mood];
          return (
            <div key={rep.name} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              {/* Collapsed header */}
              <button
                onClick={() => setExpandedRep(isExpanded ? null : rep.name)}
                className="w-full px-5 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white ${rep.mood === 'positive' ? 'bg-emerald-500' : rep.mood === 'struggling' ? 'bg-red-500' : 'bg-amber-500'}`}>
                    {rep.avatar}
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-slate-800 text-sm">{rep.name}</p>
                    <p className="text-[11px] text-slate-400">{rep.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`text-sm font-bold ${rep.attainment >= 100 ? 'text-emerald-600' : rep.attainment >= 80 ? 'text-amber-600' : 'text-red-600'}`}>
                      {rep.attainment}%
                    </p>
                    <p className="text-[10px] text-slate-400">Attainment</p>
                  </div>
                  {rep.dealsAtRisk > 0 && (
                    <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                      {rep.dealsAtRisk} at risk
                    </span>
                  )}
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${moodStyle.bg} ${moodStyle.text}`}>
                    {moodStyle.label}
                  </span>
                  {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
              </button>

              {/* Expanded details */}
              {isExpanded && (
                <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4 animate-in slide-in-from-top-1 duration-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Performance Summary */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <BarChart3 size={12} className="text-blue-500" /> Performance
                      </h4>
                      <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle size={12} className="text-emerald-500" />
                          <p className="text-xs text-slate-600"><span className="font-semibold">Top Win:</span> {rep.topWin}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <AlertTriangle size={12} className="text-amber-500" />
                          <p className="text-xs text-slate-600"><span className="font-semibold">Challenge:</span> {rep.topChallenge}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock size={12} className="text-slate-400" />
                          <p className="text-xs text-slate-400">Last 1:1: {rep.lastOneOnOne}</p>
                        </div>
                      </div>
                    </div>

                    {/* AI Suggestions */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-800 uppercase flex items-center gap-1.5">
                        <Sparkles size={12} className="text-violet-500" /> AI Talking Points
                      </h4>
                      <div className="space-y-2">
                        {rep.aiTalkingPoints.map((point, i) => (
                          <div key={`${point}-${i}`} className="flex items-start gap-2 bg-violet-50 rounded-lg px-3 py-2">
                            <MessageSquare size={10} className="text-violet-400 mt-0.5 flex-shrink-0" />
                            <p className="text-xs text-violet-700">{point}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Coaching Focus */}
                  <div className="bg-indigo-50 rounded-xl px-4 py-3 flex items-center gap-3 border border-indigo-100">
                    <Target size={14} className="text-indigo-500" />
                    <div>
                      <p className="text-[10px] text-indigo-400 uppercase font-bold">Coaching Focus</p>
                      <p className="text-sm font-semibold text-indigo-700">{rep.coachingFocus}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
