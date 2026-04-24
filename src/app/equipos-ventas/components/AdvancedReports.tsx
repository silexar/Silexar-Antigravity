/**
 * COMPONENT: ADVANCED REPORTS — Informes Detallados
 * 
 * @description Panel de informes avanzados con métricas de rendimiento,
 * análisis de pipeline, territorios y comisiones detalladas.
 * 
 * DESIGN: Neumorphic con base #EAF0F6, sombras #bec8de y #ffffff
 */

'use client';

import React, { useState } from 'react';
import {
    BarChart3, PieChart, TrendingUp, Download, Filter, Calendar,
    Users, DollarSign, Target, Award, FileText, Eye, RefreshCw,
    ChevronDown, ArrowUpRight, ArrowDownRight, Clock, MapPin
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const REPORT_TYPES = [
    { id: 'performance', label: 'Performance', icon: TrendingUp, color: 'emerald' },
    { id: 'pipeline', label: 'Pipeline', icon: PieChart, color: 'blue' },
    { id: 'commissions', label: 'Commissions', icon: DollarSign, color: 'amber' },
    { id: 'territory', label: 'Territory', icon: MapPin, color: 'violet' },
    { id: 'activities', label: 'Activities', icon: Clock, color: 'rose' },
];

const PERFORMANCE_METRICS = [
    { label: 'Total Revenue', value: '$4.2M', change: '+12.5%', positive: true },
    { label: 'Quota Attainment', value: '94%', change: '+8.2%', positive: true },
    { label: 'Win Rate', value: '34%', change: '-2.1%', positive: false },
    { label: 'Avg Deal Size', value: '$48K', change: '+5.7%', positive: true },
    { label: 'Sales Cycle', value: '42 days', change: '-3 days', positive: true },
    { label: 'Active Pipeline', value: '$8.1M', change: '+15.3%', positive: true },
];

const REP_RANKINGS = [
    { rank: 1, name: 'Ana García', revenue: '$680K', quota: '$600K', attainment: '113%', deals: 24 },
    { rank: 2, name: 'Roberto Silva', revenue: '$590K', quota: '$600K', attainment: '98%', deals: 21 },
    { rank: 3, name: 'María López', revenue: '$520K', quota: '$600K', attainment: '87%', deals: 19 },
    { rank: 4, name: 'Carlos Chen', revenue: '$480K', quota: '$600K', attainment: '80%', deals: 17 },
];

const STAGE_CONVERSION = [
    { stage: 'Prospects', count: 245, value: '$12.2M', conversion: 100 },
    { stage: 'Qualified', count: 156, value: '$7.8M', conversion: 64 },
    { stage: 'Proposal', count: 89, value: '$4.5M', conversion: 36 },
    { stage: 'Negotiation', count: 45, value: '$2.2M', conversion: 18 },
    { stage: 'Closed Won', count: 28, value: '$1.4M', conversion: 11 },
];

const PERIOD_OPTIONS = ['This Week', 'This Month', 'This Quarter', 'This Year', 'Custom'];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const formatCurrency = (v: string) => v;
const formatPercent = (v: string) => v;

/* ─── COMPONENT ───────────────────────────────────────────── */

export const AdvancedReports = () => {
    const [selectedReport, setSelectedReport] = useState('performance');
    const [selectedPeriod, setSelectedPeriod] = useState('This Quarter');
    const [generating, setGenerating] = useState(false);

    const handleGenerate = () => {
        setGenerating(true);
        setTimeout(() => setGenerating(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.05),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 size={18} className="text-slate-300" />
                            <span className="text-xs font-bold uppercase tracking-widest text-slate-300">Advanced Analytics</span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1">Sales Reports</h2>
                        <p className="text-slate-300 text-sm">Comprehensive performance analysis</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-colors">
                            <Download size={16} /> Export
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── REPORT TYPE SELECTOR ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                    {REPORT_TYPES.map((report) => (
                        <button
                            key={report.id}
                            onClick={() => setSelectedReport(report.id)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${selectedReport === report.id
                                ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg'
                                : 'bg-white/50 text-slate-600 hover:bg-white/70'
                                }`}
                        >
                            <report.icon size={16} />
                            {report.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* ──── FILTERS ──── */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2 px-4 py-2 bg-[#EAF0F6] rounded-xl shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                    <Calendar size={16} className="text-slate-400" />
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="bg-transparent text-sm text-slate-700 focus:outline-none cursor-pointer"
                    >
                        {PERIOD_OPTIONS.map((period) => (
                            <option key={period} value={period}>{period}</option>
                        ))}
                    </select>
                    <ChevronDown size={14} className="text-slate-400" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#EAF0F6] rounded-xl shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                    <Users size={16} className="text-slate-400" />
                    <select className="bg-transparent text-sm text-slate-700 focus:outline-none cursor-pointer">
                        <option>All Reps</option>
                        <option>Ana García</option>
                        <option>Roberto Silva</option>
                        <option>María López</option>
                        <option>Carlos Chen</option>
                    </select>
                    <ChevronDown size={14} className="text-slate-400" />
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-[#EAF0F6] rounded-xl shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                    <Filter size={16} className="text-slate-400" />
                    <span className="text-sm text-slate-600">More Filters</span>
                    <ChevronDown size={14} className="text-slate-400" />
                </div>
            </div>

            {/* ──── KEY METRICS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {PERFORMANCE_METRICS.map((metric, idx) => (
                    <div key={idx} className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                        <p className="text-xs text-slate-500 uppercase font-semibold mb-1">{metric.label}</p>
                        <p className="text-xl font-bold text-slate-800">{metric.value}</p>
                        <div className="flex items-center gap-1 mt-1">
                            {metric.positive ? (
                                <ArrowUpRight size={14} className="text-emerald-500" />
                            ) : (
                                <ArrowDownRight size={14} className="text-red-500" />
                            )}
                            <span className={`text-xs font-medium ${metric.positive ? 'text-emerald-600' : 'text-red-600'}`}>
                                {metric.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ──── REP RANKINGS ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Award size={18} className="text-amber-500" /> Rep Rankings
                    </h3>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <Eye size={14} /> View All
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rank</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rep</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Revenue</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Quota</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Attainment</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Deals</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {REP_RANKINGS.map((rep) => (
                                <tr key={rep.rank} className="transition-colors">
                                    <td className="px-4 py-4">
                                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${rep.rank === 1 ? 'bg-amber-400 text-white' :
                                            rep.rank === 2 ? 'bg-slate-300 text-slate-700' :
                                                rep.rank === 3 ? 'bg-amber-600 text-white' :
                                                    'bg-slate-100 text-slate-600'
                                            }`}>
                                            {rep.rank}
                                        </div>
                                    </td>
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                                {rep.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <span className="font-semibold text-slate-800 text-sm">{rep.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-mono font-semibold text-emerald-600">{rep.revenue}</td>
                                    <td className="px-4 py-4 text-sm text-right font-mono text-slate-600">{rep.quota}</td>
                                    <td className="px-4 py-4 text-right">
                                        <span className={`text-sm font-bold ${parseInt(rep.attainment) >= 100 ? 'text-emerald-600' :
                                            parseInt(rep.attainment) >= 80 ? 'text-amber-600' : 'text-red-600'
                                            }`}>
                                            {rep.attainment}
                                        </span>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-mono text-slate-600">{rep.deals}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── STAGE CONVERSION FUNNEL ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <TrendingUp size={18} className="text-blue-500" /> Pipeline Stage Conversion
                </h3>
                <div className="space-y-3">
                    {STAGE_CONVERSION.map((stage, idx) => {
                        const maxWidth = 100;
                        const width = (stage.conversion / maxWidth) * 100;
                        const colors = [
                            'from-blue-500 to-blue-600',
                            'from-indigo-500 to-indigo-600',
                            'from-violet-500 to-violet-600',
                            'from-purple-500 to-purple-600',
                            'from-emerald-500 to-emerald-600',
                        ];
                        return (
                            <div key={stage.stage} className="flex items-center gap-4">
                                <div className="w-24 text-sm font-medium text-slate-700">{stage.stage}</div>
                                <div className="flex-1">
                                    <div className="h-8 bg-white/50 rounded-lg overflow-hidden shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
                                        <div
                                            className={`h-full bg-gradient-to-r ${colors[idx]} rounded-lg flex items-center justify-end pr-3 transition-all duration-500`}
                                            style={{ width: `${width}%` }}
                                        >
                                            <span className="text-xs font-bold text-white">{stage.count}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-20 text-right">
                                    <span className="text-xs font-mono text-slate-500">{stage.value}</span>
                                </div>
                                <div className="w-12 text-right">
                                    <span className="text-xs font-bold text-slate-600">{stage.conversion}%</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ──── REPORT ACTIONS ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-violet-500" /> Generate Report
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { label: 'Performance Summary', desc: 'Weekly performance overview', format: 'PDF' },
                        { label: 'Commission Report', desc: 'Detailed commission breakdown', format: 'Excel' },
                        { label: 'Pipeline Analysis', desc: 'Stage-by-stage analysis', format: 'PDF' },
                    ].map((report, idx) => (
                        <button
                            key={idx}
                            onClick={handleGenerate}
                            disabled={generating}
                            className="p-4 bg-[#EAF0F6] rounded-xl text-left shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all disabled:opacity-50"
                        >
                            <div className="flex items-center justify-between mb-2">
                                <span className="font-semibold text-slate-800 text-sm">{report.label}</span>
                                <span className="text-xs px-2 py-0.5 bg-violet-100 text-violet-700 rounded font-medium">{report.format}</span>
                            </div>
                            <p className="text-xs text-slate-500 mb-3">{report.desc}</p>
                            <div className="flex items-center gap-2 text-xs text-blue-600">
                                {generating ? <RefreshCw size={12} className="animate-spin" /> : <Download size={12} />}
                                {generating ? 'Generating...' : 'Generate'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* ──── ACTION BUTTONS ──── */}
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Download size={16} /> Export All
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Filter size={16} /> Custom Report
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Calendar size={16} /> Schedule Reports
                </button>
            </div>
        </div>
    );
};
