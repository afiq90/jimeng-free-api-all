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
const MAX_CONCURRENT_JOBS = 2; // Match MAX_SESSIONS in browser-service

export function getProcessingJobsCount(): number {
    return Array.from(jobs.values()).filter(j => j.status === 'processing').length;
}

export function isQueueFull(): boolean {
    return getProcessingJobsCount() >= MAX_CONCURRENT_JOBS;
}

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
