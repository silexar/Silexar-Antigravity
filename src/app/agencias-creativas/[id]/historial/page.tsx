'use client';

/**
 * 🎨 SILEXAR PULSE - Historial de Agencia Creativa
 * 
 * @description Registro histórico de colaboraciones y actividades
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Clock,
    CheckCircle,
    AlertCircle,
    TrendingUp,
    DollarSign,
    Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface HistorialItem {
    id: string;
    agenciaId: string;
    fecha: string;
    tipo: 'proyecto' | 'comision' | 'evaluacion' | 'contacto' | 'nota';
    titulo: string;
    descripcion: string;
    detalle?: string;
    monto?: number;
    score?: number;
}

interface AgenciaInfo {
    id: string;
    codigo: string;
    razonSocial: string;
    nombreFantasia: string | null;
}

// ═══════════════════════════════════════════════════════════════
// DESIGN TOKENS (Neuromorphic)
// ═══════════════════════════════════════════════════════════════

const N = {
    base: '#dfeaff',
    dark: '#bec8de',
    light: '#ffffff',
    accent: '#6888ff',
    text: '#69738c',
    textSub: '#9aa3b8',
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuCard = ({ children, className = '' }: {
    children: React.ReactNode;
    className?: string;
}) => (
    <div
        className={`rounded-3xl p-6 ${className}`}
        style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px 16px ${N.light}` }}
    >
        {children}
    </div>
);

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_HISTORIAL: HistorialItem[] = [
    {
        id: 'hist-001',
        agenciaId: 'agc-001',
        fecha: '2025-04-18',
        tipo: 'proyecto',
        titulo: 'Campaña Black Friday - Ripley',
        descripcion: 'Entrega de materiales finales aprobada',
        detalle: 'Spot 30s + 5 adaptaciones digitales',
        monto: 12000000,
    },
    {
        id: 'hist-002',
        agenciaId: 'agc-001',
        fecha: '2025-04-15',
        tipo: 'evaluacion',
        titulo: 'Evaluación de Calidad - Spot Banco Chile',
        descripcion: 'Calificación otorgada: 9.4/10',
        score: 9.4,
    },
    {
        id: 'hist-003',
        agenciaId: 'agc-001',
        fecha: '2025-04-10',
        tipo: 'comision',
        titulo: 'Pago de Comisión - Q1 2025',
        descripcion: 'Comisión del 15% sobre facturación',
        monto: 6750000,
    },
    {
        id: 'hist-004',
        agenciaId: 'agc-001',
        fecha: '2025-04-05',
        tipo: 'contacto',
        titulo: 'Reunión de Kickoff',
        descripcion: 'Cliente: Banco Chile - Briefing campaña 2025',
    },
    {
        id: 'hist-005',
        agenciaId: 'agc-001',
        fecha: '2025-03-20',
        tipo: 'proyecto',
        titulo: 'Branding Entel 5G - Entregado',
        descripcion: 'Proyecto completado y aprobado',
        detalle: 'Manual de marca + adaptaciones',
        monto: 8500000,
    },
    {
        id: 'hist-006',
        agenciaId: 'agc-001',
        fecha: '2025-03-15',
        tipo: 'evaluacion',
        titulo: 'Evaluación de Calidad - Branding Entel',
        descripcion: 'Calificación otorgada: 8.8/10',
        score: 8.8,
    },
    {
        id: 'hist-007',
        agenciaId: 'agc-001',
        fecha: '2025-02-28',
        tipo: 'nota',
        titulo: 'Premio Effie Awards',
        descripcion: 'Branding Entel 5G recibió Effie Awards',
    },
    {
        id: 'hist-008',
        agenciaId: 'agc-001',
        fecha: '2025-01-15',
        tipo: 'comision',
        titulo: 'Pago de Comisión - Q4 2024',
        descripcion: 'Comisión del 15% sobre facturación',
        monto: 9200000,
    },
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE HISTORIAL
// ═══════════════════════════════════════════════════════════════

export default function AgenciaHistorialPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaInfo | null>(null);
    const [historial, setHistorial] = useState<HistorialItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await fetch(`/api/agencias-creativas?id=${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                const agenciaData = Array.isArray(data.data)
                    ? data.data.find((a: AgenciaInfo) => a.id === id)
                    : data.data;
                setAgencia(agenciaData);
            }

            const historialAgencia = MOCK_HISTORIAL.filter(h => h.agenciaId === id);
            setHistorial(historialAgencia);
        } catch (err) {
            console.error('Error fetching:', err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchData();
        }
    }, [id, fetchData]);

    const getStats = () => {
        const totalProyectos = historial.filter(h => h.tipo === 'proyecto').length;
        const facturacionTotal = historial
            .filter(h => h.tipo === 'comision' && h.monto)
            .reduce((sum, h) => sum + (h.monto || 0), 0);
        const evaluacionPromedio = historial.filter(h => h.tipo === 'evaluacion' && h.score)
            .reduce((sum, h, _, arr) => sum + ((h.score || 0) / arr.length), 0);

        return {
            totalProyectos,
            facturacionTotal,
            evaluacionPromedio: evaluacionPromedio.toFixed(1)
        };
    };

    const stats = getStats();

    const getTipoIcon = (tipo: string) => {
        const config = {
            proyecto: { icon: CheckCircle, color: '#10b981' },
            comision: { icon: DollarSign, color: '#f59e0b' },
            evaluacion: { icon: TrendingUp, color: '#8b5cf6' },
            contacto: { icon: Clock, color: '#06b6d4' },
            nota: { icon: AlertCircle, color: '#64748b' },
        };

        return config[tipo as keyof typeof config] || config.nota;
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
                <div className="max-w-5xl mx-auto">
                    <div className="flex items-center justify-center h-64">
                        <Loader2 className="w-8 h-8 animate-spin" style={{ color: N.accent }} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-6 lg:p-8"
            style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}
        >
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push(`/agencias-creativas/${id}`)}
                        className="p-3 rounded-2xl transition-all duration-200"
                        style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
                    >
                        <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-black" style={{ color: N.text }}>
                            Historial
                        </h1>
                        <p className="text-sm" style={{ color: N.textSub }}>
                            {agencia?.codigo} • {agencia?.nombreFantasia || agencia?.razonSocial}
                        </p>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#10b981' }}>{stats.totalProyectos}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Proyectos</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#f59e0b' }}>
                            ${(stats.facturacionTotal / 1000000).toFixed(1)}M
                        </div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Comisiones</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#8b5cf6' }}>{stats.evaluacionPromedio}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Eval. Prom.</div>
                    </NeuCard>
                </div>

                {/* Timeline */}
                <NeuCard>
                    <h2 className="text-lg font-bold mb-6" style={{ color: N.text }}>
                        Registro de Actividad
                    </h2>

                    <div className="space-y-4">
                        {historial.map((item, index) => {
                            const { icon: Icon, color } = getTipoIcon(item.tipo);
                            const isLast = index === historial.length - 1;

                            return (
                                <div key={item.id} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center"
                                            style={{ background: color }}
                                        >
                                            <Icon className="w-5 h-5 text-white" />
                                        </div>
                                        {!isLast && (
                                            <div
                                                className="w-0.5 flex-1 my-1 rounded-full"
                                                style={{ background: N.dark, minHeight: '40px' }}
                                            />
                                        )}
                                    </div>

                                    <div className="flex-1 pb-6">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="font-bold" style={{ color: N.text }}>{item.titulo}</h3>
                                                <p className="text-sm" style={{ color: N.textSub }}>{item.descripcion}</p>
                                                {item.detalle && (
                                                    <p className="text-xs mt-1" style={{ color: N.textSub }}>{item.detalle}</p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xs" style={{ color: N.textSub }}>
                                                    {new Date(item.fecha).toLocaleDateString('es-CL')}
                                                </div>
                                                {item.monto && (
                                                    <div className="text-sm font-bold" style={{ color: '#f59e0b' }}>
                                                        ${(item.monto / 1000000).toFixed(1)}M
                                                    </div>
                                                )}
                                                {item.score && (
                                                    <div className="text-sm font-bold" style={{ color: '#10b981' }}>
                                                        {item.score}/10
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </NeuCard>

                {/* Footer */}
                <div className="text-center pt-4">
                    <p className="text-sm" style={{ color: N.textSub }}>
                        🎨 Agencias Creativas - SILEXAR PULSE TIER 0
                    </p>
                </div>
            </div>
        </div>
    );
}
