/**
 * 🔗 SILEXAR PULSE - Sistema de Tracking y Links 2050
 * 
 * @description Panel para configurar UTM, pixels de conversión,
 * QR codes y deep links para seguimiento de campañas digitales.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Smartphone,
  BarChart3,
  Globe,
  Code,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Download,
  Zap
} from 'lucide-react';
import type { ConfiguracionTracking, ParametrosUTM, PixelTracking } from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export interface SistemaTrackingProps {
  tracking: Partial<ConfiguracionTracking>;
  campaignName: string;
  onChange: (tracking: Partial<ConfiguracionTracking>) => void;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const PLATAFORMAS_PIXEL = [
  { 
    id: 'google_analytics', 
    nombre: 'Google Analytics 4', 
    icono: '📊',
    placeholder: 'G-XXXXXXXXXX',
    help: 'ID de medición de GA4'
  },
  { 
    id: 'meta_pixel', 
    nombre: 'Meta Pixel', 
    icono: '📘',
    placeholder: '123456789012345',
    help: 'ID del pixel de Facebook/Instagram'
  },
  { 
    id: 'google_ads', 
    nombre: 'Google Ads', 
    icono: '🎯',
    placeholder: 'AW-123456789',
    help: 'ID de conversión de Google Ads'
  },
  { 
    id: 'tiktok', 
    nombre: 'TikTok Pixel', 
    icono: '🎵',
    placeholder: 'XXXXXXXXXXXXXXXXXX',
    help: 'ID del pixel de TikTok'
  },
  { 
    id: 'linkedin', 
    nombre: 'LinkedIn Insight', 
    icono: '💼',
    placeholder: '123456',
    help: 'Partner ID de LinkedIn'
  }
];

const UTM_MEDIUMS = [
  { id: 'streaming_radio', label: 'Streaming Radio' },
  { id: 'banner', label: 'Banner Display' },
  { id: 'audio_ad', label: 'Audio Ad' },
  { id: 'video_ad', label: 'Video Ad' },
  { id: 'rich_media', label: 'Rich Media' },
  { id: 'push_notification', label: 'Push Notification' }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const SistemaTrackingLinks: React.FC<SistemaTrackingProps> = ({
  tracking,
  campaignName,
  onChange
}) => {
  // Estado local
  const [urlValidada, setUrlValidada] = useState<boolean | null>(null);
  const [validandoUrl, setValidandoUrl] = useState(false);
  const [copiado, setCopiado] = useState<string | null>(null);
  const [pixelsActivos, setPixelsActivos] = useState<Record<string, boolean>>({});
  const [pixelIds, setPixelIds] = useState<Record<string, string>>({});

  // UTM por defecto (memoizado para evitar recreación en cada render)
  const utm = useMemo(() => tracking.utm || {
    source: 'silexar_pulse',
    medium: 'streaming_radio',
    campaign: campaignName.toLowerCase().replace(/\s+/g, '_'),
    content: '',
    term: ''
  }, [tracking.utm, campaignName]);

  // URL con UTM
  const urlConUTM = useMemo(() => {
    if (!tracking.urlDestino) return '';
    
    const params = new URLSearchParams();
    params.set('utm_source', utm.source);
    params.set('utm_medium', utm.medium);
    params.set('utm_campaign', utm.campaign);
    if (utm.content) params.set('utm_content', utm.content);
    if (utm.term) params.set('utm_term', utm.term);
    
    const separator = tracking.urlDestino.includes('?') ? '&' : '?';
    return `${tracking.urlDestino}${separator}${params.toString()}`;
  }, [tracking.urlDestino, utm.source, utm.medium, utm.campaign, utm.content, utm.term]);

  // Código del pixel Silexar
  const silexarPixelCode = useMemo(() => {
    const pixelId = tracking.silexarPixelId || `sp_${Date.now()}`;
    return `<script>
  (function(s,p,i,x,e,l){s[x]=s[x]||function(){(s[x].q=s[x].q||[]).push(arguments)};
  l=p.createElement(i);l.async=1;l.src='https://cdn.silexarpulse.com/sp.js';
  e=p.getElementsByTagName(i)[0];e.parentNode.insertBefore(l,e)})(window,document,'script','sp');
  sp('init', '${pixelId}');
  sp('track', 'PageView');
</script>`;
  }, [tracking.silexarPixelId]);

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const handleUrlChange = useCallback((url: string) => {
    setUrlValidada(null);
    onChange({
      ...tracking,
      urlDestino: url,
      urlDestinoValidada: false
    });
  }, [tracking, onChange]);

  const handleValidarUrl = useCallback(async () => {
    if (!tracking.urlDestino) return;
    
    setValidandoUrl(true);
    
    // Simular validación (en producción sería una llamada real)
    await new Promise(r => setTimeout(r, 1000));
    
    const esValida = tracking.urlDestino.startsWith('http');
    setUrlValidada(esValida);
    setValidandoUrl(false);
    
    onChange({
      ...tracking,
      urlDestinoValidada: esValida
    });
  }, [tracking, onChange]);

  const handleUtmChange = useCallback((campo: keyof ParametrosUTM, valor: string) => {
    onChange({
      ...tracking,
      utm: { ...utm, [campo]: valor }
    });
  }, [tracking, utm, onChange]);

  const handleCopiar = useCallback(async (texto: string, id: string) => {
    await navigator.clipboard.writeText(texto);
    setCopiado(id);
    setTimeout(() => setCopiado(null), 2000);
  }, []);

  const handleTogglePixel = useCallback((plataformaId: string, activo: boolean) => {
    setPixelsActivos(prev => ({ ...prev, [plataformaId]: activo }));
    
    // Actualizar tracking
    const pixels = (tracking.pixels || []).filter(p => p.plataforma !== plataformaId);
    if (activo && pixelIds[plataformaId]) {
      pixels.push({
        id: `px_${plataformaId}`,
        plataforma: plataformaId as PixelTracking['plataforma'],
        pixelId: pixelIds[plataformaId],
        eventos: ['PageView', 'Purchase'],
        activo: true
      });
    }
    
    onChange({ ...tracking, pixels });
  }, [tracking, pixelIds, onChange]);

  const handlePixelIdChange = useCallback((plataformaId: string, id: string) => {
    setPixelIds(prev => ({ ...prev, [plataformaId]: id }));
  }, []);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  return (
    <Card className="p-4 border-cyan-200 bg-gradient-to-br from-cyan-50/50 to-white">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
          <Link2 className="w-4 h-4 text-cyan-600" />
        </div>
        <div>
          <h4 className="font-bold text-gray-800">🔗 Sistema de Tracking</h4>
          <p className="text-xs text-gray-500">UTM, Pixels y Enlaces de seguimiento</p>
        </div>
      </div>

      <Tabs defaultValue="utm" className="w-full">
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="utm" className="gap-1 text-xs">
            <Globe className="w-3 h-3" />
            UTM Links
          </TabsTrigger>
          <TabsTrigger value="pixels" className="gap-1 text-xs">
            <Code className="w-3 h-3" />
            Pixels
          </TabsTrigger>
          <TabsTrigger value="qr" className="gap-1 text-xs">
            <QrCode className="w-3 h-3" />
            QR & Deep Links
          </TabsTrigger>
        </TabsList>

        {/* TAB: UTM Links */}
        <TabsContent value="utm" className="space-y-4">
          {/* URL Destino */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">URL de Destino</Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="https://www.ejemplo.com/landing"
                  value={tracking.urlDestino || ''}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  className={`pr-10 ${
                    urlValidada === true ? 'border-green-500' :
                    urlValidada === false ? 'border-red-500' : ''
                  }`}
                />
                {urlValidada !== null && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {urlValidada ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                onClick={handleValidarUrl}
                disabled={validandoUrl || !tracking.urlDestino}
                className="gap-1"
              >
                {validandoUrl ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                Validar
              </Button>
            </div>
          </div>

          {/* Parámetros UTM */}
          <div className="p-4 border rounded-lg bg-gray-50 space-y-3">
            <Label className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              Parámetros UTM
            </Label>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-600">Source</Label>
                <Input
                  value={utm.source}
                  onChange={(e) => handleUtmChange('source', e.target.value)}
                  className="h-8 mt-1 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Origen del tráfico</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Medium</Label>
                <select
                  value={utm.medium}
                  onChange={(e) => handleUtmChange('medium', e.target.value)}
                  className="w-full h-8 mt-1 px-2 text-sm border rounded-md"
                >
                  {UTM_MEDIUMS.map(m => (
                    <option key={m.id} value={m.id}>{m.label}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-400 mt-1">Tipo de medio</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Campaign</Label>
                <Input
                  value={utm.campaign}
                  onChange={(e) => handleUtmChange('campaign', e.target.value)}
                  className="h-8 mt-1 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Nombre de campaña</p>
              </div>
              <div>
                <Label className="text-xs text-gray-600">Content (opcional)</Label>
                <Input
                  value={utm.content || ''}
                  onChange={(e) => handleUtmChange('content', e.target.value)}
                  placeholder="banner_v1"
                  className="h-8 mt-1 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Variante de creativo</p>
              </div>
            </div>
          </div>

          {/* URL Final */}
          {tracking.urlDestino && (
            <div className="p-4 border rounded-lg bg-blue-50 border-blue-200">
              <Label className="text-sm font-medium text-blue-700 mb-2 block">
                🔗 URL Final con UTM
              </Label>
              <div className="flex gap-2">
                <Input
                  value={urlConUTM}
                  readOnly
                  className="flex-1 text-xs font-mono bg-white"
                />
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCopiar(urlConUTM, 'url')}
                        className="shrink-0"
                      >
                        {copiado === 'url' ? (
                          <Check className="w-4 h-4 text-green-600" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Copiar URL</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(urlConUTM, '_blank')}
                  className="shrink-0"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* TAB: Pixels */}
        <TabsContent value="pixels" className="space-y-4">
          {/* Pixels de terceros */}
          <div className="space-y-3">
            {PLATAFORMAS_PIXEL.map(plat => (
              <div
                key={plat.id}
                className={`p-3 border rounded-lg transition-colors ${
                  pixelsActivos[plat.id] ? 'bg-green-50 border-green-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{plat.icono}</span>
                    <span className="font-medium text-gray-800">{plat.nombre}</span>
                  </div>
                  <Switch
                    checked={pixelsActivos[plat.id] || false}
                    onCheckedChange={(v) => handleTogglePixel(plat.id, v)}
                  />
                </div>
                
                {pixelsActivos[plat.id] && (
                  <div className="mt-2">
                    <Input
                      placeholder={plat.placeholder}
                      value={pixelIds[plat.id] || ''}
                      onChange={(e) => handlePixelIdChange(plat.id, e.target.value)}
                      className="h-8 text-sm font-mono"
                    />
                    <p className="text-xs text-gray-500 mt-1">{plat.help}</p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Pixel Silexar Propio */}
          <div className="p-4 border rounded-lg bg-purple-50 border-purple-200">
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-purple-600" />
              <Label className="text-sm font-medium text-purple-700">
                Pixel Silexar Pulse
              </Label>
              <Badge className="bg-purple-100 text-purple-700">Automático</Badge>
            </div>
            
            <Textarea
              value={silexarPixelCode}
              readOnly
              className="font-mono text-xs h-32 bg-white"
            />
            
            <div className="flex gap-2 mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopiar(silexarPixelCode, 'pixel')}
                className="gap-1"
              >
                {copiado === 'pixel' ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
                Copiar código
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
              >
                <Download className="w-3 h-3" />
                Descargar
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* TAB: QR & Deep Links */}
        <TabsContent value="qr" className="space-y-4">
          {/* Código QR */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <QrCode className="w-4 h-4" />
              Código QR Dinámico
            </Label>
            
            <div className="flex gap-4">
              <div className="w-32 h-32 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                {tracking.urlDestino ? (
                  <div className="text-center">
                    <QrCode className="w-16 h-16 text-gray-400 mx-auto" />
                    <span className="text-xs text-gray-500 mt-1">Preview QR</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 text-center px-2">
                    Ingresa URL para generar
                  </span>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <Button
                  variant="outline"
                  disabled={!tracking.urlDestino}
                  className="w-full gap-1"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR (PNG)
                </Button>
                <Button
                  variant="outline"
                  disabled={!tracking.urlDestino}
                  className="w-full gap-1"
                >
                  <Download className="w-4 h-4" />
                  Descargar QR (SVG)
                </Button>
                <p className="text-xs text-gray-500">
                  El QR incluye automáticamente los parámetros UTM configurados
                </p>
              </div>
            </div>
          </div>

          {/* Deep Links */}
          <div className="p-4 border rounded-lg">
            <Label className="text-sm font-medium mb-3 flex items-center gap-2">
              <Smartphone className="w-4 h-4" />
              Deep Links para Apps
            </Label>
            
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-gray-600 flex items-center gap-1">
                  <span>🍎</span> iOS (Universal Link)
                </Label>
                <Input
                  placeholder="https://app.ejemplo.com/landing"
                  value={tracking.deepLinkiOS || ''}
                  onChange={(e) => onChange({ ...tracking, deepLinkiOS: e.target.value })}
                  className="h-8 mt-1 text-sm"
                />
              </div>
              
              <div>
                <Label className="text-xs text-gray-600 flex items-center gap-1">
                  <span>🤖</span> Android (App Link)
                </Label>
                <Input
                  placeholder="https://app.ejemplo.com/landing"
                  value={tracking.deepLinkAndroid || ''}
                  onChange={(e) => onChange({ ...tracking, deepLinkAndroid: e.target.value })}
                  className="h-8 mt-1 text-sm"
                />
              </div>
            </div>
            
            <p className="text-xs text-gray-500 mt-3">
              Si el usuario tiene la app instalada, se abrirá directamente en la app.
              De lo contrario, redirige a la URL web.
            </p>
          </div>

          {/* URL Acortada */}
          <div className="p-4 border rounded-lg bg-amber-50 border-amber-200">
            <Label className="text-sm font-medium mb-3 flex items-center gap-2 text-amber-700">
              <Link2 className="w-4 h-4" />
              URL Acortada
            </Label>
            
            <div className="flex gap-2">
              <Input
                value={tracking.urlAcortada || ''}
                readOnly
                placeholder="slxr.io/abc123"
                className="flex-1 bg-white"
              />
              <Button
                variant="outline"
                disabled={!tracking.urlDestino}
                className="gap-1"
              >
                <Zap className="w-4 h-4" />
                Generar
              </Button>
            </div>
            
            <p className="text-xs text-amber-600 mt-2">
              URLs cortas para compartir en redes sociales o impresos
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default SistemaTrackingLinks;
