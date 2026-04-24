'use client';

/**
 * 🎨 SILEXAR PULSE - Briefs de Agencia Creativa
 * 
 * @description Gestión de briefs/solicitudes de trabajo
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    FileText,
    Clock,
    Send,
    CheckCircle,
    Loader2
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface Brief {
    id: string;
    agenciaId: string;
    titulo: string;
    descripcion: string;
    cliente: string;
    campana: string;
    tipoTrabajo: string;
    estado: 'borrador' | 'enviado' | 'asignado' | 'enProgreso' | 'completado';
    fechaCreacion: string;
    fechaEnvio: string | null;
    presupuesto: number;
    prioridad: 'baja' | 'media' | 'alta' | 'urgente';
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
        borrador: { color: '#64748b', icon: FileText, label: 'Borrador' },
        enviado: { color: '#8b5cf6', icon: Send, label: 'Enviado' },
        asignado: { color: '#06b6d4', icon: CheckCircle, label: 'Asignado' },
        enProgreso: { color: '#f59e0b', icon: Clock, label: 'En Progreso' },
        completado: { color: '#10b981', icon: CheckCircle, label: 'Completado' },
    };

    const { color, icon: Icon, label } = config[estado as keyof typeof config] || config.borrador;

    return (
        <span
            className="px-3 py-1 rounded-xl text-xs font-bold text-white flex items-center gap-1"
            style={{ background: color }}
        >
            <Icon className="w-3 h-3" /> {label}
        </span>
    );
};

const PrioridadBadge = ({ prioridad }: { prioridad: string }) => {
    const colors = {
        baja: '#64748b',
        media: '#06b6d4',
        alta: '#f59e0b',
        urgente: '#ef4444',
    };

    return (
        <span
            className="px-2 py-1 rounded-lg text-xs font-bold text-white"
            style={{ background: colors[prioridad as keyof typeof colors] || colors.media }}
        >
            {prioridad.toUpperCase()}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_BRIEFS: Brief[] = [
    {
        id: 'brief-001',
        agenciaId: 'agc-001',
        titulo: 'Spot TV Banco Chile - Campaña Sueños',
        descripcion: 'Comercial de 30 segundos para TV abierta y cable',
        cliente: 'Banco Chile',
        campana: 'Campaña Sueños 2025',
        tipoTrabajo: 'Video',
        estado: 'enProgreso',
        fechaCreacion: '2025-04-01',
        fechaEnvio: '2025-04-02',
        presupuesto: 15000000,
        prioridad: 'alta',
    },
    {
        id: 'brief-002',
        agenciaId: 'agc-001',
        titulo: 'Contenido Social Media Ripley',
        descripcion: '15 posts para Instagram y Facebook',
        cliente: 'Ripley',
        campana: 'Black Friday 2025',
        tipoTrabajo: 'Digital',
        estado: 'asignado',
        fechaCreacion: '2025-04-10',
        fechaEnvio: '2025-04-11',
        presupuesto: 5000000,
        prioridad: 'media',
    },
    {
        id: 'brief-003',
        agenciaId: 'agc-001',
        titulo: 'Radio Spot Entel',
        descripcion: 'Spot de 30s y 15s para radio nacional',
        cliente: 'Entel',
        campana: 'Verano 2025',
        tipoTrabajo: 'Audio',
        estado: 'completado',
        fechaCreacion: '2025-03-01',
        fechaEnvio: '2025-03-02',
        presupuesto: 3000000,
        prioridad: 'baja',
    },
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE BRIEFS
// ═══════════════════════════════════════════════════════════════

export default function AgenciaBriefsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaInfo | null>(null);
    const [briefs, setBriefs] = useState<Brief[]>([]);
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

            // Filter mock briefs for this agencia
            const briefsAgencia = MOCK_BRIEFS.filter(b => b.agenciaId === id);
            setBriefs(briefsAgencia);
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
        return briefs.filter(b => b.estado === estado).length;
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
                                Briefs
                            </h1>
                            <p className="text-sm" style={{ color: N.textSub }}>
                                {agencia?.codigo} • {agencia?.nombreFantasia || agencia?.razonSocial}
                            </p>
                        </div>
                    </div>

                    <NeuButton variant="primary" onClick={() => alert('Crear brief - En desarrollo')}>
                        <Plus className="w-4 h-4" /> Nuevo Brief
                    </NeuButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 md:grid-cols-5 gap-4">
                    <NeuCard className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#64748b' }}>{getEstadoCount('borrador')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Borrador</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#8b5cf6' }}>{getEstadoCount('enviado')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Enviados</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#f59e0b' }}>{getEstadoCount('enProgreso')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>En Progreso</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#06b6d4' }}>{getEstadoCount('asignado')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Asignados</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-2xl font-black" style={{ color: '#10b981' }}>{getEstadoCount('completado')}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Completados</div>
                    </NeuCard>
                </div>

                {/* Lista de Briefs */}
                <NeuCard>
                    <h2 className="text-lg font-bold mb-4" style={{ color: N.text }}>
                        Solicitudes de Trabajo ({briefs.length})
                    </h2>

                    {briefs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
                            <p className="text-lg font-medium" style={{ color: N.text }}>
                                Sin briefs registrados
                            </p>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>
                                Crea un nuevo brief para solicitar trabajo a esta agencia
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {briefs.map((brief) => (
                                <div
                                    key={brief.id}
                                    className="p-4 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                                    style={{
                                        background: N.light,
                                        boxShadow: `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}`
                                    }}
                                    onClick={() => alert(`Ver brief: ${brief.titulo}`)}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex-1">
                                            <h3 className="font-bold" style={{ color: N.text }}>{brief.titulo}</h3>
                                            <p className="text-sm" style={{ color: N.textSub }}>{brief.descripcion}</p>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <PrioridadBadge prioridad={brief.prioridad} />
                                            <StatusBadge estado={brief.estado} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3 pt-3 border-t" style={{ borderColor: N.dark }}>
                                        <div>
                                            <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Cliente</span>
                                            <p className="text-sm font-medium" style={{ color: N.text }}>{brief.cliente}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Campaña</span>
                                            <p className="text-sm font-medium" style={{ color: N.text }}>{brief.campana}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Tipo</span>
                                            <p className="text-sm font-medium" style={{ color: N.text }}>{brief.tipoTrabajo}</p>
                                        </div>
                                        <div>
                                            <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Presupuesto</span>
                                            <p className="text-sm font-medium" style={{ color: N.text }}>
                                                ${(brief.presupuesto / 1000000).toFixed(1)}M
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-3 pt-2 border-t" style={{ borderColor: N.dark }}>
                                        <div className="text-xs" style={{ color: N.textSub }}>
                                            Creado: {new Date(brief.fechaCreacion).toLocaleDateString('es-CL')}
                                        </div>
                                        {brief.fechaEnvio && (
                                            <div className="text-xs" style={{ color: N.textSub }}>
                                                Enviado: {new Date(brief.fechaEnvio).toLocaleDateString('es-CL')}
                                            </div>
                                        )}
                                    </div>
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
