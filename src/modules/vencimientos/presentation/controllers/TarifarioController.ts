import { PricingOptimizationHandler } from '../../application/handlers/PricingOptimizationHandler';
import { logger } from '@/lib/observability';
import { OptimizarPricingDTO } from '../../application/commands/OptimizarPricingCommand';

export class TarifarioController {
  constructor(private readonly optimizationHandler: PricingOptimizationHandler) {}

  async autoOptimizarPricing(req: { body: OptimizarPricingDTO }, res: { status: (c: number) => { json: (d: unknown) => unknown } }) {
    try {
      const dto: OptimizarPricingDTO = req.body;
      const result = await this.optimizationHandler.handle(dto);
      
      logger.info(`[TarifarioController] Respuesta IA Pricing completada`);
      return res.status(200).json(result);
    } catch (error: unknown) {
      return res.status(500).json({ error: 'Falla al optimizar Pricing', details: (error as Error).message });
    }
  }
}
