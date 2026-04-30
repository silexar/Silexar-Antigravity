/**
 * Módulo de Configuración - Silexar Pulse
 * UI Components - Configuración Dashboard
 * 
 * Componentes neumórficos para el dashboard de configuración.
 * Diseñados siguiendo el Neumorphism Design System TIER 0
 */

'use client';

import { useState } from 'react';
import {
    Settings,
    Plus,
    Search,
    Filter,
    Download,
    Upload,
    Trash2,
    Edit3,
    Eye,
    EyeOff,
    ChevronRight,
    ChevronDown,
    RefreshCw,
    History,
    Star,
    StarOff,
    Shield,
    AlertTriangle,
    CheckCircle,
    Clock,
    Globe,
    Lock,
    Unlock,
    Copy,
    MoreVertical
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════════════════════
// NEUMORPHISM DESIGN TOKENS - Silexar Pulse TIER 0
// ═══════════════════════════════════════════════════════════════════════════════

const N = {
    base: '#dfeaff',      // Fondo universal desktop - azul lavanda perlado
    dark: '#bec8de',      // Sombra oscura (abajo-derecha)
    light: '#ffffff',     // Contraluz (arriba-izquierda)
    accent: '#6888ff',    // UNICO color permitido para acentos, estados, iconos
    text: '#69738c',      // Texto primario
    sub: '#9aa3b8'        // Texto secundario / placeholder
};

// ═══════════════════════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════════════════════

export interface ConfiguracionItem {
    id: string;
    clave: string;
    valor: unknown;
    tipo: 'string' | 'number' | 'boolean' | 'json' | 'password' | 'email' | 'url';
    categoria: string;
    descripcion?: string;
    editable: boolean;
    visible: boolean;
    nivelSeguridad: 'publico' | 'interno' | 'confidencial' | 'critico';
    grupo?: string;
    orden: number;
    creadaPor: string;
    actualizadaPor?: string;
    creadaEn: Date;
    actualizadaEn?: Date;
}

export interface CategoriaStats {
    nombre: string;
    cantidad: number;
    color: string;
    icon: string;
}

interface ConfiguracionDashboardProps {
    configuraciones: ConfiguracionItem[];
    estadisticas: {
        total: number;
        porCategoria: Record<string, number>;
        editables: number;
        visibles: number;
    };
    onCrear: () => void;
    onEditar: (config: ConfiguracionItem) => void;
    onEliminar: (ids: string[]) => void;
    onImportar: () => void;
    onExportar: () => void;
    onRefresh: () => void;
}

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: BARRA DE BÚSQUEDA Y FILTROS
// ═══════════════════════════════════════════════════════════════════════════════

interface SearchBarProps {
    busqueda: string;
    onBusquedaChange: (value: string) => void;
    categoriaSeleccionada: string;
    onCategoriaChange: (value: string) => void;
    categorias: string[];
    tipoSeleccionado: string;
    onTipoChange: (value: string) => void;
}

export const SearchBar = ({
    busqueda,
    onBusquedaChange,
    categoriaSeleccionada,
    onCategoriaChange,
    categorias,
    tipoSeleccionado,
    onTipoChange
}: SearchBarProps) => (
    <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
                <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => onBusquedaChange(e.target.value)}
                    placeholder="Buscar por clave o descripción..."
                    className="
                        w-full p-3 pl-10 pr-4
                        bg-[#dfeaff] rounded-xl
                        shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                        focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                        text-[#69738c] placeholder:text-[#9aa3b8]
                        transition-all duration-200
                    "
                />
            </div>
        </div>

        <div className="flex gap-3 flex-wrap">
            <select
                value={categoriaSeleccionada}
                onChange={(e) => onCategoriaChange(e.target.value)}
                className="
                    p-3 pl-4 pr-10
                    bg-[#dfeaff] rounded-xl
                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                    text-[#69738c]
                    appearance-none cursor-pointer
                    bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2369738c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
                    bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]
                "
            >
                <option value="todas">Todas las categorías</option>
                {categorias.map(c => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                ))}
            </select>

            <select
                value={tipoSeleccionado}
                onChange={(e) => onTipoChange(e.target.value)}
                className="
                    p-3 pl-4 pr-10
                    bg-[#dfeaff] rounded-xl
                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                    text-[#69738c]
                    appearance-none cursor-pointer
                    bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2369738c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
                    bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]
                "
            >
                <option value="todos">Todos los tipos</option>
                <option value="string">Texto</option>
                <option value="number">Número</option>
                <option value="boolean">Booleano</option>
                <option value="json">JSON</option>
                <option value="password">Contraseña</option>
                <option value="email">Email</option>
                <option value="url">URL</option>
            </select>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TARJETA DE CONFIGURACIÓN
// ═══════════════════════════════════════════════════════════════════════════════

interface ConfigCardProps {
    config: ConfiguracionItem;
    onEditar: () => void;
    onEliminar: () => void;
    onToggleVisibilidad: () => void;
    onVerAuditoria: () => void;
}

// Neumorphic Card Base
const NeuromorphicCardBase = ({
    children,
    className = '',
    onClick,
    hover = true
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}) => (
    <div
        onClick={onClick}
        className={`
            bg-[#dfeaff] rounded-2xl p-6
            shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
            border border-white/40
            ${hover ? 'hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:scale-[1.01] transition-all duration-300' : ''}
            ${onClick ? 'cursor-pointer' : ''}
            ${className}
        `}
    >
        {children}
    </div>
);

export const ConfigCard = ({ config, onEditar, onEliminar, onToggleVisibilidad, onVerAuditoria }: ConfigCardProps) => {
    const [mostrarValor, setMostrarValor] = useState(false);

    const nivelSeguridadColors: Record<string, string> = {
        publico: 'text-[#6888ff]',
        interno: 'text-[#6888ff]',
        confidencial: 'text-[#6888ff]',
        critico: 'text-[#6888ff]'
    };

    const nivelSeguridadIcons: Record<string, React.ElementType> = {
        publico: Globe,
        interno: Shield,
        confidencial: Lock,
        critico: AlertTriangle
    };

    const NivelIcon = nivelSeguridadIcons[config.nivelSeguridad] || Globe;

    const formatearValor = (valor: unknown, tipo: string): string => {
        if (tipo === 'password' && valor) return '••••••••';
        if (tipo === 'boolean') return valor ? 'true' : 'false';
        if (tipo === 'json') return JSON.stringify(valor, null, 2).substring(0, 100) + '...';
        if (typeof valor === 'object') return JSON.stringify(valor);
        return String(valor);
    };

    return (
        <NeuromorphicCardBase className="group relative">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <code className="text-sm font-mono font-bold text-[#6888ff] bg-[#dfeaff] px-2 py-0.5 rounded-xl shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]">
                            {config.clave}
                        </code>
                        <span className={`
                            px-2 py-0.5 rounded-full text-xs font-semibold
                            bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                            ${nivelSeguridadColors[config.nivelSeguridad]}
                        `}>
                            <NivelIcon className="w-3 h-3 inline mr-1" />
                            {config.nivelSeguridad}
                        </span>
                    </div>
                    <span className="
                        inline-block px-2 py-0.5 rounded-full text-xs font-medium
                        bg-[#dfeaff] text-[#9aa3b8]
                        shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                    ">
                        {config.tipo}
                    </span>
                </div>

                {/* Acciones */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => setMostrarValor(!mostrarValor)}
                        className="
                            p-2 rounded-xl
                            bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                            hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                            text-[#9aa3b8] transition-all duration-200
                        "
                        title={mostrarValor ? 'Ocultar valor' : 'Mostrar valor'}
                    >
                        {mostrarValor ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onToggleVisibilidad}
                        className="
                            p-2 rounded-xl
                            bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                            hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                            text-[#9aa3b8] transition-all duration-200
                        "
                        title={config.visible ? 'Ocultar' : 'Mostrar'}
                    >
                        {config.visible ? <Eye className="w-4 h-4 text-[#6888ff]" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                        onClick={onVerAuditoria}
                        className="
                            p-2 rounded-xl
                            bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                            hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                            text-[#9aa3b8] transition-all duration-200
                        "
                        title="Ver historial"
                    >
                        <History className="w-4 h-4" />
                    </button>
                    {config.editable && (
                        <>
                            <button
                                onClick={onEditar}
                                className="
                                    p-2 rounded-xl
                                    bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                                    hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                                    text-[#6888ff] transition-all duration-200
                                "
                                title="Editar"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={onEliminar}
                                className="
                                    p-2 rounded-xl
                                    bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                                    hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                                    text-[#6888ff] transition-all duration-200
                                "
                                title="Eliminar"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Descripción */}
            {config.descripcion && (
                <p className="text-sm text-[#9aa3b8] mb-3 line-clamp-2">{config.descripcion}</p>
            )}

            {/* Valor */}
            <div className="
                bg-[#dfeaff] rounded-xl p-3 mb-4 font-mono text-xs overflow-hidden
                shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
            ">
                <div className="flex items-center justify-between">
                    <span className="text-[#9aa3b8] text-[10px] uppercase tracking-widest">Valor</span>
                    {config.tipo === 'password' && (
                        <button
                            onClick={() => navigator.clipboard.writeText(String(config.valor))}
                            className="text-[#9aa3b8] hover:text-[#6888ff] transition-colors"
                            title="Copiar valor"
                        >
                            <Copy className="w-3 h-3" />
                        </button>
                    )}
                </div>
                <pre className={`text-[#69738c] mt-1 whitespace-pre-wrap break-all ${mostrarValor ? '' : 'blur-sm'}`}>
                    {formatearValor(config.valor, config.tipo)}
                </pre>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between text-xs text-[#9aa3b8] pt-3 border-t border-white/20">
                <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3" />
                    <span>Actualizado {config.actualizadaEn ? new Date(config.actualizadaEn).toLocaleDateString('es-CL') : 'nunca'}</span>
                </div>
                <div className="flex items-center gap-2">
                    {config.grupo && (
                        <span className="
                            px-2 py-0.5
                            bg-[#dfeaff] shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                            rounded-full text-[#9aa3b8]
                        ">{config.grupo}</span>
                    )}
                    {config.editable ? (
                        <span className="text-[#6888ff] flex items-center gap-1">
                            <Unlock className="w-3 h-3" /> Editable
                        </span>
                    ) : (
                        <span className="text-[#9aa3b8] flex items-center gap-1">
                            <Lock className="w-3 h-3" /> Bloqueado
                        </span>
                    )}
                </div>
            </div>
        </NeuromorphicCardBase>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TARJETA DE ESTADÍSTICAS
// ═══════════════════════════════════════════════════════════════════════════════

interface StatsCardProps {
    titulo: string;
    valor: string | number;
    icono: React.ElementType;
    cambio?: string;
    cambioPositivo?: boolean;
}

export const StatsCard = ({ titulo, valor, icono: Icon }: StatsCardProps) => (
    <div className="
        bg-[#dfeaff] rounded-2xl p-6
        shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
        border border-white/40
    ">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-1">{titulo}</p>
                <p className="text-3xl font-black text-[#69738c]">{valor}</p>
            </div>
            <div className="
                p-3 bg-[#dfeaff] rounded-xl
                shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
            ">
                <Icon className="w-6 h-6 text-[#6888ff]" />
            </div>
        </div>
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: TABS DE CATEGORÍAS
// ═══════════════════════════════════════════════════════════════════════════════

interface CategoryTabsProps {
    categorias: { nombre: string; cantidad: number; color: string }[];
    categoriaActiva: string;
    onCategoriaSelect: (categoria: string) => void;
}

export const CategoryTabs = ({ categorias, categoriaActiva, onCategoriaSelect }: CategoryTabsProps) => (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        <button
            onClick={() => onCategoriaSelect('todas')}
            className={`
                px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                ${categoriaActiva === 'todas'
                    ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]'
                    : 'bg-[#dfeaff] text-[#69738c] hover:bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]'}
            `}
        >
            Todas ({categorias.reduce((acc, c) => acc + c.cantidad, 0)})
        </button>
        {categorias.map(cat => (
            <button
                key={cat.nombre}
                onClick={() => onCategoriaSelect(cat.nombre)}
                className={`
                    px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all
                    flex items-center gap-2
                    ${categoriaActiva === cat.nombre
                        ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]'
                        : 'bg-[#dfeaff] text-[#69738c] hover:bg-[#dfeaff] shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]'}
                `}
            >
                <span className={`w-2 h-2 rounded-full ${cat.color}`}></span>
                {cat.nombre.charAt(0).toUpperCase() + cat.nombre.slice(1)} ({cat.cantidad})
            </button>
        ))}
    </div>
);

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTE: MODAL DE CONFIGURACIÓN - OS Window Paradigm
// ═══════════════════════════════════════════════════════════════════════════════

interface ConfigFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    config?: ConfiguracionItem;
    onSubmit: (data: Partial<ConfiguracionItem>) => void;
}

export const ConfigFormModal = ({ isOpen, onClose, config, onSubmit }: ConfigFormModalProps) => {
    const [formData, setFormData] = useState({
        clave: config?.clave || '',
        valor: config?.valor || '',
        tipo: config?.tipo || 'string',
        categoria: config?.categoria || 'general',
        descripcion: config?.descripcion || '',
        nivelSeguridad: config?.nivelSeguridad || 'publico',
        grupo: config?.grupo || '',
        editable: config?.editable ?? true,
        visible: config?.visible ?? true
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay - Prohibido el fondo negro, solo blur neumórfico */}
            <div className="absolute inset-0 bg-[#dfeaff]/60 backdrop-blur-sm" onClick={onClose} />

            {/* Ventana Flotante - OS Paradigm */}
            <div className="
                relative bg-[#dfeaff] rounded-2xl
                shadow-[12px_12px_24px_#bec8de,-12px_-12px_24px_#ffffff]
                border border-white/40
                w-full max-w-2xl max-h-[90vh] overflow-y-auto
            ">
                {/* Header de la ventana */}
                <div className="flex items-center justify-between p-4 border-b border-white/20">
                    <h2 className="text-xl font-bold text-[#69738c] flex items-center gap-2">
                        <div className="
                            p-2 bg-[#dfeaff] rounded-xl
                            shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                        ">
                            <Settings className="w-5 h-5 text-[#6888ff]" />
                        </div>
                        {config ? 'Editar Configuración' : 'Nueva Configuración'}
                    </h2>
                    {/* Controles OS - Solo color accent #6888ff */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={onClose}
                            className="
                                w-3 h-3 rounded-full
                                bg-[#dfeaff]
                                shadow-[2px_2px_4px_#bec8de,-1px_-1px_3px_#ffffff]
                                hover:shadow-[inset_2px_2px_4px_#bec8de,inset_-2px_-2px_4px_#ffffff]
                                transition-all
                            "
                        />
                    </div>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); onSubmit(formData); }} className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                                Clave *
                            </label>
                            <input
                                type="text"
                                value={formData.clave}
                                onChange={(e) => setFormData({ ...formData, clave: e.target.value.toUpperCase() })}
                                placeholder="MI_CONFIGURACION"
                                disabled={!!config}
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    font-mono text-sm text-[#69738c]
                                    disabled:opacity-50
                                "
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                                Tipo *
                            </label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData({ ...formData, tipo: e.target.value as ConfiguracionItem['tipo'] })}
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    text-[#69738c]
                                    appearance-none cursor-pointer
                                "
                            >
                                <option value="string">Texto (String)</option>
                                <option value="number">Número</option>
                                <option value="boolean">Booleano</option>
                                <option value="json">JSON</option>
                                <option value="password">Contraseña</option>
                                <option value="email">Email</option>
                                <option value="url">URL</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                                Categoría *
                            </label>
                            <select
                                value={formData.categoria}
                                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    text-[#69738c]
                                    appearance-none cursor-pointer
                                "
                            >
                                <option value="general">General</option>
                                <option value="notificaciones">Notificaciones</option>
                                <option value="seguridad">Seguridad</option>
                                <option value="ai">Inteligencia Artificial</option>
                                <option value="integraciones">Integraciones</option>
                                <option value="facturacion">Facturación</option>
                                <option value="emisoras">Emisoras</option>
                                <option value="usuarios">Usuarios</option>
                                <option value="reportes">Reportes</option>
                                <option value="personalizacion">Personalización</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                                Nivel de Seguridad *
                            </label>
                            <select
                                value={formData.nivelSeguridad}
                                onChange={(e) => setFormData({ ...formData, nivelSeguridad: e.target.value as ConfiguracionItem['nivelSeguridad'] })}
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    text-[#69738c]
                                    appearance-none cursor-pointer
                                "
                            >
                                <option value="publico">Público</option>
                                <option value="interno">Interno</option>
                                <option value="confidencial">Confidencial</option>
                                <option value="critico">Crítico</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                            Valor *
                        </label>
                        {formData.tipo === 'boolean' ? (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, valor: true })}
                                    className={`
                                        px-4 py-2 rounded-xl font-bold transition-all
                                        ${formData.valor === true
                                            ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]'
                                            : 'bg-[#dfeaff] text-[#69738c] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]'}
                                    `}
                                >
                                    True
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, valor: false })}
                                    className={`
                                        px-4 py-2 rounded-xl font-bold transition-all
                                        ${formData.valor === false
                                            ? 'bg-[#6888ff] text-white shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]'
                                            : 'bg-[#dfeaff] text-[#69738c] shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]'}
                                    `}
                                >
                                    False
                                </button>
                            </div>
                        ) : formData.tipo === 'json' ? (
                            <textarea
                                value={typeof formData.valor === 'string' ? formData.valor : JSON.stringify(formData.valor, null, 2)}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                placeholder='{"key": "value"}'
                                rows={5}
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    font-mono text-sm text-[#69738c]
                                "
                            />
                        ) : (
                            <input
                                type={formData.tipo === 'password' ? 'password' : 'text'}
                                value={String(formData.valor || '')}
                                onChange={(e) => setFormData({ ...formData, valor: e.target.value })}
                                placeholder="Valor de la configuración"
                                className="
                                    w-full p-3
                                    bg-[#dfeaff] rounded-xl
                                    shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                    focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                    font-mono text-sm text-[#69738c]
                                "
                            />
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                            Descripción
                        </label>
                        <textarea
                            value={formData.descripcion}
                            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                            placeholder="Descripción de la configuración..."
                            rows={2}
                            className="
                                w-full p-3
                                bg-[#dfeaff] rounded-xl
                                shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                text-sm text-[#69738c]
                            "
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-black text-[#9aa3b8] uppercase tracking-widest mb-2">
                            Grupo
                        </label>
                        <input
                            type="text"
                            value={formData.grupo}
                            onChange={(e) => setFormData({ ...formData, grupo: e.target.value })}
                            placeholder="Nombre del grupo (opcional)"
                            className="
                                w-full p-3
                                bg-[#dfeaff] rounded-xl
                                shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                                text-sm text-[#69738c]
                            "
                        />
                    </div>

                    <div className="flex gap-6">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.editable}
                                onChange={(e) => setFormData({ ...formData, editable: e.target.checked })}
                                className="w-5 h-5 rounded border-white/40 text-[#6888ff] focus:ring-[#6888ff]/30"
                            />
                            <span className="text-sm font-medium text-[#69738c]">Editable por usuarios</span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.visible}
                                onChange={(e) => setFormData({ ...formData, visible: e.target.checked })}
                                className="w-5 h-5 rounded border-white/40 text-[#6888ff] focus:ring-[#6888ff]/30"
                            />
                            <span className="text-sm font-medium text-[#69738c]">Visible en UI</span>
                        </label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                px-6 py-3 rounded-xl
                                bg-[#dfeaff] text-[#69738c]
                                shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
                                hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                                active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                                transition-all duration-200
                                font-bold
                            "
                        >
                            Cancelar
                        </button>
                        <button
                            type="button"
                            onClick={() => onSubmit(formData)}
                            className="
                                px-6 py-3 rounded-xl
                                bg-[#6888ff] text-white
                                shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]
                                hover:bg-[#5572ee]
                                active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]
                                transition-all duration-200
                                font-bold
                            "
                        >
                            {config ? 'Guardar Cambios' : 'Crear Configuración'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ═══════════════════════════════════════════════════════════════════════════════
// COMPONENTES BASE NEUMÓRFICOS EXPORTADOS
// ═══════════════════════════════════════════════════════════════════════════════

const NeuromorphicCard = ({
    children,
    className = '',
    onClick,
    hover = true
}: {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hover?: boolean;
}) => (
    <div
        onClick={onClick}
        className={`
            bg-[#dfeaff] rounded-2xl p-6
            shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
            border border-white/40
            ${hover ? 'hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff] hover:scale-[1.01] transition-all duration-300' : ''}
            ${onClick ? 'cursor-pointer' : ''}
            ${className}
        `}
    >
        {children}
    </div>
);

const NeuromorphicButton = ({
    children,
    variant = 'primary',
    size = 'md',
    onClick,
    disabled = false,
    className = ''
}: {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}) => {
    const baseClasses = 'font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2';

    const variants = {
        primary: `
            bg-[#6888ff] text-white
            shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]
            hover:bg-[#5572ee]
            active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]
        `,
        secondary: `
            bg-[#dfeaff] text-[#69738c]
            shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
            hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
            active:shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
        `,
        danger: `
            bg-[#6888ff] text-white
            shadow-[4px_4px_8px_#bec8de,-2px_-2px_6px_#ffffff]
            hover:bg-[#5572ee]
            active:shadow-[inset_3px_3px_6px_rgba(0,0,0,0.2)]
        `,
        ghost: `
            bg-transparent text-[#69738c]
            hover:bg-[#dfeaff]
        `
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base'
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                ${baseClasses} ${variants[variant]} ${sizes[size]}
                ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                ${className}
            `}
        >
            {children}
        </button>
    );
};

const NeuromorphicInput = ({
    placeholder,
    value,
    onChange,
    icon: Icon,
    type = 'text',
    className = ''
}: {
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    icon?: React.ElementType;
    type?: string;
    className?: string;
}) => (
    <div className={`relative ${className}`}>
        {Icon && (
            <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9aa3b8]" />
        )}
        <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`
                w-full p-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4
                bg-[#dfeaff] rounded-xl
                shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
                focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
                text-[#69738c] placeholder:text-[#9aa3b8]
                transition-all duration-200
            `}
        />
    </div>
);

const NeuromorphicSelect = ({
    value,
    onChange,
    options,
    className = ''
}: {
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`
            w-full p-3 pl-4 pr-10
            bg-[#dfeaff] rounded-xl
            shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]
            focus:outline-none focus:ring-2 focus:ring-[#6888ff]/30
            text-[#69738c]
            appearance-none cursor-pointer
            bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2369738c%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')]
            bg-no-repeat bg-[right_0.75rem_center] bg-[length:1.25rem]
            ${className}
        `}
    >
        {options.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
    </select>
);

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export { NeuromorphicCard, NeuromorphicButton, NeuromorphicInput, NeuromorphicSelect };
