import { withApiRoute, RouteContext } from '@/lib/api/with-api-route';

export const GET = withApiRoute(
    { action: 'read' },
    async (ctx: RouteContext) => {
        const encoder = new TextEncoder();

        const stream = new ReadableStream({
            start(controller) {
                controller.enqueue(encoder.encode('data: {"type":"connected","timestamp":"' + new Date().toISOString() + '"}\n\n'));

                const intervalId = setInterval(() => {
                    try {
                        const update = {
                            type: 'heartbeat',
                            timestamp: new Date().toISOString(),
                            stats: {
                                programasActivos: 38,
                                cuposDisponibles: 156,
                                cuposOcupados: 89,
                            }
                        };
                        controller.enqueue(encoder.encode(`data: ${JSON.stringify(update)}\n\n`));
                    } catch (error) {
                        clearInterval(intervalId);
                    }
                }, 5000);

                ctx.req.signal.addEventListener('abort', () => {
                    clearInterval(intervalId);
                    controller.close();
                });
            },
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache, no-transform',
                'Connection': 'keep-alive',
            },
        });
    }
);