/**
 * COMPONENT: CORTEX-TALENT — AI Talent Development Panel
 * 
 * @description Identificación automática de high-potential performers,
 * career pathing personalizado, skill gaps, y succession planning.
 */

'use client';

import React from 'react';
import {
  Star, Target, Users,
  ChevronRight, Sparkles, ArrowUpRight,
  GraduationCap, Crown
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const HIGH_POTENTIALS = [
  { name: 'Ana García', role: 'Senior AE', score: 94, strengths: ['Closing', 'Enterprise Selling'], nextRole: 'Team Lead', readiness: 92, badges: ['🏆', '💎'] },
  { name: 'Sofia Rodríguez', role: 'AE', score: 88, strengths: ['Discovery', 'Relationship Building'], nextRole: 'Senior AE', readiness: 85, badges: ['⭐', '🚀'] },
  { name: 'Roberto Silva', role: 'AE', score: 82, strengths: ['Pipeline Building', 'Product Knowledge'], nextRole: 'Senior AE', readiness: 68, badges: ['📈'] },
];

const SKILL_GAPS = [
  { skill: 'Enterprise Negotiation', teamAvg: 62, benchmark: 85, gap: -23, priority: 'high' },
  { skill: 'Discovery Methodology', teamAvg: 71, benchmark: 80, gap: -9, priority: 'medium' },
  { skill: 'Value Selling', teamAvg: 58, benchmark: 75, gap: -17, priority: 'high' },
  { skill: 'Technical Demos', teamAvg: 78, benchmark: 80, gap: -2, priority: 'low' },
];

const SUCCESSION_PLAN = [
  { currentRole: 'Sales Manager', currentHolder: 'Carlos López', successor1: 'Ana García (92%)', successor2: 'Roberto Silva (68%)', status: 'ready' },
  { currentRole: 'Team Lead Enterprise', currentHolder: 'Vacant', successor1: 'Ana García (92%)', successor2: 'Sofia Rodríguez (85%)', status: 'urgent' },
];

const CAREER_PATHS = [
  { from: 'BDR/SDR', to: 'Account Executive', avgTime: '12-18 months', requirements: 3 },
  { from: 'Account Executive', to: 'Senior AE', avgTime: '18-24 months', requirements: 5 },
  { from: 'Senior AE', to: 'Team Lead', avgTime: '24-36 months', requirements: 7 },
  { from: 'Team Lead', to: 'Sales Manager', avgTime: '36+ months', requirements: 9 },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const CortexTalentPanel = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Crown size={18} />
            <span className="text-xs font-bold uppercase tracking-widest text-amber-100">Cortex-Talent</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10} /> AI Powered</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">IA de Desarrollo de Talento</h2>
          <p className="text-amber-100 text-sm">Identificación de high-potentials • Career pathing • Succession planning</p>
        </div>
      </div>

      {/* ──── HIGH-POTENTIAL PERFORMERS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Star size={18} className="text-amber-500" /> High-Potential Performers
        </h3>
        <div className="space-y-3">
          {HIGH_POTENTIALS.map((person) => (
            <div key={person.name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-lg">
                {person.score}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-sm">{person.name}</p>
                  {person.badges.map((b, i) => <span key={`${b}-${i}`} className="text-sm">{b}</span>)}
                </div>
                <p className="text-xs text-slate-400">{person.role} → <span className="text-amber-600 font-semibold">{person.nextRole}</span></p>
                <div className="flex items-center gap-2 mt-1">
                  {person.strengths.map((s) => (
                    <span key={s} className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400">Readiness</p>
                <p className={`text-lg font-bold ${person.readiness >= 80 ? 'text-emerald-600' : person.readiness >= 60 ? 'text-amber-600' : 'text-red-600'}`}>{person.readiness}%</p>
                <div className="w-16 bg-slate-200 rounded-full h-1.5 mt-1">
                  <div className={`h-1.5 rounded-full ${person.readiness >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${person.readiness}%` }} />
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* ──── SKILL GAPS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Target size={18} className="text-red-500" /> Análisis de Brechas de Habilidades
        </h3>
        <div className="space-y-3">
          {SKILL_GAPS.map((gap) => (
            <div key={gap.skill} className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <p className="text-sm font-semibold text-slate-800">{gap.skill}</p>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  gap.priority === 'high' ? 'bg-red-100 text-red-700' :
                  gap.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-slate-100 text-slate-500'
                }`}>{gap.priority}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="w-full bg-slate-200 rounded-full h-2 relative">
                    <div className="absolute top-0 h-2 rounded-full bg-blue-500" style={{ width: `${gap.teamAvg}%` }} />
                    <div className="absolute top-0 h-2 w-px bg-emerald-600" style={{ left: `${gap.benchmark}%` }} />
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-blue-600 font-semibold">Team: {gap.teamAvg}%</span>
                  <span className="text-emerald-600 font-semibold">Target: {gap.benchmark}%</span>
                  <span className="text-red-500 font-bold">{gap.gap}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ──── CAREER PATHING ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <GraduationCap size={18} className="text-purple-500" /> Career Pathing
        </h3>
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {CAREER_PATHS.map((path, idx) => (
            <React.Fragment key={path.from}>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 min-w-[140px] text-center flex-shrink-0">
                <p className="text-xs font-bold text-slate-800">{path.from}</p>
                <p className="text-[10px] text-slate-400 mt-1">{path.avgTime}</p>
                <p className="text-[10px] text-purple-600 font-semibold">{path.requirements} requirements</p>
              </div>
              {idx < CAREER_PATHS.length - 1 && (
                <ArrowUpRight size={16} className="text-slate-300 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* ──── SUCCESSION PLANNING ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-indigo-500" /> Planificación de Sucesión
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rol</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Titular</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sucesor #1</th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Sucesor #2</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {SUCCESSION_PLAN.map((row) => (
              <tr key={row.currentRole} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">{row.currentRole}</td>
                <td className="px-5 py-3 text-sm text-slate-600">{row.currentHolder}</td>
                <td className="px-5 py-3 text-sm text-emerald-600 font-medium">{row.successor1}</td>
                <td className="px-5 py-3 text-sm text-blue-600 font-medium">{row.successor2}</td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                    row.status === 'ready' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                  }`}>{row.status === 'ready' ? '✅ Ready' : '🔴 Urgent'}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
