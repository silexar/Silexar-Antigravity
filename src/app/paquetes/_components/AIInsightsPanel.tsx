'use client'

/**
 * COMPONENT: Panel de Inteligencia Artificial - Vista 360°
 * 
 * @description Panel que muestra insights de IA y recomendaciones
 * para optimización de paquetes. Integración con Cortex-Pricing y Cortex-Demand.
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'

interface PricingAnalysis {
    precioActual: number
    precioOptimo: number
    factorDemanda: number
    factorEstacional: number
    factorCompetencia: number
    confianza: number
    estrategias: Array<{
        tipo: string
        precioSugerido: number
        justificacion: string
        riesgoNivel: string
    }>
}

interface DemandPrediction {
    predicciones: Array<{
        dias: number
        ocupacionEstimada: number
        factorEstacional: string
    }>
    tendencia: string
    confianza: number
    alertas: Array<{
        tipo: string
        mensaje: string
        accionSugerida: string
        prioridad: string
    }>
}

interface AIInsightsProps {
    paqueteId: string
    paqueteNombre: string
    precioActual: number
    tipo: string
}

export function AIInsightsPanel({ paqueteId, paqueteNombre, precioActual, tipo }: AIInsightsProps) {
    const [pricing, setPricing] = useState<PricingAnalysis | null>(null)
    const [demand, setDemand] = useState<DemandPrediction | null>(null)
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState<'pricing' | 'demand' | 'acciones'>('pricing')
    const [aplicando, setAplicando] = useState<string | null>(null)

    useEffect(() => {
        cargarInsights()
    }, [paqueteId])

    const cargarInsights = async () => {
        setLoading(true)
        try {
            // Cargar pricing analysis
            const pricingRes = await fetch('/api/paquetes/cortex/pricing', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paqueteId, tipo, precioBase: precioActual })
            })
            if (pricingRes.ok) {
                const pricingData = await pricingRes.json()
                setPricing(pricingData.analysis)
            }

            // Cargar demand prediction
            const demandRes = await fetch('/api/paquetes/cortex/demand', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paqueteId, tipo })
            })
            if (demandRes.ok) {
                const demandData = await demandRes.json()
                setDemand(demandData.prediction)
            }
        } catch (error) {
            console.error('Error cargando insights:', error)
        } finally {
            setLoading(false)
        }
    }

    const aplicarOptimizacion = async (nuevoPrecio: number, estrategia: string) => {
        setAplicando(estrategia)
        try {
            const response = await fetch('/api/paquetes/optimizar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    paqueteId,
                    nuevoPrecio,
                    estrategia
                })
            })

            if (response.ok) {
                // Recargar insights después de aplicar
                await cargarInsights()
                alert('Precio actualizado exitosamente')
            }
        } catch (error) {
            console.error('Error aplicando optimización:', error)
            alert('Error al aplicar optimización')
        } finally {
            setAplicando(null)
        }
    }

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getPrioridadColor = (prioridad: string) => {
        switch (prioridad) {
            case 'CRITICA': return 'bg-rose-500/20 text-rose-400 border-rose-500/30'
            case 'ALTA': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            case 'MEDIA': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
            default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        }
    }

    const getAlertaIcon = (tipo: string) => {
        switch (tipo) {
            case 'SATURACION': return '🚨'
            case 'OPORTUNIDAD': return '💡'
            case 'DECLIVE': return '📉'
            case 'OPTIMO': return '✅'
            default: return '📊'
        }
    }

    if (loading) {
        return (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
                <div className="flex items-center justify-center py-8">
                    <span className="text-3xl animate-spin">🧠</span>
                    <span className="ml-3 text-slate-400">Analizando con IA...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600/20 to-blue-600/20 p-4 border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">🧠</span>
                        <div>
                            <h3 className="text-lg font-bold text-white">Inteligencia Cortex AI</h3>
                            <p className="text-xs text-slate-400">Análisis y recomendaciones para {paqueteNombre}</p>
                        </div>
                    </div>
                    {pricing && (
                        <div className="text-right">
                            <p className="text-xs text-slate-400">Confianza del análisis</p>
                            <p className="text-xl font-black text-emerald-400">{pricing.confianza}%</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-700/50">
                <button
                    onClick={() => setActiveTab('pricing')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'pricing'
                            ? 'bg-blue-500/20 text-blue-400 border-b-2 border-blue-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    💰 Pricing
                </button>
                <button
                    onClick={() => setActiveTab('demand')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'demand'
                            ? 'bg-violet-500/20 text-violet-400 border-b-2 border-violet-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    📈 Demanda
                </button>
                <button
                    onClick={() => setActiveTab('acciones')}
                    className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeTab === 'acciones'
                            ? 'bg-emerald-500/20 text-emerald-400 border-b-2 border-emerald-400'
                            : 'text-slate-400 hover:text-white'
                        }`}
                >
                    ⚡ Acciones
                </button>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                {activeTab === 'pricing' && pricing && (
                    <>
                        {/* Factores actuales */}
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Factores de Precio</h4>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="text-center">
                                    <p className="text-2xl font-black text-white">{Math.round(pricing.factorDemanda * 100)}%</p>
                                    <p className="text-xs text-slate-400">Demanda</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-emerald-400">{Math.round(pricing.factorEstacional * 100)}%</p>
                                    <p className="text-xs text-slate-400">Estacional</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-black text-blue-400">{Math.round(pricing.factorCompetencia * 100)}%</p>
                                    <p className="text-xs text-slate-400">Competencia</p>
                                </div>
                            </div>
                        </div>

                        {/* Precio óptimo */}
                        <div className="bg-gradient-to-r from-emerald-500/20 to-blue-500/20 rounded-xl p-4 border border-emerald-500/30">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-bold text-slate-400">Precio Recomendado</span>
                                <span className="text-xs bg-emerald-500/30 text-emerald-400 px-2 py-0.5 rounded">🤖 IA</span>
                            </div>
                            <p className="text-3xl font-black text-emerald-400">{formatearPrecio(pricing.precioOptimo)}</p>
                            <p className="text-xs text-slate-400 mt-1">
                                Actual: {formatearPrecio(pricing.precioActual)} •
                                Cambio: {Math.round(((pricing.precioOptimo - pricing.precioActual) / pricing.precioActual) * 100)}%
                            </p>
                        </div>

                        {/* Estrategias */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Estrategias Disponibles</h4>
                            {pricing.estrategias.map((estrategia, idx) => (
                                <div key={idx} className={`rounded-xl p-4 mb-3 ${estrategia.tipo === 'OPTIMO'
                                        ? 'bg-blue-500/20 border border-blue-500/30'
                                        : 'bg-slate-900/50 border border-slate-700/50'
                                    }`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${estrategia.tipo === 'COMPETITIVO' ? 'bg-slate-600 text-slate-300' :
                                                    estrategia.tipo === 'PREMIUM' ? 'bg-amber-500/30 text-amber-400' :
                                                        'bg-blue-500/30 text-blue-400'
                                                }`}>
                                                {estrategia.tipo}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded ${estrategia.riesgoNivel === 'BAJO' ? 'bg-emerald-500/30 text-emerald-400' :
                                                    estrategia.riesgoNivel === 'MEDIO' ? 'bg-amber-500/30 text-amber-400' :
                                                        'bg-rose-500/30 text-rose-400'
                                                }`}>
                                                {estrategia.riesgoNivel}
                                            </span>
                                        </div>
                                        <p className="text-xl font-bold text-white">{formatearPrecio(estrategia.precioSugerido)}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 mb-3">{estrategia.justificacion}</p>
                                    {estrategia.tipo === 'OPTIMO' && (
                                        <button
                                            onClick={() => aplicarOptimizacion(estrategia.precioSugerido, estrategia.tipo)}
                                            disabled={aplicando === estrategia.tipo}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-lg transition-colors text-sm"
                                        >
                                            {aplicando === estrategia.tipo ? 'Aplicando...' : '🚀 Aplicar Precio Óptimo'}
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {activeTab === 'demand' && demand && (
                    <>
                        {/* Tendencia */}
                        <div className={`rounded-xl p-4 ${demand.tendencia === 'CRECIENDO' ? 'bg-emerald-500/20 border border-emerald-500/30' :
                                demand.tendencia === 'DECLINANDO' ? 'bg-rose-500/20 border border-rose-500/30' :
                                    'bg-slate-900/50 border border-slate-700/50'
                            }`}>
                            <div className="flex items-center gap-3">
                                <span className="text-3xl">
                                    {demand.tendencia === 'CRECIENDO' ? '📈' :
                                        demand.tendencia === 'DECLINANDO' ? '📉' : '➡️'}
                                </span>
                                <div>
                                    <p className="font-bold text-white">Tendencia: {demand.tendencia}</p>
                                    <p className="text-xs text-slate-400">Confianza: {demand.confianza}%</p>
                                </div>
                            </div>
                        </div>

                        {/* Predicciones */}
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Predicciones</h4>
                            <div className="space-y-3">
                                {demand.predicciones.map((pred, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                                        <div>
                                            <p className="font-bold text-white">{pred.dias} días</p>
                                            <p className="text-xs text-slate-400">{pred.factorEstacional}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xl font-bold ${pred.ocupacionEstimada >= 85 ? 'text-rose-400' :
                                                    pred.ocupacionEstimada >= 60 ? 'text-emerald-400' :
                                                        'text-amber-400'
                                                }`}>
                                                {pred.ocupacionEstimada}%
                                            </p>
                                            <p className="text-xs text-slate-400">ocupación</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Alertas */}
                        <div>
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Alertas</h4>
                            {demand.alertas.length > 0 ? (
                                demand.alertas.map((alerta, idx) => (
                                    <div key={idx} className={`rounded-xl p-4 mb-3 border ${getPrioridadColor(alerta.prioridad)}`}>
                                        <div className="flex items-start gap-3">
                                            <span className="text-2xl">{getAlertaIcon(alerta.tipo)}</span>
                                            <div className="flex-1">
                                                <p className="font-bold text-white">{alerta.mensaje}</p>
                                                <p className="text-xs text-slate-400 mt-1">{alerta.accionSugerida}</p>
                                                <span className={`inline-block mt-2 px-2 py-0.5 text-[10px] font-bold rounded uppercase ${alerta.prioridad === 'CRITICA' ? 'bg-rose-500/50 text-rose-300' :
                                                        alerta.prioridad === 'ALTA' ? 'bg-amber-500/50 text-amber-300' :
                                                            'bg-slate-600 text-slate-300'
                                                    }`}>
                                                    {alerta.prioridad}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-6 text-slate-400">
                                    <span className="text-2xl mb-2 block">✅</span>
                                    <p className="text-sm">Sin alertas pendientes</p>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'acciones' && (
                    <div className="space-y-3">
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <h4 className="text-sm font-bold text-slate-400 uppercase mb-3">Acciones Rápidas</h4>
                            <div className="space-y-2">
                                <button className="w-full py-3 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold rounded-xl transition-colors text-sm">
                                    📊 Generar Reporte Completo
                                </button>
                                <button className="w-full py-3 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 font-bold rounded-xl transition-colors text-sm">
                                    📈 Ver Tendencias 90 días
                                </button>
                                <button className="w-full py-3 bg-violet-600/20 hover:bg-violet-600/30 text-violet-400 font-bold rounded-xl transition-colors text-sm">
                                    🔮 Simular Escenarios
                                </button>
                                <button className="w-full py-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 font-bold rounded-xl transition-colors text-sm">
                                    🎯 Crear Paquete Derivado
                                </button>
                            </div>
                        </div>

                        {pricing && pricing.confianza > 70 && (
                            <div className="bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-xl p-4 border border-violet-500/30">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="text-xl">🎯</span>
                                    <span className="font-bold text-white">Recomendación IA</span>
                                </div>
                                <p className="text-sm text-slate-300">
                                    Basado en el análisis de demanda y competencia, el precio óptimo
                                    genera un estimado de {Math.round((pricing.precioOptimo - pricing.precioActual) / pricing.precioActual * 100)}%
                                    más revenue manteniendo la ocupación objetivo.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}