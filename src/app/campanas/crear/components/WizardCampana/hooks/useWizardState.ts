/**
 * 🧠 useWizardState Hook - Enterprise 2050
 * 
 * Manages the complex state transitions and validation logic
 * for the multi-step campaign creation wizard.
 * 
 * Enhanced with:
 * - Auto-save Draft to localStorage
 * - Unsaved changes detection
 * - State recovery on reload
 * 
 * @enterprise TIER0 Fortune 10
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/observability';
import { WizardState, WizardStep, WIZARD_STEPS } from '../types/wizard.types';

const STORAGE_KEY = 'silexar_campaign_draft';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

const INITIAL_STATE: WizardState = {
  currentStep: 'origen',
  completedSteps: [],
  canAdvance: false,
  isLoading: false,
  origenData: {
    tipo: 'contrato'
  },
  campanaDraft: {}
};

export const useWizardState = () => {
  // Try to recover state from localStorage
  const getInitialState = (): WizardState => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // logger.info('📦 Draft recuperado de localStorage');
        return { ...INITIAL_STATE, ...parsed, isLoading: false };
      }
    } catch (e) {
      // logger.warn('Error recuperando draft:', e);
    }
    return INITIAL_STATE;
  };

  const [state, setState] = useState<WizardState>(getInitialState);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const initialStateRef = useRef(JSON.stringify(INITIAL_STATE));

  // Auto-save to localStorage
  const saveDraft = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const dataToSave = {
        currentStep: state.currentStep,
        completedSteps: state.completedSteps,
        origenData: state.origenData,
        campanaDraft: state.campanaDraft
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      // logger.info('💾 Draft guardado automáticamente');
    } catch (e) {
      // logger.warn('Error guardando draft:', e);
    }
  }, [state]);

  // Auto-save interval
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasUnsavedChanges) {
        saveDraft();
      }
    }, AUTO_SAVE_INTERVAL);

    return () => clearInterval(interval);
  }, [hasUnsavedChanges, saveDraft]);

  // Detect unsaved changes
  useEffect(() => {
    const currentStr = JSON.stringify({
      origenData: state.origenData,
      campanaDraft: state.campanaDraft
    });
    if (currentStr !== initialStateRef.current) {
      setHasUnsavedChanges(true);
    }
  }, [state.origenData, state.campanaDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '¿Estás seguro? Tienes cambios sin guardar.';
        return e.returnValue;
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const goToStep = (step: WizardStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  };

  const nextStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex < WIZARD_STEPS.length - 1) {
      const nextStepId = WIZARD_STEPS[currentIndex + 1].id;
      setState(prev => ({
        ...prev,
        currentStep: nextStepId,
        completedSteps: [...prev.completedSteps, prev.currentStep]
      }));
      saveDraft(); // Auto-save on step change
    }
  };

  const prevStep = () => {
    const currentIndex = WIZARD_STEPS.findIndex(s => s.id === state.currentStep);
    if (currentIndex > 0) {
      setState(prev => ({
        ...prev,
        currentStep: WIZARD_STEPS[currentIndex - 1].id
      }));
    }
  };

  const setCanAdvance = (can: boolean) => {
    setState(prev => ({ ...prev, canAdvance: can }));
  };

  const updateOrigenData = (data: Partial<WizardState['origenData']>) => {
    setState(prev => ({
      ...prev,
      origenData: { ...prev.origenData, ...data }
    }));
  };

  const updateDraft = (data: Partial<WizardState['campanaDraft']>) => {
    setState(prev => ({
      ...prev,
      campanaDraft: { ...prev.campanaDraft, ...data }
    }));
  };

  const clearDraft = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState(INITIAL_STATE);
    setHasUnsavedChanges(false);
    // logger.info('🗑️ Draft eliminado');
  };

  const forceSave = () => {
    saveDraft();
  };

  return {
    state,
    goToStep,
    nextStep,
    prevStep,
    setCanAdvance,
    updateOrigenData,
    updateDraft,
    // New exports
    hasUnsavedChanges,
    lastSaved,
    saveDraft: forceSave,
    clearDraft
  };
};

