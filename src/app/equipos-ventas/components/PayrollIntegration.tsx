/**
 * COMPONENT: PAYROLL INTEGRATION — Nómina y Comisiones
 * 
 * @description Panel de integración con sistemas de nómina para exportación
 * de comisiones, cálculo de pagos y sincronización con payroll.
 * 
 * DESIGN: Neumorphic con base #EAF0F6, sombras #bec8de y #ffffff
 */

'use client';

import React, { useState } from 'react';
import {
    DollarSign, FileText, Download, Send, CheckCircle2, Clock,
    AlertCircle, Users, Calendar, TrendingUp, Settings, RefreshCw,
    CreditCard, Building2, PiggyBank
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const PAYROLL_STATUS = {
    lastExport: '2025-01-15T10:00:00Z',
    nextExport: '2025-01-31T10:00:00Z',
    status: 'ready' as const,
    totalCommissions: 84750,
    pendingPayments: 12500,
};

const COMMISSION_REPORT = [
    { repId: 'REP001', repName: 'Ana García', baseSalary: 5000, commissions: 8500, spiffs: 1200, total: 14700, status: 'approved' },
    { repId: 'REP002', repName: 'Roberto Silva', baseSalary: 5000, commissions: 6200, spiffs: 800, total: 12000, status: 'approved' },
    { repId: 'REP003', repName: 'María López', baseSalary: 4500, commissions: 4800, spiffs: 600, total: 9900, status: 'pending' },
    { repId: 'REP004', repName: 'Carlos Chen', baseSalary: 4500, commissions: 3200, spiffs: 400, total: 8100, status: 'pending' },
];

const PAYROLL_PERIOD = {
    start: '2025-01-01',
    end: '2025-01-31',
    payDate: '2025-02-05',
};

const EXPORT_HISTORY = [
    { period: 'Dec 2024', date: '2024-12-31', amount: '$78,450', reps: 12, status: 'completed' },
    { period: 'Nov 2024', date: '2024-11-30', amount: '$82,100', reps: 12, status: 'completed' },
    { period: 'Oct 2024', date: '2024-10-31', amount: '$71,200', reps: 11, status: 'completed' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const fmtCurrency = (v: number) => `$${v.toLocaleString('en-US')}`;

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const PayrollIntegration = () => {
    const [exporting, setExporting] = useState(false);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');

    const handleExport = () => {
        setExporting(true);
        setTimeout(() => setExporting(false), 2500);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'approved': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'pending': return <Clock size={16} className="text-amber-500" />;
            case 'rejected': return <AlertCircle size={16} className="text-red-500" />;
            default: return <Clock size={16} className="text-slate-400" />;
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <PiggyBank size={18} className="text-emerald-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Payroll Integration</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Ready to Export
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1">Commission Payroll</h2>
                        <p className="text-emerald-200 text-sm">Period: {formatDate(PAYROLL_PERIOD.start)} - {formatDate(PAYROLL_PERIOD.end)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-emerald-200">Pay Date</p>
                        <p className="text-2xl font-bold">{formatDate(PAYROLL_PERIOD.payDate)}</p>
                    </div>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Total Commissions</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{fmtCurrency(PAYROLL_STATUS.totalCommissions)}</p>
                    <p className="text-xs text-slate-400 mt-1">4 reps</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{fmtCurrency(PAYROLL_STATUS.pendingPayments)}</p>
                    <p className="text-xs text-slate-400 mt-1">2 reps</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Users size={16} className="text-blue-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Employees</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">4</p>
                    <p className="text-xs text-slate-400 mt-1">Active</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-violet-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Avg Commission</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">$21,188</p>
                    <p className="text-xs text-slate-400 mt-1">Per rep</p>
                </div>
            </div>

            {/* ──── COMMISSION TABLE ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" /> Commission Report
                    </h3>
                    <div className="flex gap-2">
                        {['weekly', 'bi-weekly', 'monthly'].map((period) => (
                            <button
                                key={period}
                                onClick={() => setSelectedPeriod(period)}
                                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${selectedPeriod === period
                                        ? 'bg-emerald-500 text-white shadow-md'
                                        : 'bg-white/50 text-slate-600 hover:bg-white/70'
                                    }`}
                            >
                                {period.charAt(0).toUpperCase() + period.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left">
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Rep</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Base Salary</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Commissions</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Spiffs</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Total</th>
                                <th className="px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {COMMISSION_REPORT.map((rep) => (
                                <tr key={rep.repId} className="transition-colors">
                                    <td className="px-4 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
                                                {rep.repName.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-800 text-sm">{rep.repName}</p>
                                                <p className="text-xs text-slate-400">{rep.repId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-4 text-sm text-right font-mono text-slate-600">{fmtCurrency(rep.baseSalary)}</td>
                                    <td className="px-4 py-4 text-sm text-right font-mono text-emerald-600">{fmtCurrency(rep.commissions)}</td>
                                    <td className="px-4 py-4 text-sm text-right font-mono text-blue-600">{fmtCurrency(rep.spiffs)}</td>
                                    <td className="px-4 py-4 text-sm text-right font-mono font-bold text-slate-800">{fmtCurrency(rep.total)}</td>
                                    <td className="px-4 py-4 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {getStatusIcon(rep.status)}
                                            <span className={`text-xs font-medium ${rep.status === 'approved' ? 'text-emerald-600' : 'text-amber-600'
                                                }`}>
                                                {rep.status.charAt(0).toUpperCase() + rep.status.slice(1)}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* TOTALS ROW */}
                            <tr className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold rounded-b-2xl">
                                <td className="px-4 py-4 text-sm rounded-bl-2xl">TOTAL</td>
                                <td className="px-4 py-4 text-sm text-right font-mono">{fmtCurrency(COMMISSION_REPORT.reduce((s, r) => s + r.baseSalary, 0))}</td>
                                <td className="px-4 py-4 text-sm text-right font-mono">{fmtCurrency(COMMISSION_REPORT.reduce((s, r) => s + r.commissions, 0))}</td>
                                <td className="px-4 py-4 text-sm text-right font-mono">{fmtCurrency(COMMISSION_REPORT.reduce((s, r) => s + r.spiffs, 0))}</td>
                                <td className="px-4 py-4 text-sm text-right font-mono">{fmtCurrency(COMMISSION_REPORT.reduce((s, r) => s + r.total, 0))}</td>
                                <td className="px-4 py-4 text-center rounded-br-2xl">
                                    <span className="text-xs font-bold bg-white/20 px-2 py-1 rounded-full">
                                        {COMMISSION_REPORT.filter(r => r.status === 'approved').length}/{COMMISSION_REPORT.length}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ──── PAYROLL INTEGRATIONS ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Building2 size={18} className="text-violet-500" /> Connected Payroll Systems
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        { name: 'QuickBooks Payroll', status: 'connected', lastSync: '2 hours ago' },
                        { name: 'ADP Workforce', status: 'connected', lastSync: '1 day ago' },
                        { name: 'Gusto', status: 'available', lastSync: null },
                    ].map((system) => (
                        <div key={system.name} className="bg-[#EAF0F6] rounded-xl p-4 shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <CreditCard size={16} className="text-slate-500" />
                                    <span className="font-semibold text-slate-700 text-sm">{system.name}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${system.status === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                    }`}>
                                    {system.status === 'connected' ? 'Connected' : 'Available'}
                                </span>
                            </div>
                            {system.lastSync && (
                                <p className="text-xs text-slate-400">Last sync: {system.lastSync}</p>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── EXPORT HISTORY ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Calendar size={18} className="text-amber-500" /> Export History
                </h3>
                <div className="space-y-2">
                    {EXPORT_HISTORY.map((exp, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/50">
                                    <FileText size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">{exp.period}</p>
                                    <p className="text-xs text-slate-400">{exp.date}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-slate-700">{exp.amount}</p>
                                    <p className="text-xs text-slate-400">{exp.reps} reps</p>
                                </div>
                                <span className="flex items-center gap-1 text-xs text-emerald-600">
                                    <CheckCircle2 size={14} /> {exp.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── ACTION BUTTONS ──── */}
            <div className="flex flex-wrap gap-3">
                <button
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-emerald-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all disabled:opacity-50"
                >
                    {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                    {exporting ? 'Exporting...' : 'Export to Payroll'}
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Send size={16} /> Send to Approval
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Settings size={16} /> Configure
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <FileText size={16} /> View Full Report
                </button>
            </div>
        </div>
    );
};
