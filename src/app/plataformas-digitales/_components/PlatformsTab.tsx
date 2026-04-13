'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, Settings, Plus, AlertTriangle } from 'lucide-react';
import type { PlatformConnection } from '../_types';
import { getStatusColor, formatCurrency, formatNumber } from '../_utils';

interface PlatformsTabProps {
  platformConnections: PlatformConnection[];
}

export function PlatformsTab({ platformConnections }: PlatformsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {platformConnections.map((platform) => (
          <Card key={platform.platform}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{platform.icon}</span>
                  <span>{platform.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(platform.status)}`} />
                  <span className="text-sm text-slate-600 capitalize">{platform.status}</span>
                </div>
              </CardTitle>
              <CardDescription>
                {platform.connected ? 'Conectado y sincronizado' : 'No configurado'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Campañas activas</p>
                  <p className="text-xl font-bold">{platform.campaignCount}</p>
                </div>
                <div>
                  <p className="text-slate-500">Inversión total</p>
                  <p className="text-xl font-bold">{formatCurrency(platform.totalSpend)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Impresiones</p>
                  <p className="text-xl font-bold">{formatNumber(platform.metrics.impressions)}</p>
                </div>
                <div>
                  <p className="text-slate-500">Conversiones</p>
                  <p className="text-xl font-bold">{formatNumber(platform.metrics.conversions)}</p>
                </div>
              </div>

              {platform.lastSync && (
                <p className="text-sm text-slate-600">
                  Última sincronización: {new Date(platform.lastSync).toLocaleString('es-CL')}
                </p>
              )}

              {platform.errors.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>{platform.errors.join(', ')}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-2">
                {platform.connected ? (
                  <>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Sincronizar
                    </Button>
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Configurar
                    </Button>
                  </>
                ) : (
                  <Button size="sm" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Conectar
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
