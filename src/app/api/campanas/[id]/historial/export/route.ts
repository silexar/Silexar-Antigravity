import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/observability';
import { apiSuccess, apiError, apiUnauthorized, apiForbidden, apiServerError, getUserContext } from '@/lib/api/response';
import { PropiedadesIntegrationAPI } from '../../../../../../modules/propiedades/api/PropiedadesIntegrationAPI';
import { MockTipoPropiedadRepository, MockValorPropiedadRepository } from '../../../../../../modules/propiedades/infrastructure/repositories/MockPropiedadRepository';
import { auditLogger } from '@/lib/security/audit-logger';
import { withTenantContext } from '@/lib/db/tenant-context';

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    // [TIER 0] INTEGRACIÓN REPORTES: Snapshot inmutable de las propiedades
    const propiedadesAPI = new PropiedadesIntegrationAPI(
      new MockTipoPropiedadRepository(),
      new MockValorPropiedadRepository()
    );

    // Simulamos las propiedades asignadas a esta campaña particular
    const propiedadesActivas = [
      { tipoCodigo: 'TIPO_PEDIDO', valorId: 'val_01_publicidad', nombre: 'Pauta comercial estándar' },
      { tipoCodigo: 'CATEGORIA', valorId: 'val_cat_bancos', nombre: 'Servicios financieros' }
    ];

    const snapshots = await Promise.all(
      propiedadesActivas.map(async p => {
        const res = await propiedadesAPI.generarSnapshotPropiedad(p.tipoCodigo, p.valorId);
        return res.isSuccess ? 'value' in res ? res.value : null : null;
      })
    );

    return NextResponse.json({
      success: true,
      data: {
        campanaId: params.id,
        exportedAt: new Date().toISOString(),
        historial: [
          { accion: 'CREACION', fecha: new Date().toISOString(), usuario: 'Sistema' }
        ],
        snapshotPropiedadesContexto: snapshots.filter(s => s !== null)
      }
    });
  } catch (error) {
    logger.error('[API/Campanas/Historial/Export] Error GET:', error instanceof Error ? error : undefined, { module: 'campanas/historial/export', action: 'GET' })
    return apiServerError()
  }
}
