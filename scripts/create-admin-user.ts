/**
 * Create Admin User Script
 * Silexar Pulse - CEO Command Center
 * Creates the admin@silexar.com user for testing
 */

import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { tenants } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

async function createAdminUser() {
    console.log('🚀 Creating admin user for admin@silexar.com...');

    try {
        // Check if tenant exists
        let tenant = await db.select().from(tenants).where(eq(tenants.slug, 'silexar')).limit(1);

        let tenantId: string;

        if (tenant.length === 0) {
            // Create default tenant
            console.log('📋 Creating default tenant...');
            const newTenant = await db.insert(tenants).values({
                name: 'Silexar',
                slug: 'silexar',
                email: 'admin@silexar.com',
                plan: 'enterprise',
                status: 'active',
            }).returning();
            tenantId = newTenant[0].id;
            console.log(`✅ Tenant created: ${tenantId}`);
        } else {
            tenantId = tenant[0].id;
            console.log('📋 Using existing tenant:', tenantId);
        }

        // Check if user already exists
        const existingUser = await db.select().from(users).where(eq(users.email, 'admin@silexar.com')).limit(1);

        if (existingUser.length > 0) {
            console.log('⚠️  User admin@silexar.com already exists');
            console.log('   User ID:', existingUser[0].id);
            return;
        }

        // Create admin user
        console.log('👤 Creating admin user...');

        const adminUser = await db.insert(users).values({
            tenantId,
            email: 'admin@silexar.com',
            name: 'CEO Admin',
            category: 'super_admin',
            status: 'active',
            isSuperAdmin: true,
            // Default password: Admin123! - in production, this would be hashed
            passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYo5E9.O.', // Temporary hash
        }).returning();

        console.log('✅ Admin user created successfully!');
        console.log('');
        console.log('📧 Email: admin@silexar.com');
        console.log('🔑 Temporary Password: Admin123!');
        console.log('👤 User ID:', adminUser[0].id);
        console.log('');
        console.log('⚠️  IMPORTANT: Change the password after first login!');

    } catch (error) {
        console.error('❌ Error creating admin user:', error);
        process.exit(1);
    }

    process.exit(0);
}

createAdminUser();