import { chromium, Browser, BrowserContext, Page } from "playwright-core";
import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import logger from "@/lib/logger.ts";
import { getCookiesForBrowser } from "@/api/controllers/core.ts";

let cachedChromiumPath: string | null = null;

function findChromiumPath(): string {
  if (cachedChromiumPath) {
    return cachedChromiumPath;
  }

  if (process.env.CHROMIUM_PATH && fs.existsSync(process.env.CHROMIUM_PATH)) {
    cachedChromiumPath = process.env.CHROMIUM_PATH;
    return cachedChromiumPath;
  }

  try {
    const playwrightPath = chromium.executablePath();
    if (playwrightPath && fs.existsSync(playwrightPath)) {
      logger.info(`BrowserService: 使用 Playwright 内置 Chromium: ${playwrightPath}`);
      cachedChromiumPath = playwrightPath;
      return cachedChromiumPath;
    }
  } catch {}

  try {
    const whichPath = execSync("which chromium 2>/dev/null || which chromium-browser 2>/dev/null || which google-chrome 2>/dev/null", { encoding: "utf-8" }).trim();
    if (whichPath && fs.existsSync(whichPath)) {
      cachedChromiumPath = whichPath;
      return cachedChromiumPath;
    }
  } catch {}

  try {
    const nixChrome = execSync("find /nix/store -maxdepth 3 -name 'chromium' -type f -executable 2>/dev/null | grep '/bin/chromium' | head -1", { encoding: "utf-8", timeout: 5000 }).trim();
    if (nixChrome && fs.existsSync(nixChrome)) {
      cachedChromiumPath = nixChrome;
      return cachedChromiumPath;
    }
  } catch {}

  const fallbacks = ["/usr/bin/chromium", "/usr/bin/chromium-browser", "/usr/bin/google-chrome"];
  for (const p of fallbacks) {
    if (fs.existsSync(p)) {
      cachedChromiumPath = p;
      return cachedChromiumPath;
    }
  }
  return "";
}

let trackedBrowserPid: number | null = null;

function killTrackedBrowserProcess(): void {
  if (!trackedBrowserPid) return;
  try {
    execSync(`kill -9 ${trackedBrowserPid} 2>/dev/null || true`, { encoding: "utf-8", timeout: 5000 });
    execSync(`pkill -9 -P ${trackedBrowserPid} 2>/dev/null || true`, { encoding: "utf-8", timeout: 5000 });
    logger.info(`BrowserService: 已清理残留浏览器进程 (pid: ${trackedBrowserPid})`);
  } catch {}
  trackedBrowserPid = null;
}

function getSystemMemoryInfo(): { totalMB: number; freeMB: number; usedPercent: number } {
  const totalMB = Math.round(os.totalmem() / 1024 / 1024);
  const freeMB = Math.round(os.freemem() / 1024 / 1024);
  const usedPercent = Math.round(((totalMB - freeMB) / totalMB) * 100);
  return { totalMB, freeMB, usedPercent };
}

const SCRIPT_WHITELIST_DOMAINS = [
  "vlabstatic.com",
  "bytescm.com",
  "jianying.com",
  "byteimg.com",
];

const BLOCKED_RESOURCE_TYPES = ["image", "font", "stylesheet", "media"];

const SESSION_IDLE_TIMEOUT = 5 * 60 * 1000;
const BDMS_READY_TIMEOUT = 30000;
const BROWSER_LAUNCH_TIMEOUT = 120000;
const MAX_SESSIONS = 2;
const HEALTH_CHECK_INTERVAL = 30 * 1000;
const FETCH_TIMEOUT = 30000;
const PROACTIVE_RECONNECT_DELAY = 2000;

const API_CIRCUIT_BREAKER_THRESHOLD = 3;
const API_CIRCUIT_BREAKER_COOLDOWN = 20 * 1000;

const BROWSER_CIRCUIT_BREAKER_THRESHOLD = 3;
const BROWSER_CIRCUIT_BREAKER_COOLDOWN = 30 * 1000;

interface BrowserSession {
  context: BrowserContext;
  page: Page;
  lastUsed: number;
  idleTimer: NodeJS.Timeout | null;
}

interface CancelToken {
  cancelled: boolean;
}

class BrowserService {
  private browser: Browser | null = null;
  private sessions: Map<string, BrowserSession> = new Map();
  private launching: Promise<Browser> | null = null;
  private healthCheckTimer: NodeJS.Timeout | null = null;

  private apiConsecutiveFailures: number = 0;
  private apiLastFailureTime: number = 0;

  private browserConsecutiveFailures: number = 0;
  private browserLastFailureTime: number = 0;

  private browserStartCount: number = 0;
  private browserStartTime: number = 0;

  private isReady(): boolean {
    return this.browser !== null && this.browser.isConnected();
  }

  private isApiCircuitOpen(): boolean {
    if (this.apiConsecutiveFailures < API_CIRCUIT_BREAKER_THRESHOLD) {
      return false;
    }
    const elapsed = Date.now() - this.apiLastFailureTime;
    if (elapsed > API_CIRCUIT_BREAKER_COOLDOWN) {
      logger.info(`BrowserService: API熔断器冷却完毕 (${Math.round(elapsed / 1000)}s)，允许重试`);
      this.apiConsecutiveFailures = 0;
      return false;
    }
    return true;
  }

  private isBrowserCircuitOpen(): boolean {
    if (this.browserConsecutiveFailures < BROWSER_CIRCUIT_BREAKER_THRESHOLD) {
      return false;
    }
    const elapsed = Date.now() - this.browserLastFailureTime;
    if (elapsed > BROWSER_CIRCUIT_BREAKER_COOLDOWN) {
      logger.info(`BrowserService: 浏览器熔断器冷却完毕 (${Math.round(elapsed / 1000)}s)，允许重试`);
      this.browserConsecutiveFailures = 0;
      return false;
    }
    return true;
  }

  private recordApiFailure(): void {
    this.apiConsecutiveFailures++;
    this.apiLastFailureTime = Date.now();
    logger.warn(`BrowserService: API连续失败次数: ${this.apiConsecutiveFailures}/${API_CIRCUIT_BREAKER_THRESHOLD}`);
    if (this.apiConsecutiveFailures >= API_CIRCUIT_BREAKER_THRESHOLD) {
      logger.warn(`BrowserService: API熔断器已打开，冷却 ${API_CIRCUIT_BREAKER_COOLDOWN / 1000}s`);
      this.scheduleApiRecovery();
    }
  }

  private recordApiSuccess(): void {
    if (this.apiConsecutiveFailures > 0) {
      logger.info(`BrowserService: API恢复成功，重置熔断器 (之前连续失败 ${this.apiConsecutiveFailures} 次)`);
    }
    this.apiConsecutiveFailures = 0;
  }

  private recordBrowserFailure(): void {
    this.browserConsecutiveFailures++;
    this.browserLastFailureTime = Date.now();
    logger.warn(`BrowserService: 浏览器连续失败次数: ${this.browserConsecutiveFailures}/${BROWSER_CIRCUIT_BREAKER_THRESHOLD}`);
    if (this.browserConsecutiveFailures >= BROWSER_CIRCUIT_BREAKER_THRESHOLD) {
      logger.warn(`BrowserService: 浏览器熔断器已打开，冷却 ${BROWSER_CIRCUIT_BREAKER_COOLDOWN / 1000}s`);
      this.scheduleBrowserRecovery();
    }
  }

  private recordBrowserSuccess(): void {
    if (this.browserConsecutiveFailures > 0) {
      logger.info(`BrowserService: 浏览器恢复成功，重置熔断器 (之前连续失败 ${this.browserConsecutiveFailures} 次)`);
    }
    this.browserConsecutiveFailures = 0;
  }

  private scheduleApiRecovery(): void {
    setTimeout(() => {
      logger.info(`BrowserService: API熔断器冷却结束，重置计数`);
      this.apiConsecutiveFailures = 0;
    }, API_CIRCUIT_BREAKER_COOLDOWN + 1000);
  }

  private scheduleBrowserRecovery(): void {
    setTimeout(() => {
      if (this.isReady() || this.launching) {
        logger.info(`BrowserService: 浏览器熔断器恢复检查：浏览器已就绪，无需重连`);
        return;
      }
      logger.info(`BrowserService: 浏览器熔断器冷却结束，尝试恢复...`);
      this.browserConsecutiveFailures = 0;
      this.ensureBrowser().then(() => {
        logger.info(`BrowserService: 浏览器熔断器恢复成功`);
      }).catch((err) => {
        logger.error(`BrowserService: 浏览器熔断器恢复失败: ${(err as Error).message}`);
      });
    }, BROWSER_CIRCUIT_BREAKER_COOLDOWN + 1000);
  }

  private proactiveReconnect(): void {
    if (this.launching || this.isBrowserCircuitOpen()) {
      return;
    }

    logger.info(`BrowserService: 启动主动后台重连 (${PROACTIVE_RECONNECT_DELAY}ms 后)...`);
    setTimeout(() => {
      if (this.isReady() || this.launching || this.isBrowserCircuitOpen()) {
        return;
      }
      logger.info(`BrowserService: 执行主动后台重连...`);
      this.ensureBrowser().then(() => {
        logger.info(`BrowserService: 主动后台重连成功`);
      }).catch((err) => {
        logger.error(`BrowserService: 主动后台重连失败: ${(err as Error).message}`);
      });
    }, PROACTIVE_RECONNECT_DELAY);
  }

  private async ensureBrowser(): Promise<Browser> {
    if (this.browser?.isConnected()) {
      return this.browser;
    }

    if (this.isBrowserCircuitOpen()) {
      const remaining = Math.round((BROWSER_CIRCUIT_BREAKER_COOLDOWN - (Date.now() - this.browserLastFailureTime)) / 1000);
      throw new Error(`BrowserService: 浏览器暂时不可用，请 ${remaining}s 后重试`);
    }

    if (this.launching) {
      return this.launching;
    }

    this.launching = (async () => {
      const chromiumPath = findChromiumPath();
      const memInfo = getSystemMemoryInfo();
      logger.info(`BrowserService: 正在启动 Chromium 浏览器... (path: ${chromiumPath || "default"}, memory: ${memInfo.freeMB}MB free / ${memInfo.totalMB}MB total, ${memInfo.usedPercent}% used)`);

      if (memInfo.freeMB < 200) {
        logger.warn(`BrowserService: 可用内存不足 (${memInfo.freeMB}MB)，尝试清理后启动...`);
        killTrackedBrowserProcess();
        await new Promise(r => setTimeout(r, 2000));
      }

      const maxAttempts = 3;
      let lastError: Error | null = null;

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
          if (attempt > 1) {
            logger.info(`BrowserService: 重试前清理残留进程... (attempt ${attempt})`);
            killTrackedBrowserProcess();
            await new Promise(r => setTimeout(r, 3000));
          }

          const launchOptions: any = {
            headless: true,
            timeout: BROWSER_LAUNCH_TIMEOUT,
            args: [
              "--no-sandbox",
              "--disable-setuid-sandbox",
              "--disable-dev-shm-usage",
              "--disable-gpu",
              "--no-first-run",
              "--disable-extensions",
              "--disable-background-networking",
              "--disable-sync",
              "--disable-translate",
              "--metrics-recording-only",
              "--mute-audio",
              "--no-default-browser-check",
              "--js-flags=--max-old-space-size=128",
              "--disable-features=TranslateUI,BlinkGenPropertyTrees",
              "--disable-hang-monitor",
              "--disable-popup-blocking",
              "--disable-prompt-on-repost",
              "--disable-renderer-backgrounding",
              "--disable-component-update",
              "--disable-domain-reliability",
              "--disable-client-side-phishing-detection",
              "--disable-breakpad",
              "--disable-software-rasterizer",
              "--enable-low-end-device-mode",
              "--disable-canvas-aa",
              "--disable-2d-canvas-clip-aa",
            ],
          };
          if (chromiumPath) {
            launchOptions.executablePath = chromiumPath;
          }
          this.browser = await chromium.launch(launchOptions);

          try {
            const serverProcess = (this.browser as any)._browserProcess || (this.browser as any)._process;
            if (serverProcess?.pid) {
              trackedBrowserPid = serverProcess.pid;
              logger.info(`BrowserService: 浏览器进程 PID: ${trackedBrowserPid}`);
            }
          } catch {}

          this.browser.on("disconnected", () => {
            const uptime = this.browserStartTime ? Math.round((Date.now() - this.browserStartTime) / 1000) : 0;
            logger.warn(`BrowserService: 浏览器已断开连接 (运行时长: ${uptime}s, 活跃会话: ${this.sessions.size})`);
            this.browser = null;
            this.sessions.clear();
            trackedBrowserPid = null;
            this.proactiveReconnect();
          });

          this.browserStartCount++;
          this.browserStartTime = Date.now();
          const memAfter = getSystemMemoryInfo();
          logger.info(`BrowserService: Chromium 浏览器启动成功 (attempt ${attempt}, 第 ${this.browserStartCount} 次启动, memory after: ${memAfter.freeMB}MB free, ${memAfter.usedPercent}% used)`);

          this.recordBrowserSuccess();
          this.startHealthCheck();

          return this.browser;
        } catch (err) {
          lastError = err as Error;
          const memErr = getSystemMemoryInfo();
          logger.error(`BrowserService: 启动失败 (attempt ${attempt}/${maxAttempts}): ${lastError.message} (memory: ${memErr.freeMB}MB free, ${memErr.usedPercent}% used)`);
          if (attempt < maxAttempts) {
            const backoffMs = 5000 * attempt;
            logger.info(`BrowserService: 等待 ${backoffMs / 1000}s 后重试...`);
            await new Promise(r => setTimeout(r, backoffMs));
          }
        }
      }

      this.recordBrowserFailure();
      throw lastError || new Error("浏览器启动失败");
    })().finally(() => {
      this.launching = null;
    });

    return this.launching;
  }

  private startHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
    }

    this.healthCheckTimer = setInterval(async () => {
      try {
        if (!this.browser?.isConnected()) {
          logger.warn("BrowserService: 健康检查发现浏览器已断开，启动主动重连...");
          this.browser = null;
          this.sessions.clear();
          this.stopHealthCheck();
          this.proactiveReconnect();
          return;
        }

        const memInfo = getSystemMemoryInfo();
        if (memInfo.freeMB < 200 && this.sessions.size > 0) {
          const evictCount = memInfo.freeMB < 100 ? this.sessions.size : 1;
          logger.warn(`BrowserService: 内存不足 (${memInfo.freeMB}MB free)，清理 ${evictCount} 个会话...`);
          await this.evictOldestSessions(evictCount);
        }

        const now = Date.now();
        for (const [token, session] of this.sessions) {
          if (now - session.lastUsed > SESSION_IDLE_TIMEOUT) {
            logger.info(`BrowserService: 健康检查清理过期会话 ${token.substring(0, 8)}...`);
            await this.closeSession(token);
          }
        }
      } catch (err) {
        logger.error(`BrowserService: 健康检查异常: ${(err as Error).message}`);
      }
    }, HEALTH_CHECK_INTERVAL);

    if (this.healthCheckTimer.unref) {
      this.healthCheckTimer.unref();
    }
  }

  private stopHealthCheck(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
  }

  private async evictOldestSessions(count: number): Promise<void> {
    const sorted = [...this.sessions.entries()].sort(
      (a, b) => a[1].lastUsed - b[1].lastUsed
    );
    for (let i = 0; i < Math.min(count, sorted.length); i++) {
      const [token] = sorted[i];
      logger.info(`BrowserService: 驱逐最旧会话 ${token.substring(0, 8)}...`);
      await this.closeSession(token);
    }
  }

  private async getSession(token: string): Promise<BrowserSession> {
    const existing = this.sessions.get(token);
    if (existing) {
      try {
        if (!existing.page.isClosed()) {
          existing.lastUsed = Date.now();
          if (existing.idleTimer) {
            clearTimeout(existing.idleTimer);
          }
          existing.idleTimer = setTimeout(() => this.closeSession(token), SESSION_IDLE_TIMEOUT);
          return existing;
        }
      } catch {}
      logger.info(`BrowserService: 会话 ${token.substring(0, 8)}... 已失效，重新创建`);
      this.sessions.delete(token);
      if (existing.idleTimer) clearTimeout(existing.idleTimer);
    }

    if (this.sessions.size >= MAX_SESSIONS) {
      logger.warn(`BrowserService: 会话数达到上限 (${MAX_SESSIONS})，驱逐最旧会话...`);
      await this.evictOldestSessions(1);
    }

    return this.createSession(token);
  }

  private async createSession(token: string): Promise<BrowserSession> {
    const maxAttempts = 2;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const browser = await this.ensureBrowser();

        const memInfo = getSystemMemoryInfo();
        logger.info(`BrowserService: 为 token ${token.substring(0, 8)}... 创建新会话 (attempt ${attempt}, memory: ${memInfo.freeMB}MB free)`);

        if (memInfo.freeMB < 150 && this.sessions.size > 0) {
          logger.warn(`BrowserService: 可用内存不足 (${memInfo.freeMB}MB)，逐步清理会话...`);
          while (this.sessions.size > 0) {
            await this.evictOldestSessions(1);
            const updated = getSystemMemoryInfo();
            if (updated.freeMB >= 150) break;
          }
          await new Promise(r => setTimeout(r, 1000));
        }

        const context = await browser.newContext({
          userAgent:
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
          viewport: { width: 1280, height: 720 },
          locale: "zh-CN",
        });

        const cookies = getCookiesForBrowser(token);
        await context.addCookies(cookies);

        await context.route("**/*", (route) => {
          const request = route.request();
          const resourceType = request.resourceType();
          const url = request.url();

          if (BLOCKED_RESOURCE_TYPES.includes(resourceType)) {
            return route.abort();
          }

          if (resourceType === "script") {
            const isWhitelisted = SCRIPT_WHITELIST_DOMAINS.some((domain) =>
              url.includes(domain)
            );
            if (!isWhitelisted) {
              return route.abort();
            }
          }

          return route.continue();
        });

        const page = await context.newPage();

        logger.info("BrowserService: 正在导航到 jimeng.jianying.com ...");
        await page.goto("https://jimeng.jianying.com", {
          waitUntil: "domcontentloaded",
          timeout: 45000,
        });

        logger.info("BrowserService: 等待 bdms SDK 就绪...");
        try {
          await page.waitForFunction(
            () => {
              return (
                (window as any).bdms?.init ||
                (window as any).byted_acrawler ||
                window.fetch.toString().indexOf("native code") === -1
              );
            },
            { timeout: BDMS_READY_TIMEOUT }
          );
          logger.info("BrowserService: bdms SDK 已就绪");
        } catch (err) {
          logger.warn(
            "BrowserService: bdms SDK 等待超时，可能未完全加载，继续尝试..."
          );
        }

        const session: BrowserSession = {
          context,
          page,
          lastUsed: Date.now(),
          idleTimer: setTimeout(() => this.closeSession(token), SESSION_IDLE_TIMEOUT),
        };

        this.sessions.set(token, session);
        return session;
      } catch (err) {
        logger.error(`BrowserService: 会话创建失败 (attempt ${attempt}/${maxAttempts}): ${(err as Error).message}`);
        this.browser = null;
        this.sessions.clear();
        if (attempt >= maxAttempts) {
          this.recordBrowserFailure();
          throw err;
        }
        await new Promise(r => setTimeout(r, 3000));
      }
    }

    this.recordBrowserFailure();
    throw new Error("会话创建失败");
  }

  private async closeSession(token: string) {
    const session = this.sessions.get(token);
    if (!session) return;

    logger.info(`BrowserService: 关闭空闲会话 ${token.substring(0, 8)}...`);
    if (session.idleTimer) {
      clearTimeout(session.idleTimer);
    }

    try {
      await session.context.close();
    } catch (err) {
    }

    this.sessions.delete(token);
  }

  async fetch(
    token: string,
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string }
  ): Promise<any> {
    if (this.isApiCircuitOpen()) {
      const remaining = Math.round((API_CIRCUIT_BREAKER_COOLDOWN - (Date.now() - this.apiLastFailureTime)) / 1000);
      const error: any = new Error(`BrowserService: 请求暂时不可用，请 ${remaining}s 后重试`);
      error.statusCode = 503;
      error.retryAfter = remaining;
      throw error;
    }

    const totalStart = Date.now();

    let session: BrowserSession;
    try {
      logger.info(`BrowserService: 获取会话中...`);
      session = await this.getSession(token);
      const sessionElapsed = Date.now() - totalStart;
      logger.info(`BrowserService: 会话就绪 (${sessionElapsed}ms)`);
    } catch (err) {
      const elapsed = Date.now() - totalStart;
      logger.error(`BrowserService: 会话获取失败 (${elapsed}ms): ${(err as Error).message}`);
      const error: any = new Error(`BrowserService: 会话获取失败: ${(err as Error).message}`);
      error.statusCode = 503;
      error.retryAfter = 10;
      throw error;
    }

    const fetchStart = Date.now();
    let timedOut = false;
    let timeoutTimer: NodeJS.Timeout | null = null;
    const cancelToken: CancelToken = { cancelled: false };

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(() => {
        timedOut = true;
        cancelToken.cancelled = true;
        reject(new Error(`BrowserService: 请求超时 (${FETCH_TIMEOUT / 1000}s)`));
      }, FETCH_TIMEOUT);
    });

    try {
      const resultPromise = this._doFetch(token, session, url, options, cancelToken);
      const result = await Promise.race([resultPromise, timeoutPromise]);
      if (timeoutTimer) clearTimeout(timeoutTimer);
      const elapsed = Date.now() - fetchStart;
      const totalElapsed = Date.now() - totalStart;
      logger.info(`BrowserService: 请求完成 (fetch: ${elapsed}ms, total: ${totalElapsed}ms)`);
      this.recordApiSuccess();
      return result;
    } catch (err) {
      if (timeoutTimer) clearTimeout(timeoutTimer);
      const elapsed = Date.now() - fetchStart;
      const totalElapsed = Date.now() - totalStart;
      logger.error(`BrowserService: 请求失败 (fetch: ${elapsed}ms, total: ${totalElapsed}ms): ${(err as Error).message}`);

      if (timedOut) {
        logger.warn(`BrowserService: 超时，关闭会话以中止任何进行中的请求 ${token.substring(0, 8)}...`);
        this.closeSession(token).catch(() => {});
      }

      this.recordApiFailure();

      if (timedOut) {
        const error: any = new Error((err as Error).message);
        error.statusCode = 503;
        error.retryAfter = 10;
        throw error;
      }

      throw err;
    }
  }

  private async _doFetch(
    token: string,
    session: BrowserSession,
    url: string,
    options: { method?: string; headers?: Record<string, string>; body?: string },
    cancelToken: CancelToken
  ): Promise<any> {
    if (cancelToken.cancelled) {
      logger.warn(`BrowserService: 请求已取消，跳过发送到 Jimeng`);
      throw new Error("BrowserService: 请求已被取消");
    }

    logger.info(`BrowserService: 代理请求 ${options.method || "GET"} ${url.substring(0, 100)}...`);

    try {
      const result = await session.page.evaluate(
        async ({ url, options, timeoutMs }) => {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
            const res = await fetch(url, {
              method: options.method || "GET",
              headers: {
                "Content-Type": "application/json",
                ...(options.headers || {}),
              },
              body: options.body,
              credentials: "include",
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            const text = await res.text();
            return { ok: res.ok, status: res.status, text };
          } catch (err: any) {
            return { ok: false, status: 0, text: "", error: err.message };
          }
        },
        { url, options, timeoutMs: FETCH_TIMEOUT - 2000 }
      );

      if (result.error) {
        throw new Error(`浏览器 fetch 失败: ${result.error}`);
      }

      logger.info(`BrowserService: 响应状态 ${result.status}`);

      try {
        return JSON.parse(result.text);
      } catch {
        logger.warn(`BrowserService: 响应不是有效 JSON: ${result.text.substring(0, 200)}`);
        return result.text;
      }
    } catch (err) {
      logger.error(`BrowserService: 请求执行失败: ${(err as Error).message}`);
      await this.closeSession(token);
      throw err;
    }
  }

  warmUp(): void {
    if (this.isReady() || this.launching) {
      return;
    }
    logger.info(`BrowserService: 预热浏览器...`);
    this.ensureBrowser().then(() => {
      logger.info(`BrowserService: 预热完成，浏览器已就绪`);
    }).catch((err) => {
      logger.warn(`BrowserService: 预热失败: ${(err as Error).message}，将在首次请求时重试`);
    });
  }

  async close() {
    logger.info("BrowserService: 正在关闭所有会话和浏览器...");

    this.stopHealthCheck();

    for (const [token] of this.sessions) {
      await this.closeSession(token);
    }

    if (this.browser) {
      try {
        await this.browser.close();
      } catch (err) {
      }
      this.browser = null;
    }

    killTrackedBrowserProcess();

    logger.info("BrowserService: 已关闭");
  }
}

const browserService = new BrowserService();
browserService.warmUp();
export default browserService;
