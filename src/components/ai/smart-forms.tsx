/**
 * AI-Powered User Experience - Smart Forms Component
 * TIER 0 Military-Grade Intelligent Form System
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Lightbulb,
  Zap,
  Eye,
  Volume2,
  VolumeX,
  Sparkles,
  Target,
  TrendingUp,
  Activity,
  User,
  Mail,
  Phone,
  Calendar,
  FileText,
  Hash,
  Globe
} from 'lucide-react';
import { SmartFormsEngine } from '@/lib/ai/smart-forms-engine';
import type { SmartForm, SmartField, AutoCompleteSuggestion, VoiceToFormData, FieldMapping } from '@/lib/ai/smart-forms-engine';

interface SmartFormsProps {
  formId: string;
  onSubmit?: (data: Record<string, unknown>) => void;
  className?: string;
  enableVoice?: boolean;
  enableAI?: boolean;
}

interface FieldState {
  value: string | number | boolean;
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
  confidence: number;
}

export default function SmartForms({ 
  formId, 
  onSubmit, 
  className = '', 
  enableVoice = true, 
  enableAI = true 
}: SmartFormsProps) {
  const [form, setForm] = useState<SmartForm | null>(null);
  const [fieldStates, setFieldStates] = useState<Record<string, FieldState>>({});
  const [autoCompleteSuggestions, setAutoCompleteSuggestions] = useState<Record<string, AutoCompleteSuggestion[]>>({});
  const [isVoiceRecording, setIsVoiceRecording] = useState(false);
  const [voiceData, setVoiceData] = useState<VoiceToFormData | null>(null);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [aiInsights, setAiInsights] = useState<string[]>([]);
  const [formProgress, setFormProgress] = useState(0);

  const engine = SmartFormsEngine.getInstance();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    loadForm();
  }, [formId]);

  useEffect(() => {
    calculateFormProgress();
  }, [fieldStates]);

  const loadForm = async () => {
    try {
      const formData = engine.getForm(formId);
      if (!formData) {
        // Create a demo form if it doesn't exist
        const demoForm = await engine.createSmartForm({
          id: formId,
          name: 'Smart Contact Form',
          fields: [
            {
              id: 'name',
              name: 'name',
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true
            },
            {
              id: 'email',
              name: 'email',
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address',
              required: true
            },
            {
              id: 'phone',
              name: 'phone',
              type: 'phone',
              label: 'Phone Number',
              placeholder: 'Enter your phone number',
              required: false
            },
            {
              id: 'company',
              name: 'company',
              type: 'text',
              label: 'Company',
              placeholder: 'Enter your company name',
              required: false
            },
            {
              id: 'message',
              name: 'message',
              type: 'textarea',
              label: 'Message',
              placeholder: 'Enter your message',
              required: true
            }
          ]
        });
        setForm(demoForm);
      } else {
        setForm(formData);
      }
    } catch (error) {
      }
  };

  const calculateFormProgress = () => {
    if (!form) return;
    
    const totalFields = form.fields.filter(f => f.required).length;
    const completedFields = Object.entries(fieldStates).filter(([fieldId, state]) => {
      const field = form.fields.find(f => f.id === fieldId);
      return field?.required && state.value && state.isValid;
    }).length;
    
    setFormProgress(totalFields > 0 ? (completedFields / totalFields) * 100 : 0);
  };

  const handleFieldChange = useCallback(async (fieldId: string, value: string | number | boolean) => {
    if (!form) return;

    // Update field value
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value
      }
    }));

    // Validate field
    const validation = await engine.validateField(formId, fieldId, value);
    
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        value,
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        suggestions: validation.suggestions,
        confidence: validation.confidence
      }
    }));

    // Get auto-complete suggestions
    if (typeof value === 'string' && value.length > 1) {
      const suggestions = await engine.getAutoCompleteSuggestions(formId, fieldId, value);
      setAutoCompleteSuggestions(prev => ({
        ...prev,
        [fieldId]: suggestions
      }));
    } else {
      setAutoCompleteSuggestions(prev => ({
        ...prev,
        [fieldId]: []
      }));
    }

    // Generate AI insights
    if (enableAI && validation.suggestions.length > 0) {
      setAiInsights(prev => [...prev.slice(-2), ...validation.suggestions]);
    }
  }, [formId, form, enableAI]);

  const handleSuggestionSelect = (fieldId: string, suggestion: AutoCompleteSuggestion) => {
    handleFieldChange(fieldId, suggestion.value);
    setAutoCompleteSuggestions(prev => ({
      ...prev,
      [fieldId]: []
    }));
  };

  const startVoiceRecording = async () => {
    if (!enableVoice) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processVoiceInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsVoiceRecording(true);
    } catch (error) {
      }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isVoiceRecording) {
      mediaRecorderRef.current.stop();
      setIsVoiceRecording(false);
    }
  };

  const processVoiceInput = async (audioBlob: Blob) => {
    setIsProcessingVoice(true);
    try {
      const voiceResult = await engine.processVoiceToForm(formId, audioBlob);
      setVoiceData(voiceResult);

      // Apply voice data to form fields
      voiceResult.fieldMappings.forEach(mapping => {
        if (!mapping.needsConfirmation) {
          handleFieldChange(mapping.fieldId, mapping.extractedValue);
        }
      });

      setAiInsights(prev => [...prev, `Voice input processed: "${voiceResult.transcript}"`]);
    } catch (error) {
      } finally {
      setIsProcessingVoice(false);
    }
  };

  const confirmVoiceMapping = (mapping: FieldMapping) => {
    handleFieldChange(mapping.fieldId, mapping.extractedValue);
    setVoiceData(prev => prev ? {
      ...prev,
      fieldMappings: prev.fieldMappings.filter(m => m.fieldId !== mapping.fieldId)
    } : null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: Record<string, unknown> = {};
    Object.entries(fieldStates).forEach(([fieldId, state]) => {
      formData[fieldId] = state.value;
    });

    onSubmit?.(formData);
  };

  const getFieldIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'date': return <Calendar className="h-4 w-4" />;
      case 'number': return <Hash className="h-4 w-4" />;
      case 'textarea': return <FileText className="h-4 w-4" />;
      default: return <User className="h-4 w-4" />;
    }
  };

  const getValidationColor = (fieldId: string) => {
    const state = fieldStates[fieldId];
    if (!state) return 'border-gray-300';
    if (state.errors.length > 0) return 'border-red-500';
    if (state.warnings.length > 0) return 'border-yellow-500';
    if (state.isValid && state.value) return 'border-green-500';
    return 'border-gray-300';
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        <span className="ml-2 text-gray-600">Loading smart form...</span>
      </div>
    );
  }

  return (
    <div className={`smart-forms-container ${className}`}>
      {/* Form Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="h-6 w-6 text-purple-600 mr-2" />
            {form.name}
          </h2>
          <div className="flex items-center space-x-2">
            {enableAI && (
              <div className="flex items-center text-purple-600">
                <Sparkles className="h-4 w-4 mr-1" />
                <span className="text-sm font-medium">AI Enhanced</span>
              </div>
            )}
            {enableVoice && (
              <button
                onClick={isVoiceRecording ? stopVoiceRecording : startVoiceRecording}
                disabled={isProcessingVoice}
                className={`p-2 rounded-lg transition-colors ${
                  isVoiceRecording 
                    ? 'bg-red-100 text-red-600 hover:bg-red-200' 
                    : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                }`}
                title={isVoiceRecording ? 'Stop recording' : 'Start voice input'}
              >
                {isVoiceRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-purple-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${formProgress}%` }}
          ></div>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          {Math.round(formProgress)}% complete
        </p>
      </div>

      {/* Voice Processing Status */}
      {isProcessingVoice && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
            <span className="text-blue-800">Processing voice input...</span>
          </div>
        </div>
      )}

      {/* Voice Confirmation */}
      {voiceData && voiceData.fieldMappings.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">Confirm Voice Input</h4>
          <p className="text-sm text-yellow-700 mb-3">"{voiceData.transcript}"</p>
          <div className="space-y-2">
            {voiceData.fieldMappings.map((mapping) => {
              const field = form.fields.find(f => f.id === mapping.fieldId);
              return (
                <div key={mapping.fieldId} className="flex items-center justify-between bg-white p-2 rounded border">
                  <div>
                    <span className="font-medium">{field?.label}:</span>
                    <span className="ml-2">{mapping.extractedValue}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      ({Math.round(mapping.confidence * 100)}% confidence)
                    </span>
                  </div>
                  <button
                    onClick={() => confirmVoiceMapping(mapping)}
                    className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                  >
                    Confirm
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights.length > 0 && (
        <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center mb-2">
            <Lightbulb className="h-4 w-4 text-purple-600 mr-2" />
            <span className="font-medium text-purple-800">AI Insights</span>
          </div>
          <div className="space-y-1">
            {aiInsights.slice(-3).map((insight, index) => (
              <p key={`${insight}-${index}`} className="text-sm text-purple-700">{insight}</p>
            ))}
          </div>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {form.fields.map((field) => (
          <div key={field.id} className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <div className="flex items-center">
                {getFieldIcon(field.type)}
                <span className="ml-2">{field.label}</span>
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </div>
            </label>
            
            <div className="relative">
              {field.type === 'textarea' ? (
                <textarea
                  id={field.id}
                  value={String(fieldStates[field.id]?.value ?? '')}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${getValidationColor(field.id)}`}
                  rows={4}
                />
              ) : (
                <input
                  type={field.type === 'phone' ? 'tel' : field.type}
                  id={field.id}
                  value={String(fieldStates[field.id]?.value ?? '')}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  placeholder={field.placeholder}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${getValidationColor(field.id)}`}
                />
              )}

              {/* Auto-complete Suggestions */}
              {autoCompleteSuggestions[field.id] && autoCompleteSuggestions[field.id].length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-40 overflow-y-auto">
                  {autoCompleteSuggestions[field.id].map((suggestion, index) => (
                    <button
                      key={`${suggestion}-${index}`}
                      type="button"
                      onClick={() => handleSuggestionSelect(field.id, suggestion)}
                      className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                    >
                      <span>{suggestion.value}</span>
                      <span className="text-xs text-gray-500">
                        {Math.round(suggestion.confidence * 100)}%
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Field Validation Messages */}
            {fieldStates[field.id] && (
              <div className="mt-1 space-y-1">
                {fieldStates[field.id].errors.map((error, index) => (
                  <div key={`${error}-${index}`} className="flex items-center text-red-600 text-sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {error}
                  </div>
                ))}
                {fieldStates[field.id].warnings.map((warning, index) => (
                  <div key={`${warning}-${index}`} className="flex items-center text-yellow-600 text-sm">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {warning}
                  </div>
                ))}
                {fieldStates[field.id].suggestions.map((suggestion, index) => (
                  <div key={`${suggestion}-${index}`} className="flex items-center text-blue-600 text-sm">
                    <Lightbulb className="h-3 w-3 mr-1" />
                    {suggestion}
                  </div>
                ))}
                {fieldStates[field.id].isValid && fieldStates[field.id].value && (
                  <div className="flex items-center text-green-600 text-sm">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Valid
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Submit Button */}
        <div className="flex items-center justify-between pt-4">
          <div className="text-sm text-gray-600">
            {Object.values(fieldStates).filter(s => s.isValid && s.value).length} of {form.fields.length} fields completed
          </div>
          <button
            type="submit"
            disabled={formProgress < 100}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
          >
            Submit Form
          </button>
        </div>
      </form>

      {/* Form Statistics */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Form Performance</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Completion Rate:</span>
            <span className="ml-1 font-medium">{Math.round(form.completionRate * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-600">Avg. Time:</span>
            <span className="ml-1 font-medium">{Math.round(form.averageTime / 60)}m</span>
          </div>
          <div>
            <span className="text-gray-600">Error Rate:</span>
            <span className="ml-1 font-medium">{Math.round(form.errorRate * 100)}%</span>
          </div>
          <div>
            <span className="text-gray-600">Satisfaction:</span>
            <span className="ml-1 font-medium">{Math.round(form.userSatisfaction * 100)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Hook for using smart forms in other components
export function useSmartForms(formId: string) {
  const [form, setForm] = useState<SmartForm | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const engine = SmartFormsEngine.getInstance();

  useEffect(() => {
    const loadForm = async () => {
      setIsLoading(true);
      try {
        const formData = engine.getForm(formId);
        setForm(formData);
      } catch (error) {
        } finally {
        setIsLoading(false);
      }
    };

    loadForm();
  }, [formId]);

  const validateField = useCallback(async (fieldId: string, value: string | number | boolean) => {
    if (!form) return null;
    return await engine.validateField(formId, fieldId, value);
  }, [formId, form]);

  const getAutoComplete = useCallback(async (fieldId: string, partialValue: string) => {
    if (!form) return [];
    return await engine.getAutoCompleteSuggestions(formId, fieldId, partialValue);
  }, [formId, form]);

  return {
    form,
    isLoading,
    validateField,
    getAutoComplete,
    engine
  };
}