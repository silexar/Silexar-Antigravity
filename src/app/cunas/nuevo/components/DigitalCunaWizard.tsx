'use client';

/**
 * 🚀 SILEXAR PULSE - DIGITAL CUÑA WIZARD (TIER X)
 * 
 * Wizard integrado para la creación de cuñas digitales con
 * todas las capacidades Tier X: Dual-Core, Deep Device Intelligence,
 * Quantum Targeting, y Neuromorphic Resonance.
 * 
 * @version 2050.X.0
 * @tier TIER_X_SINGULARITY
 */

import React, { useState, useCallback } from 'react';
import { 
  ChevronLeft, ChevronRight, Check, Save, Sparkles,
  Radio, Globe, Zap, Upload, Target, Cpu, TrendingUp, Link2
} from 'lucide-react';

// Import components
import DimensionSelector, { DimensionMode } from './DimensionSelector';
import DigitalAssetUploader from './DigitalAssetUploader';
import TargetingMatrixPanel, { TargetingConfig } from './TargetingMatrixPanel';
import DeviceIntelligencePanel, { DeviceIntelligenceConfig } from './DeviceIntelligencePanel';
import PerformancePredictionWidget, { PredictionData } from './PerformancePredictionWidget';
import CrossDeviceJourneyBuilder, { CrossDeviceJourney } from './CrossDeviceJourneyBuilder';

// ═══════════════════════════════════════════════════════════════
// TIPOS
// ═══════════════════════════════════════════════════════════════

interface DigitalCunaFormData {
  // Basic Info
  nombre: string;
  descripcion: string;
  anuncianteId: string;
  productoId?: string;
  
  // Mode
  modoOperacion: DimensionMode;
  
  // Assets
  assets: unknown[];
  
  // Targeting
  targeting: TargetingConfig;
  
  // Device Intelligence
  deviceIntelligence: DeviceIntelligenceConfig;
  
  // Cross-Device Journey
  crossDeviceJourney: CrossDeviceJourney;
  
  // Predictions
  prediction?: PredictionData;
}

interface WizardStep {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  isDigitalOnly?: boolean;
}

// ═══════════════════════════════════════════════════════════════
// DEFAULT VALUES
// ═══════════════════════════════════════════════════════════════

const DEFAULT_TARGETING: TargetingConfig = {
  edadMinima: 18,
  edadMaxima: 55,
  generos: ['M', 'F', 'X'],
  dispositivos: ['MOBILE_IOS', 'MOBILE_ANDROID', 'DESKTOP_WINDOWS', 'DESKTOP_MAC'],
  sistemasOperativos: [],
  estadosAnimo: [],
  horasActivas: [{ inicio: '06:00', fin: '23:00' }],
  diasSemana: [0, 1, 2, 3, 4, 5, 6],
  geoFences: [],
  condicionesClima: []
};

const DEFAULT_DEVICE_INTELLIGENCE: DeviceIntelligenceConfig = {
  batteryRules: {
    enabled: true,
    minBattery: 15,
    lowBatteryAction: 'REDUCE_QUALITY',
    chargingBoost: true
  },
  connectionRules: {
    enabled: true,
    allowedConnections: ['WIFI_6', 'WIFI_5', '5G', '4G_LTE', '4G', 'ETHERNET'],
    minSpeedMbps: 5,
    slowConnectionAction: 'COMPRESS'
  },
  movementRules: {
    enabled: true,
    allowedStates: ['STATIONARY', 'WALKING'],
    drivingMode: true,
    maxSpeedKmh: 120
  },
  screenRules: {
    enabled: true,
    orientations: ['ANY'],
    darkModeOptimized: true,
    oledOptimized: true
  },
  audioRules: {
    enabled: true,
    mutedAction: 'SHOW_SUBTITLES'
  }
};

const DEFAULT_JOURNEY: CrossDeviceJourney = {
  id: 'journey-new',
  nombre: 'Nuevo Journey',
  descripcion: '',
  pasos: [],
  frecuencia: {
    maxImpresionesUsuario: 3,
    periodoHoras: 24
  },
  activo: true
};

// ═══════════════════════════════════════════════════════════════
// COMPONENTE PRINCIPAL
// ═══════════════════════════════════════════════════════════════

export const DigitalCunaWizard: React.FC = () => {
  // State
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<DigitalCunaFormData>({
    nombre: '',
    descripcion: '',
    anuncianteId: '',
    modoOperacion: 'DIGITAL_ONLY',
    assets: [],
    targeting: DEFAULT_TARGETING,
    deviceIntelligence: DEFAULT_DEVICE_INTELLIGENCE,
    crossDeviceJourney: DEFAULT_JOURNEY
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Steps configuration
  const steps: WizardStep[] = [
    {
      id: 'dimension',
      title: 'Dimensión',
      subtitle: 'FM o Digital',
      icon: <Zap className="w-5 h-5" />
    },
    {
      id: 'assets',
      title: 'Materiales',
      subtitle: 'Video, Audio, Banners',
      icon: <Upload className="w-5 h-5" />
    },
    {
      id: 'targeting',
      title: 'Targeting',
      subtitle: 'Segmentación Quantum',
      icon: <Target className="w-5 h-5" />,
      isDigitalOnly: true
    },
    {
      id: 'device',
      title: 'Device Intelligence',
      subtitle: 'Adaptación Neural',
      icon: <Cpu className="w-5 h-5" />,
      isDigitalOnly: true
    },
    {
      id: 'journey',
      title: 'Cross-Device',
      subtitle: 'Viaje del Usuario',
      icon: <Link2 className="w-5 h-5" />,
      isDigitalOnly: true
    },
    {
      id: 'prediction',
      title: 'Predicción',
      subtitle: 'Análisis IA',
      icon: <TrendingUp className="w-5 h-5" />
    }
  ];

  // Filter steps based on mode
  const visibleSteps = steps.filter(step => 
    !step.isDigitalOnly || formData.modoOperacion !== 'FM_ONLY'
  );

  // ─── HANDLERS ─────────────────────────────────────────────────

  const goToStep = (index: number) => {
    if (index >= 0 && index < visibleSteps.length) {
      setCurrentStep(index);
    }
  };

  const nextStep = () => goToStep(currentStep + 1);
  const prevStep = () => goToStep(currentStep - 1);

  const updateFormData = useCallback(<K extends keyof DigitalCunaFormData>(
    key: K,
    value: DigitalCunaFormData[K]
  ) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  }, []);

  const handleRequestAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simular análisis de IA
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Mock prediction result
    const mockPrediction: PredictionData = {
      clickRatePredicho: 1.85 + Math.random() * 0.5,
      viewabilityPredicha: 68 + Math.random() * 15,
      completionRatePredicho: 72 + Math.random() * 10,
      attentionRetainmentScore: 7.5 + Math.random() * 2,
      segundoCaidaAtencion: Math.floor(8 + Math.random() * 7),
      perfilEmocional: {
        energia: 0.6 + Math.random() * 0.3,
        valencia: 0.5 + Math.random() * 0.4
      },
      sugerencias: [
        {
          id: 'sug-1',
          tipo: 'IMPORTANTE',
          categoria: 'DURACION',
          mensaje: 'Considerar versión de 15s para mejor tasa de completación',
          impactoEstimado: 15
        },
        {
          id: 'sug-2',
          tipo: 'SUGERENCIA',
          categoria: 'CTA',
          mensaje: 'El botón de acción podría ser más visible',
          impactoEstimado: 8
        }
      ],
      scoreGeneral: 75 + Math.floor(Math.random() * 20),
      clasificacion: 'BUENO'
    };
    
    updateFormData('prediction', mockPrediction);
    setIsAnalyzing(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSaving(false);
    // TODO: Implement actual save logic
    alert('¡Cuña guardada exitosamente!');
  };

  // ─── RENDER STEP CONTENT ─────────────────────────────────────

  const renderStepContent = () => {
    const stepId = visibleSteps[currentStep]?.id;

    switch (stepId) {
      case 'dimension':
        return (
          <DimensionSelector
            value={formData.modoOperacion}
            onChange={(mode) => updateFormData('modoOperacion', mode)}
          />
        );

      case 'assets':
        return (
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Información Básica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nombre de la Cuña *
                  </label>
                  <input
                    type="text"
                    aria-label="Nombre de la Cuña"
                    value={formData.nombre}
                    onChange={(e) => updateFormData('nombre', e.target.value)}
                    placeholder="Ej: Campaña Verano 2026"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Descripción
                  </label>
                  <input
                    type="text"
                    aria-label="Descripción"
                    value={formData.descripcion}
                    onChange={(e) => updateFormData('descripcion', e.target.value)}
                    placeholder="Descripción breve..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:border-violet-400"
                  />
                </div>
              </div>
            </div>

            {/* Asset Uploader */}
            <DigitalAssetUploader
              onAssetsChange={(assets) => updateFormData('assets', assets)}
            />
          </div>
        );

      case 'targeting':
        return (
          <TargetingMatrixPanel
            value={formData.targeting}
            onChange={(targeting) => updateFormData('targeting', targeting)}
          />
        );

      case 'device':
        return (
          <DeviceIntelligencePanel
            value={formData.deviceIntelligence}
            onChange={(config) => updateFormData('deviceIntelligence', config)}
          />
        );

      case 'journey':
        return (
          <CrossDeviceJourneyBuilder
            value={formData.crossDeviceJourney}
            onChange={(journey) => updateFormData('crossDeviceJourney', journey)}
          />
        );

      case 'prediction':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <PerformancePredictionWidget
              prediction={formData.prediction}
              isAnalyzing={isAnalyzing}
              onRequestAnalysis={handleRequestAnalysis}
            />
            
            {/* Summary Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-violet-500" />
                Resumen de Configuración
              </h3>
              
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Modo</div>
                  <div className="font-medium text-slate-800 flex items-center gap-2">
                    {formData.modoOperacion === 'FM_ONLY' && <Radio className="w-4 h-4 text-amber-500" />}
                    {formData.modoOperacion === 'DIGITAL_ONLY' && <Globe className="w-4 h-4 text-cyan-500" />}
                    {formData.modoOperacion === 'HYBRID' && <Zap className="w-4 h-4 text-emerald-500" />}
                    {formData.modoOperacion === 'FM_ONLY' ? 'FM Broadcast' :
                     formData.modoOperacion === 'DIGITAL_ONLY' ? 'Digital Hyper-Media' : 'Híbrido'}
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl">
                  <div className="text-sm text-slate-500 mb-1">Assets cargados</div>
                  <div className="font-medium text-slate-800">
                    {formData.assets.length} archivo(s)
                  </div>
                </div>

                {formData.modoOperacion !== 'FM_ONLY' && (
                  <>
                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Targeting</div>
                      <div className="font-medium text-slate-800">
                        {formData.targeting.dispositivos.length} dispositivos, 
                        {formData.targeting.estadosAnimo.length} moods
                      </div>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-xl">
                      <div className="text-sm text-slate-500 mb-1">Device Intelligence</div>
                      <div className="font-medium text-slate-800">
                        {[
                          formData.deviceIntelligence.batteryRules.enabled && 'Batería',
                          formData.deviceIntelligence.connectionRules.enabled && 'Red',
                          formData.deviceIntelligence.movementRules.enabled && 'Movimiento'
                        ].filter(Boolean).join(', ') || 'No configurado'}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  // ─── RENDER ─────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-600 to-indigo-600 rounded-xl flex items-center justify-center text-white">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-800">Nueva Cuña Digital</h1>
                <p className="text-sm text-slate-500">Tier X - Quantum Generative Neural-Interface</p>
              </div>
            </div>
            
            {/* Save Button */}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 
                         text-white font-medium rounded-xl hover:shadow-lg transition-all
                         disabled:opacity-50 disabled:cursor-wait"
            >
              {isSaving ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Guardar Cuña
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {visibleSteps.map((step, idx) => {
              const isActive = idx === currentStep;
              const isCompleted = idx < currentStep;
              
              return (
                <React.Fragment key={step.id}>
                  <button
                    onClick={() => goToStep(idx)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-xl transition-all ${
                      isActive 
                        ? 'bg-violet-100 text-violet-700' 
                        : isCompleted
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      isActive 
                        ? 'bg-violet-600 text-white' 
                        : isCompleted
                          ? 'bg-emerald-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {isCompleted ? <Check className="w-5 h-5" /> : step.icon}
                    </div>
                    <div className="hidden md:block text-left">
                      <div className={`text-sm font-medium ${isActive ? 'text-violet-700' : ''}`}>
                        {step.title}
                      </div>
                      <div className="text-xs text-slate-500">{step.subtitle}</div>
                    </div>
                  </button>
                  
                  {idx < visibleSteps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${
                      idx < currentStep ? 'bg-emerald-500' : 'bg-slate-200'
                    }`} />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {renderStepContent()}
      </div>

      {/* Navigation Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 py-4 px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 font-medium rounded-xl 
                       hover:bg-slate-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
            Anterior
          </button>

          <div className="text-sm text-slate-500">
            Paso {currentStep + 1} de {visibleSteps.length}
          </div>

          <button
            onClick={nextStep}
            disabled={currentStep === visibleSteps.length - 1}
            className="flex items-center gap-2 px-6 py-3 bg-violet-600 text-white font-medium rounded-xl 
                       hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Siguiente
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DigitalCunaWizard;
