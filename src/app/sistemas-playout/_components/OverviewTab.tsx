'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Server, RefreshCw, Eye, Filter, Calendar, TrendingUp, AlertTriangle,
  Upload, Download, Activity,
} from 'lucide-react';
import type { PlayoutSystem, SyncJob } from '../_types';
import { SYSTEM_TYPES, getSystemIcon, getStatusColor, getStatusIcon } from '../_utils';

interface OverviewTabProps {
  playoutSystems: PlayoutSystem[];
  syncJobs: SyncJob[];
  selectedSystem: string;
  isLoading: boolean;
  onSystemTest: (systemId: string) => void;
  onSyncStart: (systemId: string, type: 'import' | 'export') => void;
}

export function OverviewTab({
  playoutSystems, syncJobs, selectedSystem, isLoading, onSystemTest, onSyncStart,
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estado de Sistemas */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-400">
              <Server className="h-5 w-5" />
              Estado de Sistemas
            </CardTitle>
            <CardDescription>
              Monitoreo en tiempo real de todos los sistemas de playout conectados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {playoutSystems.map((system) => {
              const StatusIcon = getStatusIcon(system.status);
              const systemType = SYSTEM_TYPES.find(st => st.id === system.type);

              return (
                <div key={system.id} className="flex items-center justify-between p-3 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{getSystemIcon(system.type)}</div>
                    <div>
                      <h4 className="font-semibold">{system.name}</h4>
                      <p className="text-sm text-slate-400">
                        {systemType?.name} v{system.version}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${getStatusColor(system.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{system.status.toUpperCase()}</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Última sync: {new Date(system.lastSync).toLocaleTimeString()}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSystemTest(system.id)}
                      disabled={isLoading}
                      aria-label="Ver detalle"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Trabajos de Sincronización Activos */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-400">
              <RefreshCw className="h-5 w-5" />
              Sincronización Activa
            </CardTitle>
            <CardDescription>
              Trabajos de importación y exportación en curso
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {syncJobs.filter(job => job.status === 'running').length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <RefreshCw className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay trabajos de sincronización activos</p>
              </div>
            ) : (
              syncJobs
                .filter(job => job.status === 'running')
                .map((job) => {
                  const system = playoutSystems.find(s => s.id === job.systemId);
                  return (
                    <div key={job.id} className="space-y-3 p-4 border border-slate-700 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-xl">{getSystemIcon(system?.type ?? '')}</div>
                          <div>
                            <h4 className="font-semibold">{system?.name}</h4>
                            <p className="text-sm text-slate-400">
                              {job.type === 'import' ? 'Importando' : 'Exportando'} - {job.itemsProcessed}/{job.totalItems} elementos
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="border-purple-400 text-purple-400">
                          {job.progress.toFixed(0)}%
                        </Badge>
                      </div>
                      <Progress value={job.progress} className="h-2" />
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Iniciado: {new Date(job.startTime).toLocaleTimeString()}</span>
                        <span>ETA: ~{Math.ceil((100 - job.progress) / 10)} min</span>
                      </div>
                    </div>
                  );
                })
            )}

            <div className="pt-4 border-t border-slate-700">
              <h4 className="font-semibold mb-3">Acciones Rápidas</h4>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedSystem && onSyncStart(selectedSystem, 'export')}
                  disabled={!selectedSystem}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Exportar Pauta
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => selectedSystem && onSyncStart(selectedSystem, 'import')}
                  disabled={!selectedSystem}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Importar Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Performance */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Métricas de Performance
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Rango de Fechas
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {playoutSystems.map((system) => {
              const systemType = SYSTEM_TYPES.find(st => st.id === system.type);
              return (
                <div key={system.id} className="space-y-4 p-4 border border-slate-700 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="text-xl">{getSystemIcon(system.type)}</div>
                    <div>
                      <h4 className="font-semibold">{system.name}</h4>
                      <p className="text-sm text-slate-400">{systemType?.name}</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Uptime</span>
                      <span className="font-bold text-green-400">{system.metrics.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={system.metrics.uptime} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Latencia</span>
                      <span className="font-bold text-blue-400">{Math.round(system.metrics.latency)}ms</span>
                    </div>
                    <Progress value={Math.max(0, 100 - (system.metrics.latency / 5))} className="h-2" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm text-slate-400">Tasa de Éxito</span>
                      <span className="font-bold text-purple-400">{system.metrics.successRate.toFixed(1)}%</span>
                    </div>
                    <Progress value={system.metrics.successRate} className="h-2" />
                  </div>

                  {system.metrics.lastError && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-400 text-xs">
                        {system.metrics.lastError}
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
