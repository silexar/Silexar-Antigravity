/**
 * COMPONENTE: Modal de Creación de Anunciante
 * 
 * @description Formulario completo para crear nuevos anunciantes con
 * integración automática de Cortex-Risk para evaluación crediticia
 * 
 * @tier TIER_0_FORTUNE_10
 * @security_level MILITARY_GRADE
 */

'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { cortexRisk } from '@/lib/cortex/cortex-risk'
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin,
  Shield,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react'

interface CreateAnuncianteModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (anunciante: Record<string, unknown>) => void
}

export default function CreateAnuncianteModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: CreateAnuncianteModalProps) {
  const [formData, setFormData] = useState({
    rut: '',
    razonSocial: '',
    nombreFantasia: '',
    giroComercial: '',
    industria: '',
    contactoPrincipal: '',
    email: '',
    telefono: '',
    direccion: '',
    ejecutivoAsignado: ''
  })

  const [isEvaluatingRisk, setIsEvaluatingRisk] = useState(false)
  const [riskEvaluation, setRiskEvaluation] = useState<Record<string, unknown> | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Reset risk evaluation if RUT changes
    if (field === 'rut' && riskEvaluation) {
      setRiskEvaluation(null)
    }
  }

  const handleEvaluateRisk = async () => {
    if (!formData.rut || !formData.razonSocial) {
      alert('Por favor ingresa RUT y Razón Social antes de evaluar riesgo')
      return
    }

    setIsEvaluatingRisk(true)
    try {
      const riskInput = {
        rut: formData.rut,
        companyName: formData.razonSocial,
        industry: formData.industria || 'General'
      }
      
      const assessment = await cortexRisk.assessRisk(riskInput)
      setRiskEvaluation(assessment)
      
    } catch (error) {
      console.error('Error evaluando riesgo:', error)
      alert('Error al evaluar riesgo crediticio')
    } finally {
      setIsEvaluatingRisk(false)
    }
  }

  const handleSubmit = async () => {
    if (!riskEvaluation) {
      alert('Debe evaluar el riesgo crediticio antes de crear el anunciante')
      return
    }

    setIsSubmitting(true)
    try {
      // Simular creación del anunciante
      const newAnunciante = {
        id: `anun_${Date.now()}`,
        ...formData,
        estado: 'activo' as const,
        clasificacionRiesgo: riskEvaluation.riskScore.category,
        scoreRiesgo: riskEvaluation.riskScore.score,
        facturacionAcumulada: 0,
        fechaUltimaCampana: new Date().toISOString().split('T')[0]
      }

      onSuccess(newAnunciante)
      onClose()
      
      // Reset form
      setFormData({
        rut: '',
        razonSocial: '',
        nombreFantasia: '',
        giroComercial: '',
        industria: '',
        contactoPrincipal: '',
        email: '',
        telefono: '',
        direccion: '',
        ejecutivoAsignado: ''
      })
      setRiskEvaluation(null)
      
    } catch (error) {
      console.error('Error creando anunciante:', error)
      alert('Error al crear anunciante')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-slate-900 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-2xl text-white flex items-center gap-3">
            <Building2 className="h-6 w-6 text-blue-400" />
            Crear Nuevo Anunciante
            {riskEvaluation && (
              <Badge className={`ml-2 ${
                riskEvaluation.riskScore.category === 'AAA' ? 'bg-green-500' :
                riskEvaluation.riskScore.category === 'AA' ? 'bg-green-400' :
                riskEvaluation.riskScore.category === 'A' ? 'bg-lime-500' :
                riskEvaluation.riskScore.category === 'BBB' ? 'bg-yellow-500' :
                riskEvaluation.riskScore.category === 'BB' ? 'bg-orange-500' :
                'bg-red-500'
              } text-white`}>
                {riskEvaluation.riskScore.category} - {riskEvaluation.riskScore.score}
              </Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Columna Izquierda - Datos Corporativos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-400" />
              Datos Corporativos
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="rut" className="text-slate-300">RUT *</Label>
                <Input
                  id="rut"
                  value={formData.rut}
                  onChange={(e) => handleInputChange('rut', e.target.value)}
                  placeholder="12.345.678-9"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="razonSocial" className="text-slate-300">Razón Social *</Label>
                <Input
                  id="razonSocial"
                  value={formData.razonSocial}
                  onChange={(e) => handleInputChange('razonSocial', e.target.value)}
                  placeholder="Empresa S.A."
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="nombreFantasia" className="text-slate-300">Nombre Fantasía</Label>
                <Input
                  id="nombreFantasia"
                  value={formData.nombreFantasia}
                  onChange={(e) => handleInputChange('nombreFantasia', e.target.value)}
                  placeholder="Marca Comercial"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="industria" className="text-slate-300">Industria *</Label>
                <Select onValueChange={(value) => handleInputChange('industria', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Seleccionar industria" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Banca y Finanzas">Banca y Finanzas</SelectItem>
                    <SelectItem value="Retail">Retail</SelectItem>
                    <SelectItem value="Tecnología">Tecnología</SelectItem>
                    <SelectItem value="Salud">Salud</SelectItem>
                    <SelectItem value="Educación">Educación</SelectItem>
                    <SelectItem value="Telecomunicaciones">Telecomunicaciones</SelectItem>
                    <SelectItem value="Automotriz">Automotriz</SelectItem>
                    <SelectItem value="Construcción">Construcción</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="giroComercial" className="text-slate-300">Giro Comercial</Label>
                <Textarea
                  id="giroComercial"
                  value={formData.giroComercial}
                  onChange={(e) => handleInputChange('giroComercial', e.target.value)}
                  placeholder="Descripción del giro comercial"
                  className="bg-slate-800 border-slate-600 text-white"
                  rows={2}
                />
              </div>

              <div>
                <Label htmlFor="direccion" className="text-slate-300">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder="Dirección completa"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>
            </div>
          </div>

          {/* Columna Derecha - Contacto y Evaluación */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <User className="h-5 w-5 text-green-400" />
              Contacto Principal
            </h3>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="contactoPrincipal" className="text-slate-300">Nombre Contacto *</Label>
                <Input
                  id="contactoPrincipal"
                  value={formData.contactoPrincipal}
                  onChange={(e) => handleInputChange('contactoPrincipal', e.target.value)}
                  placeholder="Nombre del contacto"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-slate-300">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="contacto@empresa.cl"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="telefono" className="text-slate-300">Teléfono</Label>
                <Input
                  id="telefono"
                  value={formData.telefono}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  placeholder="+56 2 2000 0000"
                  className="bg-slate-800 border-slate-600 text-white"
                />
              </div>

              <div>
                <Label htmlFor="ejecutivoAsignado" className="text-slate-300">Ejecutivo Asignado</Label>
                <Select onValueChange={(value) => handleInputChange('ejecutivoAsignado', value)}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                    <SelectValue placeholder="Seleccionar ejecutivo" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="Juan Pérez">Juan Pérez</SelectItem>
                    <SelectItem value="Ana Silva">Ana Silva</SelectItem>
                    <SelectItem value="Luis Torres">Luis Torres</SelectItem>
                    <SelectItem value="María López">María López</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Evaluación de Riesgo */}
            <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-600">
              <h4 className="text-white font-medium flex items-center gap-2 mb-3">
                <Shield className="h-5 w-5 text-red-400" />
                Evaluación Cortex-Risk
              </h4>
              
              {!riskEvaluation ? (
                <Button
                  onClick={handleEvaluateRisk}
                  disabled={isEvaluatingRisk || !formData.rut || !formData.razonSocial}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50"
                >
                  {isEvaluatingRisk ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Evaluando Riesgo...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Evaluar Riesgo Crediticio
                    </>
                  )}
                </Button>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Score de Riesgo:</span>
                    <Badge className={`${
                      riskEvaluation.riskScore.category === 'AAA' ? 'bg-green-500' :
                      riskEvaluation.riskScore.category === 'AA' ? 'bg-green-400' :
                      riskEvaluation.riskScore.category === 'A' ? 'bg-lime-500' :
                      riskEvaluation.riskScore.category === 'BBB' ? 'bg-yellow-500' :
                      riskEvaluation.riskScore.category === 'BB' ? 'bg-orange-500' :
                      'bg-red-500'
                    } text-white`}>
                      {riskEvaluation.riskScore.category} - {riskEvaluation.riskScore.score}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Términos Recomendados:</span>
                    <span className="text-white font-medium">
                      {riskEvaluation.paymentRecommendation.recommendedTerms}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Límite de Crédito:</span>
                    <span className="text-white font-medium">
                      ${riskEvaluation.paymentRecommendation.creditLimit.toLocaleString()}
                    </span>
                  </div>
                  
                  {riskEvaluation.paymentRecommendation.requiresGuarantee && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm">Requiere garantía</span>
                    </div>
                  )}
                  
                  <Button
                    onClick={handleEvaluateRisk}
                    variant="outline"
                    size="sm"
                    className="w-full border-slate-600 text-slate-400"
                  >
                    Re-evaluar Riesgo
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4 pt-6 border-t border-slate-700">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="border-slate-600 text-slate-400"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !riskEvaluation}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Crear Anunciante
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}