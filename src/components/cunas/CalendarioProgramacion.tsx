/**
 * 📅 SILEXAR PULSE - Calendario de Programación TIER 0
 * 
 * Componente de visualización tipo Gantt para programación
 * de cuñas y activos digitales
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import { useState, useMemo, useRef } from 'react';
import {
  ChevronLeft, ChevronRight, Calendar, ZoomIn, ZoomOut,
  Music, Image, Video, AlertCircle, Clock, CheckCircle
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface ItemCalendario {
  id: string;
  codigo: string;
  nombre: string;
  tipo: 'cuna' | 'banner' | 'video' | 'audio_digital';
  anuncianteNombre: string;
  fechaInicio: Date;
  fechaFin: Date;
  estado: string;
  urgencia?: string;
  color: string;
}

interface CalendarioProps {
  items: ItemCalendario[];
  onItemClick?: (id: string) => void;
  onItemDrag?: (id: string, newStart: Date, newEnd: Date) => void;
}

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const diasDelMes = (year: number, month: number): number => {
  return new Date(year, month + 1, 0).getDate();
};

const nombreMes = (month: number): string => {
  const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
                 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return meses[month];
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const nombreDiaSemana = (day: number): string => {
  const dias = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return dias[day];
};

const esMismoDia = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
         d1.getMonth() === d2.getMonth() &&
         d1.getDate() === d2.getDate();
};

const TipoIcon = ({ tipo }: { tipo: string }) => {
  switch (tipo) {
    case 'cuna': return <Music className="w-3 h-3" />;
    case 'banner': return <Image className="w-3 h-3" />;
    case 'video': return <Video className="w-3 h-3" />;
    default: return <Music className="w-3 h-3" />;
  }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export function CalendarioProgramacion({ items, onItemClick }: CalendarioProps) {
  const [mesActual, setMesActual] = useState(new Date());
  const [vista, setVista] = useState<'mes' | 'semana'>('mes');
  const [filtroTipo, setFiltroTipo] = useState<string>('');
  const [zoom, setZoom] = useState(1);

  const hoyRef = useRef(new Date());
  const hoy = hoyRef.current;

  // Calcular días del mes
  const diasMes = useMemo(() => {
    const year = mesActual.getFullYear();
    const month = mesActual.getMonth();
    const totalDias = diasDelMes(year, month);
    const primerDia = new Date(year, month, 1).getDay();
    
    const dias: { fecha: Date; esDelMes: boolean; esHoy: boolean }[] = [];
    
    // Días del mes anterior
    const diasMesAnterior = diasDelMes(year, month - 1);
    for (let i = primerDia - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(year, month - 1, diasMesAnterior - i),
        esDelMes: false,
        esHoy: false
      });
    }
    
    // Días del mes actual
    for (let i = 1; i <= totalDias; i++) {
      const fecha = new Date(year, month, i);
      dias.push({
        fecha,
        esDelMes: true,
        esHoy: esMismoDia(fecha, hoy)
      });
    }
    
    // Días del mes siguiente
    const diasRestantes = 42 - dias.length;
    for (let i = 1; i <= diasRestantes; i++) {
      dias.push({
        fecha: new Date(year, month + 1, i),
        esDelMes: false,
        esHoy: false
      });
    }
    
    return dias;
  }, [mesActual, hoy]);

  // Filtrar items
  const itemsFiltrados = useMemo(() => {
    let result = items;
    if (filtroTipo) {
      result = result.filter(i => i.tipo === filtroTipo);
    }
    return result;
  }, [items, filtroTipo]);

  // Items por día
  const itemsPorDia = useMemo(() => {
    const map = new Map<string, ItemCalendario[]>();
    
    itemsFiltrados.forEach(item => {
      const inicio = new Date(item.fechaInicio);
      const fin = new Date(item.fechaFin);
      
      const current = new Date(inicio);
      while (current <= fin) {
        const key = current.toISOString().split('T')[0];
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(item);
        current.setDate(current.getDate() + 1);
      }
    });
    
    return map;
  }, [itemsFiltrados]);

  const navegarMes = (delta: number) => {
    setMesActual(prev => new Date(prev.getFullYear(), prev.getMonth() + delta, 1));
  };

  return (
    <div className="rounded-2xl bg-white shadow-lg overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b bg-gradient-to-r from-slate-50 to-slate-100">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-emerald-500" />
            Calendario de Programación
          </h2>
          
          <div className="flex items-center gap-2 bg-white rounded-xl shadow-sm px-2">
            <button 
              onClick={() => navegarMes(-1)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>
            <span className="font-medium text-slate-700 min-w-[150px] text-center">
              {nombreMes(mesActual.getMonth())} {mesActual.getFullYear()}
            </span>
            <button 
              onClick={() => navegarMes(1)}
              className="p-2 hover:bg-slate-100 rounded-lg"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>
          
          <button 
            onClick={() => setMesActual(new Date())}
            className="px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100"
          >
            Hoy
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Filtro tipo */}
          <select 
            value={filtroTipo} 
            onChange={e => setFiltroTipo(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-200 text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="cuna">🎵 Cuñas</option>
            <option value="banner">🖼️ Banners</option>
            <option value="video">🎬 Videos</option>
          </select>
          
          {/* Vista */}
          <div className="flex bg-slate-100 rounded-lg p-1">
            <button 
              onClick={() => setVista('mes')}
              className={`px-3 py-1 text-sm rounded ${vista === 'mes' ? 'bg-white shadow' : ''}`}
            >
              Mes
            </button>
            <button 
              onClick={() => setVista('semana')}
              className={`px-3 py-1 text-sm rounded ${vista === 'semana' ? 'bg-white shadow' : ''}`}
            >
              Semana
            </button>
          </div>
          
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button onClick={() => setZoom(z => Math.max(0.5, z - 0.25))} className="p-1 hover:bg-white rounded">
              <ZoomOut className="w-4 h-4" />
            </button>
            <button onClick={() => setZoom(z => Math.min(2, z + 0.25))} className="p-1 hover:bg-white rounded">
              <ZoomIn className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Días de la semana */}
      <div className="grid grid-cols-7 border-b">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(dia => (
          <div key={dia} className="py-2 text-center text-sm font-medium text-slate-500 bg-slate-50">
            {dia}
          </div>
        ))}
      </div>

      {/* Grid de días */}
      <div 
        className="grid grid-cols-7"
        style={{ fontSize: `${zoom}rem` }}
      >
        {diasMes.map((dia, idx) => {
          const key = dia.fecha.toISOString().split('T')[0];
          const itemsDia = itemsPorDia.get(key) || [];
          const esFinDeSemana = dia.fecha.getDay() === 0 || dia.fecha.getDay() === 6;
          
          return (
            <div
              key={idx}
              className={`
                min-h-[100px] border-b border-r p-1 transition-colors
                ${!dia.esDelMes ? 'bg-slate-50 opacity-50' : ''}
                ${dia.esHoy ? 'bg-emerald-50 ring-2 ring-inset ring-emerald-400' : ''}
                ${esFinDeSemana && dia.esDelMes ? 'bg-slate-50/50' : ''}
              `}
            >
              {/* Número del día */}
              <div className={`text-right text-sm font-medium mb-1 ${
                dia.esHoy ? 'text-emerald-600' : 
                !dia.esDelMes ? 'text-slate-300' : 
                'text-slate-600'
              }`}>
                {dia.fecha.getDate()}
              </div>
              
              {/* Items del día */}
              <div className="space-y-0.5 overflow-hidden" style={{ maxHeight: `${3 * zoom}rem` }}>
                {itemsDia.slice(0, 3).map((item, i) => (
                  <button
                    key={`${item.id}-${i}`}
                    onClick={() => onItemClick?.(item.id)}
                    className={`
                      w-full text-left px-1.5 py-0.5 rounded text-[0.65rem] truncate
                      ${item.color} text-white shadow-sm hover:opacity-90 transition-opacity
                      flex items-center gap-1
                    `}
                    title={`${item.codigo} - ${item.nombre}`}
                  >
                    <TipoIcon tipo={item.tipo} />
                    <span className="truncate">{item.codigo}</span>
                  </button>
                ))}
                {itemsDia.length > 3 && (
                  <div className="text-[0.6rem] text-slate-400 text-center">
                    +{itemsDia.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="flex items-center justify-between p-3 border-t bg-slate-50">
        <div className="flex items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-blue-500"></span> Cuña
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-purple-500"></span> Banner
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-red-500"></span> Video
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-emerald-500"></span> Activo
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-amber-500"></span> Pendiente
          </span>
        </div>
        
        <div className="text-xs text-slate-400">
          {itemsFiltrados.length} activos programados
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// LISTA LATERAL DE ITEMS
// ═══════════════════════════════════════════════════════════════

export function ListaItemsCalendario({ 
  items, 
  onItemClick 
}: { 
  items: ItemCalendario[]; 
  onItemClick?: (id: string) => void;
}) {
  const itemsProximos = useMemo(() => {
    const hoy = new Date();
    return items
      .filter(i => new Date(i.fechaInicio) >= hoy)
      .sort((a, b) => new Date(a.fechaInicio).getTime() - new Date(b.fechaInicio).getTime())
      .slice(0, 10);
  }, [items]);

  const itemsPorVencer = useMemo(() => {
    const hoy = new Date();
    const enUnaSemana = new Date(hoy.getTime() + 7 * 24 * 60 * 60 * 1000);
    return items
      .filter(i => {
        const fin = new Date(i.fechaFin);
        return fin >= hoy && fin <= enUnaSemana;
      })
      .sort((a, b) => new Date(a.fechaFin).getTime() - new Date(b.fechaFin).getTime());
  }, [items]);

  return (
    <div className="space-y-6">
      {/* Próximos a iniciar */}
      <div className="rounded-xl bg-white shadow-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-blue-500" />
          Próximos a Iniciar
        </h3>
        <div className="space-y-2">
          {itemsProximos.slice(0, 5).map(item => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full text-left p-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-500">{item.codigo}</span>
                <span className="text-xs text-slate-400">
                  {new Date(item.fechaInicio).toLocaleDateString('es-CL')}
                </span>
              </div>
              <p className="text-sm text-slate-700 truncate">{item.nombre}</p>
            </button>
          ))}
          {itemsProximos.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4">No hay items próximos</p>
          )}
        </div>
      </div>

      {/* Por vencer */}
      <div className="rounded-xl bg-white shadow-lg p-4">
        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-amber-500" />
          Por Vencer (7 días)
        </h3>
        <div className="space-y-2">
          {itemsPorVencer.map(item => (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item.id)}
              className="w-full text-left p-2 rounded-lg hover:bg-amber-50 border border-amber-100 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-amber-600">{item.codigo}</span>
                <span className="text-xs text-amber-500 font-medium">
                  Vence: {new Date(item.fechaFin).toLocaleDateString('es-CL')}
                </span>
              </div>
              <p className="text-sm text-slate-700 truncate">{item.nombre}</p>
            </button>
          ))}
          {itemsPorVencer.length === 0 && (
            <p className="text-sm text-slate-400 text-center py-4 flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              Sin vencimientos próximos
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarioProgramacion;
