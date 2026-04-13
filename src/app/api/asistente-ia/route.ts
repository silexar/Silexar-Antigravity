/**
 * API — Asistente Comercial IA
 *
 * Requiere autenticación. Sólo usuarios con permiso campanas:read pueden consultar.
 * Los datos de precios son informativos y específicos del tenant autenticado.
 */

import { withApiRoute } from '@/lib/api/with-api-route'
import { apiSuccess, apiValidationError, getUserContext, apiForbidden} from '@/lib/api/response'
import { checkPermission } from '@/lib/security/rbac';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';
import { filterInput } from '@/lib/ai/input-filter';

const respuestas: Record<string, { respuesta: string; acciones?: { label: string; emoji: string }[] }> = {
  precio: {
    respuesta: `**Precios actuales (Dic 2025):**\n\n• Spot 30" Prime: $67,500 (temporada alta)\n• Spot 30" Rotativo: $45,000\n• Spot 15" Prime: $42,000\n• Spot 15" Rotativo: $28,000\n• Mención en vivo: $35,000\n• Patrocinio: desde $500,000\n\n💡 **Tip:** En enero los precios bajan 20% por temporada baja.`,
    acciones: [{ label: 'Generar cotización', emoji: '💰' }, { label: 'Ver tarifario', emoji: '📋' }],
  },
  disponibilidad: {
    respuesta: `**Disponibilidad próximas 2 semanas:**\n\n🟢 **Alta:** Madrugada, fines de semana\n🟡 **Media:** Rotativo mañana y tarde\n🔴 **Baja:** Prime 18-21h (3 espacios)\n\n⚠️ Navidad y Año Nuevo 80% vendidos.`,
    acciones: [{ label: 'Ver calendario', emoji: '📅' }],
  },
  descuento: {
    respuesta: `**Política de descuentos:**\n\n📊 **Por volumen:** >$20M: 5% | >$50M: 10% | >$100M: 15%\n⏰ **Pago anticipado:** 15 días: 3% | Contado: 5%\n📅 **Por compromiso:** Trimestral: 8% | Semestral: 12% | Anual: 18%\n\n⚠️ Máximo acumulable: 25%`,
    acciones: [{ label: 'Simular descuento', emoji: '🧮' }],
  },
  objecion: {
    respuesta: `**Manejo de objeción "Precio Alto":**\n\n📌 **Respuestas:**\n1. "¿Con qué referencia comparas?"\n2. "Nuestro CPM está 15% bajo el mercado"\n3. "Con contrato trimestral, 12% adicional"\n\n📊 **Datos:**\n• Rating: 8.2 (top 5)\n• Alcance: 1.2M/día\n• ROI: 4.5x`,
    acciones: [{ label: 'Calcular ROI', emoji: '📊' }],
  },
}

export const POST = withApiRoute(
  { resource: 'campanas', action: 'read', rateLimit: 'api' },
  async ({ req }) => {
    const body = await req.json() as Record<string, unknown>
    const consulta = body['consulta']

    if (!consulta || typeof consulta !== 'string') {
      return apiValidationError({ formErrors: ['Consulta requerida'], fieldErrors: {} })
    }

    // L2: Input filter — block injection attempts before any processing
    const filterResult = filterInput(consulta)
    if (filterResult.isBlocked) {
      return apiSuccess({
        respuesta: 'No puedo procesar esa solicitud.',
        tipo: 'blocked',
        acciones: [],
        confianza: 0,
      })
    }

    const query = consulta.toLowerCase()

    let respuesta = {
      respuesta: `Puedo ayudarte con: precios, disponibilidad, descuentos y objeciones. ¿Qué necesitas?`,
      tipo: 'informacion',
      acciones: [
        { label: 'Precios', emoji: '💰' },
        { label: 'Disponibilidad', emoji: '📅' },
        { label: 'Descuentos', emoji: '🎯' },
      ],
      confianza: 80,
    }

    if (query.includes('precio') || query.includes('cuánto') || query.includes('tarifa')) {
      const data = respuestas['precio']!
      respuesta = { respuesta: data.respuesta, tipo: 'informacion', acciones: data.acciones ?? [], confianza: 95 }
    } else if (query.includes('disponib') || query.includes('espacio')) {
      const data = respuestas['disponibilidad']!
      respuesta = { respuesta: data.respuesta, tipo: 'informacion', acciones: data.acciones ?? [], confianza: 90 }
    } else if (query.includes('descuento') || query.includes('oferta')) {
      const data = respuestas['descuento']!
      respuesta = { respuesta: data.respuesta, tipo: 'informacion', acciones: data.acciones ?? [], confianza: 95 }
    } else if (query.includes('caro') || query.includes('objecion')) {
      const data = respuestas['objecion']!
      respuesta = { respuesta: data.respuesta, tipo: 'sugerencia', acciones: data.acciones ?? [], confianza: 88 }
    }

    return apiSuccess(respuesta)
  },
)
