import _ from 'lodash';
import os from 'os';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import { tokenSplit } from '@/api/controllers/core.ts';
import {
    generateVideo,
    generateSeedanceVideo,
    generateInternationalVideo,
    generateInternationalSeedanceVideo,
    isSeedanceModel,
    isInternationalSeedanceModel,
    isInternationalVideoModel,
    DEFAULT_MODEL,
    submitAsyncVideoTask,
    submitInternationalAsyncVideoTask,
    queryAsyncVideoTask,
} from '@/api/controllers/videos.ts';
import { createJob, updateJob } from '@/lib/job-store.ts';
import { saveJobToDb, updateJobInDb } from '@/lib/db.ts';
import util from '@/lib/util.ts';
import logger from '@/lib/logger.ts';

const MEMORY_GATE_MB = parseInt(process.env.MEMORY_GATE_MB || "100", 10);

/**
 * Helper: check memory and return 503 if too low
 */
function checkMemoryGate(): Response | null {
    const freeMB = Math.round(os.freemem() / 1024 / 1024);
    if (freeMB < MEMORY_GATE_MB) {
        logger.warn(`VideoRoute: memory gate triggered - ${freeMB}MB free, need ${MEMORY_GATE_MB}MB, rejecting job`);
        return new Response(
            { error: { message: `Service temporarily unavailable: low memory (${freeMB}MB free). Please retry in 60 seconds.`, type: 'server_error', code: 'service_unavailable' } },
            { statusCode: 503, headers: { 'Retry-After': '60' } }
        );
    }
    return null;
}

export default {

    prefix: '/v1/videos',

    post: {

        // ========== 1. Domestic Sync → now async with PostgreSQL ==========
        '/generations': async (request: Request) => {
            const unsupportedParams = ['size', 'width', 'height'];
            const bodyKeys = Object.keys(request.body);
            const foundUnsupported = unsupportedParams.filter(param => bodyKeys.includes(param));

            if (foundUnsupported.length > 0) {
                throw new Error(`Unsupported parameters: ${foundUnsupported.join(', ')}. Use ratio and resolution to control video dimensions.`);
            }

            const contentType = request.headers['content-type'] || '';
            const isMultiPart = contentType.startsWith('multipart/form-data');

            request
                .validate('body.model', v => _.isUndefined(v) || _.isString(v))
                .validate('body.prompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.duration', v => {
                    if (_.isUndefined(v)) return true;
                    if (isMultiPart && typeof v === 'string') {
                        const num = parseInt(v);
                        return (num >= 4 && num <= 15) || num === 5 || num === 10;
                    }
                    return _.isFinite(v) && ((v >= 4 && v <= 15) || v === 5 || v === 10);
                })
                .validate('body.file_paths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.filePaths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.response_format', v => _.isUndefined(v) || _.isString(v))
                .validate('headers.authorization', _.isString);

            const tokens = tokenSplit(request.headers.authorization);
            const token = _.sample(tokens);

            const {
                model = DEFAULT_MODEL,
                prompt,
                ratio = "1:1",
                resolution = "720p",
                duration = 5,
                file_paths = [],
                filePaths = [],
                response_format = "url"
            } = request.body;

            const finalDuration = isMultiPart && typeof duration === 'string'
                ? parseInt(duration)
                : duration;
            const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;

            // Memory gate
            const memBlock = checkMemoryGate();
            if (memBlock) return memBlock;

            // Create job in memory + PostgreSQL
            const job = createJob();
            const freeMB = Math.round(os.freemem() / 1024 / 1024);
            logger.info(`Job ${job.id}: created for domestic model=${model} (memory: ${freeMB}MB free)`);

            // Background processing
            (async () => {
                try {
                    updateJob(job.id, { status: 'processing' });
                    await updateJobInDb(job.id, {
                        status: 'processing',
                        model,
                        prompt: prompt || '',
                        response_format,
                        refresh_token: token,
                    });

                    let videoUrl: string;
                    if (isSeedanceModel(model)) {
                        const seedanceDuration = finalDuration === 5 ? 4 : finalDuration;
                        const seedanceRatio = ratio === "1:1" ? "4:3" : ratio;
                        videoUrl = await generateSeedanceVideo(
                            model, prompt,
                            { ratio: seedanceRatio, resolution, duration: seedanceDuration, filePaths: finalFilePaths, files: request.files },
                            token
                        );
                    } else {
                        videoUrl = await generateVideo(
                            model, prompt,
                            { ratio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request.files },
                            token
                        );
                    }

                    if (response_format === "b64_json") {
                        const videoBase64 = await util.fetchFileBASE64(videoUrl);
                        updateJob(job.id, { status: 'completed', result: { b64_json: videoBase64, revised_prompt: prompt } });
                        await updateJobInDb(job.id, { status: 'completed', result_b64_json: videoBase64, result_revised_prompt: prompt || '' });
                    } else {
                        updateJob(job.id, { status: 'completed', result: { url: videoUrl, revised_prompt: prompt } });
                        await updateJobInDb(job.id, { status: 'completed', result_url: videoUrl, result_revised_prompt: prompt || '' });
                    }
                    logger.info(`Job ${job.id}: completed, url: ${videoUrl}`);
                } catch (err: any) {
                    const message = err?.message || String(err);
                    updateJob(job.id, { status: 'failed', error: message });
                    await updateJobInDb(job.id, { status: 'failed', error_message: message });
                    logger.error(`Job ${job.id}: failed - ${message}`);
                }
            })();

            return new Response({
                id: job.id,
                status: job.status,
                created: job.created
            }, { statusCode: 202 });
        },

        // ========== 2. International Sync → now async with PostgreSQL ==========
        '/international/generations': async (request: Request) => {
            const contentType = request.headers['content-type'] || '';
            const isMultiPart = contentType.startsWith('multipart/form-data');
            const allowedModels = [
                'seedance-2.0-fast', 'seedance-2.0-pro', 'jimeng-video-seedance-2.0-fast', 'jimeng-video-seedance-2.0',
                'jimeng-video-seedance-2.0-fast-vip', 'seedance-2.0-fast-vip', 'jimeng-video-seedance-2.0-vip', 'seedance-2.0-vip',
                'jimeng-video-3.5-pro', 'jimeng-video-3.0', 'jimeng-video-3.0-pro'
            ];
            const hasKeyedUrlFields = Object.keys(request.body || {}).some(key => (
                key === 'image_file' || key === 'video_file' || key.startsWith('image_file_') || key.startsWith('video_file_')
            ) && _.isString(request.body[key]));
            const hasKeyedFiles = Object.keys(request.filesMap || {}).some(key =>
                key === 'image_file' || key === 'video_file' || key.startsWith('image_file_') || key.startsWith('video_file_')
            );

            request
                .validate('body.model', v => _.isString(v) && allowedModels.includes(v))
                .validate('body.prompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.file_paths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.filePaths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.response_format', v => _.isUndefined(v) || _.isString(v))
                .validate('headers.authorization', _.isString);

            const tokens = tokenSplit(request.headers.authorization);
            const token = _.sample(tokens);
            const {
                model,
                prompt = '',
                ratio,
                resolution = '720p',
                duration,
                file_paths = [],
                filePaths = [],
                response_format = 'url'
            } = request.body;

            const isSeedance = isInternationalSeedanceModel(model);
            const finalDuration = _.isUndefined(duration)
                ? (isSeedance ? 4 : 5)
                : (isMultiPart && typeof duration === 'string' ? parseInt(duration) : duration);
            const finalRatio = _.isUndefined(ratio)
                ? (isSeedance ? '4:3' : '1:1')
                : ratio;
            const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;

            if (!_.isFinite(finalDuration) || !Number.isInteger(Number(finalDuration))) {
                throw new Error('Invalid duration parameter');
            }
            if (isSeedance) {
                if (finalDuration < 4 || finalDuration > 15) {
                    throw new Error('International Seedance model duration supports 4-15 seconds only');
                }
                if (!hasKeyedFiles && !hasKeyedUrlFields && finalFilePaths.length === 0) {
                    throw new Error('International Seedance requires at least one material: keyed multipart file, keyed URL field, or file_paths/filePaths');
                }
            } else if (isInternationalVideoModel(model)) {
                if (finalDuration !== 5 && finalDuration !== 10) {
                    throw new Error('International video model duration supports 5 or 10 seconds only');
                }
            } else {
                throw new Error(`International endpoint does not support model: ${model}`);
            }

            // Memory gate
            const memBlock = checkMemoryGate();
            if (memBlock) return memBlock;

            // Create job in memory + PostgreSQL
            const job = createJob();
            logger.info(`Job ${job.id}: created for international model=${model}`);

            // Background processing
            (async () => {
                try {
                    updateJob(job.id, { status: 'processing' });
                    await updateJobInDb(job.id, {
                        status: 'processing',
                        model,
                        prompt: prompt || '',
                        response_format,
                        refresh_token: token,
                    });

                    let videoUrl: string;
                    if (isSeedance) {
                        videoUrl = await generateInternationalSeedanceVideo(
                            model, prompt,
                            { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, filesMap: request.filesMap, body: request.body },
                            token
                        );
                    } else {
                        videoUrl = await generateInternationalVideo(
                            model, prompt,
                            { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request.files },
                            token
                        );
                    }

                    if (response_format === 'b64_json') {
                        const videoBase64 = await util.fetchFileBASE64(videoUrl);
                        updateJob(job.id, { status: 'completed', result: { b64_json: videoBase64, revised_prompt: prompt } });
                        await updateJobInDb(job.id, { status: 'completed', result_b64_json: videoBase64, result_revised_prompt: prompt || '' });
                    } else {
                        updateJob(job.id, { status: 'completed', result: { url: videoUrl, revised_prompt: prompt } });
                        await updateJobInDb(job.id, { status: 'completed', result_url: videoUrl, result_revised_prompt: prompt || '' });
                    }
                    logger.info(`Job ${job.id}: completed, url: ${videoUrl}`);
                } catch (err: any) {
                    const message = err?.message || String(err);
                    updateJob(job.id, { status: 'failed', error: message });
                    await updateJobInDb(job.id, { status: 'failed', error_message: message });
                    logger.error(`Job ${job.id}: failed - ${message}`);
                }
            })();

            return new Response({
                id: job.id,
                status: job.status,
                created: job.created
            }, { statusCode: 202 });
        },

        // ========== 3. International Async → upstream logic + PostgreSQL ==========
        '/international/generations/async': async (request: Request) => {
            const contentType = request.headers['content-type'] || '';
            const isMultiPart = contentType.startsWith('multipart/form-data');
            const allowedModels = [
                'seedance-2.0-fast', 'seedance-2.0-pro', 'jimeng-video-seedance-2.0-fast', 'jimeng-video-seedance-2.0',
                'jimeng-video-seedance-2.0-fast-vip', 'seedance-2.0-fast-vip', 'jimeng-video-seedance-2.0-vip', 'seedance-2.0-vip',
                'jimeng-video-3.5-pro', 'jimeng-video-3.0', 'jimeng-video-3.0-pro'
            ];
            const hasKeyedUrlFields = Object.keys(request.body || {}).some(key => (
                key === 'image_file' || key === 'video_file' || key.startsWith('image_file_') || key.startsWith('video_file_')
            ) && _.isString(request.body[key]));
            const hasKeyedFiles = Object.keys(request.filesMap || {}).some(key =>
                key === 'image_file' || key === 'video_file' || key.startsWith('image_file_') || key.startsWith('video_file_')
            );

            request
                .validate('body.model', v => _.isString(v) && allowedModels.includes(v))
                .validate('body.prompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.file_paths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.filePaths', v => _.isUndefined(v) || _.isArray(v))
                .validate('headers.authorization', _.isString);

            const tokens = tokenSplit(request.headers.authorization);
            const token = _.sample(tokens);
            const {
                model,
                prompt = '',
                ratio,
                resolution = '720p',
                duration,
                file_paths = [],
                filePaths = [],
            } = request.body;

            const isSeedance = isInternationalSeedanceModel(model);
            const finalDuration = _.isUndefined(duration)
                ? (isSeedance ? 4 : 5)
                : (isMultiPart && typeof duration === 'string' ? parseInt(duration) : duration);
            const finalRatio = _.isUndefined(ratio)
                ? (isSeedance ? '4:3' : '1:1')
                : ratio;
            const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;

            if (!_.isFinite(finalDuration) || !Number.isInteger(Number(finalDuration))) {
                throw new Error('Invalid duration parameter');
            }
            if (isSeedance) {
                if (finalDuration < 4 || finalDuration > 15) {
                    throw new Error('International Seedance model duration supports 4-15 seconds only');
                }
                if (!hasKeyedFiles && !hasKeyedUrlFields && finalFilePaths.length === 0) {
                    throw new Error('International Seedance requires at least one material');
                }
            } else if (isInternationalVideoModel(model)) {
                if (finalDuration !== 5 && finalDuration !== 10) {
                    throw new Error('International video model duration supports 5 or 10 seconds only');
                }
            } else {
                throw new Error(`International endpoint does not support model: ${model}`);
            }

            // Create PostgreSQL job alongside upstream async task
            const job = createJob();
            await updateJobInDb(job.id, { status: 'processing', model, prompt: prompt || '', refresh_token: token });
            logger.info(`Job ${job.id}: created for intl async model=${model}`);

            // Submit upstream async task (in-memory + file storage)
            const taskId = submitInternationalAsyncVideoTask(
                model, prompt,
                { ratio: finalRatio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request.files, filesMap: request.filesMap, body: request.body },
                token
            );

            // Link the upstream taskId in the DB for cross-reference
            await updateJobInDb(job.id, { jimeng_history_id: taskId });

            // Background: poll upstream task and sync results to PostgreSQL
            (async () => {
                const MAX_POLL = 300;
                const POLL_INTERVAL = 10_000;
                for (let i = 0; i < MAX_POLL; i++) {
                    await new Promise(r => setTimeout(r, POLL_INTERVAL));
                    try {
                        const task = await queryAsyncVideoTask(taskId);
                        if (task.status === 'succeeded') {
                            updateJob(job.id, { status: 'completed', result: { url: task.result.url, revised_prompt: task.result.revised_prompt } });
                            await updateJobInDb(job.id, { status: 'completed', result_url: task.result.url, result_revised_prompt: task.result.revised_prompt || '' });
                            logger.info(`Job ${job.id}: intl async completed, url: ${task.result.url}`);
                            return;
                        } else if (task.status === 'failed') {
                            updateJob(job.id, { status: 'failed', error: task.error });
                            await updateJobInDb(job.id, { status: 'failed', error_message: task.error || 'Unknown error' });
                            logger.error(`Job ${job.id}: intl async failed - ${task.error}`);
                            return;
                        }
                    } catch (err: any) {
                        logger.warn(`Job ${job.id}: intl async poll error: ${err.message}`);
                    }
                }
                // Timeout
                updateJob(job.id, { status: 'failed', error: 'Async task timed out' });
                await updateJobInDb(job.id, { status: 'failed', error_message: 'Async task timed out' });
            })();

            return {
                created: util.unixTimestamp(),
                id: job.id,
                task_id: taskId,
                status: "processing",
                message: "Task submitted. Query status via GET /v1/videos/jobs/{id} or GET /v1/videos/international/generations/async/{task_id}",
            };
        },

        // ========== 4. Domestic Async → upstream logic + PostgreSQL ==========
        '/generations/async': async (request: Request) => {
            const contentType = request.headers['content-type'] || '';
            const isMultiPart = contentType.startsWith('multipart/form-data');

            request
                .validate('body.model', v => _.isUndefined(v) || _.isString(v))
                .validate('body.prompt', v => _.isUndefined(v) || _.isString(v))
                .validate('body.ratio', v => _.isUndefined(v) || _.isString(v))
                .validate('body.resolution', v => _.isUndefined(v) || _.isString(v))
                .validate('body.duration', v => {
                    if (_.isUndefined(v)) return true;
                    if (isMultiPart && typeof v === 'string') {
                        const num = parseInt(v);
                        return (num >= 4 && num <= 15) || num === 5 || num === 10;
                    }
                    return _.isFinite(v) && ((v >= 4 && v <= 15) || v === 5 || v === 10);
                })
                .validate('body.file_paths', v => _.isUndefined(v) || _.isArray(v))
                .validate('body.filePaths', v => _.isUndefined(v) || _.isArray(v))
                .validate('headers.authorization', _.isString);

            const tokens = tokenSplit(request.headers.authorization);
            const token = _.sample(tokens);

            const {
                model = DEFAULT_MODEL,
                prompt,
                ratio = "1:1",
                resolution = "720p",
                duration = 5,
                file_paths = [],
                filePaths = [],
            } = request.body;

            const finalDuration = isMultiPart && typeof duration === 'string'
                ? parseInt(duration)
                : duration;
            const finalFilePaths = filePaths.length > 0 ? filePaths : file_paths;

            // Create PostgreSQL job alongside upstream async task
            const job = createJob();
            await updateJobInDb(job.id, { status: 'processing', model, prompt: prompt || '', refresh_token: token });
            logger.info(`Job ${job.id}: created for domestic async model=${model}`);

            // Submit upstream async task
            const taskId = submitAsyncVideoTask(
                model, prompt,
                { ratio, resolution, duration: finalDuration, filePaths: finalFilePaths, files: request.files },
                token
            );

            // Link the upstream taskId in the DB
            await updateJobInDb(job.id, { jimeng_history_id: taskId });

            // Background: poll upstream task and sync results to PostgreSQL
            (async () => {
                const MAX_POLL = 300;
                const POLL_INTERVAL = 10_000;
                for (let i = 0; i < MAX_POLL; i++) {
                    await new Promise(r => setTimeout(r, POLL_INTERVAL));
                    try {
                        const task = await queryAsyncVideoTask(taskId);
                        if (task.status === 'succeeded') {
                            updateJob(job.id, { status: 'completed', result: { url: task.result.url, revised_prompt: task.result.revised_prompt } });
                            await updateJobInDb(job.id, { status: 'completed', result_url: task.result.url, result_revised_prompt: task.result.revised_prompt || '' });
                            logger.info(`Job ${job.id}: domestic async completed, url: ${task.result.url}`);
                            return;
                        } else if (task.status === 'failed') {
                            updateJob(job.id, { status: 'failed', error: task.error });
                            await updateJobInDb(job.id, { status: 'failed', error_message: task.error || 'Unknown error' });
                            logger.error(`Job ${job.id}: domestic async failed - ${task.error}`);
                            return;
                        }
                    } catch (err: any) {
                        logger.warn(`Job ${job.id}: domestic async poll error: ${err.message}`);
                    }
                }
                updateJob(job.id, { status: 'failed', error: 'Async task timed out' });
                await updateJobInDb(job.id, { status: 'failed', error_message: 'Async task timed out' });
            })();

            return {
                created: util.unixTimestamp(),
                id: job.id,
                task_id: taskId,
                status: "processing",
                message: "Task submitted. Query status via GET /v1/videos/jobs/{id} or GET /v1/videos/generations/async/{task_id}",
            };
        },

    },

    get: {

        // ========== International async task status (upstream compat) ==========
        '/international/generations/async/:taskId': async (request: Request) => {
            const { taskId } = request.params;
            if (!taskId) {
                throw new Error("Missing task_id parameter");
            }

            const task = await queryAsyncVideoTask(taskId);

            if (task.status === "succeeded") {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: "succeeded",
                    data: [{
                        url: task.result.url,
                        revised_prompt: task.result.revised_prompt,
                    }],
                };
            } else if (task.status === "failed") {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: "failed",
                    error: task.error,
                };
            } else {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: task.status,
                    message: "Task is processing",
                };
            }
        },

        // ========== Domestic async task status (upstream compat) ==========
        '/generations/async/:taskId': async (request: Request) => {
            const { taskId } = request.params;
            if (!taskId) {
                throw new Error("Missing task_id parameter");
            }

            const task = await queryAsyncVideoTask(taskId);

            if (task.status === "succeeded") {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: "succeeded",
                    data: [{
                        url: task.result.url,
                        revised_prompt: task.result.revised_prompt,
                    }],
                };
            } else if (task.status === "failed") {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: "failed",
                    error: task.error,
                };
            } else {
                return {
                    created: util.unixTimestamp(),
                    task_id: task.taskId,
                    status: task.status,
                    message: "Task is processing",
                };
            }
        },

    },

}
