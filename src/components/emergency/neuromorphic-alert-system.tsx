'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Bell, Shield, Zap, Activity, Brain, Cpu, Network } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface Alert {
  id: string;
  type: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
  timestamp: Date;
  source: string;
  autoResolved: boolean;
}

export function NeuromorphicAlertSystem() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [neuralConnections, setNeuralConnections] = useState<Array<{x: number, y: number, active: boolean}>>([]);

  useEffect(() => {
    // Initialize neural connections
    const connections = Array.from({ length: 50 }, (_, i) => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      active: Math.random() > 0.5
    }));
    setNeuralConnections(connections);

    // Simulate incoming alerts
    const alertInterval = setInterval(() => {
      if (Math.random() > 0.7) {
        const types: Alert['type'][] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
        const sources = ['Neural Core', 'Quantum Matrix', 'Security Grid', 'AI Cortex', 'Pentagon++'];
        
        const newAlert: Alert = {
          id: `alert-${Date.now()}-${Math.random()}`,
          type: types[Math.floor(Math.random() * types.length)],
          title: `Security Breach Detected`,
          description: `Anomalous activity detected in ${sources[Math.floor(Math.random() * sources.length)]}`,
          timestamp: new Date(),
          source: sources[Math.floor(Math.random() * sources.length)],
          autoResolved: Math.random() > 0.3
        };

        setAlerts(prev => [newAlert, ...prev.slice(0, 9)]);
      }
    }, 3000);

    // Neural scanning animation
    const scanInterval = setInterval(() => {
      setIsScanning(prev => !prev);
      setNeuralConnections(prev => 
        prev.map(conn => ({
          ...conn,
          active: Math.random() > 0.3
        }))
      );
    }, 1000);

    return () => {
      clearInterval(alertInterval);
      clearInterval(scanInterval);
    };
  }, []);

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'CRITICAL': return 'border-red-500 bg-red-500/10 text-red-400';
      case 'HIGH': return 'border-orange-500 bg-orange-500/10 text-orange-400';
      case 'MEDIUM': return 'border-yellow-500 bg-yellow-500/10 text-yellow-400';
      default: return 'border-green-500 bg-green-500/10 text-green-400';
    }
  };

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'CRITICAL': return <AlertTriangle className="w-5 h-5 text-red-500 animate-pulse" />;
      case 'HIGH': return <Zap className="w-5 h-5 text-orange-500 animate-pulse" />;
      case 'MEDIUM': return <Activity className="w-5 h-5 text-yellow-500" />;
      default: return <Bell className="w-5 h-5 text-green-500" />;
    }
  };

  return (
    <div className="fixed top-0 right-0 w-96 h-screen bg-black/95 backdrop-blur-lg border-l border-green-500/30 z-50 overflow-hidden">
      {/* Neural Network Background */}
      <div className="absolute inset-0 opacity-30">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <defs>
            <radialGradient id="neural-node">
              <stop offset="0%" stopColor="#00ff88" stopOpacity="1" />
              <stop offset="100%" stopColor="#00ff88" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Neural connections */}
          {neuralConnections.map((conn, i) => (
            <circle
              key={`node-${i}`}
              cx={conn.x}
              cy={conn.y}
              r={conn.active ? "1" : "0.5"}
              fill="url(#neural-node)"
              className={conn.active ? "animate-pulse" : ""}
              style={{
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
          
          {/* Scanning line */}
          {isScanning && (
            <line
              x1="0"
              y1={Date.now() % 100}
              x2="100"
              y2={Date.now() % 100}
              stroke="#00ff88"
              strokeWidth="0.5"
              opacity="0.8"
              className="animate-pulse"
            />
          )}
        </svg>
      </div>

      {/* Header */}
      <div className="relative z-10 p-4 border-b border-green-500/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-green-500 animate-pulse" />
            <h2 className="text-lg font-bold text-green-400">NEURAL ALERTS 24/7</h2>
          </div>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${isScanning ? 'bg-green-500 animate-pulse' : 'bg-gray-500'}`} />
            <span className="text-xs text-gray-400">SCANNING</span>
          </div>
        </div>
        
        {/* Status indicators */}
        <div className="flex items-center justify-between mt-3 text-xs">
          <div className="flex items-center space-x-2">
            <Network className="w-4 h-4 text-blue-500" />
            <span className="text-blue-400">QUANTUM: ONLINE</span>
          </div>
          <div className="flex items-center space-x-2">
            <Cpu className="w-4 h-4 text-purple-500" />
            <span className="text-purple-400">AI: ACTIVE</span>
          </div>
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-green-400">SECURE</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      <div className="relative z-10 p-4 space-y-3 overflow-y-auto h-[calc(100%-120px)]">
        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-green-400 font-medium">Sistema Seguro</p>
            <p className="text-gray-500 text-sm">No hay alertas activas</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <Card
              key={alert.id}
              className={`p-4 border-2 ${getAlertColor(alert.type)} backdrop-blur-sm transition-all duration-300 hover:scale-105`}
            >
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  {getAlertIcon(alert.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm font-bold truncate">{alert.title}</h3>
                    <span className="text-xs opacity-70">
                      {alert.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs opacity-90 mb-2">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono opacity-70">{alert.source}</span>
                    {alert.autoResolved && (
                      <span className="text-xs text-green-400 font-medium">
                        AUTO-RESUELTO
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="relative z-10 p-4 border-t border-green-500/30 bg-black/50">
        <div className="flex items-center justify-between text-xs">
          <div className="text-gray-400">
            Alertas Activas: <span className="text-yellow-400 font-bold">{alerts.filter(a => !a.autoResolved).length}</span>
          </div>
          <div className="text-gray-400">
            Total: <span className="text-green-400 font-bold">{alerts.length}</span>
          </div>
        </div>
        
        {/* Neural activity indicator */}
        <div className="mt-2 flex items-center space-x-2">
          <div className="flex-1 bg-gray-700 rounded-full h-1">
            <div 
              className="bg-gradient-to-r from-green-500 to-blue-500 h-1 rounded-full transition-all duration-300"
              style={{ width: `${Math.random() * 100}%` }}
            />
          </div>
          <span className="text-xs text-gray-500">NEURAL</span>
        </div>
      </div>
    </div>
  );
}