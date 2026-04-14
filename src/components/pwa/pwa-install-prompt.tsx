/**
 * TIER 0 PWA Install Prompt - Quantum-Enhanced Installation Experience
 * 
 * @description Pentagon++ quantum-enhanced PWA installation prompt with
 * consciousness-level user engagement and transcendent installation experience.
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  X, 
  Smartphone, 
  Monitor, 
  Zap, 
  Shield, 
  Wifi,
  Star
} from 'lucide-react';

/**
 * PWA Install Event Interface
 */
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

/**
 * TIER 0 PWA Install Prompt Component
 * Pentagon++ quantum-enhanced PWA installation interface
 */
export const PWAInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [installCount, setInstallCount] = useState(0);

  /**
   * Check if PWA is already installed
   */
  const checkIfInstalled = () => {
    // Check if running in standalone mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isIOSStandalone = (window.navigator as any).standalone === true;
    
    return isStandalone || isIOSStandalone;
  };

  /**
   * Handle beforeinstallprompt event
   */
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      
      // Show prompt after a delay if not already installed
      if (!checkIfInstalled()) {
        setTimeout(() => {
          setShowPrompt(true);
        }, 10000); // Show after 10 seconds
      }
    };

    const handleAppInstalled = () => {
      
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    // Check initial installation status
    setIsInstalled(checkIfInstalled());

    // Add event listeners
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  /**
   * Handle PWA Installation
   */
  const handleInstall = async () => {
    if (!deferredPrompt) return;

    setIsInstalling(true);

    try {
      // Show the install prompt
      await deferredPrompt.prompt();
      
      // Wait for user choice
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        
        setInstallCount(prev => prev + 1);
        
        // Track installation analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as any).gtag('event', 'pwa_install', {
            event_category: 'engagement',
            event_label: 'accepted',
            value: 1
          });
        }
      } else {
        
      }
      
      // Clean up
      setDeferredPrompt(null);
      setShowPrompt(false);
      
    } catch (error) {
      } finally {
      setIsInstalling(false);
    }
  };

  /**
   * Dismiss Install Prompt
   */
  const dismissPrompt = () => {
    setShowPrompt(false);
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
    
    // Track dismissal analytics
    if (typeof window !== 'undefined' && 'gtag' in window) {
      (window as any).gtag('event', 'pwa_install', {
        event_category: 'engagement',
        event_label: 'dismissed',
        value: 0
      });
    }
  };

  /**
   * Check if prompt was already dismissed
   */
  useEffect(() => {
    const wasDismissed = sessionStorage.getItem('pwa-prompt-dismissed');
    if (wasDismissed) {
      setShowPrompt(false);
    }
  }, []);

  // Don't show if already installed or no prompt available
  if (isInstalled || !deferredPrompt) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 right-4 z-50 max-w-sm"
        >
          <Card className="border-2 border-primary/20 bg-background/95 backdrop-blur-sm shadow-2xl">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Download className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Install App</CardTitle>
                    <CardDescription className="text-sm">
                      Get the full TIER 0 experience
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={dismissPrompt}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Features */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  <span>Lightning-fast performance</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wifi className="h-4 w-4 text-blue-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Shield className="h-4 w-4 text-green-500" />
                  <span>Pentagon++ security</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Star className="h-4 w-4 text-purple-500" />
                  <span>Consciousness-level UX</span>
                </div>
              </div>

              {/* Device Icons */}
              <div className="flex items-center justify-center gap-4 py-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Smartphone className="h-4 w-4" />
                  <span>Mobile</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Monitor className="h-4 w-4" />
                  <span>Desktop</span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1 justify-center">
                <Badge variant="secondary" className="text-xs">
                  TIER 0 PWA
                </Badge>
                <Badge variant="outline" className="text-xs">
                  Quantum Enhanced
                </Badge>
              </div>

              {/* Install Button */}
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                className="w-full"
                size="sm"
              >
                {isInstalling ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="mr-2"
                    >
                      <Download className="h-4 w-4" />
                    </motion.div>
                    Installing...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Install Now
                  </>
                )}
              </Button>

              {/* Install Count */}
              {installCount > 0 && (
                <div className="text-center text-xs text-muted-foreground">
                  Installation attempt #{installCount}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PWAInstallPrompt;