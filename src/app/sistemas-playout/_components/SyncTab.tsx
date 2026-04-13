'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Filter, Download, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import type { PlayoutSystem, SyncJob } from '../_types';
import { getSystemIcon } from '../_utils';

interface SyncTabProps {
  syncJobs: SyncJob[];
  playoutSystems: PlayoutSystem[];
}

export function SyncTab({ syncJobs, playoutSystems }: SyncTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-400">
            <RefreshCw className="h-5 w-5" />
            Historial de Sincronización
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Exportar Log
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {syncJobs.map((job) => {
              const system = playoutSystems.find(s => s.id === job.systemId);
              const duration = job.endTime
                ? Math.round((new Date(job.endTime).getTime() - new Date(job.startTime).getTime()) / 1000)
                : null;

              return (
                <div key={job.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="text-xl">{getSystemIcon(system?.type ?? '')}</div>
                      <div>
                        <h4 className="font-semibold">{system?.name}</h4>
                        <p className="text-sm text-slate-400">
                          {job.type === 'import' ? 'Importación' : 'Exportación'} - {new Date(job.startTime).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={job.status === 'completed' ? 'default' : 'secondary'}
                      className={
                        job.status === 'completed' ? 'bg-green-600' :
                        job.status === 'running' ? 'bg-blue-600' :
                        job.status === 'failed' ? 'bg-red-600' : 'bg-slate-600'
                      }
                    >
                      {job.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                      {job.status === 'running' && <RefreshCw className="h-3 w-3 mr-1 animate-spin" />}
                      {job.status === 'failed' && <XCircle className="h-3 w-3 mr-1" />}
                      {job.status.toUpperCase()}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">{job.progress.toFixed(0)}%</div>
                      <div className="text-xs text-slate-400">Progreso</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{job.itemsProcessed}</div>
                      <div className="text-xs text-slate-400">Procesados</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{job.totalItems}</div>
                      <div className="text-xs text-slate-400">Total</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-orange-400">
                        {duration ? `${duration}s` : 'En curso'}
                      </div>
                      <div className="text-xs text-slate-400">Duración</div>
                    </div>
                  </div>

                  {job.status === 'running' && (
                    <Progress value={job.progress} className="h-2 mb-4" />
                  )}

                  {job.errors.length > 0 && (
                    <Alert className="border-red-500/50 bg-red-500/10">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription className="text-red-400">
                        {job.errors.length} errores encontrados durante la sincronización
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
