import { db } from '$lib/server/db';
import { sessions, users } from '$lib/server/db/schema';
import { and, eq, gt } from 'drizzle-orm';

const SESSION_TTL_DAYS = 7;
const SESSION_COOKIE = 'agf_backup_session';

export type AuthUser = {
    id: number | null;
    username: string;
    role: 'admin' | 'user';
    breakGlass: boolean;
};

export async function hashPassword(password: string): Promise<string> {
    return Bun.password.hash(password, {
        algorithm: 'argon2id',
        memoryCost: 65536,
        timeCost: 3,
    });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return Bun.password.verify(password, hash);
}

export async function createSession(userId: number | null, breakGlass = false) {
    const id = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

    await db.insert(sessions).values({
        id,
        userId,
        breakGlass,
        expiresAt: expiresAt.toISOString(),
    });

    return { id, expiresAt };
}

export async function deleteSession(id: string) {
    await db.delete(sessions).where(eq(sessions.id, id));
}

export async function getSessionUser(sessionId?: string): Promise<AuthUser | null> {
    if (!sessionId) return null;

    const row = await db.query.sessions.findFirst({
        where: and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date().toISOString())),
        with: { user: true },
    });

    if (!row) return null;

    if (row.breakGlass) {
        return {
            id: null,
            username: process.env.AGFBACKUP_BREAK_GLASS_USERNAME || 'break-glass',
            role: 'admin',
            breakGlass: true,
        };
    }

    if (!row.user || !row.user.active) return null;

    return {
        id: row.user.id,
        username: row.user.username,
        role: row.user.role,
        breakGlass: false,
    };
}

export async function authenticateLocal(username: string, password: string): Promise<AuthUser | null> {
    const user = await db.query.users.findFirst({ where: eq(users.username, username) });
    if (!user || !user.active) return null;
    if (!(await verifyPassword(password, user.passwordHash))) return null;

    return {
        id: user.id,
        username: user.username,
        role: user.role,
        breakGlass: false,
    };
}

export function authenticateBreakGlass(username: string, password: string): boolean {
    const expectedUsername = process.env.AGFBACKUP_BREAK_GLASS_USERNAME;
    const expectedPassword = process.env.AGFBACKUP_BREAK_GLASS_PASSWORD;

    if (!expectedUsername || !expectedPassword) return false;
    return username === expectedUsername && password === expectedPassword;
}

export { SESSION_COOKIE };
