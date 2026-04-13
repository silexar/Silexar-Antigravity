/**
 * VIEW: VP COMMAND CENTER (COMPLETE — ALL MODULES)
 * 
 * Centro de Comando Total para el VP de Ventas.
 * 12 tabs: Command Center, Performance, Leaderboard, Coaching,
 * Automations, Commissions, Forecast, Security, Talent, Territory,
 * Competitive Intel, Social Selling.
 */

'use client';

import React, { useState } from 'react';
import { CommandHeader } from './CommandHeader';
import { AdvancedSearch } from './AdvancedSearch';
import { SmartFilters } from './SmartFilters';
import { SmartActionCenter } from './SmartActionCenter';
import { OrgChartHierarchy } from './OrgChartHierarchy';
import { EnterpriseTeamTable } from './EnterpriseTeamTable';
import { PerformanceDashboard } from './PerformanceDashboard';
import { LeaderboardGamificado } from './LeaderboardGamificado';
import { CoachingSystem } from './CoachingSystem';
import { CortexAutomationsPanel } from './CortexAutomationsPanel';
import { CommissionCalculator } from './CommissionCalculator';
import { CollaborativeForecast } from './CollaborativeForecast';
import { SecurityRBACPanel } from './SecurityRBACPanel';
import { CortexTalentPanel } from './CortexTalentPanel';
import { TerritorialIntelligence } from './TerritorialIntelligence';
import { CompetitiveIntelligence } from './CompetitiveIntelligence';
import { SocialSellingPanel } from './SocialSellingPanel';
import { PipelineWaterfall } from './PipelineWaterfall';
import { ExportDataButton } from './ExportDataButton';
import { useAnimatedCounter } from '../hooks/useAnimatedCounter';
import { 
  Globe, MapPin, BarChart3, LayoutDashboard, Trophy,
  Brain, DollarSign, Zap, PieChart, Shield, Crown,
  Swords, Share2, Waves
} from 'lucide-react';

type VPSection = 
  | 'command' | 'performance' | 'leaderboard' | 'coaching'
  | 'automations' | 'commissions' | 'forecast' | 'security'
  | 'talent' | 'territory' | 'competitive' | 'social' | 'waterfall';

/* ─── ANIMATED KPI CARDS ──────────────────────────────────── */

const KPICards = () => {
  const revenue = useAnimatedCounter(4200000, { prefix: '$', duration: 1800, easing: 'easeOut' });
  const pipeline = useAnimatedCounter(8700000, { prefix: '$', duration: 2000, easing: 'easeOut' });
  const winRate = useAnimatedCounter(67, { suffix: '%', duration: 1500, easing: 'easeOut' });
  const attainment = useAnimatedCounter(112, { suffix: '%', duration: 1600, easing: 'easeOut' });

  const kpis = [
    { label: 'Total Revenue', value: revenue, change: '+12% YoY', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-100' },
    { label: 'Pipeline', value: pipeline, change: '3.2x coverage', color: 'text-blue-600', bg: 'bg-blue-50 border-blue-100' },
    { label: 'Win Rate', value: winRate, change: '+5pp vs Q3', color: 'text-purple-600', bg: 'bg-purple-50 border-purple-100' },
    { label: 'Team Attainment', value: attainment, change: '22/28 reps on track', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-100' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className={`rounded-2xl p-5 border ${kpi.bg} transition-all hover:shadow-md`}>
          <p className="text-xs text-slate-500 uppercase font-semibold">{kpi.label}</p>
          <p className={`text-3xl font-bold ${kpi.color} mt-1 tabular-nums`}>{kpi.value}</p>
          <p className="text-xs text-slate-400 mt-0.5">{kpi.change}</p>
        </div>
      ))}
    </div>
  );
};

export const DashboardVP = () => {
  const [activeSection, setActiveSection] = useState<VPSection>('command');

  const sections = [
    { key: 'command' as const, label: 'Command Center', icon: LayoutDashboard, color: 'bg-[#F0EDE8]' },
    { key: 'performance' as const, label: 'Performance', icon: BarChart3, color: 'bg-blue-600' },
    { key: 'leaderboard' as const, label: 'Leaderboard', icon: Trophy, color: 'bg-amber-500' },
    { key: 'coaching' as const, label: 'Coaching IA', icon: Brain, color: 'bg-violet-600' },
    { key: 'automations' as const, label: 'Automations', icon: Zap, color: 'bg-indigo-600' },
    { key: 'commissions' as const, label: 'Commissions', icon: DollarSign, color: 'bg-emerald-600' },
    { key: 'forecast' as const, label: 'Forecast', icon: PieChart, color: 'bg-blue-700' },
    { key: 'security' as const, label: 'Security', icon: Shield, color: 'bg-red-700' },
    { key: 'talent' as const, label: 'Talent', icon: Crown, color: 'bg-orange-500' },
    { key: 'territory' as const, label: 'Territory', icon: Globe, color: 'bg-teal-600' },
    { key: 'competitive' as const, label: 'Intel', icon: Swords, color: 'bg-rose-600' },
    { key: 'social' as const, label: 'Social', icon: Share2, color: 'bg-sky-500' },
    { key: 'waterfall' as const, label: 'Waterfall', icon: Waves, color: 'bg-indigo-700' },
  ];

  const groups = [
    { label: 'Sales Ops', items: sections.filter(s => ['command','performance','leaderboard','commissions','forecast','waterfall'].includes(s.key)) },
    { label: 'AI Intelligence', items: sections.filter(s => ['coaching','automations','talent','competitive','social'].includes(s.key)) },
    { label: 'Analytics', items: sections.filter(s => ['territory','security'].includes(s.key)) },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-700">

      {/* ──── GROUPED SECTION NAVIGATOR ──── */}
      <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
        <div className="flex gap-6 flex-wrap">
          {groups.map((group) => (
            <div key={group.label} className="flex items-center gap-1.5">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-widest mr-1">{group.label}</span>
              {group.items.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setActiveSection(s.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeSection === s.key
                      ? `${s.color} text-white shadow-lg`
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
                  }`}
                >
                  <s.icon size={14} />
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* ──── COMMAND CENTER ──── */}
      {activeSection === 'command' && (
        <div className="space-y-8">
          {/* KPI Summary Cards — Animated */}
          <KPICards />

          {/* Export */}
          <div className="flex justify-end">
            <ExportDataButton
              data={[
                { metric: 'Total Revenue', value: '$4,200,000', change: '+12% YoY' },
                { metric: 'Pipeline', value: '$8,700,000', change: '3.2x coverage' },
                { metric: 'Win Rate', value: '67%', change: '+5pp vs Q3' },
                { metric: 'Team Attainment', value: '112%', change: '22/28 reps on track' },
              ]}
              filename="vp-kpis"
              label="Exportar KPIs"
            />
          </div>
          <CommandHeader />
          <SmartActionCenter />
          <div className="bg-slate-100/50 p-4 rounded-2xl border border-slate-200/60 sticky top-4 z-10 backdrop-blur-md shadow-sm">
            <div className="space-y-4">
              <AdvancedSearch />
              <SmartFilters />
            </div>
          </div>
          <OrgChartHierarchy />
          <EnterpriseTeamTable />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Globe size={18} className="text-blue-500" /> Mapa de Calor Global
              </h3>
              <div className="h-48 bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-center relative overflow-hidden">
                <div className="relative z-10 text-center">
                  <MapPin className="text-orange-500 mx-auto animate-bounce" size={32} />
                  <p className="text-xs font-bold text-slate-500 mt-2">LATAM: 115% Quota</p>
                  <p className="text-xs text-slate-400">NA: 134% | EMEA: 98%</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                <BarChart3 size={18} className="text-purple-500" /> Mix de Revenue
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Enterprise</span><span className="font-bold text-slate-800">55%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-purple-600 h-2 rounded-full" style={{width: '55%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">SMB / Mid-Market</span><span className="font-bold text-slate-800">30%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '30%'}}></div></div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1"><span className="text-slate-600">Expansion</span><span className="font-bold text-slate-800">15%</span></div>
                  <div className="w-full bg-slate-100 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '15%'}}></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──── MODULE VIEWS ──── */}
      {activeSection === 'performance' && <PerformanceDashboard />}
      {activeSection === 'leaderboard' && <LeaderboardGamificado />}
      {activeSection === 'coaching' && <CoachingSystem />}
      {activeSection === 'automations' && <CortexAutomationsPanel />}
      {activeSection === 'commissions' && <CommissionCalculator />}
      {activeSection === 'forecast' && <CollaborativeForecast />}
      {activeSection === 'security' && <SecurityRBACPanel />}
      {activeSection === 'talent' && <CortexTalentPanel />}
      {activeSection === 'territory' && <TerritorialIntelligence />}
      {activeSection === 'competitive' && <CompetitiveIntelligence />}
      {activeSection === 'social' && <SocialSellingPanel />}
      {activeSection === 'waterfall' && <PipelineWaterfall />}
    </div>
  );
};
