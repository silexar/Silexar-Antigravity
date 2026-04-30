import { NextRequest, NextResponse } from 'next/server';
import { handleError } from '@/lib/middleware/error-handler';

type AsyncHandler = (
    request: NextRequest,
    context?: Record<string, unknown>
) => Promise<NextResponse>;

export function asyncHandler(fn: AsyncHandler) {
    return async (request: NextRequest, context?: Record<string, unknown>): Promise<NextResponse> => {
        try {
            return await fn(request, context);
        } catch (error) {
            return handleError(error, request);
        }
    };
}

export function wrapAsync<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T
): (...args: Parameters<T>) => Promise<NextResponse> {
    return async (...args: Parameters<T>): Promise<NextResponse> => {
        try {
            const result = await fn(...args);
            if (result instanceof NextResponse) {
                return result;
            }
            return NextResponse.json({ success: true, data: result }, { status: 200 });
        } catch (error) {
            return handleError(error, args[0] as NextRequest);
        }
    };
}
