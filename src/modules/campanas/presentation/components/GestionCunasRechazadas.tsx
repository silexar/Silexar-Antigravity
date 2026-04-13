/**
 * SILEXAR PULSE QUANTUM - TIER0 ENTERPRISE SYSTEM
 * Componente Gestión Cuñas Rechazadas
 * 
 * Centro de comando inteligente para spots no programables
 * Sistema drag & drop con IA de reubicación automática
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  RefreshCw, 
  MapPin, 
  Zap,
  CheckCircle,
  XCircle,
  ArrowRight,
  Brain,
  Target
} from 'lucide-react';

interface CunaRechazada {
  id: string;
  nombre: string;
  duracion: number;
  prioridad: 'alta' | 'media' | 'baja';
  razonRechazo: string;
  sugerenciasIA: string[];
  horariosDisponibles: string[];
  estado: 'pendiente' | 'procesando' | 'reubicada' | 'cancelada';
}

interface GestionCunasRechazadasProps {
  campanId?: string;
  onCunaReubicada?: (cunaId: string, nuevaUbicacion: Record<string, unknown>) => void;
  onResolucionCompleta?: () => void;
}

export const GestionCunasRechazadas: React.FC<GestionCunasRechazadasProps> = ({
  campanId,
  onCunaReubicada,
  onResolucionCompleta}) => {

  const [cunasRechazadas, setCunasRechazadas] = useState<CunaRechazada[]>([]);
  const [loading, setLoading] = useState(false);
  const [tabActiva, setTabActiva] = useState('pendientes');
  const [procesamientoIA, setProcesamientoIA] = useState(false);
  const [estadisticas, setEstadisticas] = useState({
    total: 0,
    pendientes: 0,
    reubicadas: 0,
    canceladas: 0,
    eficienciaIA: 85
  });

  // Cargar cuñas rechazadas
  const cargarCunasRechazadas = useCallback(async () => {
    if (!campanId) return;
    
    setLoading(true);
    try {
      // Simulación de datos - en producción vendría del servicio
      const mockData: CunaRechazada[] = [
        {
          id: '1',
          nombre: 'Spot Promocional Q1',
          duracion: 30,
          prioridad: 'alta',
          razonRechazo: 'Conflicto de horario con programación especial',
          sugerenciasIA: [
            'Reubicar en bloque 14:30-15:00',
            'Dividir en 2 spots de 15s',
            'Mover a horario prime alternativo'
          ],
          horariosDisponibles: ['14:30', '16:45', '20:15'],
          estado: 'pendiente'
        },
        {
          id: '2',
          nombre: 'Campaña Institucional',
          duracion: 60,
          prioridad: 'media',
          razonRechazo: 'Duración excede límite de bloque',
          sugerenciasIA: [
            'Reducir a 45 segundos',
            'Programar en bloque extendido',
            'Dividir en múltiples emisiones'
          ],
          horariosDisponibles: ['13:00', '17:30', '21:45'],
          estado: 'procesando'
        }
      ];
      
      setCunasRechazadas(mockData);
      setEstadisticas({
        total: mockData.length,
        pendientes: mockData.filter(c => c.estado === 'pendiente').length,
        reubicadas: mockData.filter(c => c.estado === 'reubicada').length,
        canceladas: mockData.filter(c => c.estado === 'cancelada').length,
        eficienciaIA: 85
      });
    } catch (error) {
      /* */;
    } finally {
      setLoading(false);
    }
  }, [campanId]);

  // Procesar con IA
  const procesarConIA = useCallback(async (cunaId: string) => {
    setProcesamientoIA(true);
    try {
      // Simulación de procesamiento IA
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setCunasRechazadas(prev => 
        prev.map(cuna => 
          cuna.id === cunaId 
            ? { ...cuna, estado: 'reubicada' as const }
            : cuna
        )
      );
      
      onCunaReubicada?.(cunaId, { horario: '14:30', bloque: 'A1' });
    } catch (error) {
      /* */;
    } finally {
      setProcesamientoIA(false);
    }
  }, [onCunaReubicada]);

  // Reubicar manualmente
  const reubicarManualmente = useCallback((cunaId: string, horario: string) => {
    setCunasRechazadas(prev => 
      prev.map(cuna => 
        cuna.id === cunaId 
          ? { ...cuna, estado: 'reubicada' as const }
          : cuna
      )
    );
    
    onCunaReubicada?.(cunaId, { horario, manual: true });
  }, [onCunaReubicada]);

  useEffect(() => {
    cargarCunasRechazadas();
  }, [cargarCunasRechazadas]);

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'alta': return 'bg-red-500';
      case 'media': return 'bg-yellow-500';
      case 'baja': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-4 w-4" />;
      case 'procesando': return <RefreshCw className="h-4 w-4 animate-spin" />;
      case 'reubicada': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'cancelada': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Rechazadas</p>
                <p className="text-2xl font-bold">{estadisticas.total}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pendientes</p>
                <p className="text-2xl font-bold text-orange-600">{estadisticas.pendientes}</p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Reubicadas</p>
                <p className="text-2xl font-bold text-green-600">{estadisticas.reubicadas}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Eficiencia IA</p>
                <p className="text-2xl font-bold text-blue-600">{estadisticas.eficienciaIA}%</p>
              </div>
              <Brain className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de gestión */}
      <Tabs value={tabActiva} onValueChange={setTabActiva}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pendientes">Pendientes</TabsTrigger>
          <TabsTrigger value="procesando">En Proceso</TabsTrigger>
          <TabsTrigger value="resueltas">Resueltas</TabsTrigger>
        </TabsList>

        <TabsContent value="pendientes" className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <RefreshCw className="h-8 w-8 animate-spin" />
              <span className="ml-2">Cargando cuñas rechazadas...</span>
            </div>
          ) : (
            <div className="space-y-4">
              {cunasRechazadas
                .filter(cuna => cuna.estado === 'pendiente')
                .map(cuna => (
                  <Card key={cuna.id} className="border-l-4 border-l-orange-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{cuna.nombre}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getPrioridadColor(cuna.prioridad)} text-white`}>
                            {cuna.prioridad.toUpperCase()}
                          </Badge>
                          {getEstadoIcon(cuna.estado)}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Alert>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <strong>Razón del rechazo:</strong> {cuna.razonRechazo}
                        </AlertDescription>
                      </Alert>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <Brain className="h-4 w-4 mr-2" />
                          Sugerencias de IA
                        </h4>
                        <div className="space-y-2">
                          {cuna.sugerenciasIA.map((sugerencia, index) => (
                            <div key={`${sugerencia}-${index}`} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                              <span className="text-sm">{sugerencia}</span>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => procesarConIA(cuna.id)}
                                disabled={procesamientoIA}
                              >
                                <Zap className="h-3 w-3 mr-1" />
                                Aplicar
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-2 flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          Horarios Disponibles
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {cuna.horariosDisponibles.map(horario => (
                            <Button
                              key={horario}
                              size="sm"
                              variant="outline"
                              onClick={() => reubicarManualmente(cuna.id, horario)}
                              className="text-xs"
                            >
                              {horario}
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t">
                        <span className="text-sm text-muted-foreground">
                          Duración: {cuna.duracion}s
                        </span>
                        <div className="space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => procesarConIA(cuna.id)}
                            disabled={procesamientoIA}
                          >
                            <Brain className="h-4 w-4 mr-2" />
                            Procesar con IA
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => {
                              setCunasRechazadas(prev => 
                                prev.map(c => 
                                  c.id === cuna.id 
                                    ? { ...c, estado: 'cancelada' as const }
                                    : c
                                )
                              );
                            }}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="procesando" className="space-y-4">
          <div className="space-y-4">
            {cunasRechazadas
              .filter(cuna => cuna.estado === 'procesando')
              .map(cuna => (
                <Card key={cuna.id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{cuna.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          IA analizando opciones de reubicación...
                        </p>
                      </div>
                      <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
                    </div>
                    <Progress value={65} className="mt-2" />
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="resueltas" className="space-y-4">
          <div className="space-y-4">
            {cunasRechazadas
              .filter(cuna => cuna.estado === 'reubicada' || cuna.estado === 'cancelada')
              .map(cuna => (
                <Card key={cuna.id} className={`border-l-4 ${
                  cuna.estado === 'reubicada' ? 'border-l-green-500' : 'border-l-red-500'
                }`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{cuna.nombre}</h3>
                        <p className="text-sm text-muted-foreground">
                          {cuna.estado === 'reubicada' ? 'Reubicada exitosamente' : 'Cancelada'}
                        </p>
                      </div>
                      {getEstadoIcon(cuna.estado)}
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Panel de acciones rápidas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Target className="h-5 w-5 mr-2" />
            Acciones Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => procesarConIA('all')}
              disabled={procesamientoIA}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Brain className="h-4 w-4 mr-2" />
              Procesar Todo con IA
            </Button>
            <Button
              variant="outline"
              onClick={cargarCunasRechazadas}
              disabled={loading}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const resueltas = cunasRechazadas.filter(c => 
                  c.estado === 'reubicada' || c.estado === 'cancelada'
                ).length;
                if (resueltas === cunasRechazadas.length) {
                  onResolucionCompleta?.();
                }
              }}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Finalizar Gestión
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};