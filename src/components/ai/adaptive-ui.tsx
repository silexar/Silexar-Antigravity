/**
 * AI-Powered User Experience - Adaptive UI Component
 * TIER 0 Military-Grade Adaptive Interface
 * 
 * @version 2040.1.0
 * @classification TIER_0_SUPREMACY
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Palette, 
  Settings, 
  Eye, 
  Zap, 
  Brain,
  User,
  Monitor,
  Smartphone,
  Tablet,
  Accessibility,
  TrendingUp,
  Activity,
  Target,
  CheckCircle,
  AlertCircle,
  Lightbulb,
  Gauge
} from 'lucide-react';
import { AdaptiveUIEngine } from '@/lib/ai/adaptive-ui-engine';
import type { UserProfile, UIAdaptation } from '@/lib/ai/adaptive-ui-engine';

interface AdaptiveUIProps {
  userId: string;
  className?: string;
  children?: React.ReactNode;
}

export default function AdaptiveUI({ userId, className = '', children }: AdaptiveUIProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adaptations, setAdaptations] = useState<UIAdaptation[]>([]);
  const [isAdapting, setIsAdapting] = useState(false);
  const [adaptiveSettings, setAdaptiveSettings] = useState({
    autoAdapt: true,
    learningEnabled: true,
    accessibilityMode: false,
    performanceMode: false
  });

  const engine = AdaptiveUIEngine.getInstance();

  useEffect(() => {
    loadUserProfile();
    const interval = setInterval(loadUserProfile, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [userId]);

  const loadUserProfile = async () => {
    try {
      const userProfile = engine.getUserProfile(userId);
      const userAdaptations = engine.getAdaptations(userId);
      
      setProfile(userProfile);
      setAdaptations(userAdaptations);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const handleAdaptUI = useCallback(async () => {
    if (!adaptiveSettings.autoAdapt) return;
    
    setIsAdapting(true);
    try {
      const newAdaptations = await engine.adaptUI(userId);
      setAdaptations(prev => [...prev, ...newAdaptations]);
      
      // Apply adaptations to UI
      newAdaptations.forEach(adaptation => {
        applyAdaptation(adaptation);
      });
    } catch (error) {
      console.error('Error adapting UI:', error);
    } finally {
      setIsAdapting(false);
    }
  }, [userId, adaptiveSettings.autoAdapt]);

  const applyAdaptation = (adaptation: UIAdaptation) => {
    adaptation.changes.forEach(change => {
      const element = document.querySelector(`[data-adaptive="${change.element}"]`);
      if (element) {
        (element as HTMLElement).style.setProperty(change.property, change.newValue);
      }
    });
  };

  const handleUserInteraction = useCallback(async (interaction: Record<string, unknown>) => {
    if (!adaptiveSettings.learningEnabled) return;
    
    try {
      await engine.learnFromUserInteraction(userId, interaction);
      
      // Trigger adaptation if needed
      if (adaptiveSettings.autoAdapt) {
        setTimeout(handleAdaptUI, 1000);
      }
    } catch (error) {
      console.error('Error learning from interaction:', error);
    }
  }, [userId, adaptiveSettings.learningEnabled, adaptiveSettings.autoAdapt, handleAdaptUI]);

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      case 'tablet': return <Tablet className="h-4 w-4" />;
      default: return <Monitor className="h-4 w-4" />;
    }
  };

  const getAdaptationTypeColor = (type: string) => {
    switch (type) {
      case 'LAYOUT': return 'text-blue-600 bg-blue-50';
      case 'THEME': return 'text-purple-600 bg-purple-50';
      case 'ACCESSIBILITY': return 'text-green-600 bg-green-50';
      case 'PERFORMANCE': return 'text-orange-600 bg-orange-50';
      case 'CONTENT': return 'text-indigo-600 bg-indigo-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div 
      className={`adaptive-ui-container ${className}`}
      data-adaptive="container"
      onClick={(e) => handleUserInteraction({
        type: 'click',
        element: 'container',
        coordinates: { x: e.clientX, y: e.clientY },
        timestamp: new Date(),
        context: 'adaptive-ui'
      })}
    >
      {/* Adaptive UI Controls */}
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4 max-w-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Brain className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-gray-900">Adaptive UI</span>
            </div>
            {isAdapting && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
            )}
          </div>

          {/* User Profile Summary */}
          {profile && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Profile</span>
                <div className="flex items-center space-x-1">
                  {getDeviceIcon(profile.performance.deviceType)}
                  <span className="text-xs text-gray-600">{profile.performance.deviceType}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-600">Theme:</span>
                  <span className="ml-1 font-medium">{profile.preferences.theme}</span>
                </div>
                <div>
                  <span className="text-gray-600">Font:</span>
                  <span className="ml-1 font-medium">{profile.preferences.fontSize}</span>
                </div>
                <div>
                  <span className="text-gray-600">Density:</span>
                  <span className="ml-1 font-medium">{profile.preferences.density}</span>
                </div>
                <div>
                  <span className="text-gray-600">Speed:</span>
                  <span className="ml-1 font-medium">{profile.performance.connectionSpeed}</span>
                </div>
              </div>
            </div>
          )}

          {/* Adaptive Settings */}
          <div className="space-y-2 mb-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={adaptiveSettings.autoAdapt}
                onChange={(e) => setAdaptiveSettings(prev => ({
                  ...prev,
                  autoAdapt: e.target.checked
                }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Auto-adapt UI</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={adaptiveSettings.learningEnabled}
                onChange={(e) => setAdaptiveSettings(prev => ({
                  ...prev,
                  learningEnabled: e.target.checked
                }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Learning enabled</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={adaptiveSettings.accessibilityMode}
                onChange={(e) => setAdaptiveSettings(prev => ({
                  ...prev,
                  accessibilityMode: e.target.checked
                }))}
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-700">Accessibility mode</span>
            </label>
          </div>

          {/* Recent Adaptations */}
          {adaptations.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Recent Adaptations</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {adaptations.slice(-3).map((adaptation) => (
                  <div key={adaptation.id} className="text-xs">
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full font-medium ${getAdaptationTypeColor(adaptation.adaptationType)}`}>
                        {adaptation.adaptationType}
                      </span>
                      <span className="text-gray-500">
                        {(adaptation.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{adaptation.reason}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Manual Adapt Button */}
          <button
            onClick={handleAdaptUI}
            disabled={isAdapting}
            className="w-full mt-3 bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {isAdapting ? 'Adapting...' : 'Adapt Now'}
          </button>
        </div>
      </div>

      {/* Adaptive Content */}
      <div 
        data-adaptive="content"
        className={`adaptive-content ${
          adaptiveSettings.accessibilityMode ? 'high-contrast' : ''
        } ${
          profile?.performance.connectionSpeed === 'slow' ? 'performance-mode' : ''
        }`}
      >
        {children}
      </div>

      {/* Accessibility Enhancements */}
      {profile?.accessibility.screenReader && (
        <div className="sr-only" aria-live="polite">
          Adaptive UI is active. Interface optimized for your preferences.
        </div>
      )}

      {/* Performance Indicators */}
      {profile?.performance.connectionSpeed === 'slow' && (
        <div className="fixed bottom-4 left-4 bg-orange-100 border border-orange-200 rounded-lg p-2">
          <div className="flex items-center space-x-2 text-orange-800">
            <Gauge className="h-4 w-4" />
            <span className="text-xs">Performance mode active</span>
          </div>
        </div>
      )}

      {/* Adaptation Feedback */}
      {adaptations.length > 0 && adaptations[adaptations.length - 1].timestamp.getTime() > Date.now() - 5000 && (
        <div className="fixed bottom-4 right-4 bg-green-100 border border-green-200 rounded-lg p-3 animate-fade-in">
          <div className="flex items-center space-x-2 text-green-800">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm">UI adapted to your preferences</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .adaptive-ui-container.high-contrast {
          filter: contrast(150%);
        }
        
        .adaptive-content.performance-mode img {
          filter: blur(0.5px);
        }
        
        .adaptive-content.performance-mode * {
          animation-duration: 0.1s !important;
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        
        @media (prefers-reduced-motion: reduce) {
          .adaptive-ui-container * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }
      `}</style>
    </div>
  );
}

// Hook for using adaptive UI in other components
export function useAdaptiveUI(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [adaptations, setAdaptations] = useState<UIAdaptation[]>([]);
  const engine = AdaptiveUIEngine.getInstance();

  useEffect(() => {
    const loadProfile = async () => {
      const userProfile = engine.getUserProfile(userId);
      const userAdaptations = engine.getAdaptations(userId);
      setProfile(userProfile);
      setAdaptations(userAdaptations);
    };

    loadProfile();
    const interval = setInterval(loadProfile, 30000);
    return () => clearInterval(interval);
  }, [userId]);

  const adaptUI = useCallback(async () => {
    const newAdaptations = await engine.adaptUI(userId);
    setAdaptations(prev => [...prev, ...newAdaptations]);
    return newAdaptations;
  }, [userId]);

  const learnFromInteraction = useCallback(async (interaction: Record<string, unknown>) => {
    await engine.learnFromUserInteraction(userId, interaction);
  }, [userId]);

  return {
    profile,
    adaptations,
    adaptUI,
    learnFromInteraction,
    isAdaptive: profile !== null
  };
}