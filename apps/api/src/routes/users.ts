import { Hono } from 'hono';
import { drizzle } from 'drizzle-orm/d1';
import { usersTable } from '../db/schema';
import { eq, ne } from 'drizzle-orm';
import type { Context, Next } from 'hono';
import type { Env, Variables } from '../types';
import { hashPassword } from '../utils/password';

type HonoContext = Context<{ Bindings: Env; Variables: Variables }>;

const usersApp = new Hono<{ Bindings: Env; Variables: Variables }>();

const isAdmin = async (c: HonoContext, next: Next) => {
  const adminId = c.req.header('X-Admin-Id');
  if (!adminId) {
    return c.json({ error: 'Unauthorized' }, 401);
  }
  c.set('adminId', parseInt(adminId));
  await next();
};

// Helper: Exclude password from user object
function sanitizeUser(user: any) {
  const { password, ...sanitized } = user;
  return sanitized;
}

// GET /users - List semua users kecuali admin sendiri
usersApp.get('/', isAdmin, async (c) => {
  const db = drizzle(c.env.DB);
  const adminId = c.get('adminId');

  const users = await db
    .select()
    .from(usersTable)
    .where(ne(usersTable.id, adminId));

  return c.json({ users: users.map(sanitizeUser) });
});

// GET /users/:id - Get user by id (bukan diri sendiri)
usersApp.get('/:id', isAdmin, async (c) => {
  const db = drizzle(c.env.DB);
  const adminId = c.get('adminId');
  const idParam = c.req.param('id');
  
  if (!idParam || isNaN(parseInt(idParam))) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }
  
  const userId = parseInt(idParam);

  if (userId === adminId) {
    return c.json({ error: 'Cannot access your own account through this endpoint' }, 403);
  }

  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .then(rows => rows[0]);

  if (!user) {
    return c.json({ error: 'User not found' }, 404);
  }

  return c.json({ user: sanitizeUser(user) });
});

// POST /users - Create user baru
usersApp.post('/', isAdmin, async (c) => {
  const db = drizzle(c.env.DB);
  const body = await c.req.json();

  const { username, email, password, role } = body;

  // Validasi required fields
  if (!username || !password || !role) {
    return c.json({ error: 'username, password, and role are required' }, 400);
  }

  // Validasi role
  if (!['siswa', 'guru', 'admin'].includes(role)) {
    return c.json({ error: 'Invalid role. Must be: siswa, guru, or admin' }, 400);
  }

  // Validasi password strength
  if (password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const hashedPassword = await hashPassword(password);

  try {
    const result = await db
      .insert(usersTable)
      .values({
        username,
        email: email || null,
        password: hashedPassword,
        role,
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return c.json({ user: sanitizeUser(result[0]) }, 201);
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: 'Username or email already exists' }, 409);
    }
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// PUT /users/:id - Update user (bukan diri sendiri)
usersApp.put('/:id', isAdmin, async (c) => {
  const db = drizzle(c.env.DB);
  const adminId = c.get('adminId');
  const idParam = c.req.param('id');
  
  if (!idParam || isNaN(parseInt(idParam))) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }
  
  const userId = parseInt(idParam);
  const body = await c.req.json();

  if (userId === adminId) {
    return c.json({ error: 'Cannot modify your own account through this endpoint' }, 403);
  }

  const existingUser = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, userId))
    .then(rows => rows[0]);

  if (!existingUser) {
    return c.json({ error: 'User not found' }, 404);
  }

  const { username, email, password, role } = body;

  // Validasi role jika diupdate
  if (role && !['siswa', 'guru', 'admin'].includes(role)) {
    return c.json({ error: 'Invalid role. Must be: siswa, guru, or admin' }, 400);
  }

  // Validasi password strength jika diupdate
  if (password && password.length < 8) {
    return c.json({ error: 'Password must be at least 8 characters' }, 400);
  }

  const now = Math.floor(Date.now() / 1000);
  const hashedPassword = password ? await hashPassword(password) : undefined;

  try {
    const result = await db
      .update(usersTable)
      .set({
        ...(username && { username }),
        ...(email !== undefined && { email: email || null }),
        ...(hashedPassword && { password: hashedPassword }),
        ...(role && { role }),
        updatedAt: now,
      })
      .where(eq(usersTable.id, userId))
      .returning();

    return c.json({ user: sanitizeUser(result[0]) });
  } catch (error: any) {
    if (error.message?.includes('UNIQUE')) {
      return c.json({ error: 'Username or email already exists' }, 409);
    }
    return c.json({ error: 'Failed to update user' }, 500);
  }
});

// DELETE /users/:id - Delete user (bukan diri sendiri)
usersApp.delete('/:id', isAdmin, async (c) => {
  const db = drizzle(c.env.DB);
  const adminId = c.get('adminId');
  const idParam = c.req.param('id');
  
  if (!idParam || isNaN(parseInt(idParam))) {
    return c.json({ error: 'Invalid user ID' }, 400);
  }
  
  const userId = parseInt(idParam);

  if (userId === adminId) {
    return c.json({ error: 'Cannot delete your own account' }, 403);
  }

  try {
    const result = await db.delete(usersTable).where(eq(usersTable.id, userId)).returning();
    
    if (result.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ message: 'User deleted successfully' });
  } catch (error) {
    return c.json({ error: 'Failed to delete user' }, 500);
  }
});

export { usersApp };
