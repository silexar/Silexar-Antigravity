/**
 * 📧 SILEXAR PULSE - Email Templates Management Page TIER 0
 * 
 * @description Página de gestión de plantillas de email:
 * - Lista de plantillas disponibles
 * - Preview de emails
 * - Edición de plantillas
 * - Envío de prueba
 * 
 * @version 2025.4.0
 * @tier TIER_0_FORTUNE_10
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Plus,
  Edit3,
  Eye,
  Send,
  FileText,
  DollarSign,
  AlertTriangle,
  Settings,
  Code,
  Smartphone,
  Monitor,
  X
} from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface PlantillaEmail {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string;
  categoria: 'contratos' | 'facturacion' | 'cobranza' | 'sistema';
  activa: boolean;
  variables: string[];
  ultimoEnvio?: Date;
  enviosTotales: number;
  tasaApertura: number;
}

// ═══════════════════════════════════════════════════════════════
// ESTILOS
// ═══════════════════════════════════════════════════════════════

const neuro = {
  panel: `
    bg-gradient-to-br from-[#dfeaff] to-[#dfeaff]
    rounded-3xl shadow-[8px_8px_16px_#bec8de,-8px_-8px_16px_#ffffff]
    border border-[#bec8de30]/50
  `,
  card: `
    bg-gradient-to-br from-[#ffffff] to-[#dfeaff]
    rounded-2xl shadow-[6px_6px_12px_#bec8de,-6px_-6px_12px_#ffffff]
    border border-[#bec8de30]/30
  `,
  btn: `
    px-4 py-2 rounded-xl font-medium transition-all
    shadow-[4px_4px_8px_#bec8de,-4px_-4px_8px_#ffffff]
    hover:shadow-[2px_2px_4px_#bec8de,-2px_-2px_4px_#ffffff]
  `,
  btnPrimary: `bg-[#6888ff] text-white`,
  btnSecondary: `bg-gradient-to-br from-[#dfeaff] to-[#dfeaff] text-[#69738c]`,
  badge: `px-3 py-1 rounded-lg text-xs font-medium`
};

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const mockPlantillas: PlantillaEmail[] = [
  {
    id: 'pl-001',
    codigo: 'CONTRATO_NUEVO',
    nombre: 'Nuevo Contrato',
    descripcion: 'Notificación de nuevo contrato creado para el cliente',
    categoria: 'contratos',
    activa: true,
    variables: ['contratoNumero', 'contratoTitulo', 'clienteNombre', 'valorTotal'],
    ultimoEnvio: new Date(Date.now() - 2 * 60 * 60 * 1000),
    enviosTotales: 234,
    tasaApertura: 78
  },
  {
    id: 'pl-002',
    codigo: 'SOLICITUD_FIRMA',
    nombre: 'Solicitud de Firma Digital',
    descripcion: 'Invitación a firmar contrato digitalmente',
    categoria: 'contratos',
    activa: true,
    variables: ['contratoNumero', 'urlFirma', 'fechaLimite'],
    ultimoEnvio: new Date(Date.now() - 30 * 60 * 1000),
    enviosTotales: 189,
    tasaApertura: 92
  },
  {
    id: 'pl-003',
    codigo: 'FACTURA_EMITIDA',
    nombre: 'Factura Emitida',
    descripcion: 'Notificación de nueva factura disponible',
    categoria: 'facturacion',
    activa: true,
    variables: ['facturaNumero', 'monto', 'fechaVencimientos', 'urlDescarga'],
    ultimoEnvio: new Date(Date.now() - 24 * 60 * 60 * 1000),
    enviosTotales: 567,
    tasaApertura: 85
  },
  {
    id: 'pl-004',
    codigo: 'RECORDATORIO_PAGO',
    nombre: 'Recordatorio de Pago',
    descripcion: 'Recordatorio de factura próxima a vencer',
    categoria: 'cobranza',
    activa: true,
    variables: ['facturaNumero', 'monto', 'diasRestantes', 'urlPago'],
    ultimoEnvio: new Date(Date.now() - 48 * 60 * 60 * 1000),
    enviosTotales: 345,
    tasaApertura: 71
  },
  {
    id: 'pl-005',
    codigo: 'COBRANZA_URGENTE',
    nombre: 'Cobranza Urgente',
    descripcion: 'Notificación de deuda vencida urgente',
    categoria: 'cobranza',
    activa: true,
    variables: ['saldoPendiente', 'diasMora', 'urlPago'],
    enviosTotales: 89,
    tasaApertura: 65
  },
  {
    id: 'pl-006',
    codigo: 'BIENVENIDA_CLIENTE',
    nombre: 'Bienvenida Cliente',
    descripcion: 'Email de bienvenida para nuevos clientes',
    categoria: 'sistema',
    activa: false,
    variables: ['clienteNombre', 'urlPortal'],
    enviosTotales: 45,
    tasaApertura: 88
  }
];

const categoriaConfig = {
  contratos: { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: FileText, label: 'Contratos' },
  facturacion: { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: DollarSign, label: 'Facturación' },
  cobranza: { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: AlertTriangle, label: 'Cobranza' },
  sistema: { color: 'text-[#6888ff]', bg: 'bg-[#6888ff]/10', icon: Settings, label: 'Sistema' }
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export default function EmailTemplatesPage() {
  const [plantillas] = useState(mockPlantillas);
  const [filtroCategoria, setFiltroCategoria] = useState<string>('todas');
  const [plantillaPreview, setPlantillaPreview] = useState<PlantillaEmail | null>(null);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');

  const plantillasFiltradas = plantillas.filter(p => 
    filtroCategoria === 'todas' || p.categoria === filtroCategoria
  );

  const formatTiempo = (fecha: Date | undefined) => {
    if (!fecha) return 'Nunca';
    const diff = Date.now() - fecha.getTime();
    if (diff < 60000) return 'Hace un momento';
    if (diff < 3600000) return `Hace ${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `Hace ${Math.floor(diff / 3600000)} horas`;
    return fecha.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#dfeaff] via-slate-50 to-[#dfeaff] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500 to-[#5572ee]">
              <Mail className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#69738c]">Plantillas de Email</h1>
              <p className="text-[#69738c]">Personaliza los emails que se envían automáticamente</p>
            </div>
          </div>
          
          <button className={`${neuro.btn} ${neuro.btnPrimary} flex items-center gap-2`}>
            <Plus className="w-5 h-5" />
            Nueva Plantilla
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Plantillas Activas</p>
              <p className="text-2xl font-bold text-[#6888ff]">
                {plantillas.filter(p => p.activa).length}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Emails Enviados (30d)</p>
              <p className="text-2xl font-bold text-[#6888ff]">
                {plantillas.reduce((acc, p) => acc + p.enviosTotales, 0).toLocaleString()}
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Tasa Apertura Promedio</p>
              <p className="text-2xl font-bold text-[#6888ff]">
                {Math.round(plantillas.reduce((acc, p) => acc + p.tasaApertura, 0) / plantillas.length)}%
              </p>
            </div>
          </motion.div>
          <motion.div className={neuro.card} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
            <div className="p-5">
              <p className="text-sm text-[#69738c] mb-1">Mejor Rendimiento</p>
              <p className="text-lg font-bold text-[#69738c] truncate">
                {plantillas.sort((a, b) => b.tasaApertura - a.tasaApertura)[0]?.nombre}
              </p>
            </div>
          </motion.div>
        </div>

        {/* Filtros por categoría */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFiltroCategoria('todas')}
            className={`${neuro.btn} ${filtroCategoria === 'todas' ? neuro.btnPrimary : neuro.btnSecondary}`}
          >
            Todas
          </button>
          {Object.entries(categoriaConfig).map(([key, config]) => {
            const Icono = config.icon;
            return (
              <button
                key={key}
                onClick={() => setFiltroCategoria(key)}
                className={`${neuro.btn} ${filtroCategoria === key ? neuro.btnPrimary : neuro.btnSecondary} flex items-center gap-2`}
              >
                <Icono className="w-4 h-4" />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Grid de Plantillas */}
        <div className="grid grid-cols-2 gap-6">
          {plantillasFiltradas.map(plantilla => {
            const catConfig = categoriaConfig[plantilla.categoria];
            const CatIcon = catConfig.icon;
            
            return (
              <motion.div 
                key={plantilla.id}
                layout
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`${neuro.card} overflow-hidden hover:ring-2 hover:ring-indigo-200 transition-all`}
              >
                <div className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${catConfig.bg}`}>
                        <CatIcon className={`w-5 h-5 ${catConfig.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#69738c]">{plantilla.nombre}</h3>
                        <p className="text-xs text-[#9aa3b8] font-mono">{plantilla.codigo}</p>
                      </div>
                    </div>
                    <span className={`${neuro.badge} ${plantilla.activa ? 'bg-[#6888ff]/10 text-[#6888ff]' : 'bg-[#dfeaff] text-[#69738c]'}`}>
                      {plantilla.activa ? 'Activa' : 'Inactiva'}
                    </span>
                  </div>
                  
                  <p className="text-sm text-[#69738c] mb-4">{plantilla.descripcion}</p>
                  
                  {/* Variables */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {plantilla.variables.slice(0, 4).map(v => (
                      <span key={v} className="px-2 py-0.5 bg-[#dfeaff] rounded text-xs text-[#69738c] font-mono">
                        {`{{${v}}}`}
                      </span>
                    ))}
                    {plantilla.variables.length > 4 && (
                      <span className="px-2 py-0.5 bg-[#dfeaff] rounded text-xs text-[#69738c]">
                        +{plantilla.variables.length - 4} más
                      </span>
                    )}
                  </div>
                  
                  {/* Stats */}
                  <div className="flex items-center justify-between text-sm border-t border-[#bec8de30] pt-4">
                    <div className="flex items-center gap-4">
                      <span className="text-[#69738c]">
                        {plantilla.enviosTotales} envíos
                      </span>
                      <span className="text-[#6888ff] font-medium">
                        {plantilla.tasaApertura}% apertura
                      </span>
                    </div>
                    <span className="text-[#9aa3b8] text-xs">
                      Último: {formatTiempo(plantilla.ultimoEnvio)}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex border-t border-[#bec8de30]">
                  <button 
                    onClick={() => setPlantillaPreview(plantilla)}
                    className="flex-1 py-3 text-sm font-medium text-[#69738c] hover:bg-[#dfeaff] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Preview
                  </button>
                  <div className="w-px bg-[#dfeaff]" />
                  <button className="flex-1 py-3 text-sm font-medium text-[#69738c] hover:bg-[#dfeaff] flex items-center justify-center gap-2 transition-colors">
                    <Edit3 className="w-4 h-4" />
                    Editar
                  </button>
                  <div className="w-px bg-[#dfeaff]" />
                  <button className="flex-1 py-3 text-sm font-medium text-[#6888ff] hover:bg-[#6888ff]/10 flex items-center justify-center gap-2 transition-colors">
                    <Send className="w-4 h-4" />
                    Test
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Modal Preview */}
        <AnimatePresence>
          {plantillaPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setPlantillaPreview(null)}
            >
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.95 }}
                className={`${neuro.panel} w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col`}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[#bec8de30]">
                  <div>
                    <h2 className="font-bold text-lg text-[#69738c]">{plantillaPreview.nombre}</h2>
                    <p className="text-sm text-[#69738c]">{plantillaPreview.descripcion}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Device toggle */}
                    <div className="flex bg-[#dfeaff] rounded-lg p-1">
                      <button 
                        onClick={() => setViewMode('desktop')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'desktop' ? 'bg-[#dfeaff] shadow' : ''}`}
                      >
                        <Monitor className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('mobile')}
                        className={`p-2 rounded-lg transition-colors ${viewMode === 'mobile' ? 'bg-[#dfeaff] shadow' : ''}`}
                      >
                        <Smartphone className="w-4 h-4" />
                      </button>
                    </div>
                    <button onClick={() => setPlantillaPreview(null)} className="p-1">
                      <X className="w-5 h-5 text-[#9aa3b8]" />
                    </button>
                  </div>
                </div>
                
                {/* Preview */}
                <div className="flex-1 overflow-y-auto p-6 bg-[#dfeaff]">
                  <div 
                    className={`bg-[#dfeaff] rounded-lg shadow-lg mx-auto transition-all duration-300 ${
                      viewMode === 'mobile' ? 'max-w-sm' : 'max-w-2xl'
                    }`}
                  >
                    {/* Email Preview Content */}
                    <div className="p-6">
                      <div className="bg-[#6888ff] text-white p-6 rounded-t-lg -mx-6 -mt-6 mb-6">
                        <h3 className="text-xl font-bold">Silexar Pulse</h3>
                      </div>
                      
                      <h2 className="text-xl font-bold text-[#69738c] mb-4">
                        ¡Hola {'{{clienteNombre}}'}! 👋
                      </h2>
                      
                      <p className="text-[#69738c] mb-4">
                        Este es un preview de la plantilla "{plantillaPreview.nombre}". 
                        Las variables se muestran entre llaves dobles.
                      </p>
                      
                      <div className="bg-[#dfeaff] rounded-lg p-4 mb-4">
                        <p className="text-sm text-[#69738c] mb-2">Variables disponibles:</p>
                        <div className="flex flex-wrap gap-2">
                          {plantillaPreview.variables.map(v => (
                            <code key={v} className="px-2 py-1 bg-[#6888ff]/10 text-[#6888ff] rounded text-sm">
                              {`{{${v}}}`}
                            </code>
                          ))}
                        </div>
                      </div>
                      
                      <button className="w-full py-3 bg-[#6888ff] text-white rounded-lg font-medium">
                        Botón de Acción
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Footer */}
                <div className="flex justify-between items-center p-4 border-t border-[#bec8de30] bg-[#dfeaff]">
                  <button className={`${neuro.btn} ${neuro.btnSecondary} flex items-center gap-2`}>
                    <Code className="w-4 h-4" />
                    Ver HTML
                  </button>
                  <div className="flex gap-3">
                    <button className={`${neuro.btn} ${neuro.btnSecondary} flex items-center gap-2`}>
                      <Send className="w-4 h-4" />
                      Enviar Prueba
                    </button>
                    <button className={`${neuro.btn} ${neuro.btnPrimary} flex items-center gap-2`}>
                      <Edit3 className="w-4 h-4" />
                      Editar Plantilla
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
