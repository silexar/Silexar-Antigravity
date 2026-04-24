/**
 * 📱 CUNAS MOBILE EXPERIENCE - PWA & Touch-Optimized Components
 * 
 * @description Componentes optimizados para móvil y experiencia PWA
 * específicos para el módulo de Cuñas:
 * - Soporte offline para operaciones con cuñas
 * - Controles táctiles para editor de audio
 * - Interfaz mobile-first
 * - Sincronización en segundo plano
 * 
 * @version 2025.4.0
 */

'use client';

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wifi,
    WifiOff,
    Cloud,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    X,
    Clock,
    Smartphone,
    Monitor,
    ChevronLeft,
    ChevronRight,
    Play,
    Pause,
    SkipBack,
    SkipForward,
    Volume2,
    VolumeX,
    Maximize2,
    Share2,
    Download,
    Upload,
    Bell,
    BellOff,
    History,
    Edit3,
    Trash2,
    Copy,
    Filter,
    Search,
    Plus,
    Mic,
    Headphones,
    AudioLines
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

interface CunaMobileData {
    id: string;
    localId?: string;
    titulo: string;
    anunciante: string;
    duracion: number;
    estado: 'borrador' | 'validada' | 'aprobada' | 'rechazada' | 'expirada';
    audioUrl?: string;
    texto?: string;
    fechaCreacion: Date;
    fechaModificacion: Date;
    sincronizado: boolean;
}

interface OperacionCuna {
    id: string;
    tipo: 'CREAR' | 'ACTUALIZAR' | 'ELIMINAR' | 'DISTRIBUIR';
    cunaId: string;
    datos: Record<string, unknown>;
    timestamp: Date;
    estado: 'pendiente' | 'sincronizando' | 'completada' | 'error';
}

interface MobileAudioState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    muted: boolean;
    playbackRate: number;
}

// ═══════════════════════════════════════════════════════════════
// OFFLINE STORAGE FOR CUNAS
// ═══════════════════════════════════════════════════════════════

const CUNAS_STORAGE_KEY = 'silexar_cunas_offline';
const OPERACIONES_KEY = 'silexar_cunas_operaciones';

class CunasOfflineStorage {
    private static instance: CunasOfflineStorage;
    private operaciones: OperacionCuna[] = [];
    private cunasCache: CunaMobileData[] = [];
    private listeners: Set<(estado: CunasSyncEstado) => void> = new Set();
    private online = true;
    private syncTimer: NodeJS.Timeout | null = null;

    private estado: CunasSyncEstado = {
        online: true,
        ultimaSync: null,
        syncEnProgreso: false,
        operacionesPendientes: 0,
        conflictos: 0
    };

    private constructor() {
        this.inicializar();
    }

    static getInstance(): CunasOfflineStorage {
        if (!CunasOfflineStorage.instance) {
            CunasOfflineStorage.instance = new CunasOfflineStorage();
        }
        return CunasOfflineStorage.instance;
    }

    private inicializar(): void {
        if (typeof window !== 'undefined') {
            this.online = navigator.onLine;
            window.addEventListener('online', () => this.handleOnline());
            window.addEventListener('offline', () => this.handleOffline());
            this.cargarDatosLocales();
        }
    }

    private cargarDatosLocales(): void {
        try {
            const cunasGuardadas = localStorage.getItem(CUNAS_STORAGE_KEY);
            if (cunasGuardadas) {
                this.cunasCache = JSON.parse(cunasGuardadas).map((c: CunaMobileData) => ({
                    ...c,
                    fechaCreacion: new Date(c.fechaCreacion),
                    fechaModificacion: new Date(c.fechaModificacion)
                }));
            }

            const opsGuardadas = localStorage.getItem(OPERACIONES_KEY);
            if (opsGuardadas) {
                this.operaciones = JSON.parse(opsGuardadas).map((o: OperacionCuna) => ({
                    ...o,
                    timestamp: new Date(o.timestamp)
                }));
            }

            this.actualizarEstado();
        } catch (error) {
            console.error('[CunasOffline] Error cargando datos:', error);
        }
    }

    private guardarDatosLocales(): void {
        try {
            localStorage.setItem(CUNAS_STORAGE_KEY, JSON.stringify(this.cunasCache));
            localStorage.setItem(OPERACIONES_KEY, JSON.stringify(this.operaciones));
        } catch (error) {
            console.error('[CunasOffline] Error guardando datos:', error);
        }
    }

    private handleOnline(): void {
        console.log('[CunasOffline] ✅ Conexión recuperada');
        this.online = true;
        this.estado.online = true;
        this.notificarCambio();
        this.sincronizarOperaciones();
    }

    private handleOffline(): void {
        console.log('[CunasOffline] ❌ Sin conexión');
        this.online = false;
        this.estado.online = false;
        this.notificarCambio();
    }

    private actualizarEstado(): void {
        this.estado.operacionesPendientes = this.operaciones.filter(
            o => o.estado === 'pendiente' || o.estado === 'error'
        ).length;
    }

    private notificarCambio(): void {
        this.actualizarEstado();
        for (const listener of this.listeners) {
            listener(this.estado);
        }
    }

    // ═══════════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════════

    guardarCunaLocal(cuna: CunaMobileData): string {
        const localId = cuna.localId || `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const cunaToSave: CunaMobileData = {
            ...cuna,
            localId,
            sincronizado: false,
            fechaModificacion: new Date()
        };

        // Actualizar o agregar
        const index = this.cunasCache.findIndex(c => c.localId === localId);
        if (index >= 0) {
            this.cunasCache[index] = cunaToSave;
        } else {
            this.cunasCache.unshift(cunaToSave);
        }

        // Agregar operación
        this.agregarOperacion({
            tipo: cuna.id ? 'ACTUALIZAR' : 'CREAR',
            cunaId: localId,
            datos: cunaToSave as unknown as Record<string, unknown>
        });

        this.guardarDatosLocales();
        return localId;
    }

    obtenerCuna(localId: string): CunaMobileData | undefined {
        return this.cunasCache.find(c => c.localId === localId);
    }

    listarCunasLocales(): CunaMobileData[] {
        return [...this.cunasCache];
    }

    obtenerNoSincronizados(): CunaMobileData[] {
        return this.cunasCache.filter(c => !c.sincronizado);
    }

    eliminarCunaLocal(localId: string): void {
        const cuna = this.cunasCache.find(c => c.localId === localId);
        if (cuna) {
            this.agregarOperacion({
                tipo: 'ELIMINAR',
                cunaId: localId,
                datos: { id: cuna.id }
            });
            this.cunasCache = this.cunasCache.filter(c => c.localId !== localId);
            this.guardarDatosLocales();
        }
    }

    private agregarOperacion(params: { tipo: OperacionCuna['tipo']; cunaId: string; datos: Record<string, unknown> }): void {
        const operacion: OperacionCuna = {
            id: `op-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
            tipo: params.tipo,
            cunaId: params.cunaId,
            datos: params.datos,
            timestamp: new Date(),
            estado: 'pendiente'
        };

        this.operaciones.push(operacion);
        this.notificarCambio();
    }

    async sincronizarOperaciones(): Promise<void> {
        if (!this.online || this.estado.syncEnProgreso) return;

        this.estado.syncEnProgreso = true;
        this.notificarCambio();

        const pendientes = this.operaciones.filter(o => o.estado === 'pendiente');

        for (const operacion of pendientes) {
            try {
                operacion.estado = 'sincronizando';

                // Simular sync - en producción sería un fetch real
                await new Promise(resolve => setTimeout(resolve, 500));

                operacion.estado = 'completada';

                // Marcar cuna como sincronizada
                const cuna = this.cunasCache.find(c => c.localId === operacion.cunaId);
                if (cuna) {
                    cuna.sincronizado = true;
                }
            } catch (error) {
                operacion.estado = 'error';
            }
        }

        // Limpiar completadas
        this.operaciones = this.operaciones.filter(o => o.estado !== 'completada');

        this.estado.syncEnProgreso = false;
        this.estado.ultimaSync = new Date();
        this.actualizarEstado();
        this.guardarDatosLocales();
        this.notificarCambio();
    }

    suscribir(callback: (estado: CunasSyncEstado) => void): () => void {
        this.listeners.add(callback);
        callback(this.estado);
        return () => this.listeners.delete(callback);
    }

    getEstado(): CunasSyncEstado {
        return { ...this.estado };
    }

    isOnline(): boolean {
        return this.online;
    }
}

interface CunasSyncEstado {
    online: boolean;
    ultimaSync: Date | null;
    syncEnProgreso: boolean;
    operacionesPendientes: number;
    conflictos: number;
}

// ═══════════════════════════════════════════════════════════════
// HOOK: useCunasMobile
// ═══════════════════════════════════════════════════════════════

function useCunasMobile() {
    const storage = CunasOfflineStorage.getInstance();
    const [estado, setEstado] = useState<CunasSyncEstado>(storage.getEstado());

    useEffect(() => {
        const unsub = storage.suscribir(setEstado);
        return unsub;
    }, []);

    return {
        online: estado.online,
        ultimaSync: estado.ultimaSync,
        syncEnProgreso: estado.syncEnProgreso,
        operacionesPendientes: estado.operacionesPendientes,
        sincronizar: () => storage.sincronizarOperaciones(),
        guardarCunaLocal: (cuna: CunaMobileData) => storage.guardarCunaLocal(cuna),
        obtenerCuna: (localId: string) => storage.obtenerCuna(localId),
        listarCunasLocales: () => storage.listarCunasLocales(),
        eliminarCunaLocal: (localId: string) => storage.eliminarCunaLocal(localId),
        obtenerNoSincronizados: () => storage.obtenerNoSincronizados()
    };
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Mobile Status Bar
// ═══════════════════════════════════════════════════════════════

export function CunasMobileStatusBar() {
    const { online, syncEnProgreso, operacionesPendientes, sincronizar, ultimaSync } = useCunasMobile();
    const [showPanel, setShowPanel] = useState(false);

    const formatTiempo = (fecha: Date | null) => {
        if (!fecha) return 'Nunca';
        const diff = Date.now() - fecha.getTime();
        if (diff < 60000) return 'Hace un momento';
        if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
        return fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-slate-900 to-slate-800 text-white px-4 py-2 safe-area-top"
        >
            <div className="flex items-center justify-between max-w-7xl mx-auto">
                <div className="flex items-center gap-3">
                    <Smartphone className="w-5 h-5 text-primary-light" />
                    <span className="font-medium text-sm hidden sm:inline">Silexar Pulse Móvil</span>
                </div>

                <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div
                        onClick={() => setShowPanel(!showPanel)}
                        className={`
                            flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer
                            transition-all hover:opacity-80
                            ${online
                                ? operacionesPendientes > 0
                                    ? 'bg-amber-500/20 text-amber-300'
                                    : 'bg-green-500/20 text-green-300'
                                : 'bg-red-500/20 text-red-300'
                            }
                        `}
                    >
                        {online ? (
                            syncEnProgreso ? (
                                <>
                                    <RefreshCw className="w-3 h-3 animate-spin" />
                                    <span>Sincronizando...</span>
                                </>
                            ) : operacionesPendientes > 0 ? (
                                <>
                                    <Cloud className="w-3 h-3" />
                                    <span>{operacionesPendientes} pendientes</span>
                                </>
                            ) : (
                                <>
                                    <Wifi className="w-3 h-3" />
                                    <span>En línea</span>
                                </>
                            )
                        ) : (
                            <>
                                <WifiOff className="w-3 h-3" />
                                <span>Sin conexión</span>
                            </>
                        )}
                    </div>

                    {/* Sync button when online */}
                    {online && operacionesPendientes > 0 && !syncEnProgreso && (
                        <button
                            onClick={sincronizar}
                            className="p-2 bg-primary/20 rounded-full hover:bg-primary/30 transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Detail Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                    >
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-400">Última sincronización</span>
                                <span className="text-white">{formatTiempo(ultimaSync)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Operaciones pendientes</span>
                                <span className={operacionesPendientes > 0 ? 'text-amber-400' : 'text-green-400'}>
                                    {operacionesPendientes}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-slate-400">Dispositivo</span>
                                <span className="text-white">Móvil/Touch</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Touch Audio Player
// ═══════════════════════════════════════════════════════════════

export function CunasTouchAudioPlayer({
    audioUrl,
    titulo,
    anunciante,
    duracion,
    onPositionChange
}: {
    audioUrl: string;
    titulo: string;
    anunciante: string;
    duracion: number;
    onPositionChange?: (position: number) => void;
}) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const [state, setState] = useState<MobileAudioState>({
        isPlaying: false,
        currentTime: 0,
        duration: duracion || 0,
        volume: 1,
        muted: false,
        playbackRate: 1
    });

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const togglePlay = useCallback(() => {
        if (audioRef.current) {
            if (state.isPlaying) {
                audioRef.current.pause();
            } else {
                audioRef.current.play();
            }
        }
    }, [state.isPlaying]);

    const seek = useCallback((time: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = time;
        }
    }, []);

    const handleProgressClick = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        if (progressRef.current) {
            const rect = progressRef.current.getBoundingClientRect();
            const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
            const percent = (clientX - rect.left) / rect.width;
            const newTime = percent * state.duration;
            seek(newTime);
        }
    }, [state.duration, seek]);

    const skip = useCallback((seconds: number) => {
        if (audioRef.current) {
            const newTime = Math.max(0, Math.min(state.duration, audioRef.current.currentTime + seconds));
            seek(newTime);
        }
    }, [state.duration, seek, state.currentTime]);

    const toggleMute = useCallback(() => {
        if (audioRef.current) {
            audioRef.current.muted = !state.muted;
        }
    }, [state.muted]);

    const changePlaybackRate = useCallback(() => {
        if (audioRef.current) {
            const rates = [0.5, 0.75, 1, 1.25, 1.5, 2];
            const currentIndex = rates.indexOf(state.playbackRate);
            const nextIndex = (currentIndex + 1) % rates.length;
            audioRef.current.playbackRate = rates[nextIndex];
        }
    }, [state.playbackRate]);

    // Touch event handlers for swipe gestures
    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Track touch start for swipe detection
    }, []);

    const handleTouchEnd = useCallback((e: React.TouchEvent) => {
        // Detect swipe direction
        // Could implement swipe left/right for seek
    }, []);

    return (
        <div className="bg-slate-900 rounded-2xl p-4 text-white">
            <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={() => {
                    if (audioRef.current) {
                        setState(prev => ({
                            ...prev,
                            currentTime: audioRef.current!.currentTime
                        }));
                    }
                }}
                onLoadedMetadata={() => {
                    if (audioRef.current) {
                        setState(prev => ({
                            ...prev,
                            duration: audioRef.current!.duration || duracion
                        }));
                    }
                }}
                onPlay={() => setState(prev => ({ ...prev, isPlaying: true }))}
                onPause={() => setState(prev => ({ ...prev, isPlaying: false }))}
                onEnded={() => setState(prev => ({ ...prev, isPlaying: false }))}
            />

            {/* Track Info */}
            <div className="mb-4">
                <h3 className="font-semibold text-lg truncate">{titulo}</h3>
                <p className="text-slate-400 text-sm">{anunciante}</p>
            </div>

            {/* Progress Bar */}
            <div
                ref={progressRef}
                onClick={handleProgressClick}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className="relative h-2 bg-slate-700 rounded-full mb-2 cursor-pointer touch-manipulation"
            >
                <motion.div
                    className="absolute left-0 top-0 h-full bg-gradient-to-r from-primary to-primary-light rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${(state.currentTime / state.duration) * 100}%` }}
                    transition={{ duration: 0.1 }}
                />
                <div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                    style={{ left: `calc(${(state.currentTime / state.duration) * 100}% - 8px)` }}
                />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-slate-400 mb-4">
                <span>{formatTime(state.currentTime)}</span>
                <span>{formatTime(state.duration)}</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
                {/* Playback Rate */}
                <button
                    onClick={changePlaybackRate}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 text-sm font-medium hover:bg-slate-700 transition-colors"
                >
                    {state.playbackRate}x
                </button>

                {/* Skip Back */}
                <button
                    onClick={() => skip(-10)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                    <SkipBack className="w-5 h-5" />
                </button>

                {/* Play/Pause - Larger touch target */}
                <button
                    onClick={togglePlay}
                    className="w-16 h-16 flex items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark hover:opacity-90 transition-all shadow-lg active:scale-95"
                >
                    {state.isPlaying ? (
                        <Pause className="w-7 h-7" />
                    ) : (
                        <Play className="w-7 h-7 ml-1" />
                    )}
                </button>

                {/* Skip Forward */}
                <button
                    onClick={() => skip(10)}
                    className="w-12 h-12 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                    <SkipForward className="w-5 h-5" />
                </button>

                {/* Mute */}
                <button
                    onClick={toggleMute}
                    className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                    {state.muted ? (
                        <VolumeX className="w-5 h-5" />
                    ) : (
                        <Volume2 className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Mobile Cuña Card
// ═══════════════════════════════════════════════════════════════

export function CunasMobileCard({
    cuna,
    onPlay,
    onEdit,
    onDelete,
    onDuplicate
}: {
    cuna: CunaMobileData;
    onPlay?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
}) {
    const [showActions, setShowActions] = useState(false);

    const estadoColors: Record<CunaMobileData['estado'], string> = {
        borrador: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
        validada: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
        aprobada: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
        rechazada: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
        expirada: 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
    };

    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) return 'Hoy';
        if (days === 1) return 'Ayer';
        if (days < 7) return `Hace ${days} días`;
        return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`
                bg-white dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-700
                ${!cuna.sincronizado ? 'border-l-4 border-l-amber-400' : ''}
            `}
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 dark:text-white truncate">{cuna.titulo}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{cuna.anunciante}</p>
                </div>

                <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${estadoColors[cuna.estado]}`}>
                        {cuna.estado}
                    </span>
                    {!cuna.sincronizado && (
                        <span className="flex items-center gap-1 text-xs text-amber-500">
                            <Cloud className="w-3 h-3" />
                            Local
                        </span>
                    )}
                </div>
            </div>

            {/* Audio Info */}
            <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Headphones className="w-4 h-4" />
                    <span className="text-sm font-medium">{formatDuration(cuna.duracion)}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{formatDate(cuna.fechaModificacion)}</span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {/* Play Button */}
                {cuna.audioUrl && (
                    <button
                        onClick={onPlay}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-primary to-primary-dark text-white rounded-xl font-medium active:scale-95 transition-transform"
                    >
                        <Play className="w-4 h-4" />
                        <span>Reproducir</span>
                    </button>
                )}

                {/* More Actions */}
                <button
                    onClick={() => setShowActions(!showActions)}
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
                >
                    <Share2 className="w-4 h-4" />
                </button>
            </div>

            {/* Expanded Actions */}
            <AnimatePresence>
                {showActions && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700"
                    >
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                onClick={() => { onEdit?.(); setShowActions(false); }}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                            >
                                <Edit3 className="w-4 h-4" />
                                <span className="text-xs">Editar</span>
                            </button>
                            <button
                                onClick={() => { onDuplicate?.(); setShowActions(false); }}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300"
                            >
                                <Copy className="w-4 h-4" />
                                <span className="text-xs">Copiar</span>
                            </button>
                            <button
                                onClick={() => { onDelete?.(); setShowActions(false); }}
                                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                            >
                                <Trash2 className="w-4 h-4" />
                                <span className="text-xs">Eliminar</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Mobile Cuñas List View
// ═══════════════════════════════════════════════════════════════

export function CunasMobileList({
    initialCunas = []
}: {
    initialCunas?: CunaMobileData[];
}) {
    const { listarCunasLocales, eliminarCunaLocal } = useCunasMobile();
    const [cunas, setCunas] = useState<CunaMobileData[]>(initialCunas);
    const [filter, setFilter] = useState<CunaMobileData['estado'] | 'todas'>('todas');
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        // Load from local storage
        const locales = listarCunasLocales();
        setCunas(locales.length > 0 ? locales : initialCunas);
    }, [listarCunasLocales, initialCunas]);

    const filteredCunas = cunas.filter(cuna => {
        const matchesFilter = filter === 'todas' || cuna.estado === filter;
        const matchesSearch = cuna.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
            cuna.anunciante.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleDelete = useCallback((localId: string) => {
        if (confirm('¿Eliminar esta cuña?')) {
            eliminarCunaLocal(localId);
            setCunas(prev => prev.filter(c => c.localId !== localId));
        }
    }, [eliminarCunaLocal]);

    const filters: { key: typeof filter; label: string }[] = [
        { key: 'todas', label: 'Todas' },
        { key: 'borrador', label: 'Borrador' },
        { key: 'validada', label: 'Validadas' },
        { key: 'aprobada', label: 'Aprobadas' },
        { key: 'rechazada', label: 'Rechazadas' }
    ];

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-slate-900 safe-area-inset">
            {/* Search Bar */}
            <div className="sticky top-0 bg-slate-50 dark:bg-slate-900 z-10 p-4">
                <div className="flex gap-2">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar cuñas..."
                            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-sm"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                            w-12 h-12 flex items-center justify-center rounded-xl border transition-colors
                            ${showFilters
                                ? 'bg-primary text-white border-primary'
                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                            }
                        `}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                {/* Filters */}
                <AnimatePresence>
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-3 overflow-hidden"
                        >
                            <div className="flex flex-wrap gap-2">
                                {filters.map(({ key, label }) => (
                                    <button
                                        key={key}
                                        onClick={() => setFilter(key)}
                                        className={`
                                            px-4 py-2 rounded-full text-sm font-medium transition-colors
                                            ${filter === key
                                                ? 'bg-primary text-white'
                                                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700'
                                            }
                                        `}
                                    >
                                        {label}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* List */}
            <div className="px-4 pb-24 space-y-4">
                {filteredCunas.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
                        <AudioLines className="w-12 h-12 mb-4 opacity-50" />
                        <p className="text-lg font-medium">No hay cuñas</p>
                        <p className="text-sm">Crea una nueva cuña para comenzar</p>
                    </div>
                ) : (
                    filteredCunas.map((cuna) => (
                        <CunasMobileCard
                            key={cuna.localId || cuna.id}
                            cuna={cuna}
                            onEdit={() => console.log('Edit:', cuna.localId)}
                            onDelete={() => handleDelete(cuna.localId!)}
                            onDuplicate={() => console.log('Duplicate:', cuna.localId)}
                        />
                    ))
                )}
            </div>

            {/* FAB - New Cuña */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-primary to-primary-dark text-white rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
            >
                <Plus className="w-6 h-6" />
            </motion.button>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: PWA Install Prompt
// ═══════════════════════════════════════════════════════════════

export function CunasPWAInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [dismissed, setDismissed] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowPrompt(true);
        };

        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            setShowPrompt(false);
        }
        setDeferredPrompt(null);
    };

    const handleDismiss = () => {
        setDismissed(true);
        setShowPrompt(false);
        localStorage.setItem('pwa_install_dismissed', 'true');
    };

    if (!showPrompt || dismissed) return null;

    return (
        <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-800 p-4 shadow-2xl border-t border-slate-200 dark:border-slate-700 z-50"
        >
            <div className="max-w-lg mx-auto">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-xl flex items-center justify-center text-white">
                        <Smartphone className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <h3 className="font-semibold text-slate-800 dark:text-white">
                            Instalar Silexar Pulse
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                            Accede rápidamente desde tu pantalla de inicio
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex gap-3 mt-4">
                    <button
                        onClick={handleDismiss}
                        className="flex-1 py-3 text-slate-600 dark:text-slate-300 font-medium rounded-xl bg-slate-100 dark:bg-slate-700"
                    >
                        Ahora no
                    </button>
                    <button
                        onClick={handleInstall}
                        className="flex-1 py-3 text-white font-medium rounded-xl bg-gradient-to-r from-primary to-primary-dark"
                    >
                        Instalar
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT: Push Notifications Toggle
// ═══════════════════════════════════════════════════════════════

export function CunasNotificationsToggle() {
    const [enabled, setEnabled] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Check current permission
        if (typeof Notification !== 'undefined') {
            setEnabled(Notification.permission === 'granted');
        }
    }, []);

    const toggleNotifications = async () => {
        setLoading(true);
        try {
            if (enabled) {
                // Would unsubscribe from push
                setEnabled(false);
            } else {
                const permission = await Notification.requestPermission();
                setEnabled(permission === 'granted');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={toggleNotifications}
            disabled={loading}
            className={`
                w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-xl border 
                border-slate-200 dark:border-slate-700 transition-colors
                ${enabled ? 'border-primary' : ''}
            `}
        >
            <div className="flex items-center gap-3">
                {enabled ? (
                    <Bell className="w-5 h-5 text-primary" />
                ) : (
                    <BellOff className="w-5 h-5 text-slate-400" />
                )}
                <div className="text-left">
                    <p className="font-medium text-slate-800 dark:text-white">Notificaciones</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                        {enabled ? 'Activadas' : 'Desactivadas'}
                    </p>
                </div>
            </div>
            <div className={`
                w-12 h-7 rounded-full transition-colors relative
                ${enabled ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}
            `}>
                <div className={`
                    absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform
                    ${enabled ? 'left-6' : 'left-1'}
                `} />
            </div>
        </button>
    );
}

// ═══════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════

export {
    useCunasMobile,
    CunasOfflineStorage
};

export default {
    CunasMobileStatusBar,
    CunasTouchAudioPlayer,
    CunasMobileCard,
    CunasMobileList,
    CunasPWAInstallPrompt,
    CunasNotificationsToggle,
    useCunasMobile,
    CunasOfflineStorage
};

// Type for PWA install prompt event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: 'accepted' | 'dismissed';
        platform: string;
    }>;
    prompt(): Promise<void>;
}
