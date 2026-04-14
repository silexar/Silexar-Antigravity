/**
 * CSP Provider - Nonce-based Content Security Policy
 * 
 * Provides CSP nonce to child components for inline styles
 * The nonce is extracted from the X-CSP-Nonce header set by middleware
 * 
 * @security CSP Level 3 compliance
 * @module CSPProvider
 */

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface CSPContextValue {
  /** CSP nonce for inline styles */
  nonce: string;
  /** Whether CSP is in strict mode (nonce-based) */
  isStrictMode: boolean;
}

const CSPContext = createContext<CSPContextValue>({
  nonce: '',
  isStrictMode: false,
});

/**
 * Hook to access CSP nonce
 * Use this for inline styles that need nonce attribute
 */
export function useCSP(): CSPContextValue {
  return useContext(CSPContext);
}

interface CSPProviderProps {
  children: React.ReactNode;
  /** Optional initial nonce from server */
  initialNonce?: string;
}

/**
 * CSP Provider component
 * 
 * Wraps the application to provide CSP nonce to all child components.
 * The nonce is read from the X-CSP-Nonce header injected by middleware.
 */
export function CSPProvider({ children, initialNonce = '' }: CSPProviderProps): React.ReactElement {
  const [nonce, setNonce] = useState<string>(initialNonce);
  const [isStrictMode, setIsStrictMode] = useState<boolean>(false);

  useEffect(() => {
    // Extract nonce from header or meta tag (set by server)
    const fetchNonce = () => {
      // Try to get from meta tag first (injected by server)
      const metaNonce = document.querySelector('meta[name="csp-nonce"]')?.getAttribute('content');
      if (metaNonce) {
        setNonce(metaNonce);
        setIsStrictMode(true);
        return;
      }

      // Fallback: check if we're in strict mode by looking for CSP header
      const cspHeader = document.querySelector('meta[http-equiv="Content-Security-Policy"]')?.getAttribute('content');
      if (cspHeader?.includes('nonce-')) {
        setIsStrictMode(true);
      }
    };

    fetchNonce();
  }, []);

  return (
    <CSPContext.Provider value={{ nonce, isStrictMode }}>
      {children}
    </CSPContext.Provider>
  );
}

/**
 * Styled component wrapper that applies nonce to inline styles
 * Use this for dynamic styles that need CSP nonce
 */
export interface NoncedStyleProps {
  /** CSS styles string */
  css?: string;
  /** Children to render */
  children: React.ReactNode;
  /** Optional className */
  className?: string;
}

/**
 * Component that renders a style tag with nonce
 * Use for dynamic inline styles that need CSP compliance
 */
export function NoncedStyle({ css, children, className }: NoncedStyleProps): React.ReactElement {
  const { nonce } = useCSP();

  return (
    <>
      {css && (
        <style nonce={nonce} className={className}>
          {css}
        </style>
      )}
      {children}
    </>
  );
}

/**
 * HOC to wrap components with nonce prop
 * Useful for third-party components that accept nonce
 */
export function withCSPNonce<P extends object>(
  Component: React.ComponentType<P & { nonce?: string }>
): React.FC<P> {
  return function WrappedComponent(props: P): React.ReactElement {
    const { nonce } = useCSP();
    return <Component {...props} nonce={nonce} />;
  };
}

export default CSPProvider;
