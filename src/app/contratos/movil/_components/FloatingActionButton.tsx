/**
 * ? MOBILE: Floating Action Button Global
 * 
 * Botón flotante con acciones rápidas: Smart Capture,
 * Nueva nota, Escanear documento, Llamar cliente.
 * Expandible con animación radial.
 * 
 * @tier TIER_0_ENTERPRISE
 * @platform MOBILE
 */

'use client';

import { useState } from 'react';
import {
  X, Sparkles, FileText,
  Camera, Phone, Zap,
} from 'lucide-react';

interface FABAction {
  id: string;
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick: () => void;
}

interface FloatingActionButtonProps {
  onSmartCapture: () => void;
  onNuevoContrato: () => void;
  onEscanear: () => void;
  onLlamar: () => void;
}

export function FloatingActionButton({ onSmartCapture, onNuevoContrato, onEscanear, onLlamar }: FloatingActionButtonProps) {
  const [open, setOpen] = useState(false);

  const actions: FABAction[] = [
    { id: 'capture', icon: <Sparkles className="w-5 h-5" />, label: 'Smart Capture', color: 'bg-[#6888ff]', onClick: () => { setOpen(false); onSmartCapture(); } },
    { id: 'contrato', icon: <FileText className="w-5 h-5" />, label: 'Nuevo Contrato', color: 'bg-[#6888ff]', onClick: () => { setOpen(false); onNuevoContrato(); } },
    { id: 'escanear', icon: <Camera className="w-5 h-5" />, label: 'Escanear Doc', color: 'bg-[#6888ff]', onClick: () => { setOpen(false); onEscanear(); } },
    { id: 'llamar', icon: <Phone className="w-5 h-5" />, label: 'Llamar Cliente', color: 'bg-gradient-to-r from-blue-500 to-cyan-500', onClick: () => { setOpen(false); onLlamar(); } },
  ];

  return (
    <>
      {/* OVERLAY */}
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setOpen(false)} />
      )}

      {/* ACCIONES */}
      <div className="fixed bottom-28 right-4 z-50 flex flex-col-reverse items-end gap-3">
        {open && actions.map((a, i) => (
          <div key={a.id}
            className="flex items-center gap-3 animate-in slide-in-from-bottom-2"
            style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}>
            <span className="px-3 py-1.5 bg-[#dfeaff] rounded-lg shadow-lg text-xs font-bold text-[#69738c]">
              {a.label}
            </span>
            <button onClick={a.onClick}
              className={`w-12 h-12 rounded-full ${a.color} text-white shadow-lg flex items-center justify-center active:scale-90 transition-transform`}>
              {a.icon}
            </button>
          </div>
        ))}
      </div>

      {/* FAB PRINCIPAL */}
      <button
        onClick={() => setOpen(!open)}
        className={`fixed bottom-28 right-4 z-50 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 ${
          open ? 'bg-[#69738c] rotate-45' : 'bg-[#6888ff]'
        }`}>
        {open ? <X className="w-6 h-6 text-white" /> : <Zap className="w-6 h-6 text-white" />}
      </button>
    </>
  );
}
