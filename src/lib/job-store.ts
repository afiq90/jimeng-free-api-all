import { v1 as uuid } from 'uuid';
import logger from './logger.ts';
import { saveJobToDb, updateJobInDb, getJobFromDb, DbJob } from './db.ts';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
    id: string;
    status: JobStatus;
    created: number;
    updated: number;
    queuePosition?: number;
    result?: {
        url?: string;
        b64_json?: string;
        revised_prompt?: string;
    };
    error?: string;
}

const jobs = new Map<string, Job>();

const JOB_TTL_SECONDS = 24 * 60 * 60;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    let removed = 0;
    for (const [id, job] of jobs.entries()) {
        if (now - job.updated > JOB_TTL_SECONDS) {
            jobs.delete(id);
            removed++;
        }
    }
    if (removed > 0)
        logger.info(`JobStore: cleaned up ${removed} expired jobs`);
}, CLEANUP_INTERVAL_MS);

function dbJobToJob(dbJob: DbJob): Job {
    const job: Job = {
        id: dbJob.id,
        status: dbJob.status as JobStatus,
        created: dbJob.created_at,
        updated: dbJob.updated_at,
    };
    if (dbJob.error_message) {
        job.error = dbJob.error_message;
    }
    if (dbJob.result_url || dbJob.result_b64_json) {
        job.result = {
            url: dbJob.result_url || undefined,
            b64_json: dbJob.result_b64_json || undefined,
            revised_prompt: dbJob.result_revised_prompt || undefined,
        };
    }
    return job;
}

export function createJob(): Job {
    const id = uuid();
    const now = Math.floor(Date.now() / 1000);
    const job: Job = { id, status: 'pending', created: now, updated: now };
    jobs.set(id, job);
    saveJobToDb(id, 'pending', now).catch(err =>
        logger.error(`JobStore: failed to persist job ${id} to DB: ${err.message}`)
    );
    return job;
}

export function updateJob(id: string, update: Partial<Pick<Job, 'status' | 'result' | 'error'>>): void {
    const job = jobs.get(id);
    if (job) {
        Object.assign(job, update, { updated: Math.floor(Date.now() / 1000) });
    }
    const dbUpdate: Parameters<typeof updateJobInDb>[1] = {};
    if (update.status) dbUpdate.status = update.status;
    if (update.error) dbUpdate.error_message = update.error;
    if (update.result?.url) dbUpdate.result_url = update.result.url;
    if (update.result?.b64_json) dbUpdate.result_b64_json = update.result.b64_json;
    if (update.result?.revised_prompt) dbUpdate.result_revised_prompt = update.result.revised_prompt;
    if (Object.keys(dbUpdate).length > 0) {
        updateJobInDb(id, dbUpdate).catch(err =>
            logger.error(`JobStore: failed to sync update for job ${id} to DB: ${err.message}`)
        );
    }
}

export async function getJob(id: string): Promise<Job | undefined> {
    const inMemory = jobs.get(id);
    if (inMemory) return inMemory;

    const dbJob = await getJobFromDb(id);
    if (!dbJob) return undefined;

    const job = dbJobToJob(dbJob);
    jobs.set(id, job);
    return job;
}

// --- Browser Semaphore ---
const BROWSER_CONCURRENCY = 2;
let activeBrowserSlots = 0;
const waitQueue: Array<{ id: string; resolve: () => void }> = [];

function updateQueuePositions() {
    waitQueue.forEach((item, index) => {
        const job = jobs.get(item.id);
        if (job) {
            job.queuePosition = index + 1;
            job.updated = Math.floor(Date.now() / 1000);
        }
    });
}

export function acquireBrowserSlot(jobId: string): Promise<void> {
    return new Promise(resolve => {
        if (activeBrowserSlots < BROWSER_CONCURRENCY && waitQueue.length === 0) {
            activeBrowserSlots++;
            logger.info(`BrowserSemaphore: slot acquired (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
            resolve();
        } else {
            logger.info(`BrowserSemaphore: job ${jobId} waiting for slot (queue length: ${waitQueue.length + 1})`);
            waitQueue.push({ id: jobId, resolve });
            updateQueuePositions();
        }
    });
}

export function releaseBrowserSlot(): void {
    activeBrowserSlots = Math.max(0, activeBrowserSlots - 1);
    if (waitQueue.length > 0) {
        const { id, resolve } = waitQueue.shift()!;
        const job = jobs.get(id);
        if (job) delete job.queuePosition;
        updateQueuePositions();
        resolve();
    } else {
        logger.info(`BrowserSemaphore: slot released (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
    }
}
