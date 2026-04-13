'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Activity, Filter, RefreshCw } from 'lucide-react';
import type { PlayoutSystem, SystemLog } from '../_types';
import { getSystemIcon } from '../_utils';

interface MonitoringTabProps {
  systemLogs: SystemLog[];
  playoutSystems: PlayoutSystem[];
}

const LEVEL_COLORS: Record<SystemLog['level'], string> = {
  info: 'text-blue-400 bg-blue-500/20',
  warning: 'text-yellow-400 bg-yellow-500/20',
  error: 'text-red-400 bg-red-500/20',
  critical: 'text-red-400 bg-red-500/30',
};

export function MonitoringTab({ systemLogs, playoutSystems }: MonitoringTabProps) {
  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-400">
            <Activity className="h-5 w-5" />
            Logs del Sistema
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar Nivel
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemLogs.map((log) => {
              const system = playoutSystems.find(s => s.id === log.systemId);
              return (
                <div key={log.id} className="flex items-start gap-3 p-3 border border-slate-700 rounded-lg">
                  <div className={`p-1 rounded text-xs font-bold ${LEVEL_COLORS[log.level]}`}>
                    {log.level.toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{getSystemIcon(system?.type ?? '')}</span>
                      <span className="font-semibold">{system?.name}</span>
                      <span className="text-xs text-slate-400">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300">{log.message}</p>
                    {log.details && (
                      <div className="mt-2 p-2 bg-slate-700/50 rounded text-xs">
                        <pre className="text-slate-400">{JSON.stringify(log.details, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
