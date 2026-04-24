'use client';

/**
 * 🏢 SILEXAR PULSE - Agencias de Medios Dashboard
 * 
 * Dashboard principal del Centro de Inteligencia de Partnerships
 * Diseño neuromórfico premium con métricas en tiempo real
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
    Briefcase,
    TrendingUp,
    Users,
    DollarSign,
    Award,
    AlertTriangle,
    RefreshCw,
    Plus,
    Search,
    Filter,
    ChevronRight,
    ChevronDown,
    Star,
    Target,
    Zap,
    BarChart3,
    Eye,
    Edit3,
    Trash2,
    Phone,
    Mail,

    MoreVertical,
    ArrowUpRight,
    ArrowDownRight,
    Minus,
    Clock,
    CheckCircle2,
    XCircle,
    TrendingDown
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
    comisionPorcentaje: number;
    ciudad: string;
    email: string;
    telefono: string;
    contactos: Contacto[];
    estado: string;
    activa: boolean;
    campaignsActivas: number;
    satisfactionScore: number;
    renewalProbability: number;
}

interface Contacto {
    id: string;
    nombre: string;
    apellido: string;
    cargo: string;
    email: string;
    telefono: string;
    esPrincipal: boolean;
    esDecisor: boolean;
    nivelDecision: string;
}

interface MetricasPortfolio {
    totalAgencias: number;
    activas: number;
    revenueTotal: number;
    comisionPromedio: number;
    scorePromedio: number;
    scoreTendencia: number;
    agenciesNecesitanAtencion: number;
    partnershipsEstrtegicos: number;
    opportunitiesHot: number;
    renewalProximas30dias: number;
}

interface Alerta {
    id: string;
    tipo: 'warning' | 'critical' | 'info' | 'success';
    agenciaId: string;
    agenciaNombre: string;
    mensaje: string;
    fechaCreacion: Date;
}

// ═══════════════════════════════════════════════════════════════
// NEUROMORPHIC DESIGN SYSTEM
// ═══════════════════════════════════════════════════════════════

// Color palette
const colors = {
    bgGradientStart: '#e8edf3',
    bgGradientMid: '#f0f4f8',
    bgGradientEnd: '#e2e8f0',
    surface: 'rgba(255, 255, 255, 0.7)',
    surfaceHover: 'rgba(255, 255, 255, 0.9)',
    shadowLight: 'rgba(255, 255, 255, 0.8)',
    shadowDark: 'rgba(163, 177, 198, 0.6)',
    accentCyan: '#06b6d4',
    accentEmerald: '#10b981',
    accentAmber: '#f59e0b',
    accentRose: '#f43f5e',
    accentViolet: '#8b5cf6',
    accentSlate: '#64748b',
    textPrimary: '#1e293b',
    textSecondary: '#64748b',
    textMuted: '#94a3b8',
};

const NeuromorphicStyles = {
    card: `
    background: linear-gradient(145deg, rgba(255,255,255,0.9), rgba(240,244,248,0.7));
    backdrop-filter: blur(20px);
    border-radius: 24px;
    box-shadow: 
      12px 12px 24px rgba(163, 177, 198, 0.5),
      -8px -8px 20px rgba(255, 255, 255, 0.9),
      inset 0 0 0 1px rgba(255, 255, 255, 0.5);
    border: 1px solid rgba(255, 255, 255, 0.6);
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  `,
    cardHover: `
    transform: translateY(-4px);
    box-shadow: 
      16px 16px 32px rgba(163, 177, 198, 0.6),
      -10px -10px 24px rgba(255, 255, 255, 1),
      inset 0 0 0 1px rgba(255, 255, 255, 0.7);
  `,
    button: `
    background: linear-gradient(145deg, #ffffff, #f0f4f8);
    border-radius: 16px;
    box-shadow: 
      6px 6px 12px rgba(163, 177, 198, 0.5),
      -4px -4px 10px rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.6);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `,
    buttonHover: `
    transform: translateY(-2px);
    box-shadow: 
      8px 8px 16px rgba(163, 177, 198, 0.6),
      -5px -5px 12px rgba(255, 255, 255, 1);
  `,
    buttonActive: `
    transform: translateY(1px);
    box-shadow: 
      3px 3px 6px rgba(163, 177, 198, 0.5),
      -2px -2px 5px rgba(255, 255, 255, 0.8);
  `,
    input: `
    background: linear-gradient(145deg, #f8fafc, #e8edf3);
    border-radius: 16px;
    box-shadow: 
      inset 6px 6px 12px rgba(163, 177, 198, 0.4),
      inset -4px -4px 8px rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(163, 177, 198, 0.2);
  `,
    progressBar: `
    background: linear-gradient(145deg, #e8edf3, #d8dde3);
    border-radius: 12px;
    box-shadow: 
      inset 3px 3px 6px rgba(163, 177, 198, 0.4),
      inset -2px -2px 4px rgba(255, 255, 255, 0.9);
  `,
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════════

const NeuromorphicCard = ({
    children,
    className = '',
    hover = true,
    onClick,
    style
}: {
    children: React.ReactNode;
    className?: string;
    hover?: boolean;
    onClick?: () => void;
    style?: React.CSSProperties;
}) => (
    <div
        className={`p-6 ${className}`}
        onClick={onClick}
        style={{
            ...(hover ? {
                cursor: onClick ? 'pointer' : 'default',
                ...eval(`({${NeuromorphicStyles.card}})`) as React.CSSProperties
            } : {
                ...eval(`({${NeuromorphicStyles.card}})`) as React.CSSProperties
            }),
            ...style
        }}
        onMouseEnter={(e) => {
            if (hover && onClick) {
                const el = e.currentTarget;
                el.style.cssText = NeuromorphicStyles.card + ' ' + NeuromorphicStyles.cardHover;
            }
        }}
        onMouseLeave={(e) => {
            if (hover && onClick) {
                const el = e.currentTarget;
                el.style.cssText = NeuromorphicStyles.card;
            }
        }}
    >
        {children}
    </div>
);

const NeuromorphicButton = ({
    children,
    onClick,
    variant = 'secondary',
    size = 'md',
    className = '',
    icon,
    disabled = false
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: 'primary' | 'secondary' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    icon?: React.ReactNode;
    disabled?: boolean;
}) => {
    const [isPressed, setIsPressed] = useState(false);

    const getVariantStyles = () => {
        switch (variant) {
            case 'primary':
                return `
          background: linear-gradient(145deg, ${colors.accentCyan}, #0891b2);
          color: white;
          box-shadow: 
            6px 6px 12px rgba(6, 182, 212, 0.3),
            -4px -4px 10px rgba(255, 255, 255, 0.9);
        `;
            case 'success':
                return `
          background: linear-gradient(145deg, ${colors.accentEmerald}, #059669);
          color: white;
        `;
            case 'danger':
                return `
          background: linear-gradient(145deg, ${colors.accentRose}, #e11d48);
          color: white;
        `;
            default:
                return NeuromorphicStyles.button;
        }
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex items-center gap-2 font-medium ${className}`}
            style={{
                ...eval(`({${getVariantStyles()}})`) as React.CSSProperties,
                opacity: disabled ? 0.5 : 1,
                padding: size === 'sm' ? '8px 16px' : size === 'lg' ? '14px 28px' : '10px 20px',
                fontSize: size === 'sm' ? '13px' : size === 'lg' ? '16px' : '14px',
                border: 'none',
                cursor: disabled ? 'not-allowed' : 'pointer',
                ...(isPressed ? eval(`({${NeuromorphicStyles.buttonActive}})`) as React.CSSProperties : {}),
            }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
        >
            {icon && <span style={{ display: 'flex' }}>{icon}</span>}
            {children}
        </button>
    );
};

const StatCard = ({
    label,
    value,
    change,
    changeType = 'neutral',
    icon,
    color = colors.accentCyan,
    subtitle
}: {
    label: string;
    value: string | number;
    change?: number;
    changeType?: 'up' | 'down' | 'neutral';
    icon?: React.ReactNode;
    color?: string;
    subtitle?: string;
}) => (
    <NeuromorphicCard className="relative overflow-hidden">
        <div className="flex items-start justify-between">
            <div className="flex-1">
                <p style={{ color: colors.textSecondary, fontSize: '13px', fontWeight: 500 }}>{label}</p>
                <p style={{ color: colors.textPrimary, fontSize: '32px', fontWeight: 700, marginTop: '4px', letterSpacing: '-0.5px' }}>
                    {value}
                </p>
                {subtitle && (
                    <p style={{ color: colors.textMuted, fontSize: '12px', marginTop: '2px' }}>{subtitle}</p>
                )}
                {change !== undefined && (
                    <div className="flex items-center gap-1 mt-2" style={{ color: changeType === 'up' ? colors.accentEmerald : changeType === 'down' ? colors.accentRose : colors.textMuted }}>
                        {changeType === 'up' && <ArrowUpRight size={14} />}
                        {changeType === 'down' && <ArrowDownRight size={14} />}
                        {changeType === 'neutral' && <Minus size={14} />}
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>
                            {change > 0 ? '+' : ''}{change}%
                        </span>
                        <span style={{ fontSize: '12px', opacity: 0.8 }}>vs mes anterior</span>
                    </div>
                )}
            </div>
            {icon && (
                <div
                    className="p-3 rounded-2xl"
                    style={{
                        background: `linear-gradient(145deg, ${color}15, ${color}08)`,
                        boxShadow: `0 4px 12px ${color}20`
                    }}
                >
                    <div style={{ color }}>{icon}</div>
                </div>
            )}
        </div>
        <div
            className="absolute bottom-0 left-0 right-0 h-1 opacity-30"
            style={{
                background: `linear-gradient(90deg, ${color}, transparent)`,
            }}
        />
    </NeuromorphicCard>
);

const ScoreBadge = ({ score, size = 'md' }: { score: number; size?: 'sm' | 'md' | 'lg' }) => {
    const getColor = () => {
        if (score >= 900) return { bg: '#FFD700', text: '#1e293b' };
        if (score >= 750) return { bg: '#C0C0C0', text: '#1e293b' };
        if (score >= 600) return { bg: '#CD7F32', text: '#1e293b' };
        if (score >= 450) return { bg: '#4CAF50', text: '#fff' };
        if (score >= 300) return { bg: '#FFC107', text: '#1e293b' };
        return { bg: '#F44336', text: '#fff' };
    };

    const color = getColor();
    const fontSize = size === 'sm' ? '14px' : size === 'lg' ? '24px' : '18px';
    const padding = size === 'sm' ? '4px 10px' : size === 'lg' ? '8px 20px' : '6px 14px';

    return (
        <span
            style={{
                background: `linear-gradient(145deg, ${color.bg}, ${color.bg}dd)`,
                color: color.text,
                padding,
                borderRadius: '12px',
                fontSize,
                fontWeight: 700,
                boxShadow: `0 2px 8px ${color.bg}40`,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
            }}
        >
            {score >= 900 ? '💎' : score >= 750 ? '🌟' : score >= 600 ? '💎' : score >= 450 ? '🤝' : score >= 300 ? '📈' : '⚠️'}
            {score}
        </span>
    );
};

const NivelBadge = ({ nivel }: { nivel: string }) => {
    const configs: Record<string, { icon: string; gradient: string }> = {
        estrategico: { icon: '🌟', gradient: 'linear-gradient(145deg, #FFD700, #FFA500)' },
        preferencial: { icon: '💎', gradient: 'linear-gradient(145deg, #C0C0C0, #A8A8A8)' },
        estandar: { icon: '🥇', gradient: 'linear-gradient(145deg, #CD7F32, #B8860B)' },
        transaccional: { icon: '🥈', gradient: 'linear-gradient(145deg, #C0C0C0, #A8A8A8)' },
        prospecto: { icon: '🆕', gradient: 'linear-gradient(145deg, #94a3b8, #64748b)' },
    };

    const config = configs[nivel.toLowerCase()] || configs.prospecto;

    return (
        <span
            style={{
                background: config.gradient,
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: 600,
                textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                boxShadow: `0 2px 8px ${config.gradient.split(',')[0].replace('linear-gradient(145deg, ', '')}40`
            }}
        >
            {config.icon} {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
        </span>
    );
};

const TipoBadge = ({ tipo }: { tipo: string }) => {
    const configs: Record<string, string> = {
        medios: colors.accentCyan,
        creativa: colors.accentRose,
        digital: colors.accentViolet,
        integral: colors.accentEmerald,
        btl: colors.accentAmber,
    };

    const color = configs[tipo.toLowerCase()] || colors.accentSlate;

    return (
        <span
            style={{
                background: `${color}20`,
                color: color,
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
            }}
        >
            {tipo}
        </span>
    );
};

const StatusIndicator = ({ status }: { status: 'activa' | 'inactiva' | 'suspendida' | 'pendiente' }) => {
    const configs: Record<string, { color: string; label: string }> = {
        activa: { color: colors.accentEmerald, label: 'Activa' },
        inactiva: { color: colors.textMuted, label: 'Inactiva' },
        suspendida: { color: colors.accentAmber, label: 'Suspendida' },
        pendiente: { color: colors.accentCyan, label: 'Pendiente' },
    };

    const config = configs[status] || configs.pendiente;

    return (
        <div className="flex items-center gap-2">
            <div
                className="w-2 h-2 rounded-full"
                style={{
                    background: config.color,
                    boxShadow: `0 0 8px ${config.color}`
                }}
            />
            <span style={{ color: config.color, fontSize: '13px', fontWeight: 500 }}>{config.label}</span>
        </div>
    );
};

const AgenciaCard = ({ agencia, onClick }: { agencia: Agencia; onClick?: () => void }) => (
    <NeuromorphicCard hover onClick={onClick}>
        <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{
                        background: `linear-gradient(145deg, ${colors.accentCyan}20, ${colors.accentCyan}08)`,
                        boxShadow: `0 4px 12px ${colors.accentCyan}15`
                    }}
                >
                    <Briefcase size={24} style={{ color: colors.accentCyan }} />
                </div>
                <div>
                    <h3 style={{ color: colors.textPrimary, fontWeight: 700, fontSize: '16px' }}>
                        {agencia.nombreComercial || agencia.nombreRazonSocial}
                    </h3>
                    <p style={{ color: colors.textMuted, fontSize: '12px' }}>
                        {agencia.codigo} • {agencia.tipoAgencia}
                    </p>
                </div>
            </div>
            <ScoreBadge score={agencia.scorePartnership} />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
                <p style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '2px' }}>Revenue</p>
                <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '15px' }}>
                    ${(agencia.revenueAnual / 1000000000).toFixed(1)}B
                </p>
            </div>
            <div>
                <p style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '2px' }}>Comisión</p>
                <p style={{ color: colors.accentEmerald, fontWeight: 600, fontSize: '15px' }}>
                    {agencia.comisionPorcentaje}%
                </p>
            </div>
            <div>
                <p style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '2px' }}>Contacto</p>
                <p style={{ color: colors.textPrimary, fontSize: '13px' }}>
                    {agencia.contactos[0]?.nombre || 'Sin asignar'}
                </p>
            </div>
            <div>
                <p style={{ color: colors.textMuted, fontSize: '11px', marginBottom: '2px' }}>Ciudad</p>
                <p style={{ color: colors.textPrimary, fontSize: '13px' }}>
                    {agencia.ciudad || 'N/A'}
                </p>
            </div>
        </div>

        <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid ${colors.textMuted}20` }}>
            <NivelBadge nivel={agencia.nivelColaboracion} />
            <div className="flex items-center gap-2">
                <button
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Eye size={16} style={{ color: colors.textSecondary }} />
                </button>
                <button
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <Edit3 size={16} style={{ color: colors.textSecondary }} />
                </button>
                <button
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                    onClick={(e) => { e.stopPropagation(); }}
                >
                    <MoreVertical size={16} style={{ color: colors.textSecondary }} />
                </button>
            </div>
        </div>
    </NeuromorphicCard>
);

const AlertCard = ({ alerta }: { alerta: Alerta }) => {
    const configs: Record<string, { bg: string; border: string; icon: React.ReactNode }> = {
        critical: {
            bg: `${colors.accentRose}10`,
            border: colors.accentRose,
            icon: <XCircle size={18} style={{ color: colors.accentRose }} />
        },
        warning: {
            bg: `${colors.accentAmber}10`,
            border: colors.accentAmber,
            icon: <AlertTriangle size={18} style={{ color: colors.accentAmber }} />
        },
        info: {
            bg: `${colors.accentCyan}10`,
            border: colors.accentCyan,
            icon: <Clock size={18} style={{ color: colors.accentCyan }} />
        },
        success: {
            bg: `${colors.accentEmerald}10`,
            border: colors.accentEmerald,
            icon: <CheckCircle2 size={18} style={{ color: colors.accentEmerald }} />
        },
    };

    const config = configs[alerta.tipo] || configs.info;

    return (
        <div
            className="p-4 rounded-xl flex items-start gap-3"
            style={{
                background: config.bg,
                borderLeft: `3px solid ${config.border}`
            }}
        >
            {config.icon}
            <div className="flex-1">
                <p style={{ color: colors.textPrimary, fontSize: '13px', fontWeight: 500 }}>
                    {alerta.mensaje}
                </p>
                <p style={{ color: colors.textMuted, fontSize: '11px', marginTop: '2px' }}>
                    {alerta.agenciaNombre}
                </p>
            </div>
        </div>
    );
};

const PipelineStage = ({
    titulo,
    agencias,
    color,
    totalValue
}: {
    titulo: string;
    agencias: Agencia[];
    color: string;
    totalValue: number;
}) => (
    <div className="flex-1 min-w-[280px]">
        <div
            className="p-4 rounded-t-2xl flex items-center justify-between"
            style={{ background: `${color}15` }}
        >
            <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
                <span style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px' }}>{titulo}</span>
            </div>
            <span style={{ color: colors.textMuted, fontSize: '13px' }}>{agencias.length}</span>
        </div>
        <div
            className="p-4 rounded-b-2xl space-y-3"
            style={{
                background: `linear-gradient(180deg, ${color}08, transparent)`,
                boxShadow: `inset 0 2px 8px ${color}10`
            }}
        >
            {agencias.map(agencia => (
                <div
                    key={agencia.id}
                    className="p-3 rounded-xl cursor-pointer"
                    style={{
                        background: 'rgba(255,255,255,0.7)',
                        boxShadow: '0 2px 8px rgba(163, 177, 198, 0.3)',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateX(4px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(163, 177, 198, 0.4)';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateX(0)';
                        e.currentTarget.style.boxShadow = '0 2px 8px rgba(163, 177, 198, 0.3)';
                    }}
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '13px' }}>
                                {agencia.nombreComercial || agencia.nombreRazonSocial}
                            </p>
                            <p style={{ color: colors.textMuted, fontSize: '11px' }}>
                                ${(agencia.revenueAnual / 1000000000).toFixed(1)}B
                            </p>
                        </div>
                        <ScoreBadge score={agencia.scorePartnership} size="sm" />
                    </div>
                </div>
            ))}
            {agencias.length === 0 && (
                <div className="text-center py-6" style={{ color: colors.textMuted }}>
                    <p style={{ fontSize: '12px' }}>Sin agencias</p>
                </div>
            )}
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function AgenciasMediosDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [metricas, setMetricas] = useState<MetricasPortfolio | null>(null);
    const [agencias, setAgencias] = useState<Agencia[]>([]);
    const [alertas, setAlertas] = useState<Alerta[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroNivel, setFiltroNivel] = useState<string>('all');
    const [showAlertas, setShowAlertas] = useState(true);
    const [activeTab, setActiveTab] = useState<'dashboard' | 'pipeline' | 'performance'>('dashboard');

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            // Simulated data - in production, would call API
            await new Promise(resolve => setTimeout(resolve, 800));

            setMetricas({
                totalAgencias: 24,
                activas: 21,
                revenueTotal: 1800000000000,
                comisionPromedio: 12.5,
                scorePromedio: 678,
                scoreTendencia: 12,
                agenciesNecesitanAtencion: 2,
                partnershipsEstrtegicos: 5,
                opportunitiesHot: 8,
                renewalProximas30dias: 3,
            });

            setAgencias([
                {
                    id: '1',
                    codigo: 'AGM-0001',
                    rut: '76.123.456-7',
                    nombreRazonSocial: 'Starcom MediaVest Group Chile',
                    nombreComercial: 'Starcom',
                    tipoAgencia: 'medios',
                    nivelColaboracion: 'estrategico',
                    scorePartnership: 890,
                    tendenciaScore: 'up',
                    especializaciones: ['Retail', 'FMCG', 'Digital'],
                    certificaciones: ['Google Premier', 'Meta Business'],
                    revenueAnual: 187000000000,
                    comisionPorcentaje: 15,
                    ciudad: 'Santiago',
                    email: 'contacto@starcom.cl',
                    telefono: '+56 2 2345 6789',
                    contactos: [{ id: 'c1', nombre: 'María', apellido: 'González', cargo: 'Country Manager', email: 'maria@starcom.cl', telefono: '+56912345678', esPrincipal: true, esDecisor: true, nivelDecision: 'estrategico' }],
                    estado: 'activa',
                    activa: true,
                    campaignsActivas: 8,
                    satisfactionScore: 92,
                    renewalProbability: 94,
                },
                {
                    id: '2',
                    codigo: 'AGM-0002',
                    rut: '77.654.321-K',
                    nombreRazonSocial: 'Zenith Media Chile',
                    nombreComercial: 'Zenith',
                    tipoAgencia: 'integral',
                    nivelColaboracion: 'estrategico',
                    scorePartnership: 845,
                    tendenciaScore: 'stable',
                    especializaciones: ['Finance', 'Tech'],
                    certificaciones: ['Google Premier'],
                    revenueAnual: 134000000000,
                    comisionPorcentaje: 14,
                    ciudad: 'Santiago',
                    email: 'info@zenith.cl',
                    telefono: '+56 2 2987 6543',
                    contactos: [{ id: 'c2', nombre: 'Juan', apellido: 'Rodríguez', cargo: 'CEO', email: 'juan@zenith.cl', telefono: '+56987654321', esPrincipal: true, esDecisor: true, nivelDecision: 'estrategico' }],
                    estado: 'activa',
                    activa: true,
                    campaignsActivas: 6,
                    satisfactionScore: 91,
                    renewalProbability: 88,
                },
                {
                    id: '3',
                    codigo: 'AGM-0003',
                    rut: '78.765.432-9',
                    nombreRazonSocial: 'Mindshare Chile',
                    nombreComercial: 'Mindshare',
                    tipoAgencia: 'medios',
                    nivelColaboracion: 'preferencial',
                    scorePartnership: 720,
                    tendenciaScore: 'up',
                    especializaciones: ['FMCG', 'Retail'],
                    certificaciones: ['Meta Marketing Partner'],
                    revenueAnual: 98000000000,
                    comisionPorcentaje: 13,
                    ciudad: 'Santiago',
                    email: 'contacto@mindshare.cl',
                    telefono: '+56 2 2456 7890',
                    contactos: [{ id: 'c3', nombre: 'Ana', apellido: 'Martínez', cargo: 'Client Director', email: 'ana@mindshare.cl', telefono: '+56923456789', esPrincipal: true, esDecisor: false, nivelDecision: 'tactico' }],
                    estado: 'activa',
                    activa: true,
                    campaignsActivas: 5,
                    satisfactionScore: 87,
                    renewalProbability: 82,
                },
                {
                    id: '4',
                    codigo: 'AGM-0004',
                    rut: '79.876.543-1',
                    nombreRazonSocial: 'Havas Media Chile',
                    nombreComercial: 'Havas Media',
                    tipoAgencia: 'digital',
                    nivelColaboracion: 'preferencial',
                    scorePartnership: 680,
                    tendenciaScore: 'down',
                    especializaciones: ['Automotive', 'Tech'],
                    certificaciones: [],
                    revenueAnual: 75000000000,
                    comisionPorcentaje: 12,
                    ciudad: 'Santiago',
                    email: 'info@havasmedia.cl',
                    telefono: '+56 2 2123 4567',
                    contactos: [],
                    estado: 'activa',
                    activa: true,
                    campaignsActivas: 3,
                    satisfactionScore: 78,
                    renewalProbability: 65,
                },
                {
                    id: '5',
                    codigo: 'AGM-0005',
                    rut: '80.987.654-3',
                    nombreRazonSocial: 'OMD Chile',
                    nombreComercial: 'OMD',
                    tipoAgencia: 'medios',
                    nivelColaboracion: 'estandar',
                    scorePartnership: 550,
                    tendenciaScore: 'stable',
                    especializaciones: ['Retail'],
                    certificaciones: ['Google Partner'],
                    revenueAnual: 35000000000,
                    comisionPorcentaje: 10,
                    ciudad: 'Santiago',
                    email: 'contacto@omd.cl',
                    telefono: '+56 2 2345 6789',
                    contactos: [{ id: 'c5', nombre: 'Roberto', apellido: 'Silva', cargo: 'Media Director', email: 'roberto@omd.cl', telefono: '+56934567890', esPrincipal: true, esDecisor: false, nivelDecision: 'tactico' }],
                    estado: 'activa',
                    activa: true,
                    campaignsActivas: 2,
                    satisfactionScore: 82,
                    renewalProbability: 75,
                },
            ]);

            setAlertas([
                { id: 'a1', tipo: 'warning' as const, agenciaId: '4', agenciaNombre: 'Havas Media', mensaje: 'Score en declive - Revisar términos comerciales', fechaCreacion: new Date() },
                { id: 'a2', tipo: 'info' as const, agenciaId: '2', agenciaNombre: 'Zenith Media', mensaje: 'Renovación vence en 15 días', fechaCreacion: new Date() },
                { id: 'a3', tipo: 'critical' as const, agenciaId: '4', agenciaNombre: 'Havas Media', mensaje: 'Performance crítico - Últimos 3 meses bajo target', fechaCreacion: new Date() },
                { id: 'a4', tipo: 'success' as const, agenciaId: '1', agenciaNombre: 'Starcom', mensaje: 'Oportunidad de expansión digital detectada (+$45M)', fechaCreacion: new Date() },
            ]);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const filteredAgencias = agencias.filter(a => {
        const matchesSearch = !searchTerm ||
            a.nombreRazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.nombreComercial?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.codigo.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesNivel = filtroNivel === 'all' || a.nivelColaboracion === filtroNivel;

        return matchesSearch && matchesNivel;
    });

    const pipelineAgencias = {
        prospeccion: filteredAgencias.filter(a => a.nivelColaboracion === 'prospecto'),
        negociacion: filteredAgencias.filter(a => a.nivelColaboracion === 'transaccional'),
        contracting: filteredAgencias.filter(a => a.nivelColaboracion === 'estandar'),
        activas: filteredAgencias.filter(a => ['preferencial', 'estrategico'].includes(a.nivelColaboracion)),
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: `linear-gradient(145deg, ${colors.bgGradientStart}, ${colors.bgGradientMid}, ${colors.bgGradientEnd})` }}>
                <div className="text-center">
                    <RefreshCw size={48} style={{ color: colors.accentCyan }} className="animate-spin mx-auto mb-4" />
                    <p style={{ color: colors.textSecondary, fontSize: '16px' }}> Cargando Centro de Partnerships...</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen pb-8"
            style={{ background: `linear-gradient(145deg, ${colors.bgGradientStart}, ${colors.bgGradientMid}, ${colors.bgGradientEnd})` }}
        >
            {/* Header */}
            <div className="p-6 lg:p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
                    <div>
                        <h1
                            className="text-4xl lg:text-5xl font-bold"
                            style={{
                                background: `linear-gradient(135deg, ${colors.textPrimary}, ${colors.accentCyan})`,
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            🏢 Centro de Partnerships
                        </h1>
                        <p style={{ color: colors.textSecondary, marginTop: '8px' }}>
                            Inteligencia de Agencias de Medios en Tiempo Real
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <NeuromorphicButton
                            variant="secondary"
                            onClick={fetchData}
                            icon={<RefreshCw size={16} className={loading ? 'animate-spin' : ''} />}
                        >
                            Refresh
                        </NeuromorphicButton>
                        <NeuromorphicButton
                            variant="primary"
                            onClick={() => router.push('/agencias-medios/nuevo')}
                            icon={<Plus size={16} />}
                        >
                            Nueva Agencia
                        </NeuromorphicButton>
                    </div>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mb-8">
                    {[
                        { id: 'dashboard', label: '📊 Dashboard', icon: <BarChart3 size={16} /> },
                        { id: 'pipeline', label: '🔄 Pipeline', icon: <Target size={16} /> },
                        { id: 'performance', label: '📈 Performance', icon: <TrendingUp size={16} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className="px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all"
                            style={{
                                background: activeTab === tab.id
                                    ? `linear-gradient(145deg, ${colors.accentCyan}, #0891b2)`
                                    : 'rgba(255,255,255,0.7)',
                                color: activeTab === tab.id ? '#fff' : colors.textSecondary,
                                boxShadow: activeTab === tab.id
                                    ? `0 4px 16px ${colors.accentCyan}40`
                                    : '0 2px 8px rgba(163, 177, 198, 0.3)',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content */}
                {activeTab === 'dashboard' && (
                    <>
                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            <StatCard
                                label="Total Agencias"
                                value={metricas?.totalAgencias || 0}
                                change={12}
                                changeType="up"
                                icon={<Briefcase size={24} />}
                                color={colors.accentCyan}
                            />
                            <StatCard
                                label="Revenue Colaborativo"
                                value={`$${((metricas?.revenueTotal || 0) / 1000000000).toFixed(1)}B`}
                                change={34}
                                changeType="up"
                                icon={<DollarSign size={24} />}
                                color={colors.accentEmerald}
                                subtitle="Year to Date"
                            />
                            <StatCard
                                label="Score Promedio"
                                value={metricas?.scorePromedio || 0}
                                change={metricas?.scoreTendencia}
                                changeType={metricas?.scoreTendencia && metricas.scoreTendencia > 0 ? 'up' : 'down'}
                                icon={<Award size={24} />}
                                color={colors.accentViolet}
                            />
                            <StatCard
                                label="Partnerships Activos"
                                value={metricas?.partnershipsEstrtegicos || 0}
                                icon={<Star size={24} />}
                                color={colors.accentAmber}
                                subtitle="Nivel Estratégico"
                            />
                        </div>

                        {/* Secondary Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                            <StatCard
                                label="Alertas Críticas"
                                value={metricas?.agenciesNecesitanAtencion || 0}
                                icon={<AlertTriangle size={24} />}
                                color={colors.accentRose}
                            />
                            <StatCard
                                label="Oportunidades Hot"
                                value={metricas?.opportunitiesHot || 0}
                                icon={<Zap size={24} />}
                                color={colors.accentAmber}
                            />
                            <StatCard
                                label="Renewals Próximos"
                                value={metricas?.renewalProximas30dias || 0}
                                icon={<Clock size={24} />}
                                color={colors.accentCyan}
                                subtitle="En 30 días"
                            />
                        </div>

                        {/* Main Content Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Agencias List */}
                            <div className="lg:col-span-2">
                                <NeuromorphicCard className="mb-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 style={{ color: colors.textPrimary, fontSize: '18px', fontWeight: 700 }}>
                                            🤝 Partnerships
                                        </h2>
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <Search
                                                    size={16}
                                                    style={{
                                                        position: 'absolute',
                                                        left: '12px',
                                                        top: '50%',
                                                        transform: 'translateY(-50%)',
                                                        color: colors.textMuted
                                                    }}
                                                />
                                                <input
                                                    type="text"
                                                    placeholder="Buscar agencias..."
                                                    value={searchTerm}
                                                    onChange={(e) => setSearchTerm(e.target.value)}
                                                    className="pl-10 pr-4 py-2 rounded-xl w-64"
                                                    style={{
                                                        ...eval(`({${NeuromorphicStyles.input}})`) as React.CSSProperties,
                                                        color: colors.textPrimary,
                                                        fontSize: '13px',
                                                    }}
                                                />
                                            </div>
                                            <select
                                                value={filtroNivel}
                                                onChange={(e) => setFiltroNivel(e.target.value)}
                                                className="px-4 py-2 rounded-xl"
                                                style={{
                                                    ...eval(`({${NeuromorphicStyles.input}})`) as React.CSSProperties,
                                                    color: colors.textPrimary,
                                                    fontSize: '13px',
                                                }}
                                            >
                                                <option value="all">Todos los niveles</option>
                                                <option value="estrategico">🌟 Estratégico</option>
                                                <option value="preferencial">💎 Preferencial</option>
                                                <option value="estandar">🥇 Estándar</option>
                                                <option value="transaccional">🥈 Transaccional</option>
                                                <option value="prospecto">🆕 Prospecto</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {filteredAgencias.slice(0, 6).map(agencia => (
                                            <AgenciaCard
                                                key={agencia.id}
                                                agencia={agencia}
                                                onClick={() => router.push(`/agencias-medios/${agencia.id}`)}
                                            />
                                        ))}
                                    </div>
                                    {filteredAgencias.length > 6 && (
                                        <div className="text-center mt-6">
                                            <NeuromorphicButton
                                                variant="secondary"
                                                onClick={() => router.push('/agencias-medios')}
                                            >
                                                Ver todas las {filteredAgencias.length} agencias →
                                            </NeuromorphicButton>
                                        </div>
                                    )}
                                </NeuromorphicCard>
                            </div>

                            {/* Alerts Sidebar */}
                            <div>
                                <NeuromorphicCard style={{ position: 'sticky', top: '24px' }}>
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 700 }}>
                                            ⚠️ Alertas
                                        </h2>
                                        <span
                                            className="px-2 py-1 rounded-lg text-xs font-bold"
                                            style={{
                                                background: `${colors.accentRose}20`,
                                                color: colors.accentRose
                                            }}
                                        >
                                            {alertas.length}
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {alertas.map(alerta => (
                                            <AlertCard key={alerta.id} alerta={alerta} />
                                        ))}
                                    </div>
                                    {alertas.length === 0 && (
                                        <div className="text-center py-8">
                                            <CheckCircle2 size={32} style={{ color: colors.accentEmerald, margin: '0 auto' }} />
                                            <p style={{ color: colors.textMuted, fontSize: '13px', marginTop: '8px' }}>
                                                Sin alertas pendientes
                                            </p>
                                        </div>
                                    )}
                                </NeuromorphicCard>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'pipeline' && (
                    <>
                        <div className="mb-6">
                            <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700 }}>
                                🔄 Pipeline de Partnerships
                            </h2>
                            <p style={{ color: colors.textSecondary, marginTop: '4px' }}>
                                Vista Kanban del ciclo de vida de partnerships
                            </p>
                        </div>
                        <div
                            className="flex gap-4 overflow-x-auto pb-6"
                            style={{
                                background: 'rgba(255,255,255,0.5)',
                                borderRadius: '24px',
                                padding: '24px',
                                boxShadow: 'inset 0 2px 8px rgba(163, 177, 198, 0.2)'
                            }}
                        >
                            <PipelineStage
                                titulo="🆕 Prospección"
                                agencias={pipelineAgencias.prospeccion}
                                color={colors.textMuted}
                                totalValue={0}
                            />
                            <PipelineStage
                                titulo="🤝 Negociación"
                                agencias={pipelineAgencias.negociacion}
                                color={colors.accentAmber}
                                totalValue={0}
                            />
                            <PipelineStage
                                titulo="📋 Contracting"
                                agencias={pipelineAgencias.contracting}
                                color={colors.accentCyan}
                                totalValue={0}
                            />
                            <PipelineStage
                                titulo="✅ Activas"
                                agencias={pipelineAgencias.activas}
                                color={colors.accentEmerald}
                                totalValue={metricas?.revenueTotal || 0}
                            />
                        </div>
                    </>
                )}

                {activeTab === 'performance' && (
                    <>
                        <div className="mb-6">
                            <h2 style={{ color: colors.textPrimary, fontSize: '20px', fontWeight: 700 }}>
                                📈 Analytics de Performance
                            </h2>
                            <p style={{ color: colors.textSecondary, marginTop: '4px' }}>
                                Métricas avanzadas y análisis predictivo
                            </p>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <NeuromorphicCard>
                                <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                    🎯 Top Performers
                                </h3>
                                <div className="space-y-4">
                                    {agencias
                                        .sort((a, b) => b.scorePartnership - a.scorePartnership)
                                        .slice(0, 5)
                                        .map((agencia, index) => (
                                            <div key={agencia.id} className="flex items-center gap-4">
                                                <span
                                                    style={{
                                                        width: '28px',
                                                        height: '28px',
                                                        borderRadius: '8px',
                                                        background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : colors.textMuted,
                                                        color: index < 3 ? '#1e293b' : '#fff',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        fontSize: '12px',
                                                        fontWeight: 700
                                                    }}
                                                >
                                                    {index + 1}
                                                </span>
                                                <div className="flex-1">
                                                    <p style={{ color: colors.textPrimary, fontWeight: 600, fontSize: '14px' }}>
                                                        {agencia.nombreComercial || agencia.nombreRazonSocial}
                                                    </p>
                                                    <p style={{ color: colors.textMuted, fontSize: '12px' }}>
                                                        {agencia.campaignsActivas} campaigns activas
                                                    </p>
                                                </div>
                                                <ScoreBadge score={agencia.scorePartnership} size="sm" />
                                            </div>
                                        ))}
                                </div>
                            </NeuromorphicCard>

                            <NeuromorphicCard>
                                <h3 style={{ color: colors.textPrimary, fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
                                    📊 Distribución por Nivel
                                </h3>
                                <div className="space-y-4">
                                    {['estrategico', 'preferencial', 'estandar', 'transaccional', 'prospecto'].map(nivel => {
                                        const count = agencias.filter(a => a.nivelColaboracion === nivel).length;
                                        const percentage = (count / agencias.length) * 100;
                                        return (
                                            <div key={nivel}>
                                                <div className="flex items-center justify-between mb-2">
                                                    <NivelBadge nivel={nivel} />
                                                    <span style={{ color: colors.textSecondary, fontSize: '13px' }}>
                                                        {count} agencias ({percentage.toFixed(0)}%)
                                                    </span>
                                                </div>
                                                <div
                                                    className="h-3 rounded-full overflow-hidden"
                                                    style={eval(`({${NeuromorphicStyles.progressBar}})`) as React.CSSProperties}
                                                >
                                                    <div
                                                        className="h-full rounded-full transition-all duration-500"
                                                        style={{
                                                            width: `${percentage}%`,
                                                            background: nivel === 'estrategico' ? colors.accentAmber : colors.accentCyan,
                                                        }}
                                                    />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </NeuromorphicCard>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
