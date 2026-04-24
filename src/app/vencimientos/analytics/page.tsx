/**
 * 📊 SILEXAR PULSE - Vencimientos Analytics Dashboard TIER 0
 *
 * @description Analytics dashboard with charts and KPIs for vencimientos.
 *              Paleta oficial: base #dfeaff | dark #bec8de | light #ffffff | accent #6888ff
 *              TIER 0 ENTERPRISE - Fortune 10 Ready
 *
 * @version 2026.1.0
 * @tier TIER_0_ENTERPRISE
 */

'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Calendar,
    Package,
    DollarSign,
    Clock,
    AlertTriangle,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Radio
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

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AnalyticsData {
    resumen: {
        totalProgramas: number;
        programasActivos: number;
        totalCupos: number;
        cuposOcupados: number;
        ocupacionPorcentaje: number;
        revenueTotal: number;
        revenuePotencial: number;
        vencimientosProximos: number;
        alertasPendientes: number;
    };
    porEmisora: Array<{
        emiId: string;
        emiNombre: string;
        programas: number;
        ocupacion: number;
        revenue: number;
    }>;
    topProgramas: Array<{
        id: string;
        nombre: string;
        emiNombre: string;
        ocupacion: number;
        revenue: number;
    }>;
    vencimientosPipeline: {
        activos: number;
        porVencer7dias: number;
        porVencer30dias: number;
        vencidos: number;
    };
    alertasPorTipo: Array<{
        tipo: string;
        count: number;
    }>;
}

interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trend?: { value: number; positive: boolean };
    icon: React.ElementType;
    color: string;
}

interface PipelineCardProps {
    label: string;
    value: number;
    color: string;
    bgColor: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES DE ANALYTICS
// ═══════════════════════════════════════════════════════════════

function KPICard({ title, value, subtitle, trend, icon: Icon, color }: KPICardProps) {
    return (
        <NeuCard className="p-6 relative overflow-hidden">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{title}</p>
                    <h3 className="text-3xl font-black mt-1" style={{ color: N.text }}>{value}</h3>
                    {subtitle && <p className="text-sm mt-1" style={{ color: N.textSub }}>{subtitle}</p>}
                    {trend && (
                        <div className="flex items-center gap-1 mt-2 text-sm">
                            {trend.positive ? (
                                <ArrowUpRight className="w-4 h-4" style={{ color: '#22c55e' }} />
                            ) : (
                                <ArrowDownRight className="w-4 h-4" style={{ color: '#ef4444' }} />
                            )}
                            <span style={{ color: trend.positive ? '#22c55e' : '#ef4444' }}>{trend.value >= 0 ? '+' : ''}{trend.value}%</span>
                            <span style={{ color: N.textSub }}>vs periodo anterior</span>
                        </div>
                    )}
                </div>
                <div className="p-3 rounded-2xl" style={{ background: N.base, boxShadow: neuSm }}>
                    <Icon className="w-6 h-6" style={{ color }} />
                </div>
            </div>
        </NeuCard>
    );
}

function PipelineCard({ label, value, color, bgColor }: PipelineCardProps) {
    return (
        <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-5 rounded-2xl text-center"
            style={{ background: N.base, boxShadow: neuSm }}
        >
            <div className={`w-14 h-14 mx-auto rounded-full ${bgColor} flex items-center justify-center mb-3`} style={{ boxShadow: insetSm }}>
                <span className="text-xl font-black text-white">{value}</span>
            </div>
            <p className="text-sm font-bold" style={{ color }}>{label}</p>
        </motion.div>
    );
}

function RevenueBar({ emiNombre, revenue, maxRevenue, color, index }: {
    emiNombre: string;
    revenue: number;
    maxRevenue: number;
    color: string;
    index: number;
}) {
    const percentage = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;
    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center gap-4 py-3"
        >
            <div className="w-32 text-sm font-bold truncate" style={{ color: N.text }}>{emiNombre}</div>
            <div className="flex-1 h-8 rounded-xl overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="h-full rounded-xl"
                    style={{ background: color }}
                />
            </div>
            <div className="w-24 text-sm font-bold text-right" style={{ color: color }}>
                {formatCurrency(revenue)}
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatCurrency(value: number): string {
    if (value >= 1000000) {
        return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
        return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VencimientosAnalyticsPage() {
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState('30d');

    useEffect(() => {
        fetchAnalytics();
    }, [dateRange]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/vencimientos/analytics?range=${dateRange}`);
            const result = await response.json();

            if (result.success && result.data) {
                setData(result.data);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
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
                        <BarChart3 className="w-6 h-6" style={{ color: N.accent }} />
                    </motion.div>
                    <p className="text-sm font-bold" style={{ color: N.textSub }}>Cargando analytics...</p>
                </NeuCard>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: N.base }}>
                <NeuCard className="p-8 text-center">
                    <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: N.textSub }} />
                    <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay datos disponibles</p>
                </NeuCard>
            </div>
        );
    }

    const maxRevenue = Math.max(...data.porEmisora.map(e => e.revenue), 1);
    const colors = ['#6888ff', '#22c55e', '#f59e0b', '#a855f7', '#ef4444', '#3b82f6'];

    return (
        <div className="min-h-screen p-6 lg:p-8" style={{ background: N.base }}>
            <div className="max-w-[1600px] mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="p-4 rounded-2xl" style={{ background: N.base, boxShadow: neu }}>
                            <BarChart3 className="w-8 h-8" style={{ color: N.accent }} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black" style={{ color: N.text }}>Analytics de Vencimientos</h1>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>Dashboard de métricas y rendimiento</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <NeuSelect
                            value={dateRange}
                            onChange={setDateRange}
                            options={[
                                { value: '7d', label: 'Últimos 7 días' },
                                { value: '30d', label: 'Últimos 30 días' },
                                { value: '90d', label: 'Últimos 90 días' },
                                { value: 'anio', label: 'Año completo' },
                            ]}
                        />
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                    <KPICard
                        title="Total Programas"
                        value={data.resumen.totalProgramas}
                        subtitle={`${data.resumen.programasActivos} activos`}
                        trend={{ value: 12, positive: true }}
                        icon={Package}
                        color={N.accent}
                    />
                    <KPICard
                        title="Ocupación Cupos"
                        value={`${data.resumen.ocupacionPorcentaje}%`}
                        subtitle={`${data.resumen.cuposOcupados}/${data.resumen.totalCupos} cupos`}
                        trend={{ value: 5, positive: true }}
                        icon={CheckCircle2}
                        color="#22c55e"
                    />
                    <KPICard
                        title="Revenue Total"
                        value={formatCurrency(data.resumen.revenueTotal)}
                        subtitle={`Potencial: ${formatCurrency(data.resumen.revenuePotencial)}`}
                        trend={{ value: 8, positive: true }}
                        icon={DollarSign}
                        color="#f59e0b"
                    />
                    <KPICard
                        title="Vencimientos"
                        value={data.resumen.vencimientosProximos}
                        subtitle={`${data.resumen.alertasPendientes} alertas`}
                        trend={{ value: -3, positive: false }}
                        icon={Calendar}
                        color="#ef4444"
                    />
                </div>

                {/* Charts Row */}
                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Revenue by Emisora Chart */}
                    <NeuCard className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                <DollarSign className="w-6 h-6" style={{ color: N.accent }} />
                            </div>
                            <h2 className="text-lg font-black" style={{ color: N.text }}>Revenue por Emisora</h2>
                        </div>
                        <div className="space-y-1">
                            {data.porEmisora.length > 0 ? (
                                data.porEmisora.map((emisora, index) => (
                                    <RevenueBar
                                        key={emisora.emiId}
                                        emiNombre={emisora.emiNombre}
                                        revenue={emisora.revenue}
                                        maxRevenue={maxRevenue}
                                        color={colors[index % colors.length]}
                                        index={index}
                                    />
                                ))
                            ) : (
                                <div className="p-8 text-center">
                                    <p className="text-sm font-bold" style={{ color: N.textSub }}>No hay datos disponibles</p>
                                </div>
                            )}
                        </div>
                    </NeuCard>

                    {/* Vencimientos Pipeline */}
                    <NeuCard className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                                <Clock className="w-6 h-6" style={{ color: N.accent }} />
                            </div>
                            <h2 className="text-lg font-black" style={{ color: N.text }}>Pipeline de Vencimientos</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <PipelineCard
                                label="Activos"
                                value={data.vencimientosPipeline.activos}
                                color="#22c55e"
                                bgColor="bg-green-500"
                            />
                            <PipelineCard
                                label="Por Vencer (7d)"
                                value={data.vencimientosPipeline.porVencer7dias}
                                color="#f59e0b"
                                bgColor="bg-yellow-500"
                            />
                            <PipelineCard
                                label="Por Vencer (30d)"
                                value={data.vencimientosPipeline.porVencer30dias}
                                color="#fb923c"
                                bgColor="bg-orange-500"
                            />
                            <PipelineCard
                                label="Vencidos"
                                value={data.vencimientosPipeline.vencidos}
                                color="#ef4444"
                                bgColor="bg-red-500"
                            />
                        </div>
                    </NeuCard>
                </div>

                {/* Top Programas Table */}
                <NeuCard className="p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-xl" style={{ background: N.base, boxShadow: neuSm }}>
                            <Radio className="w-6 h-6" style={{ color: N.accent }} />
                        </div>
                        <h2 className="text-lg font-black" style={{ color: N.text }}>Top 10 Programas</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <div className="min-w-full">
                            {/* Header */}
                            <div className="grid grid-cols-12 gap-4 px-4 py-3" style={{ background: N.base, boxShadow: inset }}>
                                <div className="col-span-1 text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>#</div>
                                <div className="col-span-4 text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Programa</div>
                                <div className="col-span-3 text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Emisora</div>
                                <div className="col-span-2 text-right text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Ocupación</div>
                                <div className="col-span-2 text-right text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>Revenue</div>
                            </div>
                            {/* Rows */}
                            {data.topProgramas.map((programa, index) => (
                                <motion.div
                                    key={programa.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="grid grid-cols-12 gap-4 px-4 py-4 items-center"
                                    style={{
                                        borderBottom: `1px solid ${N.dark}`
                                    }}
                                >
                                    <div className="col-span-1 font-bold" style={{ color: N.text }}>{index + 1}</div>
                                    <div className="col-span-4 font-bold truncate" style={{ color: N.text }}>{programa.nombre}</div>
                                    <div className="col-span-3 text-sm truncate" style={{ color: N.textSub }}>{programa.emiNombre}</div>
                                    <div className="col-span-2 flex items-center justify-end gap-2">
                                        <div className="w-16 h-2 rounded-full overflow-hidden" style={{ background: N.base, boxShadow: inset }}>
                                            <div
                                                className="h-full rounded-full"
                                                style={{
                                                    width: `${programa.ocupacion}%`,
                                                    background: programa.ocupacion >= 90 ? '#22c55e' : programa.ocupacion >= 70 ? '#f59e0b' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                        <span className="text-sm font-bold" style={{ color: N.text }}>{programa.ocupacion}%</span>
                                    </div>
                                    <div className="col-span-2 text-right font-bold" style={{ color: N.accent }}>
                                        {formatCurrency(programa.revenue)}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </NeuCard>

                {/* Footer */}
                <div className="text-center pb-6">
                    <p className="text-xs font-medium" style={{ color: N.textSub }}>
                        📊 Analytics de Vencimientos - SILEXAR PULSE TIER 0
                    </p>
                </div>
            </div>
        </div>
    );
}