/**
 * 📊 Wizard Header Component
 * 
 * Displays the current step, progress bar, and wizard title.
 */

import React from 'react';
import { Target } from 'lucide-react';
import { WizardStep, WIZARD_STEPS } from './types/wizard.types';
import { Badge } from '@/components/ui/badge';

interface WizardHeaderProps {
  currentStep: WizardStep;
  completedSteps: WizardStep[];
}

export const WizardHeader: React.FC<WizardHeaderProps> = ({
  currentStep,
  completedSteps
}) => {
  const currentIndex = WIZARD_STEPS.findIndex(s => s.id === currentStep);
  const progress = ((currentIndex) / (WIZARD_STEPS.length - 1)) * 100;

  return (
    <div className="mb-8">
      {/* Title & Status */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-blue-600" />
            Nueva Campaña
            <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
              TIER 0
            </Badge>
          </h1>
          <p className="text-slate-500">
            Asistente inteligente de creación de campañas
          </p>
        </div>
        
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500 mb-1">
            Paso {currentIndex + 1} de {WIZARD_STEPS.length}
          </p>
          <p className="text-lg font-bold text-slate-900">
            {WIZARD_STEPS[currentIndex].label}
          </p>
        </div>
      </div>

      {/* Steps Visualizer */}
      <div className="relative">
        {/* Progress Bar Background */}
        <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full" />
        
        {/* Active Progress Bar */}
        <div 
          className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
          style={{ width: `${progress}%` }}
        />

        {/* Steps Dots */}
        <div className="relative flex justify-between">
          {WIZARD_STEPS.map((step, index) => {
            const isCompleted = completedSteps.includes(step.id);
            const isCurrent = step.id === currentStep;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const _isPending = !isCompleted && !isCurrent;
            
            // Dynamic Icon import (would ideally use a mapping, simplified here)
            // For now using simple dots with state
            
            return (
              <div 
                key={step.id}
                className={`
                  flex flex-col items-center gap-2 relative z-10 
                  transition-all duration-300
                `}
              >
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center border-2
                    transition-all duration-300 bg-white
                    ${isCompleted 
                      ? 'border-blue-600 bg-blue-600 text-white' 
                      : isCurrent
                        ? 'border-blue-600 text-blue-600 scale-110 shadow-lg shadow-blue-500/20'
                        : 'border-slate-200 text-slate-300'
                    }
                  `}
                >
                  {isCompleted ? (
                    <span className="text-xs font-bold">✓</span>
                  ) : (
                    <span className="text-xs font-bold">{index + 1}</span>
                  )}
                </div>
                <span 
                  className={`
                    text-xs font-medium transition-colors duration-300
                    ${isCurrent ? 'text-blue-700' : 'text-slate-400'}
                  `}
                >
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
