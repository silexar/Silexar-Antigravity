import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, asc } from "drizzle-orm";
import { logger } from '@/lib/observability';
import { withApiRoute } from '@/lib/api/with-api-route';

export const dynamic = 'force-dynamic';

interface GridItem {
  id: string;
  titulo: string;
  cliente: string;
  duracion: number;
  estado: string;
  tipo: string;
}

interface GridBlock {
  id: string;
  hora: string;
  nombre: string;
  estado: string;
  ocupacion: number;
  items: GridItem[];
}

export const GET = withApiRoute(
  { resource: 'emisiones', action: 'read', skipCsrf: true },
  async ({ ctx, req }) => {
    if (!db) return NextResponse.json({ success: false, error: 'Database not available' }, { status: 503 })
    try {
      // Return empty grid for now - the query.tandas API may not be available
      const gridData: GridBlock[] = [];

      return NextResponse.json({
        success: true,
        data: gridData,
        meta: {
          totalBlocks: gridData.length,
          timestamp: new Date().toISOString()
        }
      });

    } catch (error: unknown) {
      logger.error('Error fetching grid data:', error instanceof Error ? error : undefined, { module: 'grilla', userId: ctx.userId });
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : "Internal Server Error"
        },
        { status: 500 }
      );
    }
  }
);
