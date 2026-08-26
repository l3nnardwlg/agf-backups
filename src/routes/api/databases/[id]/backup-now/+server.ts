import { runBackupJob } from '$lib/server/backups/run-backup-job';
import { db } from '$lib/server/db';
import { jobDatabases } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
    const databaseId = Number(params.id);
    if (!Number.isInteger(databaseId) || databaseId <= 0) {
        throw error(400, 'Invalid database ID');
    }

    const assignment = await db.query.jobDatabases.findFirst({
        where: eq(jobDatabases.databaseId, databaseId),
        with: {
            job: {
                columns: {
                    id: true,
                    name: true,
                    status: true,
                },
            },
        },
    });

    if (!assignment) {
        throw error(409, 'This database is not assigned to a backup job yet. Add it to a job first so AGF Backup knows which storage to use.');
    }

    if (assignment.job.status !== 'active') {
        throw error(409, `Backup job "${assignment.job.name}" is not active.`);
    }

    const result = await runBackupJob(assignment.job.id, [ databaseId ]);
    if (result.isErr()) {
        throw error(500, result.error);
    }

    return json({
        success: true,
        databaseId,
        jobId: assignment.job.id,
        jobName: assignment.job.name,
    });
};
