'use client'

/**
 * PAGE: Crear Nuevo Paquete
 * 
 * @description Wizard para creación de nuevos paquetes.
 * 
 * @version 1.0.0
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const TIPOS_PAQUETE = [
    { value: 'PRIME', label: 'Prime', emoji: '🌟', descripcion: 'Horarios premium con alta audiencia' },
    { value: 'REPARTIDO', label: 'Repartido', emoji: '📊', descripcion: 'Distribución equitativa a lo largo del día' },
    { value: 'NOCTURNO', label: 'Nocturno', emoji: '🌙', descripcion: 'Horarios económicos para presupuestos ajustados' },
    { value: 'SENALES', label: 'Señales', emoji: '🌡️', descripcion: 'Contenido variable según condiciones' },
    { value: 'ESPECIAL', label: 'Especial', emoji: '🎯', descripcion: 'Ofertas promocionales temporales' },
    { value: 'EXCLUSIVO', label: 'Exclusivo', emoji: '💎', descripcion: 'Auspicios únicos por programa' }
]

const DURACIONES = [
    { value: 5, label: '5 seg' },
    { value: 10, label: '10 seg' },
    { value: 15, label: '15 seg' },
    { value: 20, label: '20 seg' },
    { value: 30, label: '30 seg' },
    { value: 45, label: '45 seg' },
    { value: 60, label: '60 seg' }
]

const DIAS_SEMANA = [
    { value: 'L', label: 'Lunes' },
    { value: 'M', label: 'Martes' },
    { value: 'M', label: 'Miércoles' },
    { value: 'J', label: 'Jueves' },
    { value: 'V', label: 'Viernes' },
    { value: 'S', label: 'Sábado' },
    { value: 'D', label: 'Domingo' }
]

const NIVELES_EXCLUSIVIDAD = [
    { value: 'EXCLUSIVO', label: 'Exclusivo', descripcion: 'Un único anunciante por horario' },
    { value: 'COMPARTIDO', label: 'Compartido', descripcion: 'Máximo 2-3 anunciantes del mismo rubro' },
    { value: 'ABIERTO', label: 'Abierto', descripcion: 'Sin restricciones de competencia' }
]

export default function NuevoPaquetePage() {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'PRIME',
        editoraId: '',
        editoraNombre: '',
        programaId: '',
        programaNombre: '',
        horarioInicio: '07:00',
        horarioFin: '09:00',
        diasSemana: ['L', 'M', 'M', 'J', 'V'] as string[],
        duraciones: [15, 30] as number[],
        precioBase: 0,
        nivelExclusividad: 'COMPARTIDO',
        vigenciaDesde: '',
        vigenciaHasta: ''
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/paquetes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    tipo: formData.tipo,
                    editoraId: formData.editoraId || 'default',
                    editoraNombre: formData.editoraNombre || 'Editora Default',
                    programaId: formData.programaId || 'default',
                    programaNombre: formData.programaNombre || 'Programa Default',
                    horario: { inicio: formData.horarioInicio, fin: formData.horarioFin },
                    diasSemana: formData.diasSemana,
                    duraciones: formData.duraciones,
                    precioBase: formData.precioBase,
                    nivelExclusividad: formData.nivelExclusividad,
                    vigenciaDesde: formData.vigenciaDesde || new Date().toISOString().split('T')[0],
                    vigenciaHasta: formData.vigenciaHasta || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    createdBy: 'system'
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al crear paquete')
            }

            router.push('/paquetes')
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setLoading(false)
        }
    }

    const toggleDia = (dia: string) => {
        setFormData(prev => ({
            ...prev,
            diasSemana: prev.diasSemana.includes(dia)
                ? prev.diasSemana.filter(d => d !== dia)
                : [...prev.diasSemana, dia]
        }))
    }

    const toggleDuracion = (duracion: number) => {
        setFormData(prev => ({
            ...prev,
            duraciones: prev.duraciones.includes(duracion)
                ? prev.duraciones.filter(d => d !== duracion)
                : [...prev.duraciones, duracion]
        }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="text-4xl">➕</span>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Crear Nuevo Paquete
                    </h1>
                </div>
                <p className="text-slate-400 font-medium">
                    Dashboard &gt; Paquetes &gt; Nuevo
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl">
                    <p className="text-rose-400 font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Selección de Tipo */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>🤖</span> ¿Qué tipo de paquete necesitas?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {TIPOS_PAQUETE.map(tipo => (
                            <button
                                key={tipo.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, tipo: tipo.value }))}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${formData.tipo === tipo.value
                                    ? 'border-blue-500 bg-blue-500/10'
                                    : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-2xl">{tipo.emoji}</span>
                                    <span className="font-bold text-white">{tipo.label}</span>
                                </div>
                                <p className="text-sm text-slate-400">{tipo.descripcion}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Información Básica */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>📝</span> Configuración Fundamental
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                Nombre del Paquete *
                            </label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Ej: Prime Matinal Radio Corazón"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                Descripción
                            </label>
                            <input
                                type="text"
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Descripción breve del paquete"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                Nombre Editora
                            </label>
                            <input
                                type="text"
                                value={formData.editoraNombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, editoraNombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Ej: Radio Corazón"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">
                                Nombre Programa
                            </label>
                            <input
                                type="text"
                                value={formData.programaNombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, programaNombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                placeholder="Ej: Programas de la Mañana"
                            />
                        </div>
                    </div>
                </div>

                {/* Horarios y Días */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>⏰</span> Configuración Horaria
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.horarioInicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, horarioInicio: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Hora Fin</label>
                            <input
                                type="time"
                                value={formData.horarioFin}
                                onChange={(e) => setFormData(prev => ({ ...prev, horarioFin: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Precio Base (CLP) *</label>
                            <input
                                type="number"
                                value={formData.precioBase}
                                onChange={(e) => setFormData(prev => ({ ...prev, precioBase: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                                placeholder="15000"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-bold text-slate-400 mb-3">Días de la Semana</label>
                        <div className="flex flex-wrap gap-3">
                            {DIAS_SEMANA.map((dia, idx) => (
                                <button
                                    key={`${dia.value}-${idx}`}
                                    type="button"
                                    onClick={() => toggleDia(dia.value)}
                                    className={`w-12 h-12 rounded-xl font-bold transition-all ${formData.diasSemana.includes(dia.value)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {dia.label.charAt(0)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Duraciones */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>📏</span> Duraciones Disponibles
                    </h2>
                    <div className="flex flex-wrap gap-3">
                        {DURACIONES.map(duracion => (
                            <button
                                key={duracion.value}
                                type="button"
                                onClick={() => toggleDuracion(duracion.value)}
                                className={`px-4 py-2 rounded-xl font-medium transition-all ${formData.duraciones.includes(duracion.value)
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                    }`}
                            >
                                {duracion.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Exclusividad */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>🛡️</span> Nivel de Exclusividad
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {NIVELES_EXCLUSIVIDAD.map(nivel => (
                            <button
                                key={nivel.value}
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, nivelExclusividad: nivel.value }))}
                                className={`p-4 rounded-xl border-2 transition-all text-left ${formData.nivelExclusividad === nivel.value
                                    ? 'border-emerald-500 bg-emerald-500/10'
                                    : 'border-slate-700 hover:border-slate-600'
                                    }`}
                            >
                                <span className="font-bold text-white">{nivel.label}</span>
                                <p className="text-sm text-slate-400 mt-1">{nivel.descripcion}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Fechas */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                        <span>📅</span> Vigencia
                    </h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Desde</label>
                            <input
                                type="date"
                                value={formData.vigenciaDesde}
                                onChange={(e) => setFormData(prev => ({ ...prev, vigenciaDesde: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Hasta</label>
                            <input
                                type="date"
                                value={formData.vigenciaHasta}
                                onChange={(e) => setFormData(prev => ({ ...prev, vigenciaHasta: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Creando...' : '➕ Crear Paquete'}
                    </button>
                </div>
            </form>
        </div>
    )
}