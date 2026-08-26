import { deleteSession, SESSION_COOKIE } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    const sessionId = cookies.get(SESSION_COOKIE);
    if (sessionId) await deleteSession(sessionId);
    cookies.delete(SESSION_COOKIE, { path: '/' });
    throw redirect(303, '/login');
};
