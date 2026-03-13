import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LOGS_DIR = path.join(process.cwd(), 'logs');

function ensureLogsDir() {
  if (!fs.existsSync(LOGS_DIR)) {
    fs.mkdirSync(LOGS_DIR, { recursive: true });
  }
}

function getLogFilePath() {
  const date = new Date();
  const dateStr = date.toISOString().slice(0, 10); // YYYY-MM-DD
  return path.join(LOGS_DIR, `api-failures-${dateStr}.log`);
}

/**
 * Writes a log line to the daily file. Safe for deployment:
 * - In Node server (next start): writes to logs/api-failures-YYYY-MM-DD.log
 * - In serverless (e.g. Vercel): filesystem may be read-only; we still return 200
 *   so the client does not retry; write errors are not thrown to the client.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const timestamp = new Date().toISOString();
    const line = `${timestamp} ${JSON.stringify(body)}\n`;

    try {
      ensureLogsDir();
      const filePath = getLogFilePath();
      fs.appendFileSync(filePath, line, 'utf8');
    } catch (writeErr) {
      if (process.env.NODE_ENV !== 'test') {
        console.error('[log-request-failure] Write failed (e.g. read-only fs in serverless):', writeErr?.message);
      }
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    return NextResponse.json(
      { error: err?.message ?? 'Failed to write log' },
      { status: 500 }
    );
  }
}
