/**
 * 🧺 COMPONENT: EvidenceBasket
 * 
 * Componente flotante para gestionar la "Cesta de Evidencia".
 * Permite agrupar múltiples verificaciones y generar un link único masivo
 * con todas las evidencias seleccionadas.
 * 
 * @tier TIER_0_ENTERPRISE
 * @design NEUROMORPHIC
 */

'use client';

import { useState, useEffect } from 'react';
import {
  ShoppingCart,
  X,
  CheckCircle2,
  Play,
  Download,
  Share2,
  Link2,
  Trash2,
  ChevronUp,
  ChevronDown,
  Film,
  Clock,
  Shield,
  FileAudio,
  Mic2,
  Radio
} from 'lucide-react';

export interface BasketItem {
  id: string;
  verificacionId: string;
  materialId: string;
  materialNombre: string;
  tipoMaterial: 'audio_pregrabado' | 'mencion_vivo' | 'presentacion' | 'cierre' | 'display_banner';
  clipUrl?: string;
  duracion?: number;
  horaEmision?: string;
  accuracy?: number;
  seleccionada: boolean;
}

interface EvidenceBasketProps {
  items: BasketItem[];
  onRemoveItem: (id: string) => void;
  onToggleItem: (id: string) => void;
  onClearAll: () => void;
  onExportSelected: () => void;
  onGenerateSecureLink: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function EvidenceBasket({
  items,
  onRemoveItem,
  onToggleItem,
  onClearAll,
  onExportSelected,
  onGenerateSecureLink,
  isExpanded,
  onToggleExpand
}: EvidenceBasketProps) {

  const selectedCount = items.filter(i => i.seleccionada).length;
  const totalCount = items.length;
  const selectedDuration = items.filter(i => i.seleccionada).reduce((sum, i) => sum + (i.duracion || 0), 0);

  const getTipoIcon = (tipo: BasketItem['tipoMaterial']) => {
    switch (tipo) {
      case 'audio_pregrabado': return <FileAudio className="w-3 h-3" />;
      case 'mencion_vivo': return <Mic2 className="w-3 h-3" />;
      case 'presentacion': return <Radio className="w-3 h-3" />;
      case 'cierre': return <Radio className="w-3 h-3" />;
      default: return <Film className="w-3 h-3" />;
    }
  };

  if (totalCount === 0) return null;

  return (
    <div className={`
      fixed right-4 bottom-4 z-50 w-80 transition-all duration-300
      ${isExpanded ? 'mb-4' : ''}
    `}>

      {/* Expanded Content */}
      {isExpanded && (
        <div className={`
          bg-[#e0e5ec] rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] 
          overflow-hidden mb-4 border border-white/40
        `}>

          {/* Header */}
          <div className="bg-gradient-to-r from-[#6888ff] to-[#5572ee] p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <ShoppingCart className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-black text-white text-sm">Cesta de Evidencia</p>
                <p className="text-blue-100 text-xs">{selectedCount} de {totalCount} seleccionadas</p>
              </div>
            </div>
            <button
              onClick={onToggleExpand}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
            >
              <ChevronDown className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Items List */}
          <div className="max-h-64 overflow-y-auto p-3 space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className={`
                  flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer
                  ${item.seleccionada
                    ? 'bg-emerald-50 border border-emerald-200 shadow-sm'
                    : 'bg-white border border-slate-100 hover:border-slate-200'}
                `}
                onClick={() => onToggleItem(item.id)}
              >
                {/* Checkbox */}
                <div className={`
                  w-6 h-6 rounded-lg flex items-center justify-center transition-all
                  ${item.seleccionada
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 text-slate-400'}
                `}>
                  {item.seleccionada && <CheckCircle2 className="w-4 h-4" />}
                </div>

                {/* Icon */}
                <div className={`
                  w-8 h-8 rounded-lg flex items-center justify-center
                  ${item.tipoMaterial === 'audio_pregrabado' ? 'bg-blue-100 text-blue-600' :
                    item.tipoMaterial === 'mencion_vivo' ? 'bg-purple-100 text-purple-600' :
                      'bg-amber-100 text-amber-600'}
                `}>
                  {getTipoIcon(item.tipoMaterial)}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-700 truncate">{item.materialNombre}</p>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400">
                    {item.horaEmision && <span>{item.horaEmision}</span>}
                    {item.duracion && <span>{item.duracion}s</span>}
                    {item.accuracy && <span className="text-emerald-500">{item.accuracy}%</span>}
                  </div>
                </div>

                {/* Actions */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveItem(item.id);
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="p-4 bg-slate-50 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
              <span>Duración total:</span>
              <span className="font-bold">{Math.round(selectedDuration)}s</span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={onClearAll}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-300 transition-colors"
              >
                Vaciar
              </button>
              <button
                onClick={onExportSelected}
                disabled={selectedCount === 0}
                className={`
                  flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1
                  ${selectedCount === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-[#6888ff] text-white hover:bg-[#5572ee]'}
                `}
              >
                <Download className="w-3 h-3" />
                Exportar
              </button>
              <button
                onClick={onGenerateSecureLink}
                disabled={selectedCount === 0}
                className={`
                  flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1
                  ${selectedCount === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'}
                `}
              >
                <Shield className="w-3 h-3" />
                Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Collapsed Toggle Button */}
      <button
        onClick={onToggleExpand}
        className={`
          w-full bg-[#e0e5ec] rounded-2xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff] 
          p-4 flex items-center justify-between border border-white/40 transition-all
          hover:shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
          ${isExpanded ? '' : 'hover:scale-[1.02] active:scale-[0.98]'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6888ff] to-[#5572ee] flex items-center justify-center shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            {totalCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {totalCount}
              </div>
            )}
          </div>
          <div className="text-left">
            <p className="font-bold text-slate-700 text-sm">Evidencia</p>
            <p className="text-xs text-slate-500">
              {selectedCount > 0 ? `${selectedCount} seleccionadas` : `${totalCount} items`}
            </p>
          </div>
        </div>
        <ChevronUp className={`w-5 h-5 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
      </button>
    </div>
  );
}

// Hook for managing basket state with localStorage persistence
export function useEvidenceBasket() {
  const [items, setItems] = useState<BasketItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('evidence_basket');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      // Ignore localStorage errors
    }
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('evidence_basket', JSON.stringify(items));
    } catch (e) {
      // Ignore localStorage errors
    }
  }, [items]);

  const addItem = (item: Omit<BasketItem, 'seleccionada'>) => {
    setItems(prev => {
      if (prev.find(i => i.id === item.id)) return prev;
      return [...prev, { ...item, seleccionada: true }];
    });
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  };

  const toggleItem = (id: string) => {
    setItems(prev => prev.map(i =>
      i.id === id ? { ...i, seleccionada: !i.seleccionada } : i
    ));
  };

  const clearAll = () => setItems([]);

  const toggleExpand = () => setIsExpanded(prev => !prev);

  return {
    items,
    isExpanded,
    addItem,
    removeItem,
    toggleItem,
    clearAll,
    toggleExpand,
    setItems
  };
}
