'use client'

/**
 * PAGE: Detalle de Paquete - Análisis IA
 * 
 * @description Página de detalle con tabs incluyendo análisis de IA.
 * FASE 5: Frontend - Integración de IA
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

interface PricingAnalysis {
    paqueteId: string
    precioActual: number
    precioOptimo: number
    factorDemanda: number
    factorEstacional: number
    factorCompetencia: number
    confianza: number
    estrategias: {
        tipo: 'COMPETITIVO' | 'OPTIMO' | 'PREMIUM'
        precioSugerido: number
        justificacion: string
        riesgoNivel: 'BAJO' | 'MEDIO' | 'ALTO'
        impactoEstimado: number
    }[]
}

export default function PaqueteDetailPage() {
    const params = useParams()
    const router = useRouter()
    const paqueteId = params.id as string

    const [activeTab, setActiveTab] = useState('info')
    const [loading, setLoading] = useState(false)
    const [precioLoading, setPrecioLoading] = useState(false)
    const [analisisIA, setAnalisisIA] = useState<PricingAnalysis | null>(null)
    const [paquete, setPaquete] = useState<any>(null)

    useEffect(() => {
        if (paqueteId) {
            cargarPaquete()
        }
    }, [paqueteId])

    const cargarPaquete = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/paquetes?id=${paqueteId}`)
            if (response.ok) {
                const data = await response.json()
                setPaquete(data.item || data.items?.[0])
            }
        } catch (error) {
            console.error('Error cargando paquete:', error)
        } finally {
            setLoading(false)
        }
    }

    const analizarPrecio = async () => {
        if (!paquete) return

        try {
            setPrecioLoading(true)
            const response = await fetch('/api/paquetes/ia/precio', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paqueteId: paquete.id,
                    tipo: paquete.tipo,
                    precioBase: paquete.precioBase,
                    ocupacionActual: 65,
                    ocupacionHistorico: [55, 60, 65, 70, 60, 65]
                })
            })

            if (response.ok) {
                const data = await response.json()
                setAnalisisIA(data.analisis)
            }
        } catch (error) {
            console.error('Error en análisis de precio:', error)
        } finally {
            setPrecioLoading(false)
        }
    }

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getFactorColor = (factor: number) => {
        if (factor > 1.05) return 'text-emerald-400'
        if (factor < 0.95) return 'text-rose-400'
        return 'text-slate-400'
    }

    const getFactorIcon = (factor: number) => {
        if (factor > 1.05) return '📈'
        if (factor < 0.95) return '📉'
        return '➡️'
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-4 mb-2">
                    <button
                        onClick={() => router.push('/paquetes')}
                        className="p-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white"
                    >
                        ←
                    </button>
                    <span className="text-4xl">📦</span>
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">
                            {paquete?.nombre || 'Cargando...'}
                        </h1>
                        <p className="text-slate-400 font-medium">
                            {paquete?.codigo || ''} • {paquete?.tipo || ''}
                        </p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 overflow-x-auto">
                {['info', 'disponibilidad', 'pricing', 'ia', 'historial'].map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl font-bold transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tab === 'ia' ? '🧠 ' : ''}{tab.toUpperCase()}
                    </button>
                ))}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="text-4xl animate-spin">🌀</div>
                    <p className="ml-4 text-slate-400 font-medium">Cargando...</p>
                </div>
            ) : (
                <>
                    {activeTab === 'info' && (
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Información General</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400">Editora</p>
                                    <p className="text-lg font-bold text-white">{paquete?.editora?.nombre}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400">Programa</p>
                                    <p className="text-lg font-bold text-white">{paquete?.programa?.nombre}</p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400">Horario</p>
                                    <p className="text-lg font-bold text-white">
                                        {paquete?.horario?.inicio} - {paquete?.horario?.fin}
                                    </p>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400">Precio Actual</p>
                                    <p className="text-lg font-bold text-emerald-400">
                                        {formatearPrecio(paquete?.precioActual)}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-6">
                            {/* Pricing Card */}
                            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-bold text-white">💰 Pricing</h2>
                                    <button
                                        onClick={analizarPrecio}
                                        disabled={precioLoading}
                                        className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                                    >
                                        {precioLoading ? '🧠 Analizando...' : '🤖 Analizar con IA'}
                                    </button>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-slate-900/50 rounded-xl p-4">
                                        <p className="text-sm text-slate-400">Precio Base</p>
                                        <p className="text-2xl font-black text-white">
                                            {formatearPrecio(paquete?.precioBase)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4">
                                        <p className="text-sm text-slate-400">Precio Actual</p>
                                        <p className="text-2xl font-black text-emerald-400">
                                            {formatearPrecio(paquete?.precioActual)}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 rounded-xl p-4">
                                        <p className="text-sm text-slate-400">Precio Óptimo IA</p>
                                        <p className="text-2xl font-black text-amber-400">
                                            {analisisIA ? formatearPrecio(analisisIA.precioOptimo) : '---'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Análisis IA */}
                            {analisisIA && (
                                <div className="bg-slate-800/50 backdrop-blur border border-amber-500/30 rounded-2xl p-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <span className="text-2xl">🧠</span>
                                        <h2 className="text-xl font-bold text-amber-400">Análisis de Inteligencia Artificial</h2>
                                    </div>

                                    {/* Factores */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <p className="text-sm text-slate-400">Factor Demanda</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getFactorIcon(analisisIA.factorDemanda)}</span>
                                                <p className={`text-2xl font-black ${getFactorColor(analisisIA.factorDemanda)}`}>
                                                    {(analisisIA.factorDemanda * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <p className="text-sm text-slate-400">Factor Estacional</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getFactorIcon(analisisIA.factorEstacional)}</span>
                                                <p className={`text-2xl font-black ${getFactorColor(analisisIA.factorEstacional)}`}>
                                                    {(analisisIA.factorEstacional * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                        <div className="bg-slate-900/50 rounded-xl p-4">
                                            <p className="text-sm text-slate-400">Factor Competencia</p>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl">{getFactorIcon(analisisIA.factorCompetencia)}</span>
                                                <p className={`text-2xl font-black ${getFactorColor(analisisIA.factorCompetencia)}`}>
                                                    {(analisisIA.factorCompetencia * 100).toFixed(0)}%
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Confianza */}
                                    <div className="mb-6">
                                        <p className="text-sm text-slate-400 mb-2">Confianza del Análisis</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-amber-500 to-emerald-500"
                                                    style={{ width: `${analisisIA.confianza}%` }}
                                                />
                                            </div>
                                            <span className="text-lg font-bold text-white">{analisisIA.confianza}%</span>
                                        </div>
                                    </div>

                                    {/* Estrategias */}
                                    <h3 className="text-lg font-bold text-white mb-4">📊 Estrategias Sugeridas</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {analisisIA.estrategias.map((estrategia, idx) => (
                                            <div
                                                key={idx}
                                                className={`p-4 rounded-xl border-2 ${estrategia.tipo === 'OPTIMO'
                                                        ? 'border-emerald-500 bg-emerald-500/10'
                                                        : estrategia.tipo === 'PREMIUM'
                                                            ? 'border-amber-500 bg-amber-500/10'
                                                            : 'border-blue-500 bg-blue-500/10'
                                                    }`}
                                            >
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-xl">
                                                        {estrategia.tipo === 'OPTIMO' ? '🎯' : estrategia.tipo === 'PREMIUM' ? '💎' : '⚡'}
                                                    </span>
                                                    <span className="font-bold text-white">{estrategia.tipo}</span>
                                                </div>
                                                <p className="text-2xl font-black text-white mb-2">
                                                    {formatearPrecio(estrategia.precioSugerido)}
                                                </p>
                                                <p className="text-sm text-slate-400 mb-2">{estrategia.justificacion}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-xs px-2 py-1 rounded-full ${estrategia.riesgoNivel === 'BAJO'
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : estrategia.riesgoNivel === 'MEDIO'
                                                                ? 'bg-amber-500/20 text-amber-400'
                                                                : 'bg-rose-500/20 text-rose-400'
                                                        }`}>
                                                        {estrategia.riesgoNivel}
                                                    </span>
                                                    <span className="text-xs text-slate-400">
                                                        Impacto: {estrategia.impactoEstimado > 0 ? '+' : ''}{estrategia.impactoEstimado}%
                                                    </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'ia' && (
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl">🧠</span>
                                <h2 className="text-xl font-bold text-white">Panel de Inteligencia Artificial</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400 mb-2">Cortex-Pricing</p>
                                    <p className="text-white font-medium">Optimización de precios en tiempo real</p>
                                    <button
                                        onClick={() => setActiveTab('pricing')}
                                        className="mt-3 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg transition-colors"
                                    >
                                        Ver Análisis
                                    </button>
                                </div>
                                <div className="bg-slate-900/50 rounded-xl p-4">
                                    <p className="text-sm text-slate-400 mb-2">Cortex-Demand</p>
                                    <p className="text-white font-medium">Análisis de demanda por segmento</p>
                                    <button
                                        disabled
                                        className="mt-3 px-4 py-2 bg-slate-700 text-slate-400 font-bold rounded-lg cursor-not-allowed"
                                    >
                                        Próximamente
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'historial' && (
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">📜 Historial de Cambios</h2>
                            <p className="text-slate-400">No hay historial disponible aún.</p>
                        </div>
                    )}

                    {activeTab === 'disponibilidad' && (
                        <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                            <h2 className="text-xl font-bold text-white mb-4">📊 Disponibilidad</h2>
                            <p className="text-slate-400">No hay datos de disponibilidad aún.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    )
}