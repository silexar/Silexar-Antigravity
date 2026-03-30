/**
 * 📤 SILEXAR PULSE - Editor de Creativos Digitales 2050
 * 
 * @description Uploader y editor de materiales digitales con
 * preview multi-dispositivo, validación de formatos y dimensiones.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Upload,
  Volume2,
  Smartphone,
  Tablet,
  Monitor,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  Eye,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
  Trash2,
  RefreshCw
} from 'lucide-react';
import type { FormatoBanner } from './types/CampanaHibrida.types';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoCreativo = 'banner' | 'audio' | 'video' | 'html5';

export interface ArchivoCreativo {
  id: string;
  nombre: string;
  tipo: TipoCreativo;
  formato: string;
  tamanoBytes: number;
  url: string; // URL temporal o base64
  dimensiones?: { width: number; height: number };
  duracion?: number; // segundos para audio/video
  valido: boolean;
  errores: string[];
}

export interface EditorCreativosProps {
  tipoCreativo: TipoCreativo;
  creativoActual?: ArchivoCreativo;
  formatoBanner?: FormatoBanner;
  onFormatoBannerChange?: (formato: FormatoBanner) => void;
  onCreativoChange: (creativo: ArchivoCreativo | null) => void;
  maxSizeMB?: number;
  maxDuracionSegundos?: number;
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const FORMATOS_BANNER: { id: FormatoBanner; label: string; desc: string }[] = [
  { id: '320x50', label: '320×50', desc: 'Mobile Banner' },
  { id: '320x100', label: '320×100', desc: 'Large Mobile Banner' },
  { id: '300x250', label: '300×250', desc: 'Medium Rectangle' },
  { id: '336x280', label: '336×280', desc: 'Large Rectangle' },
  { id: '728x90', label: '728×90', desc: 'Leaderboard' },
  { id: '160x600', label: '160×600', desc: 'Wide Skyscraper' },
  { id: '300x600', label: '300×600', desc: 'Half Page' },
  { id: '970x90', label: '970×90', desc: 'Large Leaderboard' },
  { id: '970x250', label: '970×250', desc: 'Billboard' }
];

const FORMATOS_ACEPTADOS: Record<TipoCreativo, string[]> = {
  banner: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'html', 'zip'],
  audio: ['mp3', 'aac', 'wav', 'ogg'],
  video: ['mp4', 'webm', 'mov'],
  html5: ['html', 'zip']
};

const MIME_TYPES: Record<TipoCreativo, string> = {
  banner: 'image/*,.html,.zip',
  audio: 'audio/*',
  video: 'video/*',
  html5: '.html,.zip'
};

const DISPOSITIVOS_PREVIEW = [
  { id: 'mobile', icono: Smartphone, label: 'Móvil', width: 320 },
  { id: 'tablet', icono: Tablet, label: 'Tablet', width: 768 },
  { id: 'desktop', icono: Monitor, label: 'Desktop', width: 1200 }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const EditorCreativosDigitales: React.FC<EditorCreativosProps> = ({
  tipoCreativo,
  creativoActual,
  formatoBanner = '300x250',
  onFormatoBannerChange,
  onCreativoChange,
  maxSizeMB = 5,
  maxDuracionSegundos = 30
}) => {
  // Estado
  const [arrastrando, setArrastrando] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [progresoSubida, setProgresoSubida] = useState(0);
  const [previewDispositivo, setPreviewDispositivo] = useState('mobile');
  const [reproduciendo, setReproduciendo] = useState(false);
  
  const inputFileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // ═════════════════════════════════════════════════════════════
  // VALIDACIONES
  // ═════════════════════════════════════════════════════════════

  const validarArchivo = useCallback((file: File): { valido: boolean; errores: string[] } => {
    const errores: string[] = [];
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    const formatosPermitidos = FORMATOS_ACEPTADOS[tipoCreativo];

    // Validar formato
    if (!formatosPermitidos.includes(extension)) {
      errores.push(`Formato no permitido. Use: ${formatosPermitidos.join(', ')}`);
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSizeMB) {
      errores.push(`Tamaño máximo: ${maxSizeMB}MB (archivo: ${sizeMB.toFixed(2)}MB)`);
    }

    return { valido: errores.length === 0, errores };
  }, [tipoCreativo, maxSizeMB]);

  // ═════════════════════════════════════════════════════════════
  // HANDLERS
  // ═════════════════════════════════════════════════════════════

  const procesarArchivo = useCallback(async (file: File) => {
    const validacion = validarArchivo(file);
    
    if (!validacion.valido) {
      const creativo: ArchivoCreativo = {
        id: `crv_${Date.now()}`,
        nombre: file.name,
        tipo: tipoCreativo,
        formato: file.name.split('.').pop()?.toLowerCase() || '',
        tamanoBytes: file.size,
        url: '',
        valido: false,
        errores: validacion.errores
      };
      onCreativoChange(creativo);
      return;
    }

    setSubiendo(true);
    setProgresoSubida(0);

    // Simular subida con progreso
    const intervalo = setInterval(() => {
      setProgresoSubida(prev => {
        if (prev >= 100) {
          clearInterval(intervalo);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    // Crear URL temporal para preview
    const url = URL.createObjectURL(file);

    // Obtener dimensiones/duración según tipo
    let dimensiones: { width: number; height: number } | undefined;
    let duracion: number | undefined;

    if (tipoCreativo === 'banner') {
      // Obtener dimensiones de imagen
      const img = new Image();
      img.src = url;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          dimensiones = { width: img.width, height: img.height };
          resolve();
        };
        img.onerror = () => resolve();
      });
    } else if (tipoCreativo === 'audio') {
      const audio = new Audio(url);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          duracion = Math.round(audio.duration);
          resolve();
        };
        audio.onerror = () => resolve();
      });
    } else if (tipoCreativo === 'video') {
      const video = document.createElement('video');
      video.src = url;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          dimensiones = { width: video.videoWidth, height: video.videoHeight };
          duracion = Math.round(video.duration);
          resolve();
        };
        video.onerror = () => resolve();
      });
    }

    // Validar duración para audio/video
    const nuevosErrores: string[] = [];
    if (duracion && duracion > maxDuracionSegundos) {
      nuevosErrores.push(`Duración máxima: ${maxDuracionSegundos}s (archivo: ${duracion}s)`);
    }

    const creativo: ArchivoCreativo = {
      id: `crv_${Date.now()}`,
      nombre: file.name,
      tipo: tipoCreativo,
      formato: file.name.split('.').pop()?.toLowerCase() || '',
      tamanoBytes: file.size,
      url,
      dimensiones,
      duracion,
      valido: nuevosErrores.length === 0,
      errores: nuevosErrores
    };

    setTimeout(() => {
      setSubiendo(false);
      setProgresoSubida(0);
      onCreativoChange(creativo);
    }, 1200);
  }, [tipoCreativo, validarArchivo, maxDuracionSegundos, onCreativoChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setArrastrando(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      procesarArchivo(file);
    }
  }, [procesarArchivo]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      procesarArchivo(file);
    }
  }, [procesarArchivo]);

  const handleEliminar = useCallback(() => {
    if (creativoActual?.url) {
      URL.revokeObjectURL(creativoActual.url);
    }
    onCreativoChange(null);
  }, [creativoActual, onCreativoChange]);

  const toggleReproduccion = useCallback(() => {
    if (tipoCreativo === 'audio' && audioRef.current) {
      if (reproduciendo) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setReproduciendo(!reproduciendo);
    } else if (tipoCreativo === 'video' && videoRef.current) {
      if (reproduciendo) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setReproduciendo(!reproduciendo);
    }
  }, [tipoCreativo, reproduciendo]);

  // ═════════════════════════════════════════════════════════════
  // RENDER
  // ═════════════════════════════════════════════════════════════

  const IconoTipo = {
    banner: FileImage,
    audio: FileAudio,
    video: FileVideo,
    html5: FileCode
  }[tipoCreativo];

  const etiquetaTipo = {
    banner: '🖼️ Banner',
    audio: '🔊 Audio Ad',
    video: '🎬 Video Ad',
    html5: '✨ HTML5'
  }[tipoCreativo];

  return (
    <Card className="p-4 border-green-200 bg-gradient-to-br from-green-50/50 to-white">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-100 flex items-center justify-center">
            <IconoTipo className="w-4 h-4 text-green-600" />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{etiquetaTipo}</h4>
            <p className="text-xs text-gray-500">
              Formatos: {FORMATOS_ACEPTADOS[tipoCreativo].join(', ')}
            </p>
          </div>
        </div>

        {/* Selector de formato banner */}
        {tipoCreativo === 'banner' && onFormatoBannerChange && (
          <Select value={formatoBanner} onValueChange={(v) => onFormatoBannerChange(v as FormatoBanner)}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FORMATOS_BANNER.map(f => (
                <SelectItem key={f.id} value={f.id}>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs">{f.label}</span>
                    <span className="text-xs text-gray-400">{f.desc}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* Zona de Upload o Preview */}
      {!creativoActual ? (
        // Zona de Drop
        <div
          className={`
            relative border-2 border-dashed rounded-xl p-8 text-center
            transition-all cursor-pointer
            ${arrastrando 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-300 hover:border-green-400 hover:bg-green-50/50'}
          `}
          onDragOver={(e) => { e.preventDefault(); setArrastrando(true); }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          onClick={() => inputFileRef.current?.click()}
        >
          <input
            ref={inputFileRef}
            type="file"
            accept={MIME_TYPES[tipoCreativo]}
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {subiendo ? (
            <div className="space-y-3">
              <RefreshCw className="w-10 h-10 text-green-500 mx-auto animate-spin" />
              <p className="text-sm text-gray-600">Subiendo archivo...</p>
              <Progress value={progresoSubida} className="w-48 mx-auto h-2" />
              <p className="text-xs text-gray-400">{progresoSubida}%</p>
            </div>
          ) : (
            <>
              <Upload className={`w-12 h-12 mx-auto mb-3 ${arrastrando ? 'text-green-500' : 'text-gray-400'}`} />
              <p className="text-sm text-gray-700 font-medium mb-1">
                Arrastra tu archivo aquí
              </p>
              <p className="text-xs text-gray-500 mb-3">
                o haz clic para seleccionar
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <Badge variant="outline" className="text-xs">
                  Máx {maxSizeMB}MB
                </Badge>
                {(tipoCreativo === 'audio' || tipoCreativo === 'video') && (
                  <Badge variant="outline" className="text-xs">
                    Máx {maxDuracionSegundos}s
                  </Badge>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        // Preview del creativo
        <div className="space-y-4">
          {/* Info del archivo */}
          <div className={`flex items-center justify-between p-3 rounded-lg ${
            creativoActual.valido ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center gap-3">
              <IconoTipo className={`w-8 h-8 ${creativoActual.valido ? 'text-green-600' : 'text-red-600'}`} />
              <div>
                <p className="font-medium text-gray-800 text-sm">{creativoActual.nombre}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{(creativoActual.tamanoBytes / 1024).toFixed(1)} KB</span>
                  {creativoActual.dimensiones && (
                    <span>• {creativoActual.dimensiones.width}×{creativoActual.dimensiones.height}</span>
                  )}
                  {creativoActual.duracion && (
                    <span>• {creativoActual.duracion}s</span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {creativoActual.valido ? (
                <Badge className="bg-green-100 text-green-700 gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  Válido
                </Badge>
              ) : (
                <Badge className="bg-red-100 text-red-700 gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  Error
                </Badge>
              )}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleEliminar}
                className="h-8 w-8 text-gray-400 hover:text-red-500"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Errores */}
          {creativoActual.errores.length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg border border-red-200">
              {creativoActual.errores.map((error, idx) => (
                <p key={idx} className="text-sm text-red-600 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </p>
              ))}
            </div>
          )}

          {/* Preview según tipo */}
          {creativoActual.valido && (
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid grid-cols-2 mb-3">
                <TabsTrigger value="preview" className="gap-1 text-xs">
                  <Eye className="w-3 h-3" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="dispositivos" className="gap-1 text-xs">
                  <Smartphone className="w-3 h-3" />
                  Dispositivos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <div className="border rounded-lg overflow-hidden bg-gray-100">
                  {tipoCreativo === 'banner' && (
                    <div className="flex items-center justify-center p-4 min-h-[200px]">
                      <img
                        src={creativoActual.url}
                        alt={creativoActual.nombre}
                        className="max-w-full max-h-[300px] object-contain"
                      />
                    </div>
                  )}

                  {tipoCreativo === 'audio' && (
                    <div className="p-6 flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                        <Volume2 className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={toggleReproduccion}
                          className="h-10 w-10 rounded-full"
                        >
                          {reproduciendo ? (
                            <Pause className="w-5 h-5" />
                          ) : (
                            <Play className="w-5 h-5" />
                          )}
                        </Button>
                        <span className="text-sm font-medium">
                          {creativoActual.duracion}s
                        </span>
                      </div>
                      <audio ref={audioRef} src={creativoActual.url} onEnded={() => setReproduciendo(false)} />
                    </div>
                  )}

                  {tipoCreativo === 'video' && (
                    <div className="relative">
                      <video
                        ref={videoRef}
                        src={creativoActual.url}
                        className="w-full max-h-[300px]"
                        onEnded={() => setReproduciendo(false)}
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={toggleReproduccion}
                          className="gap-2 bg-white/80 text-gray-800 hover:bg-white/90 shadow-sm shadow-gray-200/50 border border-gray-200"
                        >
                          {reproduciendo ? (
                            <Pause className="w-4 h-4" />
                          ) : (
                            <Play className="w-4 h-4" />
                          )}
                          {reproduciendo ? 'Pausar' : 'Reproducir'}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="dispositivos">
                <div className="space-y-3">
                  {/* Selector de dispositivo */}
                  <div className="flex gap-2 justify-center">
                    {DISPOSITIVOS_PREVIEW.map(d => (
                      <Button
                        key={d.id}
                        variant={previewDispositivo === d.id ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setPreviewDispositivo(d.id)}
                        className="gap-1"
                      >
                        <d.icono className="w-4 h-4" />
                        {d.label}
                      </Button>
                    ))}
                  </div>

                  {/* Preview en dispositivo */}
                  <div className="flex justify-center">
                    <div
                      className={`
                        border-4 border-gray-800 rounded-2xl overflow-hidden bg-white
                        ${previewDispositivo === 'mobile' ? 'w-[320px]' : ''}
                        ${previewDispositivo === 'tablet' ? 'w-[400px]' : ''}
                        ${previewDispositivo === 'desktop' ? 'w-full max-w-[600px]' : ''}
                      `}
                    >
                      <div className="bg-gray-100 h-6 flex items-center justify-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-gray-300"></div>
                      </div>
                      <div className="p-2 bg-white min-h-[200px] flex items-center justify-center">
                        {tipoCreativo === 'banner' && (
                          <img
                            src={creativoActual.url}
                            alt={creativoActual.nombre}
                            className="max-w-full object-contain"
                          />
                        )}
                        {tipoCreativo === 'audio' && (
                          <div className="text-center text-gray-500 text-sm p-4">
                            🔊 Audio Ad se reproduce en segundo plano
                          </div>
                        )}
                        {tipoCreativo === 'video' && (
                          <video
                            src={creativoActual.url}
                            className="max-w-full"
                            controls
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* Especificaciones del formato */}
      {tipoCreativo === 'banner' && !creativoActual && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-600 font-medium mb-2">
            Especificaciones para {formatoBanner}:
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs text-gray-500">
            <span>📐 Dimensiones: {formatoBanner}</span>
            <span>📦 Máx: {maxSizeMB}MB</span>
            <span>📄 Formatos: JPG, PNG, GIF, HTML5</span>
          </div>
        </div>
      )}
    </Card>
  );
};

export default EditorCreativosDigitales;
