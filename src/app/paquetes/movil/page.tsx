'use client'

/**
 * PAGE: Móvil - Paquetes
 * 
 * @description Vista móvil optimizada para ejecutivos en terreno.
 * Versión avanzada con búsqueda por voz y geolocalización.
 * 
 * @version 1.1.0
 */

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'

interface Paquete {
    id: string
    codigo: string
    nombre: string
    tipo: string
    estado: string
    precioActual: number
    horario: { inicio: string; fin: string }
    region?: string
    ciudad?: string
    coordenadas?: { lat: number; lng: number }
}

interface UbicacionActual {
    lat: number
    lng: number
    ciudad: string
    region: string
}

type FiltroProximidad = 'cercana' | 'media' | 'lejana' | null

export default function PaquetesMovilPage() {
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [loading, setLoading] = useState(true)
    const [busqueda, setBusqueda] = useState('')
    const [escuchandoVoz, setEscuchandoVoz] = useState(false)
    const [ubicacion, setUbicacion] = useState<UbicacionActual | null>(null)
    const [obteniendoUbicacion, setObteniendoUbicacion] = useState(false)
    const [filtroProximidad, setFiltroProximidad] = useState<FiltroProximidad>(null)
    const recognitionRef = useRef<SpeechRecognition | null>(null)

    useEffect(() => {
        cargarPaquetes()
        inicializarVoz()
        obtenerUbicacion()
    }, [])

    /**
     * Inicializa la API de reconocimiento de voz
     */
    const inicializarVoz = () => {
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.continuous = false
            recognitionRef.current.interimResults = false
            recognitionRef.current.lang = 'es-CL'

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript
                setBusqueda(transcript)
                setEscuchandoVoz(false)
            }

            recognitionRef.current.onerror = () => {
                setEscuchandoVoz(false)
            }

            recognitionRef.current.onend = () => {
                setEscuchandoVoz(false)
            }
        }
    }

    /**
     * Inicia la búsqueda por voz
     */
    const iniciarBusquedaVoz = () => {
        if (recognitionRef.current && !escuchandoVoz) {
            setEscuchandoVoz(true)
            recognitionRef.current.start()
        }
    }

    /**
     * Obtiene la ubicación actual del usuario
     */
    const obtenerUbicacion = useCallback(() => {
        if (navigator.geolocation) {
            setObteniendoUbicacion(true)
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords
                    // En producción, usar reverse geocoding para obtener ciudad/region
                    const ubicacionMock: UbicacionActual = {
                        lat: latitude,
                        lng: longitude,
                        ciudad: 'Santiago',
                        region: 'Metropolitana'
                    }
                    setUbicacion(ubicacionMock)
                    setObteniendoUbicacion(false)
                },
                () => {
                    setObteniendoUbicacion(false)
                },
                { enableHighAccuracy: true, timeout: 10000 }
            )
        }
    }, [])

    /**
     * Calcula la distancia entre dos puntos en km
     */
    const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
        const R = 6371 // Radio de la Tierra en km
        const dLat = (lat2 - lat1) * Math.PI / 180
        const dLng = (lng2 - lng1) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLng / 2) * Math.sin(dLng / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        return R * c
    }

    /**
     * Filtra paquetes por proximidad a la ubicación actual
     */
    const getPaquetesPorProximidad = (filtro: FiltroProximidad): Paquete[] => {
        if (!ubicacion || !filtro) return paquetes

        return paquetes.filter(p => {
            if (!p.coordenadas) return false
            const distancia = calcularDistancia(
                ubicacion.lat, ubicacion.lng,
                p.coordenadas.lat, p.coordenadas.lng
            )
            switch (filtro) {
                case 'cercana': return distancia <= 10
                case 'media': return distancia > 10 && distancia <= 50
                case 'lejana': return distancia > 50
                default: return true
            }
        })
    }

    const cargarPaquetes = async () => {
        try {
            setLoading(true)
            const response = await fetch('/api/paquetes?limite=50')
            if (response.ok) {
                const data = await response.json()
                setPaquetes(data.items || [])
            }
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(precio)
    }

    const getTipoEmoji = (tipo: string) => {
        const emojis: Record<string, string> = {
            'PRIME': '🌟',
            'REPARTIDO': '📊',
            'NOCTURNO': '🌙',
            'SENALES': '🌡️',
            'ESPECIAL': '🎯',
            'EXCLUSIVO': '💎'
        }
        return emojis[tipo] || '📦'
    }

    const paquetesFiltrados = (filtroProximidad
        ? getPaquetesPorProximidad(filtroProximidad)
        : paquetes
    ).filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.codigo.toLowerCase().includes(busqueda.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-900">
            {/* Header */}
            <div className="bg-slate-800 p-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-xl font-black text-white">📦 Paquetes</h1>
                        <p className="text-xs text-slate-400">Módulo Móvil</p>
                    </div>
                    <Link href="/paquetes" className="text-2xl">🖥️</Link>
                </div>

                {/* Búsqueda con Voz */}
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                    <input
                        type="text"
                        placeholder="Buscar paquete..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="w-full pl-10 pr-12 py-2 bg-slate-900/50 border border-slate-700 rounded-xl text-white text-sm placeholder-slate-500"
                    />
                    <button
                        onClick={iniciarBusquedaVoz}
                        disabled={!recognitionRef.current}
                        className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${escuchandoVoz
                                ? 'bg-red-500/20 text-red-400 animate-pulse'
                                : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                        title="Búsqueda por voz"
                    >
                        {escuchandoVoz ? '🔴' : '🎤'}
                    </button>
                </div>

                {/* Ubicación y Filtros */}
                {ubicacion && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                        <div className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/30 px-2 py-1 rounded-lg">
                            <span>📍</span>
                            <span>{ubicacion.ciudad}, {ubicacion.region}</span>
                            <button
                                onClick={obtenerUbicacion}
                                className="ml-1 text-blue-400 hover:text-blue-300"
                            >
                                ⟳
                            </button>
                        </div>
                        <div className="flex gap-1">
                            {(['cercana', 'media', 'lejana'] as const).map((filtro) => (
                                <button
                                    key={filtro}
                                    onClick={() => setFiltroProximidad(filtroProximidad === filtro ? null : filtro)}
                                    className={`px-2 py-1 text-[10px] rounded-lg transition-all ${filtroProximidad === filtro
                                            ? 'bg-blue-500/30 text-blue-300 border border-blue-500/50'
                                            : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'
                                        }`}
                                >
                                    {filtro === 'cercana' && '🟢 <10km'}
                                    {filtro === 'media' && '🟡 10-50km'}
                                    {filtro === 'lejana' && '🔴 >50km'}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Estado de ubicación */}
                {obteniendoUbicacion && (
                    <div className="mt-2 text-xs text-blue-400 animate-pulse">
                        📡 Obteniendo ubicación...
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="p-4 bg-slate-800/50 border-b border-slate-700">
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="bg-slate-900/50 rounded-lg p-2">
                        <p className="text-lg font-black text-white">{paquetes.length}</p>
                        <p className="text-[10px] text-slate-400">Total</p>
                    </div>
                    <div className="bg-emerald-500/20 rounded-lg p-2">
                        <p className="text-lg font-black text-emerald-400">
                            {paquetes.filter(p => p.estado === 'ACTIVO').length}
                        </p>
                        <p className="text-[10px] text-slate-400">Activos</p>
                    </div>
                    <div className="bg-amber-500/20 rounded-lg p-2">
                        <p className="text-lg font-black text-amber-400">
                            {paquetes.filter(p => p.tipo === 'ESPECIAL').length}
                        </p>
                        <p className="text-[10px] text-slate-400">Especiales</p>
                    </div>
                </div>
            </div>

            {/* Lista */}
            <div className="p-4 space-y-3">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <span className="text-3xl animate-spin">🌀</span>
                    </div>
                ) : paquetesFiltrados.length === 0 ? (
                    <div className="text-center py-12">
                        <span className="text-4xl mb-2 block">📭</span>
                        <p className="text-slate-400 text-sm">Sin paquetes registrados</p>
                    </div>
                ) : (
                    paquetesFiltrados.map(paquete => (
                        <Link
                            key={paquete.id}
                            href={`/paquetes/${paquete.id}`}
                            className="block bg-slate-800 rounded-xl p-4 border border-slate-700 hover:border-blue-500/50 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-xl">{getTipoEmoji(paquete.tipo)}</span>
                                    <div>
                                        <p className="font-bold text-white text-sm">{paquete.nombre}</p>
                                        <p className="text-[10px] text-slate-400">{paquete.codigo}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${paquete.estado === 'ACTIVO'
                                    ? 'bg-emerald-500/20 text-emerald-400'
                                    : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {paquete.estado}
                                </span>
                            </div>
                            <div className="flex items-center justify-between mt-2">
                                <div className="text-xs text-slate-400">
                                    <span>{paquete.horario.inicio} - {paquete.horario.fin}</span>
                                </div>
                                <p className="text-sm font-bold text-emerald-400">
                                    {formatearPrecio(paquete.precioActual)}
                                </p>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {/* Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 p-2">
                <div className="flex items-center justify-around">
                    <Link href="/paquetes" className="flex flex-col items-center p-2 text-blue-400">
                        <span className="text-xl">📦</span>
                        <span className="text-[10px]">Paquetes</span>
                    </Link>
                    <Link href="/venimientos" className="flex flex-col items-center p-2 text-slate-400">
                        <span className="text-xl">📅</span>
                        <span className="text-[10px]">Vencimientos</span>
                    </Link>
                    <Link href="/dashboard" className="flex flex-col items-center p-2 text-slate-400">
                        <span className="text-xl">🏠</span>
                        <span className="text-[10px]">Home</span>
                    </Link>
                </div>
            </div>
        </div>
    )
}