/**
 * COMPONENT: PREDICTIVE LEAD SCORING — AI-powered Lead Qualification
 * 
 * @description Sistema de puntuación predictiva de leads basado en ML.
 * Diseñado con estilo neumórfico oficial de Silexar Pulse.
 */

'use client';

import React, { useState } from 'react';
import {
    Brain, Target, TrendingUp, Clock, DollarSign,
    Building2, User, Mail, Phone, Globe, Calendar, CheckCircle2,
    AlertCircle, Sparkles, Filter, ArrowUpRight, ArrowDownRight,
    Activity, Loader2, Users
} from 'lucide-react';

/* ─── COLORES NEMORFICOS ─────────────────────────────────────── */

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8'
};

const shadowOut = (s: number) => `${s}px ${s}px ${s * 2}px ${N.dark}, -${s}px -${s}px ${s * 2}px ${N.light}`;
const shadowIn = (s: number) => `inset ${s}px ${s}px ${s * 2}px ${N.dark}, inset -${s}px -${s}px ${s * 2}px ${N.light}`;
const gradientBase = `linear-gradient(145deg, ${N.light}, #e6e6e6)`;

/* ─── TYPES ───────────────────────────────────────────────── */

interface LeadSignal {
    type: 'positive' | 'negative' | 'neutral';
    icon: React.ElementType;
    label: string;
    weight: number;
}

interface Lead {
    id: string;
    name: string;
    company: string;
    title: string;
    email: string;
    score: number;
    scoreChange: number;
    signals: LeadSignal[];
    lastActivity: string;
    source: string;
    industry: string;
    companySize: string;
    revenue: string;
    location: string;
    daysInPipeline: number;
}

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MOCK_LEADS: Lead[] = [
    {
        id: 'L001',
        name: 'María González',
        company: 'Acme Corporation',
        title: 'VP de Ventas',
        email: 'maria.gonzalez@acme.com',
        score: 94,
        scoreChange: 12,
        signals: [
            { type: 'positive', icon: Building2, label: 'Enterprise (1000+ empleados)', weight: 20 },
            { type: 'positive', icon: DollarSign, label: 'Presupuesto confirmado $150K+', weight: 25 },
            { type: 'positive', icon: Calendar, label: 'Demo solicitado', weight: 15 },
            { type: 'positive', icon: Globe, label: 'Pricing page visitada 3x', weight: 18 },
            { type: 'positive', icon: User, label: 'Ejecutivo C-level', weight: 16 },
        ],
        lastActivity: 'Hace 2 horas',
        source: 'Sitio web',
        industry: 'Tecnología',
        companySize: '1000+',
        revenue: '$50M+',
        location: 'Santiago, CL',
        daysInPipeline: 5,
    },
    {
        id: 'L002',
        name: 'Carlos Rodríguez',
        company: 'TechStart SA',
        title: 'Director de Operaciones',
        email: 'carlos.rodriguez@techstart.cl',
        score: 78,
        scoreChange: 5,
        signals: [
            { type: 'positive', icon: Calendar, label: 'Whitepaper descargado', weight: 18 },
            { type: 'positive', icon: Mail, label: 'Abrió 5 emails', weight: 15 },
            { type: 'neutral', icon: Globe, label: 'Visitó homepage', weight: 8 },
            { type: 'negative', icon: DollarSign, label: 'Presupuesto desconocido', weight: -10 },
            { type: 'neutral', icon: Building2, label: 'Mid-market (200 empleados)', weight: 12 },
        ],
        lastActivity: 'Hace 1 día',
        source: 'Campaña Email',
        industry: 'Finanzas',
        companySize: '200-500',
        revenue: '$10-50M',
        location: 'Santiago, CL',
        daysInPipeline: 12,
    },
    {
        id: 'L003',
        name: 'Ana Martínez',
        company: 'Global Industries',
        title: 'Gerente de Adquisiciones',
        email: 'ana.martinez@globalind.com',
        score: 65,
        scoreChange: -3,
        signals: [
            { type: 'positive', icon: Building2, label: 'Enterprise (500+ empleados)', weight: 20 },
            { type: 'neutral', icon: Mail, label: 'Abrió 2 emails', weight: 8 },
            { type: 'negative', icon: Calendar, label: 'No solicitó demo', weight: -15 },
            { type: 'negative', icon: Clock, label: 'Sin actividad en 7 días', weight: -12 },
            { type: 'neutral', icon: User, label: 'Nivel Gerente', weight: 10 },
        ],
        lastActivity: 'Hace 7 días',
        source: 'LinkedIn Ads',
        industry: 'Manufactura',
        companySize: '500-1000',
        revenue: '$100M+',
        location: 'Ciudad de México, MX',
        daysInPipeline: 21,
    },
    {
        id: 'L004',
        name: 'Juan Pérez',
        company: 'StartupXYZ',
        title: 'CEO',
        email: 'juan@startupxyz.io',
        score: 45,
        scoreChange: 8,
        signals: [
            { type: 'positive', icon: Calendar, label: 'Demo agendada', weight: 20 },
            { type: 'positive', icon: Globe, label: 'Trial iniciado', weight: 15 },
            { type: 'negative', icon: Building2, label: 'Pequeña (10 empleados)', weight: -15 },
            { type: 'negative', icon: DollarSign, label: 'Presupuesto <$10K', weight: -20 },
            { type: 'neutral', icon: User, label: 'Ejecutivo C-level', weight: 10 },
        ],
        lastActivity: 'Hace 3 horas',
        source: 'Búsqueda orgánica',
        industry: 'SaaS',
        companySize: '10-50',
        revenue: '<$5M',
        location: 'Buenos Aires, AR',
        daysInPipeline: 3,
    },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: '#22c55e', text: '#15803d', label: 'Lead Caliente' };
    if (score >= 60) return { bg: '#3b82f6', text: '#1d4ed8', label: 'Lead Tibio' };
    if (score >= 40) return { bg: '#f59e0b', text: '#b45309', label: 'Lead tibio' };
    return { bg: '#94a3b8', text: '#475569', label: 'Lead Frío' };
};

const getSignalIcon = (type: 'positive' | 'negative' | 'neutral') => {
    switch (type) {
        case 'positive': return ArrowUpRight;
        case 'negative': return ArrowDownRight;
        default: return Activity;
    }
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const PredictiveScoring = () => {
    const [leads] = useState<Lead[]>(MOCK_LEADS);
    const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
    const [filter, setFilter] = useState<'all' | 'hot' | 'warm' | 'cool'>('all');
    const [analyzing, setAnalyzing] = useState(false);
    const [modelReady] = useState(true);

    const filteredLeads = leads.filter(lead => {
        if (filter === 'all') return true;
        if (filter === 'hot') return lead.score >= 80;
        if (filter === 'warm') return lead.score >= 60 && lead.score < 80;
        if (filter === 'cool') return lead.score < 60;
        return true;
    });

    const avgScore = Math.round(leads.reduce((s, l) => s + l.score, 0) / leads.length);
    const hotLeads = leads.filter(l => l.score >= 80).length;

    const handleRefreshScores = () => {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div className="rounded-2xl p-6 relative overflow-hidden" style={{ background: gradientBase, boxShadow: shadowOut(4) }}>
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Brain size={18} style={{ color: N.accent }} />
                            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: N.textSub }}>Inteligencia AI</span>
                            <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1" style={{ background: N.accent, color: N.light }}>
                                {modelReady ? (
                                    <>
                                        <Sparkles size={10} />
                                        Modelo Activo
                                    </>
                                ) : (
                                    <>
                                        <Loader2 size={10} className="animate-spin" />
                                        Entrenando
                                    </>
                                )}
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold" style={{ color: N.text }}>Puntuación Predictiva de Leads</h2>
                        <p className="text-sm mt-1" style={{ color: N.textSub }}>Calificación con ML • Promedio {avgScore} puntos</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefreshScores}
                            disabled={analyzing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{ background: N.light, boxShadow: shadowOut(3), color: N.text }}
                        >
                            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {analyzing ? 'Analizando...' : 'Actualizar Scores'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', value: leads.length, icon: Users },
                    { label: 'Leads Calientes', value: hotLeads, icon: Target },
                    { label: 'Promedio Score', value: avgScore, icon: TrendingUp },
                    { label: 'Conversión Est.', value: Math.round((hotLeads / leads.length) * 100) + '%', icon: Activity },
                ].map((stat, idx) => (
                    <div key={idx} className="rounded-2xl p-4 text-center" style={{ background: gradientBase, boxShadow: shadowOut(4) }}>
                        <stat.icon size={20} style={{ color: N.accent }} className="mx-auto mb-2" />
                        <p className="text-2xl font-bold" style={{ color: N.text }}>{stat.value}</p>
                        <p className="text-xs" style={{ color: N.textSub }}>{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* ──── FILTER TABS ──── */}
            <div className="flex gap-2">
                {[
                    { id: 'all', label: 'Todos', count: leads.length },
                    { id: 'hot', label: 'Calientes (80+)', count: leads.filter(l => l.score >= 80).length },
                    { id: 'warm', label: 'Tibios (60-79)', count: leads.filter(l => l.score >= 60 && l.score < 80).length },
                    { id: 'cool', label: 'Fríos (<60)', count: leads.filter(l => l.score < 60).length },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setFilter(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${filter === tab.id
                            ? 'text-white'
                            : 'rounded-xl'
                            }`}
                        style={filter === tab.id ? { background: N.accent, boxShadow: shadowOut(3) } : { background: gradientBase, boxShadow: shadowOut(3), color: N.text }}
                    >
                        {tab.label} ({tab.count})
                    </button>
                ))}
            </div>

            {/* ──── LEADS LIST ──── */}
            <div className="space-y-3">
                {filteredLeads.map(lead => {
                    const colors = getScoreColor(lead.score);
                    return (
                        <div
                            key={lead.id}
                            onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                            className={`rounded-2xl p-4 cursor-pointer transition-all ${selectedLead?.id === lead.id ? 'ring-2 ring-[#6888ff]' : ''}`}
                            style={{
                                background: gradientBase,
                                boxShadow: selectedLead?.id === lead.id ? shadowIn(4) : shadowOut(4)
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: N.accent }}>
                                        {lead.name.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold" style={{ color: N.text }}>{lead.name}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: colors.bg, color: colors.text }}>
                                                {colors.label}
                                            </span>
                                        </div>
                                        <p className="text-sm" style={{ color: N.textSub }}>{lead.title} @ {lead.company}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: N.textSub }}>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {lead.lastActivity}</span>
                                            <span className="flex items-center gap-1"><Globe size={10} /> {lead.source}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-2">
                                        <span className="text-3xl font-bold" style={{ color: N.text }}>{lead.score}</span>
                                        <span className={`text-xs font-medium flex items-center gap-0.5 ${lead.scoreChange >= 0 ? 'text-emerald-500' : 'text-red-500'
                                            }`}>
                                            {lead.scoreChange >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                            {Math.abs(lead.scoreChange)}
                                        </span>
                                    </div>
                                    <p className="text-xs" style={{ color: N.textSub }}>puntos</p>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {selectedLead?.id === lead.id && (
                                <div className="mt-4 pt-4 border-t" style={{ borderColor: N.dark }}>
                                    {/* Score Breakdown */}
                                    <div className="mb-4">
                                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: N.textSub }}>Desglose del Score</h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { label: 'Tamaño Empresa', value: lead.companySize },
                                                { label: 'Industria', value: lead.industry },
                                                { label: 'Ingresos', value: lead.revenue },
                                                { label: 'Ubicación', value: lead.location },
                                            ].map(item => (
                                                <div key={item.label} className="rounded-lg p-2" style={{ background: N.base, boxShadow: shadowIn(2) }}>
                                                    <p className="text-xs" style={{ color: N.textSub }}>{item.label}</p>
                                                    <p className="text-sm font-medium" style={{ color: N.text }}>{item.value}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* AI Signals */}
                                    <div>
                                        <h4 className="text-xs font-semibold uppercase mb-2" style={{ color: N.textSub }}>Señales AI</h4>
                                        <div className="space-y-2">
                                            {lead.signals.map((signal, idx) => {
                                                const SignalIcon = getSignalIcon(signal.type);
                                                return (
                                                    <div
                                                        key={idx}
                                                        className="flex items-center gap-3 p-2 rounded-lg"
                                                        style={{
                                                            background: signal.type === 'positive' ? '#dcfce7' : signal.type === 'negative' ? '#fee2e2' : N.base,
                                                            color: signal.type === 'positive' ? '#166534' : signal.type === 'negative' ? '#991b1b' : N.text
                                                        }}
                                                    >
                                                        <SignalIcon size={14} />
                                                        <span className="text-sm flex-1">{signal.label}</span>
                                                        <span className="text-xs font-medium">
                                                            {signal.type === 'positive' ? '+' : ''}{signal.weight}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold text-white" style={{ background: N.accent, boxShadow: shadowOut(3) }}>
                                            <Phone size={14} className="inline mr-1" /> Llamar
                                        </button>
                                        <button className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: gradientBase, boxShadow: shadowOut(3), color: N.text }}>
                                            <Mail size={14} className="inline mr-1" /> Enviar Email
                                        </button>
                                        <button className="px-4 py-2 rounded-xl text-sm font-semibold" style={{ background: gradientBase, boxShadow: shadowOut(3), color: N.text }}>
                                            <Sparkles size={14} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ──── INFO ──── */}
            <div className="rounded-2xl p-4" style={{ background: gradientBase, boxShadow: shadowOut(4) }}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg" style={{ background: N.base, boxShadow: shadowIn(2) }}>
                            <Brain size={20} style={{ color: N.accent }} />
                        </div>
                        <div>
                            <p className="text-sm font-semibold" style={{ color: N.text }}>Modelo de Scoring v2.4</p>
                            <p className="text-xs" style={{ color: N.textSub }}>Entrenado con 12,847 conversiones • Actualizado Ene 2025</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-semibold text-emerald-600">94.2% precisión</p>
                        <p className="text-xs" style={{ color: N.textSub }}>Basado en validación</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
