/**
 * 📅 SILEXAR PULSE - Programa Detail Page TIER 0
 *
 * @description Detail panel for viewing and editing a commercial program.
 *              Includes cupos management, vencimientos, and conductors.
 *              Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 *              TIER 0 ENTERPRISE - Fortune 10 Ready
 *
 * @version 2026.1.0
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    ArrowLeft,
    Calendar,
    Clock,
    Users,
    Package,
    DollarSign,
    CheckCircle2,
    AlertTriangle,
    Radio,
    Plus,
    X,
    ChevronRight,
    Sparkles
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TOKENS OFICIALES NEUMORPHISM
// ═══════════════════════════════════════════════════════════════

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8',
};

const neu = `8px 8px 16px ${N.dark},-8px -8px 16px ${N.light}`;
const neuSm = `4px 4px 8px ${N.dark},-4px -4px 8px ${N.light}`;
const neuXs = `2px 2px 4px ${N.dark},-2px -2px 4px ${N.light}`;
const inset = `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}`;
const insetSm = `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`;

// ═══════════════════════════════════════════════════════════════
// COMPONENTES NEUMORPHIC
// ═══════════════════════════════════════════════════════════════

function NeuCard({ children, className = '', style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
    return (
        <div className={`rounded-3xl ${className}`} style={{ background: N.base, boxShadow: neu, ...style }}>
            {children}
        </div>
    );
}

function NeuButton({ children, onClick, variant = 'secondary', className = '', disabled = false }: {
    children: React.ReactNode; onClick?: () => void; variant?: 'primary' | 'secondary'; className?: string; disabled?: boolean;
}) {
    const s = variant === 'primary'
        ? { background: N.accent, color: '#fff', boxShadow: neuSm }
        : { background: N.base, color: N.text, boxShadow: neu };
    return (
        <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-xl font-bold transition-all duration-200 flex items-center gap-2 ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'} ${className}`} style={s}>
            {children}
        </button>
    );
}

function NeuSelect({ value, onChange, options, className = '' }: {
    value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string;
}) {
    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className={`px-4 py-3 rounded-xl text-sm cursor-pointer ${className}`}
            style={{
                background: N.base,
                boxShadow: inset,
                color: N.text,
                outline: 'none'
            }}
        >
            {options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
        </select>
    );
}

function TabButton({ label, active, onClick, icon: Icon }: { label: string; active: boolean; onClick: () => void; icon: React.ElementType }) {
    return (
        <button
            onClick={onClick}
            className="px-4 py-3 text-sm font-bold transition-all duration-200 flex items-center gap-2 rounded-xl"
            style={{
                color: active ? N.accent : N.textSub,
                background: active ? N.base : 'transparent',
                boxShadow: active ? insetSm : 'none',
            }}
        >
            <Icon className="w-5 h-5" />
            {label}
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ProgramaDetail {
    id: string;
    codigo: string;
    emiId: string;
    emiNombre: string;
    nombre: string;
    descripcion: string;
    horario: {
        horaInicio: string;
        horaFin: string;
        diasSemana: number[];
    };
    cupos: {
        tipoA: { total: number; ocupados: number; disponibles: number; precioBase: number; precioActual: number };
        tipoB: { total: number; ocupados: number; disponibles: number; precioBase: number; precioActual: number };
        menciones: { total: number; ocupados: number; disponibles: number; precioBase: number; precioActual: number };
    };
    estado: 'BORRADOR' | 'ACTIVO' | 'PAUSADO' | 'ARCHIVADO';
    revenueActual: number;
    revenuePotencial: number;
    listaEsperaCount: number;
    conductores: Array<{ id: string; nombre: string; rol: string; fotoUrl?: string }>;
    vigenciaDesde?: string;
    vigenciaHasta?: string;
    createdAt: string;
    updatedAt: string;
}

interface VencimientosItem {
    id: string;
    clienteNombre: string;
    tipo: string;
    fechaVencimientos: string;
    diasRestantes: number;
    nivel: string;
    valor: number;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const diasSemanaNombres = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

function formatCurrency(value: number): string {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`;
    return `$${value}`;
}

function formatDiasSemana(dias: number[]): string {
    return dias.map(d => diasSemanaNombres[d]).join(', ');
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES INTERNOS
// ═══════════════════════════════════════════════════════════════

function CupoCard({ titulo, total, ocupados, disponibles, precioBase, color }: {
    titulo: string;
    total: number;
    ocupados: number;
    disponibles: number;
    precioBase: number;
    color: string;
}) {
    const porcentaje = total > 0 ? (ocupados / total) * 100 : 0;
    return (
        <NeuCard className="p-5">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                    <h3 className="font-bold" style={{ color: N.text }}>{titulo}</h3>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${disponibles > 0 ? '' : ''}`}
                    style={{
                        background: disponibles > 0 ? 'rgba(34,197,94,0.12)' : 'rgba(239,68,68,0.12)',
                        color: disponibles > 0 ? '#22c55e' : '#ef4444'
                    }}>
                    {disponibles} disponibles
                </span>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
                    <p className="text-2xl font-black" style={{ color: N.text }}>{total}</p>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Total</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
                    <p className="text-2xl font-black" style={{ color: '#f59e0b' }}>{ocupados}</p>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Ocupados</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
                    <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{disponibles}</p>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Disponibles</p>
                </div>
                <div className="p-3 rounded-xl text-center" style={{ background: N.base, boxShadow: insetSm }}>
                    <p className="text-2xl font-black" style={{ color }}>{formatCurrency(precioBase)}</p>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Precio</p>
                </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${porcentaje}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                />
            </div>
        </NeuCard>
    );
}

function VencimientosRow({ vencimientos }: { vencimientso: VencimientosItem }) {
    const nivelConfig = {
        VERDE: { color: '#22c55e', bg: 'rgba(34,197,94,0.08)', icon: CheckCircle2 },
        AMARILLO: { color: '#f59e0b', bg: 'rgba(245,158,11,0.08)', icon: Clock },
        ROJO: { color: '#ef4444', bg: 'rgba(239,68,68,0.08)', icon: AlertTriangle },
        CRITICO: { color: '#dc2626', bg: 'rgba(220,38,38,0.12)', icon: AlertTriangle },
        NO_INICIADO: { color: '#a855f7', bg: 'rgba(168,85,247,0.08)', icon: Clock },
        VENCIDO: { color: '#69738c', bg: 'rgba(105,115,140,0.08)', icon: Clock },
    }[vencimientos.nivel] || { color: N.text, bg: N.base, icon: Clock };

    const Icon = nivelConfig.icon;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between p-4 rounded-2xl"
            style={{ background: nivelConfig.bg }}
        >
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuXs }}>
                    <Icon className="w-5 h-5" style={{ color: nivelConfig.color }} />
                </div>
                <div>
                    <p className="font-bold" style={{ color: N.text }}>{vencimientos.clienteNombre}</p>
                    <p className="text-sm" style={{ color: N.textSub }}>{vencimientos.tipo}</p>
                </div>
            </div>
            <div className="text-right">
                <p className="font-bold" style={{ color: nivelConfig.color }}>{vencimientos.diasRestantes} días</p>
                <p className="text-sm" style={{ color: N.textSub }}>{formatCurrency(vencimientos.valor)}</p>
            </div>
        </motion.div>
    );
}

function ConductorCard({ conductor }: { conductor: { id: string; nombre: string; rol: string } }) {
    return (
        <NeuCard className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg" style={{ background: N.accent, color: '#fff' }}>
                {conductor.nombre.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1">
                <p className="font-bold" style={{ color: N.text }}>{conductor.nombre}</p>
                <p className="text-sm" style={{ color: N.textSub }}>{conductor.rol}</p>
            </div>
        </NeuCard>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function ProgramaDetallePage() {
    const params = useParams();
    const router = useRouter();
    const [programa, setPrograma] = useState<ProgramaDetail | null>(null);
    const [vencimientos, setVencimientos] = useState<VencimientosItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'info' | 'cupos' | 'vencimientos' | 'conductores'>('info');
    const [isEditing, setIsEditing] = useState(false);

    const programaId = params.id as string;

    useEffect(() => {
        if (programaId) {
            fetchPrograma();
            fetchVencimientos();
        }
    }, [programaId]);

    const fetchPrograma = async () => {
        try {
            const response = await fetch(`/api/vencimientos/programas/${programaId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setPrograma(result.data);
                }
            }
        } catch (error) {
            console.error('Error fetching programa:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchVencimientos = async () => {
        try {
            const response = await fetch(`/api/vencimientos/vencimientos?programaId=${programaId}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data) {
                    setVencimientos(result.data.slice(0, 5));
                }
            }
        } catch (error) {
            console.error('Error fetching vencimientos:', error);
        }
    };

    const handleEstadoChange = async (nuevoEstado: string) => {
        if (!programa) return;

        try {
            const response = await fetch(`/api/vencimientos/programas/${programaId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ estado: nuevoEstado }),
            });

            if (response.ok) {
                setPrograma({ ...programa, estado: nuevoEstado as any });
            }
        } catch (error) {
            console.error('Error changing estado:', error);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
                <NeuCard className="p-8 text-center">
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center"
                        style={{ background: N.base, boxShadow: neu }}
                    >
                        <Package className="w-6 h-6" style={{ color: N.accent }} />
                    </motion.div>
                    <p className="text-sm font-bold" style={{ color: N.textSub }}>Cargando programa...</p>
                </NeuCard>
            </div>
        );
    }

    if (!programa) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
                <NeuCard className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: N.textSub }} />
                    <p className="text-sm font-bold mb-4" style={{ color: N.textSub }}>Programa no encontrado</p>
                    <NeuButton onClick={() => router.push('/vencimientos')}>
                        <ArrowLeft className="w-5 h-5" /> Volver al dashboard
                    </NeuButton>
                </NeuCard>
            </div>
        );
    }

    const estadoColors: Record<string, { bg: string; color: string }> = {
        BORRADOR: { bg: 'rgba(105,115,140,0.12)', color: '#69738c' },
        ACTIVO: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e' },
        PAUSADO: { bg: 'rgba(245,158,11,0.12)', color: '#f59e0b' },
        ARCHIVADO: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444' },
    };

    const ocupacionPorcentaje = programa.revenuePotencial > 0
        ? Math.round((programa.revenueActual / programa.revenuePotencial) * 100)
        : 0;

    return (
        <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <NeuCard className="p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <NeuButton onClick={() => router.push('/vencimientos')}>
                            <ArrowLeft className="w-5 h-5" />
                        </NeuButton>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <h1 className="text-2xl font-black" style={{ color: N.text }}>{programa.nombre}</h1>
                                <span className="px-3 py-1 rounded-full text-xs font-bold" style={estadoColors[programa.estado]}>
                                    {programa.estado}
                                </span>
                            </div>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>
                                {programa.emiNombre} • {programa.codigo}
                            </p>
                        </div>
                        <NeuSelect
                            value={programa.estado}
                            onChange={handleEstadoChange}
                            options={[
                                { value: 'BORRADOR', label: 'Borrador' },
                                { value: 'ACTIVO', label: 'Activo' },
                                { value: 'PAUSADO', label: 'Pausado' },
                                { value: 'ARCHIVADO', label: 'Archivado' },
                            ]}
                        />
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-2 p-2 rounded-2xl" style={{ background: N.base, boxShadow: inset }}>
                        <TabButton
                            label="Información"
                            icon={Package}
                            active={activeTab === 'info'}
                            onClick={() => setActiveTab('info')}
                        />
                        <TabButton
                            label="Cupos"
                            icon={DollarSign}
                            active={activeTab === 'cupos'}
                            onClick={() => setActiveTab('cupos')}
                        />
                        <TabButton
                            label="Vencimientos"
                            icon={Calendar}
                            active={activeTab === 'vencimientos'}
                            onClick={() => setActiveTab('vencimientos')}
                        />
                        <TabButton
                            label="Conductores"
                            icon={Users}
                            active={activeTab === 'conductores'}
                            onClick={() => setActiveTab('conductores')}
                        />
                    </div>
                </NeuCard>

                {/* Content based on active tab */}
                {activeTab === 'info' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid gap-6 lg:grid-cols-3"
                    >
                        {/* Main Info */}
                        <div className="lg:col-span-2 space-y-6">
                            <NeuCard className="p-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                        <Package className="w-6 h-6" style={{ color: N.accent }} />
                                    </div>
                                    <h2 className="text-lg font-black" style={{ color: N.text }}>Detalles del Programa</h2>
                                </div>
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div className="p-4 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Horario</p>
                                        <p className="font-bold" style={{ color: N.text }}>{programa.horario.horaInicio} - {programa.horario.horaFin}</p>
                                    </div>
                                    <div className="p-4 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Días</p>
                                        <p className="font-bold" style={{ color: N.text }}>{formatDiasSemana(programa.horario.diasSemana)}</p>
                                    </div>
                                    <div className="sm:col-span-2 p-4 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Descripción</p>
                                        <p className="font-bold" style={{ color: N.text }}>{programa.descripcion || 'Sin descripción'}</p>
                                    </div>
                                </div>
                            </NeuCard>

                            {/* Revenue Stats */}
                            <div className="grid gap-4 sm:grid-cols-3">
                                <NeuCard className="p-5 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Revenue Actual</p>
                                    <p className="text-2xl font-black" style={{ color: '#22c55e' }}>{formatCurrency(programa.revenueActual)}</p>
                                </NeuCard>
                                <NeuCard className="p-5 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Revenue Potencial</p>
                                    <p className="text-2xl font-black" style={{ color: N.text }}>{formatCurrency(programa.revenuePotencial)}</p>
                                </NeuCard>
                                <NeuCard className="p-5 text-center">
                                    <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Ocupación</p>
                                    <p className="text-2xl font-black" style={{ color: N.accent }}>{ocupacionPorcentaje}%</p>
                                </NeuCard>
                            </div>

                            {/* Lista de Espera */}
                            {programa.listaEsperaCount > 0 && (
                                <NeuCard className="p-5 flex items-center gap-4" style={{ background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(251,146,60,0.08) 100%)' }}>
                                    <div className="p-4 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                        <Clock className="w-6 h-6" style={{ color: '#f59e0b' }} />
                                    </div>
                                    <div>
                                        <p className="font-bold" style={{ color: N.text }}>Lista de espera activa</p>
                                        <p className="text-sm" style={{ color: N.textSub }}>{programa.listaEsperaCount} interesados</p>
                                    </div>
                                </NeuCard>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <NeuCard className="p-6">
                                <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: N.textSub }}>Resumen</h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <span className="text-sm" style={{ color: N.textSub }}>Cupos Totales</span>
                                        <span className="font-bold" style={{ color: N.text }}>
                                            {programa.cupos.tipoA.total + programa.cupos.tipoB.total + programa.cupos.menciones.total}
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <span className="text-sm" style={{ color: N.textSub }}>Disponibles</span>
                                        <span className="font-bold" style={{ color: '#22c55e' }}>
                                            {programa.cupos.tipoA.disponibles + programa.cupos.tipoB.disponibles + programa.cupos.menciones.disponibles}
                                        </span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <span className="text-sm" style={{ color: N.textSub }}>Conductores</span>
                                        <span className="font-bold" style={{ color: N.text }}>{programa.conductores.length}</span>
                                    </div>
                                    <div className="flex justify-between p-3 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <span className="text-sm" style={{ color: N.textSub }}>Vencimientos</span>
                                        <span className="font-bold" style={{ color: N.text }}>{vencimientos.length}</span>
                                    </div>
                                </div>
                            </NeuCard>

                            <NeuCard className="p-6">
                                <h3 className="text-sm font-black uppercase tracking-wider mb-4" style={{ color: N.textSub }}>Vigencia</h3>
                                <div className="space-y-3">
                                    <div className="p-4 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Desde</p>
                                        <p className="font-bold" style={{ color: N.text }}>{programa.vigenciaDesde || 'No definido'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl" style={{ background: N.base, boxShadow: insetSm }}>
                                        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>Hasta</p>
                                        <p className="font-bold" style={{ color: N.text }}>{programa.vigenciaHasta || 'No definido'}</p>
                                    </div>
                                </div>
                            </NeuCard>
                        </div>
                    </motion.div>
                )}

                {activeTab === 'cupos' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <DollarSign className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <h2 className="text-xl font-black" style={{ color: N.text }}>Cupos Comerciales</h2>
                            </div>
                        </div>

                        <CupoCard
                            titulo="Cupos Tipo A (Premium)"
                            total={programa.cupos.tipoA.total}
                            ocupados={programa.cupos.tipoA.ocupados}
                            disponibles={programa.cupos.tipoA.disponibles}
                            precioBase={programa.cupos.tipoA.precioBase}
                            color="#3b82f6"
                        />
                        <CupoCard
                            titulo="Cupos Tipo B (Standard)"
                            total={programa.cupos.tipoB.total}
                            ocupados={programa.cupos.tipoB.ocupados}
                            disponibles={programa.cupos.tipoB.disponibles}
                            precioBase={programa.cupos.tipoB.precioBase}
                            color="#22c55e"
                        />
                        <CupoCard
                            titulo="Menciones"
                            total={programa.cupos.menciones.total}
                            ocupados={programa.cupos.menciones.ocupados}
                            disponibles={programa.cupos.menciones.disponibles}
                            precioBase={programa.cupos.menciones.precioBase}
                            color="#a855f7"
                        />
                    </motion.div>
                )}

                {activeTab === 'vencimientos' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Calendar className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <h2 className="text-xl font-black" style={{ color: N.text }}>Vencimientos Recientes</h2>
                            </div>
                        </div>

                        {vencimientos.length === 0 ? (
                            <NeuCard className="p-12 text-center">
                                <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: '#22c55e' }} />
                                <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay vencimientos para este programa</p>
                            </NeuCard>
                        ) : (
                            <div className="space-y-3">
                                {vencimientos.map((venc) => (
                                    <VencimientosRow key={venc.id} vencimientos={venc} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {activeTab === 'conductores' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                    <Users className="w-6 h-6" style={{ color: N.accent }} />
                                </div>
                                <h2 className="text-xl font-black" style={{ color: N.text }}>Conductores</h2>
                            </div>
                        </div>

                        {programa.conductores.length === 0 ? (
                            <NeuCard className="p-12 text-center">
                                <Users className="w-12 h-12 mx-auto mb-4" style={{ color: N.textSub }} />
                                <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay conductores asignados</p>
                            </NeuCard>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {programa.conductores.map((conductor) => (
                                    <ConductorCard key={conductor.id} conductor={conductor} />
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Footer */}
                <div className="text-center pb-6">
                    <p className="text-xs font-medium" style={{ color: N.textSub }}>
                        📅 Detalle de Programa - SILEXAR PULSE TIER 0
                    </p>
                </div>
            </div>
        </div>
    );
}