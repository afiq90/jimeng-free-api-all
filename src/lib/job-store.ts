import { v1 as uuid } from 'uuid';
import logger from './logger.ts';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Job {
    id: string;
    status: JobStatus;
    created: number;
    updated: number;
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
// Limits concurrent browser usage to 2 (matching MAX_SESSIONS in browser-service.ts).
// Jobs wait in a queue instead of being rejected — the browser phase only lasts 10–30 seconds,
// so any waiting job is unblocked quickly once the current browser call finishes.

const BROWSER_CONCURRENCY = 2;
let activeBrowserSlots = 0;
const waitQueue: Array<() => void> = [];

export function acquireBrowserSlot(): Promise<void> {
    return new Promise(resolve => {
        if (activeBrowserSlots < BROWSER_CONCURRENCY) {
            activeBrowserSlots++;
            logger.info(`BrowserSemaphore: slot acquired (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
            resolve();
        } else {
            logger.info(`BrowserSemaphore: waiting for slot (queue length: ${waitQueue.length + 1})`);
            waitQueue.push(() => {
                activeBrowserSlots++;
                logger.info(`BrowserSemaphore: slot acquired from queue (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
                resolve();
            });
        }
    });
}

export function releaseBrowserSlot(): void {
    activeBrowserSlots = Math.max(0, activeBrowserSlots - 1);
    if (waitQueue.length > 0) {
        const next = waitQueue.shift();
        next();
    } else {
        logger.info(`BrowserSemaphore: slot released (${activeBrowserSlots}/${BROWSER_CONCURRENCY} active)`);
    }
}
