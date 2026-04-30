import { BasePaginatedService } from './base/BaseService';
import { BaseRepository } from './base/BaseRepository';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface Usuario {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
}

class UsuarioRepository extends BaseRepository<Usuario, string> {
    constructor() {
        super('usuarios');
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        try {
            const result = await this.db
                .select()
                .from(users)
                .where(eq(users.email, email))
                .limit(1);
            return result[0] as Usuario || null;
        } catch (error) {
            throw error;
        }
    }
}

class UsuarioService extends BasePaginatedService<Usuario> {
    private repository: UsuarioRepository;

    constructor() {
        super('UsuarioService');
        this.repository = new UsuarioRepository();
    }

    async create(data: Partial<Usuario>): Promise<Usuario> {
        this.log('Creating usuario', data);
        return this.repository.save(data as Usuario);
    }

    async findById(id: string): Promise<Usuario | null> {
        return this.repository.findById(id);
    }

    async findByEmail(email: string): Promise<Usuario | null> {
        return this.repository.findByEmail(email);
    }

    async findAll(filters?: Record<string, unknown>): Promise<Usuario[]> {
        return this.repository.findAll(filters);
    }

    async update(id: string, data: Partial<Usuario>): Promise<Usuario> {
        this.log('Updating usuario', { id, data });
        return this.repository.update(id, data);
    }

    async delete(id: string): Promise<boolean> {
        this.log('Deleting usuario', { id });
        return this.repository.delete(id);
    }

    async findPaginated(
        page: number = 1,
        pageSize: number = 20,
        filters?: Record<string, unknown>
    ): Promise<{
        data: Usuario[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * pageSize;
        const data = await this.repository.findAll(filters);
        const total = data.length;
        const paginatedData = data.slice(offset, offset + pageSize);

        return {
            data: paginatedData,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize),
        };
    }
}

export const usuarioService = new UsuarioService();
export type { Usuario };
