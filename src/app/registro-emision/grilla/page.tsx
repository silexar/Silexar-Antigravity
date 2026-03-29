"use client";

import React, { useEffect, useState } from 'react';
import { Clock, Radio, BarChart3, MoreHorizontal, Play, Pause, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

// Interfaces para tipado estricto
interface GridItem {
  id: string;
  titulo: string;
  cliente: string;
  duracion: number;
  estado: string;
  tipo: 'spot' | 'mencion' | 'bloque';
}

interface GridBlock {
  id: string;
  hora: string;
  nombre: string;
  estado: 'planificada' | 'en_revision' | 'aprobada' | 'exportada' | 'emitida' | 'verificada';
  ocupacion: number;
  items: GridItem[];
}

interface APIResponse {
  success: boolean;
  data: GridBlock[];
  error?: string;
}

export default function GrillaPage() {
  const [blocks, setBlocks] = useState<GridBlock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGridData();
  }, []);

  const fetchGridData = async () => {
    try {
      const response = await fetch('/api/registro-emision/grilla');
      const result: APIResponse = await response.json();
      
      if (result.success) {
        setBlocks(result.data);
      } else {
        toast.error("Error cargando grilla: " + result.error);
      }
    } catch (error) {
       // Safely handle unknown error type
       const msg = error instanceof Error ? error.message : "Error de conexión";
       toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'emitida': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'planificada': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'en_revision': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 h-screen bg-[#E0E5EC]">
         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E0E5EC] p-6 text-slate-700 font-sans">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Radio className="w-6 h-6 text-indigo-600" />
            Grilla Operativa
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Programación del Día • {new Date().toLocaleDateString()}
          </p>
        </div>

        <div className="flex gap-4">
            <button className="px-4 py-2 rounded-xl bg-[#E0E5EC] text-slate-600 font-medium
              shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff]
              hover:shadow-[inset_5px_5px_10px_#b8b9be,inset_-5px_-5px_10px_#ffffff]
              transition-all flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Historial
            </button>
            <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-medium
              shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff]
              hover:bg-indigo-700 transition-all flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Reportes
            </button>
        </div>
      </header>

      {/* Grid Timeline */}
      <div className="space-y-6 max-w-7xl mx-auto">
        {blocks.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            No hay programación cargada para hoy.
          </div>
        ) : (
          blocks.map((block) => (
            <div key={block.id} className="relative pl-20">
               {/* Time Marker */}
              <div className="absolute left-0 top-0 w-16 text-right pt-4">
                 <span className="text-xl font-bold text-slate-700 block">{block.hora}</span>
                 <span className="text-xs text-slate-400 uppercase font-medium">Bloque</span>
              </div>

               {/* Block Card */}
               <Card className="border-0 rounded-2xl bg-[#E0E5EC] p-6
                  shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)]">
                  
                  {/* Block Header */}
                  <div className="flex justify-between items-start mb-4 border-b border-slate-200/60 pb-4">
                    <div>
                       <h3 className="text-lg font-semibold text-slate-800">{block.nombre}</h3>
                       <div className="flex items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(block.estado)}`}>
                             {block.estado.replace('_', ' ').toUpperCase()}
                          </span>
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                             <Clock className="w-3 h-3" /> {block.items.length} elementos
                          </span>
                       </div>
                    </div>

                    <div className="flex items-center gap-4">
                       <div className="text-right">
                          <span className="text-xs text-slate-500 block mb-1">Ocupación</span>
                          <div className="w-32 h-2 bg-slate-200 rounded-full overflow-hidden">
                             <div 
                                className={`h-full rounded-full ${block.ocupacion > 100 ? 'bg-red-500' : 'bg-indigo-500'}`} 
                                style={{ width: `${Math.min(block.ocupacion, 100)}%` }}
                             ></div>
                          </div>
                       </div>
                       <button className="p-2 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                          <MoreHorizontal className="w-5 h-5" />
                       </button>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-3">
                     {block.items.length === 0 ? (
                        <div className="text-slate-400 text-sm italic py-2">Espacio disponible (Sin programación)</div>
                     ) : (
                        block.items.map((item) => (
                           <div key={item.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-white transition-colors border border-slate-100">
                              <div className="flex items-center gap-3">
                                 {item.estado === 'emitido' ? (
                                    <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                       <CheckCircle2 className="w-4 h-4" />
                                    </div>
                                 ) : item.estado === 'programado' ? (
                                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                                       <Play className="w-4 h-4 ml-0.5" />
                                    </div>
                                 ) : (
                                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                                       <Pause className="w-4 h-4" />
                                    </div>
                                 )}
                                 
                                 <div>
                                    <p className="font-medium text-slate-700 text-sm">{item.titulo}</p>
                                    <p className="text-xs text-slate-500">{item.cliente} • {item.tipo.toUpperCase()}</p>
                                 </div>
                              </div>

                              <div className="flex items-center gap-4">
                                 <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                    {item.duracion}s
                                 </span>
                                 {item.duracion > 60 && (
                                      <AlertCircle className="w-4 h-4 text-amber-500" />
                                 )}
                              </div>
                           </div>
                        ))
                     )}
                  </div>

               </Card>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
