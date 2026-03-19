import logger from './logger.js';
import browserService from './browser-service.js';
import { Pool } from 'pg';

// Initialize database tables if they don't exist
export async function initializeDatabase() {
    if (!process.env.DATABASE_URL) {
        logger.warn('DATABASE_URL not set, skipping database initialization');
        return;
    }

    const pool = new Pool({
        connectionString: process.env.DATABASE_URL,
        connectionTimeoutMillis: 5000,
    });

    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS video_jobs (
                id UUID PRIMARY KEY,
                status VARCHAR(20) NOT NULL DEFAULT 'pending',
                created_at INTEGER NOT NULL,
                updated_at INTEGER NOT NULL,
                jimeng_history_id VARCHAR(255),
                refresh_token TEXT,
                model VARCHAR(255),
                prompt TEXT,
                response_format VARCHAR(50),
                error_message TEXT,
                result_url TEXT,
                result_b64_json TEXT,
                result_revised_prompt TEXT,
                last_poll_at INTEGER
            )
        `);
        logger.success('DB: video_jobs table initialized');
    } catch (err: any) {
        logger.error(`DB: failed to initialize tables: ${err.message}`);
        throw err;
    } finally {
        await pool.end();
    }
}

// 允许无限量的监听器
process.setMaxListeners(Infinity);
// 输出未捕获异常
process.on("uncaughtException", (err, origin) => {
    logger.error(`An unhandled error occurred: ${origin}`, err);
});
// 输出未处理的Promise.reject
process.on("unhandledRejection", (_, promise) => {
    promise.catch(err => logger.error("An unhandled rejection occurred:", err));
});
// 输出系统警告信息
process.on("warning", warning => logger.warn("System warning: ", warning));
// 进程退出监听
process.on("exit", () => {
    logger.info("Service exit");
    logger.footer();
});
// 进程被kill
process.on("SIGTERM", () => {
    logger.warn("received kill signal");
    browserService.close().finally(() => process.exit(2));
});
// Ctrl-C进程退出
process.on("SIGINT", () => {
    browserService.close().finally(() => process.exit(0));
});