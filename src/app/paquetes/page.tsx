'use client'

/**
 * PAGE: Centro de Gestión de Paquetes
 * 
 * @description Dashboard principal del módulo Paquetes.
 * Muestra listado de paquetes con métricas e inteligencia artificial.
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface Paquete {
    id: string
    codigo: string
    nombre: string
    descripcion: string
    tipo: string
    estado: string
    editora: { id: string; nombre: string }
    programa: { id: string; nombre: string }
    horario: { inicio: string; fin: string }
    diasSemana: string[]
    duraciones: number[]
    precioBase: number
    precioActual: number
    nivelExclusividad: string
    vigencia: { desde: string; hasta: string }
}

interface MetricasDashboard {
    totalPaquetes: number
    activos: number
    promocionales: number
    nuevosEsteMes: number
    utilizacionPromedio: number
    revenueYTD: number
}

export default function PaquetesPage() {
    const [paquetes, setPaquetes] = useState<Paquete[]>([])
    const [metricas, setMetricas] = useState<MetricasDashboard | null>(null)
    const [loading, setLoading] = useState(true)
    const [filtroTipo, setFiltroTipo] = useState<string>('')
    const [filtroEstado, setFiltroEstado] = useState<string>('')
    const [busqueda, setBusqueda] = useState('')

    useEffect(() => {
        cargarPaquetes()
    }, [filtroTipo, filtroEstado, busqueda])

    const cargarPaquetes = async () => {
        try {
            setLoading(true)
            const params = new URLSearchParams()
            if (filtroTipo) params.set('tipo', filtroTipo)
            if (filtroEstado) params.set('estado', filtroEstado)
            if (busqueda) params.set('texto', busqueda)
            params.set('limite', '50')

            const response = await fetch(`/api/paquetes?${params.toString()}`)
            if (response.ok) {
                const data = await response.json()
                setPaquetes(data.items || [])
                setMetricas({
                    totalPaquetes: data.total || 0,
                    activos: data.items?.filter((p: Paquete) => p.estado === 'ACTIVO').length || 0,
                    promocionales: data.items?.filter((p: Paquete) => p.tipo === 'ESPECIAL').length || 0,
                    nuevosEsteMes: 0,
                    utilizacionPromedio: 0,
                    revenueYTD: 0
                })
            }
        } catch (error) {
            console.error('Error cargando paquetes:', error)
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

    const getTipoLabel = (tipo: string) => {
        const labels: Record<string, { label: string; emoji: string; color: string }> = {
            'PRIME': { label: 'Prime', emoji: '🌟', color: 'bg-amber-100 text-amber-700' },
            'REPARTIDO': { label: 'Repartido', emoji: '📊', color: 'bg-blue-100 text-blue-700' },
            'NOCTURNO': { label: 'Nocturno', emoji: '🌙', color: 'bg-indigo-100 text-indigo-700' },
            'SENALES': { label: 'Señales', emoji: '🌡️', color: 'bg-cyan-100 text-cyan-700' },
            'ESPECIAL': { label: 'Especial', emoji: '🎯', color: 'bg-rose-100 text-rose-700' },
            'EXCLUSIVO': { label: 'Exclusivo', emoji: '💎', color: 'bg-violet-100 text-violet-700' }
        }
        return labels[tipo] || { label: tipo, emoji: '📦', color: 'bg-gray-100 text-gray-700' }
    }

    const getEstadoBadge = (estado: string) => {
        const estados: Record<string, { label: string; color: string }> = {
            'ACTIVO': { label: 'Activo', color: 'bg-emerald-500/20 text-emerald-600 border-emerald-500/30' },
            'INACTIVO': { label: 'Inactivo', color: 'bg-gray-500/20 text-gray-600 border-gray-500/30' },
            'MANTENIMIENTO': { label: 'Mantención', color: 'bg-amber-500/20 text-amber-600 border-amber-500/30' }
        }
        const e = estados[estado] || { label: estado, color: 'bg-gray-100 text-gray-600' }
        return (
            <span className={`px-2 py-0.5 text-xs font-bold rounded-full border ${e.color}`}>
                {e.label}
            </span>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">📦</span>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Centro de Gestión de Paquetes
                    </h1>
                </div>
                <p className="text-slate-400 font-medium">
                    Dashboard &gt; Paquetes
                </p>
            </div>

            {/* Panel de Métricas */}
            {metricas && (
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6 mb-8">
                    <div className="flex items-center gap-2 mb-4">
                        <span className="text-xl">🧠</span>
                        <h2 className="text-lg font-bold text-white">Inteligencia de Productos Tiempo Real</h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-3xl font-black text-white">{metricas.totalPaquetes}</p>
                            <p className="text-xs text-slate-400 font-medium">Paquetes</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-3xl font-black text-emerald-400">{metricas.activos}</p>
                            <p className="text-xs text-slate-400 font-medium">Activos Hoy</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-3xl font-black text-rose-400">{metricas.promocionales}</p>
                            <p className="text-xs text-slate-400 font-medium">Promocionales</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-3xl font-black text-blue-400">{metricas.utilizacionPromedio}%</p>
                            <p className="text-xs text-slate-400 font-medium">Utilización</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-3xl font-black text-violet-400">{formatearPrecio(metricas.revenueYTD)}</p>
                            <p className="text-xs text-slate-400 font-medium">Revenue YTD</p>
                        </div>
                        <div className="bg-slate-900/50 rounded-xl p-4">
                            <p className="text-2xl">🤖</p>
                            <p className="text-xs text-slate-400 font-medium">IA Detectó</p>
                            <p className="text-sm text-amber-400 font-bold">8 sub-utilizados</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Barra de búsqueda y filtros */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-4 mb-6">
                <div className="flex flex-col lg:flex-row gap-4">
                    {/* Búsqueda */}
                    <div className="flex-1 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, código o descripción..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                        />
                    </div>

                    {/* Filtro Tipo */}
                    <select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                    >
                        <option value="">Todos los tipos</option>
                        <option value="PRIME">🌟 Prime</option>
                        <option value="REPARTIDO">📊 Repartido</option>
                        <option value="NOCTURNO">🌙 Nocturno</option>
                        <option value="SENALES">🌡️ Señales</option>
                        <option value="ESPECIAL">🎯 Especial</option>
                        <option value="EXCLUSIVO">💎 Exclusivo</option>
                    </select>

                    {/* Filtro Estado */}
                    <select
                        value={filtroEstado}
                        onChange={(e) => setFiltroEstado(e.target.value)}
                        className="px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                    >
                        <option value="">Todos los estados</option>
                        <option value="ACTIVO">Activo</option>
                        <option value="INACTIVO">Inactivo</option>
                        <option value="MANTENIMIENTO">Mantención</option>
                    </select>

                    {/* Botón Crear */}
                    <Link
                        href="/paquetes/nuevo"
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                    >
                        <span>➕</span>
                        <span>Crear Paquete</span>
                    </Link>
                </div>
            </div>

            {/* Tabla de Paquetes */}
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-4xl animate-spin">🌀</div>
                        <p className="ml-4 text-slate-400 font-medium">Cargando paquetes...</p>
                    </div>
                ) : paquetes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <span className="text-6xl mb-4">📦</span>
                        <p className="text-xl text-slate-400 font-medium">No hay paquetes registrados</p>
                        <Link
                            href="/paquetes/nuevo"
                            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors"
                        >
                            Crear el primer paquete
                        </Link>
                    </div>
                ) : (
                    <table className="w-full">
                        <thead className="bg-slate-900/50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Paquete</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Editora</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Horario</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Precio</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Estado</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {paquetes.map((paquete) => {
                                const tipoInfo = getTipoLabel(paquete.tipo)
                                return (
                                    <tr key={paquete.id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{tipoInfo.emoji}</span>
                                                <div>
                                                    <p className="font-bold text-white">{paquete.nombre}</p>
                                                    <p className="text-xs text-slate-400">{paquete.codigo} • {tipoInfo.label}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white font-medium">{paquete.editora.nombre}</p>
                                            <p className="text-xs text-slate-400">{paquete.programa.nombre}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white font-medium">{paquete.horario.inicio} - {paquete.horario.fin}</p>
                                            <p className="text-xs text-slate-400">{paquete.diasSemana.join(', ')}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            <p className="text-white font-bold">{formatearPrecio(paquete.precioActual)}</p>
                                            <p className="text-xs text-slate-400">Base: {formatearPrecio(paquete.precioBase)}</p>
                                        </td>
                                        <td className="px-4 py-4">
                                            {getEstadoBadge(paquete.estado)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link
                                                    href={`/paquetes/${paquete.id}`}
                                                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                                    title="Ver detalle"
                                                >
                                                    👁️
                                                </Link>
                                                <Link
                                                    href={`/paquetes/${paquete.id}/editar`}
                                                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                                    title="Editar"
                                                >
                                                    ✏️
                                                </Link>
                                                <button
                                                    className="p-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                                    title="Analytics"
                                                >
                                                    📊
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    )
}