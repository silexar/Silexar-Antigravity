/**
 * 🚨 COMPONENT: AlertTrackingPanel
 * 
 * Panel de seguimiento de alertas enviadas a programación.
 * Muestra estado en tiempo real de cada programado y permite
 * seguimiento completo de la incidencia.
 * 
 * @tier TIER_0_ENTERPRISE
 * @design NEUROMORPHIC
 */

'use client';

import { useState } from 'react';
import {
    CheckCircle2,
    Clock,
    MessageSquare,
    User,
    Radio,
    Bell,
    AlertTriangle,
    ChevronDown,
    ChevronUp,
    RefreshCw
} from 'lucide-react';

interface ProgrammerStatus {
    id: string;
    name: string;
    role: string;
    station: string;
    status: 'pendiente' | 'visto' | 'asignado' | 'respondido';
    lastSeen: string;
    response?: string;
    avatar?: string;
}

interface AlertTrackingPanelProps {
    isOpen: boolean;
    onClose: () => void;
    alertId: string;
    materialName: string;
    programmers: ProgrammerStatus[];
    onRemind?: (programmerId: string) => void;
    onContactDirect?: (programmerId: string) => void;
}

export function AlertTrackingPanel({
    isOpen,
    onClose,
    alertId,
    materialName,
    programmers,
    onRemind,
    onContactDirect
}: AlertTrackingPanelProps) {
    const [expanded, setExpanded] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    if (!isOpen) return null;

    const handleRefresh = () => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 1000);
    };

    const getStatusBadge = (status: ProgrammerStatus['status']) => {
        switch (status) {
            case 'pendiente':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-500 text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        Pendiente
                    </span>
                );
            case 'visto':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold">
                        <Bell className="w-3 h-3" />
                        Visto
                    </span>
                );
            case 'asignado':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-50 text-amber-600 text-xs font-bold">
                        <User className="w-3 h-3" />
                        Asignado
                    </span>
                );
            case 'respondido':
                return (
                    <span className="flex items-center gap-1 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-xs font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Respondido
                    </span>
                );
        }
    };

    const respondedCount = programmers.filter(p => p.status === 'respondido').length;
    const totalCount = programmers.length;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-[#F0EDE8]/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Panel */}
            <div className="relative w-full max-w-2xl bg-[#e0e5ec] rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/40">

                {/* Header */}
                <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-6 text-white">
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
                                <Bell className="w-6 h-6" /> SEGUIMIENTO DE ALERTA
                            </h2>
                            <p className="text-amber-100 text-sm font-medium mt-1 opacity-90">
                                ID Seguimiento: {alertId}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
                        >
                            <ChevronUp className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">

                    {/* Alert Summary */}
                    <div className="bg-white rounded-2xl p-5 shadow-[inset_2px_2px_5px_#b8b9be,inset_-2px_-2px_5px_#ffffff]">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4 text-amber-500" /> Detalle de Incidencia
                            </h3>
                            <button
                                onClick={handleRefresh}
                                className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
                                disabled={refreshing}
                            >
                                <RefreshCw className={`w-4 h-4 text-slate-500 ${refreshing ? 'animate-spin' : ''}`} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-[10px] font-bold text-[#888780] uppercase">Material</p>
                                <p className="font-semibold text-slate-700">{materialName}</p>
                            </div>
                            <div>
                                <p className="text-[10px] font-bold text-[#888780] uppercase">Respuestas</p>
                                <p className="font-semibold text-slate-700">{respondedCount} / {totalCount}</p>
                            </div>
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Progreso de Respuesta</span>
                            <span>{Math.round((respondedCount / totalCount) * 100)}%</span>
                        </div>
                        <div className="h-3 bg-slate-200 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all duration-500"
                                style={{ width: `${(respondedCount / totalCount) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Programmers List */}
                    <div className="space-y-3">
                        <h3 className="text-sm font-black text-slate-700 uppercase tracking-wide flex items-center gap-2">
                            <Radio className="w-4 h-4 text-slate-500" /> Programadores Contactados
                        </h3>

                        {programmers.map((prog) => (
                            <div
                                key={prog.id}
                                className={`
                  relative p-4 rounded-2xl transition-all
                  ${prog.status === 'respondido'
                                        ? 'bg-emerald-50 border border-emerald-200'
                                        : prog.status === 'asignado'
                                            ? 'bg-amber-50 border border-amber-200'
                                            : 'bg-white border border-slate-100'}
                  shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
                `}
                            >
                                <div className="flex items-start justify-between">
                                    {/* Avatar & Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                                {prog.avatar || prog.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className={`absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-white ${prog.status === 'respondido' ? 'bg-emerald-500' :
                                                prog.status === 'asignado' ? 'bg-amber-500' :
                                                    prog.status === 'visto' ? 'bg-blue-500' :
                                                        'bg-slate-400'
                                                }`} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-700">{prog.name}</p>
                                            <p className="text-xs text-slate-500 uppercase">{prog.role}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">📻 {prog.station}</p>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="flex flex-col items-end gap-2">
                                        {getStatusBadge(prog.status)}
                                        {prog.lastSeen && (
                                            <span className="text-[10px] text-slate-400">
                                                {prog.status === 'respondido' ? 'Respondió' : 'Último seen'}: {prog.lastSeen}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Response Message */}
                                {prog.response && (
                                    <div className="mt-3 pt-3 border-t border-slate-100">
                                        <div className="flex items-start gap-2">
                                            <MessageSquare className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <p className="text-sm text-slate-600 italic">"{prog.response}"</p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                {prog.status !== 'respondido' && (
                                    <div className="mt-3 pt-3 border-t border-slate-100 flex gap-2">
                                        {onRemind && (
                                            <button
                                                onClick={() => onRemind(prog.id)}
                                                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <Bell className="w-3 h-3" />
                                                Recordar
                                            </button>
                                        )}
                                        {onContactDirect && (
                                            <button
                                                onClick={() => onContactDirect(prog.id)}
                                                className="flex-1 py-2 px-3 rounded-xl bg-[#6888ff] hover:bg-[#5572ee] text-white text-xs font-bold transition-all flex items-center justify-center gap-1"
                                            >
                                                <MessageSquare className="w-3 h-3" />
                                                Contactar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Estimated Resolution */}
                    <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-700">Tiempo Estimado Resolución</p>
                                    <p className="text-xs text-slate-500">Basado en historial de respuestas</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xl font-black text-slate-700">30 min</p>
                                <p className="text-[10px] text-slate-400">aproximado</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="flex gap-4">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-bold text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                        >
                            Cerrar
                        </button>
                        <button
                            onClick={() => {/* New consultation */ }}
                            className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#6888ff] to-[#5572ee] shadow-lg hover:shadow-xl transition-all"
                        >
                            Nueva Consulta
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
