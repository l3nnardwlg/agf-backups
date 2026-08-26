<script lang="ts">
    import OnboardingCard from '$lib/components/onboarding/OnboardingCard.svelte';
    import type { PageProps } from './$types';
    let { form }: PageProps = $props();
</script>

<OnboardingCard title="Create AGF Backup admin">
    <p class="text-sm text-base-content/60">Create the first local administrator account.</p>

    {#if form?.error}
        <div class="alert alert-error mt-4 text-sm">{form.error}</div>
    {/if}

    <form method="POST" class="mt-6 flex flex-col gap-4">
        <label class="form-control gap-2">
            <span class="label-text">Username</span>
            <input class="input input-bordered" name="username" required minlength="3" value={form?.username ?? ''} />
        </label>

        <label class="form-control gap-2">
            <span class="label-text">Password</span>
            <input class="input input-bordered" type="password" name="password" required minlength="12" autocomplete="new-password" />
        </label>

        <label class="form-control gap-2">
            <span class="label-text">Confirm password</span>
            <input class="input input-bordered" type="password" name="passwordConfirm" required minlength="12" autocomplete="new-password" />
        </label>

        <button class="btn btn-primary" type="submit">Create admin</button>
    </form>
</OnboardingCard>
