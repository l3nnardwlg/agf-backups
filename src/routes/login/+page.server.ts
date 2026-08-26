import { authenticateBreakGlass, authenticateLocal, createSession, SESSION_COOKIE } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
    if (locals.user) throw redirect(303, '/dashboard');
    return {};
};

export const actions: Actions = {
    default: async ({ request, cookies }) => {
        const data = await request.formData();
        const username = String(data.get('username') || '').trim();
        const password = String(data.get('password') || '');

        if (!username || !password) {
            return fail(400, { error: 'Username and password are required.', username });
        }

        let user = await authenticateLocal(username, password);
        let breakGlass = false;

        if (!user && authenticateBreakGlass(username, password)) {
            breakGlass = true;
            user = { id: null, username, role: 'admin', breakGlass: true };
        }

        if (!user) return fail(401, { error: 'Invalid credentials.', username });

        const session = await createSession(user.id, breakGlass);
        cookies.set(SESSION_COOKIE, session.id, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            expires: session.expiresAt,
        });

        throw redirect(303, '/dashboard');
    },
};
