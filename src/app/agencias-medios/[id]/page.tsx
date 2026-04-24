'use client';

/**
 * 🏢 SILEXAR PULSE - Detalle de Agencia de Medios
 * 
 * Vista detalle con tabs para Información, Contactos, Comisiones
 * Diseño neuromórfico premium
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    ArrowLeft,
    Edit3,
    Trash2,
    Users,
    Percent,
    TrendingUp,
    TrendingDown,
    Star,
    Crown,
    Award,
    Target,
    ExternalLink,
    Phone,
    Mail,
    Calendar,
    BarChart3,
    Eye,
    Building2,
    MapPin,
    Globe,
    Shield,
    Zap
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Agencia {
    id: string;
    codigo: string;
    rut: string;
    nombreRazonSocial: string;
    nombreComercial: string;
    tipoAgencia: string;
    nivelColaboracion: string;
    scorePartnership: number;
    tendenciaScore: 'up' | 'down' | 'stable';
    especializaciones: string[];
    certificaciones: string[];
    revenueAnual: number;
    fechaFundacion: string;
    empleadosCantidad: number;
    region: string;
    ciudad: string;
    direccion: string;
    email: string;
    telefono: string;
    sitioWeb: string;
    contactosCount: number;
    campaignsActivas: number;
    satisfactionScore: number;
    comisionPorcentaje: number;
    estado: string;
    activa: boolean;
}

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC DESIGN TOKENS
// ═══════════════════════════════════════════════════════════════

const designTokens = {
    colors: {
        background: 'bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200',
        surface: 'bg-slate-50/80',
        surfaceHover: 'hover:bg-slate-100/80',
        primary: 'bg-gradient-to-br from-cyan-500 to-cyan-600',
        primaryLight: 'from-cyan-400 to-cyan-500',
        secondary: 'bg-gradient-to-br from-violet-500 to-violet-600',
        secondaryLight: 'from-violet-400 to-violet-500',
        success: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
        warning: 'bg-gradient-to-br from-amber-500 to-amber-600',
        danger: 'bg-gradient-to-br from-rose-500 to-rose-600',
        text: 'text-slate-800',
        textSecondary: 'text-slate-600',
        textMuted: 'text-slate-400',
        border: 'border-slate-200/50',
        accent: 'text-cyan-600',
    },
    shadows: {
        raised: 'shadow-[8px_8px_16px_rgba(0,0,0,0.08),-4px_-4px_12px_rgba(255,255,255,0.9)]',
        raisedHover: 'shadow-[12px_12px_24px_rgba(0,0,0,0.12),-6px_-6px_16px_rgba(255,255,255,0.95)]',
        inset: 'shadow-[inset_4px_4px_8px_rgba(0,0,0,0.06),inset_-2px_-2px_6px_rgba(255,255,255,0.8)]',
        glow: 'shadow-[0_0_20px_rgba(6,182,212,0.3)]',
    },
    gradients: {
        header: 'bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800',
        card: 'bg-gradient-to-br from-slate-50 to-slate-100',
    }
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockAgencia: Agencia = {
    id: '1',
    codigo: 'AG-2024-001',
    rut: '76.543.210-K',
    nombreRazonSocial: 'Agencia Uno SpA',
    nombreComercial: 'Agencia Uno',
    tipoAgencia: 'FULL_SERVICE',
    nivelColaboracion: 'estrategico',
    scorePartnership: 847,
    tendenciaScore: 'up',
    especializaciones: ['FMCG', 'Finance', 'Pharma', 'Tech', 'Retail'],
    certificaciones: ['Google Partner', 'Meta Business Partner', 'Amazon Ads'],
    revenueAnual: 2500000000,
    fechaFundacion: '2015-03-15',
    empleadosCantidad: 85,
    region: 'Metropolitana',
    ciudad: 'Santiago',
    direccion: 'Av. Providencia 1650, Piso 12',
    email: 'contacto@agenciauno.cl',
    telefono: '+56 2 2345 6700',
    sitioWeb: 'https://agenciauno.cl',
    contactosCount: 4,
    campaignsActivas: 12,
    satisfactionScore: 92,
    comisionPorcentaje: 18,
    estado: 'activa',
    activa: true
};

const nivelColaboracionConfig = {
    estrategico: {
        label: 'Estratégico',
        color: 'from-violet-500 to-violet-600',
        bgColor: 'bg-violet-100',
        textColor: 'text-violet-700',
        minScore: 800,
        icon: Crown
    },
    preferencial: {
        label: 'Preferencial',
        color: 'from-cyan-500 to-cyan-600',
        bgColor: 'bg-cyan-100',
        textColor: 'text-cyan-700',
        minScore: 650,
        icon: Award
    },
    estandar: {
        label: 'Estándar',
        color: 'from-emerald-500 to-emerald-600',
        bgColor: 'bg-emerald-100',
        textColor: 'text-emerald-700',
        minScore: 450,
        icon: Star
    },
    transaccional: {
        label: 'Transaccional',
        color: 'from-amber-500 to-amber-600',
        bgColor: 'bg-amber-100',
        textColor: 'text-amber-700',
        minScore: 200,
        icon: Target
    },
    prospecto: {
        label: 'Prospecto',
        color: 'from-slate-500 to-slate-600',
        bgColor: 'bg-slate-100',
        textColor: 'text-slate-700',
        minScore: 0,
        icon: Target
    }
};

const tipoAgenciaLabels: Record<string, string> = {
    FULL_SERVICE: 'Full Service',
    DIGITAL: 'Digital Only',
    BOUTIQUE: 'Boutique',
    MEDIA_BUYER: 'Media Buyer',
    CREATIVE: 'Creative/Brand',
    SPECIALIZED: 'Specialized'
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
    variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    disabled?: boolean;
}) => {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-5 py-2.5 text-base',
        lg: 'px-7 py-3 text-lg'
    };

    const variantClasses = {
        primary: `${designTokens.colors.primary} text-white ${designTokens.shadows.raised} hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]`,
        secondary: `${designTokens.colors.secondary} text-white ${designTokens.shadows.raised}`,
        success: `${designTokens.colors.success} text-white ${designTokens.shadows.raised}`,
        danger: `${designTokens.colors.danger} text-white ${designTokens.shadows.raised}`,
        ghost: 'bg-slate-100/50 text-slate-700 hover:bg-slate-200/50'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                rounded-xl font-medium transition-all duration-300 
                ${sizeClasses[size]} ${variantClasses[variant]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'}
                ${className}
            `}
        >
            {children}
        </button>
    );
};

const Badge = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' }) => {
    const variantClasses = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-rose-100 text-rose-700',
        info: 'bg-cyan-100 text-cyan-700'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]}`}>
            {children}
        </span>
    );
};

const ScoreGauge = ({ score }: { score: number }) => {
    const percentage = score / 1000;
    const color = score >= 800 ? 'from-emerald-500 to-emerald-600'
        : score >= 650 ? 'from-cyan-500 to-cyan-600'
            : score >= 450 ? 'from-amber-500 to-amber-600'
                : 'from-rose-500 to-rose-600';

    return (
        <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                />
                <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    className={`bg-gradient-to-br ${color}`}
                    strokeWidth="8"
                    strokeDasharray={`${percentage * 283} 283`}
                    strokeLinecap="round"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-800">{score}</span>
                <span className="text-xs text-slate-500">/1000</span>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) => (
    <button
        onClick={onClick}
        className={`
            px-6 py-3 font-medium transition-all duration-300 rounded-xl
            ${active
                ? `${designTokens.colors.primary} text-white shadow-lg`
                : 'text-slate-600 hover:bg-slate-100/50'
            }
        `}
    >
        {children}
    </button>
);

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AgenciaDetallePage() {
    const router = useRouter();
    const params = useParams();
    const agenciaId = params.id as string;

    const [agencia, setAgencia] = useState<Agencia | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'contactos' | 'comisiones'>('info');

    useEffect(() => {
        const timer = setTimeout(() => {
            setAgencia(mockAgencia);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [agenciaId]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('es-CL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const nivelConfig = agencia ? nivelColaboracionConfig[agencia.nivelColaboracion as keyof typeof nivelColaboracionConfig] : nivelColaboracionConfig.prospecto;
    const NivelIcon = nivelConfig.icon;

    if (loading) {
        return (
            <div className={`min-h-screen ${designTokens.colors.background} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className={`${designTokens.colors.textSecondary} font-medium`}>Cargando agencia...</span>
                </div>
            </div>
        );
    }

    if (!agencia) {
        return (
            <div className={`min-h-screen ${designTokens.colors.background} flex items-center justify-center`}>
                <div className="text-center">
                    <Building2 size={48} className="mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">Agencia no encontrada</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${designTokens.colors.background}`}>
            {/* Header */}
            <header className={`${designTokens.gradients.header} text-white py-6 px-8 shadow-xl`}>
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => router.push('/agencias-medios')}
                        className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a Agencias</span>
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                AU
                            </div>
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-3xl font-bold">{agencia.nombreComercial}</h1>
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-br ${nivelConfig.color}`}>
                                        <NivelIcon size={14} className="inline mr-1" />
                                        {nivelConfig.label}
                                    </span>
                                </div>
                                <p className="text-slate-400 mt-1">{agencia.nombreRazonSocial}</p>
                                <div className="flex items-center gap-4 mt-2 text-sm text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <span className="font-mono">{agencia.rut}</span>
                                    </span>
                                    <span>•</span>
                                    <span>{agencia.ciudad}, {agencia.region}</span>
                                    <span>•</span>
                                    <span>Código: {agencia.codigo}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <NeuromorphicButton variant="ghost" size="sm" className="text-white/80 hover:text-white border border-white/20">
                                <Eye size={18} className="mr-2" />
                                Ver Dashboard
                            </NeuromorphicButton>
                            <NeuromorphicButton variant="secondary" size="sm">
                                <Edit3 size={18} className="mr-2" />
                                Editar
                            </NeuromorphicButton>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-5 gap-4 mb-6">
                    <NeuromorphicCard className="p-4 text-center">
                        <ScoreGauge score={agencia.scorePartnership} />
                        <div className="mt-2 flex items-center justify-center gap-1">
                            {agencia.tendenciaScore === 'up' && <TrendingUp size={14} className="text-emerald-500" />}
                            {agencia.tendenciaScore === 'down' && <TrendingDown size={14} className="text-rose-500" />}
                            <span className={`text-xs ${agencia.tendenciaScore === 'up' ? 'text-emerald-600' : agencia.tendenciaScore === 'down' ? 'text-rose-600' : 'text-slate-500'}`}>
                                {agencia.tendenciaScore === 'up' ? 'En alza' : agencia.tendenciaScore === 'down' ? 'En baja' : 'Estable'}
                            </span>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{agencia.contactosCount}</div>
                                <div className="text-sm text-slate-500">Contactos</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <BarChart3 size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{agencia.campaignsActivas}</div>
                                <div className="text-sm text-slate-500">Campañas Activas</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Star size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{agencia.satisfactionScore}%</div>
                                <div className="text-sm text-slate-500">Satisfacción</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <Percent size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{agencia.comisionPorcentaje}%</div>
                                <div className="text-sm text-slate-500">Comisión</div>
                            </div>
                        </div>
                    </NeuromorphicCard>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    <TabButton active={activeTab === 'info'} onClick={() => setActiveTab('info')}>
                        Información General
                    </TabButton>
                    <TabButton active={activeTab === 'contactos'} onClick={() => router.push(`/agencias-medios/${agenciaId}/contactos`)}>
                        Contactos ({agencia.contactosCount})
                    </TabButton>
                    <TabButton active={activeTab === 'comisiones'} onClick={() => router.push(`/agencias-medios/${agenciaId}/comisiones`)}>
                        Comisiones
                    </TabButton>
                </div>

                {/* Tab Content */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Main Info */}
                    <div className="col-span-2 space-y-6">
                        {/* Company Info */}
                        <NeuromorphicCard className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Building2 size={20} className="text-cyan-600" />
                                Información de la Empresa
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Tipo de Agencia</label>
                                    <div className="mt-1">
                                        <Badge variant="info">{tipoAgenciaLabels[agencia.tipoAgencia] || agencia.tipoAgencia}</Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Estado</label>
                                    <div className="mt-1">
                                        <Badge variant={agencia.activa ? 'success' : 'danger'}>
                                            {agencia.activa ? 'Activa' : 'Inactiva'}
                                        </Badge>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Fecha de Fundación</label>
                                    <div className="mt-1 text-slate-800 font-medium">{formatDate(agencia.fechaFundacion)}</div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Cantidad de Empleados</label>
                                    <div className="mt-1 text-slate-800 font-medium">{agencia.empleadosCantidad}</div>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-xs text-slate-500 uppercase tracking-wider">Dirección</label>
                                    <div className="mt-1 text-slate-800 font-medium">{agencia.direccion}, {agencia.ciudad}</div>
                                </div>
                            </div>
                        </NeuromorphicCard>

                        {/* Specializations */}
                        <NeuromorphicCard className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Target size={20} className="text-cyan-600" />
                                Especializaciones Verticales
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {agencia.especializaciones.map((spec, index) => (
                                    <span
                                        key={index}
                                        className="px-4 py-2 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 text-white text-sm font-medium shadow-md"
                                    >
                                        {spec}
                                    </span>
                                ))}
                            </div>
                        </NeuromorphicCard>

                        {/* Certifications */}
                        <NeuromorphicCard className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Shield size={20} className="text-cyan-600" />
                                Certificaciones de Plataforma
                            </h2>
                            <div className="grid grid-cols-3 gap-4">
                                {agencia.certificaciones.map((cert, index) => (
                                    <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-slate-100/50">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
                                            <Award size={20} className="text-white" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-700">{cert}</span>
                                    </div>
                                ))}
                            </div>
                        </NeuromorphicCard>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Revenue */}
                        <NeuromorphicCard className="p-6">
                            <h3 className="text-sm text-slate-500 uppercase tracking-wider mb-2">Revenue Anual</h3>
                            <div className="text-2xl font-bold text-slate-800">{formatCurrency(agencia.revenueAnual)}</div>
                            <div className="flex items-center gap-1 mt-1 text-emerald-600 text-sm">
                                <TrendingUp size={14} />
                                <span>12% vs año anterior</span>
                            </div>
                        </NeuromorphicCard>

                        {/* Contact Info */}
                        <NeuromorphicCard className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Contacto</h2>
                            <div className="space-y-4">
                                <a href={`mailto:${agencia.email}`} className="flex items-center gap-3 text-slate-600 hover:text-cyan-600">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                        <Mail size={18} className="text-cyan-600" />
                                    </div>
                                    <span className="text-sm">{agencia.email}</span>
                                </a>
                                <a href={`tel:${agencia.telefono}`} className="flex items-center gap-3 text-slate-600 hover:text-cyan-600">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                        <Phone size={18} className="text-cyan-600" />
                                    </div>
                                    <span className="text-sm">{agencia.telefono}</span>
                                </a>
                                <a href={agencia.sitioWeb} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-slate-600 hover:text-cyan-600">
                                    <div className="w-10 h-10 rounded-lg bg-cyan-100 flex items-center justify-center">
                                        <Globe size={18} className="text-cyan-600" />
                                    </div>
                                    <span className="text-sm flex items-center gap-1">
                                        {agencia.sitioWeb}
                                        <ExternalLink size={12} />
                                    </span>
                                </a>
                            </div>
                        </NeuromorphicCard>

                        {/* Quick Actions */}
                        <NeuromorphicCard className="p-6">
                            <h2 className="text-lg font-bold text-slate-800 mb-4">Acciones Rápidas</h2>
                            <div className="space-y-2">
                                <NeuromorphicButton
                                    variant="primary"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => router.push(`/agencias-medios/${agenciaId}/contactos`)}
                                >
                                    <Users size={16} className="mr-2" />
                                    Gestionar Contactos
                                </NeuromorphicButton>
                                <NeuromorphicButton
                                    variant="secondary"
                                    size="sm"
                                    className="w-full justify-center"
                                    onClick={() => router.push(`/agencias-medios/${agenciaId}/comisiones`)}
                                >
                                    <Percent size={16} className="mr-2" />
                                    Configurar Comisiones
                                </NeuromorphicButton>
                                <NeuromorphicButton
                                    variant="ghost"
                                    size="sm"
                                    className="w-full justify-center"
                                >
                                    <Zap size={16} className="mr-2" />
                                    Solicitar Análisis IA
                                </NeuromorphicButton>
                            </div>
                        </NeuromorphicCard>
                    </div>
                </div>
            </main>
        </div>
    );
}
