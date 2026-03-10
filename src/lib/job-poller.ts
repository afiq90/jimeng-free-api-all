import logger from './logger.ts';
import { getProcessingJobsWithHistoryId, getStuckJobsWithoutHistoryId, updateJobInDb } from './db.ts';
import { updateJob } from './job-store.ts';
import { checkVideoJobStatus } from '../api/controllers/videos.ts';
import util from './util.ts';

const POLL_INTERVAL_MS = 30_000;

const STUCK_JOB_TIMEOUT_SECONDS = 600;

async function reapStuckJobs(): Promise<void> {
    const stuckJobs = await getStuckJobsWithoutHistoryId(STUCK_JOB_TIMEOUT_SECONDS);
    if (stuckJobs.length === 0) return;

    logger.warn(`JobPoller: found ${stuckJobs.length} stuck job(s) with no historyId, marking as failed`);
    await Promise.all(stuckJobs.map(async (dbJob) => {
        const errorMsg = '视频生成请求未能提交到Jimeng（超时或服务不可用）';
        await updateJobInDb(dbJob.id, { status: 'failed', error_message: errorMsg });
        updateJob(dbJob.id, { status: 'failed', error: errorMsg });
        logger.warn(`JobPoller: reaped stuck job ${dbJob.id} (created ${Math.floor(Date.now() / 1000) - dbJob.created_at}s ago)`);
    }));
}

async function pollOnce(): Promise<void> {
    await reapStuckJobs();

    const jobs = await getProcessingJobsWithHistoryId();
    if (jobs.length === 0) return;

    logger.info(`JobPoller: checking ${jobs.length} active job(s)`);

    await Promise.all(jobs.map(async (dbJob) => {
        try {
            const result = await checkVideoJobStatus(dbJob.jimeng_history_id!, dbJob.refresh_token!);

            if (result.status === 'completed' && result.url) {
                const prompt = dbJob.prompt || undefined;
                const responseFormat = dbJob.response_format || 'url';

                if (responseFormat === 'b64_json') {
                    try {
                        const b64 = await util.fetchFileBASE64(result.url);
                        await updateJobInDb(dbJob.id, {
                            status: 'completed',
                            result_b64_json: b64,
                            result_revised_prompt: prompt,
                        });
                        updateJob(dbJob.id, {
                            status: 'completed',
                            result: { b64_json: b64, revised_prompt: prompt },
                        });
                    } catch (b64Err: any) {
                        logger.warn(`JobPoller: b64 conversion failed for job ${dbJob.id}, falling back to url: ${b64Err.message}`);
                        await updateJobInDb(dbJob.id, {
                            status: 'completed',
                            result_url: result.url,
                            result_revised_prompt: prompt,
                        });
                        updateJob(dbJob.id, {
                            status: 'completed',
                            result: { url: result.url, revised_prompt: prompt },
                        });
                    }
                } else {
                    await updateJobInDb(dbJob.id, {
                        status: 'completed',
                        result_url: result.url,
                        result_revised_prompt: prompt,
                    });
                    updateJob(dbJob.id, {
                        status: 'completed',
                        result: { url: result.url, revised_prompt: prompt },
                    });
                }

                logger.info(`JobPoller: job ${dbJob.id} completed, url: ${result.url}`);
            } else if (result.status === 'failed') {
                const errorMsg = result.error || '视频生成失败';
                await updateJobInDb(dbJob.id, { status: 'failed', error_message: errorMsg });
                updateJob(dbJob.id, { status: 'failed', error: errorMsg });
                logger.error(`JobPoller: job ${dbJob.id} failed - ${errorMsg}`);
            } else {
                await updateJobInDb(dbJob.id, { last_poll_at: Math.floor(Date.now() / 1000) });
                logger.info(`JobPoller: job ${dbJob.id} still processing (historyId: ${dbJob.jimeng_history_id})`);
            }
        } catch (err: any) {
            logger.error(`JobPoller: error checking job ${dbJob.id}: ${err.message}`);
        }
    }));
}

export function startJobPoller(): void {
    logger.info(`JobPoller: started (interval=${POLL_INTERVAL_MS / 1000}s)`);
    setInterval(async () => {
        try {
            await pollOnce();
        } catch (err: any) {
            logger.error(`JobPoller: unhandled error in poll cycle: ${err.message}`);
        }
    }, POLL_INTERVAL_MS);
}
