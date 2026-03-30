/**
 * 📋 SERVICIO CONTRATO - FRONTEND
 * Adaptador para consumir el servicio de infraestructura de contratos
 */
import { contractService as infraContractService } from '../../../contratos/infrastructure/ContractService';
import { ContractStatus } from '../../../contratos/domain/Contract';

export class ContratoService {

  async obtenerDisponibles(): Promise<Record<string, unknown>[]> {
    const contracts = await infraContractService.getAll();

    // Filtrar solo contratos activos o firmados si se desea, por ahora devolvemos todos
    // para facilitar las pruebas
    return contracts.map(c => ({
      id: c.id,
      numero: c.number,
      anunciante: c.advertiserId, // En un sistema real, esto sería el nombre del anunciante
      valorTotal: c.financials.netAmount,
      valor: c.financials.netAmount, // Compatibilidad
      fechaVigencia: c.endDate,
      estado: c.status.toUpperCase()
    }));
  }

  async obtenerDatos(contratoId: string): Promise<Record<string, unknown>> {
    const contracts = await infraContractService.getAll();
    const contract = contracts.find(c => c.id === contratoId);

    if (!contract) {
      throw new Error(`Contrato ${contratoId} no encontrado`);
    }

    // Datos simulados que no están en el modelo de contrato TIER 0 aún
    // pero son requeridos por el wizard
    return {
      anunciante: contract.advertiserId,
      vendedor: 'Ejecutivo de Cuentas TIER 0', // Simulado
      valorTotal: contract.financials.netAmount,
      agenciaCreativa: 'AGENCIA CREATIVA DEFAULT', // Simulado
      agenciaMedios: 'AGENCIA MEDIOS DEFAULT', // Simulado
      comisionAgencia: 15, // Simulado
      producto: 'Producto General', // Simulado
      fechaInicio: contract.startDate,
      fechaTermino: contract.endDate
    };
  }

  // Compatibilidad con componentes del wizard
  async obtenerContratosDisponibles(_opts?: Record<string, unknown>): Promise<Record<string, unknown>[]> {
    const disponibles = await this.obtenerDisponibles();
    // Estructura compatible con componentes del wizard
    return disponibles.map((c, idx) => ({
      id: c.id,
      numeroContrato: c.numero,
      nombreCliente: c.anunciante,
      nombreCampana: `Campaña ${idx + 1}`,
      fechaInicio: new Date(), // Default
      fechaFin: c.fechaVigencia,
      valorTotal: c.valorTotal,
      estado: c.estado,
      campanasCreadas: 0,
      campanasMaximas: 3,
    }));
  }

  async obtenerDatosBaseCampana(contratoId: string): Promise<Record<string, unknown>> {
    const datos = await this.obtenerDatos(contratoId);
    return {
      nombreCliente: datos.anunciante,
      nombreCampana: `Nueva Campaña - ${datos.anunciante}`,
      fechaInicio: datos.fechaInicio instanceof Date ? datos.fechaInicio.toISOString().slice(0, 10) : datos.fechaInicio,
      fechaFin: datos.fechaTermino instanceof Date ? datos.fechaTermino.toISOString().slice(0, 10) : datos.fechaTermino,
      comisionAgencia: datos.comisionAgencia,
      tipoTarifa: 'PAQUETE',
      valorTotal: datos.valorTotal,
    };
  }
}

export const contratoService = new ContratoService();
