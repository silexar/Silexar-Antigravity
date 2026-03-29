/**
 * SILEXAR PULSE - TIER0+ CORTEX INDEX
 * Barrel Export para Sistema Cortex
 */

export { CortexAudience } from './engines/cortex-audience';
export { CortexCreative } from '../lib/cortex/cortex-creative';
export { CortexFlow } from '../lib/cortex/cortex-flow';
export { CortexOrchestrator } from '../lib/cortex/cortex-orchestrator-2';

export interface CortexConfig {
    readonly enabled: boolean;
    readonly modules: string[];
}

export const defaultCortexConfig: CortexConfig = {
    enabled: true,
    modules: ['audience', 'creative', 'flow', 'orchestrator'],
};

export default {
    defaultCortexConfig,
};
