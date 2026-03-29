export interface CustomizationConfig { theme: string; layout: string; }
export const applyCustomization = (_config: CustomizationConfig): boolean => true;
export const getDefaultConfig = (): CustomizationConfig => ({ theme: 'default', layout: 'grid' });
export default { applyCustomization, getDefaultConfig };