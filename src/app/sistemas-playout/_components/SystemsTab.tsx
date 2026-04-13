'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Server, Settings, RefreshCw, Radio, Upload, Download, CheckCircle, Shield } from 'lucide-react';
import type { PlayoutSystem } from '../_types';
import { SYSTEM_TYPES, STATIONS, getSystemIcon, getStatusColor, getStatusIcon } from '../_utils';

interface SystemsTabProps {
  playoutSystems: PlayoutSystem[];
  isLoading: boolean;
  onSystemTest: (systemId: string) => void;
  onSyncStart: (systemId: string, type: 'import' | 'export') => void;
}

export function SystemsTab({ playoutSystems, isLoading, onSystemTest, onSyncStart }: SystemsTabProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Sistemas */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <Server className="h-5 w-5" />
              Sistemas de Playout Configurados
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Agregar Sistema
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Todo
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {playoutSystems.map((system) => {
              const StatusIcon = getStatusIcon(system.status);
              const systemType = SYSTEM_TYPES.find(st => st.id === system.type);
              const station = STATIONS.find(s => s.id === system.stationId);

              return (
                <div key={system.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">{getSystemIcon(system.type)}</div>
                      <div>
                        <h4 className="font-semibold">{system.name}</h4>
                        <p className="text-sm text-slate-400">
                          {systemType?.name} v{system.version} • {station?.name}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`flex items-center gap-1 ${getStatusColor(system.status)}`}>
                        <StatusIcon className="h-4 w-4" />
                        <span className="text-sm font-medium">{system.status.toUpperCase()}</span>
                      </div>
                      <Button variant="outline" size="sm" aria-label="Configuración">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-green-400">{system.metrics.uptime.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">Uptime</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-blue-400">{Math.round(system.metrics.latency)}ms</div>
                      <div className="text-xs text-slate-400">Latencia</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-purple-400">{system.metrics.successRate.toFixed(1)}%</div>
                      <div className="text-xs text-slate-400">Éxito</div>
                    </div>
                    <div className="text-center p-3 bg-slate-700/50 rounded-lg">
                      <div className="text-lg font-bold text-orange-400">
                        {new Date(system.lastSync).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-slate-400">Última Sync</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    {(['import', 'export', 'monitoring', 'realtime'] as const).map((feat) => (
                      <div key={feat} className="flex items-center gap-2 text-sm">
                        <div className={`w-2 h-2 rounded-full ${system.features[feat] ? 'bg-green-400' : 'bg-red-400'}`} />
                        <span className="text-slate-400 capitalize">{feat}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSystemTest(system.id)}
                      disabled={isLoading}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Test Conexión
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onSyncStart(system.id, 'export')}>
                      <Upload className="h-4 w-4 mr-2" />
                      Exportar
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => onSyncStart(system.id, 'import')}>
                      <Download className="h-4 w-4 mr-2" />
                      Importar
                    </Button>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Panel de Configuración Rápida */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configuración Rápida
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Tipo de Sistema</Label>
              <Select>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Seleccionar tipo" />
                </SelectTrigger>
                <SelectContent>
                  {SYSTEM_TYPES.map(type => (
                    <SelectItem key={type.id} value={type.id}>
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{type.icon}</span>
                        {type.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Emisora</Label>
              <Select>
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue placeholder="Seleccionar emisora" />
                </SelectTrigger>
                <SelectContent>
                  {STATIONS.map(station => (
                    <SelectItem key={station.id} value={station.id}>
                      <div className="flex items-center gap-2">
                        <Radio className="h-4 w-4" />
                        {station.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Host/IP</Label>
              <Input placeholder="192.168.1.100" className="bg-slate-700 border-slate-600" aria-label="Host/IP" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Puerto</Label>
                <Input type="number" placeholder="21" className="bg-slate-700 border-slate-600" aria-label="Puerto" />
              </div>
              <div>
                <Label>Protocolo</Label>
                <Select>
                  <SelectTrigger className="bg-slate-700 border-slate-600">
                    <SelectValue placeholder="FTP" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ftp">FTP</SelectItem>
                    <SelectItem value="http">HTTP</SelectItem>
                    <SelectItem value="tcp">TCP</SelectItem>
                    <SelectItem value="api">API</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Usuario</Label>
              <Input placeholder="username" className="bg-slate-700 border-slate-600" aria-label="Usuario" />
            </div>

            <div>
              <Label>Contraseña</Label>
              <Input type="password" placeholder="••••••••" className="bg-slate-700 border-slate-600" aria-label="Contraseña" />
            </div>

            <Button className="w-full bg-green-600 hover:bg-green-700">
              <Settings className="h-4 w-4 mr-2" />
              Agregar Sistema
            </Button>

            <Alert className="border-blue-500/50 bg-blue-500/10">
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-blue-400">
                Las credenciales se almacenan de forma segura con encriptación AES-256
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
