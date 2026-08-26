import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hashPassword } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
    default: async ({ request }) => {
        const data = await request.formData();
        const username = String(data.get('username') || '').trim();
        const password = String(data.get('password') || '');
        const passwordConfirm = String(data.get('passwordConfirm') || '');

        if (username.length < 3) return fail(400, { error: 'Username must be at least 3 characters.', username });
        if (password.length < 12) return fail(400, { error: 'Password must be at least 12 characters.', username });
        if (password !== passwordConfirm) return fail(400, { error: 'Passwords do not match.', username });

        const existing = await db.query.users.findFirst();
        if (existing) throw redirect(303, '/setup/docker');

        await db.insert(users).values({
            username,
            passwordHash: await hashPassword(password),
            role: 'admin',
        });

        throw redirect(303, '/setup/docker');
    },
};
