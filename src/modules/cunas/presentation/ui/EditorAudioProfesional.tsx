/**
 * COMPONENT: EDITOR AUDIO PROFESIONAL (DAW)
 * 
 * Editor de audio profesional para el módulo Cuñas con capacidades de:
 * - Visualización de forma de onda (waveform)
 * - Reproducción con controles de transporte
 * - Marcadores de inicio/fin
 * - Análisis técnico en tiempo real (LUFS, peak, RMS)
 * - Zoom y navegación por timeline
 * - Edición básica (recorte de inicio/fin)
 * 
 * Diseño neumórfico mobile-first
 */

'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { NeumorphicCard, NeumorphicButton } from './NeumorphicComponents';

interface AudioAnalysis {
    duration: number;
    format: string;
    bitrate: number;
    sampleRate: number;
    channels: number;
    peakLevel: number;
    rmsLevel: number;
    lufsLevel: number;
    waveformData: number[];
    qualityScore: number;
}

interface Marker {
    id: string;
    time: number;
    label: string;
    color: string;
}

interface EditorAudioProfesionalProps {
    audioUrl?: string;
    audioData?: AudioAnalysis;
    duration?: number;
    onSave?: (editado: { inicio: number; fin: number; markerPoints: Marker[] }) => void;
    onCancel?: () => void;
    readOnly?: boolean;
}

export const EditorAudioProfesional: React.FC<EditorAudioProfesionalProps> = ({
    audioUrl,
    audioData,
    duration: propDuration,
    onSave,
    onCancel,
    readOnly = false,
}) => {
    // Estado de reproducción
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(propDuration || audioData?.duration || 0);

    // Estado de edición
    const [startMarker, setStartMarker] = useState(0);
    const [endMarker, setEndMarker] = useState(duration);
    const [markers, setMarkers] = useState<Marker[]>([]);
    const [activeMarker, setActiveMarker] = useState<string | null>(null);

    // Estado de zoom y viewport
    const [zoom, setZoom] = useState(1);
    const [scrollPosition, setScrollPosition] = useState(0);

    // Estado de análisis
    const [analysis, setAnalysis] = useState<AudioAnalysis | null>(audioData || null);

    // Refs
    const audioRef = useRef<HTMLAudioElement>(null);
    const waveformCanvasRef = useRef<HTMLCanvasElement>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    // Generar datos de waveform simulados si no hay datos reales
    const waveformData = analysis?.waveformData ||
        Array.from({ length: 200 }, () => Math.random() * 0.8 + 0.1);

    // Efecto para actualizar duración cuando cambia el prop
    useEffect(() => {
        if (propDuration) setDuration(propDuration);
    }, [propDuration]);

    // Efecto para dibujar waveform
    useEffect(() => {
        const canvas = waveformCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const { width, height } = canvas;
        const barWidth = (width / waveformData.length) * zoom;
        const centerY = height / 2;

        ctx.clearRect(0, 0, width, height);

        // Dibujar fondo
        ctx.fillStyle = '#1a1a2e';
        ctx.fillRect(0, 0, width, height);

        // Dibujar grid lines
        ctx.strokeStyle = '#2d2d44';
        ctx.lineWidth = 1;
        for (let i = 0; i <= 10; i++) {
            const x = (width / 10) * i;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }

        // Dibujar línea central
        ctx.strokeStyle = '#3d3d5c';
        ctx.beginPath();
        ctx.moveTo(0, centerY);
        ctx.lineTo(width, centerY);
        ctx.stroke();

        // Dibujar waveform
        waveformData.forEach((value, index) => {
            const x = index * barWidth;
            const barHeight = value * (height * 0.8);

            // Color según zona (inicio, fin, centro)
            let color = '#6366f1'; // Indigo por defecto
            if (x < startMarker * zoom * 10) {
                color = '#22c55e'; // Verde para zona de inicio
            } else if (x > endMarker * zoom * 10) {
                color = '#ef4444'; // Rojo para zona de fin
            }

            ctx.fillStyle = color;
            ctx.fillRect(x, centerY - barHeight / 2, barWidth - 1, barHeight);
        });

        // Dibujar marcadores
        markers.forEach(marker => {
            const x = marker.time * zoom * 10;
            ctx.strokeStyle = marker.color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();

            // Etiqueta
            ctx.fillStyle = marker.color;
            ctx.font = '10px sans-serif';
            ctx.fillText(marker.label, x + 2, 12);
        });

        // Dibujar marcadores de inicio/fin
        const startX = startMarker * zoom * 10;
        const endX = endMarker * zoom * 10;

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(startX, 0);
        ctx.lineTo(startX, height);
        ctx.stroke();

        ctx.strokeStyle = '#ef4444';
        ctx.beginPath();
        ctx.moveTo(endX, 0);
        ctx.lineTo(endX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Dibujar playhead
        const playheadX = currentTime * zoom * 10;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

    }, [waveformData, zoom, currentTime, startMarker, endMarker, markers]);

    // Handlers
    const handlePlayPause = useCallback(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
        setIsPlaying(!isPlaying);
    }, [isPlaying]);

    const handleTimeUpdate = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setCurrentTime(audio.currentTime);
        }
    }, []);

    const handleLoadedMetadata = useCallback(() => {
        const audio = audioRef.current;
        if (audio) {
            setDuration(audio.duration);
        }
    }, []);

    const handleSeek = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
        if (readOnly) return;

        const canvas = waveformCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = x / (zoom * 10);

        if (audioRef.current) {
            audioRef.current.currentTime = time;
            setCurrentTime(time);
        }
    }, [zoom, readOnly]);

    const handleAddMarker = useCallback(() => {
        if (readOnly) return;

        const newMarker: Marker = {
            id: `marker-${Date.now()}`,
            time: currentTime,
            label: `M${markers.length + 1}`,
            color: '#a855f7', // Púrpura
        };

        setMarkers([...markers, newMarker]);
    }, [currentTime, markers.length, readOnly]);

    const handleRemoveMarker = useCallback((markerId: string) => {
        if (readOnly) return;
        setMarkers(markers.filter(m => m.id !== markerId));
    }, [markers, readOnly]);

    const handleSetStartMarker = useCallback(() => {
        if (readOnly) return;
        setStartMarker(currentTime);
    }, [currentTime, readOnly]);

    const handleSetEndMarker = useCallback(() => {
        if (readOnly) return;
        setEndMarker(currentTime);
    }, [currentTime, readOnly]);

    const handleZoomIn = useCallback(() => {
        setZoom(Math.min(zoom * 1.5, 10));
    }, [zoom]);

    const handleZoomOut = useCallback(() => {
        setZoom(Math.max(zoom / 1.5, 0.5));
    }, [zoom]);

    const handleSave = useCallback(() => {
        if (onSave) {
            onSave({
                inicio: startMarker,
                fin: endMarker,
                markerPoints: markers,
            });
        }
    }, [startMarker, endMarker, markers, onSave]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    return (
        <NeumorphicCard padding="lg" className="w-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                    🎚️ Editor de Audio Profesional
                </h3>
                {readOnly && (
                    <span className="px-2 py-1 text-xs bg-gray-200 dark:bg-gray-700 rounded">
                        Solo lectura
                    </span>
                )}
            </div>

            {/* Audio element (hidden) */}
            {audioUrl && (
                <audio
                    ref={audioRef}
                    src={audioUrl}
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={handleLoadedMetadata}
                    onEnded={() => setIsPlaying(false)}
                />
            )}

            {/* Waveform Display */}
            <div
                ref={timelineRef}
                className="relative mb-4 rounded-xl overflow-hidden"
                style={{ background: '#1a1a2e' }}
            >
                <canvas
                    ref={waveformCanvasRef}
                    width={800}
                    height={200}
                    className="w-full cursor-pointer"
                    onClick={handleSeek}
                />

                {/* Time indicators */}
                <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 rounded text-white text-xs font-mono">
                    {formatTime(currentTime)}
                </div>
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 rounded text-white text-xs font-mono">
                    {formatTime(duration)}
                </div>
            </div>

            {/* Transport Controls */}
            <div className="flex items-center justify-center gap-4 mb-6">
                <button
                    onClick={() => setCurrentTime(0)}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Ir al inicio"
                >
                    ⏮️
                </button>

                <button
                    onClick={() => setCurrentTime(Math.max(0, currentTime - 5))}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Retroceder 5s"
                >
                    ⏪
                </button>

                <button
                    onClick={handlePlayPause}
                    className="p-4 rounded-full bg-primary text-white hover:bg-primary/90 transition shadow-lg"
                    title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                    {isPlaying ? '⏸️' : '▶️'}
                </button>

                <button
                    onClick={() => setCurrentTime(Math.min(duration, currentTime + 5))}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Avanzar 5s"
                >
                    ⏩
                </button>

                <button
                    onClick={() => setCurrentTime(duration)}
                    className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition"
                    title="Ir al final"
                >
                    ⏭️
                </button>
            </div>

            {/* Marker Controls */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <NeumorphicButton
                    variant="success"
                    size="sm"
                    onClick={handleSetStartMarker}
                    disabled={readOnly}
                    className="text-xs"
                >
                    📍 Inicio: {formatTime(startMarker)}
                </NeumorphicButton>

                <NeumorphicButton
                    variant="danger"
                    size="sm"
                    onClick={handleSetEndMarker}
                    disabled={readOnly}
                    className="text-xs"
                >
                    📍 Fin: {formatTime(endMarker)}
                </NeumorphicButton>

                <NeumorphicButton
                    variant="secondary"
                    size="sm"
                    onClick={handleAddMarker}
                    disabled={readOnly}
                    className="text-xs"
                >
                    ➕ Marker
                </NeumorphicButton>

                <NeumorphicButton
                    variant="secondary"
                    size="sm"
                    onClick={handleZoomIn}
                    className="text-xs"
                >
                    🔍+ Zoom
                </NeumorphicButton>
            </div>

            {/* Zoom Control */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-sm text-gray-600 dark:text-gray-400">Zoom:</span>
                <input
                    type="range"
                    min="0.5"
                    max="5"
                    step="0.1"
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="flex-1"
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-12">{zoom.toFixed(1)}x</span>
                <NeumorphicButton variant="secondary" size="sm" onClick={handleZoomOut}>
                    🔍-
                </NeumorphicButton>
            </div>

            {/* Markers List */}
            {markers.length > 0 && (
                <div className="mb-6">
                    <h4 className="text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">
                        Marcadores
                    </h4>
                    <div className="flex flex-wrap gap-2">
                        {markers.map(marker => (
                            <div
                                key={marker.id}
                                className="flex items-center gap-2 px-3 py-1 rounded-full text-sm"
                                style={{ backgroundColor: marker.color + '20', borderLeft: `3px solid ${marker.color}` }}
                            >
                                <span className="text-gray-700 dark:text-gray-300">
                                    {marker.label}: {formatTime(marker.time)}
                                </span>
                                {!readOnly && (
                                    <button
                                        onClick={() => handleRemoveMarker(marker.id)}
                                        className="text-gray-500 hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Technical Analysis Panel */}
            {analysis && (
                <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-xl">
                    <h4 className="text-sm font-semibold mb-3 text-gray-700 dark:text-gray-300">
                        📊 Análisis Técnico
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-primary">{analysis.duration}s</div>
                            <div className="text-xs text-gray-500">Duración</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-500">{analysis.lufsLevel} LUFS</div>
                            <div className="text-xs text-gray-500">Nivel LUFS</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-500">{analysis.peakLevel} dB</div>
                            <div className="text-xs text-gray-500">Peak</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-blue-500">{analysis.rmsLevel} dB</div>
                            <div className="text-xs text-gray-500">RMS</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-purple-500">{analysis.bitrate}</div>
                            <div className="text-xs text-gray-500">Bitrate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-500">{analysis.sampleRate}</div>
                            <div className="text-xs text-gray-500">Sample Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-pink-500">{analysis.channels}</div>
                            <div className="text-xs text-gray-500">Canales</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-cyan-500">{analysis.qualityScore}%</div>
                            <div className="text-xs text-gray-500">Quality Score</div>
                        </div>
                    </div>

                    {/* Compliance indicator */}
                    <div className="mt-4 flex items-center justify-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-sm ${analysis.lufsLevel >= -24 && analysis.lufsLevel <= -14
                                ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                                : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                            }`}>
                            {analysis.lufsLevel >= -24 && analysis.lufsLevel <= -14
                                ? '✅ Cumple estándar broadcast'
                                : '⚠️ Fuera de rango óptimo'}
                        </span>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!readOnly && (
                <div className="flex items-center justify-end gap-3">
                    <NeumorphicButton variant="secondary" onClick={onCancel}>
                        Cancelar
                    </NeumorphicButton>
                    <NeumorphicButton variant="primary" onClick={handleSave}>
                        💾 Guardar Cambios
                    </NeumorphicButton>
                </div>
            )}
        </NeumorphicCard>
    );
};

export default EditorAudioProfesional;
