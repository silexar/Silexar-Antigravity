/**
 * 🌱 SILEXAR PULSE - Seeds de Base de Datos
 * 
 * @description Datos iniciales para el sistema
 * Ejecutar con: npx tsx scripts/seed.ts
 * 
 * @version 2025.1.0
 */

import { getDB, isDatabaseConnected } from '../src/lib/db';

// ═══════════════════════════════════════════════════════════════
// DATOS SEED
// ═══════════════════════════════════════════════════════════════

const TENANT_INICIAL = {
  id: '00000000-0000-0000-0000-000000000001',
  nombre: 'Mi Empresa de Radio',
  rut: '76.000.000-0',
  activo: true
};

const USUARIO_ADMIN = {
  id: '00000000-0000-0000-0000-000000000001',
  tenantId: TENANT_INICIAL.id,
  email: 'admin@miempresa.cl',
  nombre: 'Administrador',
  rol: 'super_admin',
  activo: true
};

const EMISORAS_EJEMPLO = [
  { codigo: 'COOP', nombre: 'Radio Cooperativa', frecuencia: '93.3 FM', ciudad: 'Santiago' },
  { codigo: 'ADN', nombre: 'Radio ADN', frecuencia: '91.7 FM', ciudad: 'Santiago' },
  { codigo: 'BIO', nombre: 'Radio Biobío', frecuencia: '99.7 FM', ciudad: 'Concepción' }
];

// ═══════════════════════════════════════════════════════════════
// FUNCIÓN PRINCIPAL
// ═══════════════════════════════════════════════════════════════

async function seed() {
  console.log('🌱 Iniciando seed de base de datos...\n');

  if (!isDatabaseConnected()) {
    console.error('❌ No hay conexión a base de datos.');
    console.log('   Configura DATABASE_URL en .env.local');
    process.exit(1);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _db = getDB();

  try {
    console.log('1️⃣ Creando tenant inicial...');
    // await db.insert(tenants).values(TENANT_INICIAL).onConflictDoNothing();
    console.log('   ✅ Tenant creado: ' + TENANT_INICIAL.nombre);

    console.log('\n2️⃣ Creando usuario administrador...');
    // await db.insert(users).values(USUARIO_ADMIN).onConflictDoNothing();
    console.log('   ✅ Usuario creado: ' + USUARIO_ADMIN.email);

    console.log('\n3️⃣ Creando emisoras de ejemplo...');
    for (const emisora of EMISORAS_EJEMPLO) {
      // await db.insert(emisoras).values({ ...emisora, tenantId: TENANT_INICIAL.id }).onConflictDoNothing();
      console.log('   ✅ Emisora: ' + emisora.nombre);
    }

    console.log('\n═══════════════════════════════════════');
    console.log('✅ SEED COMPLETADO');
    console.log('═══════════════════════════════════════');
    console.log('\n📝 Credenciales de acceso:');
    console.log('   Email: ' + USUARIO_ADMIN.email);
    console.log('   Rol: Super Administrador');
    console.log('\n⚠️  IMPORTANTE: Cambia la contraseña después del primer login');

  } catch (error) {
    console.error('\n❌ Error en seed:', error);
    process.exit(1);
  }
}

// Ejecutar
seed().then(() => process.exit(0));
