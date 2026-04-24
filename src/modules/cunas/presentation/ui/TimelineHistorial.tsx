/**
 * COMPONENT: TIMELINE HISTORIAL COMPLETO
 * 
 * Timeline interactivo que muestra el historial completo de una cuña:
 * - Creación y modificaciones
 * - Cambios de estado
 * - Envíos de distribución
 * - Exportaciones a sistemas
 * - Vistas y descargas
 * - Comentarios y notas
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';

interface HistorialItem {
    id: string;
    tipo: 'creacion' | 'modificacion' | 'cambio_estado' | 'envio' | 'exportacion' | 'vista' | 'comentario' | 'version';
    titulo: string;
    descripcion: string;
    usuario: string;
    fecha: Date;
    metadata?: Record<string, unknown>;
}

interface TimelineHistorialProps {
    cunaId: string;
    items?: HistorialItem[];
    onAddComment?: (comentario: string) => void;
    onRestoreVersion?: (versionId: string) => void;
    readOnly?: boolean;
}

export const TimelineHistorial: React.FC<TimelineHistorialProps> = ({
    cunaId,
    items: initialItems,
    onAddComment,
    onRestoreVersion,
    readOnly = false,
}) => {
    const [items, setItems] = useState<HistorialItem[]>(initialItems || []);
    const [newComment, setNewComment] = useState('');
    const [filter, setFilter] = useState<Set<string>>(new Set());
    const [showOnlyUser, setShowOnlyUser] = useState<string | null>(null);

    // Datos de ejemplo
    const exampleItems: HistorialItem[] = [
        {
            id: '1',
            tipo: 'creacion',
            titulo: 'Cuña creada',
            descripcion: 'Se creó la cuña con nombre "Promo Verano 2024"',
            usuario: 'Carlos Mendoza',
            fecha: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
        {
            id: '2',
            tipo: 'modificacion',
            titulo: 'Audio actualizado',
            descripcion: 'Se subió archivo de audio: promo_verano_v2.mp3',
            usuario: 'María Elena',
            fecha: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
            metadata: { fileSize: '2.4 MB', duration: 30 },
        },
        {
            id: '3',
            tipo: 'cambio_estado',
            titulo: 'Estado cambiado a Pendiente',
            descripcion: 'Enviada a revisión para aprobación',
            usuario: 'Carlos Mendoza',
            fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
            id: '4',
            tipo: 'comentario',
            titulo: 'Comentario agregado',
            descripcion: 'El audio tiene un nivel de LUFS alto, revisar antes de aprobar',
            usuario: 'Juan Pérez',
            fecha: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
        },
        {
            id: '5',
            tipo: 'cambio_estado',
            titulo: 'Estado cambiado a Aprobada',
            descripcion: 'Aprobada por supervisor para emisión',
            usuario: 'Ana Supervisor',
            fecha: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        },
        {
            id: '6',
            tipo: 'envio',
            titulo: 'Enviada por Email',
            descripcion: 'Enviada a grupo "Operadores Radio Central"',
            usuario: 'Sistema',
            fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            metadata: { destinatarios: 15, canal: 'email' },
        },
        {
            id: '7',
            tipo: 'exportacion',
            titulo: 'Exportada a WideOrbit',
            descripcion: 'Cart #SPX123456 creado en estación Radio Central',
            usuario: 'Sistema',
            fecha: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            metadata: { sistema: 'wideorbit', cartId: 'SPX123456' },
        },
        {
            id: '8',
            tipo: 'version',
            titulo: 'Nueva versión',
            descripcion: 'Se creó versión 2 con audio actualizado',
            usuario: 'María Elena',
            fecha: new Date(Date.now() - 12 * 60 * 60 * 1000),
        },
        {
            id: '9',
            tipo: 'vista',
            titulo: 'Vista por operador',
            descripcion: 'Juan Pérez visualizó los detalles de la cuña',
            usuario: 'Juan Pérez',
            fecha: new Date(Date.now() - 6 * 60 * 60 * 1000),
        },
    ];

    const displayItems = items.length > 0 ? items : exampleItems;

    // Filtrar items
    const filteredItems = displayItems.filter(item => {
        if (filter.size > 0 && !filter.has(item.tipo)) return false;
        if (showOnlyUser && item.usuario !== showOnlyUser) return false;
        return true;
    });

    // Obtener usuarios únicos
    const uniqueUsers = [...new Set(displayItems.map(item => item.usuario))];

    // Toggle filtro
    const toggleFilter = useCallback((tipo: string) => {
        setFilter(prev => {
            const next = new Set(prev);
            if (next.has(tipo)) {
                next.delete(tipo);
            } else {
                next.add(tipo);
            }
            return next;
        });
    }, []);

    // Agregar comentario
    const handleAddComment = useCallback(() => {
        if (!newComment.trim()) return;

        const comment: HistorialItem = {
            id: `comment-${Date.now()}`,
            tipo: 'comentario',
            titulo: 'Comentario agregado',
            descripcion: newComment,
            usuario: 'Usuario Actual',
            fecha: new Date(),
        };

        setItems(prev => [comment, ...prev]);
        onAddComment?.(newComment);
        setNewComment('');
    }, [newComment, onAddComment]);

    // Obtener icono por tipo
    const getTipoIcon = (tipo: HistorialItem['tipo']) => {
        switch (tipo) {
            case 'creacion': return '✨';
            case 'modificacion': return '✏️';
            case 'cambio_estado': return '🔄';
            case 'envio': return '📤';
            case 'exportacion': return '🚀';
            case 'vista': return '👁️';
            case 'comentario': return '💬';
            case 'version': return '📋';
            default: return '📌';
        }
    };

    // Obtener color por tipo
    const getTipoColor = (tipo: HistorialItem['tipo']) => {
        switch (tipo) {
            case 'creacion': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
            case 'modificacion': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'cambio_estado': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            case 'envio': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
            case 'exportacion': return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300';
            case 'vista': return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
            case 'comentario': return 'bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300';
            case 'version': return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Formatear fecha relativa
    const formatRelativeTime = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `Hace ${minutes} min`;
        if (hours < 24) return `Hace ${hours} hr`;
        return `Hace ${days} días`;
    };

    // Tipos disponibles para filtro
    const tiposDisponibles = [
        { id: 'creacion', label: 'Creación' },
        { id: 'modificacion', label: 'Modificaciones' },
        { id: 'cambio_estado', label: 'Estados' },
        { id: 'envio', label: 'Envíos' },
        { id: 'exportacion', label: 'Exportaciones' },
        { id: 'comentario', label: 'Comentarios' },
        { id: 'version', label: 'Versiones' },
    ];

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    📜 Timeline de Historial
                </h3>
                <span className="text-sm text-gray-500">
                    {filteredItems.length} eventos
                </span>
            </div>

            {/* Filtros */}
            <div className="mb-6 space-y-3">
                <div className="flex flex-wrap gap-2">
                    {tiposDisponibles.map(tipo => (
                        <button
                            key={tipo.id}
                            onClick={() => toggleFilter(tipo.id)}
                            className={`
                                px-3 py-1.5 rounded-full text-xs font-medium transition
                                ${filter.has(tipo.id)
                                    ? 'bg-primary text-white'
                                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'}
                            `}
                        >
                            {getTipoIcon(tipo.id as HistorialItem['tipo'])} {tipo.label}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">Filtrar por usuario:</span>
                    <select
                        value={showOnlyUser || ''}
                        onChange={(e) => setShowOnlyUser(e.target.value || null)}
                        className="px-3 py-1.5 rounded-lg text-xs bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    >
                        <option value="">Todos</option>
                        {uniqueUsers.map(user => (
                            <option key={user} value={user}>{user}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Timeline */}
            <div className="relative">
                {/* Línea central */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

                {/* Items */}
                <div className="space-y-4">
                    {filteredItems.map((item, index) => (
                        <div key={item.id} className="relative flex gap-4">
                            {/* Icono */}
                            <div className={`
                                relative z-10 w-12 h-12 rounded-full flex items-center justify-center text-xl
                                ${getTipoColor(item.tipo)}
                            `}>
                                {getTipoIcon(item.tipo)}
                            </div>

                            {/* Contenido */}
                            <div className="flex-1 pb-4">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-medium text-gray-800 dark:text-white">
                                            {item.titulo}
                                        </h4>
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                            {item.descripcion}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">
                                        {formatRelativeTime(item.fecha)}
                                    </span>
                                </div>

                                {/* Metadata */}
                                {item.metadata && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {Object.entries(item.metadata).map(([key, value]) => (
                                            <span
                                                key={key}
                                                className="px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-400"
                                            >
                                                {key}: {String(value)}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {/* Usuario y acciones */}
                                <div className="mt-2 flex items-center justify-between">
                                    <span className="text-xs text-gray-500">
                                        👤 {item.usuario} • {item.fecha.toLocaleString()}
                                    </span>

                                    {item.tipo === 'version' && !readOnly && (
                                        <button
                                            onClick={() => onRestoreVersion?.(item.id)}
                                            className="text-xs text-primary hover:underline"
                                        >
                                            Restaurar versión
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {filteredItems.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        No hay eventos que coincidan con los filtros
                    </div>
                )}
            </div>

            {/* Agregar comentario */}
            {!readOnly && (
                <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                            👤
                        </div>
                        <div className="flex-1">
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Agregar un comentario..."
                                rows={2}
                                className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 resize-none text-sm"
                            />
                            <div className="flex justify-end mt-2">
                                <NeumorphicButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleAddComment}
                                    disabled={!newComment.trim()}
                                >
                                    💬 Comentar
                                </NeumorphicButton>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Resumen de actividad */}
            <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    📊 Resumen de Actividad
                </h4>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                        <div className="text-xl font-bold text-gray-600 dark:text-gray-400">
                            {displayItems.length}
                        </div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-green-500">
                            {displayItems.filter(i => i.tipo === 'creacion' || i.tipo === 'version').length}
                        </div>
                        <div className="text-xs text-gray-500">Versiones</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-blue-500">
                            {displayItems.filter(i => i.tipo === 'envio' || i.tipo === 'exportacion').length}
                        </div>
                        <div className="text-xs text-gray-500">Envíos</div>
                    </div>
                    <div>
                        <div className="text-xl font-bold text-pink-500">
                            {displayItems.filter(i => i.tipo === 'comentario').length}
                        </div>
                        <div className="text-xs text-gray-500">Comentarios</div>
                    </div>
                </div>
            </div>
        </NeumorphicCard>
    );
};

export default TimelineHistorial;
