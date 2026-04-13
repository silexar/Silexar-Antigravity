/**
 * TIER 0 Accessibility Dashboard - Consciousness-Level Universal Access Monitor
 * 
 * @description Pentagon++ quantum-enhanced accessibility dashboard with consciousness-level
 * universal access monitoring and transcendent user experience optimization.
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

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTier0Accessibility } from '@/hooks/use-tier0-accessibility';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Keyboard, 
  Volume2, 
  Palette, 
  Brain, 
  Zap, 
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Play,
  Pause,
  Settings
} from 'lucide-react';

/**
 * TIER 0 Accessibility Dashboard Component
 * Pentagon++ quantum-enhanced accessibility monitoring interface
 */
export const Tier0AccessibilityDashboard: React.FC = () => {
  const {
    metrics,
    violations,
    isLoading,
    isInitialized,
    lastAuditTime,
    overallScore,
    runAudit,
    autoFixViolations,
    enableRealTimeMonitoring,
    disableRealTimeMonitoring,
    isRealTimeEnabled,
    quantumInsights,
    recommendations
  } = useTier0Accessibility({
    autoRun: true,
    realTimeMonitoring: false,
    autoFix: true,
    quantumEnhancement: true,
    consciousnessLevel: 'TRANSCENDENT',
    wcagLevel: 'AAA_PLUS_TRANSCENDENT'
  });

  const [selectedViolation, setSelectedViolation] = useState<any>(null);

  /**
   * Get Score Color Based on Value
   */
  const getScoreColor = (score: number): string => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-blue-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  /**
   * Get Severity Badge Variant
   */
  const getSeverityVariant = (severity: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (severity) {
      case 'CONSCIOUSNESS_BREAKING':
      case 'CRITICAL':
        return 'destructive';
      case 'SERIOUS':
        return 'secondary';
      case 'MODERATE':
        return 'outline';
      default:
        return 'default';
    }
  };

  /**
   * Format Time Ago
   */
  const formatTimeAgo = (date: Date | null): string => {
    if (!date) return 'Never';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-lg font-medium">Initializing TIER 0 Accessibility System...</p>
          <p className="text-sm text-muted-foreground">Pentagon++ quantum enhancement loading</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">TIER 0 Accessibility Dashboard</h1>
          <p className="text-muted-foreground">
            Consciousness-level universal access monitoring with Pentagon++ quantum enhancement
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={isRealTimeEnabled ? disableRealTimeMonitoring : enableRealTimeMonitoring}
          >
            {isRealTimeEnabled ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
            {isRealTimeEnabled ? 'Pause' : 'Start'} Real-time
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => runAudit()}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Audit Now
          </Button>
          
          <Button
            size="sm"
            onClick={autoFixViolations}
            disabled={isLoading || violations.length === 0}
          >
            <Zap className="h-4 w-4 mr-2" />
            Auto-Fix ({violations.filter(v => v.autoFixAvailable).length})
          </Button>
        </div>
      </div>

      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Consciousness-Level Accessibility Score
          </CardTitle>
          <CardDescription>
            Overall accessibility score with quantum enhancement
            {lastAuditTime && (
              <span className="ml-2 text-xs">
                Last audit: {formatTimeAgo(lastAuditTime)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-4xl font-bold">
              <span className={getScoreColor(overallScore)}>
                {overallScore.toFixed(1)}%
              </span>
            </div>
            <div className="flex-1">
              <Progress value={overallScore} className="h-3" />
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">
                {violations.length} violations found
              </div>
              <div className="text-xs text-muted-foreground">
                {violations.filter(v => v.autoFixAvailable).length} auto-fixable
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              WCAG Compliance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(metrics.wcagCompliance)}>
                {metrics.wcagCompliance.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.wcagCompliance} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Keyboard className="h-4 w-4" />
              Keyboard Navigation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(metrics.keyboardNavigation)}>
                {metrics.keyboardNavigation.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.keyboardNavigation} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Volume2 className="h-4 w-4" />
              Screen Reader
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(metrics.screenReaderSupport)}>
                {metrics.screenReaderSupport.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.screenReaderSupport} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Color Contrast
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor((metrics.colorContrastRatio / 21) * 100)}>
                {metrics.colorContrastRatio.toFixed(1)}:1
              </span>
            </div>
            <Progress value={(metrics.colorContrastRatio / 21) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Consciousness Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getScoreColor(metrics.consciousnessScore)}>
                {metrics.consciousnessScore.toFixed(1)}%
              </span>
            </div>
            <Progress value={metrics.consciousnessScore} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Violations */}
      {violations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Accessibility Violations ({violations.length})
            </CardTitle>
            <CardDescription>
              Issues detected that impact universal access and consciousness-level UX
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {violations.slice(0, 10).map((violation, index) => (
                <motion.div
                  key={violation.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                  onClick={() => setSelectedViolation(violation)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant={getSeverityVariant(violation.severity)}>
                          {violation.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {violation.element}
                        </span>
                        {violation.autoFixAvailable && (
                          <Badge variant="outline" className="text-xs">
                            Auto-fixable
                          </Badge>
                        )}
                      </div>
                      <h4 className="font-medium">{violation.rule}</h4>
                      <p className="text-sm text-muted-foreground mt-1">
                        {violation.description}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Impact: {violation.consciousnessImpact}%</span>
                        <span>Fix time: {Math.round(violation.estimatedFixTime / 1000)}s</span>
                      </div>
                    </div>
                    <div className="text-right">
                      {violation.severity === 'CONSCIOUSNESS_BREAKING' && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                      {violation.severity === 'CRITICAL' && (
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                      )}
                      {violation.severity === 'SERIOUS' && (
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {violations.length > 10 && (
                <div className="text-center py-4">
                  <Button variant="outline" size="sm">
                    Show {violations.length - 10} more violations
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quantum Insights */}
      {quantumInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Quantum Accessibility Insights
            </CardTitle>
            <CardDescription>
              Pentagon++ quantum-enhanced accessibility intelligence
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {quantumInsights.slice(0, 5).map((insight: string, index: number) => (
                <Alert key={`insight-${index}`}>
                  <Brain className="h-4 w-4" />
                  <AlertDescription>{insight}</AlertDescription>
                </Alert>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Consciousness-Level Recommendations
            </CardTitle>
            <CardDescription>
              AI-powered suggestions for transcendent accessibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recommendations.slice(0, 5).map((recommendation: string, index: number) => (
                <div key={`rec-${index}`} className="flex items-start gap-3 p-3 border rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                  <p className="text-sm">{recommendation}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Selected Violation Modal */}
      <AnimatePresence>
        {selectedViolation && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedViolation(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-background border rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">{selectedViolation.rule}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={getSeverityVariant(selectedViolation.severity)}>
                      {selectedViolation.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {selectedViolation.element}
                    </span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedViolation(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedViolation.description}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Solution</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedViolation.solution}
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Quantum Analysis</h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedViolation.quantumAnalysis}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <span className="text-sm font-medium">Consciousness Impact</span>
                    <div className="text-2xl font-bold text-red-600">
                      {selectedViolation.consciousnessImpact}%
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Estimated Fix Time</span>
                    <div className="text-2xl font-bold text-blue-600">
                      {Math.round(selectedViolation.estimatedFixTime / 1000)}s
                    </div>
                  </div>
                </div>
                
                {selectedViolation.autoFixAvailable && (
                  <div className="pt-4 border-t">
                    <Button
                      onClick={() => {
                        autoFixViolations();
                        setSelectedViolation(null);
                      }}
                      className="w-full"
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      Apply Auto-Fix
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tier0AccessibilityDashboard;