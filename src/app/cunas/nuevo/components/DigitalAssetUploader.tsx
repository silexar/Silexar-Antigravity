'use client';

/**
 * 📤 SILEXAR PULSE - DIGITAL ASSET UPLOADER
 * 
 * Componente de carga universal para activos digitales.
 * Soporta Video, Audio, Banners, HTML5 con detección automática
 * de tipo y validación en tiempo real.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState, useCallback, useRef } from 'react';
import { 
  Upload, Video, Image, Music, Code, X, Check, AlertTriangle, 
  Loader2, FileVideo, FileImage, FileAudio, Sparkles, Wand2,
  Monitor, Smartphone, Tv
} from 'lucide-react';
import NextImage from 'next/image';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type AssetType = 
  | 'VIDEO_HORIZONTAL' | 'VIDEO_VERTICAL' | 'VIDEO_SQUARE'
  | 'BANNER_STATIC' | 'BANNER_ANIMATED' | 'BANNER_HTML5'
  | 'AUDIO_STREAMING' | 'AUDIO_3D_SPATIAL'
  | 'COMPANION_DISPLAY' | 'AR_EXPERIENCE' | 'STORY_CAROUSEL';

interface UploadedAsset {
  id: string;
  file: File;
  tipo: AssetType;
  preview: string;
  dimensions?: { width: number; height: number };
  duration?: number;
  size: number;
  status: 'uploading' | 'processing' | 'validating' | 'ready' | 'error';
  progress: number;
  validationScore?: number;
  adaptations?: string[];
  errors?: string[];
}

interface DigitalAssetUploaderProps {
  onAssetsChange: (assets: UploadedAsset[]) => void;
  maxFiles?: number;
  allowedTypes?: AssetType[];
}

// ═══════════════════════════════════════════════════════════════
// CONSTANTES
// ═══════════════════════════════════════════════════════════════

const ACCEPTED_FORMATS = {
  video: ['.mp4', '.webm', '.mov'],
  image: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  audio: ['.mp3', '.wav', '.aac', '.ogg', '.m4a'],
  html5: ['.html', '.zip']
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const DigitalAssetUploader: React.FC<DigitalAssetUploaderProps> = ({
  onAssetsChange,
  maxFiles = 10
}) => {
  const [assets, setAssets] = useState<UploadedAsset[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isGeneratingAdaptations, setIsGeneratingAdaptations] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── HANDLERS ─────────────────────────────────────────────────

  const detectAssetType = (file: File): AssetType => {
    const ext = file.name.toLowerCase().split('.').pop();
    
    if (ACCEPTED_FORMATS.video.some(f => f.includes(ext || ''))) {
      return 'VIDEO_HORIZONTAL'; // Se refinará después de cargar
    }
    if (ACCEPTED_FORMATS.audio.some(f => f.includes(ext || ''))) {
      return 'AUDIO_STREAMING';
    }
    if (file.type === 'image/gif' || ext === 'gif') {
      return 'BANNER_ANIMATED';
    }
    if (ACCEPTED_FORMATS.image.some(f => f.includes(ext || ''))) {
      return 'BANNER_STATIC';
    }
    if (ACCEPTED_FORMATS.html5.some(f => f.includes(ext || ''))) {
      return 'BANNER_HTML5';
    }
    
    return 'BANNER_STATIC';
  };

  const processFile = useCallback(async (file: File): Promise<UploadedAsset> => {
    const id = `asset-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const tipo = detectAssetType(file);
    
    const asset: UploadedAsset = {
      id,
      file,
      tipo,
      preview: '',
      size: file.size,
      status: 'uploading',
      progress: 0
    };

    // Crear preview
    if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
      asset.preview = URL.createObjectURL(file);
    }

    // Obtener dimensiones para imágenes
    if (file.type.startsWith('image/')) {
      const img = new window.Image();
      img.src = asset.preview;
      await new Promise<void>((resolve) => {
        img.onload = () => {
          asset.dimensions = { width: img.width, height: img.height };
          resolve();
        };
      });
    }

    // Obtener dimensiones y duración para videos
    if (file.type.startsWith('video/')) {
      const video = document.createElement('video');
      video.src = asset.preview;
      await new Promise<void>((resolve) => {
        video.onloadedmetadata = () => {
          asset.dimensions = { width: video.videoWidth, height: video.videoHeight };
          asset.duration = video.duration;
          
          // Detectar orientación
          if (video.videoHeight > video.videoWidth) {
            asset.tipo = 'VIDEO_VERTICAL';
          } else if (video.videoHeight === video.videoWidth) {
            asset.tipo = 'VIDEO_SQUARE';
          }
          
          resolve();
        };
      });
    }

    // Obtener duración para audio
    if (file.type.startsWith('audio/')) {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      await new Promise<void>((resolve) => {
        audio.onloadedmetadata = () => {
          asset.duration = audio.duration;
          resolve();
        };
      });
    }

    return asset;
  }, []);

  const simulateUpload = useCallback(async (asset: UploadedAsset): Promise<UploadedAsset> => {
    // Simular progreso de carga
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 50));
      asset.progress = i;
    }
    
    asset.status = 'processing';
    await new Promise(resolve => setTimeout(resolve, 500));
    
    asset.status = 'validating';
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simular validación
    asset.validationScore = Math.floor(70 + Math.random() * 30);
    
    // Simular adaptaciones generadas
    if (asset.tipo.includes('VIDEO')) {
      asset.adaptations = ['Versión Vertical (9:16)', 'Versión Cuadrada (1:1)', 'Thumbnail HD'];
    } else if (asset.tipo === 'BANNER_STATIC') {
      asset.adaptations = ['Banner Mobile (320x50)', 'Banner Tablet (728x90)', 'Banner Desktop (970x250)'];
    }
    
    asset.status = 'ready';
    return asset;
  }, []);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files) return;
    
    const newAssets: UploadedAsset[] = [];
    
    for (let i = 0; i < Math.min(files.length, maxFiles - assets.length); i++) {
      const file = files[i];
      let asset = await processFile(file);
      newAssets.push(asset);
      
      setAssets(prev => [...prev, asset]);
      
      // Simular upload
      asset = await simulateUpload(asset);
      
      setAssets(prev => prev.map(a => a.id === asset.id ? asset : a));
    }
    
    onAssetsChange([...assets, ...newAssets]);
  }, [assets, maxFiles, processFile, simulateUpload, onAssetsChange]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const removeAsset = useCallback((id: string) => {
    const updated = assets.filter(a => a.id !== id);
    setAssets(updated);
    onAssetsChange(updated);
  }, [assets, onAssetsChange]);

  const generateAdaptations = useCallback(async () => {
    setIsGeneratingAdaptations(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAssets(prev => prev.map(asset => ({
      ...asset,
      adaptations: [
        ...(asset.adaptations || []),
        'Smart Watch Preview',
        'CarPlay Audio',
        'Smart Speaker Version'
      ]
    })));
    
    setIsGeneratingAdaptations(false);
  }, []);

  // ─── HELPERS ─────────────────────────────────────────────────

  const getAssetIcon = (tipo: AssetType) => {
    if (tipo.includes('VIDEO')) return <FileVideo className="w-5 h-5" />;
    if (tipo.includes('AUDIO')) return <FileAudio className="w-5 h-5" />;
    if (tipo.includes('BANNER') || tipo.includes('IMAGE')) return <FileImage className="w-5 h-5" />;
    return <Code className="w-5 h-5" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // ─── RENDER ─────────────────────────────────────────────────

  return (
    <div className="w-full space-y-6">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
          transition-all duration-300 group
          ${isDragging 
            ? 'border-violet-500 bg-violet-50 scale-[1.02]' 
            : 'border-slate-300 hover:border-violet-400 hover:bg-slate-50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={[
            ...ACCEPTED_FORMATS.video,
            ...ACCEPTED_FORMATS.image,
            ...ACCEPTED_FORMATS.audio,
            ...ACCEPTED_FORMATS.html5
          ].join(',')}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        {/* Center Icon */}
        <div className={`
          w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center
          transition-all duration-300
          ${isDragging 
            ? 'bg-violet-500 text-white scale-110' 
            : 'bg-gradient-to-br from-violet-500 to-indigo-600 text-white group-hover:scale-105'
          }
        `}>
          <Upload className="w-10 h-10" />
        </div>

        <h3 className="text-xl font-bold text-slate-800 mb-2">
          {isDragging ? '¡Suelta aquí!' : 'Arrastra tus activos digitales'}
        </h3>
        <p className="text-slate-500 mb-4">
          o haz clic para seleccionar archivos
        </p>

        {/* Accepted formats */}
        <div className="flex flex-wrap justify-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
            <Video className="w-3 h-3" /> MP4, WebM, MOV
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-xs font-medium">
            <Image className="w-3 h-3" /> JPG, PNG, WebP, GIF
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 rounded-full text-xs font-medium">
            <Music className="w-3 h-3" /> MP3, WAV, AAC
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 text-violet-700 rounded-full text-xs font-medium">
            <Code className="w-3 h-3" /> HTML5
          </div>
        </div>
      </div>

      {/* Uploaded Assets */}
      {assets.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-slate-800">
              Activos Cargados ({assets.length})
            </h4>
            <button
              onClick={generateAdaptations}
              disabled={isGeneratingAdaptations}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 
                         text-white text-sm font-medium rounded-xl hover:shadow-lg transition-all
                         disabled:opacity-50 disabled:cursor-wait"
            >
              {isGeneratingAdaptations ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generando...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generar Adaptaciones IA
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assets.map(asset => (
              <div
                key={asset.id}
                className="relative bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Preview */}
                <div className="relative h-32 bg-slate-100">
                  {asset.preview && asset.tipo.includes('VIDEO') && (
                    <video
                      src={asset.preview}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {asset.preview && (asset.tipo.includes('BANNER') || asset.tipo.includes('IMAGE')) && (
                    <NextImage
                      src={asset.preview}
                      alt={asset.file.name}
                      fill
                      className="object-contain"
                      sizes="96px"
                    />
                  )}
                  {asset.tipo.includes('AUDIO') && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500">
                      <Music className="w-12 h-12 text-white" />
                    </div>
                  )}

                  {/* Status overlay */}
                  {asset.status !== 'ready' && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mb-2" />
                      <span className="text-sm">
                        {asset.status === 'uploading' && `Subiendo... ${asset.progress}%`}
                        {asset.status === 'processing' && 'Procesando...'}
                        {asset.status === 'validating' && 'Validando con IA...'}
                      </span>
                    </div>
                  )}

                  {/* Remove button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); removeAsset(asset.id); }}
                    aria-label="Eliminar"
                    className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full
                               flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  {/* Type badge */}
                  <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded-lg flex items-center gap-1">
                    {getAssetIcon(asset.tipo)}
                    {asset.tipo.replace(/_/g, ' ')}
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h5 className="font-medium text-slate-800 truncate mb-1">
                    {asset.file.name}
                  </h5>
                  <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                    <span>{formatSize(asset.size)}</span>
                    {asset.dimensions && (
                      <span>{asset.dimensions.width}x{asset.dimensions.height}</span>
                    )}
                    {asset.duration !== undefined && (
                      <span>{formatDuration(asset.duration)}</span>
                    )}
                  </div>

                  {/* Validation Score */}
                  {asset.validationScore !== undefined && (
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${
                            asset.validationScore >= 80 ? 'bg-emerald-500' :
                            asset.validationScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${asset.validationScore}%` }}
                        />
                      </div>
                      <span className="text-xs font-bold text-slate-600">
                        {asset.validationScore}%
                      </span>
                      {asset.validationScore >= 80 ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500" />
                      )}
                    </div>
                  )}

                  {/* Adaptations */}
                  {asset.adaptations && asset.adaptations.length > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-xs font-medium text-violet-600">
                        <Sparkles className="w-3 h-3" />
                        Adaptaciones IA generadas:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {asset.adaptations.slice(0, 3).map((adapt, idx) => (
                          <span 
                            key={idx}
                            className="px-2 py-0.5 bg-violet-50 text-violet-700 text-xs rounded-full"
                          >
                            {adapt}
                          </span>
                        ))}
                        {asset.adaptations.length > 3 && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded-full">
                            +{asset.adaptations.length - 3} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Device Preview Suggestion */}
      {assets.length > 0 && (
        <div className="flex items-center justify-center gap-4 p-4 bg-slate-50 rounded-xl">
          <span className="text-sm text-slate-500">Vista previa en:</span>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-violet-400 transition-colors">
            <Smartphone className="w-4 h-4 text-slate-500" /> Móvil
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-violet-400 transition-colors">
            <Monitor className="w-4 h-4 text-slate-500" /> Desktop
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm hover:border-violet-400 transition-colors">
            <Tv className="w-4 h-4 text-slate-500" /> Smart TV
          </button>
        </div>
      )}
    </div>
  );
};

export default DigitalAssetUploader;
