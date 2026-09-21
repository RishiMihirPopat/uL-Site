/**
 * Database Client (Neon Serverless Postgres).
 * Provides pooled HTTP connection to Neon with automatic retry on transient
 * network timeouts.
 */

import { neon, NeonQueryFunction } from '@neondatabase/serverless';

let cachedClient: NeonQueryFunction<false, false> | null = null;

export function isNetworkTimeoutError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || '').toLowerCase();
  const code = (err.code || err.cause?.code || '').toLowerCase();
  const sourceMsg = (err.sourceError?.message || '').toLowerCase();
  return (
    code === 'und_err_connect_timeout' ||
    code === 'etimedout' ||
    code === 'econnreset' ||
    code === 'econnrefused' ||
    msg.includes('fetch failed') ||
    msg.includes('connect timeout') ||
    msg.includes('timeout') ||
    sourceMsg.includes('fetch failed') ||
    sourceMsg.includes('connect timeout')
  );
}

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastErr: any;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      if (isNetworkTimeoutError(err) && attempt < maxRetries) {
        console.warn(`[NeonDB] Network timeout on attempt ${attempt + 1}/${maxRetries + 1}. Retrying in ${500 * (attempt + 1)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
        continue;
      }
      break;
    }
  }
  throw lastErr;
}

export function getDatabaseConnection(): NeonQueryFunction<false, false> {
  if (cachedClient) return cachedClient;

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is not defined.');
  }

  const rawNeon = neon(databaseUrl);

  const handler: any = async (strings: TemplateStringsArray | string, ...values: any[]) => {
    if (typeof strings === 'string') {
      return executeWithRetry(() => (rawNeon as any)(strings, ...values));
    }
    return executeWithRetry(() => rawNeon(strings, ...values));
  };

  handler.query = async (queryText: string, values: any[] = []) => {
    return executeWithRetry(() => rawNeon.query(queryText, values));
  };

  cachedClient = handler as NeonQueryFunction<false, false>;
  return cachedClient;
}

export const getSql = getDatabaseConnection;
