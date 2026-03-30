/**
 * 🎵 MaterialesCampana - Gestor de Cuñas TIER0
 * 
 * Componente para gestionar materiales publicitarios:
 * - Asignación de cuñas a líneas
 * - Validación de duraciones
 * - Preview de audio (mock)
 * - Estado de aprobación
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Music, Play, Pause, Upload, Link2, CheckCircle2, 
  AlertTriangle, Clock, Search, Plus, X
} from 'lucide-react';

// ==================== INTERFACES ====================

interface MaterialPublicitario {
  id: string;
  nombre: string;
  codigo: string;
  duracion: number; // segundos
  formato: 'mp3' | 'wav' | 'aac';
  estado: 'aprobado' | 'pendiente' | 'rechazado';
  fechaSubida: string;
  asignadoA: string[]; // IDs de líneas
}

interface MaterialesCampanaProps {
  materiales?: MaterialPublicitario[];
  lineasDisponibles?: { id: string; nombre: string; duracionRequerida: number }[];
  onAsignar?: (materialId: string, lineaId: string) => void;
  onDesasignar?: (materialId: string, lineaId: string) => void;
}

// ==================== DATOS MOCK ====================

const MOCK_MATERIALES: MaterialPublicitario[] = [
  {
    id: 'mat_001',
    nombre: 'BANCO CHILE - Verano 2025 - V1',
    codigo: 'BCH-VER25-001',
    duracion: 30,
    formato: 'mp3',
    estado: 'aprobado',
    fechaSubida: '2025-02-05',
    asignadoA: ['lin_1', 'lin_2']
  },
  {
    id: 'mat_002',
    nombre: 'BANCO CHILE - Verano 2025 - V2 (corta)',
    codigo: 'BCH-VER25-002',
    duracion: 15,
    formato: 'mp3',
    estado: 'aprobado',
    fechaSubida: '2025-02-06',
    asignadoA: []
  },
  {
    id: 'mat_003',
    nombre: 'BANCO CHILE - Jingle Institucional',
    codigo: 'BCH-INST-001',
    duracion: 45,
    formato: 'wav',
    estado: 'pendiente',
    fechaSubida: '2025-02-07',
    asignadoA: []
  }
];

const MOCK_LINEAS = [
  { id: 'lin_1', nombre: 'Línea Prime Matinal', duracionRequerida: 30 },
  { id: 'lin_2', nombre: 'Línea Mañana', duracionRequerida: 30 },
  { id: 'lin_3', nombre: 'Línea Prime Tarde', duracionRequerida: 45 }
];

// ==================== COMPONENTE ====================

export function MaterialesCampana({
  materiales = MOCK_MATERIALES,
  lineasDisponibles = MOCK_LINEAS,
  onAsignar,
  onDesasignar
}: MaterialesCampanaProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'aprobado': return 'bg-emerald-100 text-emerald-700';
      case 'pendiente': return 'bg-amber-100 text-amber-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'aprobado': return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'pendiente': return <Clock className="w-4 h-4 text-amber-600" />;
      case 'rechazado': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return null;
    }
  };

  const handlePlay = (materialId: string) => {
    if (playingId === materialId) {
      setPlayingId(null);
    } else {
      setPlayingId(materialId);
      // Simular reproducción
      setTimeout(() => setPlayingId(null), 3000);
    }
  };

  const filteredMateriales = materiales.filter(m => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Music className="w-5 h-5 text-purple-600" />
            Materiales Publicitarios
          </CardTitle>
          <Button size="sm" className="gap-1 bg-purple-600 hover:bg-purple-700">
            <Upload className="w-4 h-4" />
            Subir
          </Button>
        </div>
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar material..."
            className="pl-9"
          />
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-y-auto p-0">
        <div className="divide-y">
          {filteredMateriales.map(material => (
            <div 
              key={material.id}
              className={`p-4 transition-colors ${expandedId === material.id ? 'bg-purple-50/30' : 'hover:bg-slate-50/50'}`}
            >
              <div className="flex items-start gap-3">
                {/* Play Button */}
                <button
                  onClick={() => handlePlay(material.id)}
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all
                    ${playingId === material.id 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                    }
                  `}
                >
                  {playingId === material.id ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-1" />
                  )}
                </button>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900 truncate">{material.nombre}</h4>
                    {getEstadoIcon(material.estado)}
                  </div>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs font-mono">
                      {material.codigo}
                    </Badge>
                    <Badge className={`text-xs ${getEstadoColor(material.estado)}`}>
                      {material.estado}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {material.duracion}s • {material.formato.toUpperCase()}
                    </span>
                  </div>

                  {/* Asignaciones */}
                  {material.asignadoA.length > 0 && (
                    <div className="flex items-center gap-1 mt-2 flex-wrap">
                      <Link2 className="w-3 h-3 text-gray-400" />
                      {material.asignadoA.map(lineaId => {
                        const linea = lineasDisponibles.find(l => l.id === lineaId);
                        return linea ? (
                          <Badge 
                            key={lineaId} 
                            variant="secondary" 
                            className="text-xs gap-1"
                          >
                            {linea.nombre}
                            <button 
                              onClick={() => onDesasignar?.(material.id, lineaId)}
                              className="ml-1 hover:text-red-500"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}

                  {/* Expandir para asignar */}
                  {expandedId === material.id && (
                    <div className="mt-3 p-3 bg-white rounded-lg border">
                      <p className="text-xs text-gray-500 mb-2">Asignar a línea:</p>
                      <div className="flex flex-wrap gap-2">
                        {lineasDisponibles
                          .filter(l => !material.asignadoA.includes(l.id))
                          .map(linea => {
                            const compatible = linea.duracionRequerida === material.duracion;
                            return (
                              <Button
                                key={linea.id}
                                size="sm"
                                variant={compatible ? 'outline' : 'ghost'}
                                disabled={!compatible}
                                onClick={() => onAsignar?.(material.id, linea.id)}
                                className={`text-xs gap-1 ${compatible ? '' : 'opacity-50'}`}
                              >
                                <Plus className="w-3 h-3" />
                                {linea.nombre}
                                {!compatible && (
                                  <span className="text-red-500">({linea.duracionRequerida}s)</span>
                                )}
                              </Button>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>

                {/* Toggle Expand */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpandedId(expandedId === material.id ? null : material.id)}
                  className="shrink-0"
                >
                  <Link2 className="w-4 h-4" />
                </Button>
              </div>

              {/* Barra de reproducción mock */}
              {playingId === material.id && (
                <div className="mt-3 ml-15 pl-15">
                  <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-purple-600 rounded-full animate-pulse"
                      style={{ width: '60%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredMateriales.length === 0 && (
          <div className="p-8 text-center text-gray-400">
            <Music className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No se encontraron materiales</p>
          </div>
        )}
      </CardContent>

      {/* Footer Stats */}
      <div className="border-t p-4 shrink-0 bg-slate-50">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{materiales.length} materiales</span>
          <span>{materiales.filter(m => m.estado === 'aprobado').length} aprobados</span>
          <span>{materiales.reduce((acc, m) => acc + m.asignadoA.length, 0)} asignaciones</span>
        </div>
      </div>
    </Card>
  );
}

export default MaterialesCampana;
