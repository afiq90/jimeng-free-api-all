import { v1 as uuid } from 'uuid';
import logger from './logger.ts';

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

const JOB_TTL_MS = 24 * 60 * 60 * 1000;
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

setInterval(() => {
    const now = Date.now();
    let removed = 0;
    for (const [id, job] of jobs.entries()) {
        if (now - job.updated > JOB_TTL_MS) {
            jobs.delete(id);
            removed++;
        }
    }
    if (removed > 0)
        logger.info(`JobStore: cleaned up ${removed} expired jobs`);
}, CLEANUP_INTERVAL_MS);

export function createJob(): Job {
    const id = uuid();
    const now = Math.floor(Date.now() / 1000);
    const job: Job = { id, status: 'pending', created: now, updated: now };
    jobs.set(id, job);
    return job;
}

export function updateJob(id: string, update: Partial<Pick<Job, 'status' | 'result' | 'error'>>): void {
    const job = jobs.get(id);
    if (!job) return;
    Object.assign(job, update, { updated: Math.floor(Date.now() / 1000) });
}

export function getJob(id: string): Job | undefined {
    return jobs.get(id);
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
