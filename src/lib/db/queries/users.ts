/**
 * User query helpers — real database queries via Drizzle ORM
 */

import { eq } from 'drizzle-orm'
import { isDatabaseConnected, getDB } from '@/lib/db'
import { users, type User, type NewUser } from '@/lib/db/users-schema'

export type { User, NewUser }

export async function findUserById(id: string): Promise<User | null> {
  if (!id || !isDatabaseConnected()) return null
  const db = getDB()
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1)
  return user ?? null
}

export async function findUserByEmail(email: string): Promise<User | null> {
  if (!email || !isDatabaseConnected()) return null
  const db = getDB()
  const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1)
  return user ?? null
}

export async function createUser(data: NewUser): Promise<User> {
  const db = getDB()
  const [user] = await db.insert(users).values(data).returning()
  return user
}

export async function updateUser(id: string, data: Partial<NewUser>): Promise<User | null> {
  if (!id || !isDatabaseConnected()) return null
  const db = getDB()
  const [user] = await db.update(users).set(data).where(eq(users.id, id)).returning()
  return user ?? null
}

export default { findUserById, findUserByEmail, createUser, updateUser }
