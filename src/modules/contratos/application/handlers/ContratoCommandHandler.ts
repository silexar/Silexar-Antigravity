import { logger } from '@/lib/observability';
import { DrizzleContratoRepository } from '@/modules/contratos/infrastructure/repositories/DrizzleContratoRepository';
import { Contrato } from '@/modules/contratos/domain/entities/Contrato';
import { NumeroContrato } from '@/modules/contratos/domain/value-objects/NumeroContrato';
import { EstadoContrato } from '@/modules/contratos/domain/value-objects/EstadoContrato';
import { TotalesContrato } from '@/modules/contratos/domain/value-objects/TotalesContrato';
import { TerminosPago } from '@/modules/contratos/domain/value-objects/TerminosPago';
import { RiesgoCredito } from '@/modules/contratos/domain/value-objects/RiesgoCredito';
import { MetricasRentabilidad } from '@/modules/contratos/domain/value-objects/MetricasRentabilidad';

export interface CrearContratoCommand {
    numero: string;
    clienteId: string;
    valor: number;
    fechaInicio: string;
    fechaFin: string;
    tenantId: string;
    creadoPor: string;
}

export interface ContratoDto {
    id: string;
    numero: string;
    clienteId: string;
    valor: number;
    estado: 'BORRADOR' | 'ACTIVO' | 'FINALIZADO';
    fechaCreacion: string;
}

export class ContratoCommandHandler {
    async crear(command: CrearContratoCommand): Promise<ContratoDto> {
        const repo = new DrizzleContratoRepository(command.tenantId);

        const numeroC = NumeroContrato.generate();
        const totales = TotalesContrato.create(command.valor, command.valor);
        const riesgoCredito = RiesgoCredito.create(50);
        const metricas = MetricasRentabilidad.create({
            margenBruto: 30,
            roi: 20,
            valorVida: command.valor * 1.5,
            costoAdquisicion: 0,
        });

        const contrato = Contrato.create({
            numero: numeroC,
            anuncianteId: command.clienteId,
            anunciante: 'Contrato creado',
            rutAnunciante: '',
            producto: command.numero,
            agenciaId: undefined,
            agencia: '',
            ejecutivoId: command.creadoPor,
            ejecutivo: '',
            totales,
            moneda: 'CLP',
            fechaInicio: new Date(command.fechaInicio),
            fechaFin: new Date(command.fechaFin),
            prioridad: 'media',
            tipoContrato: 'A',
            terminosPago: TerminosPago.create(30),
            modalidadFacturacion: 'cuotas',
            tipoFactura: 'posterior',
            esCanje: false,
            facturarComisionAgencia: false,
            riesgoCredito,
            metricas,
            creadoPor: command.creadoPor,
            estado: EstadoContrato.borrador(),
            etapaActual: 'creacion',
            progreso: 0,
            proximaAccion: 'revision',
            responsableActual: command.creadoPor,
            fechaLimiteAccion: new Date(command.fechaFin),
            alertas: [],
            tags: [],
            actualizadoPor: command.creadoPor,
        });

        await repo.save(contrato);

        const snap = contrato.toSnapshot();
        return {
            id: snap.id,
            numero: snap.numero.valor,
            clienteId: snap.anuncianteId,
            valor: snap.totales.valorNeto,
            estado: 'BORRADOR',
            fechaCreacion: snap.fechaCreacion.toISOString(),
        };
    }

    async actualizar(_id: string, _data: Partial<CrearContratoCommand>): Promise<ContratoDto> {
        // TODO: Implement full update with domain entity reconstitution
        throw new Error('ActualizarContratoCommand not yet implemented');
    }

    async obtener(id: string, tenantId: string): Promise<ContratoDto | null> {
        const repo = new DrizzleContratoRepository(tenantId);
        const contrato = await repo.findById(id);
        if (!contrato) return null;

        const snap = contrato.toSnapshot();
        return {
            id: snap.id,
            numero: snap.numero.valor,
            clienteId: snap.anuncianteId,
            valor: snap.totales.valorNeto,
            estado: snap.estado.valor as ContratoDto['estado'],
            fechaCreacion: snap.fechaCreacion.toISOString(),
        };
    }

    async eliminar(id: string, tenantId: string): Promise<boolean> {
        const repo = new DrizzleContratoRepository(tenantId);
        const existente = await repo.findById(id);
        if (!existente) {
            logger.warn(`Contrato no encontrado para eliminacion: ${id}`);
            return false;
        }

        await repo.delete(id);
        logger.info(`Contrato eliminado: ${id}`);
        return true;
    }
}

export default new ContratoCommandHandler();