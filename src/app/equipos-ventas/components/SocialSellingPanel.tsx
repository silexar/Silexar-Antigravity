/**
 * COMPONENT: SOCIAL SELLING AMPLIFICATION — Sales Social Intelligence
 * 
 * @description Social selling dashboard con LinkedIn integration,
 * content engine, relationship mapping, y performance tracking.
 */

'use client';

import React from 'react';
import {
  Share2, Users, TrendingUp, Eye,
  FileText, Link2, Sparkles,
  ChevronRight, Star, BarChart3
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const SOCIAL_METRICS = [
  { label: 'Social Selling Index', value: '78/100', trend: '+5', color: 'text-blue-600' },
  { label: 'Content Shares', value: '142', trend: '+23%', color: 'text-purple-600' },
  { label: 'Prospects Reached', value: '2.4K', trend: '+18%', color: 'text-emerald-600' },
  { label: 'Engagement Rate', value: '4.2%', trend: '+0.8%', color: 'text-amber-600' },
];

const PROSPECT_RESEARCH = [
  { name: 'James Thompson', title: 'CTO, TechCorp Global', company: 'TechCorp', linkedinScore: 92, interests: ['AI', 'Cloud Migration', 'Security'], connections: 3, lastActivity: '2h ago' },
  { name: 'Sarah Kim', title: 'VP Operations, FinServ Solutions', company: 'FinServ', linkedinScore: 85, interests: ['Digital Transformation', 'Compliance'], connections: 1, lastActivity: '1d ago' },
  { name: 'Michael Chen', title: 'Director IT, HealthTech Labs', company: 'HealthTech', linkedinScore: 78, interests: ['HIPAA', 'Telemedicine'], connections: 2, lastActivity: '3d ago' },
];

const CONTENT_SUGGESTIONS = [
  { title: 'ROI of AI-Powered Sales Analytics', type: 'Article', relevance: 94, matchedProspects: 8, icon: FileText },
  { title: 'Q1 Industry Trends: Enterprise SaaS', type: 'Report', relevance: 88, matchedProspects: 5, icon: BarChart3 },
  { title: 'Customer Success: TechCorp Story', type: 'Case Study', relevance: 82, matchedProspects: 3, icon: Star },
];

const RELATIONSHIP_MAP = [
  { account: 'TechCorp Global', stakeholders: 5, champions: 2, blockers: 1, engagement: 87, strength: 'strong' },
  { account: 'FinServ Solutions', stakeholders: 3, champions: 1, blockers: 0, engagement: 72, strength: 'growing' },
  { account: 'HealthTech Labs', stakeholders: 4, champions: 0, blockers: 2, engagement: 45, strength: 'weak' },
];

const PERFORMANCE = [
  { rep: 'Ana García', ssi: 85, shares: 34, connections: 12, meetings: 5 },
  { rep: 'Roberto Silva', ssi: 72, shares: 22, connections: 8, meetings: 3 },
  { rep: 'María López', ssi: 68, shares: 18, connections: 6, meetings: 2 },
];

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SocialSellingPanel = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">

      {/* ──── HEADER ──── */}
      <div className="bg-gradient-to-r from-blue-600 via-sky-500 to-blue-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(255,255,255,0.12),transparent_50%)]" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Share2 size={18} className="text-sky-200" />
            <span className="text-xs font-bold uppercase tracking-widest text-sky-200">Social Selling Amplification</span>
            <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full flex items-center gap-1"><Link2 size={10} /> LinkedIn</span>
          </div>
          <h2 className="text-2xl font-bold mt-1">Potenciación de Venta Social</h2>
          <p className="text-sky-200 text-sm">Prospect research • Content engine • Relationship mapping</p>
        </div>
      </div>

      {/* ──── SOCIAL METRICS ──── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {SOCIAL_METRICS.map((m) => (
          <div key={m.label} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase font-semibold">{m.label}</p>
            <p className={`text-2xl font-bold ${m.color} mt-1`}>{m.value}</p>
            <p className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
              <TrendingUp size={10} /> {m.trend}
            </p>
          </div>
        ))}
      </div>

      {/* ──── PROSPECT RESEARCH ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Eye size={18} className="text-blue-500" /> Investigación Automática de Prospectos
          <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full flex items-center gap-1"><Sparkles size={10} /> AI</span>
        </h3>
        <div className="space-y-3">
          {PROSPECT_RESEARCH.map((p) => (
            <div key={p.name} className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:shadow-md transition-all cursor-pointer group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-sky-400 rounded-xl flex items-center justify-center text-white font-bold text-sm">
                {p.linkedinScore}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-800 text-sm">{p.name}</p>
                <p className="text-xs text-slate-400">{p.title}</p>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {p.interests.map((i) => (
                    <span key={`${i}`} className="text-[10px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">{i}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">{p.connections} mutual</p>
                <p className="text-[10px] text-slate-300">{p.lastActivity}</p>
              </div>
              <ChevronRight size={14} className="text-slate-300 group-hover:text-slate-500" />
            </div>
          ))}
        </div>
      </div>

      {/* ──── CONTENT SUGGESTIONS ──── */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileText size={18} className="text-purple-500" /> Motor de Sugerencias de Contenido
        </h3>
        <div className="space-y-3">
          {CONTENT_SUGGESTIONS.map((c) => (
            <div key={c.title} className="flex items-center gap-4 p-4 rounded-xl bg-purple-50/50 border border-purple-100 hover:shadow-sm transition-all cursor-pointer">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-white">
                <c.icon size={18} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-800">{c.title}</p>
                <p className="text-xs text-slate-400">{c.type} • Matches {c.matchedProspects} prospects</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-purple-600">{c.relevance}% match</span>
              </div>
              <button className="text-xs font-bold bg-purple-500 text-white px-3 py-1.5 rounded-lg hover:bg-purple-600">Share</button>
            </div>
          ))}
        </div>
      </div>

      {/* ──── RELATIONSHIP MAPPING ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <Users size={18} className="text-teal-500" /> Mapeo Automático de Relaciones
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Account</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Stakeholders</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Champions</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Blockers</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Engagement</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Strength</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {RELATIONSHIP_MAP.map((r) => (
              <tr key={r.account} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">{r.account}</td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">{r.stakeholders}</td>
                <td className="px-5 py-3 text-sm text-center text-emerald-600 font-bold">{r.champions}</td>
                <td className="px-5 py-3 text-sm text-center text-red-600 font-bold">{r.blockers}</td>
                <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-slate-800">{r.engagement}%</span></td>
                <td className="px-5 py-3 text-center">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    r.strength === 'strong' ? 'bg-emerald-100 text-emerald-700' :
                    r.strength === 'growing' ? 'bg-blue-100 text-blue-700' :
                    'bg-red-100 text-red-700'
                  }`}>{r.strength}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ──── TEAM PERFORMANCE ──── */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-5 border-b border-slate-100">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-500" /> Social Selling Performance
          </h3>
        </div>
        <table className="w-full">
          <thead>
            <tr className="bg-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase">Rep</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">SSI Score</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Shares</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">New Connections</th>
              <th className="px-5 py-3 text-center text-xs font-semibold text-slate-500 uppercase">Meetings Booked</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {PERFORMANCE.map((p) => (
              <tr key={p.rep} className="hover:bg-slate-50/50">
                <td className="px-5 py-3 text-sm font-semibold text-slate-800">{p.rep}</td>
                <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-blue-600">{p.ssi}</span></td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">{p.shares}</td>
                <td className="px-5 py-3 text-sm text-center text-slate-600">{p.connections}</td>
                <td className="px-5 py-3 text-center"><span className="text-sm font-bold text-emerald-600">{p.meetings}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
