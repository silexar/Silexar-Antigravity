/**
 * 📂 SILEXAR PULSE - Visor de Documentación del Contrato TIER 0
 * 
 * @description Página completa para visualizar toda la documentación
 * adjunta a un contrato. Accesible por cualquier usuario con permisos.
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Mail,
  Image,
  File,
  Paperclip,
  Download,
  Eye,
  Trash2,
  Search,
  User,
  MoreHorizontal,
  Grid,
  List,
  Upload,
  Sparkles,
  ExternalLink,
  Share2,
  Lock,
  FolderOpen
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

type TipoDocumento = 
  | 'EMAIL' 
  | 'COTIZACION' 
  | 'ORDEN_COMPRA' 
  | 'VOUCHER' 
  | 'BRIEF' 
  | 'PROPUESTA'
  | 'CONTRATO' 
  | 'FACTURA'
  | 'ANEXO'
  | 'MATERIAL'
  | 'OTRO';

type CategoriaDocumento = 
  | 'NEGOCIACION'
  | 'COMERCIAL'
  | 'LEGAL'
  | 'FACTURACION'
  | 'OPERACIONES'
  | 'MATERIAL_CREATIVO';

interface DocumentoContrato {
  id: string;
  nombre: string;
  tipo: TipoDocumento;
  categoria: CategoriaDocumento;
  tamaño: number;
  extension: string;
  url: string;
  thumbnailUrl?: string;
  
  // Metadatos
  subidoPor: { id: string; nombre: string; avatar?: string };
  fechaSubida: Date;
  fechaModificacion?: Date;
  version: number;
  
  // Email específico
  emailDe?: string;
  emailAsunto?: string;
  
  // IA
  procesadoPorIA: boolean;
  datosExtraidos?: Record<string, unknown>;
  
  // Permisos
  publico: boolean;
  soloLectura: boolean;
  
  // Estado
  activo: boolean;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS NEUROMORPHIC
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-slate-50 to-slate-100
    rounded-3xl
    shadow-[8px_8px_16px_#d1d5db,-8px_-8px_16px_#ffffff]
    border border-slate-200/50
  `,
  card: `
    bg-gradient-to-br from-white to-slate-50
    rounded-2xl
    shadow-[6px_6px_12px_#d1d5db,-6px_-6px_12px_#ffffff]
    border border-slate-200/30
    hover:shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    transition-all duration-200
  `,
  input: `
    bg-gradient-to-br from-slate-100 to-slate-50
    rounded-xl
    shadow-[inset_3px_3px_6px_#d1d5db,inset_-3px_-3px_6px_#ffffff]
    border-none
    focus:ring-2 focus:ring-indigo-400/50 focus:outline-none
  `,
  btnPrimary: `
    bg-gradient-to-br from-indigo-500 to-purple-600
    text-white font-semibold rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  btnSecondary: `
    bg-gradient-to-br from-slate-50 to-slate-100
    text-slate-700 font-medium rounded-xl
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    transition-all duration-200
  `,
  badge: `
    px-3 py-1 rounded-lg
    shadow-[2px_2px_4px_#d1d5db,-2px_-2px_4px_#ffffff]
    text-xs font-medium
  `,
  tab: `
    px-4 py-2 rounded-xl font-medium transition-all duration-200
  `,
  tabActive: `
    bg-gradient-to-br from-indigo-500 to-purple-600 text-white
    shadow-[4px_4px_8px_#d1d5db,-4px_-4px_8px_#ffffff]
  `,
  tabInactive: `
    text-slate-500 hover:text-slate-700 hover:bg-slate-100
  `
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockDocumentos: DocumentoContrato[] = [
  {
    id: 'doc-001',
    nombre: 'Email - Negociación inicial Banco Chile',
    tipo: 'EMAIL',
    categoria: 'NEGOCIACION',
    tamaño: 45000,
    extension: 'eml',
    url: '#',
    subidoPor: { id: 'u-001', nombre: 'Carlos Mendoza' },
    fechaSubida: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    version: 1,
    emailDe: 'contacto@bancochile.cl',
    emailAsunto: 'RE: Propuesta comercial Q1 2025',
    procesadoPorIA: true,
    datosExtraidos: { valorMencionado: 80000000, medios: ['RADIO', 'DIGITAL'] },
    publico: false,
    soloLectura: false,
    activo: true
  },
  {
    id: 'doc-002',
    nombre: 'Cotización oficial Q1 2025.pdf',
    tipo: 'COTIZACION',
    categoria: 'COMERCIAL',
    tamaño: 256000,
    extension: 'pdf',
    url: '#',
    thumbnailUrl: '/api/thumbnails/doc-002',
    subidoPor: { id: 'u-001', nombre: 'Carlos Mendoza' },
    fechaSubida: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    version: 2,
    procesadoPorIA: true,
    publico: true,
    soloLectura: true,
    activo: true
  },
  {
    id: 'doc-003',
    nombre: 'Orden de Compra #45678.pdf',
    tipo: 'ORDEN_COMPRA',
    categoria: 'COMERCIAL',
    tamaño: 189000,
    extension: 'pdf',
    url: '#',
    subidoPor: { id: 'u-002', nombre: 'Ana García' },
    fechaSubida: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    version: 1,
    procesadoPorIA: true,
    datosExtraidos: { valorAprobado: 80000000, oc: '45678' },
    publico: true,
    soloLectura: true,
    activo: true
  },
  {
    id: 'doc-004',
    nombre: 'Brief campaña verano 2025.docx',
    tipo: 'BRIEF',
    categoria: 'OPERACIONES',
    tamaño: 524000,
    extension: 'docx',
    url: '#',
    subidoPor: { id: 'u-003', nombre: 'María López' },
    fechaSubida: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    version: 1,
    procesadoPorIA: false,
    publico: false,
    soloLectura: false,
    activo: true
  },
  {
    id: 'doc-005',
    nombre: 'Contrato firmado CTR-2025-001.pdf',
    tipo: 'CONTRATO',
    categoria: 'LEGAL',
    tamaño: 1250000,
    extension: 'pdf',
    url: '#',
    subidoPor: { id: 'u-004', nombre: 'Roberto Silva' },
    fechaSubida: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    version: 1,
    procesadoPorIA: false,
    publico: true,
    soloLectura: true,
    activo: true
  },
  {
    id: 'doc-006',
    nombre: 'Arte Radio - Spot 30 segundos.mp3',
    tipo: 'MATERIAL',
    categoria: 'MATERIAL_CREATIVO',
    tamaño: 2500000,
    extension: 'mp3',
    url: '#',
    subidoPor: { id: 'u-005', nombre: 'Pedro González' },
    fechaSubida: new Date(Date.now() - 12 * 60 * 60 * 1000),
    version: 3,
    procesadoPorIA: false,
    publico: true,
    soloLectura: false,
    activo: true
  }
];

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

const getTipoInfo = (tipo: TipoDocumento) => {
  const info: Record<TipoDocumento, { icon: React.ReactNode; color: string; label: string }> = {
    EMAIL: { icon: <Mail className="w-5 h-5" />, color: 'bg-red-100 text-red-600', label: 'Email' },
    COTIZACION: { icon: <FileText className="w-5 h-5" />, color: 'bg-green-100 text-green-600', label: 'Cotización' },
    ORDEN_COMPRA: { icon: <File className="w-5 h-5" />, color: 'bg-blue-100 text-blue-600', label: 'Orden de Compra' },
    VOUCHER: { icon: <File className="w-5 h-5" />, color: 'bg-amber-100 text-amber-600', label: 'Voucher' },
    BRIEF: { icon: <FileText className="w-5 h-5" />, color: 'bg-purple-100 text-purple-600', label: 'Brief' },
    PROPUESTA: { icon: <FileText className="w-5 h-5" />, color: 'bg-indigo-100 text-indigo-600', label: 'Propuesta' },
    CONTRATO: { icon: <FileText className="w-5 h-5" />, color: 'bg-slate-100 text-slate-600', label: 'Contrato' },
    FACTURA: { icon: <File className="w-5 h-5" />, color: 'bg-emerald-100 text-emerald-600', label: 'Factura' },
    ANEXO: { icon: <Paperclip className="w-5 h-5" />, color: 'bg-cyan-100 text-cyan-600', label: 'Anexo' },
    MATERIAL: { icon: <Image className="w-5 h-5" />, color: 'bg-pink-100 text-pink-600', label: 'Material' },
    OTRO: { icon: <File className="w-5 h-5" />, color: 'bg-slate-100 text-slate-500', label: 'Otro' }
  };
  return info[tipo] || info.OTRO;
};

const getCategoriaLabel = (cat: CategoriaDocumento) => {
  const labels: Record<CategoriaDocumento, string> = {
    NEGOCIACION: '🤝 Negociación',
    COMERCIAL: '💼 Comercial',
    LEGAL: '⚖️ Legal',
    FACTURACION: '🧾 Facturación',
    OPERACIONES: '📋 Operaciones',
    MATERIAL_CREATIVO: '🎨 Material Creativo'
  };
  return labels[cat];
};

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date: Date) => {
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Hoy';
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return date.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE DE TARJETA DE DOCUMENTO
// ═══════════════════════════════════════════════════════════════

const DocumentoCard: React.FC<{
  documento: DocumentoContrato;
  vista: 'grid' | 'lista';
  onView: (id: string) => void;
  onDownload: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ documento, vista, onView, onDownload, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const tipoInfo = getTipoInfo(documento.tipo);

  if (vista === 'grid') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`${neuro.card} p-4 cursor-pointer group`}
        onClick={() => onView(documento.id)}
      >
        {/* Thumbnail o Icono */}
        <div className={`h-32 rounded-xl mb-4 flex items-center justify-center ${tipoInfo.color}`}>
          <div className="text-4xl opacity-60">
            {tipoInfo.icon}
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="font-semibold text-slate-800 text-sm truncate mb-1" title={documento.nombre}>
            {documento.nombre}
          </p>
          
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>{formatSize(documento.tamaño)}</span>
            <span>•</span>
            <span>{formatDate(documento.fechaSubida)}</span>
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className={`${neuro.badge} ${tipoInfo.color} text-xs`}>
              {tipoInfo.label}
            </span>
            
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onDownload(documento.id); }}
                className="p-1.5 rounded-lg hover:bg-slate-100"
              >
                <Download className="w-4 h-4 text-slate-500" />
              </button>
              {documento.procesadoPorIA && (
                <Sparkles className="w-4 h-4 text-indigo-500" />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Vista lista
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className={`${neuro.card} p-4 flex items-center gap-4 cursor-pointer group`}
      onClick={() => onView(documento.id)}
    >
      {/* Icono */}
      <div className={`p-3 rounded-xl ${tipoInfo.color}`}>
        {tipoInfo.icon}
      </div>

      {/* Info principal */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-slate-800 truncate" title={documento.nombre}>
            {documento.nombre}
          </p>
          {documento.soloLectura && <Lock className="w-3.5 h-3.5 text-slate-400" />}
          {documento.procesadoPorIA && <Sparkles className="w-3.5 h-3.5 text-indigo-500" />}
        </div>
        
        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {documento.subidoPor.nombre}
          </span>
          <span>•</span>
          <span>{formatSize(documento.tamaño)}</span>
          <span>•</span>
          <span>{formatDate(documento.fechaSubida)}</span>
          {documento.version > 1 && (
            <>
              <span>•</span>
              <span className="text-indigo-600">v{documento.version}</span>
            </>
          )}
        </div>

        {documento.emailAsunto && (
          <p className="text-xs text-slate-400 mt-1 truncate">
            De: {documento.emailDe} | {documento.emailAsunto}
          </p>
        )}
      </div>

      {/* Badges */}
      <div className="flex items-center gap-2">
        <span className={`${neuro.badge} ${tipoInfo.color}`}>
          {tipoInfo.label}
        </span>
      </div>

      {/* Acciones */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => { e.stopPropagation(); onView(documento.id); }}
          className={`${neuro.btnSecondary} p-2`}
        >
          <Eye className="w-4 h-4" />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDownload(documento.id); }}
          className={`${neuro.btnSecondary} p-2`}
        >
          <Download className="w-4 h-4" />
        </button>
        <div className="relative">
          <button
            onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
            className={`${neuro.btnSecondary} p-2`}
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
          
          {showMenu && (
            <div className={`absolute right-0 top-full mt-2 ${neuro.panel} p-2 z-10 min-w-40`}>
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 rounded-lg flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Compartir
              </button>
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-slate-100 rounded-lg flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Abrir en nueva pestaña
              </button>
              <hr className="my-2" />
              <button 
                onClick={(e) => { e.stopPropagation(); onDelete(documento.id); }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function VisorDocumentosContrato({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contratoId,
  numeroContrato = 'CTR-2025-001',
  clienteNombre = 'Banco Chile'
}: {
  contratoId: string;
  numeroContrato?: string;
  clienteNombre?: string;
}) {
  const [documentos] = useState<DocumentoContrato[]>(mockDocumentos);
  const [vista, setVista] = useState<'grid' | 'lista'>('lista');
  const [busqueda, setBusqueda] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState<CategoriaDocumento | 'TODOS'>('TODOS');
  const [filtroTipo, setFiltroTipo] = useState<TipoDocumento | 'TODOS'>('TODOS');
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_documentoSeleccionado, setDocumentoSeleccionado] = useState<string | null>(null);

  // Filtrar documentos
  const documentosFiltrados = documentos.filter(doc => {
    if (filtroCategoria !== 'TODOS' && doc.categoria !== filtroCategoria) return false;
    if (filtroTipo !== 'TODOS' && doc.tipo !== filtroTipo) return false;
    if (busqueda) {
      const search = busqueda.toLowerCase();
      return (
        doc.nombre.toLowerCase().includes(search) ||
        doc.subidoPor.nombre.toLowerCase().includes(search) ||
        doc.emailAsunto?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  // Agrupar por categoría
  const documentosPorCategoria = documentosFiltrados.reduce((acc, doc) => {
    if (!acc[doc.categoria]) acc[doc.categoria] = [];
    acc[doc.categoria].push(doc);
    return acc;
  }, {} as Record<CategoriaDocumento, DocumentoContrato[]>);

  const handleView = (id: string) => {
    setDocumentoSeleccionado(id);
    ;
  };

  const handleDownload = (id: string) => {
    ;
  };

  const handleDelete = (id: string) => {
    ;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className={`${neuro.panel} p-6 mb-6`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600">
                <FolderOpen className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800">
                  Documentación del Contrato
                </h1>
                <p className="text-slate-500">
                  {numeroContrato} • {clienteNombre}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`${neuro.badge} bg-indigo-100 text-indigo-700 text-lg px-4 py-2`}>
                {documentos.length} documentos
              </span>
              <button className={`${neuro.btnPrimary} px-4 py-2 flex items-center gap-2`}>
                <Upload className="w-4 h-4" />
                Subir documento
              </button>
            </div>
          </div>

          {/* Estadísticas rápidas */}
          <div className="grid grid-cols-6 gap-4 mt-6">
            {(['NEGOCIACION', 'COMERCIAL', 'LEGAL', 'FACTURACION', 'OPERACIONES', 'MATERIAL_CREATIVO'] as CategoriaDocumento[]).map(cat => (
              <div 
                key={cat}
                onClick={() => setFiltroCategoria(filtroCategoria === cat ? 'TODOS' : cat)}
                className={`${neuro.card} p-3 text-center cursor-pointer ${
                  filtroCategoria === cat ? 'ring-2 ring-indigo-400' : ''
                }`}
              >
                <p className="text-2xl font-bold text-slate-800">
                  {documentos.filter(d => d.categoria === cat).length}
                </p>
                <p className="text-xs text-slate-500 mt-1">{getCategoriaLabel(cat).replace(/\p{Emoji}/gu, '')}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Filtros */}
        <div className={`${neuro.panel} p-4 mb-6`}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Búsqueda */}
              <div className={`${neuro.input} px-4 py-2 flex items-center gap-2 flex-1 max-w-md`}>
                <Search className="w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, usuario..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="bg-transparent flex-1 focus:outline-none text-sm"
                />
              </div>

              {/* Filtro categoría */}
              <select
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value as CategoriaDocumento | 'TODOS')}
                className={`${neuro.input} px-4 py-2 text-sm`}
              >
                <option value="TODOS">Todas las categorías</option>
                <option value="NEGOCIACION">Negociación</option>
                <option value="COMERCIAL">Comercial</option>
                <option value="LEGAL">Legal</option>
                <option value="FACTURACION">Facturación</option>
                <option value="OPERACIONES">Operaciones</option>
                <option value="MATERIAL_CREATIVO">Material Creativo</option>
              </select>

              {/* Filtro tipo */}
              <select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value as TipoDocumento | 'TODOS')}
                className={`${neuro.input} px-4 py-2 text-sm`}
              >
                <option value="TODOS">Todos los tipos</option>
                <option value="EMAIL">Emails</option>
                <option value="COTIZACION">Cotizaciones</option>
                <option value="ORDEN_COMPRA">Órdenes de Compra</option>
                <option value="CONTRATO">Contratos</option>
                <option value="BRIEF">Briefs</option>
                <option value="MATERIAL">Material</option>
              </select>
            </div>

            {/* Vista */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setVista('lista')}
                className={`p-2 rounded-lg ${vista === 'lista' ? 'bg-white shadow' : ''}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setVista('grid')}
                className={`p-2 rounded-lg ${vista === 'grid' ? 'bg-white shadow' : ''}`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Lista de documentos */}
        {filtroCategoria === 'TODOS' ? (
          // Vista agrupada por categoría
          <div className="space-y-6">
            {(Object.keys(documentosPorCategoria) as CategoriaDocumento[]).map(categoria => (
              <div key={categoria}>
                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                  {getCategoriaLabel(categoria)}
                  <span className={`${neuro.badge} bg-slate-100 text-slate-600`}>
                    {documentosPorCategoria[categoria].length}
                  </span>
                </h3>
                
                {vista === 'grid' ? (
                  <div className="grid grid-cols-4 gap-4">
                    {documentosPorCategoria[categoria].map(doc => (
                      <DocumentoCard
                        key={doc.id}
                        documento={doc}
                        vista={vista}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {documentosPorCategoria[categoria].map(doc => (
                      <DocumentoCard
                        key={doc.id}
                        documento={doc}
                        vista={vista}
                        onView={handleView}
                        onDownload={handleDownload}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          // Vista filtrada
          vista === 'grid' ? (
            <div className="grid grid-cols-4 gap-4">
              {documentosFiltrados.map(doc => (
                <DocumentoCard
                  key={doc.id}
                  documento={doc}
                  vista={vista}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {documentosFiltrados.map(doc => (
                <DocumentoCard
                  key={doc.id}
                  documento={doc}
                  vista={vista}
                  onView={handleView}
                  onDownload={handleDownload}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )
        )}

        {/* Empty state */}
        {documentosFiltrados.length === 0 && (
          <div className={`${neuro.card} p-12 text-center`}>
            <FolderOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-600 mb-2">
              No hay documentos
            </h3>
            <p className="text-slate-400 mb-4">
              {busqueda ? 'No se encontraron documentos con esos criterios' : 'Aún no se han subido documentos a este contrato'}
            </p>
            <button className={`${neuro.btnPrimary} px-6 py-3`}>
              <Upload className="w-4 h-4 inline mr-2" />
              Subir primer documento
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
