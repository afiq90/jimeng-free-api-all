import _ from 'lodash';
import os from 'os';

import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import { tokenSplit } from '@/api/controllers/core.ts';
import { generateVideo, generateSeedanceVideo, isSeedanceModel, DEFAULT_MODEL } from '@/api/controllers/videos.ts';
import { createJob, updateJob } from '@/lib/job-store.ts';
import { saveJobToDb, updateJobInDb } from '@/lib/db.ts';
import browserService from '@/lib/browser-service.ts';
import util from '@/lib/util.ts';
import logger from '@/lib/logger.ts';

const MEMORY_GATE_MB = parseInt(process.env.MEMORY_GATE_MB || "100", 10);

export default {

    prefix: '/v1/videos',

    post: {

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

            const freeMB = Math.round(os.freemem() / 1024 / 1024);
            if (freeMB < MEMORY_GATE_MB) {
                logger.warn(`VideoRoute: memory gate triggered - ${freeMB}MB free, need ${MEMORY_GATE_MB}MB, rejecting job`);
                return new Response(
                    { error: { message: `Service temporarily unavailable: low memory (${freeMB}MB free). Please retry in 60 seconds.`, type: 'server_error', code: 'service_unavailable' } },
                    { statusCode: 503, headers: { 'Retry-After': '60' } }
                );
            }

            const job = createJob();
            logger.info(`Job ${job.id}: created for model=${model} (memory: ${freeMB}MB free)`);

            (async () => {
                try {
                    updateJob(job.id, { status: 'processing' });
                    await saveJobToDb(job.id, 'pending', job.created);
                    await updateJobInDb(job.id, {
                        status: 'processing',
                        model,
                        prompt: prompt || '',
                        response_format,
                    });

                    let videoUrl: string | null;
                    if (isSeedanceModel(model)) {
                        const seedanceDuration = finalDuration === 5 ? 4 : finalDuration;
                        const seedanceRatio = ratio === "1:1" ? "4:3" : ratio;
                        videoUrl = await generateSeedanceVideo(
                            model,
                            prompt,
                            {
                                ratio: seedanceRatio,
                                resolution,
                                duration: seedanceDuration,
                                filePaths: finalFilePaths,
                                files: request.files,
                            },
                            token,
                            job.id
                        );
                    } else {
                        videoUrl = await generateVideo(
                            model,
                            prompt,
                            {
                                ratio,
                                resolution,
                                duration: finalDuration,
                                filePaths: finalFilePaths,
                                files: request.files,
                            },
                            token,
                            job.id
                        );
                    }

                    // null means historyId was saved and polling handed off to background worker
                    if (videoUrl === null) {
                        logger.info(`Job ${job.id}: handed off to background poller`);
                        browserService.recordJobCompleted();
                        return;
                    }

                    // Non-null means the job completed synchronously (future fast-path)
                    if (response_format === "b64_json") {
                        const videoBase64 = await util.fetchFileBASE64(videoUrl);
                        updateJob(job.id, {
                            status: 'completed',
                            result: { b64_json: videoBase64, revised_prompt: prompt }
                        });
                    } else {
                        updateJob(job.id, {
                            status: 'completed',
                            result: { url: videoUrl, revised_prompt: prompt }
                        });
                    }

                    logger.info(`Job ${job.id}: completed`);
                    browserService.recordJobCompleted();
                } catch (err: any) {
                    const message = err?.message || String(err);
                    updateJob(job.id, { status: 'failed', error: message });
                    logger.error(`Job ${job.id}: failed - ${message}`);
                }
            })();

            return new Response({
                id: job.id,
                status: job.status,
                created: job.created
            }, { statusCode: 202 });
        }

    }

}
