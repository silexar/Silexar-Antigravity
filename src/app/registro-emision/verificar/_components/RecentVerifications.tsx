/**
 * 📜 COMPONENT: RecentVerifications
 * 
 * Panel de acceso rápido a las últimas verificaciones realizadas.
 * Persiste en localStorage para mantener estado entre sesiones.
 * 
 * @tier TIER_0_EFFICIENCY
 */

'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';

import { RecentItem } from '../_utils/recentVerificationsStorage';

interface RecentVerificationsProps {
  onReload?: (item: RecentItem) => void;
}

export function RecentVerifications({ onReload }: RecentVerificationsProps) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    // Load from localStorage on mount
    const stored = localStorage.getItem('silexar_recent_verifications');
    if (stored) {
      setItems(JSON.parse(stored));
    } else {
      // Mock initial data
      const mockItems: RecentItem[] = [
        { id: '1', campana: 'Campaña Navidad Premium', fecha: '2024-12-15', hora: '14:32', encontrados: 8, total: 10, estado: 'completado' },
        { id: '2', campana: 'Black Friday Especial', fecha: '2024-12-14', hora: '09:15', encontrados: 5, total: 5, estado: 'completado' },
        { id: '3', campana: 'Banco XYZ Q4', fecha: '2024-12-13', hora: '16:45', encontrados: 2, total: 4, estado: 'completado' },
      ];
      setItems(mockItems);
      localStorage.setItem('silexar_recent_verifications', JSON.stringify(mockItems));
    }
  }, []);

  return (
    <div className="bg-[#e0e5ec] rounded-2xl shadow-[inset_4px_4px_8px_#b8b9be,inset_-4px_-4px_8px_#ffffff] p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-black text-slate-600 uppercase tracking-widest flex items-center gap-2">
          <Clock className="w-4 h-4 text-slate-400" /> Recientes
        </h3>
        <span className="text-[10px] font-bold text-slate-400 bg-slate-200 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>

      <div className="space-y-3">
        {items.slice(0, 5).map((item) => (
          <div 
            key={item.id}
            onClick={() => onReload?.(item)}
            className="flex items-center justify-between p-3 bg-white/50 rounded-xl border border-white cursor-pointer hover:bg-white hover:shadow-md transition-all group"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.estado === 'completado' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                {item.estado === 'completado' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-slate-700 text-sm truncate">{item.campana}</p>
                <p className="text-[10px] text-slate-400">{item.fecha} • {item.hora}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">{item.encontrados}/{item.total}</span>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-500 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && (
        <div className="text-center py-6 text-slate-400 text-sm">
          No hay verificaciones recientes
        </div>
      )}
    </div>
  );
}

// Utility moved to ../_utils/recentVerificationsStorage.ts
