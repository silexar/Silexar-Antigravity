/**
 * 📄 Confirmación Horaria Profesional - Enterprise 2050
 * 
 * Generador de confirmaciones automático con:
 * - Selector de templates
 * - Destinatarios email
 * - Personalización documento
 * - Preview en tiempo real
 * - Tabla detalle programación
 * - Acciones: Enviar, Descargar PDF, Imprimir
 * 
 * @enterprise TIER0 Fortune 10
 */

'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  FileText, Mail, Download, Printer, Link2,
  Settings, CheckCircle, Calendar, DollarSign, Radio,
  User, Loader2
} from 'lucide-react'

// ==================== INTERFACES ====================

interface DatosConfirmacion {
  campana: string
  campanaId: string
  contrato: string
  cliente: string
  clienteLogo?: string
  producto: string
  periodo: string
  emisora: string
  ejecutivo: string
  valorCampana: number
  totalCunas: number
  programacion: ProgramacionItem[]
}

interface ProgramacionItem {
  fecha: string
  hora: string
  bloque: string
  material: string
  duracion: string
  posicion: string
  costo: number
}

interface Template {
  id: string
  nombre: string
  descripcion: string
}

// ==================== DATOS MOCK ====================

const TEMPLATES: Template[] = [
  { id: 'estandar_banco', nombre: 'Confirmación Estándar Banco', descripcion: 'Formato completo para sector bancario' },
  { id: 'premium', nombre: 'Confirmación Detallada Premium', descripcion: 'Incluye métricas y proyecciones' },
  { id: 'simple', nombre: 'Confirmación Simple', descripcion: 'Formato resumido básico' },
  { id: 'personalizado', nombre: 'Template Personalizado Cliente', descripcion: 'Configuración específica cliente' }
]

const MOCK_DATOS: DatosConfirmacion = {
  campana: 'Promoción Navidad Premium 2025',
  campanaId: 'CMP-25-001',
  contrato: 'CON-2025-0234',
  cliente: 'BANCO DE CHILE',
  producto: 'Tarjeta de Crédito Joven',
  periodo: '01/12/2025 - 31/12/2025',
  emisora: 'T13 Radio',
  ejecutivo: 'Ana García',
  valorCampana: 2500000,
  totalCunas: 350,
  programacion: [
    { fecha: '01/12/25', hora: '07:26', bloque: 'PRIME', material: 'SP00262', duracion: '30s', posicion: '2°', costo: 8500 },
    { fecha: '01/12/25', hora: '08:26', bloque: 'PRIME', material: 'SP00263', duracion: '30s', posicion: '1°', costo: 8500 },
    { fecha: '01/12/25', hora: '19:26', bloque: 'PRIME', material: 'SP00262', duracion: '30s', posicion: '3°', costo: 8500 },
    { fecha: '02/12/25', hora: '07:26', bloque: 'PRIME', material: 'SP00262', duracion: '30s', posicion: '2°', costo: 8500 },
    { fecha: '02/12/25', hora: '08:26', bloque: 'AUSPICIO', material: 'SP00264', duracion: '15s', posicion: '1°', costo: 4500 }
  ]
}

// ==================== COMPONENTE ====================

export function ConfirmacionHoraria() {
  const [template, setTemplate] = useState<string>('estandar_banco')
  const [emailPrincipal, setEmailPrincipal] = useState('ana.garcia@banco.cl')
  const [emailCopia, setEmailCopia] = useState('marketing@banco.cl')
  const [emailOculto, setEmailOculto] = useState('traffic@silexar.com')
  
  const [incluirLogo, setIncluirLogo] = useState(true)
  const [incluirTecnicos, setIncluirTecnicos] = useState(true)
  const [incluirMetricas, setIncluirMetricas] = useState(true)
  const [incluirContactos, setIncluirContactos] = useState(true)
  
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)

  const datos = MOCK_DATOS

  const formatMoney = (valor: number) => `$${valor.toLocaleString('es-CL')}`
  
  const valorPromedio = datos.totalCunas > 0 
    ? Math.round(datos.valorCampana / datos.totalCunas) 
    : 0

  const handleEnviar = async () => {
    setEnviando(true)
    await new Promise(r => setTimeout(r, 2000))
    setEnviando(false)
    setEnviado(true)
    setTimeout(() => setEnviado(false), 3000)
  }

  const handleDescargarPDF = () => {
    // Mock de descarga
    alert('📄 Descargando PDF: Confirmacion_' + datos.campanaId + '.pdf')
  }

  const handleImprimir = () => {
    window.print()
  }

  const handleCopiarLink = () => {
    navigator.clipboard.writeText('https://silexar.com/confirmacion/' + datos.campanaId)
    alert('📋 Link copiado al portapapeles')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 border-blue-100">
        <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50">
          <CardTitle className="text-xl flex items-center gap-2">
            <FileText className="h-6 w-6 text-blue-600" />
            📄 GENERADOR CONFIRMACIÓN HORARIA PROFESIONAL
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuración */}
        <div className="space-y-4">
          {/* Template */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Settings className="h-4 w-4" />
                🎯 CONFIGURACIÓN DOCUMENTO
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>📋 Template</Label>
                <Select value={template} onValueChange={setTemplate}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TEMPLATES.map(t => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="border-t pt-4">
                <Label>📧 DESTINATARIOS</Label>
                <div className="space-y-2 mt-2">
                  <div>
                    <Label className="text-xs text-gray-500">Principal</Label>
                    <Input value={emailPrincipal} onChange={e => setEmailPrincipal(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Copia (CC)</Label>
                    <Input value={emailCopia} onChange={e => setEmailCopia(e.target.value)} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Copia Oculta (BCC)</Label>
                    <Input value={emailOculto} onChange={e => setEmailOculto(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="border-t pt-4">
                <Label>🎨 PERSONALIZACIÓN</Label>
                <div className="space-y-2 mt-2">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={incluirLogo} onCheckedChange={(v) => setIncluirLogo(!!v)} />
                    Incluir logo cliente
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={incluirTecnicos} onCheckedChange={(v) => setIncluirTecnicos(!!v)} />
                    Incluir detalles técnicos
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={incluirMetricas} onCheckedChange={(v) => setIncluirMetricas(!!v)} />
                    Incluir métricas proyectadas
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox checked={incluirContactos} onCheckedChange={(v) => setIncluirContactos(!!v)} />
                    Incluir contactos responsables
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-slate-200">
            <CardHeader className="pb-2 bg-slate-50">
              <CardTitle className="text-base">📊 PREVIEW CONFIRMACIÓN</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {/* Documento Preview */}
              <div className="p-6 bg-white border-b">
                {/* Header documento */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center gap-3">
                    {incluirLogo && (
                      <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
                        🏦
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-blue-900">{datos.cliente}</h3>
                      <p className="text-sm text-gray-500">{datos.producto}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-blue-100 text-blue-700">📅 Confirmación Horaria</Badge>
                    <p className="text-xs text-gray-500 mt-1">{new Date().toLocaleDateString('es-CL')}</p>
                  </div>
                </div>

                {/* Nombre campaña */}
                <div className="text-center py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg mb-4">
                  <h2 className="text-xl font-bold text-gray-900">{datos.campana}</h2>
                </div>

                {/* Datos generales */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Campaña:</span>
                      <span className="font-mono">{datos.campanaId}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Contrato:</span>
                      <span className="font-mono">{datos.contrato}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Período:</span>
                      <span>{datos.periodo}</span>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Radio className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Emisora:</span>
                      <span>{datos.emisora}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">Ejecutivo:</span>
                      <span>{datos.ejecutivo}</span>
                    </div>
                  </div>
                </div>

                {/* Resumen financiero */}
                {incluirMetricas && (
                  <div className="bg-green-50 rounded-lg p-4 mb-4">
                    <h4 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      💰 RESUMEN FINANCIERO
                    </h4>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Valor Campaña:</span>
                        <div className="font-bold text-green-700">{formatMoney(datos.valorCampana)}</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Cuñas:</span>
                        <div className="font-bold">{datos.totalCunas} spots</div>
                      </div>
                      <div>
                        <span className="text-gray-600">Valor Promedio:</span>
                        <div className="font-bold">{formatMoney(valorPromedio)} / spot</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Tabla programación */}
                {incluirTecnicos && (
                  <div className="mb-4">
                    <h4 className="font-semibold text-gray-800 mb-2">📊 DETALLE PROGRAMACIÓN</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs border">
                        <thead className="bg-slate-100">
                          <tr>
                            <th className="px-2 py-1 border text-left">Fecha</th>
                            <th className="px-2 py-1 border text-left">Hora</th>
                            <th className="px-2 py-1 border text-left">Bloque</th>
                            <th className="px-2 py-1 border text-left">Material</th>
                            <th className="px-2 py-1 border text-center">Duración</th>
                            <th className="px-2 py-1 border text-center">Posición</th>
                            <th className="px-2 py-1 border text-right">Costo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datos.programacion.slice(0, 5).map((item) => (
                            <tr key={`${item.fecha}-${item.hora}-${item.bloque}`} className="hover:bg-slate-50">
                              <td className="px-2 py-1 border">{item.fecha}</td>
                              <td className="px-2 py-1 border">{item.hora}</td>
                              <td className="px-2 py-1 border">{item.bloque}</td>
                              <td className="px-2 py-1 border font-mono">{item.material}</td>
                              <td className="px-2 py-1 border text-center">{item.duracion}</td>
                              <td className="px-2 py-1 border text-center">{item.posicion}</td>
                              <td className="px-2 py-1 border text-right">{formatMoney(item.costo)}</td>
                            </tr>
                          ))}
                          <tr className="bg-slate-50">
                            <td colSpan={6} className="px-2 py-1 border text-right font-semibold">...</td>
                            <td className="px-2 py-1 border text-right font-semibold text-xs">+ {datos.totalCunas - 5} más</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Contactos */}
                {incluirContactos && (
                  <div className="bg-slate-50 rounded-lg p-3 text-sm">
                    <h4 className="font-semibold mb-2">📞 CONTACTOS</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div>• Traffic: Carlos Ruiz - carlos@silexar.com</div>
                      <div>• Comercial: Ana García - ana@silexar.com</div>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="mt-4 pt-4 border-t text-center text-xs text-gray-500">
                  ✅ Confirmado: {new Date().toLocaleDateString('es-CL')} - Válido hasta emisión
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="grid grid-cols-3 gap-3 mt-4">
            <Button 
              className="gap-2 bg-blue-600 hover:bg-blue-700"
              onClick={handleEnviar}
              disabled={enviando}
            >
              {enviando ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : enviado ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <Mail className="h-4 w-4" />
              )}
              {enviado ? '✅ Enviado!' : '📧 ENVIAR POR EMAIL'}
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleDescargarPDF}>
              <Download className="h-4 w-4" />
              📄 DESCARGAR PDF
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleImprimir}>
              <Printer className="h-4 w-4" />
              🖨️ IMPRIMIR
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 mt-2">
            <Button variant="ghost" className="gap-2" onClick={handleCopiarLink}>
              <Link2 className="h-4 w-4" />
              📋 COPIAR LINK
            </Button>
            <Button variant="ghost" className="gap-2">
              <Settings className="h-4 w-4" />
              ⚙️ PERSONALIZAR
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmacionHoraria
