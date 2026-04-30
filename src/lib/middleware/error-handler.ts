import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';
import { AppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/observability';

interface ErrorResponse {
    success: false;
    error: {
        code: string;
        message: string;
        details?: unknown;
    };
    timestamp: string;
}

export function handleError(error: unknown, request?: NextRequest): NextResponse<ErrorResponse> {
    if (error instanceof AppError) {
        if (error.isOperational) {
            logger.warn(`Operational error: ${error.code} - ${error.message}`, { context: error.context });
        } else {
            logger.error(`Programming error: ${error.code} - ${error.message}`, error instanceof Error ? error : undefined);
        }

        return NextResponse.json({
            success: false,
            error: {
                code: error.code,
                message: error.message,
                details: error.context,
            },
            timestamp: new Date().toISOString(),
        }, { status: error.statusCode });
    }

    // Handle unknown errors
    const message = process.env.NODE_ENV === 'production' ? 'Internal server error' : (error instanceof Error ? error.message : 'Unknown error');
    logger.error('Unhandled error', error instanceof Error ? error : undefined);

    if (request) {
        Sentry.captureException(error);
    }

    return NextResponse.json({
        success: false,
        error: {
            code: 'INTERNAL_ERROR',
            message,
        },
        timestamp: new Date().toISOString(),
    }, { status: 500 });
}

export function isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
}