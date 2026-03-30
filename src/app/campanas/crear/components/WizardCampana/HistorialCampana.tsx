/**
 * 📜 HistorialCampana - Timeline de Auditoría TIER0
 * 
 * Componente para visualizar el historial completo de cambios:
 * - Timeline cronológico
 * - Usuario responsable
 * - Tipo de acción
 * - Rollback con un click
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  History, User, ArrowLeft, Play,
  Edit, Plus, Trash2, RefreshCw, CheckCircle2, Eye
} from 'lucide-react';

// ==================== INTERFACES ====================

interface EventoHistorial {
  id: string;
  fecha: string;
  hora: string;
  tipo: 'creacion' | 'edicion' | 'estado' | 'programacion' | 'eliminacion' | 'aprobacion';
  descripcion: string;
  usuario: string;
  detalles?: {
    campo?: string;
    valorAnterior?: string;
    valorNuevo?: string;
  };
  reversible: boolean;
}

interface HistorialCampanaProps {
  campanaNro: string;
  eventos?: EventoHistorial[];
  onRollback?: (eventoId: string) => void;
}

// ==================== DATOS MOCK ====================

const MOCK_EVENTOS: EventoHistorial[] = [
  {
    id: 'evt_001',
    fecha: '2025-02-08',
    hora: '10:30',
    tipo: 'edicion',
    descripcion: 'Modificación de línea de programación',
    usuario: 'Ana García',
    detalles: {
      campo: 'Horario Línea 1',
      valorAnterior: '08:00 - 09:00',
      valorNuevo: '07:30 - 08:30'
    },
    reversible: true
  },
  {
    id: 'evt_002',
    fecha: '2025-02-08',
    hora: '09:15',
    tipo: 'aprobacion',
    descripcion: 'Campaña aprobada por supervisor',
    usuario: 'Carlos Mendoza',
    reversible: false
  },
  {
    id: 'evt_003',
    fecha: '2025-02-07',
    hora: '16:45',
    tipo: 'programacion',
    descripcion: 'Motor TIER0 ejecutado - 156 spots programados',
    usuario: 'Sistema Cortex',
    reversible: true
  },
  {
    id: 'evt_004',
    fecha: '2025-02-07',
    hora: '14:20',
    tipo: 'edicion',
    descripcion: 'Actualización de tarifas',
    usuario: 'Ana García',
    detalles: {
      campo: 'Valor Neto',
      valorAnterior: '$10,500,000',
      valorNuevo: '$12,500,000'
    },
    reversible: true
  },
  {
    id: 'evt_005',
    fecha: '2025-02-07',
    hora: '11:00',
    tipo: 'creacion',
    descripcion: 'Campaña creada desde contrato CON-2025-0001',
    usuario: 'Ana García',
    reversible: false
  }
];

// ==================== COMPONENTE ====================

export function HistorialCampana({
  campanaNro = 'CAM-2025-0015',
  eventos = MOCK_EVENTOS,
  onRollback
}: HistorialCampanaProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getIconoTipo = (tipo: string) => {
    switch (tipo) {
      case 'creacion': return <Plus className="w-4 h-4" />;
      case 'edicion': return <Edit className="w-4 h-4" />;
      case 'estado': return <Play className="w-4 h-4" />;
      case 'programacion': return <RefreshCw className="w-4 h-4" />;
      case 'eliminacion': return <Trash2 className="w-4 h-4" />;
      case 'aprobacion': return <CheckCircle2 className="w-4 h-4" />;
      default: return <History className="w-4 h-4" />;
    }
  };

  const getColorTipo = (tipo: string) => {
    switch (tipo) {
      case 'creacion': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'edicion': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'estado': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'programacion': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
      case 'eliminacion': return 'bg-red-100 text-red-700 border-red-200';
      case 'aprobacion': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const handleRollback = (eventoId: string) => {
    onRollback?.(eventoId);
  };

  // Agrupar eventos por fecha
  const eventosPorFecha = eventos.reduce((acc, evento) => {
    if (!acc[evento.fecha]) {
      acc[evento.fecha] = [];
    }
    acc[evento.fecha].push(evento);
    return acc;
  }, {} as Record<string, EventoHistorial[]>);

  return (
    <Card className="h-full">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="w-5 h-5 text-blue-600" />
            Historial de Cambios
          </CardTitle>
          <Badge variant="outline" className="text-gray-500">
            {campanaNro}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0 max-h-[500px] overflow-y-auto">
        {Object.entries(eventosPorFecha).map(([fecha, eventosDelDia]) => (
          <div key={fecha}>
            {/* Separador de fecha */}
            <div className="sticky top-0 bg-slate-50 px-4 py-2 border-b">
              <span className="text-xs font-medium text-gray-500">
                {new Date(fecha).toLocaleDateString('es-CL', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </span>
            </div>

            {/* Eventos del día */}
            <div className="relative">
              {/* Línea vertical */}
              <div className="absolute left-7 top-0 bottom-0 w-0.5 bg-gray-100" />

              {eventosDelDia.map((evento, idx) => (
                <div 
                  key={evento.id}
                  className={`
                    relative px-4 py-3 hover:bg-slate-50/50 transition-colors cursor-pointer
                    ${idx === eventosDelDia.length - 1 ? '' : 'border-b border-dashed'}
                  `}
                  onClick={() => setExpandedId(expandedId === evento.id ? null : evento.id)}
                >
                  <div className="flex items-start gap-3">
                    {/* Icono */}
                    <div className={`
                      relative z-10 w-8 h-8 rounded-full flex items-center justify-center
                      ${getColorTipo(evento.tipo)} border
                    `}>
                      {getIconoTipo(evento.tipo)}
                    </div>

                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-gray-900">
                          {evento.descripcion}
                        </p>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">
                          {evento.hora}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">{evento.usuario}</span>
                      </div>

                      {/* Detalles expandidos */}
                      {expandedId === evento.id && evento.detalles && (
                        <div className="mt-3 p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                          <p className="text-gray-500">
                            <strong>Campo:</strong> {evento.detalles.campo}
                          </p>
                          <p className="text-red-600">
                            <strong>Anterior:</strong> {evento.detalles.valorAnterior}
                          </p>
                          <p className="text-green-600">
                            <strong>Nuevo:</strong> {evento.detalles.valorNuevo}
                          </p>
                        </div>
                      )}

                      {/* Acciones */}
                      {expandedId === evento.id && evento.reversible && (
                        <div className="mt-2 flex items-center gap-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="h-7 text-xs gap-1"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRollback(evento.id);
                            }}
                          >
                            <ArrowLeft className="w-3 h-3" />
                            Revertir
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            className="h-7 text-xs gap-1"
                          >
                            <Eye className="w-3 h-3" />
                            Ver Detalle
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

export default HistorialCampana;
