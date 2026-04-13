'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export function SettingsTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Configuración General</CardTitle>
          <CardDescription>
            Configuración global del sistema de plataformas digitales
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-sync">Sincronización automática</Label>
                <p className="text-sm text-slate-500">Sincronizar datos automáticamente con todas las plataformas</p>
              </div>
              <Switch id="auto-sync" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-optimize">Optimización automática</Label>
                <p className="text-sm text-slate-500">Aplicar recomendaciones de IA automáticamente</p>
              </div>
              <Switch id="auto-optimize" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications">Notificaciones</Label>
                <p className="text-sm text-slate-500">Recibir alertas sobre cambios importantes</p>
              </div>
              <Switch id="notifications" />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="currency">Moneda predeterminada</Label>
              <Select defaultValue="CLP">
                <SelectTrigger className="w-48" aria-label="Moneda predeterminada">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CLP">Peso Chileno (CLP)</SelectItem>
                  <SelectItem value="USD">Dólar Americano (USD)</SelectItem>
                  <SelectItem value="EUR">Euro (EUR)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="timezone">Zona horaria</Label>
              <Select defaultValue="America/Santiago">
                <SelectTrigger className="w-48" aria-label="Zona horaria">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Santiago">Santiago (GMT-3)</SelectItem>
                  <SelectItem value="America/New_York">Nueva York (GMT-5)</SelectItem>
                  <SelectItem value="Europe/London">Londres (GMT+0)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button>Guardar cambios</Button>
            <Button variant="outline">Restablecer</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
