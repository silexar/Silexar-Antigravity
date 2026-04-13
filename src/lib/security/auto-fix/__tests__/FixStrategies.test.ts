/**
 * Tests para FixStrategies
 * @module SecurityAutoFix/Tests/FixStrategies
 */

import { describe, it, expect } from 'vitest';
import {
  FixStrategies,
  getAllStrategies,
  getStrategiesBySeverity,
  isAutoFixable,
} from '../FixStrategies';
import type { SecurityIssue } from '../types';

describe('FixStrategies', () => {
  describe('Estructura de estrategias', () => {
    it('debe tener estrategias HIGH, MEDIUM y LOW', () => {
      expect(FixStrategies.HIGH).toBeDefined();
      expect(FixStrategies.MEDIUM).toBeDefined();
      expect(FixStrategies.LOW).toBeDefined();
    });

    it('debe retornar todas las estrategias', () => {
      const all = getAllStrategies();
      expect(all.length).toBeGreaterThan(0);
      expect(all).toEqual([
        ...FixStrategies.HIGH,
        ...FixStrategies.MEDIUM,
        ...FixStrategies.LOW,
      ]);
    });

    it('debe filtrar por severidad', () => {
      const high = getStrategiesBySeverity('HIGH');
      expect(high.every(s => s.severity === 'HIGH')).toBe(true);
      
      const medium = getStrategiesBySeverity('MEDIUM');
      expect(medium.every(s => s.severity === 'MEDIUM')).toBe(true);
      
      const low = getStrategiesBySeverity('LOW');
      expect(low.every(s => s.severity === 'LOW')).toBe(true);
    });
  });

  describe('Detección de console.log sensible', () => {
    const consoleStrategy = FixStrategies.HIGH.find(
      s => s.name === 'console-sensitive-data'
    );

    it('debe detectar console.log con password', () => {
      const code = `
        function login() {
          console.log(password, userId);
        }
      `;
      const issues = consoleStrategy!.detect('test.ts', code);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('console_sensitive_data');
      expect(issues[0].severity).toBe('HIGH');
    });

    it('debe detectar console.log con token', () => {
      const code = `
        const response = await fetch('/api/auth');
        console.log(token, response.data);
        `;
      const issues = consoleStrategy!.detect('test.ts', code);
      expect(issues.length).toBeGreaterThan(0);
    });

    it('debe aplicar fix correctamente', () => {
      const code = `console.log(password, user);`;
      const issues = consoleStrategy!.detect('test.ts', code);
      expect(issues.length).toBe(1);

      const fixed = consoleStrategy!.fix(issues[0], code);
      expect(fixed).toContain('auditLogger');
      expect(fixed).toContain('REDACTED');
    });
  });

  describe('Detección de as unknown', () => {
    const anyStrategy = FixStrategies.MEDIUM.find(
      s => s.name === 'as-any-cast'
    );

    it('debe detectar uso de as unknown', () => {
      const code = `
        const data = response.body as any;
        const value = input as any;
      `;
      const issues = anyStrategy!.detect('test.ts', code);
      expect(issues.length).toBe(2);
      expect(issues.every(i => i.type === 'as_any_cast')).toBe(true);
    });

    it('debe aplicar fix con ts-expect-error', () => {
      const code = `const data = response as any;`;
      const issues = anyStrategy!.detect('test.ts', code);
      const fixed = anyStrategy!.fix(issues[0], code);
      expect(fixed).toContain('@ts-expect-error');
    });
  });

  describe('Detección de imports no usados', () => {
    const importStrategy = FixStrategies.LOW.find(
      s => s.name === 'unused-imports'
    );

    it('debe detectar imports no utilizados', () => {
      const code = `
        import { useState, useEffect } from 'react';
        import { unusedHelper } from './helpers';
        
        export function Component() {
          const [state, setState] = useState(0);
          return null;
        }
      `;
      const issues = importStrategy!.detect('test.tsx', code);
      expect(issues.some(i => i.metadata?.importName === 'useEffect')).toBe(true);
      expect(issues.some(i => i.metadata?.importName === 'unusedHelper')).toBe(true);
    });

    it('no debe reportar imports que sí se usan', () => {
      const code = `
        import { useState } from 'react';
        
        export function Component() {
          const [state] = useState(0);
          return null;
        }
      `;
      const issues = importStrategy!.detect('test.tsx', code);
      expect(issues.some(i => i.metadata?.importName === 'useState')).toBe(false);
    });
  });

  describe('Detección de variables no usadas', () => {
    const varStrategy = FixStrategies.LOW.find(
      s => s.name === 'unused-variables'
    );

    it('debe detectar variables no utilizadas', () => {
      const code = `
        function test() {
          const unused = 'value';
          const used = 'value';
          }
      `;
      const issues = varStrategy!.detect('test.ts', code);
      expect(issues.some(i => i.metadata?.variableName === 'unused')).toBe(true);
    });

    it('no debe reportar variables con prefijo _', () => {
      const code = `const _unused = 'value';`;
      const issues = varStrategy!.detect('test.ts', code);
      expect(issues.length).toBe(0);
    });
  });

  describe('Detección de secretos hardcodeados', () => {
    const secretStrategy = FixStrategies.HIGH.find(
      s => s.name === 'hardcoded-secret'
    );

    it('debe detectar passwords hardcodeados', () => {
      const code = `
        const password = 'supersecret123';
        const apiKey = 'ak_live_123456789';
      `;
      const issues = secretStrategy!.detect('test.ts', code);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues.every(i => i.type === 'hardcoded_secret')).toBe(true);
    });
  });

  describe('Detección de random inseguro', () => {
    const randomStrategy = FixStrategies.MEDIUM.find(
      s => s.name === 'insecure-random'
    );

    it('debe detectar Math.random en contexto criptográfico', () => {
      const code = `
        function generateToken() {
          const token = Math.random().toString(36);
          return token;
        }
      `;
      const issues = randomStrategy!.detect('test.ts', code);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].type).toBe('insecure_random');
    });
  });

  describe('isAutoFixable', () => {
    it('debe retornar true para tipos auto-fixeables', () => {
      expect(isAutoFixable('console_sensitive_data')).toBe(true);
      expect(isAutoFixable('as_any_cast')).toBe(true);
      expect(isAutoFixable('unused_import')).toBe(true);
    });

    it('debe retornar false para tipos que requieren revisión manual', () => {
      expect(isAutoFixable('sql_injection_risk')).toBe(false);
      expect(isAutoFixable('xss_vulnerability')).toBe(false);
      expect(isAutoFixable('missing_validation')).toBe(false);
    });
  });
});
