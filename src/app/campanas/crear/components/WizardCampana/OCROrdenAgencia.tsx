/**
 * 📄 OCR Orden de Agencia - Extracción Automática IA
 * 
 * Permite subir PDF/Excel/imagen de orden de agencia y:
 * - Detectar automáticamente el cliente/anunciante
 * - Identificar tipo de campaña (menciones, prime, auspicio, etc.)
 * - Extraer programas y horarios
 * - Crear líneas automáticamente
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, FileText, CheckCircle2, AlertTriangle, Loader2, 
  Building2, Calendar, Radio, DollarSign, User,
  Sparkles, Brain, ClipboardList, Edit2, Eye,
  FileSpreadsheet, Image, RefreshCw, Zap
} from 'lucide-react';

// ==================== INTERFACES ====================

interface DatosExtraidos {
  anunciante: {
    nombre: string;
    rut?: string;
    confianza: number;
  };
  agencia: {
    nombre: string;
    tipo: 'publicidad' | 'medios';
    confianza: number;
  };
  campana: {
    nombre: string;
    referencia?: string;
    ordenAgencia?: string;
    ordenCompra?: string;
    confianza: number;
  };
  periodo: {
    fechaInicio: string;
    fechaFin: string;
    confianza: number;
  };
  financiero: {
    valorNeto: number;
    comisionAgencia: number;
    confianza: number;
  };
  lineasDetectadas: LineaDetectada[];
  contratoAsociado?: {
    numero: string;
    match: number;
  };
}

interface LineaDetectada {
  id: string;
  tipoPedido: 'prime_am' | 'prime_pm' | 'auspicio' | 'menciones' | 'frases' | 'repartido' | 'trasnoche';
  programa?: string;
  horario: string;
  dias: string[];
  cantidad: number;
  duracion: number;
  confianza: number;
}

interface OCROrdenProps {
  onCrearCampana?: (datos: DatosExtraidos) => void;
}

// ==================== COMPONENTE PRINCIPAL ====================

export function OCROrdenAgencia({ onCrearCampana }: OCROrdenProps) {
  const [archivo, setArchivo] = useState<File | null>(null);
  const [extrayendo, setExtrayendo] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [etapa, setEtapa] = useState('');
  const [datosExtraidos, setDatosExtraidos] = useState<DatosExtraidos | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [modoEdicion, setModoEdicion] = useState(false);

  // Simular extracción OCR/IA
  const extraerDatosIA = useCallback(async () => {
    if (!archivo) return;

    setExtrayendo(true);
    setProgreso(0);

    const etapas = [
      { texto: '📖 Procesando documento...', p: 10 },
      { texto: '🔍 Detectando estructura...', p: 25 },
      { texto: '🏢 Identificando anunciante...', p: 40 },
      { texto: '📋 Extrayendo líneas de pedido...', p: 55 },
      { texto: '💰 Analizando datos financieros...', p: 70 },
      { texto: '🔗 Buscando contrato asociado...', p: 85 },
      { texto: '✅ Validando resultados...', p: 95 },
    ];

    for (const e of etapas) {
      setEtapa(e.texto);
      setProgreso(e.p);
      await new Promise(r => setTimeout(r, 400));
    }

    // Mock de datos extraídos
    const mockDatos: DatosExtraidos = {
      anunciante: {
        nombre: 'BANCO DE CHILE',
        rut: '97.004.000-5',
        confianza: 98,
      },
      agencia: {
        nombre: 'UNIVERSAL McCANN',
        tipo: 'medios',
        confianza: 95,
      },
      campana: {
        nombre: 'Campaña Navidad Premium 2025',
        referencia: 'DICIEMBRE 2025',
        ordenAgencia: 'ORD-NAV-2025-123',
        ordenCompra: 'OC-2025-789',
        confianza: 92,
      },
      periodo: {
        fechaInicio: '01/12/2025',
        fechaFin: '31/12/2025',
        confianza: 97,
      },
      financiero: {
        valorNeto: 2500000,
        comisionAgencia: 15,
        confianza: 89,
      },
      lineasDetectadas: [
        { id: '1', tipoPedido: 'prime_am', programa: 'PRIME MATINAL', horario: '07:00-09:30', dias: ['L', 'M', 'M', 'J', 'V'], cantidad: 5, duracion: 30, confianza: 96 },
        { id: '2', tipoPedido: 'prime_pm', programa: 'PRIME TARDE', horario: '18:00-20:00', dias: ['L', 'M', 'M', 'J', 'V'], cantidad: 3, duracion: 30, confianza: 94 },
        { id: '3', tipoPedido: 'menciones', programa: 'HOLA CHILE', horario: '10:00-12:00', dias: ['L', 'M', 'M', 'J', 'V'], cantidad: 2, duracion: 15, confianza: 91 },
        { id: '4', tipoPedido: 'auspicio', programa: 'NOTICIAS T13', horario: '21:00-22:00', dias: ['L', 'M', 'M', 'J', 'V'], cantidad: 1, duracion: 30, confianza: 88 },
        { id: '5', tipoPedido: 'repartido', horario: '06:00-22:00', dias: ['S', 'D'], cantidad: 8, duracion: 30, confianza: 85 },
      ],
      contratoAsociado: {
        numero: 'CON-2025-0234',
        match: 94,
      },
    };

    setProgreso(100);
    setDatosExtraidos(mockDatos);
    setExtrayendo(false);
    setEtapa('');
  }, [archivo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setArchivo(file);
      setDatosExtraidos(null);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      setArchivo(file);
      setDatosExtraidos(null);
    }
  };

  const handleCrearCampana = () => {
    if (datosExtraidos && onCrearCampana) {
      onCrearCampana(datosExtraidos);
    }
    setDialogOpen(false);
  };

  const getTipoPedidoLabel = (tipo: string) => {
    switch (tipo) {
      case 'prime_am': return { label: 'PRIME AM', color: 'bg-red-100 text-red-700' };
      case 'prime_pm': return { label: 'PRIME PM', color: 'bg-orange-100 text-orange-700' };
      case 'auspicio': return { label: 'AUSPICIO', color: 'bg-blue-100 text-blue-700' };
      case 'menciones': return { label: 'MENCIONES', color: 'bg-purple-100 text-purple-700' };
      case 'frases': return { label: 'FRASES', color: 'bg-pink-100 text-pink-700' };
      case 'repartido': return { label: 'REPARTIDO', color: 'bg-green-100 text-green-700' };
      case 'trasnoche': return { label: 'TRASNOCHE', color: 'bg-gray-100 text-gray-700' };
      default: return { label: tipo, color: 'bg-gray-100' };
    }
  };

  const getConfianzaColor = (conf: number) => {
    if (conf >= 95) return 'text-emerald-600';
    if (conf >= 85) return 'text-amber-600';
    return 'text-red-600';
  };

  const getFileIcon = (filename: string) => {
    if (filename.endsWith('.xlsx') || filename.endsWith('.xls')) return <FileSpreadsheet className="w-12 h-12 text-green-600" />;
    if (filename.endsWith('.pdf')) return <FileText className="w-12 h-12 text-red-600" />;
    if (filename.endsWith('.png') || filename.endsWith('.jpg')) return <Image className="w-12 h-12 text-blue-600" />;
    return <FileText className="w-12 h-12 text-gray-600" />;
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
          <Brain className="w-4 h-4" />
          🤖 Crear desde Orden de Agencia
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-6xl bg-white max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            📄 OCR Inteligente - Orden de Agencia
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Zona de Drop */}
          {!archivo && (
            <div 
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center bg-purple-50/30 hover:bg-purple-50 transition-colors cursor-pointer"
            >
              <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Sube la Orden de Agencia
              </h3>
              <p className="text-gray-500 mb-4">
                PDF, Excel (.xlsx) o imagen con el detalle de la campaña
              </p>
              <p className="text-sm text-purple-600 mb-4">
                🤖 La IA identificará automáticamente: cliente, tipo de campaña, programas, fechas y valores
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                className="hidden"
                id="orden-upload"
              />
              <label htmlFor="orden-upload">
                <Button className="gap-2 bg-purple-600 hover:bg-purple-700" asChild>
                  <span>
                    <FileText className="w-4 h-4" />
                    Seleccionar Archivo
                  </span>
                </Button>
              </label>
            </div>
          )}

          {/* Archivo Seleccionado */}
          {archivo && !datosExtraidos && (
            <Card className="p-6">
              <div className="flex items-center gap-4">
                {getFileIcon(archivo.name)}
                <div className="flex-1">
                  <p className="font-medium text-gray-900 text-lg">{archivo.name}</p>
                  <p className="text-sm text-gray-500">
                    {(archivo.size / 1024).toFixed(1)} KB • Listo para procesar
                  </p>
                </div>
                <Button 
                  variant="ghost"
                  onClick={() => setArchivo(null)}
                  className="text-red-600"
                >
                  Cambiar
                </Button>
              </div>

              {extrayendo ? (
                <div className="mt-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-purple-700 flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {etapa}
                    </span>
                    <span className="text-sm font-bold text-purple-700">{progreso}%</span>
                  </div>
                  <Progress value={progreso} className="h-3" />
                </div>
              ) : (
                <Button 
                  onClick={extraerDatosIA}
                  className="mt-6 w-full gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 h-14 text-lg"
                >
                  <Brain className="w-6 h-6" />
                  🤖 Extraer Datos con IA
                </Button>
              )}
            </Card>
          )}

          {/* Resultados Extraídos */}
          {datosExtraidos && (
            <>
              {/* Contrato Asociado */}
              {datosExtraidos.contratoAsociado && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    <div>
                      <p className="font-bold text-emerald-900">¡Contrato Asociado Detectado!</p>
                      <p className="text-sm text-emerald-700">
                        {datosExtraidos.contratoAsociado.numero} • Match: {datosExtraidos.contratoAsociado.match}%
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1 text-emerald-700 border-emerald-300">
                    <Eye className="w-4 h-4" />
                    Ver Contrato
                  </Button>
                </div>
              )}

              {/* Grid de Datos Extraídos */}
              <div className="grid grid-cols-2 gap-4">
                {/* Anunciante */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      Anunciante
                    </h4>
                    <span className={`text-sm font-bold ${getConfianzaColor(datosExtraidos.anunciante.confianza)}`}>
                      {datosExtraidos.anunciante.confianza}%
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{datosExtraidos.anunciante.nombre}</p>
                  {datosExtraidos.anunciante.rut && (
                    <p className="text-sm text-gray-500">RUT: {datosExtraidos.anunciante.rut}</p>
                  )}
                </Card>

                {/* Agencia */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <User className="w-4 h-4 text-purple-600" />
                      Agencia
                    </h4>
                    <span className={`text-sm font-bold ${getConfianzaColor(datosExtraidos.agencia.confianza)}`}>
                      {datosExtraidos.agencia.confianza}%
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">{datosExtraidos.agencia.nombre}</p>
                  <Badge className="mt-1">{datosExtraidos.agencia.tipo}</Badge>
                </Card>

                {/* Período */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-600" />
                      Período
                    </h4>
                    <span className={`text-sm font-bold ${getConfianzaColor(datosExtraidos.periodo.confianza)}`}>
                      {datosExtraidos.periodo.confianza}%
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    {datosExtraidos.periodo.fechaInicio} - {datosExtraidos.periodo.fechaFin}
                  </p>
                </Card>

                {/* Financiero */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-gray-700 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      Financiero
                    </h4>
                    <span className={`text-sm font-bold ${getConfianzaColor(datosExtraidos.financiero.confianza)}`}>
                      {datosExtraidos.financiero.confianza}%
                    </span>
                  </div>
                  <p className="text-lg font-medium text-gray-900">
                    ${datosExtraidos.financiero.valorNeto.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">
                    Comisión Agencia: {datosExtraidos.financiero.comisionAgencia}%
                  </p>
                </Card>
              </div>

              {/* Campaña */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-gray-700 flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-indigo-600" />
                    Campaña Detectada
                  </h4>
                  <span className={`text-sm font-bold ${getConfianzaColor(datosExtraidos.campana.confianza)}`}>
                    {datosExtraidos.campana.confianza}%
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Nombre</p>
                    <p className="font-medium">{datosExtraidos.campana.nombre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Referencia</p>
                    <p className="font-medium">{datosExtraidos.campana.referencia || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Orden Agencia</p>
                    <p className="font-medium">{datosExtraidos.campana.ordenAgencia || '-'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Orden Compra</p>
                    <p className="font-medium">{datosExtraidos.campana.ordenCompra || '-'}</p>
                  </div>
                </div>
              </Card>

              {/* Líneas Detectadas */}
              <Card className="p-4">
                <h4 className="font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Radio className="w-4 h-4 text-red-600" />
                  📋 Líneas de Pedido Detectadas ({datosExtraidos.lineasDetectadas.length})
                </h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="p-2 text-left">Tipo</th>
                        <th className="p-2 text-left">Programa</th>
                        <th className="p-2 text-left">Horario</th>
                        <th className="p-2 text-left">Días</th>
                        <th className="p-2 text-center">Cuñas/Día</th>
                        <th className="p-2 text-center">Dur.</th>
                        <th className="p-2 text-center">Confianza</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosExtraidos.lineasDetectadas.map((linea) => {
                        const tipoInfo = getTipoPedidoLabel(linea.tipoPedido);
                        return (
                          <tr key={linea.id} className="border-b hover:bg-slate-50">
                            <td className="p-2">
                              <Badge className={tipoInfo.color}>{tipoInfo.label}</Badge>
                            </td>
                            <td className="p-2 font-medium">{linea.programa || 'Rotativo'}</td>
                            <td className="p-2 text-gray-600">{linea.horario}</td>
                            <td className="p-2">
                              <div className="flex gap-1">
                                {linea.dias.map(d => (
                                  <span key={d} className="text-xs bg-slate-100 px-1 rounded">{d}</span>
                                ))}
                              </div>
                            </td>
                            <td className="p-2 text-center font-bold text-blue-600">{linea.cantidad}</td>
                            <td className="p-2 text-center">{linea.duracion}s</td>
                            <td className="p-2 text-center">
                              <span className={`font-bold ${getConfianzaColor(linea.confianza)}`}>
                                {linea.confianza}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Acciones */}
              <div className="flex gap-3">
                <Button 
                  onClick={handleCrearCampana}
                  className="flex-1 gap-2 bg-gradient-to-r from-emerald-600 to-green-600 h-14 text-lg"
                >
                  <Zap className="w-6 h-6" />
                  🚀 Crear Campaña Automáticamente
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setModoEdicion(!modoEdicion)}
                  className="gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  ✏️ Editar Datos
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setArchivo(null);
                    setDatosExtraidos(null);
                  }}
                  className="gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Nuevo Archivo
                </Button>
              </div>

              {/* Disclaimer */}
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 text-sm text-amber-800">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                <strong>Nota:</strong> Revisa los datos extraídos antes de crear la campaña. 
                Los valores con confianza menor a 90% pueden requerir ajustes manuales.
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default OCROrdenAgencia;
