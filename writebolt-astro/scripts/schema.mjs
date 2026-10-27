/**
 * Create the Writebolt tables over Postgres.
 * PostgREST (the Supabase URL + service role key) cannot run CREATE TABLE.
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';
import { databaseHost, redactSecrets } from './db-url.mjs';

const schemaDir = join(dirname(fileURLToPath(import.meta.url)), '../supabase');

function clientFor(url, serviceKey) {
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

function errorText(error) {
  const parts = [error?.message];
  const cause = error?.cause;
  if (cause?.code) parts.push(cause.code);
  else if (cause?.message) parts.push(cause.message);
  else if (cause?.errors?.[0]?.code) parts.push(cause.errors[0].code);
  return parts.filter(Boolean).join(': ');
}

export async function blogTablesReady(url, serviceKey) {
  const supabase = clientFor(url, serviceKey);
  let error;
  try {
    ({ error } = await supabase.from('site_settings').select('id, layout_mode').limit(1));
  } catch (err) {
    throw new Error(`Could not reach Supabase at ${url}. ${errorText(err)}`);
  }
  if (!error) return { ready: true, legacy: false };
  const message = `${error.code || ''} ${error.message || ''}`;
  if (/42703|PGRST204/.test(message) && /layout_mode/.test(message)) {
    return { ready: true, legacy: true };
  }
  if (/PGRST205|42P01|schema cache|does not exist|Could not find the table/i.test(message)) {
    return { ready: false, legacy: false };
  }
  throw new Error(error.message || 'Could not read site_settings');
}

export async function applySchema(connectionString) {
  const pg = (await import('pg')).default;
  const client = new pg.Client({
    connectionString,
    ssl: /localhost|127\.0\.0\.1/.test(connectionString) ? undefined : { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });
  await client.connect();
  try {
    await client.query(readFileSync(join(schemaDir, '001_initial_schema.sql'), 'utf8'));
    await client.query(readFileSync(join(schemaDir, '002_feature_parity.sql'), 'utf8'));
    await client.query(`notify pgrst, 'reload schema'`);
  } finally {
    await client.end();
  }
}

export async function applyFirstWorking(candidates) {
  if (!candidates.length) {
    const error = new Error('NO_DATABASE_URL');
    error.code = 'NO_DATABASE_URL';
    throw error;
  }
  const failures = [];
  for (const connectionString of candidates) {
    try {
      await applySchema(connectionString);
      return connectionString;
    } catch (error) {
      failures.push(`${databaseHost(connectionString)}: ${error.message || error}`);
    }
  }
  const error = new Error(redactSecrets(failures.join('\n'), candidates));
  error.code = 'CONNECT_FAILED';
  throw error;
}

export async function waitForBlogTables(url, serviceKey) {
  let last = { ready: false, legacy: true };
  for (let attempt = 0; attempt < 10; attempt++) {
    last = await blogTablesReady(url, serviceKey);
    if (last.ready && !last.legacy) return last;
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return last;
}
