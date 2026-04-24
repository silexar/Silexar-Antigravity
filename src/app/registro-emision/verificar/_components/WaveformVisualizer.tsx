/**
 * 🌊 COMPONENT: WaveformVisualizer
 * 
 * Visualizador de forma de onda de audio con capacidades de
 * edición de clips y selección visual de regiones.
 * Diseño inspirado en software de edición de audio profesional.
 * 
 * @tier TIER_0_ENTERPRISE
 * @design NEUROMORPHIC + AUDIO ENGINEER
 */

'use client';

import { useState, useRef, useEffect } from 'react';
import {
    Play,
    Pause,
    Scissors,
    Volume2,
    ZoomIn,
    ZoomOut,
    SkipBack,
    SkipForward,
    RefreshCw
} from 'lucide-react';

interface WaveformVisualizerProps {
    audioUrl?: string;
    durationSeconds: number;
    waveformData?: number[]; // Array of normalized values 0-1
    regions?: { start: number; end: number; color: string; label?: string }[];
    onRegionSelect?: (start: number, end: number) => void;
    onClipGenerate?: (start: number, end: number) => void;
    className?: string;
}

export function WaveformVisualizer({
    audioUrl,
    durationSeconds,
    waveformData,
    regions = [],
    onRegionSelect,
    onClipGenerate,
    className = ''
}: WaveformVisualizerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [zoom, setZoom] = useState(1);
    const [selection, setSelection] = useState<{ start: number; end: number } | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState(0);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const animationRef = useRef<number | null>(null);

    // Generate mock waveform if not provided
    const data = waveformData || generateMockWaveform(200);

    // Draw waveform
    useEffect(() => {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        if (!canvas || !container) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const dpr = window.devicePixelRatio || 1;
        const width = container.clientWidth * zoom;
        const height = 120;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        canvas.style.width = `${width}px`;
        canvas.style.height = `${height}px`;
        ctx.scale(dpr, dpr);

        // Clear
        ctx.clearRect(0, 0, width, height);

        // Draw background grid
        ctx.strokeStyle = 'rgba(104, 136, 255, 0.1)';
        ctx.lineWidth = 1;
        for (let i = 0; i < width; i += 50) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }

        // Draw center line
        ctx.strokeStyle = 'rgba(104, 136, 255, 0.2)';
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Draw waveform
        const barWidth = (width / data.length) - 1;
        const centerY = height / 2;

        data.forEach((value, i) => {
            const barHeight = value * (height * 0.8);
            const x = i * (barWidth + 1);

            // Gradient for bars
            const gradient = ctx.createLinearGradient(x, centerY - barHeight / 2, x, centerY + barHeight / 2);
            gradient.addColorStop(0, '#6888ff');
            gradient.addColorStop(0.5, '#8fa8ff');
            gradient.addColorStop(1, '#6888ff');

            ctx.fillStyle = gradient;
            ctx.fillRect(x, centerY - barHeight / 2, barWidth, barHeight);
        });

        // Draw regions
        regions.forEach(region => {
            const startX = (region.start / durationSeconds) * width;
            const endX = (region.end / durationSeconds) * width;
            ctx.fillStyle = region.color + '40';
            ctx.fillRect(startX, 0, endX - startX, height);
            ctx.strokeStyle = region.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, 0, endX - startX, height);
        });

        // Draw selection
        if (selection) {
            const startX = (selection.start / durationSeconds) * width;
            const endX = (selection.end / durationSeconds) * width;
            ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
            ctx.fillRect(startX, 0, endX - startX, height);
            ctx.strokeStyle = '#10b981';
            ctx.lineWidth = 2;
            ctx.strokeRect(startX, 0, endX - startX, height);
        }

        // Draw playhead
        const playheadX = (currentTime / durationSeconds) * width;
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(playheadX, 0);
        ctx.lineTo(playheadX, height);
        ctx.stroke();

        // Draw time markers
        ctx.fillStyle = '#9aa3b8';
        ctx.font = '10px monospace';
        const numMarkers = Math.min(10, Math.floor(width / 80));
        for (let i = 0; i <= numMarkers; i++) {
            const time = (i / numMarkers) * durationSeconds;
            const x = (i / numMarkers) * width;
            ctx.fillText(formatTime(time), x + 2, height - 4);
        }

    }, [data, zoom, currentTime, selection, regions, durationSeconds]);

    // Animation loop for playhead
    useEffect(() => {
        if (isPlaying) {
            const startTime = Date.now() - currentTime * 1000;
            const animate = () => {
                const elapsed = (Date.now() - startTime) / 1000;
                if (elapsed >= durationSeconds) {
                    setIsPlaying(false);
                    setCurrentTime(0);
                } else {
                    setCurrentTime(elapsed);
                    animationRef.current = requestAnimationFrame(animate);
                }
            };
            animationRef.current = requestAnimationFrame(animate);
        }
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
        };
    }, [isPlaying, durationSeconds]);

    const handleCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / (rect.width)) * durationSeconds;
        setCurrentTime(time);
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = (x / (rect.width)) * durationSeconds;
        setIsDragging(true);
        setDragStart(time);
        setSelection({ start: time, end: time });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const time = Math.max(0, Math.min(durationSeconds, (x / (rect.width)) * durationSeconds));
        setSelection(prev => prev ? { ...prev, end: time } : null);
    };

    const handleMouseUp = () => {
        if (isDragging && selection) {
            const finalSelection = {
                start: Math.min(selection.start, selection.end),
                end: Math.max(selection.start, selection.end)
            };
            setSelection(finalSelection);
            setIsDragging(false);
            onRegionSelect?.(finalSelection.start, finalSelection.end);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        const ms = Math.floor((seconds % 1) * 100);
        return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
    };

    const handlePlay = () => {
        if (currentTime >= durationSeconds) {
            setCurrentTime(0);
        }
        setIsPlaying(!isPlaying);
    };

    const handleSkipBack = () => setCurrentTime(Math.max(0, currentTime - 5));
    const handleSkipForward = () => setCurrentTime(Math.min(durationSeconds, currentTime + 5));

    const handleGenerateClip = () => {
        if (selection) {
            onClipGenerate?.(selection.start, selection.end);
        }
    };

    return (
        <div className={`bg-[#e0e5ec] rounded-2xl p-4 shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff] ${className}`}>

            {/* Canvas Container */}
            <div
                ref={containerRef}
                className="relative h-[120px] bg-white rounded-xl overflow-hidden cursor-crosshair shadow-inner"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                <canvas
                    ref={canvasRef}
                    onClick={handleCanvasClick}
                    className="w-full h-full"
                />

                {/* Time Display Overlay */}
                <div className="absolute top-2 right-2 px-3 py-1 bg-black/60 text-white text-xs font-mono rounded-lg">
                    {formatTime(currentTime)} / {formatTime(durationSeconds)}
                </div>
            </div>

            {/* Controls */}
            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Play/Pause */}
                    <button
                        onClick={handlePlay}
                        className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] text-white flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                    >
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>

                    {/* Skip buttons */}
                    <button
                        onClick={handleSkipBack}
                        className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <SkipBack className="w-4 h-4" />
                    </button>
                    <button
                        onClick={handleSkipForward}
                        className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <SkipForward className="w-4 h-4" />
                    </button>

                    {/* Volume */}
                    <div className="flex items-center gap-1 px-3 py-2 rounded-xl bg-white shadow-md">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <input
                            type="range"
                            min="0"
                            max="100"
                            defaultValue="80"
                            className="w-16 h-1 accent-[#6888ff]"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Zoom controls */}
                    <button
                        onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                        className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <ZoomOut className="w-4 h-4" />
                    </button>
                    <span className="text-xs text-slate-400 font-mono w-12 text-center">{Math.round(zoom * 100)}%</span>
                    <button
                        onClick={() => setZoom(z => Math.min(3, z + 0.25))}
                        className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Reset */}
                    <button
                        onClick={() => { setSelection(null); setCurrentTime(0); }}
                        className="w-8 h-8 rounded-lg bg-white shadow-md flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Selection Info & Clip Generation */}
            {selection && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Scissors className="w-5 h-5 text-emerald-600" />
                        <div>
                            <p className="text-sm font-bold text-emerald-700">Región Seleccionada</p>
                            <p className="text-xs text-emerald-600 font-mono">
                                {formatTime(Math.min(selection.start, selection.end))} — {formatTime(Math.max(selection.start, selection.end))}
                                <span className="ml-2 text-emerald-500">
                                    ({(Math.abs(selection.end - selection.start)).toFixed(1)}s)
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateClip}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2"
                    >
                        <Scissors className="w-4 h-4" />
                        Generar Clip
                    </button>
                </div>
            )}
        </div>
    );
}

// Generate mock waveform data
function generateMockWaveform(numBars: number): number[] {
    const data: number[] = [];
    for (let i = 0; i < numBars; i++) {
        // Create a more realistic waveform pattern
        const base = Math.sin(i * 0.1) * 0.3 + 0.5;
        const noise = Math.random() * 0.4;
        const spike = Math.random() > 0.95 ? Math.random() * 0.3 : 0;
        data.push(Math.min(1, Math.max(0.1, base + noise + spike)));
    }
    return data;
}
