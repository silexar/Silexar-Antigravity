/**
 * COMPONENT: SALESFORCE INTEGRATION — Sincronización CRM
 * 
 * @description Panel de integración con Salesforce para sincronización
 * depipeline, deals, cuentas y contactos en tiempo real.
 * 
 * DESIGN: Neumorphic con base #EAF0F6, sombras #bec8de y #ffffff
 */

'use client';

import React, { useState } from 'react';
import {
    RefreshCw, CheckCircle2, AlertCircle, Clock, ExternalLink,
    ArrowDownToLine, ArrowUpFromLine, User, Building2, Handshake,
    Activity, Zap, Settings
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const SYNC_STATUS = {
    lastSync: '2025-01-15T14:30:00Z',
    nextSync: '2025-01-15T15:30:00Z',
    status: 'connected' as const,
    recordsSynced: 1247,
};

const SALESFORCE_OBJECTS = [
    { type: 'Account', synced: 342, pending: 12, failed: 2, icon: Building2 },
    { type: 'Contact', synced: 1205, pending: 28, failed: 5, icon: User },
    { type: 'Opportunity', synced: 156, pending: 8, failed: 1, icon: Handshake },
    { type: 'Lead', synced: 89, pending: 34, failed: 7, icon: Activity },
];

const PIPELINE_SYNC = [
    { stage: 'Prospecting', sfStage: 'Prospecting', deals: 45, value: '$2.1M', synced: true },
    { stage: 'Qualification', sfStage: 'Qualification', deals: 38, value: '$3.4M', synced: true },
    { stage: 'Proposal', sfStage: 'Proposal/Price Quote', deals: 24, value: '$1.8M', synced: false },
    { stage: 'Negotiation', sfStage: 'Value Proposition', deals: 15, value: '$2.2M', synced: true },
    { stage: 'Closed Won', sfStage: 'Closed Won', deals: 28, value: '$4.1M', synced: true },
    { stage: 'Closed Lost', sfStage: 'Closed Lost', deals: 12, value: '$890K', synced: true },
];

const RECENT_ACTIVITIES = [
    { action: 'Sync Account', record: 'Acme Corporation', status: 'success', time: '2 min ago' },
    { action: 'Update Opportunity', record: 'Enterprise Deal #1234', status: 'success', time: '5 min ago' },
    { action: 'Sync Contact', record: 'John Smith', status: 'warning', time: '8 min ago' },
    { action: 'Create Lead', record: 'New Lead from Web', status: 'success', time: '12 min ago' },
    { action: 'Sync Failed', record: 'Account #5678', status: 'error', time: '15 min ago' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SalesforceIntegration = () => {
    const [syncing, setSyncing] = useState(false);
    const [autoSync, setAutoSync] = useState(true);

    const handleSync = () => {
        setSyncing(true);
        setTimeout(() => setSyncing(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-200" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Salesforce Integration</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${SYNC_STATUS.status === 'connected' ? 'bg-emerald-400/30 text-emerald-200' : 'bg-amber-400/30 text-amber-200'
                                }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${SYNC_STATUS.status === 'connected' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                                {SYNC_STATUS.status === 'connected' ? 'Connected' : 'Syncing'}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1">CRM Sync Dashboard</h2>
                        <p className="text-blue-200 text-sm">Last sync: {formatDate(SYNC_STATUS.lastSync)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleSync}
                            disabled={syncing}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        >
                            <RefreshCw size={16} className={syncing ? 'animate-spin' : ''} />
                            {syncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── SYNC STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Records Synced</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{SYNC_STATUS.recordsSynced.toLocaleString()}</p>
                    <p className="text-xs text-slate-400 mt-1">Total synced</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-blue-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Next Sync</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{formatDate(SYNC_STATUS.nextSync)}</p>
                    <p className="text-xs text-slate-400 mt-1">Scheduled</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowDownToLine size={16} className="text-violet-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Inbound</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">847</p>
                    <p className="text-xs text-slate-400 mt-1">From Salesforce</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <ArrowUpFromLine size={16} className="text-amber-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Outbound</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">400</p>
                    <p className="text-xs text-slate-400 mt-1">To Salesforce</p>
                </div>
            </div>

            {/* ──── OBJECT SYNC STATUS ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Activity size={18} className="text-blue-500" /> Object Sync Status
                    </h3>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <span className="text-xs text-slate-500">Auto-sync</span>
                        <button
                            onClick={() => setAutoSync(!autoSync)}
                            className={`w-10 h-5 rounded-full transition-colors relative ${autoSync ? 'bg-indigo-500' : 'bg-slate-300'
                                }`}
                        >
                            <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${autoSync ? 'left-5' : 'left-0.5'
                                }`} />
                        </button>
                    </label>
                </div>
                <div className="space-y-3">
                    {SALESFORCE_OBJECTS.map((obj) => (
                        <div key={obj.type} className="bg-[#EAF0F6] rounded-xl p-4 shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <obj.icon size={16} className="text-slate-500" />
                                    <span className="font-semibold text-slate-700">{obj.type}</span>
                                </div>
                                <span className="text-xs text-emerald-600 font-semibold">{obj.synced} synced</span>
                            </div>
                            <div className="flex gap-4 text-xs">
                                <span className="text-slate-500">{obj.pending} pending</span>
                                {obj.failed > 0 && <span className="text-red-500">{obj.failed} failed</span>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── PIPELINE SYNC MAPPING ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Zap size={18} className="text-amber-500" /> Pipeline Stage Mapping
                </h3>
                <div className="space-y-2">
                    {PIPELINE_SYNC.map((stage) => (
                        <div key={stage.stage} className="flex items-center justify-between p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                            <div className="flex items-center gap-3">
                                {stage.synced ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : (
                                    <AlertCircle size={16} className="text-amber-500" />
                                )}
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">{stage.stage}</p>
                                    <p className="text-xs text-slate-400">→ {stage.sfStage}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-slate-700">{stage.deals} deals</p>
                                <p className="text-xs text-slate-400">{stage.value}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── RECENT ACTIVITY ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-violet-500" /> Recent Activity
                </h3>
                <div className="space-y-2">
                    {RECENT_ACTIVITIES.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#EAF0F6] rounded-xl">
                            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${activity.status === 'success' ? 'bg-emerald-500' :
                                    activity.status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
                                }`} />
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700">
                                    <span className="text-slate-500">{activity.action}:</span> {activity.record}
                                </p>
                                <p className="text-xs text-slate-400">{activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── ACTION BUTTONS ──── */}
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-indigo-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Settings size={16} /> Configure
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <ExternalLink size={16} /> Open Salesforce
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <RefreshCw size={16} /> View Sync Logs
                </button>
            </div>
        </div>
    );
};
