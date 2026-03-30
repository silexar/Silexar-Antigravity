/**
 * SILEXAR PULSE - TIER0+ DIGITAL REVOLUTION CONFIG
 */
export interface DigitalConfig { enabled: boolean; features: string[]; }
export const defaultDigitalConfig: DigitalConfig = { enabled: true, features: ['ai', 'automation', 'analytics'] };
export default defaultDigitalConfig;