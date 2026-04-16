/**
 * 🧙‍♂️ Crear Campana Wizard - Main Container Enterprise 2050
 * 
 * Orchestrates the campaign creation flow, managing state,
 * navigation, and step rendering.
 * 
 * Enhanced with auto-save and unsaved changes detection.
 */

'use client';

import React from 'react';
import { useWizardState } from './hooks/useWizardState';
import { WizardHeader } from './WizardHeader';
import { WizardNavigation } from './WizardNavigation';
import { StepOrigenCampana } from './StepOrigenCampana';
import { StepTapaCampana } from './StepTapaCampana';
import { StepTarifasCampana } from './StepTarifasCampana';
import { StepFacturacionCampana } from './StepFacturacionCampana';
import { StepLineasCampana } from './StepLineasCampana';
import { StepProgramacionCampana } from './StepProgramacionCampana';
import { StepRevisionFinal } from './StepRevisionFinal';
import { Save, Cloud, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function CrearCampanaWizard() {
  const { 
    state, 
    nextStep, 
    prevStep, 
    setCanAdvance, 
    updateOrigenData,
    updateDraft,
    hasUnsavedChanges,
    lastSaved,
    saveDraft,
    clearDraft
  } = useWizardState();

  const handleStepCompletion = () => {
    setCanAdvance(true);
  };

  const renderCurrentStep = () => {
    switch (state.currentStep) {
      case 'origen':
        return (
          <StepOrigenCampana 
            isActive={true}
            onComplete={handleStepCompletion}
            onBack={prevStep}
            selectedType={state.origenData.tipo}
            onSelectType={(tipo) => {
              updateOrigenData({ tipo });
              setCanAdvance(true); // Allow advance once selected
            }}
            medio={state.campanaDraft.medio || 'fm'}
            onSelectMedio={(medio) => updateDraft({ medio })}
          />
        );
      case 'tapa':
        return (
          <StepTapaCampana
            isActive={true}
            onComplete={handleStepCompletion}
            onBack={prevStep}
            data={state.campanaDraft}
            onUpdate={(data) => updateDraft(data as any)}
            isFromContract={state.origenData.tipo === 'contrato'}
          />
        );
      case 'tarifas':
        return (
          <StepTarifasCampana 
            isActive={true}
            onComplete={handleStepCompletion}
            onBack={prevStep}
            data={state.campanaDraft}
            onUpdate={updateDraft}
          />
        );
      case 'facturacion':
        return (
          <StepFacturacionCampana
            isActive={true}
            onComplete={handleStepCompletion}
            onBack={prevStep}
            data={state.campanaDraft}
            onUpdate={updateDraft}
          />
        );
      case 'lineas':
        return (
          <StepLineasCampana
             isActive={true}
             onComplete={handleStepCompletion}
             onBack={prevStep}
             data={state.campanaDraft}
             onUpdate={updateDraft}
          />
        );
      case 'programacion':
        return (
           <StepProgramacionCampana
             isActive={true}
             onComplete={handleStepCompletion}
             onBack={prevStep}
             data={state.campanaDraft}
             onUpdate={updateDraft}
           />
        );
      case 'revision':
        return (
          <StepRevisionFinal
             isActive={true}
             onComplete={handleStepCompletion}
             onBack={prevStep}
             data={state.campanaDraft}
          />
        );
      default:
        return <div>Paso desconocido</div>;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <WizardHeader 
        currentStep={state.currentStep}
        completedSteps={state.completedSteps}
      />

      {/* Auto-save Status Bar */}
      <div className="flex items-center justify-between mb-4 px-4 py-2 bg-slate-50 rounded-lg border border-slate-100">
        <div className="flex items-center gap-3">
          {hasUnsavedChanges ? (
            <Badge className="bg-yellow-100 text-yellow-700 gap-1">
              <Cloud className="w-3 h-3" />
              Cambios pendientes
            </Badge>
          ) : (
            <Badge className="bg-green-100 text-green-700 gap-1">
              <Cloud className="w-3 h-3" />
              Guardado
            </Badge>
          )}
          {lastSaved && (
            <span className="text-xs text-gray-500">
              Último guardado: {lastSaved.toLocaleTimeString()}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={saveDraft}
            className="gap-1 text-xs"
          >
            <Save className="w-3 h-3" />
            Guardar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearDraft}
            className="gap-1 text-xs text-red-600 hover:text-red-700"
          >
            <Trash2 className="w-3 h-3" />
            Limpiar
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 min-h-[500px] flex flex-col justify-between">
        <div className="flex-1">
          {renderCurrentStep()}
        </div>
        
        <WizardNavigation
          onNext={nextStep}
          onBack={prevStep}
          canAdvance={state.canAdvance}
          isFirstStep={state.currentStep === 'origen'}
          isLastStep={state.currentStep === 'revision'}
          isLoading={state.isLoading}
        />
      </div>
    </div>
  );
}
