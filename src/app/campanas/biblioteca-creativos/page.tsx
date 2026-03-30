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
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Image
} from 'lucide-react';

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
  const [dialogoDetalle, setDialogoDetalle] = useState(false);

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
      case 'banner': return <FileImage className="w-5 h-5 text-blue-500" />;
      case 'audio': return <FileAudio className="w-5 h-5 text-purple-500" />;
      case 'video': return <FileVideo className="w-5 h-5 text-red-500" />;
      case 'html5': return <FileCode className="w-5 h-5 text-orange-500" />;
      default: return <FileImage className="w-5 h-5 text-gray-500" />;
    }
  };

  // Obtener badge de estado
  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'aprobado':
        return <Badge className="bg-green-100 text-green-700"><CheckCircle2 className="w-3 h-3 mr-1" />Aprobado</Badge>;
      case 'qa_pendiente':
        return <Badge className="bg-amber-100 text-amber-700"><Clock className="w-3 h-3 mr-1" />QA Pendiente</Badge>;
      case 'cliente_pendiente':
        return <Badge className="bg-blue-100 text-blue-700"><Clock className="w-3 h-3 mr-1" />Cliente Pendiente</Badge>;
      case 'rechazado':
        return <Badge className="bg-red-100 text-red-700"><AlertTriangle className="w-3 h-3 mr-1" />Rechazado</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-700">Borrador</Badge>;
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
    setDialogoDetalle(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Image className="w-7 h-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">🎨 Biblioteca de Creativos</h1>
            <p className="text-gray-500">DAM centralizado con versionado y métricas</p>
          </div>
        </div>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600">
          <Upload className="w-4 h-4" />
          Subir Creativo
        </Button>
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* SIDEBAR: CARPETAS */}
        <div className="col-span-3">
          <Card className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Folder className="w-4 h-4" />
                Carpetas
              </h3>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-1">
              <div
                className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                  !carpetaSeleccionada ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                }`}
                onClick={() => setCarpetaSeleccionada(null)}
              >
                <div className="flex items-center gap-2">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm font-medium">Todos los creativos</span>
                </div>
                <span className="text-xs text-gray-500">{CREATIVOS_MOCK.length}</span>
              </div>

              {CARPETAS_MOCK.map(carpeta => (
                <div key={carpeta.id}>
                  <div
                    className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                      carpetaSeleccionada === carpeta.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setCarpetaSeleccionada(carpeta.id)}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded ${carpeta.iconoColor}`}></div>
                      <span className="text-sm font-medium">{carpeta.nombre}</span>
                    </div>
                    <span className="text-xs text-gray-500">{carpeta.creativosCount}</span>
                  </div>

                  {carpeta.subcarpetas && (
                    <div className="ml-4 space-y-1 mt-1">
                      {carpeta.subcarpetas.map(sub => (
                        <div
                          key={sub.id}
                          className={`p-2 rounded-lg cursor-pointer flex items-center justify-between transition-colors ${
                            carpetaSeleccionada === sub.id ? 'bg-purple-100 text-purple-700' : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setCarpetaSeleccionada(sub.id)}
                        >
                          <div className="flex items-center gap-2">
                            <ChevronRight className="w-3 h-3 text-gray-400" />
                            <span className="text-sm">{sub.nombre}</span>
                          </div>
                          <span className="text-xs text-gray-500">{sub.creativosCount}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CONTENIDO PRINCIPAL */}
        <div className="col-span-9">
          {/* Filtros */}
          <Card className="p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Buscar creativos..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los tipos</SelectItem>
                  <SelectItem value="banner">Banners</SelectItem>
                  <SelectItem value="audio">Audio</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="html5">HTML5</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={setFiltroEstado}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="aprobado">Aprobados</SelectItem>
                  <SelectItem value="qa_pendiente">Pendiente QA</SelectItem>
                  <SelectItem value="cliente_pendiente">Pendiente Cliente</SelectItem>
                  <SelectItem value="rechazado">Rechazados</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border rounded-lg">
                <Button
                  variant={vistaGrid ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-r-none"
                  onClick={() => setVistaGrid(true)}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={!vistaGrid ? "default" : "ghost"}
                  size="icon"
                  className="h-9 w-9 rounded-l-none"
                  onClick={() => setVistaGrid(false)}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </Card>

          {/* Grid de creativos */}
          {vistaGrid ? (
            <div className="grid grid-cols-4 gap-4">
              {creativosFiltrados.map(creativo => (
                <Card
                  key={creativo.id}
                  className="p-3 hover:shadow-lg transition-all cursor-pointer group"
                  onClick={() => abrirDetalle(creativo)}
                >
                  {/* Thumbnail */}
                  <div className="aspect-video bg-gray-100 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    {creativo.tipo === 'banner' && creativo.thumbnailUrl ? (
                      <img src={creativo.thumbnailUrl} alt={creativo.nombre} className="object-cover" />
                    ) : (
                      getIconoTipo(creativo.tipo)
                    )}
                  </div>

                  {/* Info */}
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900 truncate">{creativo.nombre}</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">{creativo.formato.toUpperCase()}</span>
                      <span className="text-xs text-gray-500">{formatSize(creativo.tamanoBytes)}</span>
                    </div>
                    {getEstadoBadge(creativo.estado)}
                  </div>

                  {/* Hover actions */}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="secondary" size="icon" className="h-7 w-7">
                      <Eye className="w-3 h-3" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-4">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b">
                    <th className="pb-2">Nombre</th>
                    <th className="pb-2">Tipo</th>
                    <th className="pb-2">Formato</th>
                    <th className="pb-2">Tamaño</th>
                    <th className="pb-2">Estado</th>
                    <th className="pb-2">Métricas</th>
                    <th className="pb-2">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {creativosFiltrados.map(creativo => (
                    <tr 
                      key={creativo.id} 
                      className="border-b hover:bg-gray-50 cursor-pointer"
                      onClick={() => abrirDetalle(creativo)}
                    >
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          {getIconoTipo(creativo.tipo)}
                          <span className="font-medium text-sm">{creativo.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 text-sm text-gray-600">{creativo.tipo}</td>
                      <td className="py-3 text-sm text-gray-600">{creativo.formato.toUpperCase()}</td>
                      <td className="py-3 text-sm text-gray-600">{formatSize(creativo.tamanoBytes)}</td>
                      <td className="py-3">{getEstadoBadge(creativo.estado)}</td>
                      <td className="py-3 text-sm text-gray-600">
                        {creativo.impresiones.toLocaleString()} imp
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Eye className="w-3 h-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Download className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </div>
      </div>

      {/* Diálogo de detalle */}
      <Dialog open={dialogoDetalle} onOpenChange={setDialogoDetalle}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {creativoSeleccionado && getIconoTipo(creativoSeleccionado.tipo)}
              {creativoSeleccionado?.nombre}
            </DialogTitle>
          </DialogHeader>

          {creativoSeleccionado && (
            <div className="grid grid-cols-2 gap-6">
              {/* Preview */}
              <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                {creativoSeleccionado.tipo === 'banner' ? (
                  <FileImage className="w-16 h-16 text-gray-400" />
                ) : creativoSeleccionado.tipo === 'audio' ? (
                  <FileAudio className="w-16 h-16 text-gray-400" />
                ) : (
                  <FileVideo className="w-16 h-16 text-gray-400" />
                )}
              </div>

              {/* Info */}
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Información</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div><span className="text-gray-500">Formato:</span> {creativoSeleccionado.formato.toUpperCase()}</div>
                    <div><span className="text-gray-500">Tamaño:</span> {formatSize(creativoSeleccionado.tamanoBytes)}</div>
                    {creativoSeleccionado.dimensiones && (
                      <div>
                        <span className="text-gray-500">Dimensiones:</span> {creativoSeleccionado.dimensiones.width}x{creativoSeleccionado.dimensiones.height}
                      </div>
                    )}
                    {creativoSeleccionado.duracion && (
                      <div><span className="text-gray-500">Duración:</span> {creativoSeleccionado.duracion}s</div>
                    )}
                    <div><span className="text-gray-500">Versión:</span> v{creativoSeleccionado.version}</div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Estado</h4>
                  {getEstadoBadge(creativoSeleccionado.estado)}
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Métricas</h4>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-blue-50 rounded text-center">
                      <p className="text-lg font-bold text-blue-700">{creativoSeleccionado.impresiones.toLocaleString()}</p>
                      <p className="text-xs text-blue-600">Impresiones</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-lg font-bold text-green-700">{creativoSeleccionado.clicks.toLocaleString()}</p>
                      <p className="text-xs text-green-600">Clicks</p>
                    </div>
                    <div className="p-2 bg-purple-50 rounded text-center">
                      <p className="text-lg font-bold text-purple-700">{creativoSeleccionado.campanasUsado}</p>
                      <p className="text-xs text-purple-600">Campañas</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 gap-1">
                    <Download className="w-4 h-4" />
                    Descargar
                  </Button>
                  <Button variant="outline" className="flex-1 gap-1">
                    <History className="w-4 h-4" />
                    Versiones
                  </Button>
                  <Button className="flex-1 gap-1">
                    <Copy className="w-4 h-4" />
                    Usar en Campaña
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
