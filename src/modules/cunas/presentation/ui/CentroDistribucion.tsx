/**
 * COMPONENT: CENTRO DE DISTRIBUCIÓN Y ENVÍOS
 * 
 * Panel completo para gestionar la distribución de cuñas:
 * - Configuración de grupos de distribución
 * - Gestión de destinatarios
 * - Selección de canales (email, WhatsApp, FTP, API)
 * - Programación de envíos
 * - Tracking y seguimiento
 * - Historial de envíos
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';

interface Destinatario {
    id: string;
    nombre: string;
    email?: string;
    telefono?: string;
    rol: 'operator' | 'sales_rep' | 'supervisor' | 'programmer' | 'client';
    estaciones?: string[];
    activo: boolean;
}

interface GrupoDistribucion {
    id: string;
    nombre: string;
    descripcion?: string;
    canal: 'email' | 'whatsapp' | 'ftp' | 'api';
    destinatarios: Destinatario[];
    plantillas: string[];
    activo: boolean;
}

interface Envio {
    id: string;
    grupoId: string;
    cunaId: string;
    cunaNombre: string;
    destinatarios: number;
    estado: 'enviado' | 'fallido' | 'pendiente' | 'entregado';
    fecha: Date;
    canal: string;
}

interface CentroDistribucionProps {
    cunaId?: string;
    cunaNombre?: string;
    gruposExistentes?: GrupoDistribucion[];
    onEnviar?: (grupoId: string, opciones: object) => void;
    onClose?: () => void;
}

export const CentroDistribucion: React.FC<CentroDistribucionProps> = ({
    cunaId,
    cunaNombre,
    gruposExistentes = [],
    onEnviar,
    onClose,
}) => {
    const [activeTab, setActiveTab] = useState<'grupos' | 'destinatarios' | 'envios' | 'plantillas'>('grupos');
    const [grupos, setGrupos] = useState<GrupoDistribucion[]>(gruposExistentes);
    const [selectedGrupos, setSelectedGrupos] = useState<Set<string>>(new Set());
    const [showNewGroupModal, setShowNewGroupModal] = useState(false);
    const [showNewDestModal, setShowNewDestModal] = useState(false);
    const [isSending, setIsSending] = useState(false);

    // Destinatarios de ejemplo
    const [destinatarios, setDestinatarios] = useState<Destinatario[]>([
        { id: '1', nombre: 'Carlos Mendoza', email: 'carlos@radio.cl', rol: 'operator', estaciones: ['Radio Central'], activo: true },
        { id: '2', nombre: 'María Elena Soto', email: 'maria@radio.cl', telefono: '+56912345678', rol: 'programmer', estaciones: ['Radio Central', 'Radio Musical'], activo: true },
        { id: '3', nombre: 'Juan Pérez', email: 'juan@agencia.cl', rol: 'supervisor', activo: true },
        { id: '4', nombre: 'Ana María López', email: 'ana@cliente.com', rol: 'client', activo: true },
    ]);

    // Envíos recientes
    const [enviosRecientes] = useState<Envio[]>([
        { id: '1', grupoId: 'g1', cunaId: 'c1', cunaNombre: 'Promo Verano 2024', destinatarios: 15, estado: 'entregado', fecha: new Date(Date.now() - 86400000), canal: 'email' },
        { id: '2', grupoId: 'g2', cunaId: 'c2', cunaNombre: 'Spot Nike', destinatarios: 8, estado: 'enviado', fecha: new Date(Date.now() - 3600000), canal: 'whatsapp' },
        { id: '3', grupoId: 'g1', cunaId: 'c3', cunaNombre: 'Mención McDonalds', destinatarios: 15, estado: 'fallido', fecha: new Date(Date.now() - 7200000), canal: 'email' },
    ]);

    // Toggle grupo seleccionado
    const toggleGrupo = useCallback((grupoId: string) => {
        setSelectedGrupos(prev => {
            const next = new Set(prev);
            if (next.has(grupoId)) {
                next.delete(grupoId);
            } else {
                next.add(grupoId);
            }
            return next;
        });
    }, []);

    // Enviar a grupos seleccionados
    const handleEnviar = useCallback(async () => {
        if (selectedGrupos.size === 0 || !cunaId) return;

        setIsSending(true);

        // Simular envío
        await new Promise(resolve => setTimeout(resolve, 2000));

        selectedGrupos.forEach(grupoId => {
            onEnviar?.(grupoId, { cunaId });
        });

        setIsSending(false);
        setSelectedGrupos(new Set());
    }, [selectedGrupos, cunaId, onEnviar]);

    // Agregar nuevo grupo
    const handleNewGroup = useCallback((nombre: string, canal: GrupoDistribucion['canal']) => {
        const newGroup: GrupoDistribucion = {
            id: `g-${Date.now()}`,
            nombre,
            canal,
            destinatarios: [],
            plantillas: [],
            activo: true,
        };
        setGrupos(prev => [...prev, newGroup]);
        setShowNewGroupModal(false);
    }, []);

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                        📤 Centro de Distribución
                    </h3>
                    {cunaNombre && (
                        <p className="text-sm text-gray-500">
                            Cuña: {cunaNombre}
                        </p>
                    )}
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6 overflow-x-auto">
                {[
                    { id: 'grupos', label: 'Grupos', icon: '👥' },
                    { id: 'destinatarios', label: 'Destinatarios', icon: '📋' },
                    { id: 'envios', label: 'Envíos', icon: '📬' },
                    { id: 'plantillas', label: 'Plantillas', icon: '📝' },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={`
                            flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap
                            border-b-2 transition-colors
                            ${activeTab === tab.id
                                ? 'border-primary text-primary'
                                : 'border-transparent text-gray-500 hover:text-gray-700'}
                        `}
                    >
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'grupos' && (
                <div className="space-y-4">
                    {/* Acciones */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {selectedGrupos.size} grupo(s) seleccionado(s)
                        </span>
                        <div className="flex gap-2">
                            <NeumorphicButton
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowNewGroupModal(true)}
                            >
                                ➕ Nuevo Grupo
                            </NeumorphicButton>
                            {selectedGrupos.size > 0 && cunaId && (
                                <NeumorphicButton
                                    variant="primary"
                                    size="sm"
                                    onClick={handleEnviar}
                                    disabled={isSending}
                                >
                                    {isSending ? '🔄 Enviando...' : '📤 Enviar'}
                                </NeumorphicButton>
                            )}
                        </div>
                    </div>

                    {/* Lista de grupos */}
                    <div className="space-y-3">
                        {grupos.map(grupo => (
                            <div
                                key={grupo.id}
                                className={`
                                    p-4 rounded-xl border-2 transition-all cursor-pointer
                                    ${selectedGrupos.has(grupo.id)
                                        ? 'border-primary bg-primary/5'
                                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800'}
                                    hover:border-primary/50
                                `}
                                onClick={() => toggleGrupo(grupo.id)}
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            checked={selectedGrupos.has(grupo.id)}
                                            onChange={() => toggleGrupo(grupo.id)}
                                            className="w-5 h-5 rounded"
                                        />
                                        <div>
                                            <div className="font-medium text-gray-800 dark:text-white">
                                                {grupo.nombre}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {grupo.canal} • {grupo.destinatarios.length} destinatarios
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs ${grupo.activo
                                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                                : 'bg-gray-100 text-gray-500'
                                            }`}>
                                            {grupo.activo ? 'Activo' : 'Inactivo'}
                                        </span>
                                        <span className="text-2xl">
                                            {grupo.canal === 'email' ? '📧' : grupo.canal === 'whatsapp' ? '💬' : grupo.canal === 'ftp' ? '📁' : '🔌'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {grupos.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No hay grupos configurados
                                <button
                                    onClick={() => setShowNewGroupModal(true)}
                                    className="block mx-auto mt-2 text-primary hover:underline"
                                >
                                    Crear el primero
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {activeTab === 'destinatarios' && (
                <div className="space-y-4">
                    <div className="flex justify-end">
                        <NeumorphicButton
                            variant="secondary"
                            size="sm"
                            onClick={() => setShowNewDestModal(true)}
                        >
                            ➕ Agregar Destinatario
                        </NeumorphicButton>
                    </div>

                    <div className="space-y-2">
                        {destinatarios.map(dest => (
                            <div
                                key={dest.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                                        {dest.rol === 'operator' ? '🎙️' :
                                            dest.rol === 'programmer' ? '🎛️' :
                                                dest.rol === 'supervisor' ? '👔' :
                                                    dest.rol === 'client' ? '👤' : '👥'}
                                    </div>
                                    <div>
                                        <div className="font-medium text-gray-800 dark:text-white">
                                            {dest.nombre}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {dest.email || dest.telefono}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                                        {dest.rol}
                                    </span>
                                    <span className={`w-3 h-3 rounded-full ${dest.activo ? 'bg-green-500' : 'bg-gray-400'}`} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'envios' && (
                <div className="space-y-4">
                    <h4 className="font-medium text-gray-800 dark:text-white">
                        📬 Envíos Recientes
                    </h4>
                    <div className="space-y-2">
                        {enviosRecientes.map(envio => (
                            <div
                                key={envio.id}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl"
                            >
                                <div>
                                    <div className="font-medium text-gray-800 dark:text-white">
                                        {envio.cunaNombre}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                        {envio.fecha.toLocaleString()} • {envio.destinatarios} destinatarios
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">
                                        {envio.canal === 'email' ? '📧' : '💬'}
                                    </span>
                                    <span className={`px-2 py-1 rounded text-xs ${envio.estado === 'entregado' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                                            envio.estado === 'enviado' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                                                envio.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                                                    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                                        }`}>
                                        {envio.estado}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'plantillas' && (
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { id: 'standard', name: 'Email Estándar', icon: '📧', desc: 'Plantilla básica comercial' },
                            { id: 'urgent', name: 'Entrega Urgente', icon: '🚨', desc: 'Para envíos prioritarios' },
                            { id: 'renewal', name: 'Recordatorio Renovación', icon: '📅', desc: 'Vencimientos próximos' },
                            { id: 'confirmation', name: 'Confirmación', icon: '✅', desc: 'Confirmar recepción' },
                        ].map(template => (
                            <div
                                key={template.id}
                                className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                            >
                                <div className="text-2xl mb-2">{template.icon}</div>
                                <div className="font-medium text-gray-800 dark:text-white">
                                    {template.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {template.desc}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Modal Nuevo Grupo */}
            {showNewGroupModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <NeumorphicCard padding="lg" className="w-full max-w-md">
                        <h3 className="text-lg font-semibold mb-4">Nuevo Grupo de Distribución</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Nombre</label>
                                <input
                                    type="text"
                                    id="newGroupName"
                                    placeholder="Ej: Operadores Radio Central"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Canal</label>
                                <select
                                    id="newGroupCanal"
                                    className="w-full p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                                >
                                    <option value="email">📧 Email</option>
                                    <option value="whatsapp">💬 WhatsApp</option>
                                    <option value="ftp">📁 FTP</option>
                                    <option value="api">🔌 API</option>
                                </select>
                            </div>
                            <div className="flex justify-end gap-2">
                                <NeumorphicButton variant="secondary" onClick={() => setShowNewGroupModal(false)}>
                                    Cancelar
                                </NeumorphicButton>
                                <NeumorphicButton
                                    variant="primary"
                                    onClick={() => {
                                        const nombre = (document.getElementById('newGroupName') as HTMLInputElement).value;
                                        const canal = (document.getElementById('newGroupCanal') as HTMLSelectElement).value as GrupoDistribucion['canal'];
                                        if (nombre) handleNewGroup(nombre, canal);
                                    }}
                                >
                                    Crear
                                </NeumorphicButton>
                            </div>
                        </div>
                    </NeumorphicCard>
                </div>
            )}
        </NeumorphicCard>
    );
};

export default CentroDistribucion;
