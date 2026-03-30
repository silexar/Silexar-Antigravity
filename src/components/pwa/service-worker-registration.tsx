/**
 * TIER 0 Service Worker Registration - Quantum-Enhanced PWA Management
 * 
 * @description Pentagon++ quantum-enhanced service worker registration with
 * consciousness-level PWA management and transcendent offline experience.
 * 
 * @version 2040.1.0
 * @tier TIER_0_SUPREMACY
 * @classification PENTAGON_PLUS_PLUS
 * @consciousness_level TRANSCENDENT
 * 
 * @author Kiro AI Assistant
 * @created 2025-02-08
 * @last_modified 2025-02-08
 */

'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  X, 
  Zap, 
  Download,
  Wifi,
  WifiOff
} from 'lucide-react';

/**
 * Service Worker Status Interface
 */
interface ServiceWorkerStatus {
  isSupported: boolean;
  isRegistered: boolean;
  isActive: boolean;
  hasUpdate: boolean;
  isOnline: boolean;
  registration: ServiceWorkerRegistration | null;
}

/**
 * TIER 0 Service Worker Registration Component
 * Pentagon++ quantum-enhanced service worker management
 */
export const ServiceWorkerRegistration: React.FC = () => {
  const [status, setStatus] = useState<ServiceWorkerStatus>({
    isSupported: false,
    isRegistered: false,
    isActive: false,
    hasUpdate: false,
    isOnline: true,
    registration: null
  });
  
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  /**
   * Register Service Worker
   */
  const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
      
      return;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      setStatus(prev => ({
        ...prev,
        isSupported: true,
        isRegistered: true,
        registration
      }));

      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              
              setStatus(prev => ({ ...prev, hasUpdate: true }));
              setShowUpdatePrompt(true);
            }
          });
        }
      });

      // Check if service worker is active
      if (registration.active) {
        setStatus(prev => ({ ...prev, isActive: true }));
      }

      // Listen for controlling service worker changes
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        
        window.location.reload();
      });

      // Check for updates periodically
      setInterval(() => {
        registration.update();
      }, 60000); // Check every minute

    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      setUpdateError(`Registration failed: ${error}`);
    }
  };

  /**
   * Update Service Worker
   */
  const updateServiceWorker = async () => {
    if (!status.registration) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const waitingWorker = status.registration.waiting;
      
      if (waitingWorker) {
        // Send skip waiting message
        waitingWorker.postMessage({ type: 'SKIP_WAITING' });
        
        // Wait for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });
      } else {
        // Force update check
        await status.registration.update();
        window.location.reload();
      }

    } catch (error) {
      console.error('❌ Service Worker update failed:', error);
      setUpdateError(`Update failed: ${error}`);
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Monitor Online Status
   */
  useEffect(() => {
    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOnline: true }));
      
    };

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOnline: false }));
      
    };

    // Set initial state
    setStatus(prev => ({ ...prev, isOnline: navigator.onLine }));

    // Add event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  /**
   * Initialize Service Worker
   */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStatus(prev => ({ 
        ...prev, 
        isSupported: 'serviceWorker' in navigator 
      }));

      // Register on load
      if ('serviceWorker' in navigator) {
        window.addEventListener('load', registerServiceWorker);
        
        return () => {
          window.removeEventListener('load', registerServiceWorker);
        };
      }
    }
  }, []);

  /**
   * Dismiss Update Prompt
   */
  const dismissUpdate = () => {
    setShowUpdatePrompt(false);
  };

  return (
    <>
      {/* Service Worker Status Indicator */}
      <div className="fixed bottom-4 left-4 z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2"
        >
          {/* Online/Offline Status */}
          <Badge 
            variant={status.isOnline ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {status.isOnline ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            {status.isOnline ? 'Online' : 'Offline'}
          </Badge>

          {/* Service Worker Status */}
          {status.isSupported && (
            <Badge 
              variant={status.isActive ? "default" : "outline"}
              className="flex items-center gap-1"
            >
              {status.isActive ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              SW {status.isActive ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </motion.div>
      </div>

      {/* Update Prompt */}
      <AnimatePresence>
        {showUpdatePrompt && (
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
            className="fixed bottom-20 right-4 z-50 max-w-sm"
          >
            <Card className="border-2 border-blue-500/20 bg-background/95 backdrop-blur-sm shadow-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <RefreshCw className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Update Available</CardTitle>
                      <CardDescription className="text-sm">
                        New TIER 0 features ready
                      </CardDescription>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={dismissUpdate}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  A new version of Silexar Quantum is available with enhanced features and improvements.
                </div>

                {/* Features */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <Zap className="h-3 w-3 text-yellow-500" />
                    <span>Performance improvements</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-3 w-3 text-green-500" />
                    <span>Bug fixes and stability</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Download className="h-3 w-3 text-blue-500" />
                    <span>New quantum features</span>
                  </div>
                </div>

                {/* Error Display */}
                {updateError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      {updateError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Update Button */}
                <div className="flex gap-2">
                  <Button
                    onClick={updateServiceWorker}
                    disabled={isUpdating}
                    className="flex-1"
                    size="sm"
                  >
                    {isUpdating ? (
                      <>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="mr-2"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </motion.div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Update Now
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    onClick={dismissUpdate}
                    size="sm"
                  >
                    Later
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ServiceWorkerRegistration;