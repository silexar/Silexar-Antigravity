/**
 * SILEXAR PULSE - TIER0+ AI INDEX
 */
export { ConversationAnalytics } from './conversation-analytics';
export interface AIConfig { model: string; temperature: number; }
export const defaultAIConfig: AIConfig = { model: 'gpt-4', temperature: 0.7 };