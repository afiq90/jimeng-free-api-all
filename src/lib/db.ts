import { Pool } from 'pg';
import logger from './logger.ts';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on('error', (err) => {
    logger.error(`DB: pool error: ${err.message}`);
});

export interface DbJob {
    id: string;
    status: string;
    created_at: number;
    updated_at: number;
    jimeng_history_id: string | null;
    refresh_token: string | null;
    model: string | null;
    prompt: string | null;
    response_format: string | null;
    error_message: string | null;
    result_url: string | null;
    result_b64_json: string | null;
    result_revised_prompt: string | null;
    last_poll_at: number | null;
}

export async function saveJobToDb(id: string, status: string, created: number): Promise<void> {
    try {
        await pool.query(
            `INSERT INTO video_jobs (id, status, created_at, updated_at)
             VALUES ($1, $2, $3, $3)
             ON CONFLICT (id) DO NOTHING`,
            [id, status, created]
        );
    } catch (err: any) {
        logger.error(`DB: saveJobToDb failed for ${id}: ${err.message}`);
    }
}

export async function updateJobInDb(
    id: string,
    update: Partial<{
        status: string;
        error_message: string;
        result_url: string;
        result_b64_json: string;
        result_revised_prompt: string;
        jimeng_history_id: string;
        refresh_token: string;
        model: string;
        prompt: string;
        response_format: string;
        last_poll_at: number;
    }>
): Promise<void> {
    const now = Math.floor(Date.now() / 1000);
    const keys = Object.keys(update);
    if (keys.length === 0) return;

    const setClauses = keys.map((key, i) => `${key} = $${i + 2}`).join(', ');
    const values = Object.values(update);

    try {
        await pool.query(
            `UPDATE video_jobs SET ${setClauses}, updated_at = $1 WHERE id = $${values.length + 2}`,
            [now, ...values, id]
        );
    } catch (err: any) {
        logger.error(`DB: updateJobInDb failed for ${id}: ${err.message}`);
    }
}

export async function getJobFromDb(id: string): Promise<DbJob | null> {
    try {
        const result = await pool.query(
            `SELECT * FROM video_jobs WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    } catch (err: any) {
        logger.error(`DB: getJobFromDb failed for ${id}: ${err.message}`);
        return null;
    }
}

export async function getProcessingJobsWithHistoryId(): Promise<DbJob[]> {
    try {
        const result = await pool.query(
            `SELECT * FROM video_jobs
             WHERE status = 'processing' AND jimeng_history_id IS NOT NULL
             ORDER BY created_at ASC`
        );
        return result.rows;
    } catch (err: any) {
        logger.error(`DB: getProcessingJobsWithHistoryId failed: ${err.message}`);
        return [];
    }
}
