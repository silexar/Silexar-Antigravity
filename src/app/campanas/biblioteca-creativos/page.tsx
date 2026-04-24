/**
 * 🎨 SILEXAR PULSE - Biblioteca de Creativos (DAM) 2050
 * 
 * @description Sistema enterprise centralizado para gestionar todos
 * los activos creativos digitales con versionado, metadata,
 * gestión de derechos y métricas de uso.
 * 
 * @version 2050.1.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import {
  Search,
  Folder,
  FolderOpen,
  FileImage,
  FileAudio,
  FileVideo,
  FileCode,
  Upload,
  Download,
  Eye,
  History,
  Grid,
  List,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Copy,
  Plus,
  ChevronRight,
  Image as ImageIcon,
  X
} from 'lucide-react';

import { NeoPageHeader, NeoCard, NeoButton, NeoInput, NeoSelect, NeoBadge, N } from '../_lib/neumorphic';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

export type TipoCreativoDAM = 'banner' | 'audio' | 'video' | 'html5' | 'documento';

export interface CreativoDAM {
  id: string;
  nombre: string;
  tipo: TipoCreativoDAM;
  formato: string;
  dimensiones?: { width: number; height: number };
  duracion?: number;
  tamanoBytes: number;
  url: string;
  thumbnailUrl?: string;
  
  // Organización
  carpetaId: string;
  carpetaNombre: string;
  tags: string[];
  
  // Versionado
  version: number;
  versionAnteriorId?: string;
  esUltimaVersion: boolean;
  
  // Estado y aprobación
  estado: 'borrador' | 'qa_pendiente' | 'cliente_pendiente' | 'aprobado' | 'rechazado';
  aprobadoQA: boolean;
  aprobadoCliente: boolean;
  
  // Derechos
  licenciaTipo?: string;
  licenciaExpira?: string;
  modeloContratoFirmado?: boolean;
  
  // Métricas
  impresiones: number;
  clicks: number;
  campanasUsado: number;
  
  // Auditoría
  subidoPor: string;
  fechaSubida: string;
  modificadoPor?: string;
  fechaModificacion?: string;
}

export interface CarpetaDAM {
  id: string;
  nombre: string;
  parentId?: string;
  iconoColor: string;
  creativosCount: number;
  subcarpetas?: CarpetaDAM[];
}

// ═══════════════════════════════════════════════════════════════
// DATOS MOCK
// ═══════════════════════════════════════════════════════════════

const CARPETAS_MOCK: CarpetaDAM[] = [
  { 
    id: 'folder_banners', 
    nombre: 'Banners', 
    iconoColor: 'bg-blue-500',
    creativosCount: 24,
    subcarpetas: [
      { id: 'folder_300x250', nombre: '300x250', iconoColor: 'bg-blue-400', creativosCount: 8 },
      { id: 'folder_728x90', nombre: '728x90', iconoColor: 'bg-blue-400', creativosCount: 6 },
      { id: 'folder_320x50', nombre: '320x50', iconoColor: 'bg-blue-400', creativosCount: 10 }
    ]
  },
  { 
    id: 'folder_audio', 
    nombre: 'Audio Ads', 
    iconoColor: 'bg-purple-500',
    creativosCount: 12,
    subcarpetas: [
      { id: 'folder_audio_15s', nombre: '15 segundos', iconoColor: 'bg-purple-400', creativosCount: 4 },
      { id: 'folder_audio_30s', nombre: '30 segundos', iconoColor: 'bg-purple-400', creativosCount: 8 }
    ]
  },
  { 
    id: 'folder_video', 
    nombre: 'Video Ads', 
    iconoColor: 'bg-red-500',
    creativosCount: 8
  },
  { 
    id: 'folder_html5', 
    nombre: 'HTML5', 
    iconoColor: 'bg-orange-500',
    creativosCount: 5
  }
];

const CREATIVOS_MOCK: CreativoDAM[] = [
  {
    id: 'cre_001',
    nombre: 'Banner_Verano_2025_v1.2',
    tipo: 'banner',
    formato: 'png',
    dimensiones: { width: 300, height: 250 },
    tamanoBytes: 45000,
    url: '/mock/banner1.png',
    thumbnailUrl: '/mock/thumb1.png',
    carpetaId: 'folder_300x250',
    carpetaNombre: '300x250',
    tags: ['verano', '2025', 'promocion'],
    version: 2,
    esUltimaVersion: true,
    estado: 'aprobado',
    aprobadoQA: true,
    aprobadoCliente: true,
    licenciaTipo: 'Uso interno',
    licenciaExpira: '2025-03-31',
    impresiones: 45320,
    clicks: 892,
    campanasUsado: 3,
    subidoPor: 'Ana García',
    fechaSubida: '2024-12-15T10:30:00Z'
  },
  {
    id: 'cre_002',
    nombre: 'Audio_Promo_Enero_30s',
    tipo: 'audio',
    formato: 'mp3',
    duracion: 30,
    tamanoBytes: 480000,
    url: '/mock/audio1.mp3',
    carpetaId: 'folder_audio_30s',
    carpetaNombre: '30 segundos',
    tags: ['enero', 'promocion', 'radio'],
    version: 1,
    esUltimaVersion: true,
    estado: 'cliente_pendiente',
    aprobadoQA: true,
    aprobadoCliente: false,
    impresiones: 12500,
    clicks: 0,
    campanasUsado: 1,
    subidoPor: 'Carlos Pérez',
    fechaSubida: '2024-12-20T14:15:00Z'
  },
  {
    id: 'cre_003',
    nombre: 'Video_Institucional_15s',
    tipo: 'video',
    formato: 'mp4',
    dimensiones: { width: 1920, height: 1080 },
    duracion: 15,
    tamanoBytes: 5200000,
    url: '/mock/video1.mp4',
    thumbnailUrl: '/mock/thumb_video1.jpg',
    carpetaId: 'folder_video',
    carpetaNombre: 'Video Ads',
    tags: ['institucional', 'corporativo'],
    version: 3,
    esUltimaVersion: true,
    estado: 'aprobado',
    aprobadoQA: true,
    aprobadoCliente: true,
    modeloContratoFirmado: true,
    impresiones: 28900,
    clicks: 1230,
    campanasUsado: 2,
    subidoPor: 'María López',
    fechaSubida: '2024-12-10T09:00:00Z'
  },
  {
    id: 'cre_004',
    nombre: 'Banner_BlackFriday_728x90',
    tipo: 'banner',
    formato: 'gif',
    dimensiones: { width: 728, height: 90 },
    tamanoBytes: 120000,
    url: '/mock/banner2.gif',
    thumbnailUrl: '/mock/thumb2.gif',
    carpetaId: 'folder_728x90',
    carpetaNombre: '728x90',
    tags: ['blackfriday', 'promo', 'animado'],
    version: 1,
    esUltimaVersion: true,
    estado: 'qa_pendiente',
    aprobadoQA: false,
    aprobadoCliente: false,
    impresiones: 0,
    clicks: 0,
    campanasUsado: 0,
    subidoPor: 'Pedro Soto',
    fechaSubida: '2024-12-27T11:45:00Z'
  }
];

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function BibliotecaCreativos() {
  const [carpetaSeleccionada, setCarpetaSeleccionada] = useState<string | null>(null);
  const [creativoSeleccionado, setCreativoSeleccionado] = useState<CreativoDAM | null>(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [vistaGrid, setVistaGrid] = useState(true);
  const [panelDetalle, setPanelDetalle] = useState(false);

  // Filtrar creativos
  const creativosFiltrados = useMemo(() => {
    return CREATIVOS_MOCK.filter(c => {
      if (busqueda && !c.nombre.toLowerCase().includes(busqueda.toLowerCase())) {
        return false;
      }
      if (filtroTipo !== 'todos' && c.tipo !== filtroTipo) {
        return false;
      }
      if (filtroEstado !== 'todos' && c.estado !== filtroEstado) {
        return false;
      }
      if (carpetaSeleccionada && c.carpetaId !== carpetaSeleccionada) {
        return false;
      }
      return true;
    });
  }, [busqueda, filtroTipo, filtroEstado, carpetaSeleccionada]);

  // Obtener icono de tipo
  const getIconoTipo = (tipo: TipoCreativoDAM) => {
    switch (tipo) {
      case 'banner': return <FileImage className="w-5 h-5" style={{ color: N.accent }} />;
      case 'audio': return <FileAudio className="w-5 h-5" style={{ color: '#a855f7' }} />;
      case 'video': return <FileVideo className="w-5 h-5" style={{ color: '#ef4444' }} />;
      case 'html5': return <FileCode className="w-5 h-5" style={{ color: '#f59e0b' }} />;
      default: return <FileImage className="w-5 h-5" style={{ color: N.textSub }} />;
    }
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <NeoBadge color="green"><CheckCircle2 className="w-3 h-3" />Aprobado</NeoBadge>;
      case 'qa_pendiente':
        return <NeoBadge color="yellow"><Clock className="w-3 h-3" />QA Pendiente</NeoBadge>;
      case 'cliente_pendiente':
        return <NeoBadge color="blue"><Clock className="w-3 h-3" />Cliente Pendiente</NeoBadge>;
      case 'rechazado':
        return <NeoBadge color="red"><AlertTriangle className="w-3 h-3" />Rechazado</NeoBadge>;
      default:
        return <NeoBadge color="gray">Borrador</NeoBadge>;
    }
  };

  // Formatear tamaño
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Abrir detalle
  const abrirDetalle = (creativo: CreativoDAM) => {
    setCreativoSeleccionado(creativo);
    setPanelDetalle(true);
  };

  const cerrarDetalle = () => {
    setPanelDetalle(false);
    setCreativoSeleccionado(null);
  };

  return (
    <div className="min-h-screen p-6" style={{ background: N.base }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        <NeoPageHeader
          title="Biblioteca de Creativos"
          subtitle="DAM centralizado con versionado y métricas"
          icon={ImageIcon}
          backHref="/campanas"
        />

        <div className="flex justify-end">
          <NeoButton variant="primary">
            <Upload className="w-4 h-4" />
            Subir Creativo
          </NeoButton>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* SIDEBAR: CARPETAS */}
          <div className="col-span-3">
            <NeoCard padding="small">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-black flex items-center gap-2" style={{ color: N.text }}>
                  <Folder className="w-4 h-4" />
                  Carpetas
                </h3>
                <NeoButton variant="ghost" size="icon">
                  <Plus className="w-4 h-4" />
                </NeoButton>
              </div>

              <div className="space-y-1">
                <div
                  className="p-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                  style={{
                    background: !carpetaSeleccionada ? N.base : 'transparent',
                    boxShadow: !carpetaSeleccionada ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` : 'none',
                    color: !carpetaSeleccionada ? N.accent : N.text
                  }}
                  onClick={() => setCarpetaSeleccionada(null)}
                >
                  <div className="flex items-center gap-2">
                    <FolderOpen className="w-4 h-4" />
                    <span className="text-sm font-bold">Todos los creativos</span>
                  </div>
                  <span className="text-xs font-bold" style={{ color: N.textSub }}>{CREATIVOS_MOCK.length}</span>
                </div>

                {CARPETAS_MOCK.map(carpeta => (
                  <div key={carpeta.id}>
                    <div
                      className="p-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                      style={{
                        background: carpetaSeleccionada === carpeta.id ? N.base : 'transparent',
                        boxShadow: carpetaSeleccionada === carpeta.id ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` : 'none',
                        color: carpetaSeleccionada === carpeta.id ? N.accent : N.text
                      }}
                      onClick={() => setCarpetaSeleccionada(carpeta.id)}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${carpeta.iconoColor}`}></div>
                        <span className="text-sm font-bold">{carpeta.nombre}</span>
                      </div>
                      <span className="text-xs font-bold" style={{ color: N.textSub }}>{carpeta.creativosCount}</span>
                    </div>

                    {carpeta.subcarpetas && (
                      <div className="ml-4 space-y-1 mt-1">
                        {carpeta.subcarpetas.map(sub => (
                          <div
                            key={sub.id}
                            className="p-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                            style={{
                              background: carpetaSeleccionada === sub.id ? N.base : 'transparent',
                              boxShadow: carpetaSeleccionada === sub.id ? `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` : 'none',
                              color: carpetaSeleccionada === sub.id ? N.accent : N.text
                            }}
                            onClick={() => setCarpetaSeleccionada(sub.id)}
                          >
                            <div className="flex items-center gap-2">
                              <ChevronRight className="w-3 h-3" style={{ color: N.textSub }} />
                              <span className="text-sm">{sub.nombre}</span>
                            </div>
                            <span className="text-xs font-bold" style={{ color: N.textSub }}>{sub.creativosCount}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </NeoCard>
          </div>

          {/* CONTENIDO PRINCIPAL */}
          <div className="col-span-9">
            {/* Filtros */}
            <NeoCard padding="small" className="mb-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: N.textSub }} />
                  <NeoInput
                    placeholder="Buscar creativos..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <NeoSelect value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)} className="w-40">
                  <option value="todos">Todos los tipos</option>
                  <option value="banner">Banners</option>
                  <option value="audio">Audio</option>
                  <option value="video">Video</option>
                  <option value="html5">HTML5</option>
                </NeoSelect>

                <NeoSelect value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="w-44">
                  <option value="todos">Todos los estados</option>
                  <option value="aprobado">Aprobados</option>
                  <option value="qa_pendiente">Pendiente QA</option>
                  <option value="cliente_pendiente">Pendiente Cliente</option>
                  <option value="rechazado">Rechazados</option>
                </NeoSelect>

                <div className="flex rounded-xl overflow-hidden" style={{ boxShadow: `4px 4px 8px ${N.dark}, -4px -4px 8px ${N.light}` }}>
                  <button
                    className="h-9 w-9 flex items-center justify-center transition-all"
                    style={{
                      background: vistaGrid ? N.accent : N.base,
                      color: vistaGrid ? '#fff' : N.textSub
                    }}
                    onClick={() => setVistaGrid(true)}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    className="h-9 w-9 flex items-center justify-center transition-all"
                    style={{
                      background: !vistaGrid ? N.accent : N.base,
                      color: !vistaGrid ? '#fff' : N.textSub
                    }}
                    onClick={() => setVistaGrid(false)}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </NeoCard>

            {/* Grid de creativos */}
            {vistaGrid ? (
              <div className="grid grid-cols-4 gap-4">
                {creativosFiltrados.map(creativo => (
                  <NeoCard
                    key={creativo.id}
                    padding="small"
                    className="cursor-pointer group relative transition-all hover:scale-[1.02]"
                    onClick={() => abrirDetalle(creativo)}
                  >
                    {/* Thumbnail */}
                    <div className="aspect-video rounded-xl mb-3 flex items-center justify-center overflow-hidden relative" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}>
                      {creativo.tipo === 'banner' && creativo.thumbnailUrl ? (
                        <Image
                          src={creativo.thumbnailUrl}
                          alt={creativo.nombre}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 50vw, 300px"
                        />
                      ) : (
                        getIconoTipo(creativo.tipo)
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-2">
                      <h4 className="font-bold text-sm truncate" style={{ color: N.text }}>{creativo.nombre}</h4>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase" style={{ color: N.textSub }}>{creativo.formato}</span>
                        <span className="text-xs font-bold" style={{ color: N.textSub }}>{formatSize(creativo.tamanoBytes)}</span>
                      </div>
                      {getEstadoBadge(creativo.estado)}
                    </div>

                    {/* Hover actions */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <NeoButton variant="secondary" size="icon">
                        <Eye className="w-3 h-3" />
                      </NeoButton>
                    </div>
                  </NeoCard>
                ))}
              </div>
            ) : (
              <NeoCard padding="small">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${N.dark}40` }}>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Nombre</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Tipo</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Formato</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Tamaño</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Estado</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Métricas</th>
                      <th className="pb-2 text-left text-xs font-black uppercase tracking-wider" style={{ color: N.textSub }}>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {creativosFiltrados.map(creativo => (
                      <tr 
                        key={creativo.id} 
                        className="cursor-pointer transition-colors"
                        style={{ borderBottom: `1px solid ${N.dark}30` }}
                        onClick={() => abrirDetalle(creativo)}
                      >
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            {getIconoTipo(creativo.tipo)}
                            <span className="font-bold text-sm" style={{ color: N.text }}>{creativo.nombre}</span>
                          </div>
                        </td>
                        <td className="py-3 text-sm" style={{ color: N.textSub }}>{creativo.tipo}</td>
                        <td className="py-3 text-sm font-bold uppercase" style={{ color: N.textSub }}>{creativo.formato}</td>
                        <td className="py-3 text-sm" style={{ color: N.textSub }}>{formatSize(creativo.tamanoBytes)}</td>
                        <td className="py-3">{getEstadoBadge(creativo.estado)}</td>
                        <td className="py-3 text-sm" style={{ color: N.textSub }}>
                          {creativo.impresiones.toLocaleString()} imp
                        </td>
                        <td className="py-3">
                          <div className="flex gap-1">
                            <NeoButton variant="ghost" size="icon">
                              <Eye className="w-3 h-3" />
                            </NeoButton>
                            <NeoButton variant="ghost" size="icon">
                              <Download className="w-3 h-3" />
                            </NeoButton>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </NeoCard>
            )}
          </div>
        </div>

        {/* Panel de detalle inline (sin modal bloqueante) */}
        {panelDetalle && creativoSeleccionado && (
          <div className="fixed inset-0 z-50 flex items-start justify-end pt-20 pr-6">
            <div className="absolute inset-0" onClick={cerrarDetalle} />
            <NeoCard className="relative w-full max-w-2xl max-h-[80vh] overflow-auto" style={{ zIndex: 10 }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getIconoTipo(creativoSeleccionado.tipo)}
                  <h3 className="font-black text-lg" style={{ color: N.text }}>{creativoSeleccionado.nombre}</h3>
                </div>
                <NeoButton variant="ghost" size="icon" onClick={cerrarDetalle}>
                  <X className="w-4 h-4" />
                </NeoButton>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Preview */}
                <div className="aspect-video rounded-2xl flex items-center justify-center" style={{ background: N.base, boxShadow: `inset 4px 4px 8px ${N.dark}, inset -4px -4px 8px ${N.light}` }}>
                  {creativoSeleccionado.tipo === 'banner' ? (
                    <FileImage className="w-16 h-16" style={{ color: N.textSub }} />
                  ) : creativoSeleccionado.tipo === 'audio' ? (
                    <FileAudio className="w-16 h-16" style={{ color: N.textSub }} />
                  ) : (
                    <FileVideo className="w-16 h-16" style={{ color: N.textSub }} />
                  )}
                </div>

                {/* Info */}
                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Información</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><span style={{ color: N.textSub }}>Formato:</span> <span className="font-bold uppercase" style={{ color: N.text }}>{creativoSeleccionado.formato}</span></div>
                      <div><span style={{ color: N.textSub }}>Tamaño:</span> <span className="font-bold" style={{ color: N.text }}>{formatSize(creativoSeleccionado.tamanoBytes)}</span></div>
                      {creativoSeleccionado.dimensiones && (
                        <div>
                          <span style={{ color: N.textSub }}>Dimensiones:</span> <span className="font-bold" style={{ color: N.text }}>{creativoSeleccionado.dimensiones.width}x{creativoSeleccionado.dimensiones.height}</span>
                        </div>
                      )}
                      {creativoSeleccionado.duracion && (
                        <div><span style={{ color: N.textSub }}>Duración:</span> <span className="font-bold" style={{ color: N.text }}>{creativoSeleccionado.duracion}s</span></div>
                      )}
                      <div><span style={{ color: N.textSub }}>Versión:</span> <span className="font-bold" style={{ color: N.text }}>v{creativoSeleccionado.version}</span></div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Estado</h4>
                    {getEstadoBadge(creativoSeleccionado.estado)}
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider mb-2" style={{ color: N.textSub }}>Métricas</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}>
                        <p className="text-lg font-black" style={{ color: N.accent }}>{creativoSeleccionado.impresiones.toLocaleString()}</p>
                        <p className="text-xs font-bold" style={{ color: N.textSub }}>Impresiones</p>
                      </div>
                      <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}>
                        <p className="text-lg font-black" style={{ color: '#22c55e' }}>{creativoSeleccionado.clicks.toLocaleString()}</p>
                        <p className="text-xs font-bold" style={{ color: N.textSub }}>Clicks</p>
                      </div>
                      <div className="p-2 rounded-xl text-center" style={{ background: N.base, boxShadow: `inset 3px 3px 6px ${N.dark}, inset -3px -3px 6px ${N.light}` }}>
                        <p className="text-lg font-black" style={{ color: '#a855f7' }}>{creativoSeleccionado.campanasUsado}</p>
                        <p className="text-xs font-bold" style={{ color: N.textSub }}>Campañas</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <NeoButton variant="secondary" className="flex-1">
                      <Download className="w-4 h-4" />
                      Descargar
                    </NeoButton>
                    <NeoButton variant="secondary" className="flex-1">
                      <History className="w-4 h-4" />
                      Versiones
                    </NeoButton>
                    <NeoButton variant="primary" className="flex-1">
                      <Copy className="w-4 h-4" />
                      Usar en Campaña
                    </NeoButton>
                  </div>
                </div>
              </div>
            </NeoCard>
          </div>
        )}
      </div>
    </div>
  );
}
