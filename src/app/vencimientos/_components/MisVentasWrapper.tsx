'use client'

/**
 * COMPONENT: MIS VENTAS DASHBOARD GLOBAL - TIER 0 FASE 5
 *
 * @description Integración de la navegación al visor global de toda la radio
 * ("Modo Gerencia") y configuración de notificaciones.
 */

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import MisVentasDashboard from './MisVentasDashboard'

export default function MisVentasWrapper() {
  const [verGlobal, setVerGlobal] = useState(false)
  const [cmdKVisible, setCmdKVisible] = useState(false)

  // Drag State para CmdK
  const cmdkRef = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState({ x: typeof window !== 'undefined' ? window.innerWidth / 2 - 336 : 300, y: 150 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (cmdKVisible) {
      setPos({ x: window.innerWidth / 2 - 336, y: 150 })
    }
  }, [cmdKVisible])

  // Atajo Ctrl+K / Cmd+K para Buscador Global
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCmdKVisible(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  if (verGlobal) {
    return (
      <div className="w-full h-full flex flex-col space-y-4">
        <div className="flex justify-between items-center bg-white/80 border border-slate-800 p-4 rounded-xl shadow-lg">
          <div>
            <span className="bg-indigo-500 text-white text-[10px] font-black uppercase px-2 py-1 rounded-md">
              Modo Solo LECTURA
            </span>
            <h2 className="text-xl font-bold text-gray-800 mt-1">Visor Global de Emisora</h2>
            <p className="text-xs text-gray-500">Estás viendo toda la radio. Tu rol es Ejecutivo de Ventas.</p>
          </div>
          <button 
            onClick={() => setVerGlobal(false)}
            className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-gray-600 font-bold rounded-lg border border-slate-700 transition-colors flex items-center gap-2">
            <span>←</span> Volver a Mi Escritorio
          </button>
        </div>
        
        {/* Aquí renderizaríamo el dashboard principal de Vencimientos: <VencimientosDashboardDesktop /> */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 border-none shadow-[inset_10px_10px_30px_#0e121b,_inset_-10px_-10px_30px_#1e263d] rounded-[2rem] flex flex-col items-center justify-center p-12 bg-white/80 border-t border-slate-800/50">
           
           <motion.div 
             animate={{ y: [0, -10, 0] }}
             transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
             className="w-32 h-32 bg-white/80 rounded-full shadow-[20px_20px_60px_#0e121b,_-20px_-20px_60px_#1e263d] flex items-center justify-center mb-8 border border-indigo-500/10">
             <span className="text-6xl drop-shadow-[0_0_20px_rgba(99,102,241,0.4)]">🌐</span>
           </motion.div>
           
           <div className="text-center z-10 p-6 bg-white/80 shadow-[inset_2px_2px_10px_rgba(0,0,0,0.5),_0_-5px_20px_rgba(0,0,0,0.2)] rounded-2xl border border-slate-800 relative overflow-hidden">
             <h3 className="text-2xl font-black text-slate-200 tracking-tight mb-2">Tablero Global Extendido</h3>
             <p className="text-sm font-bold text-gray-500 uppercase tracking-widest">En construcción para TIER 0</p>
           </div>
        </motion.div>
      </div>
    )
  }

  // Si no está en global, renderizamos la vista personal + Botón Switch
  return (
    <div className="relative h-full text-gray-600">
      
      {/* Buscador Global Cmd+K (Overlay Neumórfico) */}
      <AnimatePresence>
        {cmdKVisible && (
          <motion.div 
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(12px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-[#ECEFF8]/60 transition-all">
            
            <motion.div 
              style={{ pointerEvents: 'none' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-[#ECEFF8]/60 backdrop-blur-[12px] transition-all"
            />
            <div 
              className="fixed inset-0 z-[101] overflow-hidden" 
              onClick={(e) => { if (e.target === e.currentTarget) setCmdKVisible(false) }}
              onMouseMove={(e) => {
                if (isDragging) setPos({ x: e.clientX - dragOffset.x, y: e.clientY - dragOffset.y })
              }}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
            >
              <motion.div 
                ref={cmdkRef}
                initial={{ y: -50, scale: 0.9, opacity: 0 }}
                animate={{ y: 0, scale: 1, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                style={{ left: pos.x, top: pos.y }}
                className="absolute bg-white/85 backdrop-blur-2xl w-full max-w-2xl rounded-3xl shadow-[0_30px_60px_rgba(0,0,0,0.15),_inset_2px_2px_5px_rgba(255,255,255,0.5)] border border-white/50 overflow-hidden flex flex-col"
              >
              
                <div 
                  className="flex items-center px-6 py-4 border-b border-gray-100 bg-transparent cursor-grab active:cursor-grabbing"
                  onMouseDown={(e) => {
                     if (!cmdkRef.current) return
                     setIsDragging(true)
                     const rect = cmdkRef.current.getBoundingClientRect()
                     setDragOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top })
                  }}
                >
                  <span className="text-xl mr-3 opacity-50 pointer-events-none">🔍</span>
                  <input
                    autoFocus
                    placeholder="Buscar clientes, agencias, o programas... (Ej: Coca Cola)"
                    aria-label="Buscar clientes, agencias o programas"
                    className="flex-1 bg-transparent border-none text-xl font-bold text-gray-800 outline-none placeholder:text-gray-400"
                    onChange={() => {}} // Lógica real de búsqueda se conectaría aquí
                  />
                  <button onClick={() => setCmdKVisible(false)} className="text-[10px] font-bold uppercase px-3 py-1.5 bg-gray-100/80 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors ml-3 shadow-inner">ESC</button>
                </div>

                <div className="p-10 flex flex-col items-center justify-center text-center bg-gray-50/50">
                   <span className="text-4xl mb-3 block drop-shadow-sm">⚡</span>
                   <p className="text-gray-800 font-bold mb-1">Búsqueda Predictiva Integrada</p>
                   <p className="text-xs text-gray-500 font-medium">Teclea para encontrar clientes o vencimientos al instante sin tocar el mouse.</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute top-0 right-[400px] mt-1 z-10 flex gap-4">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-white/80 rounded-lg shadow-inner border border-slate-800/80 group cursor-pointer" onClick={() => setCmdKVisible(true)}>
          <span className="text-xs font-bold text-gray-500 group-hover:text-indigo-600 transition-colors">Buscador</span>
          <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-gray-500 border border-slate-700 shadow-[inset_2px_2px_5px_#0e121b,_inset_-2px_-2px_5px_#1e263d]">CTRL+K</span>
        </div>

        <button 
          onClick={() => setVerGlobal(true)}
          className="px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-gray-600 text-xs font-bold uppercase tracking-wider rounded-lg border border-slate-700/50 backdrop-blur-sm transition-all shadow-[4px_4px_10px_rgba(0,0,0,0.5)] active:shadow-inner flex items-center gap-2">
          <span>🌐</span> Ver Tablero Global
        </button>
      </div>

      <MisVentasDashboard />
    </div>
  )
}
