'use client';

/**
 * 🎨 SILEXAR PULSE - Detalle de Agencia Creativa
 * 
 * @description Página de detalle con información completa de agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';
import {
    ArrowLeft,
    Building2,
    Mail,
    Phone,
    Globe,
    MapPin,
    User,
    Calendar,
    Briefcase,
    Award,
    TrendingUp,
    Edit,
    Trash2,
    RefreshCw,
    Sparkles,
    ExternalLink,
    DollarSign,
    Users,
    BarChart3
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface AgenciaCreativa {
    id: string;
    codigo: string;
    rut: string | null;
    razonSocial: string;
    nombreFantasia: string | null;
    tipoAgencia: string;
    porcentajeComision: number;
    emailGeneral: string | null;
    telefonoGeneral: string | null;
    paginaWeb: string | null;
    direccion: string | null;
    ciudad: string | null;
    pais: string | null;
    nombreContacto: string | null;
    cargoContacto: string | null;
    emailContacto: string | null;
    telefonoContacto: string | null;
    estado: string;
    activa: boolean;
    campañasActivas: number;
    facturacionMensual: number;
    scoreRendimiento: number;
    clientesGestionados: number;
    fechaCreacion: string;
    tenantId: string;
}

interface MetricCardProps {
    icon: React.ElementType;
    label: string;
    value: string | number;
    sub?: string;
    color: string;
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

const S = {
    raised: `shadow-[8px_8px_16px_${N.dark},-8px_-8px_16px_${N.light}]`,
    sm: `shadow-[4px_4px_8px_${N.dark},-4px_-4px_8px_${N.light}]`,
    inset: `shadow-[inset_4px_4px_8px_${N.dark},inset_-4px_-4px_8px_${N.light}]`,
}

// ═══════════════════════════════════════════════════════════════
// COMPONENTES
// ═══════════════════════════════════════════════════════════════

const NeuCard = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
    <div
        className={`rounded-3xl p-6 ${className}`}
        style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px_16px ${N.light}` }}
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
    variant?: 'primary' | 'secondary' | 'danger';
    className?: string;
    disabled?: boolean;
}) => {
    const colors = {
        primary: { bg: N.accent, text: '#ffffff' },
        secondary: { bg: N.base, text: N.text },
        danger: { bg: '#ef4444', text: '#ffffff' },
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${className}`}
            style={{
                background: colors[variant].bg,
                color: colors[variant].text,
                boxShadow: `4px 4px 8px ${N.dark},-4px_-4px_8px ${N.light}`,
                opacity: disabled ? 0.5 : 1,
                cursor: disabled ? 'not-allowed' : 'pointer'
            }}
        >
            {children}
        </button>
    );
};

const MetricCard = ({ icon: Icon, label, value, sub, color }: MetricCardProps) => (
    <div
        className="p-5 rounded-2xl"
        style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark},inset -4px -4px 8px ${N.light}` }}
    >
        <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl" style={{ background: color }}>
                <Icon className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: N.textSub }}>{label}</span>
        </div>
        <div className="text-2xl font-black" style={{ color: N.text }}>{value}</div>
        {sub && <div className="text-xs mt-1" style={{ color: N.textSub }}>{sub}</div>}
    </div>
);

const InfoRow = ({ icon: Icon, label, value, href }: { icon: React.ElementType; label: string; value: string | null; href?: string }) => {
    if (!value) return null;

    const content = (
        <div className="flex items-center gap-3 py-2">
            <Icon className="w-4 h-4" style={{ color: N.accent }} />
            <span className="text-sm font-medium" style={{ color: N.textSub }}>{label}:</span>
            <span className="text-sm font-semibold" style={{ color: N.text }}>{value}</span>
        </div>
    );

    if (href) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer" className="block hover:opacity-80 transition-opacity">
                {content}
                <ExternalLink className="w-3 h-3 inline-block ml-1" style={{ color: N.accent }} />
            </a>
        );
    }

    return content;
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
    const getColor = (t: string) => {
        switch (t) {
            case 'publicidad': return '#8b5cf6';
            case 'digital': return '#06b6d4';
            case 'medios': return '#10b981';
            case 'btl': return '#f59e0b';
            case 'integral': return '#ec4899';
            case 'boutique': return '#6366f1';
            default: return '#64748b';
        }
    };

    return (
        <span
            className="px-3 py-1 rounded-xl text-xs font-bold text-white"
            style={{ background: getColor(tipo) }}
        >
            {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
        </span>
    );
};

const StatusBadge = ({ estado, activa }: { estado: string; activa: boolean }) => (
    <span
        className={`px-3 py-1 rounded-xl text-xs font-bold ${activa ? 'text-green-800' : 'text-red-800'}`}
        style={{ background: activa ? '#86efac' : '#fca5a5' }}
    >
        {estado.toUpperCase()}
    </span>
);

const ScoreIndicator = ({ score }: { score: number }) => {
    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
    return (
        <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" style={{ color }} />
            <span className="text-2xl font-black" style={{ color }}>{score}</span>
            <span className="text-xs" style={{ color: N.textSub }}>/100</span>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE DETALLE
// ═══════════════════════════════════════════════════════════════

export default function AgenciaCreativaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaCreativa | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);

    const fetchAgencia = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`/api/agencias-creativas?id=${id}`);
            const data = await response.json();

            if (data.success && data.data) {
                // Find the specific agencia from the array
                const agenciaData = Array.isArray(data.data)
                    ? data.data.find((a: AgenciaCreativa) => a.id === id)
                    : data.data;
                setAgencia(agenciaData || data.data);
            } else if (data.success === false) {
                setError(data.error || 'Error al cargar la agencia');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchAgencia();
        }
    }, [id, fetchAgencia]);

    const handleDelete = async () => {
        if (!confirm('¿Estás seguro de eliminar esta agencia?')) return;

        setDeleting(true);
        try {
            const response = await fetch(`/api/agencias-creativas?id=${id}`, {
                method: 'DELETE',
            });
            const data = await response.json();

            if (data.success) {
                router.push('/agencias-creativas');
            } else {
                alert(data.error || 'Error al eliminar');
            }
        } catch (err) {
            alert('Error de conexión');
        } finally {
            setDeleting(false);
        }
    };

    const handleToggleActive = async () => {
        if (!agencia) return;

        try {
            const response = await fetch('/api/agencias-creativas', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: agencia.id,
                    activa: !agencia.activa,
                }),
            });
            const data = await response.json();

            if (data.success) {
                fetchAgencia();
            } else {
                alert(data.error || 'Error al actualizar');
            }
        } catch (err) {
            alert('Error de conexión');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
                <div className="max-w-5xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        <div className="h-12 w-64 rounded-2xl" style={{ background: N.base }} />
                        <div className="h-48 rounded-3xl" style={{ background: N.base }} />
                        <div className="grid grid-cols-3 gap-6">
                            <div className="h-32 rounded-3xl" style={{ background: N.base }} />
                            <div className="h-32 rounded-3xl" style={{ background: N.base }} />
                            <div className="h-32 rounded-3xl" style={{ background: N.base }} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !agencia) {
        return (
            <div className="min-h-screen p-8" style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}>
                <div className="max-w-5xl mx-auto">
                    <NeuCard className="text-center py-12">
                        <Building2 className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
                        <h2 className="text-xl font-bold mb-2" style={{ color: N.text }}>
                            {error || 'Agencia no encontrada'}
                        </h2>
                        <NeuButton onClick={() => router.push('/agencias-creativas')} variant="secondary">
                            Volver a Agencias
                        </NeuButton>
                    </NeuCard>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen p-6 lg:p-8"
            style={{ background: `linear-gradient(135deg, ${N.base} 0%, #e8f0ff 100%)` }}
        >
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/agencias-creativas')}
                            className="p-3 rounded-2xl transition-all duration-200"
                            style={{ background: N.base, boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}` }}
                        >
                            <ArrowLeft className="w-5 h-5" style={{ color: N.text }} />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-black" style={{ color: N.text }}>
                                    {agencia.nombreFantasia || agencia.razonSocial}
                                </h1>
                                <TipoBadge tipo={agencia.tipoAgencia} />
                                <StatusBadge estado={agencia.estado} activa={agencia.activa} />
                            </div>
                            <p className="text-sm mt-1" style={{ color: N.textSub }}>
                                {agencia.codigo} • {agencia.razonSocial}
                                {agencia.rut && ` • RUT: ${agencia.rut}`}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <NeuButton variant="secondary" onClick={handleToggleActive}>
                            {agencia.activa ? 'Desactivar' : 'Activar'}
                        </NeuButton>
                        <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}/editar`)}>
                            <Edit className="w-4 h-4 inline-block mr-1" /> Editar
                        </NeuButton>
                        <NeuButton variant="danger" onClick={handleDelete} disabled={deleting}>
                            <Trash2 className="w-4 h-4 inline-block mr-1" />
                            {deleting ? 'Eliminando...' : 'Eliminar'}
                        </NeuButton>
                    </div>
                </div>

                {/* Score Principal */}
                <NeuCard className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div
                            className="w-20 h-20 rounded-3xl flex items-center justify-center text-3xl font-black text-white"
                            style={{ background: `linear-gradient(135deg, ${N.accent} 0%, #8b5cf6 100%)`, boxShadow: `4px 4px 12px ${N.dark}` }}
                        >
                            {(agencia.nombreFantasia || agencia.razonSocial).charAt(0)}
                        </div>
                        <div>
                            <div className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: N.textSub }}>
                                Score de Rendimiento
                            </div>
                            <ScoreIndicator score={agencia.scoreRendimiento || 0} />
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm" style={{ color: N.textSub }}>Cliente desde</div>
                        <div className="text-lg font-bold" style={{ color: N.text }}>
                            {agencia.fechaCreacion ? new Date(agencia.fechaCreacion).toLocaleDateString('es-CL') : 'N/A'}
                        </div>
                    </div>
                </NeuCard>

                {/* Métricas */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard
                        icon={Briefcase}
                        label="Campañas Activas"
                        value={agencia.campañasActivas || 0}
                        color="#8b5cf6"
                    />
                    <MetricCard
                        icon={DollarSign}
                        label="Facturación Mes"
                        value={`$${((agencia.facturacionMensual || 0) / 1000000).toFixed(1)}M`}
                        sub="CLP"
                        color="#10b981"
                    />
                    <MetricCard
                        icon={Users}
                        label="Clientes"
                        value={agencia.clientesGestionados || 0}
                        color="#06b6d4"
                    />
                    <MetricCard
                        icon={Award}
                        label="Comisión"
                        value={`${agencia.porcentajeComision}%`}
                        color="#f59e0b"
                    />
                </div>

                {/* Información Principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Información de Contacto */}
                    <NeuCard>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: N.text }}>
                            <Building2 className="w-5 h-5" style={{ color: N.accent }} />
                            Información General
                        </h3>

                        <div className="space-y-2">
                            <InfoRow icon={Mail} label="Email" value={agencia.emailGeneral} href={`mailto:${agencia.emailGeneral}`} />
                            <InfoRow icon={Phone} label="Teléfono" value={agencia.telefonoGeneral} href={`tel:${agencia.telefonoGeneral}`} />
                            <InfoRow icon={Globe} label="Web" value={agencia.paginaWeb} href={`https://${agencia.paginaWeb}`} />
                            <InfoRow icon={MapPin} label="Dirección" value={agencia.direccion} />
                            <InfoRow icon={MapPin} label="Ciudad" value={agencia.ciudad} />
                            <InfoRow icon={MapPin} label="País" value={agencia.pais} />
                        </div>
                    </NeuCard>

                    {/* Contacto Ejecutivo */}
                    <NeuCard>
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: N.text }}>
                            <User className="w-5 h-5" style={{ color: N.accent }} />
                            Contacto Principal
                        </h3>

                        {agencia.nombreContacto ? (
                            <div className="space-y-3">
                                <div className="p-4 rounded-2xl" style={{ background: N.light, boxShadow: `inset 2px 2px 5px ${N.dark},inset -2px -2px 5px ${N.light}` }}>
                                    <div className="font-bold text-lg" style={{ color: N.text }}>{agencia.nombreContacto}</div>
                                    {agencia.cargoContacto && (
                                        <div className="text-sm" style={{ color: N.textSub }}>{agencia.cargoContacto}</div>
                                    )}
                                </div>
                                <InfoRow icon={Mail} label="Email" value={agencia.emailContacto} href={`mailto:${agencia.emailContacto}`} />
                                <InfoRow icon={Phone} label="Teléfono" value={agencia.telefonoContacto} href={`tel:${agencia.telefonoContacto}`} />
                            </div>
                        ) : (
                            <div className="text-center py-8" style={{ color: N.textSub }}>
                                <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                                <p>Sin contacto principal registrado</p>
                            </div>
                        )}
                    </NeuCard>
                </div>

                {/* Acciones Rápidas */}
                <NeuCard>
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: N.text }}>
                        <BarChart3 className="w-5 h-5" style={{ color: N.accent }} />
                        Acciones
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}/proyectos`)}>
                            <Briefcase className="w-4 h-4 inline-block mr-1" /> Ver Proyectos
                        </NeuButton>
                        <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}/briefs`)}>
                            <Edit className="w-4 h-4 inline-block mr-1" /> Briefs
                        </NeuButton>
                        <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}/portfolio`)}>
                            <Award className="w-4 h-4 inline-block mr-1" /> Portfolio
                        </NeuButton>
                        <NeuButton variant="secondary" onClick={() => router.push(`/agencias-creativas/${id}/historial`)}>
                            <TrendingUp className="w-4 h-4 inline-block mr-1" /> Historial
                        </NeuButton>
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
