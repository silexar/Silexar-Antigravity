'use client';
import React, { Component, ReactNode, ErrorInfo } from 'react';
interface Props { children: ReactNode; fallback?: ReactNode; }
interface State { hasError: boolean; error?: Error; }
export class AdvancedErrorBoundary extends Component<Props, State> {
    constructor(props: Props) { super(props); this.state = { hasError: false }; }
    static getDerivedStateFromError(error: Error): State { return { hasError: true, error }; }
    componentDidCatch(error: Error, errorInfo: ErrorInfo) { console.error('Error caught:', error, errorInfo); }
    render() {
        if (this.state.hasError) return this.props.fallback || <div className="p-4 bg-red-50 text-red-600 rounded-lg">Algo salió mal</div>;
        return this.props.children;
    }
}
export default AdvancedErrorBoundary;