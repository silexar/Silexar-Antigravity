'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import {
    Play, Pause, Download, ExternalLink, Lock, CheckCircle, AlertCircle,
    Loader2, Calendar, Clock, User, Radio
} from 'lucide-react';

// ─── Tokens de diseño ───
const BG = 'bg-[#dfeaff]';
const TEXT = 'text-[#69738c]';
const TEXT_DARK = 'text-slate-700';
const TEXT_LIGHT = 'text-[#9aa3b8]';
const SHADOW_OUT = 'shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]';
const SHADOW_IN = 'shadow-[inset_4px_4px_8px_#bec8de,inset_-4px_-4px_8px_#ffffff]';
const ACCENT = 'bg-[#6888ff]';

interface MaterialData {
    id: string;
    codigo: string;
    nombre: string;
    tipo: 'audio_pregrabado' | 'mencion_vivo';
    fecha: string;
    hora: string;
    horaFin?: string;
    duracion: number;
    anunciante: string;
    campana: string;
    emisora: string;
    archivoUrl: string;
    expiresAt: string;
}

export default function EscucharPage({ params }: { params: Promise<{ codigo: string }> }) {
    const { codigo } = use(params);
    const router = useRouter();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [material, setMaterial] = useState<MaterialData | null>(null);
    const [accessCode, setAccessCode] = useState('');
    const [requiresCode, setRequiresCode] = useState(false);
    const [codeVerified, setCodeVerified] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Primero verificar el código del link
        fetch(`/api/registro-emision/secure-link/${codigo}`)
            .then(r => r.json())
            .then(j => {
                if (!j.data) {
                    setError('Este link ha expirado o no existe');
                    setLoading(false);
                    return;
                }

                const linkData = j.data;
                setMaterial({
                    id: linkData.materialId,
                    codigo: linkData.codigo,
                    nombre: linkData.nombreMaterial || 'Material de audio',
                    tipo: linkData.tipoMaterial || 'audio_pregrabado',
                    fecha: linkData.fecha,
                    hora: linkData.hora,
                    duracion: linkData.duracion || 30,
                    anunciante: linkData.anunciante || 'Cliente',
                    campana: linkData.campana || 'Campaña',
                    emisora: linkData.emisora || 'Emisora',
                    archivoUrl: linkData.archivoUrl || '/audio-demo.mp3',
                    expiresAt: linkData.expiresAt,
                });
                setRequiresCode(linkData.requireCode || false);
                setCodeVerified(!linkData.requireCode);
                setLoading(false);
            })
            .catch(() => {
                setError('Error al validar el link');
                setLoading(false);
            });
    }, [codigo]);

    const verifyCode = () => {
        // Simular verificación de código
        if (accessCode.length === 6) {
            setCodeVerified(true);
        } else {
            alert('Código inválido. Debe ser de 6 caracteres.');
        }
    };

    const togglePlay = () => {
        setPlaying(prev => !prev);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#dfeaff] flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-[#6888ff]" />
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-[#dfeaff] flex items-center justify-center p-4">
            <div className={`bg-[#dfeaff] rounded-3xl p-8 ${SHADOW_OUT} max-w-md w-full text-center`}>
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-xl font-bold text-slate-700 mb-2">Link no válido</h1>
                <p className="text-[#9aa3b8]">{error}</p>
            </div>
        </div>
    );

    if (requiresCode && !codeVerified) {
        return (
            <div className="min-h-screen bg-[#dfeaff] flex items-center justify-center p-4">
                <div className={`bg-[#dfeaff] rounded-3xl p-8 ${SHADOW_OUT} max-w-md w-full text-center`}>
                    <Lock className="h-16 w-16 text-[#6888ff] mx-auto mb-4" />
                    <h1 className="text-xl font-bold text-slate-700 mb-2">Acceso Restringido</h1>
                    <p className="text-[#9aa3b8] mb-6">Este material requiere un código de acceso</p>

                    <div className={`rounded-xl ${SHADOW_IN} p-4 mb-4`}>
                        <input
                            type="text"
                            value={accessCode}
                            onChange={e => setAccessCode(e.target.value.toUpperCase())}
                            placeholder="Código de 6 caracteres"
                            maxLength={6}
                            className={`w-full bg-transparent text-center text-2xl tracking-widest outline-none placeholder:text-[#9aa3b8]`}
                        />
                    </div>

                    <button
                        onClick={verifyCode}
                        disabled={accessCode.length !== 6}
                        className={`w-full rounded-xl py-3 font-semibold text-white ${ACCENT} ${SHADOW_OUT} disabled:opacity-50`}
                    >
                        Verificar Código
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#dfeaff] p-4 md:p-8">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Header */}
                <div className={`rounded-3xl bg-[#dfeaff] p-6 ${SHADOW_OUT} text-center`}>
                    <h1 className="text-2xl font-bold text-slate-700">Material de Registro de Emisión</h1>
                    <p className="text-sm text-[#9aa3b8] mt-1">Verificación de audio para cliente</p>
                </div>

                {/* Info Card */}
                {material && (
                    <div className={`rounded-3xl bg-[#dfeaff] p-6 ${SHADOW_OUT}`}>
                        <div className="flex items-center gap-2 mb-4">
                            {material.tipo === 'audio_pregrabado' ? (
                                <span className="text-xs px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-semibold">
                                    Audio Pregrabado
                                </span>
                            ) : (
                                <span className="text-xs px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">
                                    Mención en Vivo
                                </span>
                            )}
                            <span className="text-xs px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 font-semibold flex items-center gap-1">
                                <CheckCircle className="h-3 w-3" /> Verificado
                            </span>
                        </div>

                        <h2 className="text-xl font-bold text-slate-700 mb-4">{material.nombre}</h2>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-600">
                                <User className="h-4 w-4 text-[#6888ff]" />
                                <span>{material.anunciante}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Radio className="h-4 w-4 text-[#6888ff]" />
                                <span>{material.emisora}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Calendar className="h-4 w-4 text-[#6888ff]" />
                                <span>{material.fecha}</span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-600">
                                <Clock className="h-4 w-4 text-[#6888ff]" />
                                <span>{material.hora} ({material.duracion}s)</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Player Card */}
                {material && (
                    <div className={`rounded-3xl bg-[#dfeaff] p-6 ${SHADOW_OUT}`}>
                        <div className={`rounded-2xl bg-[#dfeaff] ${SHADOW_IN} p-4 mb-4`}>
                            <div className="flex items-center gap-4 mb-4">
                                <button
                                    onClick={togglePlay}
                                    className={`w-14 h-14 rounded-full flex items-center justify-center ${ACCENT} text-white ${SHADOW_OUT} hover:bg-[#5572ee] transition-colors`}
                                >
                                    {playing ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </button>
                                <div className="flex-1">
                                    <div className="h-16 rounded-xl bg-gradient-to-r from-[#6888ff]/20 to-[#6888ff]/5 relative overflow-hidden flex items-center justify-center gap-0.5">
                                        {Array.from({ length: 50 }).map((_, i) => (
                                            <div
                                                key={i}
                                                className="w-1 bg-[#6888ff] rounded-full"
                                                style={{
                                                    height: playing ? `${20 + Math.random() * 60}%` : '20%',
                                                    opacity: playing ? 1 : 0.4,
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-[#9aa3b8] mt-2">
                                        <span>{material.hora}</span>
                                        <span>{material.horaFin || material.hora}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Progress bar */}
                            <div className={`h-2 rounded-full ${SHADOW_IN} overflow-hidden`}>
                                <div
                                    className="h-full bg-[#6888ff] rounded-full transition-all"
                                    style={{ width: playing ? `${progress}%` : '0%' }}
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold ${BG} ${SHADOW_OUT} text-slate-600 hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]`}>
                                <Download className="h-5 w-5" />
                                Descargar
                            </button>
                            <button
                                onClick={() => {
                                    const text = `Registro de Emisión - ${material.nombre} - ${material.fecha} ${material.hora}`;
                                    navigator.clipboard.writeText(text);
                                    alert('Información copiada');
                                }}
                                className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white ${ACCENT} ${SHADOW_OUT} hover:bg-[#5572ee]`}
                            >
                                <ExternalLink className="h-5 w-5" />
                                Compartir
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer */}
                <div className="text-center text-xs text-[#9aa3b8]">
                    <p>Sistema de Verificación de Emisiones - Silexar Pulse</p>
                    <p className="mt-1">Este link expira el {material?.expiresAt}</p>
                </div>
            </div>
        </div>
    );
}