import { getDB, isDatabaseConnected } from '../src/lib/db'
import { users } from '../src/lib/db/users-schema'
import * as argon2 from 'argon2'
import * as crypto from 'crypto'

async function seedAdmin() {
  console.log('Connecting to database...')
  
  // En Next.js, las variables se cargan solas, pero en tsx suelto podría faltar dotenv.
  // Vamos a intentar conectar.
  const db = getDB()

  if (!db) {
    console.error('Database connection failed.')
    process.exit(1)
  }

  const email = 'jhonson@silexar.com'
  const rawPassword = '22218686'
  
  console.log(`Hashing password for ${email}...`)
  const passwordHash = await argon2.hash(rawPassword)

  console.log('Inserting user...')
  try {
    await db.insert(users).values({
      email,
      passwordHash,
      name: 'Jhonson Admin',
      category: 'super_admin',
      status: 'active',
      isSuperAdmin: true,
      requirePasswordChange: false,
    }).onConflictDoUpdate({
      target: users.email,
      set: {
        passwordHash,
        category: 'super_admin',
        isSuperAdmin: true,
        status: 'active',
      }
    })
    
    console.log('User created successfully.')
    process.exit(0)
  } catch (error) {
    console.error('Error inserting user:', error)
    process.exit(1)
  }
}

seedAdmin()
