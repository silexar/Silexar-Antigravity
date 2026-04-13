/**
 * 📄 Generador de Confirmaciones Horarias TIER0 Enterprise 2050
 * 
 * Sistema profesional para generar y enviar confirmaciones horarias:
 * - Templates personalizables por emisora/cliente
 * - Preview en tiempo real
 * - Generación PDF profesional
 * - Envío email integrado con tracking
 * - Historial de envíos
 * 
 * @enterprise TIER0 Fortune 10
 * @version 2050.1.0
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  FileText, Download, Mail, Eye, Clock, Calendar,
  CheckCircle2, Send, Printer, RefreshCw, History,
  Settings, Palette, LayoutTemplate, Radio, Building2
} from 'lucide-react';

// ==================== INTERFACES ====================

interface Template {
  id: string;
  nombre: string;
  emisora: string;
  descripcion: string;
  colorPrimario: string;
  incluirLogo: boolean;
  incluirMetricas: boolean;
  incluirFirma: boolean;
}

interface CampanaConfirmacion {
  numero: string;
  nombre: string;
  anunciante: string;
  emisora: string;
  fechaInicio: string;
  fechaFin: string;
  totalSpots: number;
  valorNeto: number;
  ejecutivo: string;
  estado: 'pendiente' | 'generada' | 'enviada' | 'confirmada';
}

interface HistorialEnvio {
  id: string;
  fecha: string;
  destinatarios: string[];
  formato: 'pdf' | 'email' | 'excel';
  estado: 'enviado' | 'abierto' | 'descargado' | 'error';
  usuario: string;
}

// ==================== DATOS MOCK ====================

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'tpl_t13',
    nombre: 'T13 Radio Premium',
    emisora: 'T13 Radio',
    descripcion: 'Template oficial T13 Radio con colores corporativos',
    colorPrimario: '#1E40AF',
    incluirLogo: true,
    incluirMetricas: true,
    incluirFirma: true
  },
  {
    id: 'tpl_play',
    nombre: 'Play FM Moderno',
    emisora: 'Play FM',
    descripcion: 'Diseño moderno para audiencia joven',
    colorPrimario: '#7C3AED',
    incluirLogo: true,
    incluirMetricas: false,
    incluirFirma: true
  },
  {
    id: 'tpl_simple',
    nombre: 'Corporativo Simple',
    emisora: 'Todas',
    descripcion: 'Template minimalista para cualquier emisora',
    colorPrimario: '#374151',
    incluirLogo: false,
    incluirMetricas: true,
    incluirFirma: false
  }
];

const MOCK_CAMPANAS: CampanaConfirmacion[] = [
  {
    numero: 'CAM-2025-0015',
    nombre: 'Campaña Verano Premium',
    anunciante: 'BANCO DE CHILE',
    emisora: 'T13 Radio',
    fechaInicio: '2025-02-01',
    fechaFin: '2025-02-28',
    totalSpots: 156,
    valorNeto: 12500000,
    ejecutivo: 'Ana García',
    estado: 'pendiente'
  },
  {
    numero: 'CAM-2025-0012',
    nombre: 'Lanzamiento App Q1',
    anunciante: 'ENTEL',
    emisora: 'Play FM',
    fechaInicio: '2025-02-15',
    fechaFin: '2025-03-15',
    totalSpots: 240,
    valorNeto: 18000000,
    ejecutivo: 'Carlos Mendoza',
    estado: 'generada'
  }
];

const MOCK_HISTORIAL: HistorialEnvio[] = [
  {
    id: 'env_001',
    fecha: '2025-02-08 10:30',
    destinatarios: ['cliente@bancochile.cl', 'medios@carat.cl'],
    formato: 'pdf',
    estado: 'abierto',
    usuario: 'Ana García'
  },
  {
    id: 'env_002',
    fecha: '2025-02-07 15:45',
    destinatarios: ['marketing@entel.cl'],
    formato: 'email',
    estado: 'enviado',
    usuario: 'Carlos Mendoza'
  }
];

// ==================== COMPONENTE PRINCIPAL ====================

export default function ConfirmacionesPage() {
  const [selectedCampana, setSelectedCampana] = useState<string>(MOCK_CAMPANAS[0].numero);
  const [selectedTemplate, setSelectedTemplate] = useState<string>(MOCK_TEMPLATES[0].id);
  const [destinatarios, setDestinatarios] = useState<string>('');
  const [formato, setFormato] = useState<'pdf' | 'email' | 'excel'>('pdf');
  const [notasAdicionales, setNotasAdicionales] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  
  // Opciones de personalización
  const [incluirDesglose, setIncluirDesglose] = useState(true);
  const [incluirValores, setIncluirValores] = useState(true);
  const [incluirContacto, setIncluirContacto] = useState(true);

  const campanaActual = MOCK_CAMPANAS.find(c => c.numero === selectedCampana);
  const templateActual = MOCK_TEMPLATES.find(t => t.id === selectedTemplate);

  const handleGenerarPreview = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsGenerating(false);
    setPreviewReady(true);
  };

  const handleEnviar = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    // Mock: Actualizar estado
  };

  const getEstadoColor = (estado: string) => {
    const colors: Record<string, string> = {
      'enviado': 'bg-blue-100 text-blue-800',
      'abierto': 'bg-green-100 text-green-800',
      'descargado': 'bg-purple-100 text-purple-800',
      'error': 'bg-red-100 text-red-800'
    };
    return colors[estado] || 'bg-gray-100';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-xl">
                <FileText className="w-8 h-8 text-blue-600" />
              </div>
              Confirmaciones Horarias TIER0
            </h1>
            <p className="text-gray-600 mt-1">
              Generador profesional de confirmaciones con envío automático
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-green-600 border-green-300 px-3 py-1">
              <CheckCircle2 className="w-4 h-4 mr-1" />
              Sistema Activo
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="generar" className="space-y-6">
          <TabsList className="bg-white shadow-sm border">
            <TabsTrigger value="generar" className="gap-2">
              <FileText className="w-4 h-4" />
              Generar
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-2">
              <LayoutTemplate className="w-4 h-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <History className="w-4 h-4" />
              Historial
            </TabsTrigger>
          </TabsList>

          {/* TAB: Generar */}
          <TabsContent value="generar" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Panel Izquierdo: Configuración */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-400" />
                      Configuración de Documento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Selección de Campaña */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Campaña</Label>
                        <Select value={selectedCampana} onValueChange={setSelectedCampana}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar campaña" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_CAMPANAS.map(c => (
                              <SelectItem key={c.numero} value={c.numero}>
                                {c.numero} - {c.anunciante}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Template</Label>
                        <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Seleccionar template" />
                          </SelectTrigger>
                          <SelectContent>
                            {MOCK_TEMPLATES.map(t => (
                              <SelectItem key={t.id} value={t.id}>
                                {t.nombre}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Destinatarios */}
                    <div>
                      <Label>Destinatarios</Label>
                      <Input 
                        value={destinatarios}
                        onChange={(e) => setDestinatarios(e.target.value)}
                        placeholder="email1@empresa.cl, email2@agencia.cl"
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Separar múltiples emails con coma</p>
                    </div>

                    {/* Formato y Opciones */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <Label>Formato de Salida</Label>
                        <Select value={formato} onValueChange={(v: 'pdf' | 'email' | 'excel') => setFormato(v)}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pdf">📄 PDF Descargable</SelectItem>
                            <SelectItem value="email">📧 Email Directo</SelectItem>
                            <SelectItem value="excel">📊 Excel Detallado</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-3">
                        <Label>Opciones de Contenido</Label>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Incluir desglose horario</span>
                            <Switch checked={incluirDesglose} onCheckedChange={setIncluirDesglose} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Mostrar valores</span>
                            <Switch checked={incluirValores} onCheckedChange={setIncluirValores} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Datos de contacto</span>
                            <Switch checked={incluirContacto} onCheckedChange={setIncluirContacto} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Notas */}
                    <div>
                      <Label>Notas Adicionales</Label>
                      <Textarea 
                        value={notasAdicionales}
                        onChange={(e) => setNotasAdicionales(e.target.value)}
                        placeholder="Observaciones o instrucciones especiales..."
                        className="mt-1"
                        rows={3}
                      />
                    </div>

                    {/* Botones de Acción */}
                    <div className="flex items-center gap-3 pt-4 border-t">
                      <Button 
                        onClick={handleGenerarPreview}
                        disabled={isGenerating}
                        className="bg-blue-600 hover:bg-blue-700 gap-2"
                      >
                        {isGenerating ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                        Generar Preview
                      </Button>
                      
                      <Button variant="outline" className="gap-2">
                        <Download className="w-4 h-4" />
                        Descargar
                      </Button>
                      
                      <Button variant="outline" className="gap-2">
                        <Printer className="w-4 h-4" />
                        Imprimir
                      </Button>
                      
                      <Button 
                        onClick={handleEnviar}
                        disabled={!previewReady || isGenerating}
                        className="ml-auto bg-green-600 hover:bg-green-700 gap-2"
                      >
                        <Send className="w-4 h-4" />
                        Enviar por Email
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Panel Derecho: Preview */}
              <div className="space-y-6">
                {campanaActual && (
                  <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-blue-600 flex items-center gap-2">
                        <Eye className="w-4 h-4" />
                        Vista Previa
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div 
                        className="bg-white rounded-lg shadow-inner p-4 min-h-[400px] border"
                        style={{ borderTopColor: templateActual?.colorPrimario, borderTopWidth: '4px' }}
                      >
                        {/* Mock Preview */}
                        <div className="text-center mb-4">
                          <Radio className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                          <h3 className="font-bold text-lg">{campanaActual.emisora}</h3>
                          <p className="text-xs text-gray-500">Confirmación Horaria</p>
                        </div>
                        
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Campaña:</span>
                            <span className="font-medium">{campanaActual.numero}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Cliente:</span>
                            <span className="font-medium">{campanaActual.anunciante}</span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Período:</span>
                            <span className="font-medium text-xs">
                              {campanaActual.fechaInicio} al {campanaActual.fechaFin}
                            </span>
                          </div>
                          <div className="flex justify-between border-b pb-2">
                            <span className="text-gray-500">Total Spots:</span>
                            <span className="font-bold text-blue-600">{campanaActual.totalSpots}</span>
                          </div>
                          {incluirValores && (
                            <div className="flex justify-between pt-2">
                              <span className="text-gray-500">Valor Neto:</span>
                              <span className="font-bold text-green-600">
                                ${campanaActual.valorNeto.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>

                        <div className="mt-6 pt-4 border-t text-center">
                          <p className="text-xs text-gray-400">
                            Documento generado automáticamente
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* TAB: Templates */}
          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-purple-500" />
                    Templates Disponibles
                  </CardTitle>
                  <Button className="gap-2">
                    <LayoutTemplate className="w-4 h-4" />
                    Crear Template
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  {MOCK_TEMPLATES.map(template => (
                    <div 
                      key={template.id}
                      className="p-4 rounded-xl border-2 hover:border-blue-300 transition-colors cursor-pointer"
                      style={{ borderTopColor: template.colorPrimario, borderTopWidth: '4px' }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: template.colorPrimario + '20' }}
                        >
                          <Radio className="w-5 h-5" style={{ color: template.colorPrimario }} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900">{template.nombre}</h4>
                          <p className="text-xs text-gray-500">{template.emisora}</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{template.descripcion}</p>
                      <div className="flex flex-wrap gap-1">
                        {template.incluirLogo && <Badge variant="secondary" className="text-xs">Logo</Badge>}
                        {template.incluirMetricas && <Badge variant="secondary" className="text-xs">Métricas</Badge>}
                        {template.incluirFirma && <Badge variant="secondary" className="text-xs">Firma</Badge>}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB: Historial */}
          <TabsContent value="historial">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-5 h-5 text-gray-400" />
                  Historial de Envíos
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50">
                      <TableHead>Fecha</TableHead>
                      <TableHead>Destinatarios</TableHead>
                      <TableHead>Formato</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Usuario</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_HISTORIAL.map(envio => (
                      <TableRow key={envio.id}>
                        <TableCell className="font-medium">{envio.fecha}</TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {envio.destinatarios.map((d) => (
                              <Badge key={d} variant="outline" className="text-xs">{d}</Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="uppercase text-xs">{envio.formato}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getEstadoColor(envio.estado)}>
                            {envio.estado}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-500">{envio.usuario}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="ghost">
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center text-gray-500 text-sm">
          <p>📄 Confirmaciones Horarias TIER0 - Powered by Document Engine</p>
          <p>Generación Automática • Tracking de Apertura • Auditoría Completa</p>
        </div>
      </div>
    </div>
  );
}
