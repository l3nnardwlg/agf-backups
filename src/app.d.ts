// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
    namespace App {
        interface Locals {
            user: {
                id: number | null;
                username: string;
                role: 'admin' | 'user';
                breakGlass: boolean;
            } | null;
        }
    }
}

export {};
