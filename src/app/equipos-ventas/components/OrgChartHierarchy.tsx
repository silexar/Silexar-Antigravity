/**
 * COMPONENT: ORG CHART HIERARCHY
 * Vista interactiva del organigrama de la fuerza de ventas.
 */

import React from 'react';
import { ChevronDown, Users } from 'lucide-react';

interface OrgNode {
  name: string;
  title: string;
  quota: string;
  attainment: number;
  teams?: { name: string; emoji: string; attainment: number; headcount: string; quota: string; status: string }[];
}

const MOCK_ORG: OrgNode = {
  name: 'Maria Gonzalez', title: 'VP SALES', quota: '$15M', attainment: 134,
  teams: [
    { name: 'Enterprise West', emoji: '\u{1F3E2}', attainment: 156, headcount: '4 AEs + 2 SDRs', quota: '$3.2M', status: '\u{1F3AF} All Green' },
    { name: 'Enterprise East', emoji: '\u{1F3E2}', attainment: 118, headcount: '3 AEs + 2 SDRs', quota: '$2.8M', status: '\u26A0\uFE0F Need 1 SDR' },
    { name: 'MM North', emoji: '\u{1F3EA}', attainment: 145, headcount: '6 AEs + 3 SDRs', quota: '$2.1M', status: '\u{1F680} Expanding' },
    { name: 'Inside Sales', emoji: '\u{1F4DE}', attainment: 118, headcount: '8 ISRs + 4 SDRs', quota: '$1.8M', status: '\u{1F7E1} Growing' },
  ]
};

const ProgressBar = ({ value, max = 200 }: { value: number; max?: number }) => {
  const pct = Math.min((value / max) * 100, 100);
  const color = value >= 150 ? 'bg-emerald-500' : value >= 120 ? 'bg-blue-500' : value >= 90 ? 'bg-amber-500' : 'bg-red-500';
  return (
    <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
      <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
};

export const OrgChartHierarchy = () => {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
        <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users size={18} className="text-blue-500" /> Vista Organizacional</h3>
        <button className="text-xs text-blue-600 font-semibold">Expandir Todo</button>
      </div>

      {/* VP Node */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-6 text-center">
        <p className="font-bold text-xl">{MOCK_ORG.name}</p>
        <p className="text-slate-400 text-sm">{MOCK_ORG.title}</p>
        <div className="flex items-center justify-center gap-6 mt-3">
          <span className="text-sm">Meta: <b>{MOCK_ORG.quota}</b></span>
          <span className="text-sm">Cumplimiento: <b className="text-emerald-400">{MOCK_ORG.attainment}%</b></span>
        </div>
        <div className="max-w-xs mx-auto mt-3"><ProgressBar value={MOCK_ORG.attainment} /></div>
      </div>

      {/* Connector */}
      <div className="flex justify-center"><div className="w-px h-6 bg-slate-300" /><ChevronDown size={16} className="text-slate-300 -mt-1" /></div>

      {/* Team Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-6">
        {MOCK_ORG.teams?.map((team, i) => (
          <div key={`${team}-${i}`} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-lg">{team.emoji}</span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${team.attainment >= 140 ? 'bg-emerald-100 text-emerald-700' : team.attainment >= 120 ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{team.attainment}%</span>
            </div>
            <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{team.name}</h4>
            <p className="text-xs text-slate-500 mt-1">{team.headcount}</p>
            <p className="text-xs text-slate-500">Meta: {team.quota}</p>
            <div className="mt-2"><ProgressBar value={team.attainment} /></div>
            <p className="text-xs mt-2 font-medium">{team.status}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
