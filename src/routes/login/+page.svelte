<script lang="ts">
    import type { PageProps } from './$types';
    let { form }: PageProps = $props();
</script>

<svelte:head>
    <title>AGF Backup · Sign in</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-300 p-6">
    <div class="card w-full max-w-sm bg-base-100 shadow-xl">
        <div class="card-body gap-6">
            <div>
                <div class="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/50">AGF Studios</div>
                <h1 class="mt-2 text-3xl font-bold">AGF Backup</h1>
                <p class="mt-2 text-sm text-base-content/60">Internal backup control plane</p>
            </div>

            {#if form?.error}
                <div class="alert alert-error text-sm">{form.error}</div>
            {/if}

            <form class="flex flex-col gap-4" method="POST">
                <label class="form-control gap-2">
                    <span class="label-text">Username</span>
                    <input class="input input-bordered w-full" name="username" required autocomplete="username" value={form?.username ?? ''} />
                </label>

                <label class="form-control gap-2">
                    <span class="label-text">Password</span>
                    <input class="input input-bordered w-full" type="password" name="password" required autocomplete="current-password" />
                </label>

                <button class="btn btn-primary mt-2" type="submit">Sign in</button>
            </form>

            <p class="text-xs text-base-content/40">Break-glass access uses dedicated server-side credentials.</p>
        </div>
    </div>
</div>
