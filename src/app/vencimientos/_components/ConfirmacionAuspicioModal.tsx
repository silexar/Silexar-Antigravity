'use client'

/**
 * COMPONENTE: MODAL CONFIRMACIÓN AUSPICIO
 * TIER 0 ENTERPRISE FASE 2
 */

import { useState, useRef, useEffect } from 'react'

interface ConfirmacionModalProps {
  isOpen: boolean
  onClose: () => void
  tipo: 'inicio' | 'fin'
  clienteNombre?: string
  programaNombre?: string
}

export default function ConfirmacionAuspicioModal({
  isOpen, onClose, tipo, clienteNombre = 'Coca-Cola Chile', programaNombre = 'Buenos Días Radio'
}: ConfirmacionModalProps) {
  const [materialesVerificados, setMaterialesVerificados] = useState(false)
  const [comentario, setComentario] = useState('')

  // Drag state
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - 256 : 300, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isOpen) {
      setPos({ x: window.innerWidth / 2 - 256, y: window.innerHeight / 2 - 300 })
    }
  }, [isOpen])

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!modalRef.current) return
    setIsDragging(true)
    const rect = modalRef.current.getBoundingClientRect()
    setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return
    setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
  }

  const handleMouseUp = () => setIsDragging(false)

  if (!isOpen) return null

  const esInicio = tipo === 'inicio'

  return (
    <div 
      className="fixed inset-0 z-50 overflow-hidden" 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={onClose} />
      
      <div 
        ref={modalRef}
        className="absolute w-full max-w-lg rounded-3xl border border-white/50 bg-white/85 backdrop-blur-2xl p-6 shadow-2xl shadow-gray-300/40"
        style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
      >
        {/* Header - Zona de arrastre */}
        <div 
          className="flex items-center justify-between mb-6 pb-2 border-b border-gray-100 cursor-grab active:cursor-grabbing"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl pointer-events-none">{esInicio ? '🟢' : '🔴'}</span>
            <div className="pointer-events-none">
              <h2 className="text-lg font-bold text-gray-800">
                {esInicio ? 'Confirmar Inicio de Auspicio' : 'Confirmar Fin de Auspicio'}
              </h2>
              <p className="text-xs text-gray-400">R2 — Operador de Tráfico</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">✕</button>
        </div>

        {/* Info */}
        <div className="rounded-xl bg-white/70 p-4 mb-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Cliente</span>
            <span className="text-gray-800 font-semibold">{clienteNombre}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Programa</span>
            <span className="text-gray-800 font-semibold">{programaNombre}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Acción</span>
            <span className={esInicio ? 'text-emerald-600 font-semibold' : 'text-red-600 font-semibold'}>
              {esInicio ? 'INICIO' : 'FIN'} de emisión
            </span>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-3 mb-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={materialesVerificados}
              onChange={e => setMaterialesVerificados(e.target.checked)}
              className="w-5 h-5 rounded border-white/30 bg-white/70 accent-amber-500"
            />
            <span className="text-sm text-gray-800">
              {esInicio ? 'Materiales de presentación/cierre cargados y verificados' : 'Materiales de presentación/cierre retirados'}
            </span>
          </label>
        </div>

        {/* Comentario */}
        <textarea
          placeholder="Comentario opcional..."
          value={comentario}
          onChange={e => setComentario(e.target.value)}
          className="w-full h-20 rounded-xl bg-white/70 border border-gray-200 text-gray-800 text-sm p-3 outline-none resize-none placeholder:text-gray-400 focus:border-amber-500/50"
        />

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="flex-1 px-4 py-3 rounded-full border border-gray-200 text-gray-600 text-sm font-medium hover:bg-white/90 shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-gray-200">
            Cancelar
          </button>
          <button
            disabled={!materialesVerificados}
            className={`flex-1 px-4 py-3 rounded-full text-sm font-bold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 ${materialesVerificados
              ? esInicio 
                 ? 'bg-emerald-500 text-white shadow-emerald-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:ring-emerald-500' 
                 : 'bg-red-500 text-white shadow-red-200/50 hover:shadow-lg hover:scale-[1.02] active:scale-95 focus:ring-red-500'
              : 'bg-gray-100 text-gray-400 shadow-none cursor-not-allowed'}`}
          >
            {esInicio ? '✅ Confirmar Inicio' : '🔴 Confirmar Fin'}
          </button>
        </div>
      </div>
    </div>
  )
}
