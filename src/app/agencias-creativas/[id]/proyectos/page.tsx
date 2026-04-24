'use client';

/**
 * 🎨 SILEXAR PULSE - Proyectos de Agencia Creativa
 * 
 * @description Gestión de proyectos creativos por agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Briefcase,
    Clock,
    CheckCircle,
    AlertCircle,
    Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ProyectoCreativo {
    id: string;
    agenciaId: string;
    nombre: string;
    descripcion: string;
    cliente: string;
    estado: 'brief' | 'produccion' | 'postproduccion' | 'entregado';
    fechaInicio: string;
    fechaEntrega: string;
    presupuesto: number;
    calidadScore: number;
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

const NeuCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`rounded-3xl p-6 ${className}`}
        style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px 16px ${N.light}` }}
    >
        {children}
    </div>
);

const NeuButton = ({
    children,
    onClick,
    variant = 'primary',
    className = '',
    disabled = false
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary';
    className?: string;
    disabled?: boolean;
}) => {
    const colors = {
        primary: { bg: N.accent, text: '#ffffff' },
        secondary: { bg: N.base, text: N.text },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 flex items-center gap-2 ${className}`}
            style={{
                background: colors[variant].bg,
                color: colors[variant].text,
                boxShadow: disabled ? 'none' : `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}`,
                opacity: disabled ? 0.6 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            {children}
        </button>
    );
};

const StatusBadge = ({ estado }: { estado: string }) => {
    const config = {
        brief: { color: '#8b5cf6', icon: Clock, label: 'Brief' },
        produccion: { color: '#f59e0b', icon: Briefcase, label: 'Producción' },
        postproduccion: { color: '#06b6d4', icon: AlertCircle, label: 'Post-Producción' },
        entregado: { color: '#10b981', icon: CheckCircle, label: 'Entregado' },
    };

    const { color, icon: Icon, label } = config[estado as keyof typeof config] || config.brief;

    return (
        <span
            className="px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1"
            style={{ background: color }}
        >
            <Icon className="w-3 h-3" /> {label}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_PROYECTOS: ProyectoCreativo[] = [
    {
        id: 'proj-001',
        agenciaId: 'agc-001',
        nombre: 'Campaña Black Friday',
        descripcion: 'Spot de 30s para TV y digital',
        cliente: 'Ripley',
        estado: 'produccion',
        fechaInicio: '2025-04-01',
        fechaEntrega: '2025-04-20',
        presupuesto: 12000000,
        calidadScore: 0,
    },
    {
        id: 'proj-002',
        agenciaId: 'agc-001',
        nombre: 'Branding Banco Chile',
        descripcion: 'Renovación de identidad visual',
        cliente: 'Banco Chile',
        estado: 'entregado',
        fechaInicio: '2025-01-15',
        fechaEntrega: '2025-03-15',
        presupuesto: 25000000,
        calidadScore: 9.2,
    },
    {
        id: 'proj-003',
        agenciaId: 'agc-001',
        nombre: 'Social Media Falabella',
        descripcion: 'Contenido para redes sociales',
        cliente: 'Falabella',
        estado: 'brief',
        fechaInicio: '2025-04-18',
        fechaEntrega: '2025-05-01',
        presupuesto: 5000000,
        calidadScore: 0,
    },
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE PROYECTOS
// ═══════════════════════════════════════════════════════════════

export default function AgenciaProyectosPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaInfo | null>(null);
    const [proyectos, setProyectos] = useState<ProyectoCreativo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            // Fetch agencia info
            const response = await fetch(`/api/agencias-creativas?id=${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                const agenciaData = Array.isArray(data.data)
                    ? data.data.find((a: AgenciaInfo) => a.id === id)
                    : data.data;
                setAgencia(agenciaData);
            }

            // Filter mock proyectos for this agencia
            const proyectosAgencia = MOCK_PROYECTOS.filter(p => p.agenciaId === id);
            setProyectos(proyectosAgencia);
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

    const getEstadoCount = (estado: string) => {
        return proyectos.filter(p => p.estado === estado).length;
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
                <div className="flex items-center justify-between">
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
                                Proyectos
                            </h1>
                            <p className="text-sm" style={{ color: N.textSub }}>
                                {agencia?.codigo} • {agencia?.nombreFantasia || agencia?.razonSocial}
                            </p>
                        </div>
                    </div>

                    <NeuButton variant="primary" onClick={() => alert('Crear proyecto - En desarrollo')}>
                        <Plus className="w-4 h-4" /> Nuevo Proyecto
                    </NeuButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#8b5cf6' }}>{getEstadoCount('brief')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Brief</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#f59e0b' }}>{getEstadoCount('produccion')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Producción</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#06b6d4' }}>{getEstadoCount('postproduccion')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Post-Producción</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#10b981' }}>{getEstadoCount('entregado')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Entregados</div>
                    </NeuCard>
                </div>

                {/* Lista de Proyectos */}
                <NeuCard>
                    <h2 className="text-lg font-bold mb-4" style={{ color: N.text }}>
                        Proyectos ({proyectos.length})
                    </h2>

                    {proyectos.length === 0 ? (
                        <div className="text-center py-12">
                            <Briefcase className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
                            <p className="text-lg font-medium" style={{ color: N.text }}>
                                Sin proyectos registrados
                            </p>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>
                                Comienza creando un nuevo proyecto para esta agencia
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {proyectos.map((proyecto) => (
                                <div
                                    key={proyecto.id}
                                    className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                    style={{
                                        background: N.light,
                                        boxShadow: `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`
                                    }}
                                    onClick={() => alert(`Ver proyecto: ${proyecto.nombre}`)}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <h3 className="font-bold" style={{ color: N.text }}>{proyecto.nombre}</h3>
                                        <StatusBadge estado={proyecto.estado} />
                                    </div>
                                    <p className="text-sm mb-3" style={{ color: N.textSub }}>{proyecto.descripcion}</p>
                                    <div className="flex items-center justify-between text-sm">
                                        <div>
                                            <span style={{ color: N.textSub }}>Cliente: </span>
                                            <span className="font-medium" style={{ color: N.text }}>{proyecto.cliente}</span>
                                        </div>
                                        <div>
                                            <span style={{ color: N.textSub }}>Presupuesto: </span>
                                            <span className="font-medium" style={{ color: N.text }}>
                                                ${(proyecto.presupuesto / 1000000).toFixed(1)}M
                                            </span>
                                        </div>
                                        <div>
                                            <span style={{ color: N.textSub }}>Entrega: </span>
                                            <span className="font-medium" style={{ color: N.text }}>
                                                {new Date(proyecto.fechaEntrega).toLocaleDateString('es-CL')}
                                            </span>
                                        </div>
                                    </div>
                                    {proyecto.calidadScore > 0 && (
                                        <div className="mt-2 pt-2 border-t" style={{ borderColor: N.dark }}>
                                            <span style={{ color: N.textSub }}>Score Calidad: </span>
                                            <span className="font-bold" style={{ color: '#10b981' }}>{proyecto.calidadScore}/10</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
