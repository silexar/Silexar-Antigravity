/**
 * COMPONENT: DEAL INTELLIGENCE — Inteligencia Artificial de Deals
 * 
 * @description Sistema de inteligencia artificial para analizar cada deal
 * como un asesor financiero personal. Detecta riesgos, oportunidades
 * y provee insights accionables en español.
 * 
 * DESIGN: Neumorphic con base #dfeaff, sombras #bec8de y #ffffff
 * Sistema correcto: bg-light-surface + shadow-neumorphic-outset/inset
 */

'use client';

import React, { useState } from 'react';
import {
    Brain, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2,
    Clock, DollarSign, Users, Calendar, Target, Zap, Sparkles,
    MessageSquare, Phone, Mail, FileText, Building2, User,
    ArrowUpRight, ArrowDownRight, Eye, Loader2, Activity,
    Shield, AlertCircle, ThumbsUp, Lightbulb
} from 'lucide-react';

/* ─── COLORES NEUMÓRFICOS ───────────────────────────────────────────────── */

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8'
};

const gradientBase = 'linear-gradient(145deg, #e6e6e6, #ffffff)';

const shadowOut = (s: number) => `${s}px ${s}px ${s * 2}px ${N.dark}, -${s}px -${s}px ${s * 2}px ${N.light}`;
const shadowIn = (s: number) => `inset ${s}px ${s}px ${s * 2}px ${N.dark}, inset -${s}px -${s}px ${s * 2}px ${N.light}`;

/* ─── TYPES ───────────────────────────────────────────────── */

interface DealRisk {
    type: 'high' | 'medium' | 'low';
    title: string;
    description: string;
    recommendation: string;
    icon: React.ElementType;
}

interface Deal {
    id: string;
    name: string;
    company: string;
    value: number;
    stage: string;
    probability: number;
    health: number;
    daysInStage: number;
    decisionMakers: number;
    contacts: number;
    lastContact: string;
    nextStep: string;
    risks: DealRisk[];
    insights: string[];
    owner: string;
    closeDate: string;
    weightedValue: number;
}

interface StageHealth {
    stage: string;
    dealsCount: number;
    totalValue: number;
    avgHealth: number;
}

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MOCK_DEALS: Deal[] = [
    {
        id: 'D001',
        name: 'Licencia Enterprise',
        company: 'Acme Corporation',
        value: 250000,
        stage: 'Negociación',
        probability: 75,
        health: 85,
        daysInStage: 12,
        decisionMakers: 4,
        contacts: 8,
        lastContact: 'Hace 2 horas',
        nextStep: 'Enviar propuesta final con descuento de precio',
        risks: [
            { type: 'medium', title: 'Línea de Tiempo Extendida', description: 'Deal en Negociación por 12 días (promedio: 7)', recommendation: 'Programar llamada con sponsor ejecutivo para acelerar', icon: Clock },
            { type: 'low', title: 'Revisión de Presupuesto', description: 'El CFO aún no ha revisado el precio', recommendation: 'Solicitar llamada de 15 min con el CFO', icon: DollarSign },
        ],
        insights: [
            'El Champion (VP de Ventas) está muy comprometido y vende internamente',
            'Precio de competidor recibido - estamos 10% más altos',
            'El ciclo de presupuesto Q1 termina en 3 semanas - urgencia creada',
        ],
        owner: 'Ana García',
        closeDate: '2025-02-15',
        weightedValue: 187500,
    },
    {
        id: 'D002',
        name: 'Proyecto de Migración a la Nube',
        company: 'TechStart SA',
        value: 180000,
        stage: 'Propuesta',
        probability: 55,
        health: 45,
        daysInStage: 18,
        decisionMakers: 2,
        contacts: 4,
        lastContact: 'Hace 5 días',
        nextStep: 'Demo con CTO y seguimiento de propuesta',
        risks: [
            { type: 'high', title: 'Sin Contacto Reciente', description: 'Último contacto hace 5 días (promedio: 2)', recommendation: 'Programar llamada de seguimiento inmediatamente', icon: Phone },
            { type: 'medium', title: 'Competidor Mencionado', description: 'Prospecto mencionó que evalúa otra solución', recommendation: 'Solicitar reunión para demostrar valor único', icon: AlertTriangle },
        ],
        insights: [
            'Presupuesto Q1 disponible pero competidor tiene reunión programada mañana',
            'CTO está ocupado - proponer formato de demo grabado',
            'El campeón interno necesita apoyo para vender a VP',
        ],
        owner: 'Carlos Mendoza',
        closeDate: '2025-02-28',
        weightedValue: 99000,
    },
    {
        id: 'D003',
        name: 'Expansion - Módulo Analytics',
        company: 'Global Bank',
        value: 420000,
        stage: 'Discovery',
        probability: 30,
        health: 92,
        daysInStage: 5,
        decisionMakers: 6,
        contacts: 3,
        lastContact: 'Hoy',
        nextStep: 'Reunión de descubrimiento con equipo de datos',
        risks: [],
        insights: [
            'Empresa en expansión rápida - presupuesto disponible',
            'Proyecto priorizado para Q2',
            'Buena cultura de datos - match ideal con Analytics',
        ],
        owner: 'María Fernández',
        closeDate: '2025-04-15',
        weightedValue: 126000,
    },
    {
        id: 'D004',
        name: 'Renewal + Upsell',
        company: 'Retail Plus',
        value: 95000,
        stage: 'Closing',
        probability: 90,
        health: 95,
        daysInStage: 3,
        decisionMakers: 1,
        contacts: 2,
        lastContact: 'Ayer',
        nextStep: 'Firmar renovación con upsell de training',
        risks: [],
        insights: [
            'Cliente muy satisfecho con NPS de 9',
            'Expansion natural a módulos de training',
            'Decisión simple - solo firma de renewal',
        ],
        owner: 'Juan Pérez',
        closeDate: '2025-01-30',
        weightedValue: 85500,
    },
    {
        id: 'D005',
        name: 'Nueva Logo - Manufacturing',
        company: 'Industrias del Sur',
        value: 310000,
        stage: 'Qualification',
        probability: 20,
        health: 30,
        daysInStage: 25,
        decisionMakers: 1,
        contacts: 1,
        lastContact: 'Hace 2 semanas',
        nextStep: 'Descubrir presupuesto y timeline de decisión',
        risks: [
            { type: 'high', title: 'Sin Contacto Reciente', description: 'Último contacto hace 14 días', recommendation: 'Llamada de check-in para mantener momentum', icon: Phone },
            { type: 'high', title: 'Stakeholder Undefined', description: 'Solo contactamos a IT, falta sponsor de negocio', recommendation: 'Mapear stakeholders y pedir warm intro', icon: Users },
        ],
        insights: [
            'Industria en crecimiento - presupuesto disponible',
            'Necesidad real de数字化转型',
            'Competidor favorito de momento - necesitamos diferenciarnos',
        ],
        owner: 'Ana García',
        closeDate: '2025-06-30',
        weightedValue: 62000,
    },
];

const STAGE_HEALTH: StageHealth[] = [
    { stage: 'Discovery', dealsCount: 12, totalValue: 850000, avgHealth: 78 },
    { stage: 'Qualification', dealsCount: 18, totalValue: 1200000, avgHealth: 65 },
    { stage: 'Proposal', dealsCount: 15, totalValue: 950000, avgHealth: 58 },
    { stage: 'Negociación', dealsCount: 8, totalValue: 680000, avgHealth: 72 },
    { stage: 'Closing', dealsCount: 5, totalValue: 320000, avgHealth: 88 },
];

/* ─── HELPERS ───────────────────────────────────────────────── */

const formatCurrency = (v: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(v).replace('CLP', '$').replace(',', '.');
};

const getHealthColor = (health: number) => {
    if (health >= 75) return { bg: 'bg-emerald-400', text: 'text-emerald-700' };
    if (health >= 50) return { bg: 'bg-amber-400', text: 'text-amber-700' };
    return { bg: 'bg-red-400', text: 'text-red-700' };
};

const getRiskColor = (type: 'high' | 'medium' | 'low') => {
    switch (type) {
        case 'high':
            return { bg: 'bg-red-50', border: 'border-red-200', icon: 'text-red-500' };
        case 'medium':
            return { bg: 'bg-amber-50', border: 'border-amber-200', icon: 'text-amber-500' };
        default:
            return { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'text-blue-500' };
    }
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const DealIntelligence = () => {
    const [deals, setDeals] = useState<Deal[]>(MOCK_DEALS);
    const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null);
    const [analyzing, setAnalyzing] = useState(false);

    const totalPipeline = deals.reduce((s, d) => s + d.value, 0);
    const weightedPipeline = deals.reduce((s, d) => s + d.weightedValue, 0);
    const healthyDeals = deals.filter(d => d.health >= 70).length;
    const atRiskDeals = deals.filter(d => d.health < 50).length;

    const handleAnalyze = () => {
        setAnalyzing(true);
        setTimeout(() => setAnalyzing(false), 2500);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div
                className="rounded-2xl p-6 relative overflow-hidden"
                style={{
                    background: gradientBase,
                    boxShadow: shadowOut(6)
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 opacity-90" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Brain size={18} className="text-emerald-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-emerald-200">Potenciado por IA</span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                            >
                                <Sparkles size={10} />
                                Análisis en Tiempo Real
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1 text-white">Inteligencia de Deals</h2>
                        <p className="text-emerald-100 text-sm">Asesor IA para cada negociación • {deals.length} deals activos</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleAnalyze}
                            disabled={analyzing}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                boxShadow: shadowIn(2)
                            }}
                        >
                            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                            {analyzing ? 'Analizando...' : 'Ejecutar Análisis IA'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <DollarSign size={16} className="text-emerald-500" />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Pipeline Total</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{formatCurrency(totalPipeline)}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>{deals.length} deals</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} className="text-blue-500" />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Valor Ponderado</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{formatCurrency(weightedPipeline)}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Por probabilidad</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 size={16} className="text-emerald-500" />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Deals Saludables</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{healthyDeals}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>{Math.round((healthyDeals / deals.length) * 100)}% del pipeline</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={16} className="text-red-500" />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>En Riesgo</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{atRiskDeals}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Necesitan atención inmediata</p>
                </div>
            </div>

            {/* ──── DEALS LIST ──── */}
            <div className="space-y-4">
                {deals.map(deal => {
                    const healthColors = getHealthColor(deal.health);
                    return (
                        <div
                            key={deal.id}
                            onClick={() => setSelectedDeal(selectedDeal?.id === deal.id ? null : deal)}
                            className={`rounded-2xl p-5 cursor-pointer transition-all hover:scale-[1.01] ${selectedDeal?.id === deal.id ? 'ring-2' : ''}`}
                            style={{
                                background: gradientBase,
                                boxShadow: selectedDeal?.id === deal.id ? shadowIn(4) : shadowOut(4),
                                ...(selectedDeal?.id === deal.id ? { ringColor: N.accent } : {})
                            }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <div
                                            className="w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold"
                                            style={{ background: `linear-gradient(145deg, ${N.accent}, #5a77d9)` }}
                                        >
                                            {formatCurrency(deal.value).replace('$', '').replace('K', 'K')}
                                        </div>
                                        <span
                                            className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center ${healthColors.bg}`}
                                        >
                                            {deal.health >= 75 ? <CheckCircle2 size={12} className="text-white" /> : deal.health >= 50 ? <Activity size={12} className="text-white" /> : <AlertTriangle size={12} className="text-white" />}
                                        </span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-bold" style={{ color: '#1e293b' }}>{deal.company}</p>
                                            <span
                                                className="text-xs px-2 py-0.5 rounded-full font-medium"
                                                style={{ background: `${N.accent}20`, color: N.accent }}
                                            >
                                                {deal.stage}
                                            </span>
                                            {deal.stage === 'Cerrado Ganado' && (
                                                <span
                                                    className="text-xs px-2 py-0.5 rounded-full font-medium flex items-center gap-1"
                                                    style={{ background: '#10b98120', color: '#10b981' }}
                                                >
                                                    <CheckCircle2 size={10} /> Ganado
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-sm" style={{ color: N.text }}>{deal.name}</p>
                                        <div className="flex items-center gap-4 mt-1 text-xs" style={{ color: N.textSub }}>
                                            <span className="flex items-center gap-1"><User size={10} /> {deal.owner}</span>
                                            <span className="flex items-center gap-1"><Calendar size={10} /> Cierre: {formatDate(deal.closeDate)}</span>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {deal.daysInStage}d en etapa</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center gap-3">
                                        <div>
                                            <p className="text-xs" style={{ color: N.text }}>Salud</p>
                                            <div className="flex items-center gap-1 mt-0.5">
                                                <span className="text-lg font-bold" style={{ color: '#1e293b' }}>{deal.health}</span>
                                                <span className="text-xs" style={{ color: N.textSub }}>/100</span>
                                            </div>
                                        </div>
                                        <div
                                            className="h-10 w-1 rounded-full overflow-hidden"
                                            style={{ background: '#e2e8f0' }}
                                        >
                                            <div
                                                className="h-full transition-all"
                                                style={{
                                                    height: `${deal.health}%`,
                                                    background: deal.health >= 75 ? '#10b981' : deal.health >= 50 ? '#f59e0b' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs mt-1" style={{ color: N.textSub }}>{deal.probability}% probabilidad</p>
                                </div>
                            </div>

                            {/* Risk Indicators */}
                            {deal.risks.length > 0 && (
                                <div className="flex gap-2 mt-3">
                                    {deal.risks.filter(r => r.type === 'high').map((risk, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                                            style={{ background: '#fef2f2', color: '#dc2626' }}
                                        >
                                            <AlertTriangle size={10} /> {risk.title}
                                        </span>
                                    ))}
                                    {deal.risks.filter(r => r.type === 'medium').map((risk, idx) => (
                                        <span
                                            key={idx}
                                            className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg"
                                            style={{ background: '#fffbeb', color: '#d97706' }}
                                        >
                                            <Clock size={10} /> {risk.title}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Expanded Details */}
                            {selectedDeal?.id === deal.id && (
                                <div className="mt-5 pt-5" style={{ borderTop: '1px solid #e2e8f0' }}>
                                    {/* Risks Detail */}
                                    {deal.risks.length > 0 && (
                                        <div className="mb-5">
                                            <h4 className="text-xs uppercase font-semibold mb-3 flex items-center gap-2" style={{ color: N.text }}>
                                                <AlertTriangle size={14} style={{ color: '#f59e0b' }} /> Análisis de Riesgos IA
                                            </h4>
                                            <div className="space-y-2">
                                                {deal.risks.map((risk, idx) => {
                                                    const colors = getRiskColor(risk.type);
                                                    return (
                                                        <div
                                                            key={idx}
                                                            className={`p-3 rounded-xl border`}
                                                            style={{
                                                                background: colors.bg,
                                                                borderColor: colors.border.replace('border-', '')
                                                            }}
                                                        >
                                                            <div className="flex items-start gap-2">
                                                                <risk.icon size={16} className={colors.icon} />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between">
                                                                        <p className="font-semibold text-sm" style={{ color: '#1e293b' }}>{risk.title}</p>
                                                                        <span
                                                                            className="text-xs px-2 py-0.5 rounded-full capitalize"
                                                                            style={{
                                                                                background: risk.type === 'high' ? '#fee2e2' : '#fef3c7',
                                                                                color: risk.type === 'high' ? '#dc2626' : '#d97706'
                                                                            }}
                                                                        >
                                                                            {risk.type} riesgo
                                                                        </span>
                                                                    </div>
                                                                    <p className="text-sm mt-1" style={{ color: N.text }}>{risk.description}</p>
                                                                    <div
                                                                        className="flex items-center gap-1 mt-2 text-xs px-2 py-1 rounded-lg"
                                                                        style={{
                                                                            background: 'rgba(16, 185, 129, 0.1)',
                                                                            color: '#059669'
                                                                        }}
                                                                    >
                                                                        <Lightbulb size={12} />
                                                                        <span>{risk.recommendation}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    {/* AI Insights */}
                                    <div className="mb-5">
                                        <h4 className="text-xs uppercase font-semibold mb-3 flex items-center gap-2" style={{ color: N.text }}>
                                            <Brain size={14} style={{ color: '#8b5cf6' }} /> Insights IA
                                        </h4>
                                        <div className="space-y-2">
                                            {deal.insights.map((insight, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-start gap-2 p-2 rounded-lg"
                                                    style={{ background: '#f5f3ff' }}
                                                >
                                                    <Sparkles size={14} style={{ color: '#8b5cf6' }} className="mt-0.5" />
                                                    <p className="text-sm" style={{ color: '#475569' }}>{insight}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Deal Stats */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {[
                                            { label: 'Decisores', value: deal.decisionMakers, icon: Users },
                                            { label: 'Contactos', value: deal.contacts, icon: MessageSquare },
                                            { label: 'Valor Ponderado', value: formatCurrency(deal.weightedValue), icon: DollarSign },
                                            { label: 'Días en Etapa', value: `${deal.daysInStage}d`, icon: Clock },
                                        ].map(stat => (
                                            <div
                                                key={stat.label}
                                                className="rounded-xl p-3 text-center"
                                                style={{
                                                    background: 'rgba(255,255,255,0.5)',
                                                    boxShadow: shadowIn(2)
                                                }}
                                            >
                                                <stat.icon size={16} style={{ color: N.textSub }} className="mx-auto mb-1" />
                                                <p className="text-lg font-bold" style={{ color: '#1e293b' }}>{stat.value}</p>
                                                <p className="text-xs" style={{ color: N.textSub }}>{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Next Step */}
                                    <div
                                        className="rounded-xl p-4 text-white"
                                        style={{ background: `linear-gradient(145deg, ${N.accent}, #5a77d9)` }}
                                    >
                                        <div className="flex items-center gap-2 mb-1">
                                            <Target size={16} />
                                            <span className="text-xs font-semibold uppercase">Próxima Mejor Acción</span>
                                        </div>
                                        <p className="text-sm font-medium">{deal.nextStep}</p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 mt-4">
                                        <button
                                            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 text-white"
                                            style={{
                                                background: `linear-gradient(145deg, ${N.accent}, #5a77d9)`,
                                                boxShadow: shadowOut(3)
                                            }}
                                        >
                                            <Phone size={14} /> Registrar Llamada
                                        </button>
                                        <button
                                            className="flex-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2"
                                            style={{
                                                background: gradientBase,
                                                color: N.text,
                                                boxShadow: shadowOut(3)
                                            }}
                                        >
                                            <Mail size={14} /> Enviar Email
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* ──── STAGE HEALTH ──── */}
            <div
                className="rounded-2xl p-5"
                style={{ background: gradientBase, boxShadow: shadowOut(4) }}
            >
                <h3 className="text-lg font-bold mb-4" style={{ color: '#1e293b' }}>
                    Salud por Etapa
                </h3>
                <div className="space-y-3">
                    {STAGE_HEALTH.map((stage) => (
                        <div key={stage.stage} className="flex items-center gap-4">
                            <div className="w-28 text-sm font-medium" style={{ color: N.text }}>{stage.stage}</div>
                            <div className="flex-1 h-8 rounded-xl overflow-hidden" style={{ background: '#e2e8f0' }}>
                                <div
                                    className="h-full rounded-xl"
                                    style={{
                                        width: `${(stage.avgHealth / 100) * 100}%`,
                                        background: stage.avgHealth >= 75 ? '#10b981' : stage.avgHealth >= 50 ? '#f59e0b' : '#ef4444'
                                    }}
                                />
                            </div>
                            <div className="w-20 text-right text-sm" style={{ color: '#1e293b' }}>
                                <span className="font-bold">{stage.avgHealth}</span>
                                <span className="text-xs" style={{ color: N.textSub }}>/100</span>
                            </div>
                            <div className="w-16 text-right text-xs" style={{ color: N.textSub }}>
                                {stage.dealsCount} deals
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
