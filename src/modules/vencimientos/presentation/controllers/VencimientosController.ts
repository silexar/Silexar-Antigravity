import { DisponibilidadHandler } from '../../application/handlers/DisponibilidadHandler';
import { ActivarAuspicioHandler } from '../../application/handlers/ActivarAuspicioHandler';
import { ObtenerDisponibilidadCuposDTO } from '../../application/queries/ObtenerDisponibilidadCuposQuery';
import { ActivarAuspicioDTO } from '../../application/commands/ActivarAuspicioCommand';

export class VencimientosController {
  constructor(
    private readonly disponibilidadHandler: DisponibilidadHandler,
    private readonly activarAuspicioHandler: ActivarAuspicioHandler
  ) {}

  async obtenerDisponibilidad(req: { body: ObtenerDisponibilidadCuposDTO }, res: { status: (c: number) => { json: (d: unknown) => unknown } }) {
    try {
      const dto: ObtenerDisponibilidadCuposDTO = req.body;
      const result = await this.disponibilidadHandler.handleQuery(dto);
      res.status(200).json(result);
    } catch (error: unknown) {
      res.status(400).json({ error: (error as Error).message });
    }
  }

  async activarCupo(req: { body: ActivarAuspicioDTO }, res: { status: (c: number) => { json: (d: unknown) => unknown } }) {
     try {
       const dto: ActivarAuspicioDTO = req.body;
       const result = await this.activarAuspicioHandler.handle(dto);
       res.status(200).json(result);
     } catch(error: unknown) {
        res.status(400).json({ error: (error as Error).message });
     }
  }
}
