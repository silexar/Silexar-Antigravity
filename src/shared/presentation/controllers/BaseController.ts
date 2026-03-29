// Minimal Response interface compatible with Express and Next.js adapters
interface Response {
  status(code: number): this;
  json(body: unknown): void;
}

export abstract class BaseController {
    protected success(res: Response, data: unknown, statusCode: number = 200): void {
        res.status(statusCode).json({
            success: true,
            data,
            timestamp: new Date().toISOString()
        });
    }

    protected badRequest(res: Response, message: string): void {
        res.status(400).json({
            success: false,
            error: {
                code: 'BAD_REQUEST',
                message
            },
            timestamp: new Date().toISOString()
        });
    }

    protected internalError(res: Response, message: string): void {
        res.status(500).json({
            success: false,
            error: {
                code: 'INTERNAL_SERVER_ERROR',
                message
            },
            timestamp: new Date().toISOString()
        });
    }

    protected notFound(res: Response, message: string): void {
        res.status(404).json({
            success: false,
            error: {
                code: 'NOT_FOUND',
                message
            },
            timestamp: new Date().toISOString()
        });
    }

    protected unauthorized(res: Response, message: string): void {
        res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message
            },
            timestamp: new Date().toISOString()
        });
    }

    protected forbidden(res: Response, message: string): void {
        res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message
            },
            timestamp: new Date().toISOString()
        });
    }
}
