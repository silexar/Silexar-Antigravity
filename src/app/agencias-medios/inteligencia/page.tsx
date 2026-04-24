'use client';

/**
 * 🏢 SILEXAR PULSE - Centro de Inteligencia de Partnerships
 * 
 * Dashboard de IA con analytics predictivos y alertas estratégicas
 * Diseño neuromórfico premium con visualización de insights Cortex
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Brain,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Zap,
    Target,
    Award,
    Users,
    DollarSign,
    BarChart3,
    PieChart,
    Activity,
    ChevronRight,
    ChevronLeft,
    Eye,
    Bell,
    Settings,
    RefreshCw,
    Plus,
    X,
    CheckCircle2,
    Clock,
    ArrowUpRight,
    ArrowDownRight,
    AlertCircle,
    Sparkles,
    Lightbulb,
    Shield,
    Calendar,
    Building2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface AlertaInteligente {
    id: string;
    tipo: 'RENOVATION' | 'GROWTH' | 'RISK' | 'OPPORTUNITY' | 'PERFORMANCE';
    titulo: string;
    descripcion: string;
    nivelEmergencia: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
    agenciaId: string;
    agenciaNombre: string;
    fechaGeneracion: string;
    accionesSugeridas: string[];
    leida: boolean;
}

interface Oportunidad {
    oportunidadId: string;
    tipo: 'EXPANSION' | 'NEW_PARTNERSHIP' | 'UPSELL' | 'CROSS_SELL' | 'RENEWAL';
    titulo: string;
    descripcion: string;
    valorPotencial: number;
    probabilidadExito: number;
    agenciaNombre: string;
    estado: string;
}

interface CortexAnalysis {
    scorePartnership: number;
    clasificacion: string;
    fortalezas: string[];
    debilidades: string[];
    oportunidades: string[];
    recomendaciones: string[];
    comparables: Array<{
        agencyId: string;
        nombre: string;
        score: number;
        similitud: number;
    }>;
}

interface MetricasPortfolio {
    totalAgencias: number;
    scorePromedio: number;
    scoreTendencia: number;
    revenueTotal: number;
    crecimientoRevenue: number;
    agenciasActivas: number;
    agenciasEnRiesgo: number;
    partnershipsEstrtegicos: number;
    oportunidadesDetectadas: number;
    alertasPendientes: number;
}

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════

const designTokens = {
    colors: {
        background: 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
        surface: 'bg-slate-50/80',
        primary: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        secondary: 'bg-gradient-to-br from-violet-500 to-violet-600',
        success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
        danger: 'bg-gradient-to-br from-rose-500 to-rose-600',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
    },
    shadows: {
        raised: 'shadow-[8px_8px_16px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]',
        raisedHover: 'shadow-[12px_12px_24px_rgba(0,0,0,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)]',
        inset: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
        glowPurple: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]',
        glowEmerald: 'shadow-[0_0_20px_rgba(16,185,129,0.4)]',
        glowRose: 'shadow-[0_0_20px_rgba(244,63,94,0.4)]',
        glowAmber: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    },
    gradients: {
        header: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800',
        card: 'bg-gradient-to-br from-slate-50 to-slate-100',
        ai: 'bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600',
    }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({ children, className = '', onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) => (
    <div
        className={`${designTokens.gradients.card} ${designTokens.shadows.raised} rounded-2xl ${className}`}
        onClick={onClick}
    >
        {children}
    </div>
);

const NeuromorphicButton = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false }: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost' | 'ai';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
}) => {
    const sizeClasses = { sm: 'px-3 py-1.5 text-sm', md: 'px-5 py-2.5 text-base', lg: 'px-7 py-3 text-lg' };
    const variantClasses = {
        primary: `${designTokens.colors.primary} text-white`,
        secondary: `${designTokens.colors.secondary} text-white`,
        success: `${designTokens.colors.success} text-white`,
        danger: `${designTokens.colors.danger} text-white`,
        ghost: 'bg-slate-100/50 text-slate-700 hover:bg-slate-200/50',
        ai: `${designTokens.gradients.ai} text-white`
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`rounded-xl font-medium transition-all duration-300 ${sizeClasses[size]} ${variantClasses[variant]} ${designTokens.shadows.raised} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'} ${className}`}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'ai' }) => {
    const variantClasses = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-rose-100 text-rose-700',
        info: 'bg-cyan-100 text-cyan-700',
        ai: 'bg-gradient-to-br from-violet-100 to-purple-100 text-violet-700'
    };
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>{children}</span>;
};

const ScoreGauge = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) => {
    const percentage = score / 1000;
    const color = score >= 800 ? 'from-emerald-500 to-emerald-600'
        : score >= 650 ? 'from-cyan-500 to-cyan-600'
            : score >= 450 ? 'from-amber-500 to-amber-600'
                : 'from-rose-500 to-rose-600';

    const dimensions = { sm: 'w-20 h-20', md: 'w-28 h-28', lg: 'w-36 h-36' };
    const textSize = { sm: 'text-lg', md: 'text-2xl', lg: 'text-3xl' };
    const strokeWidth = { sm: 6, md: 8, lg: 10 };
    const r = { sm: 38, md: 45, lg: 55 };

    return (
        <div className={`relative ${dimensions[size]}`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r={r[size]} fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth[size]} />
                <circle cx="50" cy="50" r={r[size]} fill="none" className={`bg-gradient-to-br ${color}`} strokeWidth={strokeWidth[size]} strokeDasharray={`${percentage * 2 * Math.PI * r[size]} ${2 * Math.PI * r[size]}`} strokeLinecap="round" />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`font-bold text-slate-800 ${textSize[size]}`}>{score}</span>
                <span className="text-xs text-slate-500">/1000</span>
            </div>
        </div>
    );
};

const EmergencyBadge = ({ nivel }: { nivel: string }) => {
    const config: Record<string, { bg: string; text: string; icon: any }> = {
        BAJA: { bg: 'bg-emerald-100', text: 'text-emerald-700', icon: CheckCircle2 },
        MEDIA: { bg: 'bg-amber-100', text: 'text-amber-700', icon: AlertCircle },
        ALTA: { bg: 'bg-orange-100', text: 'text-orange-700', icon: AlertTriangle },
        CRITICA: { bg: 'bg-rose-100', text: 'text-rose-700', icon: AlertTriangle }
    };
    const { bg, text, icon: Icon } = config[nivel] || config.BAJA;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${bg} ${text}`}>
            <Icon size={12} />
            {nivel}
        </span>
    );
};

const OpportunityTypeBadge = ({ tipo }: { tipo: string }) => {
    const config: Record<string, { label: string; color: string }> = {
        EXPANSION: { label: 'Expansión', color: 'from-violet-500 to-violet-600' },
        NEW_PARTNERSHIP: { label: 'Nuevo Partner', color: 'from-cyan-500 to-cyan-600' },
        UPSELL: { label: 'Upsell', color: 'from-emerald-500 to-emerald-600' },
        CROSS_SELL: { label: 'Cross-sell', color: 'from-amber-500 to-amber-600' },
        RENEWAL: { label: 'Renovación', color: 'from-blue-500 to-blue-600' }
    };
    const { label, color } = config[tipo] || { label: tipo, color: 'from-slate-500 to-slate-600' };
    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-br ${color}`}>
            {label}
        </span>
    );
};

const ProgressRing = ({ value, max, color, size = 'md' }: { value: number; max: number; color: string; size?: 'sm' | 'md' | 'lg' }) => {
    const percentage = Math.min((value / max) * 100, 100);
    const dimensions = { sm: 'w-12 h-12', md: 'w-16 h-16', lg: 'w-20 h-20' };
    return (
        <div className={`relative ${dimensions[size]}`}>
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                <circle cx="50" cy="50" r="45" fill="none" className={color} strokeWidth="8" strokeDasharray={`${percentage * 2.83} 283`} strokeLinecap="round" />
            </svg>
        </div>
    );
};

const FormatCurrency = (value: number) => {
    if (value >= 1000000000) return `$${(value / 1000000000).toFixed(1)}B`;
    if (value >= 1000000) return `$${(value / 1000000).toFixed(0)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
};

const FormatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAlertas: AlertaInteligente[] = [
    { id: 'alert-001', tipo: 'RENOVATION', titulo: 'Renovación próxima en 90 días', descripcion: 'El contrato marco con OMD Chile vence el 15 de junio. Se recomienda iniciar proceso de renovación.', nivelEmergencia: 'ALTA', agenciaId: 'agm-001', agenciaNombre: 'OMD Chile', fechaGeneracion: new Date().toISOString(), accionesSugeridas: ['Programar reunión con director general', 'Preparar propuesta de renewal'], leida: false },
    { id: 'alert-002', tipo: 'OPPORTUNITY', titulo: 'Potencial expansión detectada', descripcion: 'OMD ha mostrado interés en el sector Pharma. Oportunidad de cross-sell.', nivelEmergencia: 'MEDIA', agenciaId: 'agm-001', agenciaNombre: 'OMD Chile', fechaGeneracion: new Date().toISOString(), accionesSugeridas: ['Programar presentación de capacidades Pharma'], leida: false },
    { id: 'alert-003', tipo: 'RISK', titulo: 'Score en declive por 3 meses', descripcion: 'El score de partnership ha bajado 15 puntos. Causa: decrease en satisfacción.', nivelEmergencia: 'CRITICA', agenciaId: 'agm-002', agenciaNombre: 'Havas Media', fechaGeneracion: new Date().toISOString(), accionesSugeridas: ['Investigar causas de insatisfacción', 'Revisar SLA'], leida: true },
    { id: 'alert-004', tipo: 'GROWTH', titulo: 'Crecimiento excepcional detectado', descripcion: 'Agencia ha superado projections en 25% para Q1. Candidate para upgrade.', nivelEmergencia: 'BAJA', agenciaId: 'agm-003', agenciaNombre: 'MediaCom', fechaGeneracion: new Date().toISOString(), accionesSugeridas: ['Evaluar upgrade a Strategic Partner'], leida: false }
];

const mockOportunidades: Oportunidad[] = [
    { oportunidadId: 'opp-001', tipo: 'EXPANSION', titulo: 'Expansión a sector Pharma', descripcion: 'OMD Chile interesa expandir servicios al sector farmacéutico.', valorPotencial: 850000000, probabilidadExito: 0.78, agenciaNombre: 'OMD Chile', estado: 'EN_EVALUACION' },
    { oportunidadId: 'opp-002', tipo: 'UPSELL', titulo: 'Incremento de inversión en programmatic', descripcion: 'Oportunidad de incrementar spend en programmatic en 30%.', valorPotencial: 320000000, probabilidadExito: 0.85, agenciaNombre: 'OMD Chile', estado: 'DETECTADA' },
    { oportunidadId: 'opp-003', tipo: 'CROSS_SELL', titulo: 'Cross-sell de servicios de contenido', descripcion: 'Oportunidad para ofrecer servicios de content marketing.', valorPotencial: 180000000, probabilidadExito: 0.65, agenciaNombre: 'Havas Media', estado: 'DETECTADA' },
    { oportunidadId: 'opp-004', tipo: 'RENEWAL', titulo: 'Renovación próximo Q3', descripcion: 'Contrato de Havas Media vence en Q3.', valorPotencial: 220000000, probabilidadExito: 0.92, agenciaNombre: 'Havas Media', estado: 'EN_NEGOCIACION' }
];

const mockAnalysis: CortexAnalysis = {
    scorePartnership: 847,
    clasificacion: 'ESTRATEGICO',
    fortalezas: ['Alto volumen en medios digitales', 'Certificaciones vigentes', 'Satisfacción >90%', 'Equipo especializado en programmatic'],
    debilidades: ['Menor presencia en medios tradicionales', 'Capacidad de producción limitada'],
    oportunidades: ['Expansión a mercados regionales', 'Cross-media strategies'],
    recomendaciones: ['Priorizar inversión en video digital', 'Establecer SLA más estrictos'],
    comparables: [
        { agencyId: 'agm-005', nombre: 'MediaCom', score: 812, similitud: 0.89 },
        { agencyId: 'agm-012', nombre: 'PHD Chile', score: 834, similitud: 0.85 },
        { agencyId: 'agm-003', nombre: 'Havas Media', score: 798, similitud: 0.81 }
    ]
};

const mockMetrics: MetricasPortfolio = {
    totalAgencias: 24,
    scorePromedio: 683,
    scoreTendencia: 2.3,
    revenueTotal: 45000000000,
    crecimientoRevenue: 0.18,
    agenciasActivas: 22,
    agenciasEnRiesgo: 3,
    partnershipsEstrtegicos: 5,
    oportunidadesDetectadas: 8,
    alertasPendientes: 12
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function CentroInteligenciaPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [alertas, setAlertas] = useState<AlertaInteligente[]>([]);
    const [oportunidades, setOportunidades] = useState<Oportunidad[]>([]);
    const [analysis, setAnalysis] = useState<CortexAnalysis | null>(null);
    const [metrics, setMetrics] = useState<MetricasPortfolio | null>(null);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'alertas' | 'oportunidades' | 'comparables'>('dashboard');

    useEffect(() => {
        const timer = setTimeout(() => {
            setAlertas(mockAlertas);
            setOportunidades(mockOportunidades);
            setAnalysis(mockAnalysis);
            setMetrics(mockMetrics);
            setLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const alertasNoLeidas = alertas.filter(a => !a.leida).length;

    if (loading) {
        return (
            <div className={`min-h-screen ${designTokens.colors.background} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                    <span className="text-slate-600 font-medium">Inicializando Centro de Inteligencia...</span>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${designTokens.colors.background}`}>
            {/* Header */}
            <header className={`${designTokens.gradients.header} text-white py-6 px-8 shadow-xl`}>
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center">
                                    <Brain size={28} />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold">Centro de Inteligencia</h1>
                                    <p className="text-slate-400 text-sm">Powered by Cortex Partnership AI</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <NeuromorphicButton variant="ghost" size="sm" className="text-white/80 hover:text-white border border-white/20 relative">
                                <Bell size={18} />
                                {alertasNoLeidas > 0 && (
                                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 rounded-full text-xs flex items-center justify-center">{alertasNoLeidas}</span>
                                )}
                            </NeuromorphicButton>
                            <NeuromorphicButton variant="ai" size="sm">
                                <Sparkles size={18} className="mr-2" />
                                Solicitar Análisis
                            </NeuromorphicButton>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-5 gap-4">
                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <Building2 size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{metrics?.totalAgencias}</div>
                                <div className="text-sm text-slate-500">Total Agencias</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                                <Brain size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{metrics?.scorePromedio}</div>
                                <div className="text-sm text-slate-500">Score Promedio</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <DollarSign size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{FormatCurrency(metrics?.revenueTotal || 0)}</div>
                                <div className="text-sm text-slate-500">Revenue Total</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <Target size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{metrics?.oportunidadesDetectadas}</div>
                                <div className="text-sm text-slate-500">Oportunidades</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-3">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg">
                                <AlertTriangle size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-3xl font-bold text-slate-800">{alertasNoLeidas}</div>
                                <div className="text-sm text-slate-500">Alertas Pendientes</div>
                            </div>
                        </div>
                    </NeuromorphicCard>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('dashboard')} className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl ${activeTab === 'dashboard' ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100/50'}`}>
                        Dashboard IA
                    </button>
                    <button onClick={() => setActiveTab('alertas')} className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl ${activeTab === 'alertas' ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100/50'} flex items-center gap-2`}>
                        Alertas <Badge variant="danger">{alertasNoLeidas}</Badge>
                    </button>
                    <button onClick={() => setActiveTab('oportunidades')} className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl ${activeTab === 'oportunidades' ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100/50'}`}>
                        Oportunidades
                    </button>
                    <button onClick={() => setActiveTab('comparables')} className={`px-6 py-3 font-medium transition-all duration-300 rounded-xl ${activeTab === 'comparables' ? 'bg-gradient-to-br from-violet-500 to-violet-600 text-white shadow-lg' : 'text-slate-600 hover:bg-slate-100/50'}`}>
                        Comparables
                    </button>
                </div>

                {/* Tab Content */}
                {activeTab === 'dashboard' && (
                    <div className="grid grid-cols-3 gap-6">
                        {/* Analysis Card */}
                        <div className="col-span-2 space-y-6">
                            <NeuromorphicCard className="p-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Brain size={20} className="text-violet-600" />
                                    Análisis Partnership - OMD Chile
                                </h2>

                                <div className="flex items-center gap-8 mb-8">
                                    <ScoreGauge score={analysis?.scorePartnership || 0} size="lg" />
                                    <div className="flex-1">
                                        <div className="text-sm text-slate-500 mb-1">Clasificación</div>
                                        <div className="text-2xl font-bold text-violet-700 mb-4">{analysis?.clasificacion}</div>
                                        <div className="flex items-center gap-2 text-sm text-emerald-600">
                                            <TrendingUp size={16} />
                                            +2.3% tendencia mensual
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <h3 className="font-semibold text-emerald-700 mb-3 flex items-center gap-2">
                                            <TrendingUp size={16} />
                                            Fortalezas
                                        </h3>
                                        <ul className="space-y-2">
                                            {analysis?.fortalezas.map((f, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <CheckCircle2 size={14} className="text-emerald-500 mt-0.5" />
                                                    {f}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-amber-700 mb-3 flex items-center gap-2">
                                            <AlertCircle size={16} />
                                            Áreas de Mejora
                                        </h3>
                                        <ul className="space-y-2">
                                            {analysis?.debilidades.map((d, i) => (
                                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                                                    <AlertTriangle size={14} className="text-amber-500 mt-0.5" />
                                                    {d}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </NeuromorphicCard>

                            <NeuromorphicCard className="p-6">
                                <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Lightbulb size={20} className="text-cyan-600" />
                                    Recomendaciones IA
                                </h2>
                                <div className="space-y-3">
                                    {analysis?.recomendaciones.map((r, i) => (
                                        <div key={i} className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-cyan-50 to-violet-50">
                                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                                                {i + 1}
                                            </div>
                                            <span className="text-slate-700">{r}</span>
                                        </div>
                                    ))}
                                </div>
                            </NeuromorphicCard>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Alerts Summary */}
                            <NeuromorphicCard className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <AlertTriangle size={18} className="text-rose-600" />
                                        Alertas Recientes
                                    </h3>
                                    <Badge variant="danger">{alertasNoLeidas} nuevas</Badge>
                                </div>
                                <div className="space-y-3">
                                    {alertas.slice(0, 3).map((alerta) => (
                                        <div key={alerta.id} className={`p-3 rounded-xl ${alerta.leida ? 'bg-slate-50' : 'bg-rose-50/50 border border-rose-200/50'}`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-sm font-medium text-slate-700">{alerta.titulo}</span>
                                                <EmergencyBadge nivel={alerta.nivelEmergencia} />
                                            </div>
                                            <div className="text-xs text-slate-500">{alerta.agenciaNombre}</div>
                                        </div>
                                    ))}
                                </div>
                            </NeuromorphicCard>

                            {/* Opportunities Summary */}
                            <NeuromorphicCard className="p-5">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <Target size={18} className="text-emerald-600" />
                                        Top Oportunidades
                                    </h3>
                                </div>
                                <div className="space-y-3">
                                    {oportunidades.slice(0, 3).map((opp) => (
                                        <div key={opp.oportunidadId} className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200/50">
                                            <div className="flex items-center justify-between mb-2">
                                                <OpportunityTypeBadge tipo={opp.tipo} />
                                                <span className="text-sm font-bold text-emerald-700">{FormatCurrency(opp.valorPotencial)}</span>
                                            </div>
                                            <div className="text-sm font-medium text-slate-700">{opp.titulo}</div>
                                            <div className="text-xs text-slate-500 mt-1">{opp.agenciaNombre}</div>
                                        </div>
                                    ))}
                                </div>
                            </NeuromorphicCard>

                            {/* Comparables */}
                            <NeuromorphicCard className="p-5">
                                <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Award size={18} className="text-violet-600" />
                                    Agencias Similares
                                </h3>
                                <div className="space-y-3">
                                    {analysis?.comparables.map((comp) => (
                                        <div key={comp.agencyId} className="flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-slate-700">{comp.nombre}</div>
                                                <div className="text-xs text-slate-500">{FormatPercent(comp.similitud)} similitud</div>
                                            </div>
                                            <ScoreGauge score={comp.score} size="sm" />
                                        </div>
                                    ))}
                                </div>
                            </NeuromorphicCard>
                        </div>
                    </div>
                )}

                {activeTab === 'alertas' && (
                    <div className="space-y-4">
                        {alertas.map((alerta) => (
                            <NeuromorphicCard key={alerta.id} className={`p-5 ${!alerta.leida ? 'border-2 border-rose-200' : ''}`}>
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${alerta.tipo === 'RISK' ? 'bg-gradient-to-br from-rose-500 to-rose-600' : alerta.tipo === 'OPPORTUNITY' ? 'bg-gradient-to-br from-emerald-500 to-emerald-600' : 'bg-gradient-to-br from-violet-500 to-violet-600'}`}>
                                            {alerta.tipo === 'RISK' ? <AlertTriangle size={24} className="text-white" /> : alerta.tipo === 'OPPORTUNITY' ? <Target size={24} className="text-white" /> : <Calendar size={24} className="text-white" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-slate-800">{alerta.titulo}</h3>
                                                <EmergencyBadge nivel={alerta.nivelEmergencia} />
                                            </div>
                                            <p className="text-slate-600 text-sm mb-2">{alerta.descripcion}</p>
                                            <div className="text-xs text-slate-500 mb-3">
                                                <span className="font-medium">{alerta.agenciaNombre}</span> • {new Date(alerta.fechaGeneracion).toLocaleDateString('es-CL')}
                                            </div>
                                            <div className="flex flex-wrap gap-2">
                                                {alerta.accionesSugeridas.map((accion, i) => (
                                                    <Badge key={i} variant="info">{accion}</Badge>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                    <NeuromorphicButton variant="ghost" size="sm">
                                        <Eye size={18} />
                                    </NeuromorphicButton>
                                </div>
                            </NeuromorphicCard>
                        ))}
                    </div>
                )}

                {activeTab === 'oportunidades' && (
                    <div className="grid grid-cols-2 gap-6">
                        {oportunidades.map((opp) => (
                            <NeuromorphicCard key={opp.oportunidadId} className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <OpportunityTypeBadge tipo={opp.tipo} />
                                    <Badge variant={opp.estado === 'EN_NEGOCIACION' ? 'success' : 'default'}>{opp.estado.replace('_', ' ')}</Badge>
                                </div>
                                <h3 className="font-bold text-slate-800 text-lg mb-2">{opp.titulo}</h3>
                                <p className="text-slate-600 text-sm mb-4">{opp.descripcion}</p>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100">
                                    <div>
                                        <div className="text-2xl font-bold text-emerald-700">{FormatCurrency(opp.valorPotencial)}</div>
                                        <div className="text-xs text-slate-500">Valor Potencial</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-violet-700">{FormatPercent(opp.probabilidadExito)}</div>
                                        <div className="text-xs text-slate-500">Probabilidad</div>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="text-xs text-slate-500 mb-1">Agencia</div>
                                    <div className="font-medium text-slate-700">{opp.agenciaNombre}</div>
                                </div>
                            </NeuromorphicCard>
                        ))}
                    </div>
                )}

                {activeTab === 'comparables' && (
                    <NeuromorphicCard className="p-6">
                        <h2 className="text-lg font-bold text-slate-800 mb-6">Benchmarks de Mercado</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="bg-slate-100/50">
                                        <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase">Agencia</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Score</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Revenue</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Certificaciones</th>
                                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase">Satisfacción</th>
                                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase">Posición</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200/30">
                                    {analysis?.comparables.map((comp) => (
                                        <tr key={comp.agencyId} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 font-medium text-slate-800">{comp.nombre}</td>
                                            <td className="px-6 py-4 text-right"><ScoreGauge score={comp.score} size="sm" /></td>
                                            <td className="px-6 py-4 text-right text-slate-700">-</td>
                                            <td className="px-6 py-4 text-right text-slate-700">-</td>
                                            <td className="px-6 py-4 text-right text-slate-700">-</td>
                                            <td className="px-6 py-4 text-center"><Badge variant="success">Above Avg</Badge></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </NeuromorphicCard>
                )}
            </main>
        </div>
    );
}
