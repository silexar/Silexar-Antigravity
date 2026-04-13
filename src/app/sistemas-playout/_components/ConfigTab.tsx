'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Shield, Database, HardDrive, RotateCcw, AlertTriangle } from 'lucide-react';

export function ConfigTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-400">
              <Settings className="h-5 w-5" />
              Configuración Global
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Intervalo de Sincronización (minutos)</Label>
              <Input
                type="number"
                defaultValue="5"
                className="bg-slate-700 border-slate-600"
                aria-label="Intervalo de Sincronización (minutos)"
              />
            </div>

            <div>
              <Label>Timeout de Conexión (segundos)</Label>
              <Input
                type="number"
                defaultValue="30"
                className="bg-slate-700 border-slate-600"
                aria-label="Timeout de Conexión (segundos)"
              />
            </div>

            <div>
              <Label>Reintentos Automáticos</Label>
              <Input
                type="number"
                defaultValue="3"
                className="bg-slate-700 border-slate-600"
                aria-label="Reintentos Automáticos"
              />
            </div>

            <div>
              <Label>Directorio de Logs</Label>
              <Input
                defaultValue="/var/log/playout"
                className="bg-slate-700 border-slate-600"
                aria-label="Directorio de Logs"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="auto-retry" className="rounded" />
              <Label htmlFor="auto-retry">Reintentos automáticos en fallos</Label>
            </div>

            <div className="flex items-center space-x-2">
              <input type="checkbox" id="notifications" className="rounded" />
              <Label htmlFor="notifications">Notificaciones por email</Label>
            </div>

            <Button className="w-full bg-red-600 hover:bg-red-700">
              <Settings className="h-4 w-4 mr-2" />
              Guardar Configuración
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Seguridad y Backup
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Backup Automático</Label>
              <Select defaultValue="daily">
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="hourly">Cada hora</SelectItem>
                  <SelectItem value="daily">Diario</SelectItem>
                  <SelectItem value="weekly">Semanal</SelectItem>
                  <SelectItem value="disabled">Deshabilitado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Retención de Logs (días)</Label>
              <Input
                type="number"
                defaultValue="30"
                className="bg-slate-700 border-slate-600"
                aria-label="Retención de Logs (días)"
              />
            </div>

            <div>
              <Label>Nivel de Log</Label>
              <Select defaultValue="info">
                <SelectTrigger className="bg-slate-700 border-slate-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="debug">Debug</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4 border-t border-slate-700">
              <h4 className="font-semibold mb-3">Acciones de Mantenimiento</h4>
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <Database className="h-4 w-4 mr-2" />
                  Limpiar Logs Antiguos
                </Button>
                <Button variant="outline" className="w-full">
                  <HardDrive className="h-4 w-4 mr-2" />
                  Crear Backup Manual
                </Button>
                <Button variant="outline" className="w-full">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reiniciar Servicios
                </Button>
              </div>
            </div>

            <Alert className="border-yellow-500/50 bg-yellow-500/10">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-yellow-400">
                Los cambios de configuración requieren reinicio de servicios
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
