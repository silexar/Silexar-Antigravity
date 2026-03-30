/**
 * VIEW: MANAGER DASHBOARD (ENHANCED)
 * 
 * @description Vista para Supervisores/Jefes. Muestra métricas agregadas,
 * tabla de equipo, forecast, y acceso a Performance Dashboard, Leaderboard, y Coaching.
 */

'use client';

import React, { useState } from 'react';
import { MOCK_TEAM } from '../mock-data';
import { TablaEquipos } from './TablaEquipos';
import { PerformanceDashboard } from './PerformanceDashboard';
import { LeaderboardGamificado } from './LeaderboardGamificado';
import { CoachingSystem } from './CoachingSystem';
import { CommissionCalculator } from './CommissionCalculator';
import { TeamPulsePanel } from './TeamPulsePanel';
import { CollaborativeForecast } from './CollaborativeForecast';
import { TerritorialIntelligence } from './TerritorialIntelligence';
import { OneOnOnePrepPanel } from './OneOnOnePrepPanel';
import { 
  Users, Target, TrendingUp, AlertCircle, LayoutDashboard,
  BarChart3, Trophy, Brain, DollarSign, Activity, PieChart, Globe, UserCheck
} from 'lucide-react';

const NumericCard = ({ label, value, subtext, icon: Icon, color }: { label: string; value: string; subtext: string; icon: React.ElementType; color: string }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 flex items-start justify-between">
    <div>
      <p className="text-sm text-slate-500">{label}</p>
      <h3 className="text-3xl font-bold text-slate-800 mt-2">{value}</h3>
      <p className={`text-xs mt-1 font-medium ${subtext.includes('+') ? 'text-emerald-600' : 'text-slate-400'}`}>{subtext}</p>
    </div>
    <div className={`p-3 rounded-xl ${color}`}>
       <Icon size={24} className="text-white" />
    </div>
  </div>
);

type ManagerSection = 'overview' | 'pulse' | 'performance' | 'leaderboard' | 'coaching' | 'commissions' | 'forecast' | 'territory' | 'oneOnOne';

export const DashboardManager = () => {
  const compliance = (MOCK_TEAM.totalSales / MOCK_TEAM.totalQuota) * 100;
  const [activeSection, setActiveSection] = useState<ManagerSection>('overview');

  const sections = [
    { key: 'overview' as const, label: 'Mi Equipo', icon: LayoutDashboard },
    { key: 'pulse' as const, label: 'Team Pulse', icon: Activity },
    { key: 'performance' as const, label: 'Performance', icon: BarChart3 },
    { key: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy },
    { key: 'coaching' as const, label: 'Coaching', icon: Brain },
    { key: 'commissions' as const, label: 'Commissions', icon: DollarSign },
    { key: 'forecast' as const, label: 'Forecast', icon: PieChart },
    { key: 'territory' as const, label: 'Territory', icon: Globe },
    { key: 'oneOnOne' as const, label: '1:1 Prep', icon: UserCheck },
  ];

  return (
    <div className="space-y-8">
      {/* Section Navigator */}
      <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex gap-2 flex-wrap">
        {sections.map((s) => (
          <button
            key={s.key}
            onClick={() => setActiveSection(s.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeSection === s.key
                ? 'bg-slate-900 text-white shadow-lg'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
            }`}
          >
            <s.icon size={16} />
            {s.label}
          </button>
        ))}
      </div>

      {/* ──── OVERVIEW ──── */}
      {activeSection === 'overview' && (
        <>
          {/* Header */}
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Panel de Control: {MOCK_TEAM.name}</h2>
            <p className="text-slate-500">Región: {MOCK_TEAM.region} • {MOCK_TEAM.members.length} Miembros</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <NumericCard 
              label="Ventas Totales" 
              value={`$${(MOCK_TEAM.totalSales/1000).toFixed(0)}k`} 
              subtext="vs Mes Anterior: +12%"
              icon={TrendingUp}
              color="bg-emerald-500"
            />
            <NumericCard 
              label="Meta Equipo" 
              value={`$${(MOCK_TEAM.totalQuota/1000).toFixed(0)}k`} 
              subtext={`${compliance.toFixed(1)}% Cumplimiento`}
              icon={Target}
              color={compliance >= 90 ? 'bg-blue-500' : 'bg-orange-500'}
            />
            <NumericCard 
              label="Forecast Ponderado" 
              value="$480k" 
              subtext="Proyección Q4"
              icon={Users}
              color="bg-purple-500"
            />
             <NumericCard 
              label="Deals en Riesgo" 
              value="3" 
              subtext="Requieren atención"
              icon={AlertCircle}
              color="bg-red-500"
            />
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TablaEquipos members={MOCK_TEAM.members} />
            </div>
            
            <div className="space-y-6">
              {/* Mini Widget: Top Performer */}
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl p-6 text-white text-center">
                 <div className="w-16 h-16 bg-white/20 rounded-full mx-auto flex items-center justify-center backdrop-blur-sm mb-3">
                   <span className="text-2xl">🏆</span>
                 </div>
                 <p className="text-white/80 text-sm font-medium uppercase tracking-wide">Top Performer</p>
                 <h3 className="text-2xl font-bold mt-1">Ana García</h3>
                 <p className="text-sm mt-1 bg-white/20 inline-block px-3 py-1 rounded-full">125% Cumplimiento</p>
              </div>

              {/* Forecast Team */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                 <h3 className="font-bold text-slate-800 mb-4">Forecast del Equipo</h3>
                 <div className="h-40 flex items-end justify-between gap-2">
                    {[40, 65, 80].map((h, i) => (
                      <div key={i} className="w-full bg-slate-100 rounded-t-lg relative group">
                         <div 
                           className={`absolute bottom-0 w-full rounded-t-lg transition-all duration-500 ${i===1 ? 'bg-orange-400' : i===2 ? 'bg-blue-500' : 'bg-slate-300'}`} 
                           style={{ height: `${h}%` }}
                         ></div>
                         <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-slate-500 opacity-0 group-hover:opacity-100">{h}k</span>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between text-xs text-slate-400 mt-2">
                   <span>Commit</span>
                   <span>Likely</span>
                   <span>Best</span>
                 </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ──── PERFORMANCE ──── */}
      {activeSection === 'performance' && <PerformanceDashboard />}

      {/* ──── LEADERBOARD ──── */}
      {activeSection === 'leaderboard' && <LeaderboardGamificado />}

      {/* ──── COACHING ──── */}
      {activeSection === 'coaching' && <CoachingSystem />}

      {/* ──── COMMISSIONS ──── */}
      {activeSection === 'commissions' && <CommissionCalculator />}

      {/* ──── TEAM PULSE ──── */}
      {activeSection === 'pulse' && <TeamPulsePanel />}

      {/* ──── FORECAST ──── */}
      {activeSection === 'forecast' && <CollaborativeForecast />}

      {/* ──── TERRITORY ──── */}
      {activeSection === 'territory' && <TerritorialIntelligence />}

      {/* ──── 1:1 MEETING PREP ──── */}
      {activeSection === 'oneOnOne' && <OneOnOnePrepPanel />}
    </div>
  );
};
