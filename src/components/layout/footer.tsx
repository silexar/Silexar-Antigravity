/**
 * SILEXAR PULSE - TIER0+ FOOTER
 */

'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC<{ className?: string }> = ({ className = '' }) => (
    <footer className={`bg-gray-900 text-white py-12 ${className}`}>
        <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
                <div>
                    <h3 className="font-bold text-lg mb-4">Silexar Pulse</h3>
                    <p className="text-gray-400 text-sm">Enterprise-grade campaign management platform.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-3">Producto</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/features">Características</Link></li>
                        <li><Link href="/pricing">Precios</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-3">Empresa</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/about">Acerca de</Link></li>
                        <li><Link href="/contact">Contacto</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-3">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                        <li><Link href="/privacy">Privacidad</Link></li>
                        <li><Link href="/terms">Términos</Link></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-500">
                © {new Date().getFullYear()} Silexar Pulse. Todos los derechos reservados.
            </div>
        </div>
    </footer>
);

export default Footer;