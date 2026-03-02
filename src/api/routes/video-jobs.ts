import Request from '@/lib/request/Request.ts';
import Response from '@/lib/response/Response.ts';
import { getJob } from '@/lib/job-store.ts';

export default {

    prefix: '/v1/videos',

    get: {

        '/jobs/:jobId': async (request: Request) => {
            const jobId = request.params['jobId'];
            const job = getJob(jobId);

            if (!job) {
                return new Response({ error: { message: `Job ${jobId} not found`, code: 'job_not_found' } }, { statusCode: 404 });
            }

            if (job.status === 'completed') {
                return {
                    id: job.id,
                    status: job.status,
                    created: job.created,
                    data: [{
                        url: job.result?.url,
                        b64_json: job.result?.b64_json,
                        revised_prompt: job.result?.revised_prompt
                    }]
                };
            }

            if (job.status === 'failed') {
                return new Response({
                    id: job.id,
                    status: job.status,
                    created: job.created,
                    error: { message: job.error }
                }, { statusCode: 422 });
            }

            return {
                id: job.id,
                status: job.status,
                created: job.created
            };
        }

    }

}
