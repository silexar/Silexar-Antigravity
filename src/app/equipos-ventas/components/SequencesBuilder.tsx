/**
 * COMPONENT: SEQUENCES BUILDER — Constructor de Secuencias Multicanal
 * 
 * @description Constructor de secuencias de outreach multicanal
 * que automatiza Email + Llamada + LinkedIn + SMS con seguimiento.
 * Todo en español.
 * 
 * DESIGN: Neumorphic con base #dfeaff, sombras #bec8de y #ffffff
 * Sistema correcto: bg-light-surface + shadow-neumorphic-outset/inset
 */

'use client';

import React, { useState } from 'react';
import {
    Mail, Phone, MessageSquare, Send, Clock, Calendar,
    Plus, Trash2, GripVertical, Copy, Settings, Play, Pause,
    CheckCircle2, AlertCircle, TrendingUp, Users, Target, Zap,
    ChevronRight, ChevronDown, Edit2, Save, X, RefreshCw,
    Eye, BarChart3, FileText
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

// Custom LinkedIn icon component
const LinkedinIcon = ({ size = 16 }: { size?: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

/* ─── TYPES ───────────────────────────────────────────────── */

interface SequenceStep {
    id: string;
    type: 'email' | 'call' | 'linkedin' | 'sms';
    day: number;
    delay: number;
    subject?: string;
    body: string;
    active: boolean;
}

interface Sequence {
    id: string;
    name: string;
    description: string;
    steps: SequenceStep[];
    stats: {
        enrolled: number;
        engaged: number;
        replied: number;
        converted: number;
    };
    active: boolean;
    createdAt: string;
}

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const MOCK_SEQUENCES: Sequence[] = [
    {
        id: 'SEQ001',
        name: 'Outbound Enterprise',
        description: 'Secuencia para cuentas enterprise con 5 touchpoints en 14 días',
        active: true,
        createdAt: '2025-01-10',
        stats: { enrolled: 245, engaged: 89, replied: 34, converted: 12 },
        steps: [
            { id: 'S1', type: 'email', day: 1, delay: 0, subject: 'Pregunta rápida sobre {{company}}', body: 'Hola {{first_name}},\n\nNoté que {{company}} está creciendo rápidamente...', active: true },
            { id: 'S2', type: 'linkedin', day: 3, delay: 0, subject: '', body: 'Conectado en LinkedIn con nota personalizada', active: true },
            { id: 'S3', type: 'call', day: 5, delay: 0, subject: '', body: 'Voicemail: "Hola {{first_name}}, llamando sobre...', active: true },
            { id: 'S4', type: 'email', day: 7, delay: 0, subject: 'Siguiendo mi nota', body: 'Hola {{first_name}},\n\nSolo siguiendo...', active: true },
            { id: 'S5', type: 'sms', day: 10, delay: 0, subject: '', body: 'Hey {{first_name}}, pregunta rápida - 2 min?', active: false },
        ],
    },
    {
        id: 'SEQ002',
        name: 'Seguimiento Demo',
        description: 'Secuencia post-demo para convertir leads a oportunidad',
        active: true,
        createdAt: '2025-01-12',
        stats: { enrolled: 156, engaged: 78, replied: 45, converted: 28 },
        steps: [
            { id: 'S1', type: 'email', day: 1, delay: 2, subject: '¡Gran reunión, {{first_name}}!', body: 'Hola {{first_name}},\n\nGracias por la demo de ayer...', active: true },
            { id: 'S2', type: 'call', day: 3, delay: 0, subject: '', body: 'Script de llamada post-demo', active: true },
            { id: 'S3', type: 'email', day: 5, delay: 0, subject: 'Propuesta adjunta', body: 'Hola {{first_name}},\n\nComo hablamos, aquí está la propuesta...', active: true },
        ],
    },
    {
        id: 'SEQ003',
        name: 'Nurturing de Trial',
        description: 'Nurturing de trials para conversión a paid',
        active: false,
        createdAt: '2025-01-08',
        stats: { enrolled: 89, engaged: 34, replied: 12, converted: 5 },
        steps: [
            { id: 'S1', type: 'email', day: 1, delay: 0, subject: '¡Bienvenido al trial!', body: 'Email de bienvenida...', active: true },
            { id: 'S2', type: 'email', day: 7, delay: 0, subject: '¿Cómo te está yendo?', body: 'Email de check-in...', active: true },
        ],
    },
];

const STEP_TYPES = [
    { type: 'email', label: 'Email', icon: Mail, color: '#6888ff' },
    { type: 'call', label: 'Llamada', icon: Phone, color: '#10b981' },
    { type: 'linkedin', label: 'LinkedIn', icon: LinkedinIcon, color: '#8b5cf6' },
    { type: 'sms', label: 'SMS', icon: MessageSquare, color: '#f59e0b' },
] as const;

/* ─── HELPERS ─────────────────────────────────────────────────── */

const getStepIcon = (type: string) => {
    switch (type) {
        case 'email': return Mail;
        case 'call': return Phone;
        case 'linkedin': return LinkedinIcon;
        case 'sms': return MessageSquare;
        default: return Mail;
    }
};

const getStepColor = (type: string) => {
    switch (type) {
        case 'email': return { bg: '#e0eaff', border: '#6888ff', icon: '#6888ff' };
        case 'call': return { bg: '#d1fae5', border: '#10b981', icon: '#10b981' };
        case 'linkedin': return { bg: '#f3e8ff', border: '#8b5cf6', icon: '#8b5cf6' };
        case 'sms': return { bg: '#fef3c7', border: '#f59e0b', icon: '#f59e0b' };
        default: return { bg: '#f1f5f9', border: '#94a3b8', icon: '#94a3b8' };
    }
};

const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const SequencesBuilder = () => {
    const [sequences, setSequences] = useState<Sequence[]>(MOCK_SEQUENCES);
    const [selectedSequence, setSelectedSequence] = useState<Sequence | null>(MOCK_SEQUENCES[0]);
    const [editingStep, setEditingStep] = useState<string | null>(null);
    const [showBuilder, setShowBuilder] = useState(false);

    const handleAddStep = () => {
        if (!selectedSequence) return;
        const newStep: SequenceStep = {
            id: `S${Date.now()}`,
            type: 'email',
            day: selectedSequence.steps.length + 1,
            delay: 0,
            body: '',
            active: true,
        };
        setSelectedSequence({
            ...selectedSequence,
            steps: [...selectedSequence.steps, newStep],
        });
    };

    const handleDeleteStep = (stepId: string) => {
        if (!selectedSequence) return;
        setSelectedSequence({
            ...selectedSequence,
            steps: selectedSequence.steps.filter(s => s.id !== stepId),
        });
    };

    const handleToggleStep = (stepId: string) => {
        if (!selectedSequence) return;
        setSelectedSequence({
            ...selectedSequence,
            steps: selectedSequence.steps.map(s =>
                s.id === stepId ? { ...s, active: !s.active } : s
            ),
        });
    };

    const getConversionRate = (seq: Sequence) => {
        if (seq.stats.enrolled === 0) return 0;
        return Math.round((seq.stats.converted / seq.stats.enrolled) * 100);
    };

    const getEngagementRate = (seq: Sequence) => {
        if (seq.stats.enrolled === 0) return 0;
        return Math.round((seq.stats.engaged / seq.stats.enrolled) * 100);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{
                    background: `linear-gradient(145deg, #6888ff, #5a77d9, #6888ff)`,
                    boxShadow: shadowOut(6)
                }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.1),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={18} className="text-blue-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-blue-200">Sales Engagement</span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1 text-white">Constructor de Secuencias</h2>
                        <p className="text-blue-200 text-sm">Automatización de outreach multicanal</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                            style={{
                                background: 'rgba(255,255,255,0.15)',
                                color: 'white',
                                boxShadow: shadowIn(2)
                            }}
                        >
                            <Plus size={16} /> Nueva Secuencia
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
                        <Users size={16} style={{ color: '#6888ff' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Total Enrolados</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>
                        {sequences.reduce((s, seq) => s + seq.stats.enrolled, 0)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>En todas las secuencias</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Tasa de Engagement</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#059669' }}>
                        {Math.round(sequences.reduce((s, seq) => s + getEngagementRate(seq), 0) / sequences.length)}%
                    </p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Promedio</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Respuestas</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#d97706' }}>
                        {sequences.reduce((s, seq) => s + seq.stats.replied, 0)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Total</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} style={{ color: '#8b5cf6' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Conversiones</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#7c3aed' }}>
                        {sequences.reduce((s, seq) => s + seq.stats.converted, 0)}
                    </p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Leads convertidos</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ──── SEQUENCES LIST ──── */}
                <div
                    className="lg:col-span-1 rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
                        <BarChart3 size={18} style={{ color: N.accent }} /> Secuencias
                    </h3>
                    <div className="space-y-3">
                        {sequences.map(seq => (
                            <div
                                key={seq.id}
                                onClick={() => setSelectedSequence(seq)}
                                className={`p-4 rounded-xl cursor-pointer transition-all ${selectedSequence?.id === seq.id ? 'ring-2' : ''
                                    }`}
                                style={{
                                    background: gradientBase,
                                    boxShadow: selectedSequence?.id === seq.id ? shadowIn(3) : shadowOut(3),
                                    ...(selectedSequence?.id === seq.id ? { ringColor: N.accent } : {})
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h4 className="font-semibold text-sm" style={{ color: '#1e293b' }}>{seq.name}</h4>
                                    <span
                                        className="text-xs px-2 py-0.5 rounded-full"
                                        style={{
                                            background: seq.active ? '#d1fae5' : '#f1f5f9',
                                            color: seq.active ? '#059669' : N.textSub
                                        }}
                                    >
                                        {seq.active ? 'Activa' : 'Pausada'}
                                    </span>
                                </div>
                                <p className="text-xs mb-3" style={{ color: N.text }}>{seq.description}</p>
                                <div className="flex items-center gap-4 text-xs" style={{ color: N.textSub }}>
                                    <span className="flex items-center gap-1">
                                        <Users size={10} /> {seq.stats.enrolled}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <TrendingUp size={10} /> {getConversionRate(seq)}%
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ──── SEQUENCE DETAIL ──── */}
                <div
                    className="lg:col-span-2 rounded-2xl p-5"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    {selectedSequence ? (
                        <>
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="font-bold text-lg" style={{ color: '#1e293b' }}>{selectedSequence.name}</h3>
                                    <p className="text-sm" style={{ color: N.text }}>{selectedSequence.description}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        className="p-2 rounded-lg transition-colors"
                                        style={{
                                            background: gradientBase,
                                            color: N.text,
                                            boxShadow: shadowOut(2)
                                        }}
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        className="p-2 rounded-lg transition-colors"
                                        style={{
                                            background: selectedSequence.active ? '#fef2f2' : '#d1fae5',
                                            color: selectedSequence.active ? '#dc2626' : '#059669'
                                        }}
                                    >
                                        {selectedSequence.active ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-4 gap-3 mb-6">
                                {[
                                    { label: 'Enrolados', value: selectedSequence.stats.enrolled, color: '#6888ff' },
                                    { label: 'Engaged', value: selectedSequence.stats.engaged, color: '#10b981' },
                                    { label: 'Replied', value: selectedSequence.stats.replied, color: '#f59e0b' },
                                    { label: 'Convertidos', value: selectedSequence.stats.converted, color: '#8b5cf6' },
                                ].map(stat => (
                                    <div
                                        key={stat.label}
                                        className="rounded-xl p-3 text-center"
                                        style={{
                                            background: `${stat.color}10`,
                                            border: `1px solid ${stat.color}30`
                                        }}
                                    >
                                        <p className="text-xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                                        <p className="text-xs" style={{ color: N.text }}>{stat.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Steps */}
                            <div className="mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-semibold text-sm" style={{ color: '#1e293b' }}>Pasos de la Secuencia</h4>
                                    <button
                                        onClick={handleAddStep}
                                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                                        style={{
                                            background: N.accent,
                                            color: 'white'
                                        }}
                                    >
                                        <Plus size={12} /> Agregar Paso
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {selectedSequence.steps.map((step, idx) => {
                                        const StepIcon = getStepIcon(step.type);
                                        const colors = getStepColor(step.type);
                                        return (
                                            <div
                                                key={step.id}
                                                className="flex items-start gap-4 p-4 rounded-xl transition-all"
                                                style={{
                                                    background: step.active ? gradientBase : '#f8fafc',
                                                    boxShadow: shadowOut(3),
                                                    opacity: step.active ? 1 : 0.6
                                                }}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                        style={{ background: colors.bg }}
                                                    >
                                                        <StepIcon size={16} style={{ color: colors.icon }} />
                                                    </div>
                                                    <div
                                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                                                        style={{ background: N.accent, color: 'white' }}
                                                    >
                                                        {step.day}
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium" style={{ color: '#1e293b' }}>
                                                            {step.type === 'email' ? 'Email' : step.type === 'call' ? 'Llamada' : step.type === 'linkedin' ? 'LinkedIn' : 'SMS'}
                                                        </span>
                                                        {step.subject && (
                                                            <span className="text-xs" style={{ color: N.textSub }}>• {step.subject}</span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs" style={{ color: N.text }}>{step.body.substring(0, 80)}...</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => handleToggleStep(step.id)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{
                                                            background: step.active ? '#d1fae5' : '#fef2f2',
                                                            color: step.active ? '#059669' : '#dc2626'
                                                        }}
                                                    >
                                                        {step.active ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteStep(step.id)}
                                                        className="p-1.5 rounded-lg transition-colors"
                                                        style={{
                                                            background: '#fef2f2',
                                                            color: '#dc2626'
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12" style={{ color: N.textSub }}>
                            <Target size={48} className="mx-auto mb-3 opacity-50" />
                            <p>Selecciona una secuencia para ver sus detalles</p>
                        </div>
                    )}
                </div>
            </div>

            {/* ──── STEP TYPE LEGEND ──── */}
            <div
                className="rounded-2xl p-4"
                style={{ background: gradientBase, boxShadow: shadowOut(4) }}
            >
                <h4 className="font-semibold text-sm mb-3" style={{ color: '#1e293b' }}>Tipos de Pasos</h4>
                <div className="flex flex-wrap gap-4">
                    {STEP_TYPES.map(stepType => {
                        const StepIcon = stepType.icon;
                        return (
                            <div key={stepType.type} className="flex items-center gap-2">
                                <div
                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                    style={{ background: `${stepType.color}20` }}
                                >
                                    <StepIcon size={16} style={{ color: stepType.color }} />
                                </div>
                                <span className="text-sm" style={{ color: N.text }}>{stepType.label}</span>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
