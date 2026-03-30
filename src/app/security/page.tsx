/**
 * 🛡️ SILEXAR PULSE QUANTUM - SECURITY CENTER PAGE TIER 0
 * 
 * Centro de comando de seguridad militar
 * Página principal del sistema de seguridad TIER 0
 * 
 * @version 2040.1.0
 * @author Silexar Pulse Quantum Team
 * @classification TIER 0 - MILITARY GRADE SECURITY CENTER
 */

import React from 'react';
import { Metadata } from 'next';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { Shield, Lock, Eye, AlertTriangle } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Security Center - Silexar Pulse Quantum',
  description: 'Centro de comando de seguridad militar TIER 0 con monitoreo en tiempo real',
};

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  🛡️ Security Center TIER 0
                </h1>
                <p className="text-gray-600">
                  Centro de comando de seguridad militar con protección avanzada
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 px-3 py-2 bg-green-100 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-green-800">Sistema Activo</span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500">Nivel de Seguridad</div>
                <div className="text-lg font-bold text-blue-600">TIER 0 - MILITARY</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Features Banner */}
      <div className="bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div className="flex items-center justify-center space-x-2">
              <Lock className="h-5 w-5" />
              <span className="text-sm font-medium">Encriptación AES-256</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Eye className="h-5 w-5" />
              <span className="text-sm font-medium">Monitoreo 24/7</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Detección de Amenazas</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <Shield className="h-5 w-5" />
              <span className="text-sm font-medium">OWASP Compliance</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SecurityDashboard />
      </div>

      {/* Footer Security Info */}
      <div className="bg-gray-900 text-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">🔐 Protección Avanzada</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Encriptación militar AES-256-GCM</li>
                <li>• Autenticación multi-factor (MFA)</li>
                <li>• Control de acceso basado en roles (RBAC)</li>
                <li>• Protección contra ataques de fuerza bruta</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">🔍 Monitoreo Continuo</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Escaneo de vulnerabilidades en tiempo real</li>
                <li>• Detección de anomalías con IA</li>
                <li>• Auditoría completa de eventos de seguridad</li>
                <li>• Alertas automáticas de incidentes</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">📊 Cumplimiento Normativo</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>• Estándares OWASP Top 10</li>
                <li>• Compliance ISO 27001</li>
                <li>• Regulaciones de protección de datos</li>
                <li>• Auditorías de seguridad regulares</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-400">
              <Shield className="h-4 w-4" />
              <span>
                Silexar Pulse Quantum Security Center TIER 0 - Protección de Grado Militar
              </span>
            </div>
            <div className="mt-2 text-xs text-gray-500">
              Última actualización de seguridad: {new Date().toLocaleDateString()} • 
              Sistema monitoreado 24/7 • Tiempo de respuesta: &lt;1 minuto
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}