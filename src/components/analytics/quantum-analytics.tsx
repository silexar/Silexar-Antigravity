/**
 * TIER 0 Quantum Analytics - Consciousness-Level Analytics System
 * 
 * @description Pentagon++ quantum-enhanced analytics system with consciousness-level
 * user behavior tracking and transcendent performance monitoring.
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

import React, { useEffect, useRef } from 'react';

/**
 * Quantum Analytics Configuration
 */
interface QuantumAnalyticsConfig {
  trackingId?: string;
  enableConsciousnessTracking?: boolean;
  enableQuantumMetrics?: boolean;
  enablePerformanceMonitoring?: boolean;
  enableUserBehaviorAnalysis?: boolean;
  enableOfflineTracking?: boolean;
  sampleRate?: number;
}

/**
 * TIER 0 Quantum Analytics Component
 * Pentagon++ quantum-enhanced analytics with consciousness-level insights
 */
export const QuantumAnalytics: React.FC<QuantumAnalyticsConfig> = ({
  trackingId = process.env.NEXT_PUBLIC_GA_TRACKING_ID,
  enableConsciousnessTracking = true,
  enableQuantumMetrics = true,
  enablePerformanceMonitoring = true,
  enableUserBehaviorAnalysis = true,
  enableOfflineTracking = true,
  sampleRate = 100
}) => {
  const analyticsInitialized = useRef(false);
  const performanceObserver = useRef<PerformanceObserver | null>(null);
  const intersectionObserver = useRef<IntersectionObserver | null>(null);

  /**
   * Initialize Google Analytics
   */
  const initializeGoogleAnalytics = () => {
    if (!trackingId || typeof window === 'undefined') return;

    // Load Google Analytics script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${trackingId}`;
    document.head.appendChild(script);

    // Initialize gtag
    (window as unknown).dataLayer = (window as unknown).dataLayer || [];
    function gtag(...args: unknown[]) {
      (window as unknown).dataLayer.push(args);
    }
    
    (window as unknown).gtag = gtag;
    
    gtag('js', new Date());
    gtag('config', trackingId, {
      page_title: document.title,
      page_location: window.location.href,
      sample_rate: sampleRate,
      site_speed_sample_rate: 100,
      custom_map: {
        custom_parameter_1: 'consciousness_level',
        custom_parameter_2: 'quantum_enhancement',
        custom_parameter_3: 'tier_level'
      }
    });

  };

  /**
   * Initialize Core Web Vitals Monitoring
   */
  const initializeCoreWebVitals = async () => {
    if (!enablePerformanceMonitoring) return;

    try {
      const { onCLS, onINP, onFCP, onLCP, onTTFB } = await import('web-vitals');

      // Track Core Web Vitals with quantum enhancement
      const sendToAnalytics = (metric: { name: string; id: string; value: number; [key: string]: unknown }) => {
        const quantumMetric = {
          ...metric,
          consciousness_level: 'TRANSCENDENT',
          quantum_enhancement: true,
          tier_level: 'TIER_0_SUPREMACY'
        };

        // Send to Google Analytics
        if (typeof window !== 'undefined' && 'gtag' in window) {
          (window as unknown).gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
            non_interaction: true,
            custom_parameter_1: 'TRANSCENDENT',
            custom_parameter_2: true,
            custom_parameter_3: 'TIER_0_SUPREMACY'
          });
        }

        // Send to quantum analytics endpoint
        fetch('/api/analytics/quantum-metrics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(quantumMetric)
        }).catch(error => {
          console.error('[QuantumAnalytics] Failed to send quantum metrics:', error);
        });

      };

      // Initialize Core Web Vitals tracking
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const analyticsCallback = sendToAnalytics as unknown as (metric: unknown) => void;
      onCLS(analyticsCallback);
      onINP(analyticsCallback);
      onFCP(analyticsCallback);
      onLCP(analyticsCallback);
      onTTFB(analyticsCallback);

    } catch (error) {
      
    }
  };

  /**
   * Initialize Performance Observer
   */
  const initializePerformanceObserver = () => {
    if (!enablePerformanceMonitoring || !('PerformanceObserver' in window)) return;

    try {
      performanceObserver.current = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        
        entries.forEach((entry) => {
          // Track navigation timing
          if (entry.entryType === 'navigation') {
            const navEntry = entry as PerformanceNavigationTiming;
            
            const quantumNavMetrics = {
              type: 'navigation',
              domContentLoaded: navEntry.domContentLoadedEventEnd - navEntry.domContentLoadedEventStart,
              loadComplete: navEntry.loadEventEnd - navEntry.loadEventStart,
              firstPaint: navEntry.responseEnd - navEntry.requestStart,
              consciousness_level: 'TRANSCENDENT',
              quantum_enhancement: true
            };

            // Send quantum navigation metrics
            fetch('/api/analytics/navigation-metrics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(quantumNavMetrics)
            }).catch((error) => {
              console.error('[QuantumAnalytics] Failed to send navigation metrics:', error);
            });
          }

          // Track resource timing
          if (entry.entryType === 'resource') {
            const resourceEntry = entry as PerformanceResourceTiming;
            
            // Track slow resources
            if (resourceEntry.duration > 1000) {
              const slowResource = {
                type: 'slow_resource',
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
                consciousness_impact: resourceEntry.duration > 3000 ? 'HIGH' : 'MEDIUM'
              };

              if (typeof window !== 'undefined' && 'gtag' in window) {
                (window as unknown).gtag('event', 'slow_resource', {
                  event_category: 'Performance',
                  event_label: resourceEntry.name,
                  value: Math.round(resourceEntry.duration),
                  custom_parameter_1: slowResource.consciousness_impact
                });
              }
            }
          }
        });
      });

      // Observe navigation and resource timing
      performanceObserver.current.observe({ 
        entryTypes: ['navigation', 'resource', 'paint', 'largest-contentful-paint'] 
      });

    } catch (error) {
      
    }
  };

  /**
   * Initialize User Behavior Tracking
   */
  const initializeUserBehaviorTracking = () => {
    if (!enableUserBehaviorAnalysis) return;

    // Track scroll depth
    let maxScrollDepth = 0;
    const trackScrollDepth = () => {
      const scrollDepth = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      
      if (scrollDepth > maxScrollDepth) {
        maxScrollDepth = scrollDepth;
        
        // Track milestone scroll depths
        if ([25, 50, 75, 90, 100].includes(scrollDepth)) {
          if (typeof window !== 'undefined' && 'gtag' in window) {
            (window as unknown).gtag('event', 'scroll_depth', {
              event_category: 'Engagement',
              event_label: `${scrollDepth}%`,
              value: scrollDepth,
              custom_parameter_1: 'TRANSCENDENT'
            });
          }
        }
      }
    };

    // Track time on page
    const startTime = Date.now();
    const trackTimeOnPage = () => {
      const timeOnPage = Math.round((Date.now() - startTime) / 1000);
      
      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as unknown).gtag('event', 'time_on_page', {
          event_category: 'Engagement',
          event_label: 'seconds',
          value: timeOnPage,
          custom_parameter_1: 'TRANSCENDENT'
        });
      }
    };

    // Track element visibility
    if ('IntersectionObserver' in window) {
      intersectionObserver.current = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target;
            const elementId = element.id || element.className || element.tagName;
            
            if (typeof window !== 'undefined' && 'gtag' in window) {
              (window as unknown).gtag('event', 'element_view', {
                event_category: 'Visibility',
                event_label: elementId,
                custom_parameter_1: 'TRANSCENDENT'
              });
            }
          }
        });
      }, { threshold: 0.5 });

      // Observe key elements
      const keyElements = document.querySelectorAll('[data-track-visibility]');
      keyElements.forEach(el => {
        intersectionObserver.current?.observe(el);
      });
    }

    // Add event listeners
    window.addEventListener('scroll', trackScrollDepth, { passive: true });
    window.addEventListener('beforeunload', trackTimeOnPage);

    return () => {
      window.removeEventListener('scroll', trackScrollDepth);
      window.removeEventListener('beforeunload', trackTimeOnPage);
    };
  };

  /**
   * Initialize Consciousness-Level Tracking
   */
  const initializeConsciousnessTracking = () => {
    if (!enableConsciousnessTracking) return;

    // Track consciousness-level interactions
    const trackConsciousnessEvent = (eventType: string, data: Record<string, unknown>) => {
      const consciousnessEvent = {
        type: eventType,
        timestamp: Date.now(),
        consciousness_level: 'TRANSCENDENT',
        quantum_enhancement: true,
        tier_level: 'TIER_0_SUPREMACY',
        ...data
      };

      // Send to quantum consciousness endpoint
      fetch('/api/analytics/consciousness-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(consciousnessEvent)
      }).catch((error) => {
        console.error('[QuantumAnalytics] Failed to send consciousness event:', error);
      });
    };

    // Track quantum interactions
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (target.dataset.quantumTrack) {
        trackConsciousnessEvent('quantum_interaction', {
          element: target.tagName,
          quantum_id: target.dataset.quantumTrack,
          coordinates: { x: event.clientX, y: event.clientY }
        });
      }
    });

    // Track consciousness state changes
    document.addEventListener('visibilitychange', () => {
      trackConsciousnessEvent('consciousness_state_change', {
        state: document.hidden ? 'background' : 'foreground',
        timestamp: Date.now()
      });
    });
  };

  /**
   * Initialize Offline Analytics
   */
  const initializeOfflineAnalytics = () => {
    if (!enableOfflineTracking) return;

    // Track offline/online events
    const trackConnectionStatus = (status: 'online' | 'offline') => {
      const connectionEvent = {
        type: 'connection_status',
        status,
        timestamp: Date.now(),
        consciousness_preserved: status === 'offline'
      };

      if (status === 'online') {
        // Send stored offline events when back online
        const storedEvents = localStorage.getItem('quantum_offline_events');
        if (storedEvents) {
          try {
            const events = JSON.parse(storedEvents);
            fetch('/api/analytics/offline-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ events })
            }).then(() => {
              localStorage.removeItem('quantum_offline_events');
            }).catch((error) => {
              console.error('[QuantumAnalytics] Failed to sync offline events:', error);
            });
          } catch (error) {
            
          }
        }
      }

      if (typeof window !== 'undefined' && 'gtag' in window) {
        (window as unknown).gtag('event', 'connection_status', {
          event_category: 'System',
          event_label: status,
          custom_parameter_1: 'TRANSCENDENT'
        });
      }
    };

    window.addEventListener('online', () => trackConnectionStatus('online'));
    window.addEventListener('offline', () => trackConnectionStatus('offline'));
  };

  /**
   * Initialize All Analytics Systems
   */
  useEffect(() => {
    if (analyticsInitialized.current) return;

    const initializeAnalytics = async () => {
      try {
        // Initialize core systems
        initializeGoogleAnalytics();
        await initializeCoreWebVitals();
        initializePerformanceObserver();
        
        // Initialize advanced tracking
        const cleanupUserBehavior = initializeUserBehaviorTracking();
        initializeConsciousnessTracking();
        initializeOfflineAnalytics();

        analyticsInitialized.current = true;

        return cleanupUserBehavior;
      } catch (error) {
        return () => {}; // Return empty cleanup function on error
      }
    };

    const cleanup: Promise<(() => void) | undefined> = initializeAnalytics();

    return () => {
      // Cleanup observers
      if (performanceObserver.current) {
        performanceObserver.current.disconnect();
      }
      if (intersectionObserver.current) {
        intersectionObserver.current.disconnect();
      }
      
      // Run user behavior cleanup
      cleanup.then(cleanupFn => {
        if (typeof cleanupFn === 'function') {
          cleanupFn();
        }
      }).catch(error => {
        });
    };
  }, []);

  // This component doesn't render anything visible
  return null;
};

export default QuantumAnalytics;