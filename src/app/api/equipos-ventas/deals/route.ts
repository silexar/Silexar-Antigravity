/**
 * 🚀 API: Equipos Ventas — Deals Premium
 * 
 * Endpoints para: deals, actividades, stakeholders,
 * messaging templates, objeciones, meeting prep, activity log.
 * 
 * @tier TIER_0_FORTUNE_10
 */

import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

// ═══════════════════════════════════════════════════════════════
// GET /api/equipos-ventas/deals
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tipo = searchParams.get('tipo') || 'deals';

    switch (tipo) {
      case 'deals':
        return NextResponse.json({
          success: true,
          data: MOCK_DEALS,
          stats: {
            totalDeals: MOCK_DEALS.length,
            valorTotal: MOCK_DEALS.reduce((s, d) => s + d.valor, 0),
            urgentes: MOCK_DEALS.filter(d => d.urgenciaNivel === 'critica' || d.urgenciaNivel === 'alta').length,
          }
        });

      case 'templates':
        return NextResponse.json({ success: true, data: MOCK_TEMPLATES });

      case 'objeciones':
        return NextResponse.json({ success: true, data: MOCK_OBJECIONES });

      case 'reuniones':
        return NextResponse.json({ success: true, data: MOCK_REUNIONES });

      case 'activity-log':
        return NextResponse.json({ success: true, data: MOCK_ACTIVITY_LOG });

      default:
        return NextResponse.json({ success: false, error: 'Tipo no reconocido' }, { status: 400 });
    }
  } catch (error) {
    logger.error('[API/EquiposVentas/Deals] Error GET:', error instanceof Error ? error : undefined, { module: 'equipos-ventas/deals', action: 'GET' });
    return apiServerError()
  }
}

// ═══════════════════════════════════════════════════════════════
// POST /api/equipos-ventas/deals
// ═══════════════════════════════════════════════════════════════

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accion } = body;

    switch (accion) {
      case 'generar-mensaje':
        return NextResponse.json({
          success: true,
          data: {
            asunto: `Propuesta comercial para ${body.cliente || 'su empresa'}`,
            cuerpo: `Estimado/a ${body.contacto || 'cliente'},\n\nEs un placer contactarle desde Silexar Pulse. Basándonos en nuestra conversación reciente, me gustaría presentarle una propuesta adaptada a las necesidades de ${body.cliente}.\n\n${body.contexto || 'Nuestra solución enterprise ofrece las mejores herramientas del mercado.'}\n\nQuedo a su disposición para agendar una reunión.\n\nSaludos cordiales.`,
          }
        });

      case 'prep-reunion':
        return NextResponse.json({
          success: true,
          data: {
            bio: `${body.contacto || 'Contacto'} — ${body.cargo || 'Director'} en ${body.empresa || 'Empresa'}. Experiencia en transformación digital.`,
            historial: ['Reunión inicial (15 enero)', 'Demo técnica (22 enero)', 'Propuesta enviada (28 enero)'],
            objeciones: ['Presupuesto limitado Q1', 'Integración con sistema legacy'],
            talkingPoints: ['Revisar ROI proyectado', 'Presentar case study similar', 'Proponer piloto 30 días', 'Confirmar timeline implementación'],
            docs: ['Propuesta_v2.pdf', 'ROI_Calculator.xlsx'],
          }
        });

      default:
        return NextResponse.json({ success: true, id: `new-${Date.now()}` });
    }
  } catch (error) {
    logger.error('[API/EquiposVentas/Deals] Error POST:', error instanceof Error ? error : undefined, { module: 'equipos-ventas/deals', action: 'POST' });
    return apiServerError()
  }
}

// ═══════════════════════════════════════════════════════════════
// MOCK DATA
// ═══════════════════════════════════════════════════════════════

const MOCK_DEALS = [
  { id: 'd1', cliente: 'TechCorp Global', contacto: 'James Thompson', email: 'james@techcorp.com', tel: '+1-555-0142', titulo: 'Enterprise SaaS Q2', valor: 450000, stage: 'negociacion', prob: 75, urgenciaScore: 92, urgenciaNivel: 'critica', diasSinContacto: 3, fechaCierre: '2025-03-15', actividades: [{ tipo: 'llamada', fecha: '2025-02-25', desc: 'Demo técnica exitosa' }, { tipo: 'email', fecha: '2025-02-26', desc: 'Enviada propuesta v2' }], stakeholders: [{ nombre: 'James Thompson', cargo: 'CTO', influencia: 90, posicion: 'champion' }, { nombre: 'Sarah Chen', cargo: 'CFO', influencia: 85, posicion: 'neutral' }, { nombre: 'Mike Davis', cargo: 'VP Eng', influencia: 60, posicion: 'supporter' }] },
  { id: 'd2', cliente: 'FinServ Solutions', contacto: 'Laura Martínez', email: 'laura@finserv.com', tel: '+56-2-2345-0189', titulo: 'Platform Migration', valor: 280000, stage: 'propuesta', prob: 55, urgenciaScore: 78, urgenciaNivel: 'alta', diasSinContacto: 5, fechaCierre: '2025-04-01', actividades: [{ tipo: 'reunion', fecha: '2025-02-20', desc: 'Kick-off meeting' }, { tipo: 'email', fecha: '2025-02-23', desc: 'Follow-up con specs' }], stakeholders: [{ nombre: 'Laura Martínez', cargo: 'COO', influencia: 95, posicion: 'champion' }, { nombre: 'Carlos Ruiz', cargo: 'CTO', influencia: 80, posicion: 'blocker' }] },
  { id: 'd3', cliente: 'HealthTech Labs', contacto: 'Ana Rodríguez', email: 'ana@healthtech.com', tel: '+56-9-8765-4321', titulo: 'Analytics Dashboard', valor: 120000, stage: 'calificado', prob: 35, urgenciaScore: 45, urgenciaNivel: 'media', diasSinContacto: 1, fechaCierre: '2025-05-15', actividades: [{ tipo: 'llamada', fecha: '2025-02-27', desc: 'Discovery call' }], stakeholders: [{ nombre: 'Ana Rodríguez', cargo: 'Head of Data', influencia: 70, posicion: 'supporter' }] },
  { id: 'd4', cliente: 'RetailMax', contacto: 'Pedro Soto', email: 'psoto@retailmax.cl', tel: '+56-9-1234-5678', titulo: 'Omnichannel Integration', valor: 680000, stage: 'negociacion', prob: 80, urgenciaScore: 88, urgenciaNivel: 'critica', diasSinContacto: 0, fechaCierre: '2025-03-08', actividades: [{ tipo: 'reunion', fecha: '2025-02-28', desc: 'Negociación final pricing' }, { tipo: 'email', fecha: '2025-02-28', desc: 'Contrato draft enviado' }], stakeholders: [{ nombre: 'Pedro Soto', cargo: 'CEO', influencia: 100, posicion: 'champion' }, { nombre: 'María Vega', cargo: 'Legal', influencia: 50, posicion: 'neutral' }] },
];

const MOCK_TEMPLATES = [
  { id: 't1', categoria: 'prospeccion', titulo: 'Primer contacto frío', canal: 'email', asunto: 'Solución para {{problema}}', cuerpo: 'Estimado/a {{nombre}},\n\nIdentifiqué que {{empresa}} podría beneficiarse de nuestra solución para {{problema}}.\n\n¿Tendría 15 min para una breve llamada?\n\nSaludos.', tasaRespuesta: 22, vecesUsado: 145 },
  { id: 't2', categoria: 'follow_up', titulo: 'Follow-up post demo', canal: 'email', asunto: 'Resumen y próximos pasos — {{empresa}}', cuerpo: 'Hola {{nombre}},\n\nGracias por su tiempo en la demo. Adjunto resumen de puntos clave:\n\n{{puntos_clave}}\n\nPróximo paso: {{proximo_paso}}\n\n¿Le parece agendar para {{fecha}}?', tasaRespuesta: 58, vecesUsado: 89 },
  { id: 't3', categoria: 'propuesta', titulo: 'Envío de propuesta', canal: 'email', asunto: 'Propuesta comercial {{empresa}} — {{producto}}', cuerpo: 'Estimado/a {{nombre}},\n\nAdjunto propuesta detallada con:\n- Alcance: {{alcance}}\n- Inversión: {{monto}}\n- Timeline: {{timeline}}\n\nDescuento especial: {{descuento}}% válido hasta {{fecha_limite}}.', tasaRespuesta: 45, vecesUsado: 67 },
  { id: 't4', categoria: 'cierre', titulo: 'Último push cierre', canal: 'whatsapp', asunto: '', cuerpo: 'Hola {{nombre}} 👋\n\nQuería confirmar si pudieron revisar la propuesta. Recordar que el descuento de {{descuento}}% vence el {{fecha}}.\n\n¿Agendamos firma para esta semana? 📝', tasaRespuesta: 62, vecesUsado: 34 },
  { id: 't5', categoria: 'post_venta', titulo: 'Check-in satisfacción', canal: 'email', asunto: 'Cómo va todo con {{producto}} — {{empresa}}', cuerpo: 'Hola {{nombre}},\n\nHan pasado {{dias}} días desde la implementación. ¿Cómo va todo?\n\nMe encantaría agendar un check-in de 15 min para asegurar que está obteniendo el máximo valor.', tasaRespuesta: 71, vecesUsado: 23 },
];

const MOCK_OBJECIONES = [
  { id: 'o1', categoria: 'precio', objecion: 'Es muy caro para nuestro presupuesto', respuesta: 'Entiendo la preocupación. Comparemos el ROI: por cada $1 invertido, nuestros clientes obtienen $3.2 en retorno en 12 meses. Además, ofrecemos planes de pago flexibles y un piloto gratuito de 30 días para validar el valor.', tasaExito: 68, vecesUsada: 234, ejemplo: 'TechCorp tenía el mismo concern. Después del piloto, cerraron por el plan enterprise completo.' },
  { id: 'o2', categoria: 'competencia', objecion: 'Ya estamos evaluando a CompetitorX', respuesta: 'Es excelente que estén evaluando opciones. Nuestras 3 diferencias clave son: 1) Integración nativa con sus sistemas actuales, 2) Soporte 24/7 en español, 3) Customización sin costo extra. ¿Les gustaría ver un comparativo lado a lado?', tasaExito: 55, vecesUsada: 156, ejemplo: 'FinServ estaba con CompetitorX pero migró por nuestras integraciones nativas.' },
  { id: 'o3', categoria: 'timing', objecion: 'No es el momento, quizás el próximo trimestre', respuesta: 'Comprendo. Sin embargo, cada mes de espera son $X en oportunidades perdidas. ¿Qué tal si empezamos con un piloto ligero ahora y escalamos cuando sea más conveniente? Así no pierden ventana competitiva.', tasaExito: 42, vecesUsada: 189, ejemplo: 'HealthTech dijo lo mismo pero el piloto les mostró valor inmediato.' },
  { id: 'o4', categoria: 'features', objecion: 'Les falta la funcionalidad X que necesitamos', respuesta: 'Gracias por compartir esa necesidad. Déjeme verificar: [X] está en nuestro roadmap Q2/Q3. Mientras tanto, hemos ayudado a clientes similares con [alternativa]. ¿Le gustaría ver cómo?', tasaExito: 61, vecesUsada: 98, ejemplo: 'RetailMax necesitaba integración SAP, la entregamos en 3 semanas custom.' },
  { id: 'o5', categoria: 'contrato', objecion: 'El contrato de 12 meses es muy largo', respuesta: 'Ofrecemos flexibilidad: podemos comenzar con 6 meses con opción de extensión. También tenemos cláusula de salida con 30 días de aviso. Lo importante es que usted vea valor antes de comprometer largo plazo.', tasaExito: 73, vecesUsada: 67, ejemplo: 'La mayoría de clientes que empiezan en 6 meses renuevan por 12+.' },
];

const MOCK_REUNIONES = [
  { id: 'r1', titulo: 'Negociación final TechCorp', fecha: '2025-02-28T15:00:00', contacto: 'James Thompson', cargo: 'CTO', empresa: 'TechCorp', dealId: 'd1', bio: 'CTO con 15 años en tech. Ex-Google, MBA Stanford.', historial: ['Demo exitosa', 'Propuesta v2 enviada', 'Interés en plan enterprise'], objeciones: ['Pricing vs CompetitorX'], talkingPoints: ['ROI 3.2x validado', 'Case study similar', 'Timeline 6 semanas', 'Descuento cierre Q1'], docs: ['Propuesta_TechCorp_v2.pdf'] },
  { id: 'r2', titulo: 'Follow-up FinServ', fecha: '2025-03-01T10:00:00', contacto: 'Laura Martínez', cargo: 'COO', empresa: 'FinServ', dealId: 'd2', bio: 'COO liderando transformación digital FinServ.', historial: ['Kick-off meeting', 'Specs técnicos enviados'], objeciones: ['CTO Carlos Ruiz es blocker', 'Integración legacy'], talkingPoints: ['Abordar concerns de Carlos', 'Demo integración legacy', 'Proponer workshop técnico'], docs: ['Specs_FinServ.pdf', 'Integration_Guide.pdf'] },
];

const MOCK_ACTIVITY_LOG = Array.from({ length: 30 }, (_, day) => ({
  fecha: new Date(2025, 1, day + 1).toISOString().split('T')[0],
  llamadas: Math.floor(Math.random() * 12),
  emails: Math.floor(Math.random() * 20),
  reuniones: Math.floor(Math.random() * 4),
  deals: Math.floor(Math.random() * 2),
  total: 0,
})).map(d => ({ ...d, total: d.llamadas + d.emails + d.reuniones + d.deals }));
