/**
 * SILEXAR PULSE - TIER0+ Dashboard Header Tests
 */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { DashboardHeader } from '../dashboard-header';

describe('DashboardHeader', () => {
    it('should render title', () => {
        render(<DashboardHeader title="Test Dashboard" />);
        expect(screen.getByText('Test Dashboard')).toBeInTheDocument();
    });

    it('should render user name', () => {
        render(<DashboardHeader userName="John Doe" />);
        expect(screen.getByText('John Doe')).toBeInTheDocument();
    });

    it('should render notification count', () => {
        render(<DashboardHeader notificationCount={5} />);
        expect(screen.getByText('5')).toBeInTheDocument();
    });

    it('should not show notification badge when count is 0', () => {
        render(<DashboardHeader notificationCount={0} />);
        expect(screen.queryByText('0')).not.toBeInTheDocument();
    });
});