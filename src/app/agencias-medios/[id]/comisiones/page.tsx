'use client';

/**
 * 🏢 SILEXAR PULSE - Comisiones de Agencia
 * 
 * Gestión de estructuras de comisión por tipo de medio
 * Diseño neuromórfico premium con visualización de comisiones
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    Percent,
    DollarSign,
    TrendingUp,
    TrendingDown,
    ArrowLeft,
    Save,
    X,
    Plus,
    Trash2,
    Edit3,
    Eye,
    AlertTriangle,
    CheckCircle2,
    Info,
    RefreshCw,
    Zap,
    BarChart3,
    PieChart,
    Target,
    Award
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Comision {
    id: string;
    tipoMedio: string;
    tipoMedioLabel: string;
    comisionBase: number;
    comisionNegociada: number;
    comisionFinal: number;
    volumenEstimado: number;
    volumenReal?: number;
    createdAt: string;
    updatedAt: string;
}

interface EstructuraComision {
    id: string;
    agenciaId: string;
    nivelColaboracion: string;
    fechaVigencia: string;
    observaciones: string;
    comisiones: Comision[];
}

interface Agencia {
    id: string;
    nombreComercial: string;
    rut: string;
    nivelColaboracion: string;
    comisionPorcentaje: number;
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

const tiposMedio = [
    { value: 'TV_ABIERTA', label: 'TV Abierta', icon: '📺', comisionBase: 15 },
    { value: 'TV_CABLE', label: 'TV Cable/Sat', icon: '📡', comisionBase: 12 },
    { value: 'RADIO', label: 'Radio', icon: '📻', comisionBase: 15 },
    { value: 'PRENSA', label: 'Prensa', icon: '📰', comisionBase: 15 },
    { value: 'REVISTAS', label: 'Revistas', icon: '📚', comisionBase: 15 },
    { value: 'DIGITAL_DISPLAY', label: 'Digital Display', icon: '🖥️', comisionBase: 20 },
    { value: 'PROGRAMMATIC', label: 'Programmatic', icon: '⚙️', comisionBase: 25 },
    { value: 'SOCIAL_MEDIA', label: 'Social Media', icon: '📱', comisionBase: 25 },
    { value: 'SEARCH', label: 'Search/SEM', icon: '🔍', comisionBase: 20 },
    { value: 'VIDEO_ONLINE', label: 'Video Online', icon: '🎬', comisionBase: 22 },
    { value: 'OOH', label: 'Outdoor (OOH)', icon: '🪧', comisionBase: 12 },
    { value: 'CINE', label: 'Cine', icon: '🎦', comisionBase: 10 },
    { value: 'INFLUENCERS', label: 'Influencers', icon: '⭐', comisionBase: 30 },
    { value: 'CONTENT', label: 'Content Marketing', icon: '✍️', comisionBase: 25 },
    { value: 'EMAIL', label: 'Email Marketing', icon: '✉️', comisionBase: 20 },
];

const mockComisiones: Comision[] = [
    { id: '1', tipoMedio: 'TV_ABIERTA', tipoMedioLabel: 'TV Abierta', comisionBase: 15, comisionNegociada: 14, comisionFinal: 14, volumenEstimado: 150000000, volumenReal: 142000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '2', tipoMedio: 'TV_CABLE', tipoMedioLabel: 'TV Cable/Sat', comisionBase: 12, comisionNegociada: 11, comisionFinal: 11, volumenEstimado: 80000000, volumenReal: 85000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '3', tipoMedio: 'RADIO', tipoMedioLabel: 'Radio', comisionBase: 15, comisionNegociada: 14, comisionFinal: 14, volumenEstimado: 45000000, volumenReal: 48000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '4', tipoMedio: 'DIGITAL_DISPLAY', tipoMedioLabel: 'Digital Display', comisionBase: 20, comisionNegociada: 18, comisionFinal: 18, volumenEstimado: 120000000, volumenReal: 115000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '5', tipoMedio: 'PROGRAMMATIC', tipoMedioLabel: 'Programmatic', comisionBase: 25, comisionNegociada: 22, comisionFinal: 22, volumenEstimado: 200000000, volumenReal: 195000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '6', tipoMedio: 'SOCIAL_MEDIA', tipoMedioLabel: 'Social Media', comisionBase: 25, comisionNegociada: 23, comisionFinal: 23, volumenEstimado: 180000000, volumenReal: 190000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '7', tipoMedio: 'SEARCH', tipoMedioLabel: 'Search/SEM', comisionBase: 20, comisionNegociada: 18, comisionFinal: 18, volumenEstimado: 90000000, volumenReal: 95000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
    { id: '8', tipoMedio: 'INFLUENCERS', tipoMedioLabel: 'Influencers', comisionBase: 30, comisionNegociada: 28, comisionFinal: 28, volumenEstimado: 60000000, volumenReal: 55000000, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-06-15T00:00:00Z' },
];

const mockAgencia: Agencia = {
    id: '1',
    nombreComercial: 'Agencia Uno',
    rut: '76.543.210-K',
    nivelColaboracion: 'estrategico',
    comisionPorcentaje: 18
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

const ProgressBar = ({ value, max, color }: { value: number; max: number; color: string }) => {
    const percentage = Math.min((value / max) * 100, 100);
    return (
        <div className="h-3 bg-slate-200/50 rounded-full overflow-hidden">
            <div
                className={`h-full rounded-full transition-all duration-500 ${color}`}
                style={{ width: `${percentage}%` }}
            />
        </div>
    );
};

const FormatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value);
};

const FormatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ComisionesAgenciaPage() {
    const router = useRouter();
    const params = useParams();
    const agenciaId = params.id as string;

    const [agencia, setAgencia] = useState<Agencia | null>(null);
    const [comisiones, setComisiones] = useState<Comision[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState<number>(0);

    useEffect(() => {
        const timer = setTimeout(() => {
            setAgencia(mockAgencia);
            setComisiones(mockComisiones);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [agenciaId]);

    const totalVolumenEstimado = comisiones.reduce((acc, c) => acc + c.volumenEstimado, 0);
    const totalVolumenReal = comisiones.reduce((acc, c) => acc + (c.volumenReal || 0), 0);
    const comisionPromedio = comisiones.reduce((acc, c) => acc + c.comisionFinal, 0) / comisiones.length;
    const comisionPromedioBase = comisiones.reduce((acc, c) => acc + c.comisionBase, 0) / comisiones.length;
    const ajustePromedio = comisionPromedio - comisionPromedioBase;

    const handleEditStart = (comision: Comision) => {
        setEditingId(comision.id);
        setEditValue(comision.comisionNegociada);
    };

    const handleEditSave = (id: string) => {
        setComisiones(prev => prev.map(c => {
            if (c.id === id) {
                return {
                    ...c,
                    comisionNegociada: editValue,
                    comisionFinal: editValue,
                    updatedAt: new Date().toISOString()
                };
            }
            return c;
        }));
        setEditingId(null);
    };

    const handleEditCancel = () => {
        setEditingId(null);
    };

    const getMedioIcon = (tipo: string) => {
        const medio = tiposMedio.find(m => m.value === tipo);
        return medio?.icon || '📊';
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${designTokens.colors.background} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className={`${designTokens.colors.textSecondary} font-medium`}>Cargando comisiones...</span>
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
                        onClick={() => router.push(`/agencias-medios/${agenciaId}`)}
                        className="flex items-center gap-2 text-slate-300 hover:text-white mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        <span>Volver a {agencia?.nombreComercial}</span>
                    </button>

                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                <Percent size={32} className="text-cyan-400" />
                                Estructura de Comisiones
                            </h1>
                            <p className="text-slate-400 mt-1">
                                {agencia?.nombreComercial} • Nivel: <span className="text-cyan-400 capitalize">{agencia?.nivelColaboracion}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <NeuromorphicButton
                                variant="ghost"
                                size="sm"
                                className="text-white/80 hover:text-white border border-white/20"
                            >
                                <RefreshCw size={18} className="mr-2" />
                                Sincronizar
                            </NeuromorphicButton>
                            <NeuromorphicButton
                                variant="primary"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                Nueva Comisión
                            </NeuromorphicButton>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6 space-y-6">
                {/* Overview Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <DollarSign size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Volumen Estimado</div>
                                <div className="text-xl font-bold text-slate-800">{FormatCurrency(totalVolumenEstimado)}</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <TrendingUp size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Volumen Real</div>
                                <div className="text-xl font-bold text-slate-800">{FormatCurrency(totalVolumenReal)}</div>
                                <div className={`text-xs ${totalVolumenReal >= totalVolumenEstimado ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {((totalVolumenReal / totalVolumenEstimado) * 100).toFixed(1)}% del objetivo
                                </div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                                <Percent size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Comisión Promedio</div>
                                <div className="text-xl font-bold text-slate-800">{FormatPercent(comisionPromedio)}</div>
                                <div className={`text-xs ${ajustePromedio <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {ajustePromedio >= 0 ? '+' : ''}{ajustePromedio.toFixed(1)}% vs base
                                </div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <Zap size={28} className="text-white" />
                            </div>
                            <div>
                                <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Ingreso Estimado</div>
                                <div className="text-xl font-bold text-slate-800">{FormatCurrency(totalVolumenReal * (comisionPromedio / 100))}</div>
                                <div className="text-xs text-slate-500">en comisiones</div>
                            </div>
                        </div>
                    </NeuromorphicCard>
                </div>

                {/* Commission Table */}
                <NeuromorphicCard className="overflow-hidden">
                    <div className="p-6 border-b border-slate-200/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <PieChart size={20} className="text-cyan-600" />
                                Comisiones por Tipo de Medio
                            </h2>
                            <Badge variant="info">{comisiones.length} tipos de medio</Badge>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo de Medio</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Base</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Negociada</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Final</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Volumen Est.</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Volumen Real</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Ingreso</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/30">
                                {comisiones.map((comision) => {
                                    const ingreso = (comision.volumenReal || comision.volumenEstimado) * (comision.comisionFinal / 100);
                                    const fillRate = comision.volumenReal ? (comision.volumenReal / comision.volumenEstimado) * 100 : 0;
                                    const isEditing = editingId === comision.id;

                                    return (
                                        <tr key={comision.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <span className="text-2xl">{getMedioIcon(comision.tipoMedio)}</span>
                                                    <div>
                                                        <div className="font-semibold text-slate-800">{comision.tipoMedioLabel}</div>
                                                        <div className="text-xs text-slate-500">{comision.tipoMedio}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Badge variant="default">{FormatPercent(comision.comisionBase)}</Badge>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {isEditing ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <input
                                                            type="number"
                                                            value={editValue}
                                                            onChange={(e) => setEditValue(parseFloat(e.target.value) || 0)}
                                                            className="w-20 px-3 py-1.5 rounded-lg bg-slate-100/50 border border-slate-200/50 text-right text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                                            step="0.5"
                                                            min="0"
                                                            max="100"
                                                        />
                                                        <button
                                                            onClick={() => handleEditSave(comision.id)}
                                                            className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                                                        >
                                                            <CheckCircle2 size={18} />
                                                        </button>
                                                        <button
                                                            onClick={handleEditCancel}
                                                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50"
                                                        >
                                                            <X size={18} />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <Badge variant="info">{FormatPercent(comision.comisionNegociada)}</Badge>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-bold text-cyan-700">{FormatPercent(comision.comisionFinal)}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="text-slate-700 font-medium">{FormatCurrency(comision.volumenEstimado)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="space-y-1">
                                                    <div className="text-slate-700 font-medium">
                                                        {comision.volumenReal ? FormatCurrency(comision.volumenReal) : '-'}
                                                    </div>
                                                    <ProgressBar
                                                        value={fillRate}
                                                        max={100}
                                                        color={fillRate >= 100 ? 'bg-emerald-500' : fillRate >= 80 ? 'bg-cyan-500' : 'bg-amber-500'}
                                                    />
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="font-bold text-emerald-700">{FormatCurrency(ingreso)}</div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {!isEditing && (
                                                    <button
                                                        onClick={() => handleEditStart(comision)}
                                                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                                        title="Editar comisión"
                                                    >
                                                        <Edit3 size={18} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                            <tfoot className="bg-slate-100/30">
                                <tr>
                                    <td className="px-6 py-4 font-bold text-slate-800">TOTALES</td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-slate-600">{FormatPercent(comisionPromedioBase)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-slate-600">{FormatPercent(comisionPromedio)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-cyan-700">{FormatPercent(comisionPromedio)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-slate-700">{FormatCurrency(totalVolumenEstimado)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-semibold text-slate-700">{FormatCurrency(totalVolumenReal)}</span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span className="font-bold text-emerald-700">{FormatCurrency(totalVolumenReal * (comisionPromedio / 100))}</span>
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </NeuromorphicCard>

                {/* Info Panel */}
                <NeuromorphicCard className="p-5">
                    <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center flex-shrink-0">
                            <Info size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-800 mb-1">Acerca de las Comisiones</h3>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Las comisiones base son sugeridas según el nivel de colaboración de la agencia.
                                Las comisiones negociadas pueden variar según el MOU firmado. El ingreso estimado se calcula
                                multiplicando el volumen real por la comisión final aplicada.
                            </p>
                        </div>
                    </div>
                </NeuromorphicCard>
            </main>
        </div>
    );
}
