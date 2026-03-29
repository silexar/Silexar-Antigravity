/**
 * 📦 SILEXAR PULSE - CUÑAS DIGITAL COMPONENTS INDEX
 * 
 * Exporta todos los componentes del módulo de cuñas digitales Tier X.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

// Core Wizard
export { default as DigitalCunaWizard } from './DigitalCunaWizard';

// Dimension Selection
export { default as DimensionSelector } from './DimensionSelector';
export type { DimensionMode } from './DimensionSelector';

// Asset Management
export { default as DigitalAssetUploader } from './DigitalAssetUploader';

// Targeting
export { default as TargetingMatrixPanel } from './TargetingMatrixPanel';
export type { TargetingConfig } from './TargetingMatrixPanel';

// Device Intelligence
export { default as DeviceIntelligencePanel } from './DeviceIntelligencePanel';
export type { DeviceIntelligenceConfig } from './DeviceIntelligencePanel';

// Performance Prediction
export { default as PerformancePredictionWidget } from './PerformancePredictionWidget';
export type { PredictionData } from './PerformancePredictionWidget';

// Cross-Device Journey
export { default as CrossDeviceJourneyBuilder } from './CrossDeviceJourneyBuilder';
export type { CrossDeviceJourney, JourneyStep } from './CrossDeviceJourneyBuilder';

// Legacy components (for backwards compatibility)
export { CopyCunaModal } from './CopyCunaModal';
