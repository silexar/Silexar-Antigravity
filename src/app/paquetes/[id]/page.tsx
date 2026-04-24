'use client'

/**
 * PAGE: Detalle de Paquete
 * 
 * @description Vista 360° de un paquete específico.
 * Muestra todas las métricas, pricing y configuraciones.
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface PaqueteDetalle {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    tipo: string
    estado: string
    editora_id: string
    editora_nombre: string
    programa_id: string
    programa_nombre: string
    horario_inicio: string
    horario_fin: string
    dias_semana: string[]
    duraciones: number[]
    precio_base: number
    precio_actual: number
    nivel_exclusividad: string
    vigencia_desde: string
    vigencia_hasta: string
    created_at: string
    historialPrecios: Array<{
        id: string
        precio_base: number
        precio_final: number
        fecha_vigencia: string
    }>
    disponibilidad: Array<{
        fecha: string
        cupos_totales: number
        cupos_ocupados: number
        disponible_pct: number
    }>
    restricciones: Array<{
        id: string
        tipo_restriccion: string
        descripcion: string
        activos: boolean
    }>
}

export default function PaqueteDetallePage() {
    const params = useParams()
    const [paquete, setPaquete] = useState<PaqueteDetalle | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('resumen')

    useEffect(() => {
        if (params.id) {
            cargarPaquete(params.id as string)
        }
    }, [params.id])

    const cargarPaquete = async (id: string) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/paquetes/${id}`)
            if (!response.ok) {
                throw new Error('Paquete no encontrado')
            }
            const data = await response.json()
            setPaquete(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar')
        } finally {
            setLoading(false)
        }
    }

    const formatearPrecio = (precio: number) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(precio)
    }

    const getTipoInfo = (tipo: string) => {
        const info: Record<string, { label: string; emoji: string; color: string }> = {
            'PRIME': { label: 'Prime', emoji: '🌟', color: 'bg-amber-100 text-amber-700' },
            'REPARTIDO': { label: 'Repartido', emoji: '📊', color: 'bg-blue-100 text-blue-700' },
            'NOCTURNO': { label: 'Nocturno', emoji: '🌙', color: 'bg-indigo-100 text-indigo-700' },
            'SENALES': { label: 'Señales', emoji: '🌡️', color: 'bg-cyan-100 text-cyan-700' },
            'ESPECIAL': { label: 'Especial', emoji: '🎯', color: 'bg-rose-100 text-rose-700' },
            'EXCLUSIVO': { label: 'Exclusivo', emoji: '💎', color: 'bg-violet-100 text-violet-700' }
        }
        return info[tipo] || { label: tipo, emoji: '📦', color: 'bg-gray-100' }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-6xl animate-spin mb-4">🌀</div>
                    <p className="text-slate-400 font-medium">Cargando paquete...</p>
                </div>
            </div>
        )
    }

    if (error || !paquete) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
                <div className="text-center">
                    <span className="text-6xl mb-4 block">❌</span>
                    <p className="text-xl text-slate-400 font-medium">{error || 'Paquete no encontrado'}</p>
                    <Link href="/paquetes" className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white font-bold rounded-xl">
                        Volver a Paquetes
                    </Link>
                </div>
            </div>
        )
    }

    const tipoInfo = getTipoInfo(paquete.tipo)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Link href="/paquetes" className="text-slate-400 hover:text-white transition-colors">
                                ← Volver
                            </Link>
                            <span className="text-4xl">{tipoInfo.emoji}</span>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                {paquete.nombre}
                            </h1>
                        </div>
                        <p className="text-slate-400 font-medium">
                            {paquete.codigo} • {tipoInfo.label} • {paquete.estado}
                        </p>
                    </div>
                    <Link
                        href={`/paquetes/${paquete.id}/editar`}
                        className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                        ✏️ Editar Paquete
                    </Link>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-6 overflow-x-auto">
                {['resumen', 'tecnicas', 'pricing', 'disponibilidad', 'restricciones'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-4 py-2 rounded-xl font-medium transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                            }`}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === 'resumen' && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>📋</span> Resumen Ejecutivo
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Información Básica</h3>
                                    <div className="bg-slate-900/50 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Tipo:</span>
                                            <span className="text-white font-medium">{tipoInfo.label}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Editora:</span>
                                            <span className="text-white font-medium">{paquete.editora_nombre}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Programa:</span>
                                            <span className="text-white font-medium">{paquete.programa_nombre}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Horario:</span>
                                            <span className="text-white font-medium">{paquete.horario_inicio} - {paquete.horario_fin}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Días:</span>
                                            <span className="text-white font-medium">{paquete.dias_semana.join(', ')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Pricing</h3>
                                    <div className="bg-slate-900/50 rounded-xl p-4 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Precio Base:</span>
                                            <span className="text-white font-bold">{formatearPrecio(paquete.precio_base)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Precio Actual:</span>
                                            <span className="text-emerald-400 font-bold">{formatearPrecio(paquete.precio_actual)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Exclusividad:</span>
                                            <span className="text-white font-medium">{paquete.nivel_exclusividad}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-400">Vigencia:</span>
                                            <span className="text-white font-medium">
                                                {new Date(paquete.vigencia_desde).toLocaleDateString('es-CL')} - {new Date(paquete.vigencia_hasta).toLocaleDateString('es-CL')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {paquete.descripcion && (
                            <div className="mt-6">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-2">Descripción</h3>
                                <p className="text-white">{paquete.descripcion}</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'tecnicas' && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>⚙️</span> Especificaciones Técnicas
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Configuración Emisora</h3>
                                <div className="bg-slate-900/50 rounded-xl p-4 space-y-3">
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Editora ID:</span>
                                        <span className="text-white font-mono text-sm">{paquete.editora_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Programa ID:</span>
                                        <span className="text-white font-mono text-sm">{paquete.programa_id}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-400">Sistema Playout:</span>
                                        <span className="text-white">Por configurar</span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Duraciones Disponibles</h3>
                                <div className="flex flex-wrap gap-3">
                                    {paquete.duraciones.map(d => (
                                        <span key={d} className="px-4 py-2 bg-emerald-500/20 text-emerald-400 font-bold rounded-xl">
                                            {d}s
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'pricing' && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>💰</span> Centro de Pricing Dinámico
                        </h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="bg-slate-900/50 rounded-xl p-6 text-center">
                                <p className="text-4xl font-black text-white">{formatearPrecio(paquete.precio_base)}</p>
                                <p className="text-slate-400 mt-2">Precio Base</p>
                            </div>
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
                                <p className="text-4xl font-black text-emerald-400">{formatearPrecio(paquete.precio_actual)}</p>
                                <p className="text-emerald-400 mt-2">Precio Actual</p>
                            </div>
                            <div className="bg-slate-900/50 rounded-xl p-6 text-center">
                                <p className="text-4xl font-black text-blue-400">
                                    {paquete.precio_actual > paquete.precio_base
                                        ? '+' + Math.round(((paquete.precio_actual - paquete.precio_base) / paquete.precio_base) * 100) + '%'
                                        : paquete.precio_actual < paquete.precio_base
                                            ? '-' + Math.round(((paquete.precio_base - paquete.precio_actual) / paquete.precio_base) * 100) + '%'
                                            : '0%'
                                    }
                                </p>
                                <p className="text-slate-400 mt-2">vs Base</p>
                            </div>
                        </div>

                        {paquete.historialPrecios.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-slate-400 uppercase mb-4">Historial de Precios</h3>
                                <table className="w-full">
                                    <thead className="bg-slate-900/50">
                                        <tr>
                                            <th className="px-4 py-2 text-left text-xs text-slate-400">Fecha</th>
                                            <th className="px-4 py-2 text-right text-xs text-slate-400">Precio Final</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {paquete.historialPrecios.slice(0, 5).map(h => (
                                            <tr key={h.id}>
                                                <td className="px-4 py-3 text-white">{new Date(h.fecha_vigencia).toLocaleDateString('es-CL')}</td>
                                                <td className="px-4 py-3 text-right text-white font-medium">{formatearPrecio(h.precio_final)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'disponibilidad' && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>📊</span> Monitor de Utilización
                        </h2>
                        {paquete.disponibilidad.length > 0 ? (
                            <div className="space-y-4">
                                {paquete.disponibilidad.slice(0, 10).map(d => (
                                    <div key={d.fecha} className="bg-slate-900/50 rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-white font-medium">{new Date(d.fecha).toLocaleDateString('es-CL')}</span>
                                            <span className={`font-bold ${d.disponible_pct > 70 ? 'text-emerald-400' : d.disponible_pct > 40 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                {Math.round(d.disponible_pct)}% disponible
                                            </span>
                                        </div>
                                        <div className="w-full bg-slate-700 rounded-full h-2">
                                            <div
                                                className={`h-2 rounded-full ${d.disponible_pct > 70 ? 'bg-emerald-500' : d.disponible_pct > 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
                                                style={{ width: `${100 - d.disponible_pct}%` }}
                                            />
                                        </div>
                                        <div className="flex justify-between mt-2 text-xs text-slate-400">
                                            <span>Ocupados: {d.cupos_ocupados}</span>
                                            <span>Totales: {d.cupos_totales}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">📭</span>
                                <p className="text-slate-400">No hay datos de disponibilidad registrados</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'restricciones' && (
                    <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <span>🛡️</span> Restricciones del Paquete
                        </h2>
                        {paquete.restricciones.length > 0 ? (
                            <div className="space-y-4">
                                {paquete.restricciones.map(r => (
                                    <div key={r.id} className="bg-slate-900/50 rounded-xl p-4 flex items-center justify-between">
                                        <div>
                                            <span className={`px-2 py-0.5 text-xs font-bold rounded ${r.tipo_restriccion === 'INDUSTRIA' ? 'bg-rose-500/20 text-rose-400' :
                                                    r.tipo_restriccion === 'HORARIO' ? 'bg-amber-500/20 text-amber-400' :
                                                        'bg-blue-500/20 text-blue-400'
                                                }`}>
                                                {r.tipo_restriccion}
                                            </span>
                                            <p className="text-white mt-2">{r.descripcion}</p>
                                        </div>
                                        <span className={`px-2 py-1 text-xs font-bold rounded ${r.activos ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                                            {r.activos ? 'Activa' : 'Inactiva'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <span className="text-4xl mb-4 block">🛡️</span>
                                <p className="text-slate-400">No hay restricciones configuradas</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}