/**
 * COMPONENT: ORG CHART HIERARCHY - TIER 0 NEUMORPHIC
 * Vista interactiva del organigrama de la fuerza de ventas.
 * Diseno neumorfico oficial de Silexar Pulse.
 */

'use client';

import React, { useState } from 'react';
import { ChevronDown, Users, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react';

interface OrgNode {
  name: string;
  title: string;
  quota: string;
  attainment: number;
  teams?: {
    name: string;
    emoji: string;
    attainment: number;
    headcount: string;
    quota: string;
    status: string;
    statusColor: 'emerald' | 'blue' | 'amber' | 'red';
  }[];
}

const MOCK_ORG: OrgNode = {
  name: 'Maria Gonzalez',
  title: 'VP SALES',
  quota: '$15M',
  attainment: 134,
  teams: [
    { name: 'Enterprise West', emoji: '🏢', attainment: 156, headcount: '4 AEs + 2 SDRs', quota: '$3.2M', status: '🏆 All Green', statusColor: 'emerald' },
    { name: 'Enterprise East', emoji: '🏢', attainment: 118, headcount: '3 AEs + 2 SDRs', quota: '$2.8M', status: '⚠️ Need 1 SDR', statusColor: 'amber' },
    { name: 'MM North', emoji: '🏪', attainment: 145, headcount: '6 AEs + 3 SDRs', quota: '$2.1M', status: '🚀 Expanding', statusColor: 'blue' },
    { name: 'Inside Sales', emoji: '📞', attainment: 118, headcount: '8 ISRs + 4 SDRs', quota: '$1.8M', status: '🟡 Growing', statusColor: 'blue' },
  ]
};

const ProgressBar = ({ value, max = 200, size = 'md' }: { value: number; max?: number; size?: 'sm' | 'md' | 'lg' }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 150
    ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
    : value >= 120
      ? 'bg-gradient-to-r from-blue-500 to-blue-400'
      : value >= 90
        ? 'bg-gradient-to-r from-amber-500 to-amber-400'
        : 'bg-gradient-to-r from-red-500 to-red-400';

  const heightClass = size === 'sm' ? 'h-2' : size === 'lg' ? 'h-3' : 'h-2.5';

  return (
    <div className={`w-full bg-[#bec8de] rounded-full overflow-hidden ${heightClass} shadow-[inset_2px_2px_4px_#d1d5db,inset_-2px_-2px_4px_#ffffff]`}>
      <div
        className={`h-full rounded-full transition-all duration-1000 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
};

const AttainmentBadge = ({ value }: { value: number }) => {
  const colorClass = value >= 150
    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
    : value >= 120
      ? 'bg-blue-100 text-blue-700 border-blue-300'
      : value >= 90
        ? 'bg-amber-100 text-amber-700 border-amber-300'
        : 'bg-red-100 text-red-700 border-red-300';

  return (
    <span className={`text-sm font-bold px-3 py-1 rounded-full border ${colorClass} shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]`}>
      {value}%
    </span>
  );
};

export const OrgChartHierarchy = () => {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="bg-[#EAF0F6] rounded-3xl shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 bg-white/80 border-b border-slate-200/50 flex items-center justify-between">
        <h3 className="font-black text-slate-700 flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md">
            <Users size={18} className="text-white" />
          </div>
          Vista Organizacional
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold ml-2">
            <Sparkles size={10} className="inline mr-1" />
            AI-Powered
          </span>
        </h3>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
        >
          {expanded ? 'Contraer' : 'Expandir'}
          <ChevronDown size={16} className={`transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* VP Node - Neumorphic Card */}
      {expanded && (
        <div className="p-6 space-y-4">
          <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
            {/* Decorative gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_60%)]" />

            <div className="relative z-10 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Sparkles size={14} className="text-amber-400" />
                <span className="text-xs uppercase tracking-widest text-amber-400 font-bold">VP SALES</span>
              </div>
              <p className="font-black text-2xl">{MOCK_ORG.name}</p>
              <p className="text-slate-400 text-sm mt-1">{MOCK_ORG.title}</p>

              {/* Quota and Attainment */}
              <div className="flex items-center justify-center gap-8 mt-4">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Meta</p>
                  <p className="text-xl font-black">{MOCK_ORG.quota}</p>
                </div>
                <div className="w-px h-10 bg-slate-600" />
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-400">Attainment</p>
                  <div className="flex items-center justify-center gap-2">
                    <p className={`text-xl font-black ${MOCK_ORG.attainment >= 130 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {MOCK_ORG.attainment}%
                    </p>
                    <TrendingUp size={16} className="text-emerald-400" />
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-xs mx-auto mt-4">
                <ProgressBar value={MOCK_ORG.attainment} size="lg" />
              </div>
            </div>
          </div>

          {/* Connector Line */}
          <div className="flex justify-center">
            <div className="w-px h-6 bg-gradient-to-b from-slate-300 to-transparent" />
            <ChevronDown size={16} className="text-slate-400 -mt-1" />
          </div>

          {/* Team Nodes - Neumorphic Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {MOCK_ORG.teams?.map((team, i) => (
              <div
                key={`${team}-${i}`}
                className="bg-[#EAF0F6] rounded-2xl p-4 cursor-pointer group transition-all duration-300
                  shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
                  hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
                  active:shadow-[inset_4px_4px_8px_#d1d5db,inset_-4px_-4px_8px_#ffffff]"
              >
                {/* Team Header */}
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl">{team.emoji}</span>
                  <AttainmentBadge value={team.attainment} />
                </div>

                {/* Team Name */}
                <h4 className="font-black text-slate-700 text-sm group-hover:text-indigo-600 transition-colors">
                  {team.name}
                </h4>

                {/* Team Details */}
                <div className="mt-2 space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <Users size={12} className="text-slate-400" />
                    <span>{team.headcount}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="text-slate-400">📍</span>
                    <span>Meta: {team.quota}</span>
                  </div>
                </div>

                {/* Progress */}
                <div className="mt-3">
                  <ProgressBar value={team.attainment} size="sm" />
                </div>

                {/* Status */}
                <div className={`mt-3 inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-semibold ${team.statusColor === 'emerald'
                  ? 'bg-emerald-100 text-emerald-700'
                  : team.statusColor === 'blue'
                    ? 'bg-blue-100 text-blue-700'
                    : team.statusColor === 'amber'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                  {team.status}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-slate-200/50">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(34,197,94,0.5)]" />
              <span>≥150% Elite</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-full bg-blue-500 shadow-[0_0_6px_rgba(59,130,246,0.5)]" />
              <span>120-149% Strong</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-full bg-amber-500 shadow-[0_0_6px_rgba(234,179,8,0.5)]" />
              <span>90-119% On Track</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <div className="w-3 h-3 rounded-full bg-red-500 shadow-[0_0_6px_rgba(239,68,68,0.5)]" />
              <span>&lt;90% Needs Attention</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
