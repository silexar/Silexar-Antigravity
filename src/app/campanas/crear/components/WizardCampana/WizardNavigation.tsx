/**
 * 🧭 Wizard Navigation Component
 * 
 * Controls movement between wizard steps.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface WizardNavigationProps {
  onNext: () => void;
  onBack: () => void;
  canAdvance: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
  isLoading?: boolean;
}

export const WizardNavigation: React.FC<WizardNavigationProps> = ({
  onNext,
  onBack,
  canAdvance,
  isFirstStep,
  isLastStep,
  isLoading = false
}) => {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-200">
      <Button
        variant="outline"
        onClick={onBack}
        disabled={isFirstStep || isLoading}
        className="text-slate-600 hover:text-slate-900"
      >
        <ChevronLeft className="w-4 h-4 mr-2" />
        Anterior
      </Button>

      <Button
        onClick={onNext}
        disabled={!canAdvance || isLoading}
        className={`
          bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700
          text-white px-8 py-2 rounded-lg shadow-lg shadow-blue-500/20
          transition-all duration-200 transform hover:-translate-y-0.5
          flex items-center gap-2
        `}
      >
        {isLastStep ? (
          <>
            <Check className="w-4 h-4" />
            Finalizar Campaña
          </>
        ) : (
          <>
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </>
        )}
      </Button>
    </div>
  );
};
