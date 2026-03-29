/**
 * SILEXAR PULSE - TIER0+ ENTERPRISE MAIN DASHBOARD
 */

'use client';

import React from 'react';
import { Fortune10CommandDashboard } from './dashboard/Fortune10CommandDashboard';
import { SystemOverview } from './dashboard/system-overview';

export const EnterpriseMainDashboard: React.FC<{ className?: string }> = ({ className = '' }) => (
    <div className={`space-y-6 ${className}`}>
        <h1 className="text-2xl font-bold">Dashboard Enterprise</h1>
        <Fortune10CommandDashboard />
        <SystemOverview />
    </div>
);

export default EnterpriseMainDashboard;