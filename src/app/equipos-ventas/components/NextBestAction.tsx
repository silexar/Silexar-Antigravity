/**
 * COMPONENT: NEXT BEST ACTION — Recomendaciones de Acciones IA
 * 
 * @description Sistema de recomendación que le dice al vendedor
 * qué acción tomar en cada momento para maximizar la probabilidad
 * de cerrar deals. Todo en español.
 * 
 * DESIGN: Neumorphic con base #dfeaff, sombras #bec8de y #ffffff
 * Sistema correcto: bg-light-surface + shadow-neumorphic-outset/inset
 */

'use client';

import React, { useState } from 'react';
import {
    Target, Zap, Clock, Phone, Mail, Calendar, MessageSquare,
    FileText, Users, DollarSign, Lightbulb, Sparkles, CheckCircle2,
    AlertCircle, ArrowRight, Loader2, Brain, TrendingUp, User,
    Building2, Star, ThumbsUp, Send
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

interface Action {
    id: string;
    type: 'call' | 'email' | 'meeting' | 'task' | 'followup';
    priority: 'urgent' | 'high' | 'medium' | 'low';
    title: string;
    description: string;
    reason: string;
    dealId?: string;
    dealName?: string;
    company?: string;
    value?: number;
    impact: number;
    confidence: number;
    deadline?: string;
    estimatedTime: string;
    completed: boolean;
}

interface DailyTask {
    time: string;
    actions: Action[];
}

/* ─── MOCK DATA ───────────────────────────────────────────────── */

const TODAY_ACTIONS: Action[] = [
    {
        id: 'A001',
        type: 'call',
        priority: 'urgent',
        title: 'Llamar al CFO de Acme Corp',
        description: 'Seguimiento de discusión de precio - aprobación urgente de presupuesto',
        reason: 'Deal en riesgo: 5 días sin contacto. El CFO no ha respondido a la propuesta de precio.',
        dealId: 'D001',
        dealName: 'Licencia Enterprise',
        company: 'Acme Corporation',
        value: 250000,
        impact: 92,
        confidence: 88,
        deadline: 'Hoy 2:00 PM',
        estimatedTime: '15 min',
        completed: false,
    },
    {
        id: 'A002',
        type: 'email',
        priority: 'high',
        title: 'Enviar case study a TechStart',
        description: 'Enviar case study de transformación SaaS para alinearse con sus desafíos',
        reason: 'Lead score aumentó 15 puntos después de visita web. Listo para nurturing.',
        dealId: 'D002',
        dealName: 'Migración a la Nube',
        company: 'TechStart SA',
        value: 180000,
        impact: 78,
        confidence: 82,
        deadline: 'Hoy 5:00 PM',
        estimatedTime: '5 min',
        completed: false,
    },
    {
        id: 'A003',
        type: 'meeting',
        priority: 'high',
        title: 'Programar llamada de descubrimiento con Global Industries',
        description: 'Configurar llamada de 30 min para entender presupuesto y timeline',
        reason: 'Nuevo lead (score 82). Señales de intención fuertes. Contacto en 24h recomendado.',
        dealId: 'D003',
        dealName: 'Suscripción Anual',
        company: 'Global Industries',
        value: 95000,
        impact: 85,
        confidence: 75,
        deadline: 'Mañana',
        estimatedTime: '2 min (enviar invitación)',
        completed: false,
    },
    {
        id: 'A004',
        type: 'task',
        priority: 'medium',
        title: 'Preparar propuesta para MegaCorp BR',
        description: 'Personalizar propuesta con descuento por volumen para compromiso de 3 años',
        reason: 'Deal en negociación final. Agregar descuento podría acelerar cierre en 2 semanas.',
        dealId: 'D004',
        dealName: 'Expansión de Plataforma',
        company: 'MegaCorp BR',
        value: 420000,
        impact: 95,
        confidence: 90,
        deadline: 'Hoy',
        estimatedTime: '30 min',
        completed: false,
    },
    {
        id: 'A005',
        type: 'followup',
        priority: 'low',
        title: 'Enviar recordatorio de renovación a StartupXYZ',
        description: 'Seguimiento suave en trial expirado - puede necesitar nurturing',
        reason: 'Prioridad baja. Considerar para próxima semana cuando haya bandwidth.',
        dealId: 'D005',
        dealName: 'Paquete Startup',
        company: 'StartupXYZ',
        value: 24000,
        impact: 35,
        confidence: 45,
        deadline: 'Próxima semana',
        estimatedTime: '5 min',
        completed: false,
    },
];

const DAILY_SCHEDULE: DailyTask[] = [
    { time: '9:00 AM', actions: [TODAY_ACTIONS[2]] },
    { time: '10:00 AM', actions: [TODAY_ACTIONS[0]] },
    { time: '11:00 AM', actions: [TODAY_ACTIONS[1]] },
    { time: '2:00 PM', actions: [TODAY_ACTIONS[3]] },
    { time: '4:00 PM', actions: [TODAY_ACTIONS[4]] },
];

/* ─── HELPERS ─────────────────────────────────────────────────── */

const getPriorityConfig = (priority: string) => {
    switch (priority) {
        case 'urgent': return { bg: '#ef4444', bgLight: '#fef2f2', text: '#dc2626', label: 'Urgente', icon: AlertCircle };
        case 'high': return { bg: '#f59e0b', bgLight: '#fffbeb', text: '#d97706', label: 'Alta', icon: Zap };
        case 'medium': return { bg: '#6888ff', bgLight: '#e0eaff', text: '#5069d9', label: 'Media', icon: Clock };
        default: return { bg: '#94a3b8', bgLight: '#f1f5f9', text: '#64748b', label: 'Baja', icon: Star };
    }
};

const getActionIcon = (type: string) => {
    switch (type) {
        case 'call': return Phone;
        case 'email': return Mail;
        case 'meeting': return Calendar;
        case 'task': return FileText;
        case 'followup': return MessageSquare;
        default: return Target;
    }
};

const formatCurrency = (v: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        notation: 'compact',
        maximumFractionDigits: 1
    }).format(v).replace('CLP', '$').replace(',', '.');
};

/* ─── COMPONENT ───────────────────────────────────────────── */

export const NextBestAction = () => {
    const [actions, setActions] = useState<Action[]>(TODAY_ACTIONS);
    const [completedActions, setCompletedActions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    const totalImpact = actions.reduce((s, a) => s + a.impact * (a.completed ? 0 : 1), 0);
    const urgentCount = actions.filter(a => a.priority === 'urgent' && !a.completed).length;
    const highCount = actions.filter(a => a.priority === 'high' && !a.completed).length;

    const handleComplete = (actionId: string) => {
        setActions(prev => prev.map(a =>
            a.id === actionId ? { ...a, completed: true } : a
        ));
        setCompletedActions(prev => [...prev, actionId]);
    };

    const handleRefresh = () => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1500);
    };

    const ActionCard = ({ action }: { action: Action }) => {
        const priority = getPriorityConfig(action.priority);
        const ActionIcon = getActionIcon(action.type);
        const isCompleted = completedActions.includes(action.id);

        return (
            <div
                className={`rounded-2xl p-4 transition-all ${isCompleted ? 'opacity-60' : ''}`}
                style={{
                    background: gradientBase,
                    boxShadow: shadowOut(4),
                    ...(isCompleted ? { textDecoration: 'line-through' } : {})
                }}
            >
                <div className="flex items-start gap-3">
                    <button
                        onClick={() => handleComplete(action.id)}
                        className="mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0"
                        style={{
                            borderColor: isCompleted ? '#10b981' : '#cbd5e1',
                            background: isCompleted ? '#10b981' : 'transparent'
                        }}
                    >
                        {isCompleted ? <CheckCircle2 size={14} className="text-white" /> : null}
                    </button>
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span
                                className="p-1.5 rounded-lg"
                                style={{ background: `${priority.bg}20` }}
                            >
                                <ActionIcon size={16} style={{ color: priority.bg }} />
                            </span>
                            <span
                                className="text-xs font-semibold px-2 py-0.5 rounded-full"
                                style={{
                                    background: priority.bgLight,
                                    color: priority.text
                                }}
                            >
                                {priority.label}
                            </span>
                            {action.dealId && (
                                <span className="text-xs" style={{ color: N.textSub }}>
                                    {action.company}
                                </span>
                            )}
                        </div>
                        <h3
                            className={`font-semibold ${isCompleted ? 'line-through' : ''}`}
                            style={{ color: isCompleted ? N.textSub : '#1e293b' }}
                        >
                            {action.title}
                        </h3>
                        <p className="text-sm mt-1" style={{ color: N.text }}>{action.description}</p>

                        {/* AI Reasoning */}
                        <div
                            className="mt-3 p-2 rounded-lg"
                            style={{
                                background: '#f5f3ff',
                                border: '1px solid #e9e3ff'
                            }}
                        >
                            <div className="flex items-start gap-2">
                                <Lightbulb size={14} style={{ color: '#8b5cf6' }} className="mt-0.5" />
                                <p className="text-xs" style={{ color: '#475569' }}>{action.reason}</p>
                            </div>
                        </div>

                        {/* Metrics */}
                        <div className="flex items-center gap-4 mt-3">
                            {action.value && (
                                <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                                    <DollarSign size={12} />
                                    <span className="font-mono">{formatCurrency(action.value)}</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                                <TrendingUp size={12} style={{ color: '#10b981' }} />
                                <span>Impacto {action.impact}%</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                                <Brain size={12} style={{ color: '#6888ff' }} />
                                <span>{action.confidence}% confianza</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs" style={{ color: N.textSub }}>
                                <Clock size={12} />
                                <span>{action.estimatedTime}</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 mt-3">
                            {action.type === 'call' && (
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        background: '#10b981',
                                        color: 'white'
                                    }}
                                >
                                    <Phone size={12} /> Llamar Ahora
                                </button>
                            )}
                            {action.type === 'email' && (
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        background: '#6888ff',
                                        color: 'white'
                                    }}
                                >
                                    <Mail size={12} /> Enviar Email
                                </button>
                            )}
                            {action.type === 'meeting' && (
                                <button
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                    style={{
                                        background: '#8b5cf6',
                                        color: 'white'
                                    }}
                                >
                                    <Calendar size={12} /> Programar
                                </button>
                            )}
                            <button
                                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                                style={{
                                    background: '#f1f5f9',
                                    color: '#475569'
                                }}
                            >
                                <ArrowRight size={12} /> Ver Detalles
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">

            {/* ──── HEADER ──── */}
            <div
                className="rounded-2xl p-6 text-white relative overflow-hidden"
                style={{
                    background: `linear-gradient(145deg, #f59e0b, #ea580c, #f59e0b)`,
                    boxShadow: shadowOut(6)
                }}
            >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_30%,rgba(255,255,255,0.15),transparent_50%)]" />
                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <Zap size={18} className="text-amber-200" />
                            <span className="text-xs font-bold uppercase tracking-widest text-amber-200">Potenciado por IA</span>
                            <span
                                className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1"
                                style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}
                            >
                                <Sparkles size={10} />
                                Recomendaciones en Tiempo Real
                            </span>
                        </div>
                        <h2 className="text-2xl font-bold mt-1 text-white">Próxima Mejor Acción</h2>
                        <p className="text-amber-100 text-sm">Coach IA diciéndote qué hacer ahora mismo</p>
                    </div>
                    <button
                        onClick={handleRefresh}
                        disabled={loading}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                        style={{
                            background: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            boxShadow: shadowIn(2)
                        }}
                    >
                        {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                        {loading ? 'Obteniendo insights...' : 'Actualizar'}
                    </button>
                </div>
            </div>

            {/* ──── STATS ──── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Target size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Total Acciones</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#1e293b' }}>{actions.length}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Para hoy</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <AlertCircle size={16} style={{ color: '#ef4444' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Urgentes</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#dc2626' }}>{urgentCount}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Necesitan acción inmediata</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={16} style={{ color: '#f59e0b' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Alta Prioridad</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#d97706' }}>{highCount}</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Tareas importantes</p>
                </div>
                <div
                    className="rounded-2xl p-4"
                    style={{ background: gradientBase, boxShadow: shadowOut(4) }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp size={16} style={{ color: '#10b981' }} />
                        <span className="text-xs uppercase font-semibold" style={{ color: N.text }}>Impacto Total</span>
                    </div>
                    <p className="text-2xl font-bold" style={{ color: '#059669' }}>{totalImpact}%</p>
                    <p className="text-xs mt-1" style={{ color: N.textSub }}>Impacto potencial en deals</p>
                </div>
            </div>

            {/* ──── AI RECOMMENDATION ──── */}
            <div
                className="rounded-2xl p-5"
                style={{
                    background: `linear-gradient(145deg, #f59e0b, #ea580c)`,
                    boxShadow: shadowOut(4)
                }}
            >
                <div className="flex items-start gap-4">
                    <div
                        className="p-3 rounded-xl"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <Brain size={28} className="text-white" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-white text-lg flex items-center gap-2">
                            <Sparkles size={18} />
                            Recomendación IA
                        </h3>
                        <p className="text-amber-100 text-sm mt-1">
                            Enfócate primero en la <strong className="text-white">llamada a Acme Corp</strong>.
                            Este deal de $250K está en riesgo después de 5 días de silencio.
                            Una llamada de 15 minutos podría salvar el deal y generar <strong className="text-white">92% de impacto</strong> en tu cuota trimestral.
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                style={{
                                    background: 'white',
                                    color: '#d97706'
                                }}
                            >
                                <Phone size={16} /> Llamar Ahora
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
                                style={{
                                    background: 'rgba(255,255,255,0.2)',
                                    color: 'white'
                                }}
                            >
                                <ArrowRight size={16} /> Ver Deal
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* ──── ACTIONS LIST ──── */}
            <div>
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
                    <Clock size={18} style={{ color: N.text }} /> Acciones Prioritarias de Hoy
                </h3>
                <div className="space-y-3">
                    {actions
                        .sort((a, b) => {
                            const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
                            return priorityOrder[a.priority] - priorityOrder[b.priority];
                        })
                        .map(action => (
                            <ActionCard key={action.id} action={action} />
                        ))}
                </div>
            </div>

            {/* ──── SCHEDULE TIMELINE ──── */}
            <div
                className="rounded-2xl p-5"
                style={{ background: gradientBase, boxShadow: shadowOut(4) }}
            >
                <h3 className="font-bold mb-4 flex items-center gap-2" style={{ color: '#1e293b' }}>
                    <Calendar size={18} style={{ color: '#6888ff' }} /> Horario Sugerido
                </h3>
                <div className="space-y-3">
                    {DAILY_SCHEDULE.map((slot, idx) => (
                        <div key={idx} className="flex items-center gap-4">
                            <div className="w-20 text-sm font-medium flex-shrink-0" style={{ color: N.text }}>
                                {slot.time}
                            </div>
                            <div className="flex-1 h-px" style={{ background: '#e2e8f0' }} />
                            <div className="flex-1">
                                {slot.actions.map(action => {
                                    const ActionIcon = getActionIcon(action.type);
                                    const priority = getPriorityConfig(action.priority);
                                    return (
                                        <div key={action.id} className="flex items-center gap-2">
                                            <span
                                                className="p-1 rounded"
                                                style={{ background: `${priority.bg}20` }}
                                            >
                                                <ActionIcon size={14} style={{ color: priority.bg }} />
                                            </span>
                                            <span className="text-sm font-medium" style={{ color: '#1e293b' }}>
                                                {action.title}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
