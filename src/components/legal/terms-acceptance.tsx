'use client'

/**
 * 📋 SILEXAR PULSE - Terms of Service Acceptance
 * Componente de aceptación de términos de servicio
 * 
 * @description ToS Features:
 * - Modal de aceptación obligatoria
 * - Versioning de términos
 * - Registro de consentimiento
 * - Links a documentos legales
 * 
 * @version 2025.1.0
 * @tier TIER_0_FORTUNE_10
 */

import { useState } from 'react'
import { N, getFloatingShadow } from '@/components/admin/_sdk/AdminDesignSystem'
import { NeuCard, NeuButton } from '@/components/admin/_sdk/AdminDesignSystem'
import {
  FileText, CheckSquare, Square, ExternalLink, AlertTriangle,
  Shield, Lock, Eye, Clock
} from 'lucide-react'

interface TermsVersion {
  version: string
  effectiveDate: Date
  sections: {
    title: string
    content: string
  }[]
}

interface TermsAcceptanceProps {
  userName: string
  userEmail: string
  onAccept: (consents: ConsentData) => void
  onDecline: () => void
}

interface ConsentData {
  termsAccepted: boolean
  privacyAccepted: boolean
  marketingOptIn: boolean
  analyticsOptIn: boolean
  version: string
  timestamp: Date
  ipAddress: string
}

const CURRENT_TERMS: TermsVersion = {
  version: '2.1.0',
  effectiveDate: new Date('2025-01-01'),
  sections: [
    {
      title: '1. Aceptación de Términos',
      content: 'Al acceder y utilizar Silexar Pulse, usted acepta estar legalmente obligado por estos términos de servicio. Si no está de acuerdo con alguno de estos términos, no debe utilizar el servicio.'
    },
    {
      title: '2. Uso del Servicio',
      content: 'Silexar Pulse es una plataforma de marketing empresarial. Usted se compromete a utilizar el servicio de manera legal y ética, respetando la privacidad de terceros y las regulaciones aplicables.'
    },
    {
      title: '3. Seguridad de la Cuenta',
      content: 'Usted es responsable de mantener la confidencialidad de sus credenciales de acceso. Cualquier actividad realizada con su cuenta es su responsabilidad. Debe notificar inmediatamente cualquier uso no autorizado.'
    },
    {
      title: '4. Protección de Datos',
      content: 'Nos comprometemos a proteger sus datos personales de acuerdo con las regulaciones aplicables (GDPR, CCPA). Consulte nuestra Política de Privacidad para más detalles sobre cómo procesamos sus datos.'
    },
    {
      title: '5. Propiedad Intelectual',
      content: 'Todo el contenido, diseño, código y materiales de Silexar Pulse son propiedad de Silexar SpA. Se prohíbe la reproducción no autorizada.'
    },
    {
      title: '6. Limitación de Responsabilidad',
      content: 'Silexar Pulse se proporciona "tal cual". No garantizamos disponibilidad ininterrumpida del servicio. Nuestra responsabilidad máxima se limita al monto pagado por el servicio en los últimos 12 meses.'
    }
  ]
}

export function TermsAcceptance({ userName, userEmail, onAccept, onDecline }: TermsAcceptanceProps) {
  const [consents, setConsents] = useState({
    termsAccepted: false,
    privacyAccepted: false,
    marketingOptIn: false,
    analyticsOptIn: true
  })
  const [showFullTerms, setShowFullTerms] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const canProceed = consents.termsAccepted && consents.privacyAccepted

  const handleAccept = async () => {
    if (!canProceed) return

    setIsSubmitting(true)
    await new Promise(r => setTimeout(r, 1000))

    const consentData: ConsentData = {
      ...consents,
      version: CURRENT_TERMS.version,
      timestamp: new Date(),
      ipAddress: '192.168.1.100' // En prod: obtener IP real
    }

    onAccept(consentData)
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <NeuCard style={{ boxShadow: getFloatingShadow(), padding: '1.5rem', background: N.base }} className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Términos de Servicio</h2>
              <p className="text-slate-400 text-sm">Por favor, revisa y acepta para continuar</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* User Info */}
          <div className="mb-6 p-4 bg-slate-800/50 rounded-lg">
            <p className="text-slate-400 text-sm">Aceptando como:</p>
            <p className="text-white font-medium">{userName}</p>
            <p className="text-slate-500 text-sm">{userEmail}</p>
          </div>

          {/* Terms Summary or Full */}
          {!showFullTerms ? (
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <h3 className="text-white font-medium mb-2 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Resumen de Términos
                </h3>
                <ul className="space-y-2 text-sm text-slate-400">
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    Uso del servicio para fines comerciales legítimos
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    Protección de sus datos según GDPR y regulaciones locales
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    Seguridad de cuenta es su responsabilidad
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckSquare className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                    Propiedad intelectual pertenece a Silexar
                  </li>
                </ul>
              </div>

              <button
                onClick={() => setShowFullTerms(true)}
                className="text-blue-400 hover:text-blue-300 text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                Ver términos completos
              </button>
            </div>
          ) : (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Términos Completos v{CURRENT_TERMS.version}</h3>
                <button
                  onClick={() => setShowFullTerms(false)}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  Ver resumen
                </button>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4 max-h-64 overflow-y-auto">
                {CURRENT_TERMS.sections.map((section, i) => (
                  <div key={`${section}-${i}`} className="mb-4">
                    <h4 className="text-white font-medium mb-2">{section.title}</h4>
                    <p className="text-slate-400 text-sm">{section.content}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Consent Checkboxes */}
          <div className="space-y-3">
            <h3 className="text-white font-medium mb-3">Consentimientos Requeridos</h3>

            {/* Terms - Required */}
            <label className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer border ${consents.termsAccepted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'
              }`}>
              <button onClick={() => setConsents({ ...consents, termsAccepted: !consents.termsAccepted })}>
                {consents.termsAccepted ? (
                  <CheckSquare className="w-5 h-5 text-green-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <p className="text-white">Acepto los Términos de Servicio *</p>
                <p className="text-slate-500 text-xs">Requerido para usar el servicio</p>
              </div>
            </label>

            {/* Privacy - Required */}
            <label className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer border ${consents.privacyAccepted ? 'bg-green-500/10 border-green-500/30' : 'bg-slate-800/50 border-slate-700'
              }`}>
              <button onClick={() => setConsents({ ...consents, privacyAccepted: !consents.privacyAccepted })}>
                {consents.privacyAccepted ? (
                  <CheckSquare className="w-5 h-5 text-green-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <p className="text-white">Acepto la Política de Privacidad *</p>
                <p className="text-slate-500 text-xs">Cómo procesamos tus datos</p>
              </div>
            </label>

            <h3 className="text-white font-medium mt-6 mb-3">Consentimientos Opcionales</h3>

            {/* Marketing - Optional */}
            <label className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer border ${consents.marketingOptIn ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700'
              }`}>
              <button onClick={() => setConsents({ ...consents, marketingOptIn: !consents.marketingOptIn })}>
                {consents.marketingOptIn ? (
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <p className="text-white">Recibir comunicaciones de marketing</p>
                <p className="text-slate-500 text-xs">Novedades, ofertas y actualizaciones (puedes cambiar esto después)</p>
              </div>
            </label>

            {/* Analytics - Optional */}
            <label className={`flex items-start gap-3 p-4 rounded-lg cursor-pointer border ${consents.analyticsOptIn ? 'bg-blue-500/10 border-blue-500/30' : 'bg-slate-800/50 border-slate-700'
              }`}>
              <button onClick={() => setConsents({ ...consents, analyticsOptIn: !consents.analyticsOptIn })}>
                {consents.analyticsOptIn ? (
                  <CheckSquare className="w-5 h-5 text-blue-400" />
                ) : (
                  <Square className="w-5 h-5 text-slate-500" />
                )}
              </button>
              <div>
                <p className="text-white">Permitir analytics de uso</p>
                <p className="text-slate-500 text-xs">Nos ayuda a mejorar el producto</p>
              </div>
            </label>
          </div>

          {/* Version Info */}
          <div className="mt-6 p-3 bg-slate-800/30 rounded-lg flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-4 h-4" />
            Versión {CURRENT_TERMS.version} • Vigente desde {CURRENT_TERMS.effectiveDate.toLocaleDateString()}
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-slate-700 flex items-center justify-between">
          <button
            onClick={onDecline}
            className="text-slate-400 hover:text-white"
          >
            Cancelar y salir
          </button>
          <NeuButton
            variant="primary"
            onClick={handleAccept}
            disabled={!canProceed || isSubmitting}
          >
            {isSubmitting ? 'Procesando...' : 'Aceptar y Continuar'}
          </NeuButton>
        </div>

        {/* Warning if not complete */}
        {!canProceed && (
          <div className="px-6 pb-4">
            <div className="p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-400 text-sm">Debes aceptar los términos requeridos para continuar</span>
            </div>
          </div>
        )}
      </NeuCard>
    </div>
  )
}

export default TermsAcceptance
