/**
 * VIEW: EXECUTIVE DASHBOARD (COMPLETE — DAILY OPERATOR)
 * 
 * @description Vista principal para el Ejecutivo de Ventas.
 * Diseñada para el vendedor que entra CADA MAÑANA y necesita saber
 * exactamente qué hacer, cómo va, y qué está pendiente.
 * 
 * Incluye: Morning Brief IA, Smart To-Do, Activity Tracker,
 * Pipeline con next-steps, Forecast, Commissions, Coaching, Leaderboard, Agenda.
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
  MoreHorizontal
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MORNING_BRIEF = {
  greeting: `Buenos días, ${MOCK_USER.name}`,
  topPriority: 'Retail Giant cierra en 3 días — llama a las 10AM',
  dealsAtRisk: 1,
  pendingFollowUps: 3,
  meetingsToday: 4,
  aiAdvice: 'Focus on closing Retail Giant ($120K) hoy. Si cierras, alcanzas 95% de quota.',
};

const MINI_LEADERBOARD = [
  { name: 'Ana García', attainment: 141, streak: 4, badge: '🏆' },
  { name: 'Roberto Silva', attainment: 121, streak: 3, badge: '💎' },
  { name: MOCK_USER.name, attainment: Math.round((MOCK_USER.currentSales / MOCK_USER.quota) * 100), streak: 1, badge: '⭐', isYou: true },
];

const COACHING_TIPS = [
  { title: 'Discovery Mastery', progress: 72, color: 'bg-blue-500' },
  { title: 'Negotiation Skills', progress: 45, color: 'bg-purple-500' },
  { title: 'Closing Techniques', progress: 88, color: 'bg-emerald-500' },
];

const ENHANCED_DEALS = MOCK_DEALS.map((deal, i) => ({
  ...deal,
  nextStep: ['Llamar para confirmar decisión', 'Enviar propuesta revisada', 'Cerrado — facturar'][i] || 'Definir next step',
  daysSinceActivity: [2, 7, 0][i] || 0,
  aiSignal: ['🟢 On track', '🟡 Needs attention', '✅ Won'][i] || '',
}));


/* ─── COMPONENT ───────────────────────────────────────────── */

export const DashboardEjecutivo = () => {
  const userAttainment = Math.round((MOCK_USER.currentSales / MOCK_USER.quota) * 100);
  const [quickActionDeal, setQuickActionDeal] = useState<string | null>(null);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── MORNING BRIEF ──── */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl border border-slate-700/50 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(249,115,22,0.12),transparent_60%)]" />
        <div className="relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles size={14} className="text-orange-400" />
                <span className="text-xs text-orange-400 uppercase font-bold tracking-widest">Morning Brief</span>
              </div>
              <h2 className="text-2xl font-bold">{MORNING_BRIEF.greeting} 👋</h2>
              <p className="text-slate-400 text-sm mt-1">
                Llevas <span className={`font-bold ${userAttainment >= 100 ? 'text-emerald-400' : userAttainment >= 80 ? 'text-amber-400' : 'text-red-400'}`}>{userAttainment}%</span> de quota este mes
              </p>
              {/* Attainment bar */}
              <div className="w-64 bg-slate-700 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-1000 ${userAttainment >= 100 ? 'bg-emerald-500' : userAttainment >= 80 ? 'bg-amber-500' : 'bg-red-500'}`}
                  style={{ width: `${Math.min(userAttainment, 100)}%` }}
                />
              </div>
              <p className="text-xs text-slate-500 mt-1">${MOCK_USER.currentSales.toLocaleString()} / ${MOCK_USER.quota.toLocaleString()}</p>
            </div>
            <div className={`w-20 h-20 rounded-2xl flex items-center justify-center font-bold text-xl border-2 ${
              userAttainment >= 100 ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' :
              userAttainment >= 80 ? 'bg-amber-500/20 border-amber-500 text-amber-400' :
              'bg-red-500/20 border-red-500 text-red-400'
            }`}>
              {userAttainment}%
            </div>
          </div>
          
          {/* AI Quick Insights Row */}
          <div className="mt-4 grid grid-cols-4 gap-3">
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <p className="text-xs text-slate-400">Priority</p>
              <p className="text-sm font-bold text-orange-400 mt-0.5 truncate">{MORNING_BRIEF.topPriority.split('—')[0]}</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <p className="text-xs text-slate-400">At Risk</p>
              <p className="text-sm font-bold text-red-400 mt-0.5">{MORNING_BRIEF.dealsAtRisk} deal</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <p className="text-xs text-slate-400">Follow-ups</p>
              <p className="text-sm font-bold text-amber-400 mt-0.5">{MORNING_BRIEF.pendingFollowUps} pending</p>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center border border-white/10">
              <p className="text-xs text-slate-400">Meetings</p>
              <p className="text-sm font-bold text-blue-400 mt-0.5">{MORNING_BRIEF.meetingsToday} today</p>
            </div>
          </div>

          {/* AI Advice */}
          <div className="mt-3 bg-orange-500/10 rounded-xl px-4 py-2.5 border border-orange-500/20 flex items-start gap-2">
            <Brain size={14} className="text-orange-400 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-orange-200">{MORNING_BRIEF.aiAdvice}</p>
          </div>
        </div>
      </div>

      {/* ──── MAIN GRID ──── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN — 2/3 */}
        <div className="lg:col-span-2 space-y-6">

          {/* Smart To-Do */}
          <SmartTodoPanel />

          {/* Daily Activity Tracker */}
          <DailyActivityTracker />

          {/* Pipeline Kanban Board */}
          <div className="bg-white dark:bg-[#F0EDE8] rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
            <PipelineKanban />
          </div>

          {/* Pipeline / Deals — ENHANCED */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <TrendingUp size={18} className="text-blue-500" /> Mis Oportunidades Activas
              </h3>
              <span className="text-xs text-slate-400">{ENHANCED_DEALS.length} deals</span>
            </div>
            <div className="space-y-3">
              {ENHANCED_DEALS.map(deal => (
                <div key={deal.id} className="p-4 rounded-xl border border-slate-100 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-slate-800">{deal.clientName}</p>
                      <span className="text-xs">{deal.aiSignal}</span>
                    </div>
                    <p className="font-bold text-slate-800">${deal.amount.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        deal.stage === 'CLOSED_WON' ? 'bg-emerald-100 text-emerald-700' :
                        deal.stage === 'NEGOTIATION' ? 'bg-blue-100 text-blue-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>{deal.stage}</span>
                      <span className="text-xs text-slate-400">{deal.probability}% prob</span>
                      {deal.daysSinceActivity > 0 && (
                        <span className={`text-xs flex items-center gap-0.5 ${deal.daysSinceActivity >= 5 ? 'text-red-500' : 'text-slate-400'}`}>
                          {deal.daysSinceActivity >= 5 && <AlertTriangle size={10} />}
                          {deal.daysSinceActivity}d sin actividad
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400">Cierre: {deal.expectedCloseDate}</span>
                  </div>
                  {/* Next Step & Quick Actions */}
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-blue-50 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                      <ArrowUpRight size={10} className="text-blue-500" />
                      <span className="text-xs text-blue-700 font-medium">Next: {deal.nextStep}</span>
                    </div>
                    <div className="flex gap-1 relative">
                      <button
                        onClick={(e) => { e.stopPropagation(); setQuickActionDeal(quickActionDeal === deal.id ? null : deal.id); }}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                        title="Quick actions"
                      >
                        <MoreHorizontal size={14} />
                      </button>
                      {quickActionDeal === deal.id && (
                        <div className="absolute right-0 top-8 z-50">
                          <DealQuickActions
                            dealName={deal.clientName}
                            contactName={deal.clientName}
                            onClose={() => setQuickActionDeal(null)}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" /> Mi Posición
              </h3>
              <button className="text-xs font-semibold text-orange-500 hover:text-orange-700 flex items-center gap-1">
                Ver completo <ChevronRight size={14} />
              </button>
            </div>
            <div className="space-y-2">
              {MINI_LEADERBOARD.map((entry, idx) => (
                <div key={idx} className={`flex items-center gap-4 p-3 rounded-xl border transition-colors ${
                  entry.isYou ? 'bg-orange-50 border-orange-200' : 'border-slate-100'
                }`}>
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-slate-600">
                    #{idx + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-slate-800 text-sm">
                      {entry.name} {entry.isYou && <span className="text-xs text-orange-500">(Tú)</span>}
                    </p>
                    <span className="text-xs text-slate-400 flex items-center gap-0.5">
                      <Flame size={10} className="text-orange-500" /> {entry.streak}mo streak
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-lg">{entry.badge}</span>
                    <p className="text-sm font-bold text-slate-700">{entry.attainment}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN — 1/3 */}
        <div className="space-y-6">
          <ForecastPanel currentForecast={{ commit: 70000, bestCase: 100000 }} quota={MOCK_USER.quota} />
          <ComisionesWidget current={4500} potential={8200} />

          {/* Coaching Progress */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Brain size={18} className="text-violet-500" /> Mi Desarrollo
            </h3>
            <div className="space-y-3">
              {COACHING_TIPS.map((tip) => (
                <div key={tip.title}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-600 font-medium">{tip.title}</span>
                    <span className="text-xs font-bold text-slate-500">{tip.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className={`h-2 rounded-full ${tip.color}`} style={{ width: `${tip.progress}%` }} />
                  </div>
                </div>
              ))}
              <button className="text-xs font-semibold text-violet-600 flex items-center gap-1 mt-2 hover:text-violet-800">
                <BookOpen size={12} /> Ver plan de desarrollo <ChevronRight size={12} />
              </button>
            </div>
          </div>

          {/* Agenda — INTERACTIVE */}
          <AgendaInteractiva />
        </div>
      </div>
    </div>
  );
};
