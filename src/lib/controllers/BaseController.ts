import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/lib/di/Container';
import { AppError } from '@/lib/errors/AppError';
import { logger } from '@/lib/observability';

export interface ControllerContext {
    userId: string;
    role: string;
    tenantId: string;
    tenantSlug: string;
    sessionId: string;
    requestId: string;
    isImpersonating: boolean;
}

export interface ControllerRequest {
    req: NextRequest;
    ctx: ControllerContext;
    params?: Record<string, string>;
    query?: URLSearchParams;
    body?: unknown;
}

export abstract class BaseController {
    protected serviceName: string;

    constructor(serviceName: string) {
        this.serviceName = serviceName;
    }

    protected getLogger(): typeof logger {
        return logger;
    }

    protected log(message: string, meta?: Record<string, unknown>): void {
        logger.info(`[${this.serviceName}] ${message}`, meta);
    }

    protected async handleRequest<T>(
        operation: string,
        fn: () => Promise<T>,
        meta?: Record<string, unknown>
    ): Promise<NextResponse> {
        try {
            this.log(`Starting ${operation}`, meta);
            const result = await fn();
            this.log(`Completed ${operation}`, meta);
            return NextResponse.json({ success: true, data: result }, { status: 200 });
        } catch (error) {
            if (error instanceof AppError) {
                this.log(`Error in ${operation}: ${error.message}`, { code: error.code });
                return NextResponse.json({
                    success: false,
                    error: {
                        code: error.code,
                        message: error.message,
                        details: error.context,
                    },
                }, { status: error.statusCode });
            }
            this.log(`Error in ${operation}: ${error instanceof Error ? error.message : 'Unknown'}`, { error });
            return NextResponse.json({
                success: false,
                error: {
                    code: 'INTERNAL_ERROR',
                    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : error instanceof Error ? error.message : 'Unknown',
                },
            }, { status: 500 });
        }
    }

    protected resolve<T>(token: string): T {
        return container.resolve<T>(token);
    }
}
