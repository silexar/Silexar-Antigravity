/**
 * COMPONENT: DOCUSIGN INTEGRATION — Contratos y Firmas Digitales
 * 
 * @description Panel de integración con DocuSign para envío, seguimiento
 * y gestión de contratos y documentos para firma digital.
 * 
 * DESIGN: Neumorphic con base #EAF0F6, sombras #bec8de y #ffffff
 */

'use client';

import React, { useState } from 'react';
import {
    FileText, Send, CheckCircle2, Clock, AlertCircle, Download,
    Eye, RefreshCw, Settings, Signature, Calendar, User,
    Building2, Mail, Check, X, ExternalLink
} from 'lucide-react';

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const DOCUSIGN_STATUS = {
    connected: true,
    account: 'Silexar Productions',
    envelopesSent: 156,
    envelopesPending: 23,
    envelopesCompleted: 133,
};

const PENDING_ENVELOPES = [
    { id: 'ENV001', name: 'Enterprise Contract - Acme Corp', recipient: 'John Smith', sentDate: '2025-01-14', status: 'sent', dueDate: '2025-01-21' },
    { id: 'ENV002', name: 'Service Agreement - TechStart', recipient: 'Maria Garcia', sentDate: '2025-01-13', status: 'viewed', dueDate: '2025-01-20' },
    { id: 'ENV003', name: 'NDA - Global Media', recipient: 'Robert Chen', sentDate: '2025-01-12', status: 'sent', dueDate: '2025-01-19' },
    { id: 'ENV004', name: 'Partnership Agreement - Beta Inc', recipient: 'Sarah Johnson', sentDate: '2025-01-10', status: 'expired', dueDate: '2025-01-17' },
];

const RECENT_ACTIVITY = [
    { action: 'Signed', document: 'Sales Agreement - Alpha Corp', time: '1 hour ago', signer: 'James Wilson' },
    { action: 'Sent', document: 'Enterprise Contract - Beta Ltd', time: '3 hours ago', signer: 'Emily Brown' },
    { action: 'Viewed', document: 'Service Contract - Gamma Inc', time: '5 hours ago', signer: 'Michael Davis' },
    { action: 'Completed', document: 'NDA - Delta Corp', time: '1 day ago', signer: 'Lisa Anderson' },
    { action: 'Declined', document: 'Partnership - Epsilon', time: '2 days ago', signer: 'David Martinez' },
];

const TEMPLATES = [
    { id: 'T001', name: 'Standard Sales Agreement', usageCount: 45, lastUsed: '2025-01-15' },
    { id: 'T002', name: 'Enterprise Contract', usageCount: 28, lastUsed: '2025-01-14' },
    { id: 'T003', name: 'NDA Standard', usageCount: 67, lastUsed: '2025-01-15' },
    { id: 'T004', name: 'Service Agreement', usageCount: 34, lastUsed: '2025-01-13' },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric', year: 'numeric' });
};

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'sent':
            return <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">Sent</span>;
        case 'viewed':
            return <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">Viewed</span>;
        case 'signed':
            return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Signed</span>;
        case 'expired':
            return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Expired</span>;
        case 'completed':
            return <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">Completed</span>;
        case 'declined':
            return <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700 font-medium">Declined</span>;
        default:
            return <span className="text-xs px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-medium">{status}</span>;
    }
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const DocuSignIntegration = () => {
    const [sending, setSending] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

    const handleSend = () => {
        setSending(true);
        setTimeout(() => setSending(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="bg-gradient-to-r from-yellow-600 via-amber-600 to-yellow-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <svg viewBox="0 0 24 24" className="w-5 h-5 text-yellow-200" fill="currentColor">
                                <path d="M18.5 3H6c-1.1 0-2 .9-2 2v5.71c0 3.83 2.95 7.18 6.78 7.29 3.96.12 7.22-3.06 7.22-7v-1h.5c1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3zM16 5v3H6V5h10zm2.5 3H18V5h.5c.83 0 1.5.67 1.5 1.5S19.33 8 18.5 8zM4 19h16v2H4v-2z" />
                            </svg>
                            <span className="text-xs font-bold uppercase tracking-widest text-yellow-200">DocuSign Integration</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-400/30 text-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                Connected
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1">{DOCUSIGN_STATUS.account}</h2>
                        <p className="text-yellow-200 text-sm">Electronic Signature Platform</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Send size={16} className="text-blue-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Sent</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{DOCUSIGN_STATUS.envelopesSent}</p>
                    <p className="text-xs text-slate-400 mt-1">Total envelopes</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock size={16} className="text-amber-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Pending</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{DOCUSIGN_STATUS.envelopesPending}</p>
                    <p className="text-xs text-slate-400 mt-1">Awaiting signature</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Completed</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">{DOCUSIGN_STATUS.envelopesCompleted}</p>
                    <p className="text-xs text-slate-400 mt-1">Signed documents</p>
                </div>
                <div className="bg-[#EAF0F6] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                    <div className="flex items-center gap-2 mb-2">
                        <Signature size={16} className="text-violet-500" />
                        <span className="text-xs text-slate-500 uppercase font-semibold">Completion</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-800">85%</p>
                    <p className="text-xs text-slate-400 mt-1">Signature rate</p>
                </div>
            </div>

            {/* ──── PENDING ENVELOPES ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <FileText size={18} className="text-blue-500" /> Pending Envelopes
                    </h3>
                    <button className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
                        <Eye size={14} /> View All
                    </button>
                </div>
                <div className="space-y-3">
                    {PENDING_ENVELOPES.map((env) => (
                        <div key={env.id} className="bg-[#EAF0F6] rounded-xl p-4 shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-white/50">
                                        <FileText size={18} className="text-slate-500" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 text-sm">{env.name}</p>
                                        <p className="text-xs text-slate-400">{env.id}</p>
                                    </div>
                                </div>
                                {getStatusBadge(env.status)}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                                <span className="flex items-center gap-1">
                                    <User size={12} /> {env.recipient}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar size={12} /> Sent: {formatDate(env.sentDate)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock size={12} /> Due: {formatDate(env.dueDate)}
                                </span>
                            </div>
                            <div className="flex gap-2 mt-3">
                                <button className="flex-1 text-xs py-2 bg-[#EAF0F6] text-slate-600 rounded-lg shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#bec8de,-1px_-1px_2px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center gap-1">
                                    <Eye size={12} /> Preview
                                </button>
                                <button className="flex-1 text-xs py-2 bg-[#EAF0F6] text-slate-600 rounded-lg shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#bec8de,-1px_-1px_2px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center gap-1">
                                    <RefreshCw size={12} /> Remind
                                </button>
                                <button className="flex-1 text-xs py-2 bg-[#EAF0F6] text-red-600 rounded-lg shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] hover:shadow-[1px_1px_2px_#bec8de,-1px_-1px_2px_#ffffff] active:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff] transition-all flex items-center justify-center gap-1">
                                    <X size={12} /> Void
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── SEND NEW DOCUMENT ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Send size={18} className="text-emerald-500" /> Send New Document
                </h3>

                {/* Template Selection */}
                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-semibold mb-2 block">Select Template</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {TEMPLATES.map((template) => (
                            <button
                                key={template.id}
                                onClick={() => setSelectedTemplate(template.id)}
                                className={`p-3 rounded-xl text-left transition-all ${selectedTemplate === template.id
                                        ? 'bg-emerald-500 text-white shadow-lg'
                                        : 'bg-white/50 text-slate-700 hover:bg-white/70'
                                    }`}
                            >
                                <p className="text-xs font-semibold">{template.name}</p>
                                <p className={`text-xs mt-1 ${selectedTemplate === template.id ? 'text-emerald-100' : 'text-slate-400'}`}>
                                    Used {template.usageCount}x
                                </p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Recipient Input */}
                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-semibold mb-2 block">Recipient Email</label>
                    <div className="flex gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 bg-[#EAF0F6] rounded-xl shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff]">
                            <Mail size={16} className="text-slate-400" />
                            <input
                                type="email"
                                placeholder="recipient@company.com"
                                className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Signers */}
                <div className="mb-4">
                    <label className="text-xs text-slate-500 uppercase font-semibold mb-2 block">Add Signers</label>
                    <div className="space-y-2">
                        {[
                            { name: 'Primary Signer', role: 'Signer' },
                            { name: 'Witness', role: 'Witness' },
                        ].map((signer, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                                <User size={16} className="text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={signer.name}
                                    className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
                                />
                                <span className="text-xs text-slate-400 px-2 py-1 bg-white/50 rounded-lg">{signer.role}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <button
                    onClick={handleSend}
                    disabled={sending}
                    className="w-full flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/20 hover:shadow-xl hover:shadow-emerald-500/30 transition-all disabled:opacity-50"
                >
                    {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    {sending ? 'Sending...' : 'Send for Signature'}
                </button>
            </div>

            {/* ──── TEMPLATES ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <FileText size={18} className="text-violet-500" /> Document Templates
                </h3>
                <div className="space-y-2">
                    {TEMPLATES.map((template) => (
                        <div key={template.id} className="flex items-center justify-between p-3 bg-[#EAF0F6] rounded-xl shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-white/50">
                                    <FileText size={16} className="text-slate-500" />
                                </div>
                                <div>
                                    <p className="font-semibold text-slate-700 text-sm">{template.name}</p>
                                    <p className="text-xs text-slate-400">Used {template.usageCount} times • Last: {formatDate(template.lastUsed)}</p>
                                </div>
                            </div>
                            <button className="text-xs px-3 py-1.5 bg-white/50 text-slate-600 rounded-lg hover:bg-white/70 transition-colors">
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── RECENT ACTIVITY ──── */}
            <div className="bg-[#EAF0F6] rounded-2xl p-5 shadow-[6px_6px_12px_#bec8de,-6px_-6px-12px_#ffffff]">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                    <Clock size={18} className="text-amber-500" /> Recent Activity
                </h3>
                <div className="space-y-2">
                    {RECENT_ACTIVITY.map((activity, idx) => (
                        <div key={idx} className="flex items-center gap-3 p-3 bg-[#EAF0F6] rounded-xl">
                            <div className={`p-2 rounded-full ${activity.action === 'Signed' || activity.action === 'Completed' ? 'bg-emerald-100' :
                                    activity.action === 'Declined' ? 'bg-red-100' : 'bg-slate-100'
                                }`}>
                                {activity.action === 'Signed' || activity.action === 'Completed' ? (
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                ) : activity.action === 'Declined' ? (
                                    <X size={16} className="text-red-500" />
                                ) : (
                                    <FileText size={16} className="text-slate-500" />
                                )}
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-slate-700">
                                    <span className="text-slate-500">{activity.action}:</span> {activity.document}
                                </p>
                                <p className="text-xs text-slate-400">{activity.signer} • {activity.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ──── ACTION BUTTONS ──── */}
            <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-emerald-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <FileText size={16} /> All Documents
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <Settings size={16} /> Configure
                </button>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-[#EAF0F6] text-slate-600 rounded-xl text-sm font-semibold shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff] active:shadow-[inset_3px_3px_6px_#bec8de,inset_-3px_-3px_6px_#ffffff] transition-all">
                    <ExternalLink size={16} /> DocuSign Portal
                </button>
            </div>
        </div>
    );
};
