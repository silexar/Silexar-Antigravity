/**
 * 🚫 Gestión de Cuñas Rechazadas - TIER0 Enterprise 2050
 * 
 * Interfaz para gestionar spots que no pudieron ser programados:
 * - Lista detallada con motivos de rechazo
 * - Motor de reubicación inteligente
 * - Planificación forzada con justificación
 * - Historial de intentos
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
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, RefreshCw, MapPin, Clock,
  CheckCircle2, XCircle, Zap, ArrowRight, Filter,
  Download, Mail, Brain
} from 'lucide-react';

// ==================== INTERFACES ====================

interface CunaRechazada {
  id: string;
  campana: {
    numero: string;
    nombre: string;
    anunciante: string;
  };
  linea: {
    programa: string;
    horaOriginal: string;
    duracion: number;
  };
  motivoRechazo: 'saturacion' | 'conflicto_competencia' | 'exclusividad' | 'horario_protegido' | 'material_no_disponible';
  fechaRechazo: string;
  intentosReubicacion: number;
  prioridad: 'critica' | 'alta' | 'media' | 'baja';
  sugerenciasIA: {
    bloqueAlternativo: string;
    horaAlternativa: string;
    probabilidadExito: number;
  }[];
  estado: 'pendiente' | 'reubicada' | 'forzada' | 'cancelada';
}

// ==================== DATOS MOCK ====================

const MOCK_RECHAZADAS: CunaRechazada[] = [
  {
    id: 'rech_001',
    campana: {
      numero: 'CAM-2025-0015',
      nombre: 'Campaña Verano Premium',
      anunciante: 'BANCO DE CHILE'
    },
    linea: {
      programa: 'PRIME MATINAL',
      horaOriginal: '08:15',
      duracion: 30
    },
    motivoRechazo: 'saturacion',
    fechaRechazo: '2025-02-08',
    intentosReubicacion: 2,
    prioridad: 'alta',
    sugerenciasIA: [
      { bloqueAlternativo: 'MAÑANA', horaAlternativa: '10:30', probabilidadExito: 92 },
      { bloqueAlternativo: 'PRIME TARDE', horaAlternativa: '18:45', probabilidadExito: 85 }
    ],
    estado: 'pendiente'
  },
  {
    id: 'rech_002',
    campana: {
      numero: 'CAM-2025-0012',
      nombre: 'Lanzamiento App Q1',
      anunciante: 'ENTEL'
    },
    linea: {
      programa: 'PRIME TARDE',
      horaOriginal: '19:00',
      duracion: 45
    },
    motivoRechazo: 'conflicto_competencia',
    fechaRechazo: '2025-02-07',
    intentosReubicacion: 1,
    prioridad: 'critica',
    sugerenciasIA: [
      { bloqueAlternativo: 'TRASNOCHE', horaAlternativa: '23:30', probabilidadExito: 78 }
    ],
    estado: 'pendiente'
  },
  {
    id: 'rech_003',
    campana: {
      numero: 'CAM-2025-0018',
      nombre: 'Promoción Puntos CMR',
      anunciante: 'FALABELLA'
    },
    linea: {
      programa: 'PRIME MATINAL',
      horaOriginal: '07:45',
      duracion: 30
    },
    motivoRechazo: 'exclusividad',
    fechaRechazo: '2025-02-06',
    intentosReubicacion: 3,
    prioridad: 'media',
    sugerenciasIA: [
      { bloqueAlternativo: 'MAÑANA', horaAlternativa: '11:15', probabilidadExito: 95 },
      { bloqueAlternativo: 'TARDE', horaAlternativa: '15:00', probabilidadExito: 88 }
    ],
    estado: 'pendiente'
  }
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function CunasRechazadasPage() {
  const [rechazadas, setRechazadas] = useState<CunaRechazada[]>(MOCK_RECHAZADAS);
  const [filtroMotivo, setFiltroMotivo] = useState<string>('todos');
  const [filtroPrioridad, setFiltroPrioridad] = useState<string>('todas');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCuna, setSelectedCuna] = useState<CunaRechazada | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [justificacionForzado, setJustificacionForzado] = useState('');

  const getMotivoLabel = (motivo: string) => {
    const labels: Record<string, string> = {
      'saturacion': 'Saturación de Bloque',
      'conflicto_competencia': 'Conflicto Competencia',
      'exclusividad': 'Exclusividad Vigente',
      'horario_protegido': 'Horario Protegido',
      'material_no_disponible': 'Material No Disponible'
    };
    return labels[motivo] || motivo;
  };

  const getMotivoColor = (motivo: string) => {
    const colors: Record<string, string> = {
      'saturacion': 'bg-amber-100 text-amber-800 border-amber-200',
      'conflicto_competencia': 'bg-red-100 text-red-800 border-red-200',
      'exclusividad': 'bg-purple-100 text-purple-800 border-purple-200',
      'horario_protegido': 'bg-blue-100 text-blue-800 border-blue-200',
      'material_no_disponible': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[motivo] || 'bg-gray-100';
  };

  const getPrioridadColor = (prioridad: string) => {
    const colors: Record<string, string> = {
      'critica': 'bg-red-500 text-white',
      'alta': 'bg-orange-500 text-white',
      'media': 'bg-yellow-500 text-black',
      'baja': 'bg-green-500 text-white'
    };
    return colors[prioridad] || 'bg-gray-500';
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReubicar = (cunaId: string, _sugerenciaIdx: number) => {
    setRechazadas(prev => prev.map(c => 
      c.id === cunaId ? { ...c, estado: 'reubicada' as const } : c
    ));
  };

  const handleForzar = () => {
    if (!selectedCuna || !justificacionForzado) return;
    
    setRechazadas(prev => prev.map(c => 
      c.id === selectedCuna.id ? { ...c, estado: 'forzada' as const } : c
    ));
    setDialogOpen(false);
    setJustificacionForzado('');
    setSelectedCuna(null);
  };

  const handleCancelar = (cunaId: string) => {
    setRechazadas(prev => prev.map(c => 
      c.id === cunaId ? { ...c, estado: 'cancelada' as const } : c
    ));
  };

  const filteredRechazadas = rechazadas.filter(c => {
    const matchMotivo = filtroMotivo === 'todos' || c.motivoRechazo === filtroMotivo;
    const matchPrioridad = filtroPrioridad === 'todas' || c.prioridad === filtroPrioridad;
    const matchSearch = 
      c.campana.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.campana.anunciante.toLowerCase().includes(searchTerm.toLowerCase());
    return matchMotivo && matchPrioridad && matchSearch && c.estado === 'pendiente';
  });

  const stats = {
    total: rechazadas.filter(c => c.estado === 'pendiente').length,
    criticas: rechazadas.filter(c => c.prioridad === 'critica' && c.estado === 'pendiente').length,
    reubicadas: rechazadas.filter(c => c.estado === 'reubicada').length,
    forzadas: rechazadas.filter(c => c.estado === 'forzada').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-red-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-xl">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
              Gestión de Cuñas Rechazadas
            </h1>
            <p className="text-gray-600 mt-1">
              Centro de control para spots no programables con motor de reubicación IA
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-purple-600 border-purple-300 px-3 py-1">
              <Brain className="w-4 h-4 mr-1" />
              Cortex-Rescheduler Active
            </Badge>
            <Button variant="outline" className="gap-2">
              <Download className="w-4 h-4" />
              Exportar
            </Button>
            <Button variant="outline" className="gap-2">
              <Mail className="w-4 h-4" />
              Notificar Ejecutivos
            </Button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-4 gap-4">
          <Card className="border-l-4 border-l-red-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Pendientes</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <XCircle className="w-10 h-10 text-red-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-orange-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Críticas</p>
                  <p className="text-3xl font-bold text-orange-600">{stats.criticas}</p>
                </div>
                <AlertTriangle className="w-10 h-10 text-orange-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-green-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Reubicadas Hoy</p>
                  <p className="text-3xl font-bold text-green-600">{stats.reubicadas}</p>
                </div>
                <RefreshCw className="w-10 h-10 text-green-200" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Forzadas</p>
                  <p className="text-3xl font-bold text-purple-600">{stats.forzadas}</p>
                </div>
                <Zap className="w-10 h-10 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y Tabla */}
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-gray-400" />
                Cola de Reubicación
              </CardTitle>
              <div className="flex items-center gap-3">
                <Input 
                  placeholder="Buscar campaña o anunciante..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select value={filtroMotivo} onValueChange={setFiltroMotivo}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los motivos</SelectItem>
                    <SelectItem value="saturacion">Saturación</SelectItem>
                    <SelectItem value="conflicto_competencia">Conflicto Competencia</SelectItem>
                    <SelectItem value="exclusividad">Exclusividad</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={filtroPrioridad} onValueChange={setFiltroPrioridad}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todas">Todas</SelectItem>
                    <SelectItem value="critica">Crítica</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="media">Media</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead>Campaña</TableHead>
                  <TableHead>Bloque Original</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Sugerencias IA</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRechazadas.map((cuna) => (
                  <TableRow key={cuna.id} className="hover:bg-slate-50/50">
                    <TableCell>
                      <Badge className={`${getPrioridadColor(cuna.prioridad)} text-xs`}>
                        {cuna.prioridad.charAt(0).toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-gray-900">{cuna.campana.numero}</p>
                        <p className="text-sm text-gray-500">{cuna.campana.anunciante}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="font-medium">{cuna.linea.programa}</p>
                          <p className="text-xs text-gray-500">{cuna.linea.horaOriginal} ({cuna.linea.duracion}s)</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getMotivoColor(cuna.motivoRechazo)}>
                        {getMotivoLabel(cuna.motivoRechazo)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {cuna.sugerenciasIA.slice(0, 2).map((sug, idx) => (
                          <button
                            key={idx}
                            onClick={() => handleReubicar(cuna.id, idx)}
                            className="flex items-center gap-2 w-full p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors text-left"
                          >
                            <MapPin className="w-4 h-4 text-emerald-600" />
                            <span className="text-sm text-emerald-800">
                              {sug.bloqueAlternativo} {sug.horaAlternativa}
                            </span>
                            <Badge className="ml-auto bg-emerald-600 text-white text-xs">
                              {sug.probabilidadExito}%
                            </Badge>
                          </button>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Dialog open={dialogOpen && selectedCuna?.id === cuna.id} onOpenChange={(open) => {
                          setDialogOpen(open);
                          if (!open) setSelectedCuna(null);
                        }}>
                          <DialogTrigger asChild>
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="text-purple-600 border-purple-200 hover:bg-purple-50"
                              onClick={() => setSelectedCuna(cuna)}
                            >
                              <Zap className="w-4 h-4 mr-1" />
                              Forzar
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-white">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 text-purple-700">
                                <Zap className="w-5 h-5" />
                                Planificación Forzada
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                                <p className="text-amber-800 text-sm">
                                  <strong>Advertencia:</strong> Esta acción ignorará las reglas de negocio estándar.
                                  Se requiere justificación para auditoría.
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium text-gray-700">Justificación *</label>
                                <Textarea 
                                  value={justificacionForzado}
                                  onChange={(e) => setJustificacionForzado(e.target.value)}
                                  placeholder="Explique el motivo del override..."
                                  className="mt-1"
                                  rows={3}
                                />
                              </div>
                              <Button 
                                onClick={handleForzar}
                                disabled={!justificacionForzado}
                                className="w-full bg-purple-600 hover:bg-purple-700"
                              >
                                Confirmar Planificación Forzada
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="text-gray-400 hover:text-red-500"
                          onClick={() => handleCancelar(cuna.id)}
                        >
                          <XCircle className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {filteredRechazadas.length === 0 && (
              <div className="p-12 text-center">
                <CheckCircle2 className="w-16 h-16 text-emerald-300 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-700">¡Todo en orden!</h3>
                <p className="text-gray-500">No hay cuñas pendientes de reubicación</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mapa de Reubicación IA */}
        <Card>
          <CardHeader className="border-b bg-gradient-to-r from-emerald-50 to-blue-50">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-emerald-600" />
                🗺️ MAPA DE REUBICACIÓN INTELIGENTE
              </CardTitle>
              <div className="flex gap-2">
                <Button size="sm" className="gap-1 bg-emerald-600 hover:bg-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  ✅ APLICAR REUBICACIÓN
                </Button>
                <Button size="sm" variant="outline" className="gap-1">
                  <RefreshCw className="w-4 h-4" />
                  🔄 Reset
                </Button>
                <Button size="sm" variant="ghost" className="gap-1 text-red-600">
                  <XCircle className="w-4 h-4" />
                  ❌ Mantener Rechazadas
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-6">
              {/* Columna Izquierda: Bloques Disponibles */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">BLOQUES DISPONIBLES:</h4>
                <div className="space-y-2">
                  <div className="p-4 rounded-lg border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-100 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-emerald-600" />
                        <span className="font-mono font-bold">⏰ 08:26:00 - Prime</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📊 267s/300s (33s libres)
                    </div>
                    <Badge className="mt-2 bg-emerald-100 text-emerald-700">
                      🟢 Disponible para 1 spot
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50/50 hover:bg-blue-100 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <span className="font-mono font-bold">⏰ 09:26:00 - Auspicio</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📊 180s/300s (120s libres)
                    </div>
                    <Badge className="mt-2 bg-blue-100 text-blue-700">
                      🟢 Disponible para 4 spots
                    </Badge>
                  </div>

                  <div className="p-4 rounded-lg border-2 border-dashed border-purple-300 bg-purple-50/50 hover:bg-purple-100 transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-purple-600" />
                        <span className="font-mono font-bold">⏰ 10:26:00 - Repartido</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-purple-400" />
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📊 150s/300s (150s libres)
                    </div>
                    <Badge className="mt-2 bg-purple-100 text-purple-700">
                      🟢 Disponible para 5 spots
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Columna Derecha: Cuñas a Reubicar */}
              <div>
                <h4 className="font-bold text-gray-700 mb-3">CUÑAS A REUBICAR:</h4>
                <div className="space-y-2">
                  {filteredRechazadas.slice(0, 3).map((cuna) => (
                    <div 
                      key={cuna.id}
                      className="p-3 rounded-lg border bg-white shadow-sm hover:shadow-md transition-all cursor-grab active:cursor-grabbing"
                      draggable
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-mono text-sm text-gray-600">{cuna.campana.numero}</span>
                          <span className="mx-2 text-gray-400">•</span>
                          <span className="text-sm font-medium">{cuna.linea.duracion}s</span>
                        </div>
                        <Badge className={getPrioridadColor(cuna.prioridad)}>
                          {cuna.prioridad}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{cuna.campana.anunciante}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-gray-500 text-center">
                  [Drag & Drop para asignar cuñas a bloques]
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Acciones Masivas */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-gray-900">🎯 ACCIONES DISPONIBLES</h4>
              <p className="text-sm text-gray-500">Opciones de procesamiento masivo</p>
            </div>
            <div className="flex gap-3">
              <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                <RefreshCw className="w-4 h-4" />
                🔄 PLANIFICAR FORZADO
                <span className="text-xs opacity-70">Todas sin validar</span>
              </Button>
              <Button variant="outline" className="gap-2 text-purple-600 border-purple-200">
                <Brain className="w-4 h-4" />
                🎯 REUBICAR INTELIGENTE
                <span className="text-xs opacity-70">IA busca alternativas</span>
              </Button>
              <Button variant="outline" className="gap-2">
                <Filter className="w-4 h-4" />
                📊 ANÁLISIS CONFLICTOS
              </Button>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>🚫 Gestión de Cuñas Rechazadas TIER0 - Powered by Cortex-Rescheduler</p>
          <p>Motor de Reubicación Inteligente • Auditoría Completa • Override Controlado</p>
        </div>
      </div>
    </div>
  );
}
