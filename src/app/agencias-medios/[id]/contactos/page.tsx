'use client';

/**
 * 🏢 SILEXAR PULSE - Contactos de Agencia
 * 
 * Gestión de contactos para agencias de medios
 * Diseño neuromórfico premium con tabla elegante
 * 
 * @version 2025.1.0
 * @tier TIER_0_ENTERPRISE
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
    User,
    Users,
    UserPlus,
    Edit3,
    Trash2,
    Mail,
    Phone,
    LinkIcon,
    Crown,
    Target,
    ArrowLeft,
    Save,
    X,
    CheckCircle2,
    AlertTriangle,
    Filter,
    Search,
    MoreVertical,
    Star,
    Building2,
    MessageSquare,
    Calendar,
    Send,
    Award
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface Contacto {
    id: string;
    nombre: string;
    apellido: string;
    cargo: string;
    departamento: string;
    email: string;
    telefono: string;
    telefonoMovil: string;
    rol: string;
    nivelDecision: 'estrategico' | 'tactico' | 'operacional';
    esDecisor: boolean;
    esInfluencer: boolean;
    esPrincipal: boolean;
    linkedIn: string;
    fotoUrl: string;
    notas: string;
    createdAt: string;
}

interface Agencia {
    id: string;
    nombreComercial: string;
    rut: string;
    nivelColaboracion: string;
    contactos: Contacto[];
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

const mockContactos: Contacto[] = [
    {
        id: '1',
        nombre: 'María José',
        apellido: 'González',
        cargo: 'Directora de Medios',
        departamento: 'Medios',
        email: 'mjgonzalez@agenciauno.cl',
        telefono: '+56 2 2345 6789',
        telefonoMovil: '+56 9 1234 5678',
        rol: 'DGA',
        nivelDecision: 'estrategico',
        esDecisor: true,
        esInfluencer: true,
        esPrincipal: true,
        linkedIn: 'https://linkedin.com/in/mjgonzalez',
        fotoUrl: '',
        notas: 'Contactar para renovaciones de contratos strategic',
        createdAt: '2024-01-15T10:30:00Z'
    },
    {
        id: '2',
        nombre: 'Andrés',
        apellido: 'Vega',
        cargo: 'Planner Digital',
        departamento: 'Planificación',
        email: 'avega@agenciauno.cl',
        telefono: '+56 2 2345 6790',
        telefonoMovil: '+56 9 2345 6789',
        rol: 'PLANNER',
        nivelDecision: 'tactico',
        esDecisor: false,
        esInfluencer: true,
        esPrincipal: false,
        linkedIn: 'https://linkedin.com/in/andresvega',
        fotoUrl: '',
        notas: 'Especialista en medios digitales y programmatic',
        createdAt: '2024-02-20T14:15:00Z'
    },
    {
        id: '3',
        nombre: 'Carolina',
        apellido: 'Méndez',
        cargo: 'Ejecutiva de Cuentas',
        departamento: 'Commercial',
        email: 'cmendez@agenciauno.cl',
        telefono: '+56 2 2345 6791',
        telefonoMovil: '+56 9 3456 7890',
        rol: 'ECUT',
        nivelDecision: 'operacional',
        esDecisor: false,
        esInfluencer: false,
        esPrincipal: false,
        linkedIn: 'https://linkedin.com/in/carolinamendez',
        fotoUrl: '',
        notas: 'Punto de contacto para campañas activas',
        createdAt: '2024-03-10T09:00:00Z'
    },
    {
        id: '4',
        nombre: 'Felipe',
        apellido: 'Ruiz',
        cargo: 'CEO',
        departamento: 'Dirección',
        email: 'fruiz@agenciauno.cl',
        telefono: '+56 2 2345 6700',
        telefonoMovil: '+56 9 4567 8901',
        rol: 'CEO',
        nivelDecision: 'estrategico',
        esDecisor: true,
        esInfluencer: true,
        esPrincipal: false,
        linkedIn: 'https://linkedin.com/in/feliperuiz',
        fotoUrl: '',
        notas: 'Última instancia para acuerdos contractuales',
        createdAt: '2023-11-05T16:45:00Z'
    }
];

const mockAgencia: Agencia = {
    id: '1',
    nombreComercial: 'Agencia Uno',
    rut: '76.543.210-K',
    nivelColaboracion: 'estrategico',
    contactos: mockContactos
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

const Badge = ({ children, variant = 'default', className = '' }: { children: React.ReactNode; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'; className?: string }) => {
    const variantClasses = {
        default: 'bg-slate-100 text-slate-700',
        success: 'bg-emerald-100 text-emerald-700',
        warning: 'bg-amber-100 text-amber-700',
        danger: 'bg-rose-100 text-rose-700',
        info: 'bg-cyan-100 text-cyan-700'
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variantClasses[variant]} ${className}`}>
            {children}
        </span>
    );
};

const DecisionBadge = ({ nivel }: { nivel: string }) => {
    const config = {
        estrategico: { label: 'Estratégico', color: 'bg-gradient-to-br from-violet-500 to-violet-600', icon: Crown },
        tactico: { label: 'Táctico', color: 'bg-gradient-to-br from-amber-500 to-amber-600', icon: Target },
        operacional: { label: 'Operacional', color: 'bg-gradient-to-br from-slate-500 to-slate-600', icon: Award }
    };

    const { label, color, icon: Icon } = config[nivel as keyof typeof config] || config.operacional;

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold text-white ${color}`}>
            <Icon size={12} />
            {label}
        </span>
    );
};

const Avatar = ({ nombre, apellido, esPrincipal }: { nombre: string; apellido: string; esPrincipal: boolean }) => {
    const initials = `${nombre.charAt(0)}${apellido.charAt(0)}`;
    const colors = [
        'from-cyan-500 to-cyan-600',
        'from-violet-500 to-violet-600',
        'from-emerald-500 to-emerald-600',
        'from-amber-500 to-amber-600'
    ];
    const colorIndex = nombre.charCodeAt(0) % colors.length;

    return (
        <div className="relative">
            <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold text-sm shadow-lg`}>
                {initials}
            </div>
            {esPrincipal && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full flex items-center justify-center shadow-md">
                    <Star size={10} className="text-white fill-white" />
                </div>
            )}
        </div>
    );
};

const RoleBadge = ({ rol }: { rol: string }) => {
    const roles: Record<string, { label: string; color: string }> = {
        DGA: { label: 'Director General', color: 'from-violet-500 to-violet-600' },
        CEO: { label: 'CEO', color: 'from-cyan-500 to-cyan-600' },
        COO: { label: 'COO', color: 'from-emerald-500 to-emerald-600' },
        PLANNER: { label: 'Planner', color: 'from-amber-500 to-amber-600' },
        ECUT: { label: 'Ejecutivo de Cuentas', color: 'from-rose-500 to-rose-600' }
    };

    const config = roles[rol] || { label: rol, color: 'from-slate-500 to-slate-600' };

    return (
        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold text-white bg-gradient-to-br ${config.color}`}>
            {config.label}
        </span>
    );
};

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════

export default function ContactosAgenciaPage() {
    const router = useRouter();
    const params = useParams();
    const agenciaId = params.id as string;

    const [agencia, setAgencia] = useState<Agencia | null>(null);
    const [contactos, setContactos] = useState<Contacto[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingContacto, setEditingContacto] = useState<Contacto | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRol, setFilterRol] = useState<string>('all');
    const [filterDecision, setFilterDecision] = useState<string>('all');

    // Form state
    const [formData, setFormData] = useState<Partial<Contacto>>({
        nombre: '',
        apellido: '',
        cargo: '',
        departamento: '',
        email: '',
        telefono: '',
        telefonoMovil: '',
        rol: 'ECUT',
        nivelDecision: 'operacional',
        esDecisor: false,
        esInfluencer: false,
        esPrincipal: false,
        linkedIn: '',
        notas: ''
    });

    useEffect(() => {
        // Simulate API fetch
        const timer = setTimeout(() => {
            setAgencia(mockAgencia);
            setContactos(mockContactos);
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, [agenciaId]);

    const filteredContactos = contactos.filter(contacto => {
        const matchesSearch =
            contacto.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contacto.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contacto.cargo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contacto.email.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesRol = filterRol === 'all' || contacto.rol === filterRol;
        const matchesDecision = filterDecision === 'all' || contacto.nivelDecision === filterDecision;

        return matchesSearch && matchesRol && matchesDecision;
    });

    const handleOpenModal = (contacto?: Contacto) => {
        if (contacto) {
            setEditingContacto(contacto);
            setFormData(contacto);
        } else {
            setEditingContacto(null);
            setFormData({
                nombre: '',
                apellido: '',
                cargo: '',
                departamento: '',
                email: '',
                telefono: '',
                telefonoMovil: '',
                rol: 'ECUT',
                nivelDecision: 'operacional',
                esDecisor: false,
                esInfluencer: false,
                esPrincipal: false,
                linkedIn: '',
                notas: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingContacto(null);
    };

    const handleSaveContacto = () => {
        if (editingContacto) {
            setContactos(prev => prev.map(c => c.id === editingContacto.id ? { ...c, ...formData } as Contacto : c));
        } else {
            const newContacto: Contacto = {
                ...formData as Contacto,
                id: Date.now().toString(),
                createdAt: new Date().toISOString()
            };
            setContactos(prev => [...prev, newContacto]);
        }
        handleCloseModal();
    };

    const handleDeleteContacto = (id: string) => {
        if (confirm('¿Estás seguro de eliminar este contacto?')) {
            setContactos(prev => prev.filter(c => c.id !== id));
        }
    };

    const handleSetPrincipal = (id: string) => {
        setContactos(prev => prev.map(c => ({
            ...c,
            esPrincipal: c.id === id
        })));
    };

    const stats = {
        total: contactos.length,
        decisores: contactos.filter(c => c.esDecisor).length,
        influencias: contactos.filter(c => c.esInfluencer).length,
        principales: contactos.filter(c => c.esPrincipal).length
    };

    if (loading) {
        return (
            <div className={`min-h-screen ${designTokens.colors.background} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
                    <span className={`${designTokens.colors.textSecondary} font-medium`}>Cargando contactos...</span>
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
                                <Users size={32} className="text-cyan-400" />
                                Contactos de {agencia?.nombreComercial}
                            </h1>
                            <p className="text-slate-400 mt-1">
                                Gestión de relaciones y contactos clave de la agencia
                            </p>
                        </div>

                        <NeuromorphicButton
                            variant="primary"
                            onClick={() => handleOpenModal()}
                            className="flex items-center gap-2"
                        >
                            <UserPlus size={20} />
                            Nuevo Contacto
                        </NeuromorphicButton>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-8 px-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-4 gap-4 mb-6">
                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 flex items-center justify-center shadow-lg">
                                <Users size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
                                <div className="text-sm text-slate-500">Total Contactos</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-violet-600 flex items-center justify-center shadow-lg">
                                <Crown size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.decisores}</div>
                                <div className="text-sm text-slate-500">Decisores</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-lg">
                                <Target size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.influencias}</div>
                                <div className="text-sm text-slate-500">Influencers</div>
                            </div>
                        </div>
                    </NeuromorphicCard>

                    <NeuromorphicCard className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <Star size={24} className="text-white" />
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-slate-800">{stats.principales}</div>
                                <div className="text-sm text-slate-500">Principales</div>
                            </div>
                        </div>
                    </NeuromorphicCard>
                </div>

                {/* Filters */}
                <NeuromorphicCard className="p-6 mb-6">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por nombre, cargo o email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className={`
                                    w-full pl-12 pr-4 py-3 rounded-xl
                                    bg-slate-100/50 text-slate-800
                                    placeholder:text-slate-400
                                    border border-slate-200/50
                                    focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500
                                    ${designTokens.shadows.inset}
                                `}
                            />
                        </div>

                        <select
                            value={filterRol}
                            onChange={(e) => setFilterRol(e.target.value)}
                            className="px-4 py-3 rounded-xl bg-slate-100/50 text-slate-700 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="DGA">Director General</option>
                            <option value="CEO">CEO</option>
                            <option value="COO">COO</option>
                            <option value="PLANNER">Planner</option>
                            <option value="ECUT">Ejecutivo de Cuentas</option>
                        </select>

                        <select
                            value={filterDecision}
                            onChange={(e) => setFilterDecision(e.target.value)}
                            className="px-4 py-3 rounded-xl bg-slate-100/50 text-slate-700 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                        >
                            <option value="all">Todos los niveles</option>
                            <option value="estrategico">Estratégico</option>
                            <option value="tactico">Táctico</option>
                            <option value="operacional">Operacional</option>
                        </select>
                    </div>
                </NeuromorphicCard>

                {/* Contacts Table */}
                <NeuromorphicCard className="overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-100/50">
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Cargo / Rol</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Contacto</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Nivel</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Etiquetas</th>
                                    <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-200/30">
                                {filteredContactos.map((contacto) => (
                                    <tr key={contacto.id} className="hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar
                                                    nombre={contacto.nombre}
                                                    apellido={contacto.apellido}
                                                    esPrincipal={contacto.esPrincipal}
                                                />
                                                <div>
                                                    <div className="font-semibold text-slate-800">
                                                        {contacto.nombre} {contacto.apellido}
                                                        {contacto.esPrincipal && (
                                                            <Badge variant="warning" className="ml-2">Principal</Badge>
                                                        )}
                                                    </div>
                                                    <div className="text-sm text-slate-500">{contacto.departamento}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-2">
                                                <div className="font-medium text-slate-700">{contacto.cargo}</div>
                                                <RoleBadge rol={contacto.rol} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1.5">
                                                <a
                                                    href={`mailto:${contacto.email}`}
                                                    className="flex items-center gap-2 text-sm text-cyan-600 hover:text-cyan-700"
                                                >
                                                    <Mail size={14} />
                                                    {contacto.email}
                                                </a>
                                                {contacto.telefonoMovil && (
                                                    <a
                                                        href={`tel:${contacto.telefonoMovil}`}
                                                        className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-700"
                                                    >
                                                        <Phone size={14} />
                                                        {contacto.telefonoMovil}
                                                    </a>
                                                )}
                                                {contacto.linkedIn && (
                                                    <a
                                                        href={contacto.linkedIn}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                                                    >
                                                        <LinkIcon size={14} />
                                                        LinkedIn
                                                    </a>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <DecisionBadge nivel={contacto.nivelDecision} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-wrap gap-2">
                                                {contacto.esDecisor && (
                                                    <Badge variant="info">
                                                        <Crown size={12} className="inline mr-1" />
                                                        Decisor
                                                    </Badge>
                                                )}
                                                {contacto.esInfluencer && (
                                                    <Badge variant="success">
                                                        <Target size={12} className="inline mr-1" />
                                                        Influencer
                                                    </Badge>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end gap-2">
                                                {!contacto.esPrincipal && (
                                                    <button
                                                        onClick={() => handleSetPrincipal(contacto.id)}
                                                        className="p-2 rounded-lg text-amber-500 hover:bg-amber-50 transition-colors"
                                                        title="Marcar como principal"
                                                    >
                                                        <Star size={18} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleOpenModal(contacto)}
                                                    className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                                    title="Editar"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteContacto(contacto.id)}
                                                    className="p-2 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredContactos.length === 0 && (
                            <div className="py-16 text-center">
                                <Users size={48} className="mx-auto text-slate-300 mb-4" />
                                <p className="text-slate-500">No se encontraron contactos</p>
                            </div>
                        )}
                    </div>
                </NeuromorphicCard>
            </main>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <NeuromorphicCard className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-slate-200/50">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-800">
                                    {editingContacto ? 'Editar Contacto' : 'Nuevo Contacto'}
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                                >
                                    <X size={24} />
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <User size={18} className="text-cyan-600" />
                                    Información Personal
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Nombre</label>
                                        <input
                                            type="text"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="María José"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Apellido</label>
                                        <input
                                            type="text"
                                            value={formData.apellido}
                                            onChange={(e) => setFormData(prev => ({ ...prev, apellido: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="González"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Cargo</label>
                                        <input
                                            type="text"
                                            value={formData.cargo}
                                            onChange={(e) => setFormData(prev => ({ ...prev, cargo: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="Directora de Medios"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Departamento</label>
                                        <input
                                            type="text"
                                            value={formData.departamento}
                                            onChange={(e) => setFormData(prev => ({ ...prev, departamento: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="Medios"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Contact Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Phone size={18} className="text-cyan-600" />
                                    Información de Contacto
                                </h3>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">Email</label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        placeholder="mjgonzalez@agencia.cl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Teléfono Fijo</label>
                                        <input
                                            type="tel"
                                            value={formData.telefono}
                                            onChange={(e) => setFormData(prev => ({ ...prev, telefono: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="+56 2 2345 6789"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Teléfono Móvil</label>
                                        <input
                                            type="tel"
                                            value={formData.telefonoMovil}
                                            onChange={(e) => setFormData(prev => ({ ...prev, telefonoMovil: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                            placeholder="+56 9 1234 5678"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-slate-600 mb-1.5">LinkedIn</label>
                                    <input
                                        type="url"
                                        value={formData.linkedIn}
                                        onChange={(e) => setFormData(prev => ({ ...prev, linkedIn: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        placeholder="https://linkedin.com/in/..."
                                    />
                                </div>
                            </div>

                            {/* Role Info */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <Building2 size={18} className="text-cyan-600" />
                                    Rol y Nivel de Decisión
                                </h3>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Rol</label>
                                        <select
                                            value={formData.rol}
                                            onChange={(e) => setFormData(prev => ({ ...prev, rol: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            <option value="ECUT">Ejecutivo de Cuentas</option>
                                            <option value="PLANNER">Planner</option>
                                            <option value="DGA">Director General</option>
                                            <option value="CEO">CEO</option>
                                            <option value="COO">COO</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-600 mb-1.5">Nivel de Decisión</label>
                                        <select
                                            value={formData.nivelDecision}
                                            onChange={(e) => setFormData(prev => ({ ...prev, nivelDecision: e.target.value as any }))}
                                            className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                                        >
                                            <option value="estrategico">Estratégico</option>
                                            <option value="tactico">Táctico</option>
                                            <option value="operacional">Operacional</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.esDecisor}
                                            onChange={(e) => setFormData(prev => ({ ...prev, esDecisor: e.target.checked }))}
                                            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-slate-700">Es Decisor</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.esInfluencer}
                                            onChange={(e) => setFormData(prev => ({ ...prev, esInfluencer: e.target.checked }))}
                                            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-slate-700">Es Influencer</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={formData.esPrincipal}
                                            onChange={(e) => setFormData(prev => ({ ...prev, esPrincipal: e.target.checked }))}
                                            className="w-5 h-5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                                        />
                                        <span className="text-sm text-slate-700">Contacto Principal</span>
                                    </label>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-4">
                                <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                                    <MessageSquare size={18} className="text-cyan-600" />
                                    Notas
                                </h3>
                                <textarea
                                    value={formData.notas}
                                    onChange={(e) => setFormData(prev => ({ ...prev, notas: e.target.value }))}
                                    rows={3}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-100/50 border border-slate-200/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 resize-none"
                                    placeholder="Notas sobre este contacto..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200/50 flex justify-end gap-4">
                            <NeuromorphicButton variant="ghost" onClick={handleCloseModal}>
                                Cancelar
                            </NeuromorphicButton>
                            <NeuromorphicButton
                                variant="primary"
                                onClick={handleSaveContacto}
                                className="flex items-center gap-2"
                            >
                                <Save size={18} />
                                {editingContacto ? 'Actualizar' : 'Crear'} Contacto
                            </NeuromorphicButton>
                        </div>
                    </NeuromorphicCard>
                </div>
            )}
        </div>
    );
}
