'use client';

/**
 * 🎨 SILEXAR PULSE - Portfolio de Agencia Creativa
 * 
 * @description Showcase de trabajos realizados por la agencia
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft,
    Plus,
    Image,
    Video,
    Music,
    Award,
    Star,
    ExternalLink,
    Loader2,
    Eye
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PortfolioItem {
    id: string;
    agenciaId: string;
    titulo: string;
    descripcion: string;
    cliente: string;
    tipo: 'video' | 'audio' | 'grafico' | 'digital';
    imagenUrl: string;
    año: number;
    premios: string[];
    scoreCalidad: number;
    vistas: number;
    fechaPublicacion: string;
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

const NeuCard = ({ children, className = '', onClick }: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
}) => (
    <div
        className={`rounded-3xl p-6 ${className}`}
        style={{ background: N.base, boxShadow: `8px 8px 16px ${N.dark},-8px_-8px 16px ${N.light}` }}
        onClick={onClick}
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

const TipoIcon = ({ tipo }: { tipo: string }) => {
    const config = {
        video: { icon: Video, color: '#8b5cf6', label: 'Video' },
        audio: { icon: Music, color: '#06b6d4', label: 'Audio' },
        grafico: { icon: Image, color: '#10b981', label: 'Gráfico' },
        digital: { icon: ExternalLink, color: '#f59e0b', label: 'Digital' },
    };

    const { icon: Icon, color, label } = config[tipo as keyof typeof config] || config.grafico;

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

const MOCK_PORTFOLIO: PortfolioItem[] = [
    {
        id: 'port-001',
        agenciaId: 'agc-001',
        titulo: 'Campaña Sueños - Banco Chile',
        descripcion: 'Comercial emotivo de 30 segundos para campaña de apertura de cuentas',
        cliente: 'Banco Chile',
        tipo: 'video',
        imagenUrl: '/api/placeholder/400/300',
        año: 2024,
        premios: ['Cannes Bronze', 'Festival del Humor'],
        scoreCalidad: 9.4,
        vistas: 2500000,
        fechaPublicacion: '2024-06-15',
    },
    {
        id: 'port-002',
        agenciaId: 'agc-001',
        titulo: 'Black Friday Ripley 2024',
        descripcion: 'Serie de 5 spots para televisión y digital',
        cliente: 'Ripley',
        tipo: 'video',
        imagenUrl: '/api/placeholder/400/300',
        año: 2024,
        premios: [],
        scoreCalidad: 9.1,
        vistas: 1800000,
        fechaPublicacion: '2024-11-20',
    },
    {
        id: 'port-003',
        agenciaId: 'agc-001',
        titulo: 'Branding Entel 5G',
        descripcion: 'Identidad visual para campaña de lanzamiento 5G',
        cliente: 'Entel',
        tipo: 'grafico',
        imagenUrl: '/api/placeholder/400/300',
        año: 2024,
        premios: ['Effie Awards'],
        scoreCalidad: 8.8,
        vistas: 0,
        fechaPublicacion: '2024-03-10',
    },
    {
        id: 'port-004',
        agenciaId: 'agc-001',
        titulo: 'Radio Spot CMPC',
        descripcion: 'Spots radiales para campaña institucional',
        cliente: 'CMPC',
        tipo: 'audio',
        imagenUrl: '/api/placeholder/400/300',
        año: 2023,
        premios: [],
        scoreCalidad: 8.5,
        vistas: 0,
        fechaPublicacion: '2023-09-01',
    },
];

// ═══════════════════════════════════════════════════════════════
// PÁGINA DE PORTFOLIO
// ═══════════════════════════════════════════════════════════════

export default function AgenciaPortfolioPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [agencia, setAgencia] = useState<AgenciaInfo | null>(null);
    const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState<string>('todos');

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

            const portfolioAgencia = MOCK_PORTFOLIO.filter(p => p.agenciaId === id);
            setPortfolio(portfolioAgencia);
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

    const filteredPortfolio = filtroTipo === 'todos'
        ? portfolio
        : portfolio.filter(p => p.tipo === filtroTipo);

    const getStats = () => {
        const totalTrabajos = portfolio.length;
        const promedioCalidad = portfolio.length > 0
            ? (portfolio.reduce((sum, p) => sum + p.scoreCalidad, 0) / portfolio.length).toFixed(1)
            : '0';
        const totalPremios = portfolio.reduce((sum, p) => sum + p.premios.length, 0);
        const totalVistas = portfolio.reduce((sum, p) => sum + p.vistas, 0);

        return { totalTrabajos, promedioCalidad, totalPremios, totalVistas };
    };

    const stats = getStats();

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
            <div className="max-w-6xl mx-auto space-y-6">

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
                                Portfolio
                            </h1>
                            <p className="text-sm" style={{ color: N.textSub }}>
                                {agencia?.codigo} • {agencia?.nombreFantasia || agencia?.razonSocial}
                            </p>
                        </div>
                    </div>

                    <NeuButton variant="primary" onClick={() => alert('Agregar trabajo - En desarrollo')}>
                        <Plus className="w-4 h-4" /> Agregar Trabajo
                    </NeuButton>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: N.accent }}>{stats.totalTrabajos}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Trabajos</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#10b981' }}>{stats.promedioCalidad}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Calidad Prom.</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#f59e0b' }}>{stats.totalPremios}</div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Premios</div>
                    </NeuCard>
                    <NeuCard className="text-center">
                        <div className="text-3xl font-black" style={{ color: '#8b5cf6' }}>
                            {stats.totalVistas > 1000000
                                ? `${(stats.totalVistas / 1000000).toFixed(1)}M`
                                : stats.totalVistas.toLocaleString()}
                        </div>
                        <div className="text-xs font-bold uppercase" style={{ color: N.textSub }}>Vistas</div>
                    </NeuCard>
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                    {['todos', 'video', 'audio', 'grafico', 'digital'].map((tipo) => (
                        <button
                            key={tipo}
                            onClick={() => setFiltroTipo(tipo)}
                            className={`px-4 py-2 rounded-2xl text-sm font-medium transition-all duration-200`}
                            style={{
                                background: filtroTipo === tipo ? N.accent : N.base,
                                color: filtroTipo === tipo ? '#ffffff' : N.text,
                                boxShadow: `4px 4px 8px ${N.dark},-4px_-4px 8px ${N.light}`,
                            }}
                        >
                            {tipo === 'todos' ? 'Todos' : tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Grid de Trabajos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPortfolio.map((item) => (
                        <NeuCard
                            key={item.id}
                            className="overflow-hidden cursor-pointer hover:scale-[1.02] transition-all duration-200"
                            onClick={() => alert(`Ver trabajo: ${item.titulo}`)}
                        >
                            <div
                                className="h-40 rounded-2xl mb-4 flex items-center justify-center"
                                style={{ background: `linear-gradient(135deg, ${N.dark} 0%, ${N.base} 100%)` }}
                            >
                                <TipoIcon tipo={item.tipo} />
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <h3 className="font-bold text-sm" style={{ color: N.text }}>{item.titulo}</h3>
                                </div>

                                <p className="text-xs" style={{ color: N.textSub }}>{item.descripcion}</p>

                                <div className="flex items-center justify-between pt-2 border-t" style={{ borderColor: N.dark }}>
                                    <span className="text-xs font-medium" style={{ color: N.text }}>{item.cliente}</span>
                                    <span className="text-xs" style={{ color: N.textSub }}>{item.año}</span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-1">
                                        <Star className="w-4 h-4" style={{ color: '#f59e0b' }} />
                                        <span className="text-sm font-bold" style={{ color: '#10b981' }}>
                                            {item.scoreCalidad.toFixed(1)}/10
                                        </span>
                                    </div>

                                    {item.vistas > 0 && (
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" style={{ color: N.textSub }} />
                                            <span className="text-xs" style={{ color: N.textSub }}>
                                                {item.vistas.toLocaleString()}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {item.premios.length > 0 && (
                                    <div className="flex flex-wrap gap-1 pt-2">
                                        {item.premios.map((premio, idx) => (
                                            <span
                                                key={idx}
                                                className="px-2 py-1 rounded-lg text-xs font-bold text-white flex items-center gap-1"
                                                style={{ background: '#f59e0b' }}
                                            >
                                                <Award className="w-3 h-3" /> {premio}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </NeuCard>
                    ))}
                </div>

                {filteredPortfolio.length === 0 && (
                    <NeuCard className="text-center py-12">
                        <Award className="w-16 h-16 mx-auto mb-4" style={{ color: N.textSub }} />
                        <p className="text-lg font-medium" style={{ color: N.text }}>
                            Sin trabajos en portfolio
                        </p>
                        <p className="text-sm mt-1" style={{ color: N.textSub }}>
                            Agrega trabajos para mostrar el portafolio de esta agencia
                        </p>
                    </NeuCard>
                )}

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
