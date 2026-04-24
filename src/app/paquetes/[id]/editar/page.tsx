'use client'

/**
 * PAGE: Editar Paquete
 * 
 * @description Formulario para editar un paquete existente.
 * 
 * @version 1.0.0
 */

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

const TIPOS_PAQUETE = [
    { value: 'PRIME', label: 'Prime', emoji: '🌟' },
    { value: 'REPARTIDO', label: 'Repartido', emoji: '📊' },
    { value: 'NOCTURNO', label: 'Nocturno', emoji: '🌙' },
    { value: 'SENALES', label: 'Señales', emoji: '🌡️' },
    { value: 'ESPECIAL', label: 'Especial', emoji: '🎯' },
    { value: 'EXCLUSIVO', label: 'Exclusivo', emoji: '💎' }
]

const DURACIONES = [5, 10, 15, 20, 30, 45, 60]
const DIAS_SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D']
const DIAS_LABELS: Record<string, string> = { 'L': 'Lun', 'M': 'Mar', 'X': 'Mié', 'J': 'Jue', 'V': 'Vie', 'S': 'Sáb', 'D': 'Dom' }
const NIVELES_EXCLUSIVIDAD = ['EXCLUSIVO', 'COMPARTIDO', 'ABIERTO']

interface PaqueteEditando {
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
}

export default function EditarPaquetePage() {
    const params = useParams()
    const router = useRouter()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [formData, setFormData] = useState<PaqueteEditando>({
        id: '',
        codigo: '',
        nombre: '',
        descripcion: '',
        tipo: 'PRIME',
        estado: 'ACTIVO',
        editora_id: '',
        editora_nombre: '',
        programa_id: '',
        programa_nombre: '',
        horario_inicio: '07:00',
        horario_fin: '09:00',
        dias_semana: ['L', 'M', 'M', 'J', 'V'],
        duraciones: [15, 30],
        precio_base: 0,
        precio_actual: 0,
        nivel_exclusividad: 'COMPARTIDO',
        vigencia_desde: '',
        vigencia_hasta: ''
    })

    useEffect(() => {
        if (params.id) {
            cargarPaquete(params.id as string)
        }
    }, [params.id])

    const cargarPaquete = async (id: string) => {
        try {
            const response = await fetch(`/api/paquetes/${id}`)
            if (!response.ok) {
                throw new Error('Paquete no encontrado')
            }
            const data = await response.json()

            setFormData({
                id: data.id,
                codigo: data.codigo,
                nombre: data.nombre,
                descripcion: data.descripcion || '',
                tipo: data.tipo,
                estado: data.estado,
                editora_id: data.editora_id,
                editora_nombre: data.editora_nombre,
                programa_id: data.programa_id,
                programa_nombre: data.programa_nombre,
                horario_inicio: data.horario_inicio,
                horario_fin: data.horario_fin,
                dias_semana: data.dias_semana,
                duraciones: data.duraciones,
                precio_base: data.precio_base,
                precio_actual: data.precio_actual,
                nivel_exclusividad: data.nivel_exclusividad,
                vigencia_desde: data.vigencia_desde?.split('T')[0] || '',
                vigencia_hasta: data.vigencia_hasta?.split('T')[0] || ''
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar')
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        setError('')

        try {
            const response = await fetch(`/api/paquetes/${formData.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    tipo: formData.tipo,
                    editoraId: formData.editora_id,
                    editoraNombre: formData.editora_nombre,
                    programaId: formData.programa_id,
                    programaNombre: formData.programa_nombre,
                    horario: { inicio: formData.horario_inicio, fin: formData.horario_fin },
                    diasSemana: formData.dias_semana,
                    duraciones: formData.duraciones,
                    precioBase: formData.precio_base,
                    precioActual: formData.precio_actual,
                    nivelExclusividad: formData.nivel_exclusividad,
                    vigenciaDesde: formData.vigencia_desde,
                    vigenciaHasta: formData.vigencia_hasta,
                    updatedBy: 'system'
                })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Error al actualizar')
            }

            router.push(`/paquetes/${formData.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido')
        } finally {
            setSaving(false)
        }
    }

    const toggleDia = (dia: string) => {
        setFormData(prev => ({
            ...prev,
            dias_semana: prev.dias_semana.includes(dia)
                ? prev.dias_semana.filter(d => d !== dia)
                : [...prev.dias_semana, dia]
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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <Link href={`/paquetes/${formData.id}`} className="text-slate-400 hover:text-white transition-colors">
                        ← Volver
                    </Link>
                    <span className="text-4xl">✏️</span>
                    <h1 className="text-3xl font-black text-white tracking-tight">
                        Editar Paquete
                    </h1>
                </div>
                <p className="text-slate-400 font-medium">
                    {formData.codigo}
                </p>
            </div>

            {error && (
                <div className="mb-6 p-4 bg-rose-500/20 border border-rose-500/50 rounded-xl">
                    <p className="text-rose-400 font-bold">{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Información Básica */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Configuración Fundamental</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Nombre *</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, nombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Descripción</label>
                            <input
                                type="text"
                                value={formData.descripcion}
                                onChange={(e) => setFormData(prev => ({ ...prev, descripcion: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-blue-500/50"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Tipo</label>
                            <select
                                value={formData.tipo}
                                onChange={(e) => setFormData(prev => ({ ...prev, tipo: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            >
                                {TIPOS_PAQUETE.map(t => (
                                    <option key={t.value} value={t.value}>{t.emoji} {t.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Estado</label>
                            <select
                                value={formData.estado}
                                onChange={(e) => setFormData(prev => ({ ...prev, estado: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            >
                                <option value="ACTIVO">Activo</option>
                                <option value="INACTIVO">Inactivo</option>
                                <option value="MANTENIMIENTO">Mantención</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Editora y Programa */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Editora y Programa</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Nombre Editora</label>
                            <input
                                type="text"
                                value={formData.editora_nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, editora_nombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Nombre Programa</label>
                            <input
                                type="text"
                                value={formData.programa_nombre}
                                onChange={(e) => setFormData(prev => ({ ...prev, programa_nombre: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Horarios */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Horarios</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Hora Inicio</label>
                            <input
                                type="time"
                                value={formData.horario_inicio}
                                onChange={(e) => setFormData(prev => ({ ...prev, horario_inicio: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Hora Fin</label>
                            <input
                                type="time"
                                value={formData.horario_fin}
                                onChange={(e) => setFormData(prev => ({ ...prev, horario_fin: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Precio Base (CLP)</label>
                            <input
                                type="number"
                                value={formData.precio_base}
                                onChange={(e) => setFormData(prev => ({ ...prev, precio_base: parseInt(e.target.value) || 0 }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Nivel Exclusividad</label>
                            <select
                                value={formData.nivel_exclusividad}
                                onChange={(e) => setFormData(prev => ({ ...prev, nivel_exclusividad: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            >
                                {NIVELES_EXCLUSIVIDAD.map(n => (
                                    <option key={n} value={n}>{n}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-bold text-slate-400 mb-3">Días de la Semana</label>
                        <div className="flex flex-wrap gap-3">
                            {DIAS_SEMANA.map((dia, idx) => (
                                <button
                                    key={`${dia}-${idx}`}
                                    type="button"
                                    onClick={() => toggleDia(dia)}
                                    className={`w-12 h-12 rounded-xl font-bold transition-all ${formData.dias_semana.includes(dia)
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {DIAS_LABELS[dia]}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6">
                        <label className="block text-sm font-bold text-slate-400 mb-3">Duraciones Disponibles</label>
                        <div className="flex flex-wrap gap-3">
                            {DURACIONES.map(d => (
                                <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDuracion(d)}
                                    className={`px-4 py-2 rounded-xl font-medium transition-all ${formData.duraciones.includes(d)
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                        }`}
                                >
                                    {d}s
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vigencia */}
                <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-2xl p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Vigencia</h2>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Desde</label>
                            <input
                                type="date"
                                value={formData.vigencia_desde}
                                onChange={(e) => setFormData(prev => ({ ...prev, vigencia_desde: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-400 mb-2">Fecha Hasta</label>
                            <input
                                type="date"
                                value={formData.vigencia_hasta}
                                onChange={(e) => setFormData(prev => ({ ...prev, vigencia_hasta: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white focus:outline-none"
                            />
                        </div>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-4 pt-6">
                    <Link
                        href={`/paquetes/${formData.id}`}
                        className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors"
                    >
                        Cancelar
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
                    >
                        {saving ? 'Guardando...' : '💾 Guardar Cambios'}
                    </button>
                </div>
            </form>
        </div>
    )
}