/**
 * 🛒 COMPONENT: EvidenceBasket
 * 
 * Componente flotante para gestionar la "Cesta de Evidencia".
 * Permite agrupar múltiples verificaciones y generar un link único masivo.
 * 
 * @tier TIER_0_AGILITY
 */

'use client';

import { useState } from 'react';
import { ShoppingBasket, X, Trash2, Link2 } from 'lucide-react';
import { SecureLinkModal } from './SecureLinkModal';

export interface BasketItem {
  id: string;
  nombre: string;
  spxCode: string;
  hora: string;
  emisora: string;
  clipUrl?: string; // Mock url
}

interface EvidenceBasketProps {
  items: BasketItem[];
  onRemove: (id: string) => void;
  onClear: () => void;
}

export function EvidenceBasket({ items, onRemove, onClear }: EvidenceBasketProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);

  if (items.length === 0) return null;

  return (
    <>
      {/* FLOATING TRIGGER */}
      <div className="fixed bottom-8 right-8 z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="relative group flex items-center justify-center w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl hover:bg-indigo-500 hover:scale-110 transition-all duration-300"
        >
          <ShoppingBasket className="w-8 h-8" />
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-slate-900">
            {items.length}
          </span>
          <span className="absolute right-20 bg-[#F0EDE8] text-white text-xs font-bold px-3 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ver Cesta
          </span>
        </button>
      </div>

      {/* BASKET PANEL */}
      {isOpen && (
        <div className="fixed bottom-28 right-8 w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in slide-in-from-bottom-10 fade-in">
          <div className="bg-indigo-600 p-4 flex items-center justify-between text-white">
            <h3 className="font-bold flex items-center gap-2">
              <ShoppingBasket className="w-5 h-5" /> Cesta de Evidencia ({items.length})
            </h3>
            <div className="flex gap-2">
                <button onClick={onClear} className="p-1 hover:bg-indigo-500 rounded" title="Limpiar"><Trash2 className="w-4 h-4" /></button>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-indigo-500 rounded"><X className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto p-4 space-y-3 bg-slate-50">
            {items.map((item) => (
              <div key={item.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center group">
                <div className="min-w-0">
                  <p className="font-bold text-sm text-slate-700 truncate">{item.nombre}</p>
                  <p className="text-xs text-slate-500">{item.spxCode} • {item.hora}</p>
                </div>
                <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-white border-t border-slate-200">
            <button 
              onClick={() => setShowLinkModal(true)}
              className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg shadow-indigo-500/30 flex items-center justify-center gap-2"
            >
              <Link2 className="w-5 h-5" /> Generar Link Único Masivo
            </button>
          </div>
        </div>
      )}

      {/* MASS LINK MODAL */}
      <SecureLinkModal 
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        onSend={(data) => {
            ;
            setShowLinkModal(false);
            onClear(); // Clear basket after send
            alert(`Link Masivo Enviado a ${data.email}!`);
        }}
        materialName={`${items.length} Registros de Emisión`}
        spxCode="PACK-MASIVO"
        campanaName="Campaña Múltiple (Basket Mode)"
      />
    </>
  );
}
